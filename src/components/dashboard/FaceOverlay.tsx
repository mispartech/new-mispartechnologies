import { useState, useEffect } from 'react';
import { AttendanceStatus } from '@/hooks/useFaceRecognition';

interface BoundingBox {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

export interface FaceOverlayData {
  bbox: number[]; // [x1, y1, x2, y2] from cvzone.cornerRect
  name?: string;
  type?: 'member' | 'visitor' | 'unstable';
  attendanceStatus: AttendanceStatus;
  confidence?: number | null;
  requiresClaim?: boolean;
}

interface FaceOverlayProps {
  faces: FaceOverlayData[];
  videoWidth: number;
  videoHeight: number;
  containerWidth: number;
  containerHeight: number;
  onClaimVisitor?: (faceId: string) => void;
}

// Color cycling for UNSTABLE/detecting
const DETECTION_COLORS = [
  'hsl(var(--primary))',
  'hsl(280, 70%, 60%)',
  'hsl(200, 80%, 55%)',
  'hsl(35, 90%, 55%)',
  'hsl(320, 70%, 55%)',
  'hsl(170, 70%, 45%)',
  'hsl(45, 90%, 55%)',
];

const STATUS_COLORS: Record<string, string> = {
  marked: 'hsl(142, 76%, 45%)',          // Green — attendance just marked
  already_marked: 'hsl(200, 80%, 55%)',   // Blue — already recorded today
  new_visitor: 'hsl(35, 90%, 55%)',       // Orange — new visitor
  returning_visitor: 'hsl(280, 70%, 60%)',// Purple — returning visitor
};

const parseBoundingBox = (bbox: number[]): BoundingBox | null => {
  if (!bbox || !Array.isArray(bbox) || bbox.length < 4) return null;
  const values = bbox.slice(0, 4);
  if (!values.every(v => typeof v === 'number' && !isNaN(v) && isFinite(v))) return null;
  const [x1, y1, x2, y2] = values;
  if (x2 <= x1 || y2 <= y1) return null;
  if ((x2 - x1) < 10 || (y2 - y1) < 10) return null;
  return { x1, y1, x2, y2 };
};

const generateFaceKey = (bbox: number[]): string => {
  if (!bbox || bbox.length < 4) return `face-invalid-${Math.random()}`;
  const [x1, y1, x2, y2] = bbox;
  const rx = Math.round(x1 / 5) * 5;
  const ry = Math.round(y1 / 5) * 5;
  const rw = Math.round((x2 - x1) / 5) * 5;
  const rh = Math.round((y2 - y1) / 5) * 5;
  return `face-${rx}-${ry}-${rw}-${rh}`;
};

const FaceOverlay = ({ faces, videoWidth, videoHeight, containerWidth, containerHeight }: FaceOverlayProps) => {
  const [colorIndex, setColorIndex] = useState(0);

  // Animate color change for UNSTABLE/detecting faces
  useEffect(() => {
    const hasDetecting = faces.some(f => f.attendanceStatus === 'detecting');
    if (hasDetecting) {
      const interval = setInterval(() => {
        setColorIndex(prev => (prev + 1) % DETECTION_COLORS.length);
      }, 150);
      return () => clearInterval(interval);
    }
  }, [faces]);

  const scaleX = containerWidth > 0 && videoWidth > 0 ? containerWidth / videoWidth : 1;
  const scaleY = containerHeight > 0 && videoHeight > 0 ? containerHeight / videoHeight : 1;

  if (videoWidth === 0 || videoHeight === 0 || !faces || faces.length === 0) return null;

  const validFaces = faces
    .filter(face => face && typeof face === 'object' && face.bbox)
    .map((face) => {
      const box = parseBoundingBox(face.bbox);
      if (!box) return null;
      const w = box.x2 - box.x1;
      const h = box.y2 - box.y1;
      const scaledX = box.x1 * scaleX;
      const scaledY = box.y1 * scaleY;
      const scaledW = w * scaleX;
      const scaledH = h * scaleY;
      const cornerLength = Math.min(30, scaledW * 0.25, scaledH * 0.25);
      return { ...face, key: generateFaceKey(face.bbox), x: scaledX, y: scaledY, width: scaledW, height: scaledH, cornerLength };
    })
    .filter((face): face is NonNullable<typeof face> => face !== null);

  if (validFaces.length === 0) return null;

  const cornerThickness = 4;

  return (
    <div className="absolute inset-0 pointer-events-none">
      {validFaces.map((face) => {
        const status = face.attendanceStatus;
        const isDetecting = status === 'detecting';

        // Determine color
        let currentColor: string;
        let showGlow = false;
        if (isDetecting) {
          currentColor = DETECTION_COLORS[colorIndex];
        } else {
          currentColor = STATUS_COLORS[status] || STATUS_COLORS.marked;
          showGlow = true;
        }

        const glowStyle = showGlow ? `0 0 12px ${currentColor}, 0 0 24px ${currentColor}50` : 'none';
        const transition = showGlow ? 'background-color 0.2s, box-shadow 0.2s' : 'none';

        // Build label
        let labelText = '';
        let showLabel = false;
        if (status === 'marked' || status === 'already_marked') {
          labelText = face.name || 'Member';
          showLabel = true;
        } else if (status === 'new_visitor' || status === 'returning_visitor') {
          labelText = 'Visitor';
          showLabel = true;
        }

        // Corner style factory
        const cornerStyle = (left: number, top: number, w: number, h: number) => ({
          left, top, width: w, height: h,
          backgroundColor: currentColor,
          boxShadow: glowStyle,
          transition,
        });

        return (
          <div key={face.key}>
            {/* 8 corner pieces — cvzone.cornerRect style */}
            <div className="absolute" style={cornerStyle(face.x, face.y, face.cornerLength, cornerThickness)} />
            <div className="absolute" style={cornerStyle(face.x, face.y, cornerThickness, face.cornerLength)} />
            <div className="absolute" style={cornerStyle(face.x + face.width - face.cornerLength, face.y, face.cornerLength, cornerThickness)} />
            <div className="absolute" style={cornerStyle(face.x + face.width - cornerThickness, face.y, cornerThickness, face.cornerLength)} />
            <div className="absolute" style={cornerStyle(face.x, face.y + face.height - cornerThickness, face.cornerLength, cornerThickness)} />
            <div className="absolute" style={cornerStyle(face.x, face.y + face.height - face.cornerLength, cornerThickness, face.cornerLength)} />
            <div className="absolute" style={cornerStyle(face.x + face.width - face.cornerLength, face.y + face.height - cornerThickness, face.cornerLength, cornerThickness)} />
            <div className="absolute" style={cornerStyle(face.x + face.width - cornerThickness, face.y + face.height - face.cornerLength, cornerThickness, face.cornerLength)} />

            {/* Label for recognized faces */}
            {showLabel && (
              <div
                className="absolute text-white text-xs px-2 py-1 rounded-b-md font-medium whitespace-nowrap"
                style={{
                  left: face.x,
                  top: face.y + face.height + 4,
                  maxWidth: face.width,
                  backgroundColor: currentColor,
                  boxShadow: `0 2px 8px ${currentColor}50`,
                }}
              >
                <span className="truncate block">
                  {labelText}
                  {face.confidence != null && ` · ${Math.round(face.confidence * 100)}%`}
                </span>
                {status === 'already_marked' && (
                  <span className="text-white/70 text-[10px]">Already recorded</span>
                )}
              </div>
            )}

            {/* Detecting spinner for UNSTABLE */}
            {isDetecting && (
              <div
                className="absolute text-white text-xs px-2 py-1 rounded-md font-medium animate-pulse whitespace-nowrap"
                style={{
                  left: face.x + face.width / 2,
                  top: face.y + face.height + 4,
                  transform: 'translateX(-50%)',
                  backgroundColor: currentColor,
                }}
              >
                Detecting...
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default FaceOverlay;
