import { create } from 'zustand';

interface CompletedExercise {
  exerciseId: string;
  completedAt: number;
  score: number;
}

interface ProgressState {
  completedLessons: string[];
  completedExercises: CompletedExercise[];
  currentLesson: string | null;

  markLessonComplete: (lessonId: string) => void;
  markExerciseComplete: (exerciseId: string, score: number) => void;
  setCurrentLesson: (lessonId: string | null) => void;
  isLessonComplete: (lessonId: string) => boolean;
  isExerciseComplete: (exerciseId: string) => boolean;
}

function loadProgress(): {
  completedLessons: string[];
  completedExercises: CompletedExercise[];
} {
  try {
    const saved = localStorage.getItem('ds-visualizer-progress');
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        completedLessons: parsed.completedLessons ?? [],
        completedExercises: parsed.completedExercises ?? [],
      };
    }
  } catch {
    // ignore
  }
  return { completedLessons: [], completedExercises: [] };
}

function saveProgress(state: {
  completedLessons: string[];
  completedExercises: CompletedExercise[];
}): void {
  try {
    localStorage.setItem('ds-visualizer-progress', JSON.stringify(state));
  } catch {
    // ignore
  }
}

const initial = loadProgress();

export const useProgressStore = create<ProgressState>((set, get) => ({
  completedLessons: initial.completedLessons,
  completedExercises: initial.completedExercises,
  currentLesson: null,

  markLessonComplete: (lessonId: string) => {
    const { completedLessons } = get();
    if (!completedLessons.includes(lessonId)) {
      const updated = [...completedLessons, lessonId];
      set({ completedLessons: updated });
      saveProgress({ completedLessons: updated, completedExercises: get().completedExercises });
    }
  },

  markExerciseComplete: (exerciseId: string, score: number) => {
    const { completedExercises } = get();
    const existing = completedExercises.findIndex((e) => e.exerciseId === exerciseId);
    let updated: CompletedExercise[];
    if (existing >= 0) {
      updated = [...completedExercises];
      updated[existing] = { exerciseId, completedAt: Date.now(), score };
    } else {
      updated = [...completedExercises, { exerciseId, completedAt: Date.now(), score }];
    }
    set({ completedExercises: updated });
    saveProgress({
      completedLessons: get().completedLessons,
      completedExercises: updated,
    });
  },

  setCurrentLesson: (lessonId: string | null) => {
    set({ currentLesson: lessonId });
  },

  isLessonComplete: (lessonId: string) => {
    return get().completedLessons.includes(lessonId);
  },

  isExerciseComplete: (exerciseId: string) => {
    return get().completedExercises.some((e) => e.exerciseId === exerciseId);
  },
}));