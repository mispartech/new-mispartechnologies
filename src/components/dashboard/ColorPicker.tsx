import { useState, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

interface ColorPickerProps {
  label: string;
  description?: string;
  value: string;
  onChange: (color: string) => void;
}

const PRESET_COLORS = [
  '#0f2a4a', '#1a73e8', '#00bcd4', '#00acc1', '#4caf50', '#ff9800',
  '#f44336', '#9c27b0', '#673ab7', '#3f51b5', '#009688', '#795548',
  '#607d8b', '#e91e63', '#ff5722', '#cddc39', '#212121', '#ffffff',
  '#1e3a5f', '#2c5282', '#2d3748', '#1a202c', '#f7fafc', '#edf2f7',
];

const ColorPicker = ({ label, description, value, onChange }: ColorPickerProps) => {
  const [inputValue, setInputValue] = useState(value);
  const nativeRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  const handleHexInput = (hex: string) => {
    setInputValue(hex);
    if (/^#[0-9a-fA-F]{6}$/.test(hex)) {
      onChange(hex);
    }
  };

  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium">{label}</Label>
      {description && <p className="text-xs text-muted-foreground">{description}</p>}
      
      <Popover>
        <PopoverTrigger asChild>
          <button
            className={cn(
              "flex items-center gap-3 w-full rounded-md border border-input bg-background px-3 py-2",
              "hover:bg-muted/50 transition-colors cursor-pointer text-left"
            )}
          >
            <div
              className="w-8 h-8 rounded-md border border-border shadow-sm flex-shrink-0"
              style={{ backgroundColor: value }}
            />
            <span className="text-sm font-mono text-foreground">{value}</span>
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-64 p-3" align="start">
          <div className="space-y-3">
            {/* Native color picker */}
            <div
              className="w-full h-32 rounded-md border border-border cursor-pointer overflow-hidden relative"
              onClick={() => nativeRef.current?.click()}
            >
              <div className="w-full h-full" style={{ backgroundColor: value }} />
              <input
                ref={nativeRef}
                type="color"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
              />
            </div>

            {/* Hex input */}
            <Input
              value={inputValue}
              onChange={(e) => handleHexInput(e.target.value)}
              placeholder="#000000"
              className="font-mono text-sm"
            />

            {/* Preset swatches */}
            <div>
              <p className="text-xs text-muted-foreground mb-2">Presets</p>
              <div className="grid grid-cols-6 gap-1.5">
                {PRESET_COLORS.map((color) => (
                  <button
                    key={color}
                    onClick={() => onChange(color)}
                    className={cn(
                      "w-8 h-8 rounded-md border transition-all",
                      value === color ? "ring-2 ring-ring ring-offset-1" : "border-border hover:scale-110"
                    )}
                    style={{ backgroundColor: color }}
                    title={color}
                  />
                ))}
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default ColorPicker;
