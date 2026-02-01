'use client';

import { useState, useRef, useEffect } from 'react';
import { usePainStore } from '@/store/painStore';
import { analyzeWithGemini, askFollowUpQuestion, formatAnalysisForDisplay } from '@/lib/gemini';
import { GeminiPhysioResponse, PainMarker, MovementTestResult } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Brain,
  Loader2,
  AlertTriangle,
  CheckCircle,
  ArrowRight,
  Sparkles,
  Copy,
  Check,
  Send,
  MessageCircle,
  Image,
  X
} from 'lucide-react';

interface AnalysisPanelProps {
  apiKey: string;
}

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  imageUrls?: string[];  // For displaying uploaded images in chat
}

export default function AnalysisPanel({ apiKey }: AnalysisPanelProps) {
  const { currentSession, setGeminiAnalysis } = usePainStore();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const analysis = currentSession?.geminiAnalysis;
  const painMarkers = currentSession?.painMarkers || [];
  const movementTests = currentSession?.movementTests || [];
  const initialStory = currentSession?.initialStory;

  const canAnalyze = painMarkers.length > 0;

  const handleAnalyze = async () => {
    if (!canAnalyze) return;

    setIsAnalyzing(true);
    setError(null);

    try {
      const result = await analyzeWithGemini(
        painMarkers,
        movementTests,
        undefined,
        apiKey,
        initialStory
      );
      setGeminiAnalysis(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Analysis failed');
    } finally {
      setIsAnalyzing(false);
    }
  };

  if (!canAnalyze) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-gray-500">
          <Brain className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>Mark at least one pain point to enable AI analysis.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Analysis Button */}
      {!analysis && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-purple-500" />
              AI Analysis
            </CardTitle>
            <CardDescription>
              Get an AI-powered preliminary assessment based on your pain markers
              {movementTests.length > 0 && ` and ${movementTests.length} completed tests`}.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={handleAnalyze}
              disabled={isAnalyzing}
              className="w-full"
              size="lg"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Brain className="h-4 w-4 mr-2" />
                  Analyze with AI
                </>
              )}
            </Button>
            {error && (
              <p className="text-red-500 text-sm mt-2">{error}</p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Analysis Results */}
      {analysis && (
        <AnalysisResults
          analysis={analysis}
          onReanalyze={handleAnalyze}
          isReanalyzing={isAnalyzing}
          apiKey={apiKey}
          painMarkers={painMarkers}
          movementTests={movementTests}
        />
      )}
    </div>
  );
}

