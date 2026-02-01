import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import {
  PainMarker,
  PainMarkerImage,
  BodyView,
  AssessmentSession,
  MovementTestResult,
  GeminiPhysioResponse,
  PainType,
  AIGeneratedTest
} from '@/lib/types';

// Simplified defaults
interface PainDefaults {
  painType: PainType;
  intensity: number;
}

interface PainState {
  // Current session
  currentSession: AssessmentSession | null;
  sessions: AssessmentSession[];

  // UI state
  currentView: BodyView;
  selectedMarkerId: string | null;
  isAnnotating: boolean;
  pendingMarkerPosition: { x: number; y: number; region: string } | null;
  editingMarkerId: string | null;

  // Smart defaults
  painDefaults: PainDefaults;

  // Actions
  setCurrentView: (view: BodyView) => void;
  startNewSession: () => void;
  setInitialStory: (story: string) => void;

  // Pain marker actions (simplified)
  startAnnotation: (x: number, y: number, region: string) => void;
  cancelAnnotation: () => void;
  addPainMarker: (
    painType: PainType,
    intensity: number,
    images?: PainMarkerImage[],
    notes?: string
  ) => void;
  updatePainMarker: (id: string, updates: Partial<PainMarker>) => void;
  removePainMarker: (id: string) => void;
  selectMarker: (id: string | null) => void;
  startEditingMarker: (id: string) => void;
  saveEditedMarker: (
    painType: PainType,
    intensity: number,
    images?: PainMarkerImage[],
    notes?: string
  ) => void;
  getEditingMarker: () => PainMarker | null;

  // Movement test actions
  setSuggestedTests: (tests: AIGeneratedTest[]) => void;
  addMovementTestResult: (result: MovementTestResult) => void;

  // Session actions
  setGeminiAnalysis: (analysis: GeminiPhysioResponse) => void;
  completeSession: () => void;
  loadSession: (sessionId: string) => void;
  deleteSession: (sessionId: string) => void;

  // Getters
  getCurrentMarkers: () => PainMarker[];
  getAffectedRegions: () => string[];
  getPainDefaults: () => PainDefaults;
}

// Initial defaults
const initialPainDefaults: PainDefaults = {
  painType: 'point',
  intensity: 5
};

