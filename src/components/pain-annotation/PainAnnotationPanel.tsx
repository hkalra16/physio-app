'use client';

import { useState, useEffect, useRef } from 'react';
import { usePainStore } from '@/store/painStore';
import { PainType, PainMarkerImage } from '@/lib/types';
import { getMusclesForRegion } from '@/data/muscle-map';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { X, Target, Waves, Circle, ArrowRight, Camera, ImagePlus } from 'lucide-react';

const painTypeOptions: { value: PainType; label: string; description: string; icon: React.ReactNode }[] = [
  { value: 'point', label: 'Point', description: 'One specific spot', icon: <Target className="h-5 w-5" /> },
  { value: 'radiating', label: 'Radiating', description: 'Spreads outward', icon: <Waves className="h-5 w-5" /> },
  { value: 'diffuse', label: 'Diffuse', description: 'Spread across area', icon: <Circle className="h-5 w-5" /> },
  { value: 'referred', label: 'Referred', description: 'Felt elsewhere', icon: <ArrowRight className="h-5 w-5" /> }
];

const intensityLabels: Record<number, string> = {
  1: 'Barely noticeable',
  2: 'Mild',
  3: 'Uncomfortable',
  4: 'Moderate',
  5: 'Distracting',
  6: 'Hard to ignore',
  7: 'Difficult to focus',
  8: 'Intense',
  9: 'Severe',
  10: 'Worst possible'
};

export default function PainAnnotationPanel() {
  const {
    isAnnotating,
    pendingMarkerPosition,
    cancelAnnotation,
    addPainMarker,
    getPainDefaults,
    editingMarkerId,
    getEditingMarker,
    saveEditedMarker
  } = usePainStore();

  const [painType, setPainType] = useState<PainType>('point');
  const [intensity, setIntensity] = useState<number>(5);
  const [images, setImages] = useState<PainMarkerImage[]>([]);
  const [notes, setNotes] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load saved values when panel opens
  useEffect(() => {
    if (isAnnotating) {
      const editingMarker = getEditingMarker();

      if (editingMarker) {
        // Editing existing marker
        setPainType(editingMarker.painType);
        setIntensity(editingMarker.intensity);
        setImages(editingMarker.images || []);
        setNotes(editingMarker.notes || '');
      } else {
        // New marker - load defaults
        const defaults = getPainDefaults();
        setPainType(defaults.painType);
        setIntensity(defaults.intensity);
        setImages([]);
        setNotes('');
      }
    }
  }, [isAnnotating, getPainDefaults, getEditingMarker]);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach(file => {
      if (!file.type.startsWith('image/')) {
        alert('Please select only image files');
        return;
      }

      if (file.size > 10 * 1024 * 1024) {
        alert(`Image "${file.name}" must be less than 10MB`);
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        const base64 = result.split(',')[1];
        setImages(prev => [...prev, {
          base64,
          mimeType: file.type,
          previewUrl: result
        }]);
      };
      reader.readAsDataURL(file);
    });

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemoveImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const regionMuscles = pendingMarkerPosition
    ? getMusclesForRegion(pendingMarkerPosition.region)
    : null;

  const handleSubmit = () => {
    if (!pendingMarkerPosition) return;

    if (editingMarkerId) {
      saveEditedMarker(painType, intensity, images.length > 0 ? images : undefined, notes);
    } else {
      addPainMarker(painType, intensity, images.length > 0 ? images : undefined, notes);
    }
  };

  const handleClose = () => {
    cancelAnnotation();
  };

  return (
    <Sheet open={isAnnotating} onOpenChange={(open) => !open && handleClose()}>
      <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            {editingMarkerId ? 'Edit Pain Point' : 'Mark Pain'}
            <Button variant="ghost" size="icon" className="ml-auto" onClick={handleClose}>
              <X className="h-4 w-4" />
            </Button>
          </SheetTitle>
          <SheetDescription>
            {pendingMarkerPosition && (
              <span className="font-medium capitalize">
                {pendingMarkerPosition.region.replace(/-/g, ' ')}
              </span>
            )}
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6 py-6">
          {/* Affected Muscles Preview */}
          {regionMuscles && (
            <Card className="p-3 bg-blue-50 border-blue-200">
              <p className="text-sm font-medium text-blue-800 mb-2">Muscles in this area:</p>
              <div className="flex flex-wrap gap-1">
                {regionMuscles.primary.slice(0, 3).map((muscle) => (
                  <Badge key={muscle} variant="secondary" className="bg-blue-100 text-blue-700 text-xs">
                    {muscle}
                  </Badge>
                ))}
              </div>
            </Card>
          )}

          {/* Pain Type */}
          <div>
            <h3 className="font-medium mb-3">Type of Pain</h3>
            <div className="grid grid-cols-2 gap-2">
              {painTypeOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setPainType(option.value)}
                  className={`p-3 rounded-lg border-2 text-left transition-all ${
                    painType === option.value
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    {option.icon}
                    <span className="font-medium text-sm">{option.label}</span>
                  </div>
                  <p className="text-xs text-gray-500">{option.description}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Intensity Slider */}
          <div>
            <h3 className="font-medium mb-2">
              How much does it hurt? <span className="text-blue-600">{intensity}/10</span>
            </h3>
            <p className="text-sm text-gray-500 mb-3">{intensityLabels[intensity]}</p>
            <Slider
              value={[intensity]}
              onValueChange={(value) => setIntensity(value[0])}
              min={1}
              max={10}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>Mild</span>
              <span>Severe</span>
            </div>
          </div>

          {/* Photo Upload */}
          <Card className="p-4 border-dashed border-2 border-gray-300 bg-gray-50">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Camera className="h-5 w-5 text-gray-500" />
                <h3 className="font-medium text-gray-700">Add Photo (Optional)</h3>
              </div>
              <p className="text-xs text-gray-500">
                A photo can help with more accurate analysis
              </p>

              {/* Image Previews */}
              {images.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {images.map((img, index) => (
                    <div key={index} className="relative">
                      <img
                        src={img.previewUrl}
                        alt={`Pain location ${index + 1}`}
                        className="h-16 w-16 object-cover rounded-lg border"
                      />
                      <button
                        onClick={() => handleRemoveImage(index)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageSelect}
                accept="image/*"
                capture="environment"
                className="hidden"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                className="w-full"
              >
                <ImagePlus className="h-4 w-4 mr-2" />
                {images.length > 0 ? 'Add More' : 'Take Photo'}
              </Button>
            </div>
          </Card>

          {/* Notes */}
          <div>
            <h3 className="font-medium mb-2">Anything else? (Optional)</h3>
            <Textarea
              placeholder="e.g., 'worse in the morning', 'started after exercise'..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="min-h-[80px] resize-none"
            />
          </div>
        </div>

        <SheetFooter className="flex gap-2">
          <Button variant="outline" onClick={handleClose} className="flex-1">
            Cancel
          </Button>
          <Button onClick={handleSubmit} className="flex-1">
            {editingMarkerId ? 'Save Changes' : 'Add Pain Point'}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
