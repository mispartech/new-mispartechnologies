import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { 
  Camera, 
  CameraOff, 
  RefreshCw,
  Volume2,
  VolumeX,
  Wifi,
  WifiOff,
  AlertTriangle,
  Loader2,
  ScanFace,
  Clock,
  Filter,
  Eye,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useFaceRecognition, TrackedFace } from '@/hooks/useFaceRecognition';
import FaceOverlay, { FaceOverlayData } from '@/components/dashboard/FaceOverlay';

interface RecognizedPerson {
  id: string;
  type: 'member' | 'visitor';
  name?: string;
  confidence?: number | null;
  timestamp: Date;
  attendanceStatus?: string;
  faceImageUrl?: string;
  gender?: string;
  ageRange?: string;
  faceRoiUrl?: string | null;
}

// ── Throttle / timing config ──
const CAPTURE_INTERVAL_MS = 500;       // 500ms between frames (2 FPS)
const PAUSE_DURATION_MS = 3000;        // Pause 3s after confirmed attendance
const WARMUP_TIMEOUT_MS = 45000;       // 45s timeout for first (model-loading) request

type EngineState = 'idle' | 'initializing' | 'ready' | 'error';

/** Filtered recent recognitions list with View mode */
const RecentRecognitionsList = ({ persons, filter }: { persons: RecognizedPerson[]; filter: '1min' | '1hour' | '24hours' }) => {
  const [selectedPerson, setSelectedPerson] = useState<RecognizedPerson | null>(null);

  const filtered = useMemo(() => {
    const now = Date.now();
    const cutoffs = { '1min': 60_000, '1hour': 3_600_000, '24hours': 86_400_000 };
    const cutoff = cutoffs[filter];
    return persons.filter(p => now - p.timestamp.getTime() < cutoff);
  }, [persons, filter]);

  if (filtered.length === 0) {
    return (
      <p className="text-sm text-muted-foreground text-center py-4">
        No recognitions in this time range
      </p>
    );
  }

  return (
    <>
      <div className="space-y-2 max-h-[400px] overflow-y-auto">
        {filtered.map((person, index) => (
          <div
            key={`${person.id}-${index}`}
            className="flex items-center gap-3 p-2 rounded-lg bg-muted/50 transition-colors hover:bg-muted/80"
          >
            {/* Face thumbnail or colored dot */}
            {person.faceRoiUrl ? (
              <img
                src={person.faceRoiUrl}
                alt=""
                className={`w-8 h-8 rounded-full object-cover flex-shrink-0 ring-2 ${
                  person.type === 'member' ? 'ring-primary' : 'ring-amber-500'
                }`}
              />
            ) : (
              <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                person.type === 'member' ? 'bg-primary' : 'bg-amber-500'
              }`} />
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">
                {person.name || 'Unknown'}
              </p>
              <div className="flex items-center gap-2 flex-wrap">
                <p className="text-xs text-muted-foreground font-mono">
                  {person.timestamp.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </p>
                {person.gender && person.gender !== 'unknown' && (
                  <span className="text-[10px] text-muted-foreground">{person.gender}{person.ageRange ? ` · ${person.ageRange}` : ''}</span>
                )}
                {person.attendanceStatus === 'already_marked' && (
                  <Badge variant="outline" className="text-[10px] h-4 px-1">Seen again</Badge>
                )}
              </div>
            </div>
            <div className="flex items-center gap-1 flex-shrink-0">
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() => setSelectedPerson(person)}
              >
                <Eye className="w-3.5 h-3.5 text-muted-foreground" />
              </Button>
              <Badge variant={person.type === 'member' ? 'default' : 'secondary'} className="text-xs">
                {person.type === 'member' ? 'Member' : 'Visitor'}
              </Badge>
            </div>
          </div>
        ))}
      </div>

      {/* View detail modal */}
      <Dialog open={!!selectedPerson} onOpenChange={() => setSelectedPerson(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ScanFace className="w-5 h-5 text-primary" />
              Recognition Detail
            </DialogTitle>
          </DialogHeader>
          {selectedPerson && (
            <div className="space-y-4">
              {/* Face snapshot */}
              {selectedPerson.faceRoiUrl ? (
                <div className="flex justify-center">
                  <img
                    src={selectedPerson.faceRoiUrl}
                    alt="Captured face"
                    className="max-w-full max-h-[240px] rounded-lg object-contain border border-border shadow-sm"
                  />
                </div>
              ) : (
                <div className="flex justify-center">
                  <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center">
                    <ScanFace className="w-10 h-10 text-muted-foreground" />
                  </div>
                </div>
              )}

              {/* Info grid */}
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-muted-foreground text-xs">Name</p>
                  <p className="font-medium">{selectedPerson.name || 'Unknown'}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Type</p>
                  <Badge variant={selectedPerson.type === 'member' ? 'default' : 'secondary'}>
                    {selectedPerson.type === 'member' ? 'Member' : 'Visitor'}
                  </Badge>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Timestamp</p>
                  <p className="font-mono text-xs">
                    {selectedPerson.timestamp.toLocaleString('en-GB', {
                      year: 'numeric', month: 'short', day: 'numeric',
                      hour: '2-digit', minute: '2-digit', second: '2-digit',
                    })}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Confidence</p>
                  <p className="font-medium">
                    {selectedPerson.confidence != null
                      ? `${Math.round(selectedPerson.confidence * 100)}%`
                      : 'N/A'}
                  </p>
                </div>
                {selectedPerson.gender && selectedPerson.gender !== 'unknown' && (
                  <div>
                    <p className="text-muted-foreground text-xs">Gender</p>
                    <p className="font-medium capitalize">{selectedPerson.gender}</p>
                  </div>
                )}
                {selectedPerson.ageRange && (
                  <div>
                    <p className="text-muted-foreground text-xs">Age Range</p>
                    <p className="font-medium">{selectedPerson.ageRange}</p>
                  </div>
                )}
                <div className="col-span-2">
                  <p className="text-muted-foreground text-xs">Status</p>
                  <Badge variant="outline" className="capitalize mt-0.5">
                    {selectedPerson.attendanceStatus?.replace('_', ' ') || 'Recorded'}
                  </Badge>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

const AttendanceCapture = () => {
  const { profile } = useOutletContext<{ profile: any }>();
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [isCameraStarting, setIsCameraStarting] = useState(false);
  const [recognizedPersons, setRecognizedPersons] = useState<RecognizedPerson[]>([]);
  const [soundEnabled, setSoundEnabled] = useState(() => {
    const saved = localStorage.getItem('attendance_sound_enabled');
    return saved !== null ? saved === 'true' : true;
  });
  const [soundVolume] = useState(() => {
    const saved = localStorage.getItem('attendance_sound_volume');
    return saved !== null ? parseFloat(saved) : 0.7;
  });
  const [recentFilter, setRecentFilter] = useState<'1min' | '1hour' | '24hours'>('24hours');
  const [error, setError] = useState<string | null>(null);
  const [apiStatus, setApiStatus] = useState<'checking' | 'connected' | 'disconnected'>('checking');
  const [engineState, setEngineState] = useState<EngineState>('idle');
  const [stats, setStats] = useState({ total: 0, members: 0, visitors: 0 });
  const [videoDimensions, setVideoDimensions] = useState({ width: 0, height: 0 });
  const [containerDimensions, setContainerDimensions] = useState({ width: 0, height: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pausedUntilRef = useRef<number>(0);
  const isFirstCallRef = useRef(true);
  const processingRef = useRef(false);
  
  const { toast } = useToast();
  const { 
    recognizeFace, 
    checkHealth, 
    isProcessing, 
    trackedFaces, 
    clearFaces,
    pruneStalefaces 
  } = useFaceRecognition();

  // Convert TrackedFace to FaceOverlayData — includes type info for proper coloring
  const facesForOverlay: FaceOverlayData[] = trackedFaces.map(face => ({
    bbox: face.bbox,
    name: face.name,
    type: face.type,
    attendanceStatus: face.attendanceStatus,
    confidence: face.confidence,
    requiresClaim: face.requiresClaim,
    gender: face.gender,
    ageRange: face.ageRange,
  }));

  // ── Health check on mount ──
  useEffect(() => {
    const checkApiHealth = async () => {
      setApiStatus('checking');
      const health = await checkHealth();
      if (health?.success && health.django_api === 'connected') {
        setApiStatus('connected');
      } else {
        setApiStatus('disconnected');
        toast({
          title: 'API Connection Issue',
          description: health?.error || 'Unable to connect to face recognition service',
          variant: 'destructive',
        });
      }
    };
    checkApiHealth();
  }, [checkHealth, toast]);

  // ── Container resize tracking ──
  useEffect(() => {
    const update = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setContainerDimensions({ width: rect.width, height: rect.height });
      }
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  // ── Prune stale faces ──
  useEffect(() => {
    if (!isCameraOn) return;
    const interval = setInterval(pruneStalefaces, 1000);
    return () => clearInterval(interval);
  }, [isCameraOn, pruneStalefaces]);

  // ── Stop capture interval ──
  const stopCaptureLoop = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  // ── Core: capture a frame and send to API ──
  const captureAndRecognize = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current) return;
    if (processingRef.current) return;
    if (Date.now() < pausedUntilRef.current) return;
    if (videoRef.current.readyState < 2) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx || video.videoWidth === 0 || video.videoHeight === 0) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0);

    setVideoDimensions({ width: video.videoWidth, height: video.videoHeight });

    const frameDataUrl = canvas.toDataURL('image/jpeg', 0.8);

    const isFirst = isFirstCallRef.current;
    if (isFirst) {
      setEngineState('initializing');
      isFirstCallRef.current = false;
    }

    processingRef.current = true;

    try {
      const result = await recognizeFace(
        frameDataUrl,
        profile?.organization_id,
        {
          silent: true,
          timeout: isFirst ? WARMUP_TIMEOUT_MS : 15000,
        },
      );

      // Handle 500 → stop loop
      if (!result.success && result.httpStatus && result.httpStatus >= 500) {
        setEngineState('error');
        setError('Face recognition temporarily unavailable.\nPlease refresh the page.');
        stopCaptureLoop();
        return;
      }

      if (engineState === 'initializing' || (isFirst && result.success)) {
        setEngineState('ready');
      }

      if (result.success && result.faces.length > 0) {
        if (result.shouldPause) {
          pausedUntilRef.current = Date.now() + PAUSE_DURATION_MS;
        }

        for (const face of result.faces) {
          // Skip UNSTABLE faces — they're just detecting
          if (face.type === 'unstable') continue;

          const person: RecognizedPerson = {
            id: face.id,
            type: face.type === 'member' ? 'member' : 'visitor',
            name: face.name,
            confidence: face.confidence,
            timestamp: new Date(),
            attendanceStatus: face.attendanceStatus,
            gender: face.gender,
            ageRange: face.ageRange,
            faceRoiUrl: face.attendanceRecord?.face_roi_url || null,
          };

          // Poll for face_roi after 3s if just marked and no face_roi yet
          if ((face.attendanceStatus === 'marked' || face.attendanceStatus === 'new_visitor') && !face.attendanceRecord?.face_roi_url) {
            setTimeout(async () => {
              try {
                const today = new Date().toISOString().split('T')[0];
                const result = await djangoApi.getAttendance({ start_date: today, end_date: today });
                if (!result.error && result.data) {
                  const match = result.data.find((r: any) => r.user_id === face.id || r.id === face.attendanceRecord?.id);
                  if (match?.face_roi) {
                    setRecognizedPersons(prev => prev.map(p =>
                      p.id === face.id ? { ...p, faceRoiUrl: match.face_roi } : p
                    ));
                  }
                }
              } catch { /* polling is best-effort */ }
            }, 3000);
          }

          // Deduplicate within 30s window
          const exists = recognizedPersons.find(
            p => p.id === person.id && (Date.now() - p.timestamp.getTime()) < 30000,
          );

          if (!exists) {
            setRecognizedPersons(prev => [person, ...prev.slice(0, 49)]);

            // Update stats
            if (face.type === 'member') {
              setStats(prev => ({
                total: prev.total + 1,
                members: prev.members + 1,
                visitors: prev.visitors,
              }));
            } else {
              setStats(prev => ({
                total: prev.total + 1,
                members: prev.members,
                visitors: prev.visitors + 1,
              }));
            }

            // Play sound for new attendance
            if (soundEnabled && (face.attendanceStatus === 'marked' || face.attendanceStatus === 'new_visitor')) {
              try {
                const audio = new Audio('/success.wav');
                audio.volume = soundVolume;
                audio.play().catch(() => {});
              } catch {
                // Sound file not available
              }
            }

            // Toast notification
            const isNewAttendance = face.attendanceStatus === 'marked';
            const isAlreadyMarked = face.attendanceStatus === 'already_marked';
            const isVisitor = face.type === 'visitor';

            if (isVisitor) {
              toast({
                title: 'Visitor Detected',
                description: face.requiresClaim
                  ? 'New visitor — can be claimed as a member'
                  : face.attendanceStatus === 'returning_visitor'
                    ? 'Returning visitor recorded'
                    : 'New visitor recorded',
              });
            } else {
              toast({
                title: isNewAttendance ? 'Attendance Marked' : 'Member Recognized',
                description: `${person.name || 'Unknown'} — ${
                  isNewAttendance ? 'Attendance recorded' :
                  isAlreadyMarked ? 'Already recorded today' :
                  'Recognized'
                }`,
                variant: isNewAttendance ? 'default' : undefined,
              });
            }
          }
        }
      }
    } catch (err) {
      if (import.meta.env.DEV) {
        console.error('[AttendanceCapture] Recognition error:', err);
      }
    } finally {
      processingRef.current = false;
    }
  }, [recognizeFace, profile?.organization_id, recognizedPersons, soundEnabled, soundVolume, toast, engineState, stopCaptureLoop]);

  // ── Start capture loop ──
  const startCaptureLoop = useCallback(() => {
    stopCaptureLoop();
    intervalRef.current = setInterval(captureAndRecognize, CAPTURE_INTERVAL_MS);
  }, [captureAndRecognize, stopCaptureLoop]);

  const startCamera = async () => {
    try {
      setError(null);
      setIsCameraStarting(true);
      isFirstCallRef.current = true;
      setEngineState('idle');

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } },
      });

      if (videoRef.current) {
        streamRef.current = stream;
        videoRef.current.srcObject = stream;

        await new Promise<void>((resolve, reject) => {
          if (!videoRef.current) return reject(new Error('Video element not found'));
          videoRef.current.onloadedmetadata = () => resolve();
          videoRef.current.onerror = () => reject(new Error('Video failed to load'));
          setTimeout(() => reject(new Error('Video load timeout')), 10000);
        });

        await videoRef.current.play();
        setIsCameraOn(true);
        setIsCameraStarting(false);
        pausedUntilRef.current = 0;

        toast({ title: 'Camera Started', description: 'Face recognition is now active' });
      }
    } catch (err) {
      setIsCameraStarting(false);
      const msg = err instanceof Error ? err.message : 'Unknown error';
      setError(`Unable to access camera: ${msg}. Please check permissions.`);
      toast({ title: 'Camera Error', description: 'Unable to access camera. Please check permissions.', variant: 'destructive' });

      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
        streamRef.current = null;
      }
    }
  };

  const stopCamera = useCallback(() => {
    stopCaptureLoop();
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) videoRef.current.srcObject = null;
    clearFaces();
    setIsCameraOn(false);
    setIsCameraStarting(false);
    setEngineState('idle');
    isFirstCallRef.current = true;
    processingRef.current = false;
  }, [stopCaptureLoop, clearFaces]);

  useEffect(() => {
    if (isCameraOn) startCaptureLoop();
    else stopCaptureLoop();
    return () => stopCaptureLoop();
  }, [isCameraOn, startCaptureLoop, stopCaptureLoop]);

  useEffect(() => () => stopCamera(), [stopCamera]);

  const resetSession = () => {
    setRecognizedPersons([]);
    setStats({ total: 0, members: 0, visitors: 0 });
    clearFaces();
    pausedUntilRef.current = 0;
  };

  const getStatusIcon = () => {
    switch (apiStatus) {
      case 'connected': return <Wifi className="w-4 h-4" />;
      case 'disconnected': return <WifiOff className="w-4 h-4" />;
      default: return <RefreshCw className="w-4 h-4 animate-spin" />;
    }
  };

  // Show "Scanning for faces…" only when NO faces at all (faces_count === 0)
  // When only UNSTABLE faces exist, the overlay boxes handle it
  const hasAnyFaces = trackedFaces.length > 0;

  const renderCameraOverlay = () => {
    if (engineState === 'error') {
      return (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-destructive/10 z-10">
          <AlertTriangle className="w-12 h-12 text-destructive mb-3" />
          <p className="text-destructive font-semibold text-center px-4">
            Face recognition temporarily unavailable.
          </p>
          <p className="text-destructive/80 text-sm text-center mt-1">
            Please refresh the page.
          </p>
          <Button variant="outline" size="sm" className="mt-4" onClick={() => window.location.reload()}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      );
    }

    if (engineState === 'initializing') {
      return (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/60 backdrop-blur-sm z-10">
          <Loader2 className="w-12 h-12 text-primary animate-spin mb-3" />
          <p className="text-foreground font-semibold text-lg">Initializing Face Recognition</p>
          <p className="text-muted-foreground text-sm text-center mt-1 max-w-xs">
            Setting up face recognition system. This may take a few seconds on first use.
          </p>
        </div>
      );
    }

    // Only show "Scanning..." when faces_count === 0 (no faces at all, not even UNSTABLE)
    if (engineState === 'ready' && !hasAnyFaces && isCameraOn) {
      return (
        <div className="absolute top-3 left-3 z-10">
          <Badge variant="secondary" className="gap-1.5 bg-background/70 backdrop-blur-sm">
            <ScanFace className="w-3.5 h-3.5 animate-pulse" />
            Scanning for faces…
          </Badge>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">Mark Attendance</h1>
          <p className="text-sm sm:text-base text-muted-foreground">Use face recognition to mark attendance</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Badge 
            variant={apiStatus === 'connected' ? 'default' : 'destructive'} 
            className="gap-1"
          >
            {getStatusIcon()}
            <span className="hidden sm:inline">
              {apiStatus === 'connected' ? 'API Connected' : apiStatus === 'checking' ? 'Checking...' : 'API Offline'}
            </span>
            <span className="sm:hidden">
              {apiStatus === 'connected' ? 'Online' : 'Offline'}
            </span>
          </Badge>
          <Button
            variant="outline"
            size="icon"
            onClick={() => {
              const next = !soundEnabled;
              setSoundEnabled(next);
              localStorage.setItem('attendance_sound_enabled', String(next));
            }}
            className="h-8 w-8 sm:h-9 sm:w-9"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </Button>
          <Button
            onClick={isCameraOn ? stopCamera : startCamera}
            variant={isCameraOn ? 'destructive' : 'default'}
            className="gap-2 flex-1 sm:flex-none"
            size="sm"
            disabled={apiStatus !== 'connected' || isCameraStarting || engineState === 'error'}
          >
            {isCameraStarting ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span className="hidden sm:inline">Starting...</span>
              </>
            ) : isCameraOn ? (
              <>
                <CameraOff className="w-4 h-4" />
                <span className="hidden sm:inline">Stop Camera</span>
                <span className="sm:hidden">Stop</span>
              </>
            ) : (
              <>
                <Camera className="w-4 h-4" />
                <span className="hidden sm:inline">Start Camera</span>
                <span className="sm:hidden">Start</span>
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-2 sm:gap-4">
        <Card>
          <CardContent className="p-3 sm:pt-4">
            <div className="text-xl sm:text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">Total Today</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 sm:pt-4">
            <div className="text-xl sm:text-2xl font-bold text-primary">{stats.members}</div>
            <p className="text-xs text-muted-foreground">Members</p>
          </CardContent>
        </Card>
        <Card className="bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800">
          <CardContent className="p-3 sm:pt-4">
            <div className="text-xl sm:text-2xl font-bold text-amber-700 dark:text-amber-400">{stats.visitors}</div>
            <p className="text-xs text-amber-600/80 dark:text-amber-500/80">Visitors</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Camera Feed */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Camera Feed</span>
              <div className="flex items-center gap-2">
                {isCameraOn && engineState === 'ready' && (
                  <Badge variant="outline" className="gap-1 text-primary border-primary">
                    <span className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                    Live
                  </Badge>
                )}
                {engineState === 'initializing' && (
                  <Badge variant="secondary" className="animate-pulse">
                    <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                    Loading model…
                  </Badge>
                )}
                {isProcessing && engineState === 'ready' && (
                  <Badge variant="secondary" className="animate-pulse">
                    <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
                    Processing…
                  </Badge>
                )}
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div ref={containerRef} className="relative aspect-video bg-muted rounded-lg overflow-hidden">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className={`w-full h-full object-cover ${isCameraOn ? 'block' : 'hidden'}`}
              />
              <canvas ref={canvasRef} className="hidden" />

              {/* Face detection overlay — renders for ALL face types including UNSTABLE */}
              {isCameraOn && engineState === 'ready' && facesForOverlay.length > 0 && (
                <FaceOverlay
                  faces={facesForOverlay}
                  videoWidth={videoDimensions.width}
                  videoHeight={videoDimensions.height}
                  containerWidth={containerDimensions.width}
                  containerHeight={containerDimensions.height}
                />
              )}

              {isCameraOn && renderCameraOverlay()}

              {!isCameraOn && (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground">
                  {isCameraStarting ? (
                    <>
                      <RefreshCw className="w-16 h-16 mb-4 animate-spin opacity-50" />
                      <p>Starting camera...</p>
                      <p className="text-sm">Please wait</p>
                    </>
                  ) : (
                    <>
                      <Camera className="w-16 h-16 mb-4 opacity-50" />
                      <p>Camera is off</p>
                      <p className="text-sm">Click "Start Camera" to begin</p>
                    </>
                  )}
                </div>
              )}

              {error && engineState !== 'error' && (
                <div className="absolute inset-0 flex items-center justify-center bg-destructive/10">
                  <p className="text-destructive text-center px-4">{error}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Recognitions */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-muted-foreground" />
                Recent
              </span>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="sm" onClick={resetSession}>
                  <RefreshCw className="w-4 h-4" />
                </Button>
              </div>
            </CardTitle>
            <div className="pt-1">
              <Select value={recentFilter} onValueChange={(v) => setRecentFilter(v as any)}>
                <SelectTrigger className="h-8 text-xs w-full">
                  <Filter className="w-3 h-3 mr-1.5 text-muted-foreground" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1min">Last Minute</SelectItem>
                  <SelectItem value="1hour">Last Hour</SelectItem>
                  <SelectItem value="24hours">Last 24 Hours</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            <RecentRecognitionsList persons={recognizedPersons} filter={recentFilter} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AttendanceCapture;
