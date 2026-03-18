import { useEffect } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { useAppStore } from "@/store/use-app-store";
import { cn } from "@/lib/utils";

export default function QuizPage() {
  const [, setLocation] = useLocation();
  const currentQuiz = useAppStore((state) => state.currentQuiz);
  const userAnswers = useAppStore((state) => state.userAnswers);
  const setAnswer = useAppStore((state) => state.setAnswer);
  const calculateScore = useAppStore((state) => state.calculateScore);

  useEffect(() => {
    if (!currentQuiz) {
      setLocation("/");
    }
  }, [currentQuiz, setLocation]);

  if (!currentQuiz) return null;

  const totalQuestions = currentQuiz.questions.length;
  const answeredCount = Object.keys(userAnswers).length;
  const isComplete = answeredCount === totalQuestions;

  const handleSubmit = () => {
    if (!isComplete) return;
    calculateScore();
    setLocation("/result");
  };

  return (
    <div className="max-w-3xl mx-auto py-8">
      {/* Progress Header */}
      <div className="glass-card rounded-2xl p-6 mb-8 sticky top-24 z-30">
        <div className="flex justify-between items-end mb-4">
          <div>
            <h1 className="text-2xl font-bold text-white mb-1">Knowledge Check</h1>
            <p className="text-sm text-muted-foreground">{currentQuiz.topic} • {currentQuiz.level}</p>
          </div>
          <div className="text-right">
            <span className="text-2xl font-bold text-primary">{answeredCount}</span>
            <span className="text-muted-foreground">/{totalQuestions} Answered</span>
          </div>
        </div>
        <div className="w-full h-2 bg-black/40 rounded-full overflow-hidden">
          <motion.div 
            className="h-full bg-gradient-to-r from-rose-500 to-primary"
            initial={{ width: 0 }}
            animate={{ width: `${(answeredCount / totalQuestions) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      {/* Questions */}
      <div className="space-y-12 mb-12">
        {currentQuiz.questions.map((q, qIndex) => {
          const selectedAnswer = userAnswers[qIndex];
          
          return (
            <motion.div 
              key={qIndex}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: qIndex * 0.1 }}
              className="glass-card rounded-3xl p-6 md:p-8"
            >
              <div className="flex gap-4 mb-6">
                <span className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold">
                  {qIndex + 1}
                </span>
                <h3 className="text-xl font-medium text-white pt-1">{q.question}</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pl-12">
                {Object.entries(q.options).map(([key, value]) => {
                  const isSelected = selectedAnswer === key;
                  
                  return (
                    <button
                      key={key}
                      onClick={() => setAnswer(qIndex, key)}
                      className={cn(
                        "text-left p-4 rounded-xl border transition-all duration-200 group flex items-start gap-3",
                        isSelected 
                          ? "bg-primary/20 border-primary shadow-lg shadow-primary/10" 
                          : "bg-black/20 border-white/5 hover:bg-white/5 hover:border-white/20"
                      )}
                    >
                      <span className={cn(
                        "w-6 h-6 rounded-md flex flex-shrink-0 items-center justify-center text-xs font-bold transition-colors",
                        isSelected ? "bg-primary text-white" : "bg-white/10 text-white/50 group-hover:bg-white/20 group-hover:text-white"
                      )}>
                        {key}
                      </span>
                      <span className={cn(
                        "text-base leading-snug",
                        isSelected ? "text-white font-medium" : "text-white/80"
                      )}>
                        {value}
                      </span>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Submit Action */}
      <AnimatePresence>
        {isComplete && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-center"
          >
            <button
              onClick={handleSubmit}
              className="px-10 py-4 rounded-full font-bold text-lg bg-white text-background hover:bg-white/90 shadow-xl shadow-white/10 transition-transform active:scale-95"
            >
              Submit & See Results
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
