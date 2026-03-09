import { useState, useRef, useCallback, useEffect } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { djangoApi } from '@/lib/api/client';
import { useDjangoAuth } from '@/contexts/DjangoAuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Camera, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  Shield, 
  Scan, 
  Upload, 
  ImageIcon,
  Star,
  Lightbulb
} from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface DashboardContext {
  user: any;
  profile: any;
  session: any;
}

type EnrollmentStep = 'IDLE' | 'CAPTURING' | 'PROCESSING' | 'VERIFIED' | 'FAILED';
type EnrollmentMethod = 'upload' | 'camera';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_IMAGE_DIMENSION = 800;
const JPEG_QUALITY = 0.8;

/**
 * Convert a data URL or canvas to a Blob for FormData upload.
 */
const dataUrlToBlob = (dataUrl: string): Blob => {
  const [header, base64] = dataUrl.split(',');
  const mime = header.match(/:(.*?);/)?.[1] || 'image/jpeg';
  const byteString = atob(base64);
  const ab = new ArrayBuffer(byteString.length);
  const ia = new Uint8Array(ab);
  for (let i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i);
  }
  return new Blob([ab], { type: mime });
};

/**
 * Compress an image to reduce file size for upload.
 */
const compressImage = (imageSrc: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let { width, height } = img;
      if (width > height) {
        if (width > MAX_IMAGE_DIMENSION) {
          height = Math.round((height * MAX_IMAGE_DIMENSION) / width);
          width = MAX_IMAGE_DIMENSION;
        }
      } else {
        if (height > MAX_IMAGE_DIMENSION) {
          width = Math.round((width * MAX_IMAGE_DIMENSION) / height);
          height = MAX_IMAGE_DIMENSION;
        }
      }
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) { reject(new Error('Could not get canvas context')); return; }
      ctx.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL('image/jpeg', JPEG_QUALITY));
    };
    img.onerror = () => reject(new Error('Failed to load image for compression'));
    img.src = imageSrc;
  });
};

