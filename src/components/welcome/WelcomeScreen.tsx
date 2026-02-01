'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { ArrowRight } from 'lucide-react';

interface WelcomeScreenProps {
  onComplete: (story: string) => void;
}

const suggestionChips = [
  "My back has been hurting for a few days",
  "I injured my shoulder while exercising",
  "My neck feels stiff and painful",
  "Knee pain when I walk or climb stairs",
  "Pain in my wrist from typing",
  "Hip pain that's getting worse"
];

export default function WelcomeScreen({ onComplete }: WelcomeScreenProps) {
  const [story, setStory] = useState('');

  const handleChipClick = (suggestion: string) => {
    setStory(prev => prev ? `${prev} ${suggestion}` : suggestion);
  };

  const handleContinue = () => {
    if (story.trim()) {
      onComplete(story.trim());
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-lg space-y-8">
        {/* Greeting */}
        <div className="text-center space-y-2">
          <div className="text-5xl mb-4">👋</div>
          <h1 className="text-3xl font-bold text-gray-900">
            Hey, what's going on?
          </h1>
          <p className="text-gray-600">
            Tell us about your pain or discomfort
          </p>
        </div>

        {/* Text Area */}
        <Card className="p-4">
          <Textarea
            placeholder="Describe what you're experiencing... For example: 'I've had lower back pain for about a week now. It started after I lifted something heavy. The pain gets worse when I sit for long periods.'"
            value={story}
            onChange={(e) => setStory(e.target.value)}
            className="min-h-[150px] text-lg border-0 focus-visible:ring-0 resize-none"
          />
        </Card>

        {/* Suggestion Chips */}
        <div className="space-y-3">
          <p className="text-sm text-gray-500 text-center">
            Or tap a suggestion to get started:
          </p>
          <div className="flex flex-wrap gap-2 justify-center">
            {suggestionChips.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => handleChipClick(suggestion)}
                className="px-3 py-2 text-sm bg-white border border-gray-200 rounded-full hover:bg-blue-50 hover:border-blue-300 transition-colors"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>

        {/* Continue Button */}
        <Button
          size="lg"
          className="w-full text-lg py-6"
          onClick={handleContinue}
          disabled={!story.trim()}
        >
          Next: Show us where it hurts
          <ArrowRight className="ml-2 h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}
