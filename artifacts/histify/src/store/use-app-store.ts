import { create } from 'zustand';
import type { Lesson, Quiz } from '@workspace/api-client-react';

interface AppState {
  currentLesson: Lesson | null;
  currentQuiz: Quiz | null;
  userAnswers: Record<number, string>;
  score: number | null;
  setLesson: (lesson: Lesson) => void;
  setQuiz: (quiz: Quiz) => void;
  setAnswer: (questionIndex: number, answer: string) => void;
  calculateScore: () => void;
  clearState: () => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  currentLesson: null,
  currentQuiz: null,
  userAnswers: {},
  score: null,
  
  setLesson: (lesson) => set({ currentLesson: lesson, currentQuiz: null, userAnswers: {}, score: null }),
  setQuiz: (quiz) => set({ currentQuiz: quiz, userAnswers: {}, score: null }),
  
  setAnswer: (questionIndex, answer) => 
    set((state) => ({
      userAnswers: { ...state.userAnswers, [questionIndex]: answer }
    })),
    
  calculateScore: () => {
    const { currentQuiz, userAnswers } = get();
    if (!currentQuiz) return;
    
    let totalScore = 0;
    currentQuiz.questions.forEach((q, index) => {
      if (userAnswers[index] === q.answer) {
        totalScore += 1;
      }
    });
    set({ score: totalScore });
  },
  
  clearState: () => set({ currentLesson: null, currentQuiz: null, userAnswers: {}, score: null })
}));
