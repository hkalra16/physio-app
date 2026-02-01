import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { User, Activity, Brain, ArrowRight, Shield, Clock } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Hero Section */}
      <header className="max-w-6xl mx-auto px-4 py-16 text-center">
        <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
          <Brain className="h-4 w-4" />
          AI-Powered Assessment
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
          Your Personal AI Physiotherapist
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
          Map your pain points, complete guided movement tests, and get AI-powered insights
          to better understand your condition.
        </p>
        <Link href="/assessment">
          <Button size="lg" className="text-lg px-8 py-6">
            Start Assessment
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </Link>
      </header>

      {/* How It Works */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <h2 className="text-2xl font-bold text-center mb-12">How It Works</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <Card className="relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-blue-100 rounded-bl-full" />
            <CardHeader>
              <div className="h-12 w-12 bg-blue-500 rounded-lg flex items-center justify-center mb-4">
                <User className="h-6 w-6 text-white" />
              </div>
              <CardTitle>1. Mark Your Pain</CardTitle>
              <CardDescription>
                Use our interactive body diagram to pinpoint exactly where you feel pain
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>• Click to mark pain locations</li>
                <li>• Describe pain type & intensity</li>
                <li>• Add multiple pain points</li>
                <li>• View affected muscles</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-green-100 rounded-bl-full" />
            <CardHeader>
              <div className="h-12 w-12 bg-green-500 rounded-lg flex items-center justify-center mb-4">
                <Activity className="h-6 w-6 text-white" />
              </div>
              <CardTitle>2. Movement Tests</CardTitle>
              <CardDescription>
                Complete guided physiotherapy tests based on your pain pattern
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>• Personalized test suggestions</li>
                <li>• Step-by-step instructions</li>
                <li>• Record test results</li>
                <li>• Track pain changes</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-purple-100 rounded-bl-full" />
            <CardHeader>
              <div className="h-12 w-12 bg-purple-500 rounded-lg flex items-center justify-center mb-4">
                <Brain className="h-6 w-6 text-white" />
              </div>
              <CardTitle>3. AI Analysis</CardTitle>
              <CardDescription>
                Get intelligent insights powered by Google Gemini
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>• Preliminary assessment</li>
                <li>• Likely affected structures</li>
                <li>• Recommended next steps</li>
                <li>• Red flag identification</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Features */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-center mb-12">Key Features</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="flex gap-4 p-4">
              <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Shield className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">Anatomical Muscle Mapping</h3>
                <p className="text-sm text-gray-600">
                  Each pain point is automatically mapped to underlying muscles and nerve pathways,
                  providing educational context about what might be affected.
                </p>
              </div>
            </div>

            <div className="flex gap-4 p-4">
              <div className="h-10 w-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Activity className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">Clinical Movement Tests</h3>
                <p className="text-sm text-gray-600">
                  Standard physiotherapy tests like Neer&apos;s, Spurling&apos;s, and Straight Leg Raise
                  help narrow down potential issues.
                </p>
              </div>
            </div>

            <div className="flex gap-4 p-4">
              <div className="h-10 w-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Brain className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">Gemini AI Integration</h3>
                <p className="text-sm text-gray-600">
                  Powered by Google&apos;s Gemini model to analyze your pain pattern and test results,
                  providing intelligent preliminary assessments.
                </p>
              </div>
            </div>

            <div className="flex gap-4 p-4">
              <div className="h-10 w-10 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Clock className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">Session History</h3>
                <p className="text-sm text-gray-600">
                  Track your pain over time, compare assessments, and monitor your progress
                  with built-in session management.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Disclaimer */}
      <section className="max-w-4xl mx-auto px-4 py-16">
        <Card className="bg-yellow-50 border-yellow-200">
          <CardContent className="py-6">
            <p className="text-center text-sm text-yellow-800">
              <strong>Important:</strong> This tool provides educational information only and is not a
              substitute for professional medical advice, diagnosis, or treatment. Always seek the advice
              of a qualified healthcare professional with any questions you may have regarding a medical condition.
            </p>
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <p className="text-gray-400">
            AI Physiotherapist - Built with Next.js & Google Gemini
          </p>
        </div>
      </footer>
    </div>
  );
}
