import React from 'react';
import { Clock } from 'lucide-react';

interface ComingSoonOverlayProps {
  message?: string;
}

const ComingSoonOverlay: React.FC<ComingSoonOverlayProps> = ({ message = 'Content coming soon' }) => {
  return (
    <div className="absolute inset-0 z-10 flex items-center justify-center bg-navy-dark/40 backdrop-blur-[2px] rounded-xl">
      <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-navy-dark/90 border border-cyan/30 shadow-lg">
        <Clock className="w-4 h-4 text-cyan animate-pulse" />
        <span className="text-sm font-semibold text-white">{message}</span>
      </div>
    </div>
  );
};

export default ComingSoonOverlay;