const FaceEnrollment = () => {
  const context = useOutletContext<DashboardContext>();
  const { user } = context;
  const navigate = useNavigate();

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [method, setMethod] = useState<EnrollmentMethod>('upload');
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [enrollmentStep, setEnrollmentStep] = useState<EnrollmentStep>('IDLE');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const progressMap: Record<EnrollmentStep, number> = {
    IDLE: 0, CAPTURING: 33, PROCESSING: 66, VERIFIED: 100, FAILED: 0,
  };

  const stepLabels: Record<EnrollmentStep, string> = {
    IDLE: 'Ready to capture',
    CAPTURING: method === 'upload' ? 'Reading image...' : 'Capturing...',
    PROCESSING: 'Enrolling face...',
    VERIFIED: 'Face Verified!',
    FAILED: 'Enrollment failed',
  };

  const { refreshUser, overrideEnrollmentStatus } = useDjangoAuth();

  // ─── File handling ───

  const handleFileSelect = useCallback((file: File) => {
    setErrorMessage(null);
    if (!ACCEPTED_TYPES.includes(file.type)) {
      setErrorMessage('Please upload a JPG, PNG, or WebP image.'); return;
    }
    if (file.size > MAX_FILE_SIZE) {
      setErrorMessage('Image must be less than 5MB.'); return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      setUploadedImage(e.target?.result as string);
      setUploadedFileName(file.name);
    };
    reader.onerror = () => setErrorMessage('Failed to read image file.');
    reader.readAsDataURL(file);
  }, []);

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileSelect(file);
  };

  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(false); };
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFileSelect(file);
  };

  // ─── Camera ───

  const startCamera = useCallback(async () => {
    try {
      setCameraError(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } }
      });
      streamRef.current = stream;
      if (videoRef.current) { videoRef.current.srcObject = stream; await videoRef.current.play(); }
      setCameraActive(true);
    } catch {
      setCameraError('Unable to access camera. Please ensure camera permissions are granted.');
      setCameraActive(false);
    }
  }, []);

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    setCameraActive(false);
  }, []);

  // ─── Core enrollment: send image as FormData to POST /api/face/enroll/ ───

  const processEnrollment = useCallback(async (imageBlob: Blob) => {
    setEnrollmentStep('PROCESSING');
    try {
      const result = await djangoApi.enrollFace(imageBlob);

      // Handle "already enrolled" as a success case — face IS enrolled on the backend
      const alreadyEnrolledMsg = result.error?.toLowerCase() || '';
      if (
        alreadyEnrolledMsg.includes('already enrolled') ||
        alreadyEnrolledMsg.includes('already registered') ||
        result.data?.status === 'ALREADY_ENROLLED'
      ) {
        console.log('[FaceEnrollment] Face already enrolled — forcing local override and redirecting');
        overrideEnrollmentStatus();
        setEnrollmentStep('VERIFIED');
        setTimeout(() => navigate('/dashboard'), 1500);
        return;
      }

      if (result.error) {
        throw new Error(result.error);
      }

      const data = result.data;

      if (data?.status === 'DUPLICATE_FACE' || data?.status === 'duplicate') {
        throw new Error(data.message || 'This face appears to be already enrolled for another user.');
      }

      if (data?.status === 'success' || data?.status === 'SUCCESS') {
        overrideEnrollmentStatus();
        setEnrollmentStep('VERIFIED');
        setTimeout(() => navigate('/dashboard'), 1500);
      } else {
        throw new Error(data?.message || 'Face enrollment failed. Please try again.');
      }
    } catch (err: any) {
      console.error('[FaceEnrollment] Error:', err);
      setEnrollmentStep('FAILED');
      setErrorMessage(err.message || 'Failed to enroll face. Please try again.');
    }
  }, [navigate, refreshUser]);

  // ─── Enroll with uploaded image ───

  const enrollWithUpload = useCallback(async () => {
    if (!uploadedImage || !user?.id) return;
    setEnrollmentStep('CAPTURING');
    setErrorMessage(null);
    try {
      const compressed = await compressImage(uploadedImage);
      const blob = dataUrlToBlob(compressed);
      console.log('[FaceEnrollment] Upload size:', Math.round(blob.size / 1024), 'KB');
      await processEnrollment(blob);
    } catch {
      setEnrollmentStep('FAILED');
      setErrorMessage('Failed to process image. Please try a different photo.');
    }
  }, [uploadedImage, user?.id, processEnrollment]);

  // ─── Capture from camera ───

  const captureAndEnroll = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current || !user?.id) return;
    setEnrollmentStep('CAPTURING');
    setErrorMessage(null);

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) { setEnrollmentStep('FAILED'); setErrorMessage('Canvas context unavailable'); return; }

    try {
      const targetWidth = Math.min(video.videoWidth, MAX_IMAGE_DIMENSION);
      const targetHeight = Math.round((video.videoHeight / video.videoWidth) * targetWidth);
      canvas.width = targetWidth;
      canvas.height = targetHeight;
      ctx.drawImage(video, 0, 0, targetWidth, targetHeight);

      // Get blob directly from canvas
      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(
          (b) => b ? resolve(b) : reject(new Error('Failed to create image blob')),
          'image/jpeg',
          JPEG_QUALITY
        );
      });

      console.log('[FaceEnrollment] Capture size:', Math.round(blob.size / 1024), 'KB');
      stopCamera();
      await processEnrollment(blob);
    } catch {
      setEnrollmentStep('FAILED');
      setErrorMessage('Failed to capture image. Please try again.');
      stopCamera();
    }
  }, [user?.id, stopCamera, processEnrollment]);

  // ─── UI handlers ───

  const handleRetry = () => {
    setEnrollmentStep('IDLE');
    setErrorMessage(null);
    if (method === 'camera') startCamera();
  };

  const handleMethodChange = (value: string) => {
    setMethod(value as EnrollmentMethod);
    setErrorMessage(null);
    setEnrollmentStep('IDLE');
    if (value === 'camera') startCamera(); else stopCamera();
  };

  useEffect(() => { return () => { stopCamera(); }; }, [stopCamera]);

  // Block back navigation
  useEffect(() => {
    const handlePopState = (e: PopStateEvent) => {
      e.preventDefault();
      window.history.pushState(null, '', window.location.pathname);
    };
    window.history.pushState(null, '', window.location.pathname);
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // ─── Verified state ───
  if (enrollmentStep === 'VERIFIED') {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="max-w-md w-full border-primary/20">
          <CardContent className="pt-6 text-center space-y-4">
            <div className="w-20 h-20 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
              <CheckCircle2 className="h-12 w-12 text-primary" />
            </div>
            <h2 className="text-2xl font-bold text-foreground">Face Verified!</h2>
            <p className="text-muted-foreground">
              Your face has been successfully enrolled. Redirecting to dashboard...
            </p>
            <Progress value={100} className="h-2" />
          </CardContent>
        </Card>
      </div>
    );
  }

  // ─── Main UI ───
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Card className="border-primary/20">
        <CardHeader className="text-center pb-4">
          <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <Shield className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl">Face Enrollment Required</CardTitle>
          <CardDescription className="text-base">
            To ensure secure attendance tracking, you must complete face enrollment before accessing the dashboard.
          </CardDescription>
        </CardHeader>
      </Card>

      <Alert className="border-primary/30 bg-primary/5">
        <Lightbulb className="h-4 w-4 text-primary" />
        <AlertDescription className="text-sm">
          <strong>Recommended:</strong> Upload a clear photo of your face for best results. 
          This ensures consistent quality regardless of your current lighting or camera conditions.
        </AlertDescription>
      </Alert>

      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-medium text-primary">{stepLabels[enrollmentStep]}</span>
            </div>
            <Progress value={progressMap[enrollmentStep]} className="h-3" />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span className={enrollmentStep === 'CAPTURING' ? 'text-primary font-medium' : ''}>
                {method === 'upload' ? 'Reading' : 'Capturing'}
              </span>
              <span className={enrollmentStep === 'PROCESSING' ? 'text-primary font-medium' : ''}>
                Enrolling
              </span>
              <span>Verified</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6 space-y-6">
          <Tabs value={method} onValueChange={handleMethodChange} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="upload" className="gap-2">
                <Upload className="h-4 w-4" />
                Upload Photo
                <span className="ml-1 text-xs bg-primary/20 text-primary px-1.5 py-0.5 rounded-full">
                  Recommended
                </span>
              </TabsTrigger>
              <TabsTrigger value="camera" className="gap-2">
                <Camera className="h-4 w-4" />
                Use Camera
              </TabsTrigger>
            </TabsList>

            <TabsContent value="upload" className="space-y-4 mt-4">
              <div
                className={`relative border-2 border-dashed rounded-lg transition-colors ${
                  isDragging ? 'border-primary bg-primary/5' : uploadedImage ? 'border-primary/50' : 'border-border hover:border-primary/50'
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                {uploadedImage ? (
                  <div className="relative aspect-video">
                    <img src={uploadedImage} alt="Uploaded face" className="w-full h-full object-contain rounded-lg" />
                    <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between">
                      <span className="text-xs bg-background/80 backdrop-blur px-2 py-1 rounded">{uploadedFileName}</span>
                      <Button size="sm" variant="secondary" onClick={() => { setUploadedImage(null); setUploadedFileName(null); }}>
                        Change
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                    <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                      <ImageIcon className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <p className="text-lg font-medium mb-1">Drop your photo here</p>
                    <p className="text-sm text-muted-foreground mb-4">or click to browse</p>
                    <p className="text-xs text-muted-foreground">JPG, PNG or WebP • Max 5MB</p>
                  </div>
                )}
                <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={handleFileInputChange} className="hidden" />
              </div>

              <div className="bg-muted/50 rounded-lg p-4">
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <Star className="h-4 w-4 text-primary" />
                  Tips for best results:
                </h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Use a clear, well-lit photo of your face</li>
                  <li>• Face should be centered and clearly visible</li>
                  <li>• Avoid blurry or low-resolution images</li>
                  <li>• Remove glasses, hats, or face coverings</li>
                  <li>• Use a neutral expression looking at the camera</li>
                </ul>
              </div>
            </TabsContent>

            <TabsContent value="camera" className="space-y-4 mt-4">
              <div className="relative aspect-video bg-muted rounded-lg overflow-hidden border-2 border-dashed border-border">
                <video ref={videoRef} className="w-full h-full object-cover" autoPlay playsInline muted />
                {cameraActive && enrollmentStep === 'IDLE' && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-48 h-60 border-4 border-primary/50 rounded-full" />
                  </div>
                )}
                {enrollmentStep === 'CAPTURING' && method === 'camera' && (
                  <div className="absolute inset-0 bg-background/80 flex flex-col items-center justify-center">
                    <Scan className="h-16 w-16 text-primary animate-pulse" />
                    <p className="mt-4 text-lg font-medium">Capturing face...</p>
                  </div>
                )}
                {cameraError && (
                  <div className="absolute inset-0 flex items-center justify-center bg-muted">
                    <div className="text-center p-4">
                      <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-2" />
                      <p className="text-destructive font-medium">{cameraError}</p>
                      <Button onClick={startCamera} className="mt-4">Retry Camera</Button>
                    </div>
                  </div>
                )}
                {!cameraActive && !cameraError && enrollmentStep === 'IDLE' && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                )}
              </div>
              <canvas ref={canvasRef} className="hidden" />
              <div className="bg-muted/50 rounded-lg p-4">
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <Camera className="h-4 w-4" />
                  Tips for camera capture:
                </h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Ensure your face is well-lit and clearly visible</li>
                  <li>• Position your face within the oval guide</li>
                  <li>• Look directly at the camera</li>
                  <li>• Remove glasses, hats, or face coverings</li>
                  <li>• Keep a neutral expression</li>
                </ul>
              </div>
            </TabsContent>
          </Tabs>

          {enrollmentStep === 'PROCESSING' && (
            <div className="flex flex-col items-center justify-center py-8">
              <Loader2 className="h-16 w-16 text-primary animate-spin" />
              <p className="mt-4 text-lg font-medium">Enrolling face...</p>
              <p className="text-sm text-muted-foreground">Please wait while the server processes your face</p>
            </div>
          )}

          {errorMessage && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{errorMessage}</AlertDescription>
            </Alert>
          )}

          <div className="flex justify-center gap-4">
            {enrollmentStep === 'FAILED' ? (
              <Button size="lg" onClick={handleRetry} className="min-w-48">
                <Camera className="h-5 w-5 mr-2" />
                Try Again
              </Button>
            ) : method === 'upload' ? (
              <Button size="lg" onClick={enrollWithUpload} disabled={!uploadedImage || enrollmentStep !== 'IDLE'} className="min-w-48">
                {enrollmentStep === 'IDLE' ? (
                  <><Upload className="h-5 w-5 mr-2" />Enroll with Photo</>
                ) : (
                  <><Loader2 className="h-5 w-5 mr-2 animate-spin" />{stepLabels[enrollmentStep]}</>
                )}
              </Button>
            ) : (
              <Button size="lg" onClick={captureAndEnroll} disabled={!cameraActive || enrollmentStep !== 'IDLE'} className="min-w-48">
                {enrollmentStep === 'IDLE' ? (
                  <><Camera className="h-5 w-5 mr-2" />Capture & Enroll</>
                ) : (
                  <><Loader2 className="h-5 w-5 mr-2 animate-spin" />{stepLabels[enrollmentStep]}</>
                )}
              </Button>
            )}
          </div>

          <p className="text-xs text-center text-muted-foreground">
            Your face data is securely processed and stored for attendance verification only.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default FaceEnrollment;
