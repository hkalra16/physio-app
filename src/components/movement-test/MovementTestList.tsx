'use client';

import { useState, useMemo } from 'react';
import { usePainStore } from '@/store/painStore';
import { generateTestsForSymptoms } from '@/lib/gemini';
import { MovementTestResult, AIGeneratedTest } from '@/lib/types';
import AITestCard from './AITestCard';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Activity, Loader2, Sparkles, RefreshCw } from 'lucide-react';

interface MovementTestListProps {
  apiKey?: string;
}

export default function MovementTestList({ apiKey }: MovementTestListProps) {
  const { currentSession, addMovementTestResult, setSuggestedTests } = usePainStore();
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const painMarkers = currentSession?.painMarkers || [];
  const suggestedTests = currentSession?.suggestedTests || [];
  const completedTests = currentSession?.movementTests || [];
  const initialStory = currentSession?.initialStory;

  const completedTestIds = useMemo(() => {
    return new Set(completedTests.map(t => t.testId));
  }, [completedTests]);

  const handleGenerateTests = async () => {
    if (!apiKey || painMarkers.length === 0) return;

    setIsGenerating(true);
    setError(null);

    try {
      const tests = await generateTestsForSymptoms(painMarkers, apiKey, initialStory);
      setSuggestedTests(tests);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate tests');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleTestComplete = (result: MovementTestResult) => {
    addMovementTestResult(result);
  };

  // No pain markers yet
  if (painMarkers.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-gray-500">
          <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>Mark pain points on the body first to get personalized movement tests.</p>
        </CardContent>
      </Card>
    );
  }

  // No API key
  if (!apiKey) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-gray-500">
          <Sparkles className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>Configure your Gemini API key in settings to generate personalized tests.</p>
        </CardContent>
      </Card>
    );
  }

  // Tests not generated yet
  if (suggestedTests.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-500" />
            AI-Powered Movement Tests
          </CardTitle>
          <CardDescription>
            Generate personalized movement tests based on your {painMarkers.length} pain point{painMarkers.length > 1 ? 's' : ''}.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            onClick={handleGenerateTests}
            disabled={isGenerating}
            className="w-full"
            size="lg"
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Generating Tests...
              </>
            ) : (
              <>
                <Activity className="h-4 w-4 mr-2" />
                Generate Movement Tests
              </>
            )}
          </Button>
          {error && (
            <p className="text-red-500 text-sm mt-2">{error}</p>
          )}
        </CardContent>
      </Card>
    );
  }

  // Show generated tests
  const completedCount = completedTests.length;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Your Movement Tests
              </CardTitle>
              <CardDescription className="mt-1">
                AI-generated tests based on your symptoms.
                {completedCount > 0 && (
                  <span className="ml-2 text-green-600 font-medium">
                    {completedCount}/{suggestedTests.length} completed
                  </span>
                )}
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleGenerateTests}
              disabled={isGenerating}
            >
              {isGenerating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
            </Button>
          </div>
        </CardHeader>
      </Card>

      {suggestedTests.map((test, index) => {
        const isCompleted = completedTestIds.has(test.id);
        const result = completedTests.find(t => t.testId === test.id);

        return (
          <AITestCard
            key={test.id}
            test={test}
            testNumber={index + 1}
            totalTests={suggestedTests.length}
            onComplete={handleTestComplete}
            isCompleted={isCompleted}
            result={result}
          />
        );
      })}
    </div>
  );
}