export const usePainStore = create<PainState>()(
  persist(
    (set, get) => ({
      currentSession: null,
      sessions: [],
      currentView: 'anterior',
      selectedMarkerId: null,
      isAnnotating: false,
      pendingMarkerPosition: null,
      editingMarkerId: null,
      painDefaults: initialPainDefaults,

      setCurrentView: (view) => set({ currentView: view }),

      startNewSession: () => {
        const newSession: AssessmentSession = {
          id: uuidv4(),
          createdAt: new Date(),
          updatedAt: new Date(),
          status: 'in-progress',
          painMarkers: [],
          movementTests: []
        };
        set({ currentSession: newSession, selectedMarkerId: null });
      },

      setInitialStory: (story) => {
        const state = get();
        if (!state.currentSession) return;

        set({
          currentSession: {
            ...state.currentSession,
            initialStory: story,
            updatedAt: new Date()
          }
        });
      },

      startAnnotation: (x, y, region) => {
        set({
          isAnnotating: true,
          pendingMarkerPosition: { x, y, region }
        });
      },

      cancelAnnotation: () => {
        set({
          isAnnotating: false,
          pendingMarkerPosition: null,
          editingMarkerId: null
        });
      },

      addPainMarker: (painType, intensity, images, notes) => {
        const state = get();
        if (!state.currentSession || !state.pendingMarkerPosition) {
          return;
        }

        const newMarker: PainMarker = {
          id: uuidv4(),
          position: {
            x: state.pendingMarkerPosition.x,
            y: state.pendingMarkerPosition.y
          },
          region: state.pendingMarkerPosition.region,
          bodyView: state.currentView,
          painType,
          intensity,
          timestamp: new Date(),
          images: images && images.length > 0 ? images : undefined,
          notes: notes?.trim() || undefined
        };

        // Update defaults
        const newDefaults: PainDefaults = {
          painType,
          intensity
        };

        set({
          currentSession: {
            ...state.currentSession,
            painMarkers: [...state.currentSession.painMarkers, newMarker],
            updatedAt: new Date()
          },
          isAnnotating: false,
          pendingMarkerPosition: null,
          selectedMarkerId: newMarker.id,
          painDefaults: newDefaults
        });
      },

      updatePainMarker: (id, updates) => {
        const state = get();
        if (!state.currentSession) return;

        set({
          currentSession: {
            ...state.currentSession,
            painMarkers: state.currentSession.painMarkers.map((m) =>
              m.id === id ? { ...m, ...updates } : m
            ),
            updatedAt: new Date()
          }
        });
      },

      removePainMarker: (id) => {
        const state = get();
        if (!state.currentSession) return;

        set({
          currentSession: {
            ...state.currentSession,
            painMarkers: state.currentSession.painMarkers.filter((m) => m.id !== id),
            updatedAt: new Date()
          },
          selectedMarkerId: state.selectedMarkerId === id ? null : state.selectedMarkerId
        });
      },

      selectMarker: (id) => set({ selectedMarkerId: id }),

      startEditingMarker: (id) => {
        const state = get();
        const marker = state.currentSession?.painMarkers.find(m => m.id === id);
        if (!marker) return;

        set({
          isAnnotating: true,
          editingMarkerId: id,
          pendingMarkerPosition: {
            x: marker.position.x,
            y: marker.position.y,
            region: marker.region
          },
          selectedMarkerId: null
        });
      },

      saveEditedMarker: (painType, intensity, images, notes) => {
        const state = get();
        if (!state.currentSession || !state.editingMarkerId) return;

        set({
          currentSession: {
            ...state.currentSession,
            painMarkers: state.currentSession.painMarkers.map(m =>
              m.id === state.editingMarkerId
                ? {
                    ...m,
                    painType,
                    intensity,
                    images: images && images.length > 0 ? images : undefined,
                    notes: notes?.trim() || undefined
                  }
                : m
            ),
            updatedAt: new Date()
          },
          isAnnotating: false,
          pendingMarkerPosition: null,
          editingMarkerId: null,
          painDefaults: {
            painType,
            intensity
          }
        });
      },

      getEditingMarker: () => {
        const state = get();
        if (!state.editingMarkerId || !state.currentSession) return null;
        return state.currentSession.painMarkers.find(m => m.id === state.editingMarkerId) || null;
      },

      setSuggestedTests: (tests) => {
        const state = get();
        if (!state.currentSession) return;

        set({
          currentSession: {
            ...state.currentSession,
            suggestedTests: tests,
            updatedAt: new Date()
          }
        });
      },

      addMovementTestResult: (result) => {
        const state = get();
        if (!state.currentSession) return;

        set({
          currentSession: {
            ...state.currentSession,
            movementTests: [...state.currentSession.movementTests, result],
            updatedAt: new Date()
          }
        });
      },

      setGeminiAnalysis: (analysis) => {
        const state = get();
        if (!state.currentSession) return;

        set({
          currentSession: {
            ...state.currentSession,
            geminiAnalysis: analysis,
            updatedAt: new Date()
          }
        });
      },

      completeSession: () => {
        const state = get();
        if (!state.currentSession) return;

        const completedSession = {
          ...state.currentSession,
          status: 'completed' as const,
          updatedAt: new Date()
        };

        set({
          currentSession: completedSession,
          sessions: [...state.sessions, completedSession]
        });
      },

      loadSession: (sessionId) => {
        const state = get();
        const session = state.sessions.find((s) => s.id === sessionId);
        if (session) {
          set({ currentSession: session });
        }
      },

      deleteSession: (sessionId) => {
        const state = get();
        set({
          sessions: state.sessions.filter((s) => s.id !== sessionId),
          currentSession:
            state.currentSession?.id === sessionId ? null : state.currentSession
        });
      },

      getCurrentMarkers: () => {
        const state = get();
        return state.currentSession?.painMarkers || [];
      },

      getAffectedRegions: () => {
        const state = get();
        if (!state.currentSession) return [];
        return [...new Set(state.currentSession.painMarkers.map((m) => m.region))];
      },

      getPainDefaults: () => {
        return get().painDefaults;
      }
    }),
    {
      name: 'physio-pain-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        sessions: state.sessions
      })
    }
  )
);
