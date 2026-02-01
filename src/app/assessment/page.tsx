'use client';

import { useState, useEffect } from 'react';
import { usePainStore } from '@/store/painStore';
import WelcomeScreen from '@/components/welcome/WelcomeScreen';
import BodyVisualizer from '@/components/body-visualizer/BodyVisualizer';
import PainAnnotationPanel from '@/components/pain-annotation/PainAnnotationPanel';
import MarkerDetails from '@/components/pain-annotation/MarkerDetails';
import MovementTestList from '@/components/movement-test/MovementTestList';
import AnalysisPanel from '@/components/analysis/AnalysisPanel';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import { User, Activity, Brain, History, Settings, MessageSquare } from 'lucide-react';

export default function AssessmentPage() {
  const { currentSession, startNewSession, setInitialStory, sessions } = usePainStore();
  const [activeTab, setActiveTab] = useState('pain');
  const [showApiKeyDialog, setShowApiKeyDialog] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [showWelcome, setShowWelcome] = useState(true);

  // Load API key from localStorage
  useEffect(() => {
    const savedKey = localStorage.getItem('gemini-api-key');
    if (savedKey) {
      setApiKey(savedKey);
    }
  }, []);

  // Start a new session if none exists (after hydration)
  useEffect(() => {
    if (!currentSession) {
      startNewSession();
    }
  }, [currentSession, startNewSession]);

  // Check if we should show welcome screen
  useEffect(() => {
    if (currentSession?.initialStory) {
      setShowWelcome(false);
    }
  }, [currentSession?.initialStory]);

  const handleWelcomeComplete = (story: string) => {
    setInitialStory(story);
    setShowWelcome(false);
  };

  const handleSaveApiKey = () => {
    localStorage.setItem('gemini-api-key', apiKey);
    setShowApiKeyDialog(false);
  };

  const painMarkerCount = currentSession?.painMarkers.length || 0;
  const testCount = currentSession?.movementTests.length || 0;

  // Show welcome screen first
  if (showWelcome) {
    return <WelcomeScreen onComplete={handleWelcomeComplete} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center">
              <User className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="font-semibold text-lg">AI Physiotherapist</h1>
              <p className="text-sm text-gray-500">Pain Assessment</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {sessions.length > 0 && (
              <Badge variant="secondary">
                <History className="h-3 w-3 mr-1" />
                {sessions.length} past sessions
              </Badge>
            )}
            <Button variant="ghost" size="icon" onClick={() => setShowApiKeyDialog(true)}>
              <Settings className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Initial Story Summary */}
      {currentSession?.initialStory && (
        <div className="max-w-7xl mx-auto px-4 pt-4">
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="py-3">
              <div className="flex items-start gap-2">
                <MessageSquare className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-blue-800">Your description:</p>
                  <p className="text-sm text-blue-700">{currentSession.initialStory}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full max-w-md mx-auto mb-6">
            <TabsTrigger value="pain" className="flex-1 gap-2">
              <User className="h-4 w-4" />
              Pain Mapping
              {painMarkerCount > 0 && (
                <Badge className="ml-1 h-5 w-5 p-0 justify-center">{painMarkerCount}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="tests" className="flex-1 gap-2">
              <Activity className="h-4 w-4" />
              Tests
              {testCount > 0 && (
                <Badge className="ml-1 h-5 w-5 p-0 justify-center bg-green-500">{testCount}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="analysis" className="flex-1 gap-2">
              <Brain className="h-4 w-4" />
              Analysis
            </TabsTrigger>
          </TabsList>

          {/* Pain Mapping Tab */}
          <TabsContent value="pain">
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Body Visualizer */}
              <Card className="lg:col-span-1">
                <CardHeader>
                  <CardTitle>Tap where it hurts</CardTitle>
                </CardHeader>
                <CardContent>
                  <BodyVisualizer />
                </CardContent>
              </Card>

              {/* Pain Details / Summary */}
              <div className="lg:col-span-1 space-y-4">
                <MarkerDetails />

                {painMarkerCount > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Pain Summary</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {currentSession?.painMarkers.map((marker) => (
                          <div
                            key={marker.id}
                            className="flex items-center justify-between p-2 rounded bg-gray-50"
                          >
                            <span className="capitalize text-sm">
                              {marker.region.replace(/-/g, ' ')}
                            </span>
                            <div className="flex gap-2">
                              <Badge variant="outline">{marker.painType}</Badge>
                              <Badge
                                className={
                                  marker.intensity >= 7
                                    ? 'bg-red-500'
                                    : marker.intensity >= 4
                                    ? 'bg-yellow-500'
                                    : 'bg-green-500'
                                }
                              >
                                {marker.intensity}/10
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                      <Button
                        className="w-full mt-4"
                        onClick={() => setActiveTab('tests')}
                      >
                        Continue to Movement Tests
                      </Button>
                    </CardContent>
                  </Card>
                )}

                {painMarkerCount === 0 && (
                  <Card>
                    <CardContent className="py-8 text-center text-gray-500">
                      <p>Tap on the body diagram to mark where you feel pain.</p>
                      <p className="text-sm mt-2">You can add multiple pain points.</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </TabsContent>

          {/* Movement Tests Tab */}
          <TabsContent value="tests">
            <div className="max-w-2xl mx-auto">
              <MovementTestList apiKey={apiKey} />
              {testCount > 0 && (
                <Button
                  className="w-full mt-4"
                  onClick={() => setActiveTab('analysis')}
                >
                  Continue to AI Analysis
                </Button>
              )}
            </div>
          </TabsContent>

          {/* Analysis Tab */}
          <TabsContent value="analysis">
            <div className="max-w-2xl mx-auto">
              {!apiKey ? (
                <Card>
                  <CardContent className="py-8 text-center">
                    <Brain className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <p className="text-gray-600 mb-4">
                      Please configure your Gemini API key to enable AI analysis.
                    </p>
                    <Button onClick={() => setShowApiKeyDialog(true)}>
                      <Settings className="h-4 w-4 mr-2" />
                      Configure API Key
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <AnalysisPanel apiKey={apiKey} />
              )}
            </div>
          </TabsContent>
        </Tabs>
      </main>

      {/* Pain Annotation Panel (Sheet) */}
      <PainAnnotationPanel />

      {/* API Key Dialog */}
      <Dialog open={showApiKeyDialog} onOpenChange={setShowApiKeyDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Gemini API Key</DialogTitle>
            <DialogDescription>
              Enter your Google Gemini API key to enable AI-powered analysis.
              You can get one from the Google AI Studio.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Enter your API key..."
              className="w-full px-3 py-2 border rounded-md"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowApiKeyDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveApiKey}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