function AnalysisResults({
  analysis,
  onReanalyze,
  isReanalyzing,
  apiKey,
  painMarkers,
  movementTests
}: {
  analysis: GeminiPhysioResponse;
  onReanalyze: () => void;
  isReanalyzing: boolean;
  apiKey: string;
  painMarkers: PainMarker[];
  movementTests: MovementTestResult[];
}) {
  const [copied, setCopied] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [followUpQuestion, setFollowUpQuestion] = useState('');
  const [isAskingFollowUp, setIsAskingFollowUp] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [pendingImages, setPendingImages] = useState<{
    base64: string;
    mimeType: string;
    previewUrl: string;
  }[]>([]);

  // Scroll to bottom when new messages added
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages]);

  const handleCopy = async () => {
    const textContent = formatAnalysisForDisplay(analysis);
    await navigator.clipboard.writeText(textContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    // Process each file
    Array.from(files).forEach(file => {
      // Check if it's an image
      if (!file.type.startsWith('image/')) {
        alert('Please select only image files');
        return;
      }

      // Check file size (max 10MB per image)
      if (file.size > 10 * 1024 * 1024) {
        alert(`Image "${file.name}" must be less than 10MB`);
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        // Extract base64 data (remove the data:image/xxx;base64, prefix)
        const base64 = result.split(',')[1];
        setPendingImages(prev => [...prev, {
          base64,
          mimeType: file.type,
          previewUrl: result
        }]);
      };
      reader.readAsDataURL(file);
    });

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemoveImage = (index: number) => {
    setPendingImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleAskFollowUp = async () => {
    if ((!followUpQuestion.trim() && pendingImages.length === 0) || isAskingFollowUp) return;

    const question = followUpQuestion.trim() || `Please analyze ${pendingImages.length > 1 ? 'these images' : 'this image'} of my pain location.`;
    const imageUrls = pendingImages.map(img => img.previewUrl);
    const images = pendingImages.map(img => ({ base64: img.base64, mimeType: img.mimeType }));

    setFollowUpQuestion('');
    setPendingImages([]);
    setChatMessages(prev => [...prev, { role: 'user', content: question, imageUrls }]);
    setIsAskingFollowUp(true);

    try {
      const response = await askFollowUpQuestion(
        question,
        analysis,
        painMarkers,
        movementTests,
        apiKey,
        images.length > 0 ? images : undefined
      );
      setChatMessages(prev => [...prev, { role: 'assistant', content: response }]);
    } catch (err) {
      setChatMessages(prev => [
        ...prev,
        { role: 'assistant', content: 'Sorry, I encountered an error. Please try again.' }
      ]);
    } finally {
      setIsAskingFollowUp(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Preliminary Assessment */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-purple-500" />
              Preliminary Assessment
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCopy}
              className="h-8 px-2"
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4 mr-1 text-green-500" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4 mr-1" />
                  Copy All
                </>
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-gray-700">{analysis.preliminaryAssessment}</p>
        </CardContent>
      </Card>

      {/* Red Flags */}
      {analysis.redFlags && analysis.redFlags.length > 0 && (
        <Card className="border-red-300 bg-red-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-700">
              <AlertTriangle className="h-5 w-5" />
              Red Flags - Seek Immediate Attention
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {analysis.redFlags.map((flag, i) => (
                <li key={i} className="flex items-start gap-2 text-red-700">
                  <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  {flag}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Affected Structures */}
      {analysis.affectedStructures.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Likely Affected Structures</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {analysis.affectedStructures.map((structure, i) => (
              <div key={i} className="p-3 rounded-lg bg-gray-50">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium">{structure.structure}</span>
                  <Badge
                    variant={
                      structure.likelihood === 'high'
                        ? 'default'
                        : structure.likelihood === 'medium'
                        ? 'secondary'
                        : 'outline'
                    }
                    className={
                      structure.likelihood === 'high'
                        ? 'bg-red-500'
                        : structure.likelihood === 'medium'
                        ? 'bg-yellow-500'
                        : ''
                    }
                  >
                    {structure.likelihood} likelihood
                  </Badge>
                </div>
                <p className="text-sm text-gray-600">{structure.reasoning}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Recommended Next Steps */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            Recommended Next Steps
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="space-y-2">
            {analysis.recommendedNextSteps.map((step, i) => (
              <li key={i} className="flex items-start gap-2">
                <ArrowRight className="h-4 w-4 mt-1 text-green-500 flex-shrink-0" />
                <span>{step}</span>
              </li>
            ))}
          </ol>
        </CardContent>
      </Card>

      {/* Disclaimer */}
      <Card className="bg-gray-50">
        <CardContent className="py-4">
          <p className="text-sm text-gray-500 italic">{analysis.disclaimer}</p>
        </CardContent>
      </Card>

      {/* Follow-up Questions Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-blue-500" />
            Ask Follow-up Questions
          </CardTitle>
          <CardDescription>
            Have questions about your assessment? Ask the AI for more details.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Chat Messages */}
          {chatMessages.length > 0 && (
            <div className="max-h-80 overflow-y-auto space-y-3 p-3 bg-gray-50 rounded-lg">
              {chatMessages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] p-3 rounded-lg ${
                      msg.role === 'user'
                        ? 'bg-blue-500 text-white'
                        : 'bg-white border shadow-sm'
                    }`}
                  >
                    {msg.imageUrls && msg.imageUrls.length > 0 && (
                      <div className={`flex flex-wrap gap-2 mb-2 ${msg.imageUrls.length > 1 ? 'grid grid-cols-2' : ''}`}>
                        {msg.imageUrls.map((url, imgIdx) => (
                          <img
                            key={imgIdx}
                            src={url}
                            alt={`Uploaded ${imgIdx + 1}`}
                            className="max-w-full max-h-32 rounded-lg object-cover"
                          />
                        ))}
                      </div>
                    )}
                    <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                  </div>
                </div>
              ))}
              {isAskingFollowUp && (
                <div className="flex justify-start">
                  <div className="bg-white border shadow-sm p-3 rounded-lg">
                    <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>
          )}

          {/* Image Previews */}
          {pendingImages.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {pendingImages.map((img, index) => (
                <div key={index} className="relative inline-block">
                  <img
                    src={img.previewUrl}
                    alt={`To upload ${index + 1}`}
                    className="h-20 w-20 object-cover rounded-lg border"
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

          {/* Input */}
          <div className="flex gap-2">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageSelect}
              accept="image/*"
              multiple
              className="hidden"
            />
            <Button
              variant="outline"
              size="icon"
              onClick={() => fileInputRef.current?.click()}
              disabled={isAskingFollowUp}
              title="Upload image of pain location"
            >
              <Image className="h-4 w-4" />
            </Button>
            <input
              type="text"
              value={followUpQuestion}
              onChange={(e) => setFollowUpQuestion(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAskFollowUp()}
              placeholder="e.g., What stretches would help? Or upload an image..."
              className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isAskingFollowUp}
            />
            <Button
              onClick={handleAskFollowUp}
              disabled={(!followUpQuestion.trim() && pendingImages.length === 0) || isAskingFollowUp}
              size="icon"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-xs text-gray-500">
            Tip: Upload a photo showing where you feel pain for more accurate guidance
          </p>
        </CardContent>
      </Card>

      {/* Re-analyze Button */}
      <Button
        variant="outline"
        onClick={onReanalyze}
        disabled={isReanalyzing}
        className="w-full"
      >
        {isReanalyzing ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Re-analyzing...
          </>
        ) : (
          <>
            <Brain className="h-4 w-4 mr-2" />
            Re-analyze
          </>
        )}
      </Button>
    </div>
  );
}
