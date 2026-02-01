'use client';

import { useState, useRef } from 'react';
import { AIGeneratedTest, MovementTestResult, PainMarkerImage } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger
} from '@/components/ui/collapsible';
import {
  ChevronDown,
  ChevronUp,
  Play,
  CheckCircle,
  AlertCircle,
  Clock,
  Target,
  Eye,
  ThumbsUp,
  ThumbsDown,
  Camera,
  ImagePlus,
  X
} from 'lucide-react';

interface AITestCardProps {
  test: AIGeneratedTest;
  testNumber: number;
  totalTests: number;
  onComplete: (result: MovementTestResult) => void;
  isCompleted: boolean;
  result?: MovementTestResult;
}

export default function AITestCard({
  test,
  testNumber,
  totalTests,
  onComplete,
  isCompleted,
  result
}: AITestCardProps) {
  const [isOpen, setIsOpen] = useState(!isCompleted);
  const [isPerforming, setIsPerforming] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);

  // Simplified feedback form state
  const [isPositive, setIsPositive] = useState<boolean | null>(null);
  const [notes, setNotes] = useState('');
  const [images, setImages] = useState<PainMarkerImage[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleStartTest = () => {
    setIsPerforming(true);
  };

  const handleFinishTest = () => {
    setIsPerforming(false);
    setShowFeedback(true);
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach(file => {
      if (!file.type.startsWith('image/')) return;
      if (file.size > 10 * 1024 * 1024) return;

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

  const handleSubmitResult = () => {
    const testResult: MovementTestResult = {
      testId: test.id,
      testName: test.name,
      isPositive: isPositive ?? false,
      notes: notes.trim() || undefined,
      images: images.length > 0 ? images : undefined,
      completedAt: new Date()
    };

    onComplete(testResult);
    setShowFeedback(false);
    setIsOpen(false);
  };

  return (
    <Card className={isCompleted ? 'border-green-300 bg-green-50/50' : ''}>
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CardHeader className="pb-2">
          <CollapsibleTrigger className="w-full">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {isCompleted ? (
                  <div className="h-8 w-8 rounded-full bg-green-500 flex items-center justify-center">
                    <CheckCircle className="h-5 w-5 text-white" />
                  </div>
                ) : (
                  <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold text-sm">
                    {testNumber}
                  </div>
                )}
                <div className="text-left">
                  <CardTitle className="text-base">{test.name}</CardTitle>
                  <p className="text-sm text-gray-500 mt-0.5">{test.purpose}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="hidden sm:flex">
                  <Clock className="h-3 w-3 mr-1" />
                  {test.duration}s
                </Badge>
                {isOpen ? (
                  <ChevronUp className="h-5 w-5 text-gray-400" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-gray-400" />
                )}
              </div>
            </div>
          </CollapsibleTrigger>
        </CardHeader>

        <CollapsibleContent>
          <CardContent className="pt-2 space-y-4">
            {/* Completed result summary */}
            {isCompleted && result && (
              <div className="p-3 rounded-lg bg-white border">
                <div className="flex items-center gap-2 mb-2">
                  {result.isPositive ? (
                    <Badge className="bg-yellow-500">Had Pain/Issues</Badge>
                  ) : (
                    <Badge className="bg-green-500">No Pain</Badge>
                  )}
                </div>
                {result.notes && (
                  <p className="text-sm text-gray-600">{result.notes}</p>
                )}
              </div>
            )}

            {/* Test not started yet */}
            {!isCompleted && !isPerforming && !showFeedback && (
              <>
                {/* Target muscles */}
                <div className="flex flex-wrap gap-1">
                  <Target className="h-4 w-4 text-gray-400 mr-1" />
                  {test.targetMuscles.map((muscle, i) => (
                    <Badge key={i} variant="secondary" className="text-xs">
                      {muscle}
                    </Badge>
                  ))}
                </div>

                {/* Instructions */}
                <div>
                  <h4 className="font-medium text-sm mb-2">Instructions:</h4>
                  <ol className="space-y-2 text-sm text-gray-600">
                    {test.instructions.map((instruction, i) => (
                      <li key={i} className="flex gap-2">
                        <span className="font-medium text-blue-500">{i + 1}.</span>
                        {instruction}
                      </li>
                    ))}
                  </ol>
                </div>

                {/* What to watch for */}
                <div className="p-3 rounded-lg bg-blue-50 border border-blue-100">
                  <div className="flex items-start gap-2">
                    <Eye className="h-4 w-4 text-blue-500 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-sm text-blue-800">What to Pay Attention To:</h4>
                      <p className="text-sm text-blue-700 mt-1">{test.whatToWatch}</p>
                    </div>
                  </div>
                </div>

                <Button onClick={handleStartTest} className="w-full" size="lg">
                  <Play className="h-4 w-4 mr-2" />
                  Start Test
                </Button>
              </>
            )}

            {/* Performing test */}
            {isPerforming && (
              <div className="space-y-4">
                <div className="p-4 rounded-lg bg-yellow-50 border border-yellow-200 text-center">
                  <p className="text-yellow-800 font-medium">
                    Perform the test now. Pay attention to any pain or unusual sensations.
                  </p>
                  <p className="text-sm text-yellow-600 mt-2">
                    Duration: ~{test.duration} seconds
                    {test.repetitions && ` • ${test.repetitions} repetitions`}
                  </p>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Signs that suggest a problem:</h4>
                  <ul className="space-y-1">
                    {test.positiveIndicators.map((indicator, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-red-600">
                        <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                        {indicator}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Normal responses:</h4>
                  <ul className="space-y-1">
                    {test.negativeIndicators.map((indicator, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-green-600">
                        <CheckCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                        {indicator}
                      </li>
                    ))}
                  </ul>
                </div>

                <Button onClick={handleFinishTest} className="w-full" size="lg">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  I've Done the Test
                </Button>
              </div>
            )}

            {/* Simplified feedback form */}
            {showFeedback && (
              <div className="space-y-4">
                <h4 className="font-medium">Did this cause any pain?</h4>

                {/* Yes/No buttons */}
                <div className="flex gap-2">
                  <Button
                    variant={isPositive === true ? 'default' : 'outline'}
                    onClick={() => setIsPositive(true)}
                    className={`flex-1 ${isPositive === true ? 'bg-yellow-500 hover:bg-yellow-600' : ''}`}
                  >
                    <ThumbsDown className="h-4 w-4 mr-2" />
                    Yes, it hurt
                  </Button>
                  <Button
                    variant={isPositive === false ? 'default' : 'outline'}
                    onClick={() => setIsPositive(false)}
                    className={`flex-1 ${isPositive === false ? 'bg-green-500 hover:bg-green-600' : ''}`}
                  >
                    <ThumbsUp className="h-4 w-4 mr-2" />
                    No pain
                  </Button>
                </div>

                {/* Notes */}
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    What did you notice? (Optional)
                  </label>
                  <Textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Describe what you felt, any pain, clicking sounds, weakness..."
                    className="min-h-[80px]"
                  />
                </div>

                {/* Photo upload */}
                <Card className="p-3 border-dashed border-2 border-gray-300 bg-gray-50">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Camera className="h-4 w-4 text-gray-500" />
                      <span className="text-sm font-medium text-gray-700">Add Photo (Optional)</span>
                    </div>

                    {images.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {images.map((img, index) => (
                          <div key={index} className="relative">
                            <img
                              src={img.previewUrl}
                              alt={`Test result ${index + 1}`}
                              className="h-12 w-12 object-cover rounded border"
                            />
                            <button
                              onClick={() => handleRemoveImage(index)}
                              className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5"
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

                <Button
                  onClick={handleSubmitResult}
                  className="w-full"
                  size="lg"
                  disabled={isPositive === null}
                >
                  Save & Continue
                </Button>
              </div>
            )}
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}
