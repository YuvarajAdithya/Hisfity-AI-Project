import { create } from 'zustand';
import type { Lesson, Quiz } from '@workspace/api-client-react';

interface AppState {
  currentLesson: Lesson | null;
  setCurrentLesson: (lesson: Lesson) => void;
  
  currentQuiz: Quiz | null;
  setCurrentQuiz: (quiz: Quiz) => void;
  
  quizAnswers: Record<number, string>;
  setQuizAnswer: (questionIndex: number, answer: string) => void;
  
  quizScore: number | null;
  setQuizScore: (score: number) => void;
  
  resetSession: () => void;
  resetQuizState: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  currentLesson: null,
  setCurrentLesson: (lesson) => set({ currentLesson: lesson }),
  
  currentQuiz: null,
  setCurrentQuiz: (quiz) => set({ currentQuiz: quiz, quizAnswers: {}, quizScore: null }),
  
  quizAnswers: {},
  setQuizAnswer: (index, answer) => 
    set((state) => ({ quizAnswers: { ...state.quizAnswers, [index]: answer } })),
    
  quizScore: null,
  setQuizScore: (score) => set({ quizScore: score }),
  
  resetSession: () => set({ 
    currentLesson: null, 
    currentQuiz: null, 
    quizAnswers: {}, 
    quizScore: null 
  }),
  
  resetQuizState: () => set({
    quizAnswers: {},
    quizScore: null
  })
}));
