import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Settings } from "lucide-react";
import { useState, useEffect } from "react";
import { GifSettings } from "@/types/video";
interface GifSettingsPanelProps {
  settings: GifSettings;
  onSettingsChange: (settings: GifSettings) => void;
  onApplySettings: () => void;
  isVisible: boolean;
}

export default function GifSettingsPanel({ 
  settings, 
  onSettingsChange, 
  onApplySettings,
  isVisible
}: GifSettingsPanelProps) {
  const [fps, setFps] = useState(settings.fps);
  const [compression, setCompression] = useState(settings.compression);
  const [width, setWidth] = useState(settings.width);

  useEffect(() => {
    // Update local state if props change
    setFps(settings.fps);
    setCompression(settings.compression);
    setWidth(settings.width);
  }, [settings]);

  const handleFpsChange = (value: number[]) => {
    setFps(value[0]);
    onSettingsChange({
      ...settings,
      fps: value[0],
    });
  };

  const handleCompressionChange = (value: number[]) => {
    setCompression(value[0]);
    onSettingsChange({
      ...settings,
      compression: value[0],
    });
  };

  const handleWidthChange = (value: number[]) => {
    setWidth(value[0]);
    onSettingsChange({
      ...settings,
      width: value[0],
    });
  };

  if (!isVisible) return null;

  return (
    <div id="gif-settings-section" className="p-4 border border-gray-200 rounded-md mt-4 bg-gray-50">
      <h3 className="text-lg font-medium text-gray-800 mb-3">GIF Settings</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* FPS Setting */}
        <div>
          <div className="flex justify-between items-center mb-1">
            <label htmlFor="fps-slider" className="text-sm font-medium text-gray-700">FPS</label>
            <span className="text-sm text-gray-500" id="fps-value">{fps}</span>
          </div>
          <Slider
            id="fps-slider"
            min={5}
            max={30}
            step={1}
            value={[fps]}
            onValueChange={handleFpsChange}
          />
          <p className="mt-1 text-xs text-gray-500">
            Higher FPS produces smoother animation. 15 is recommended.
          </p>
        </div>
        
        {/* Compression Setting */}
        <div>
          <div className="flex justify-between items-center mb-1">
            <label htmlFor="compression-slider" className="text-sm font-medium text-gray-700">Compression</label>
            <span className="text-sm text-gray-500" id="compression-value">{compression}</span>
          </div>
          <Slider
            id="compression-slider"
            min={1}
            max={20}
            step={1}
            value={[compression]}
            onValueChange={handleCompressionChange}
          />
          <p className="mt-1 text-xs text-gray-500">
            Lower values = higher quality, larger file size.
          </p>
        </div>

        {/* Width Setting */}
        <div className="md:col-span-2">
          <div className="flex justify-between items-center mb-1">
            <label htmlFor="width-slider" className="text-sm font-medium text-gray-700">Width</label>
            <span className="text-sm text-gray-500" id="width-value">{width}px</span>
          </div>
          <Slider
            id="width-slider"
            min={200}
            max={800}
            step={50}
            value={[width]}
            onValueChange={handleWidthChange}
          />
          <p className="mt-1 text-xs text-gray-500">
            Set output GIF width in pixels. Height will scale proportionally.
          </p>
        </div>
      </div>
      
      <div className="mt-4">
        <Button
          id="apply-settings"
          onClick={onApplySettings}
          className="bg-indigo-600 hover:bg-indigo-700 text-white"
        >
          <Settings className="mr-2 h-4 w-4" />
          Apply Settings
        </Button>
      </div>
    </div>
  );
}