import { useEffect } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import confetti from "canvas-confetti";
import { CheckCircle2, XCircle, RotateCcw, Home } from "lucide-react";
import { useAppStore } from "@/store/use-app-store";
import { cn } from "@/lib/utils";

export default function ResultPage() {
  const [, setLocation] = useLocation();
  const currentQuiz = useAppStore((state) => state.currentQuiz);
  const userAnswers = useAppStore((state) => state.userAnswers);
  const score = useAppStore((state) => state.score);
  const clearState = useAppStore((state) => state.clearState);

  useEffect(() => {
    if (!currentQuiz || score === null) {
      setLocation("/");
      return;
    }

    const total = currentQuiz.questions.length;
    if (score / total >= 0.8) {
      // High score! Trigger confetti
      const duration = 3 * 1000;
      const end = Date.now() + duration;

      const frame = () => {
        confetti({
          particleCount: 5,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: ['#e11d48', '#4f46e5', '#ffffff']
        });
        confetti({
          particleCount: 5,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: ['#e11d48', '#4f46e5', '#ffffff']
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      };
      frame();
    }
  }, [currentQuiz, score, setLocation]);

  if (!currentQuiz || score === null) return null;

  const totalQuestions = currentQuiz.questions.length;
  const percentage = (score / totalQuestions) * 100;
  
  let scoreColor = "text-red-500 border-red-500/30 bg-red-500/10";
  let message = "Keep studying! You'll get it next time.";
  
  if (percentage >= 80) {
    scoreColor = "text-green-400 border-green-400/30 bg-green-400/10";
    message = "Excellent work! You're a history master.";
  } else if (percentage >= 40) {
    scoreColor = "text-amber-400 border-amber-400/30 bg-amber-400/10";
    message = "Good effort! A quick review will get you to 100%.";
  }

  const handleRetake = () => {
    // Just clear answers and go back to quiz, keep lesson and quiz intact
    useAppStore.setState({ userAnswers: {}, score: null });
    setLocation("/quiz");
  };

  const handleNewSearch = () => {
    clearState();
    setLocation("/");
  };

  return (
    <div className="max-w-3xl mx-auto py-8 space-y-12">
      {/* Score Header */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-card rounded-3xl p-10 text-center relative overflow-hidden"
      >
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-50" />
        
        <h1 className="text-2xl font-bold text-white/80 mb-8 uppercase tracking-widest">Quiz Results</h1>
        
        <div className={cn("mx-auto w-48 h-48 rounded-full border-[6px] flex items-center justify-center mb-6 shadow-2xl backdrop-blur-sm", scoreColor)}>
          <div className="text-center">
            <span className="text-6xl font-black block leading-none">{score}</span>
            <span className="text-xl font-medium opacity-80">out of {totalQuestions}</span>
          </div>
        </div>
        
        <h2 className="text-2xl font-bold text-white mb-2">{message}</h2>
        <p className="text-muted-foreground">{currentQuiz.topic} • {currentQuiz.level}</p>

        <div className="flex flex-wrap items-center justify-center gap-4 mt-8">
          <button
            onClick={handleRetake}
            className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold bg-white/10 text-white hover:bg-white/20 transition-colors border border-white/5"
          >
            <RotateCcw className="w-4 h-4" /> Retake Quiz
          </button>
          <button
            onClick={handleNewSearch}
            className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold bg-primary text-white hover:bg-primary/90 shadow-lg shadow-primary/20 transition-transform active:scale-95"
          >
            <Home className="w-4 h-4" /> Learn Something New
          </button>
        </div>
      </motion.div>

      {/* Review Section */}
      <div className="space-y-6">
        <h3 className="text-2xl font-bold text-white mb-6">Review Answers</h3>
        
        {currentQuiz.questions.map((q, qIndex) => {
          const userAnswer = userAnswers[qIndex];
          const isCorrect = userAnswer === q.answer;
          
          return (
            <motion.div 
              key={qIndex}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: qIndex * 0.1 }}
              className={cn(
                "rounded-2xl p-6 border backdrop-blur-md",
                isCorrect ? "bg-green-500/5 border-green-500/20" : "bg-red-500/5 border-red-500/20"
              )}
            >
              <div className="flex items-start gap-4 mb-4">
                {isCorrect ? (
                  <CheckCircle2 className="w-6 h-6 text-green-400 flex-shrink-0 mt-0.5" />
                ) : (
                  <XCircle className="w-6 h-6 text-red-400 flex-shrink-0 mt-0.5" />
                )}
                <h4 className="text-lg font-medium text-white">{q.question}</h4>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pl-10">
                {Object.entries(q.options).map(([key, value]) => {
                  const isThisOptionUserAnswer = userAnswer === key;
                  const isThisOptionCorrectAnswer = q.answer === key;
                  
                  let optionClass = "bg-black/20 border-white/5 text-white/60";
                  
                  if (isThisOptionCorrectAnswer) {
                    optionClass = "bg-green-500/20 border-green-500/50 text-green-100 shadow-lg shadow-green-500/10";
                  } else if (isThisOptionUserAnswer && !isCorrect) {
                    optionClass = "bg-red-500/20 border-red-500/50 text-red-100 line-through decoration-red-400/50";
                  }

                  return (
                    <div
                      key={key}
                      className={cn("p-3 rounded-xl border flex items-start gap-3", optionClass)}
                    >
                      <span className={cn(
                        "w-6 h-6 rounded flex items-center justify-center text-xs font-bold flex-shrink-0",
                        isThisOptionCorrectAnswer ? "bg-green-500 text-white" : 
                        (isThisOptionUserAnswer && !isCorrect) ? "bg-red-500 text-white" : "bg-white/10"
                      )}>
                        {key}
                      </span>
                      <span className="text-sm leading-snug">{value}</span>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
