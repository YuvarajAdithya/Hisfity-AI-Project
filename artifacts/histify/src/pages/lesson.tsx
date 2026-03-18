import { useEffect, useState, useRef } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { Volume2, VolumeX, ArrowRight, RotateCcw, Lightbulb, CheckCircle2 } from "lucide-react";
import { useAppStore } from "@/store/use-app-store";
import { useGenerateQuiz } from "@workspace/api-client-react";

export default function LessonPage() {
  const [, setLocation] = useLocation();
  const currentLesson = useAppStore((state) => state.currentLesson);
  const setQuiz = useAppStore((state) => state.setQuiz);
  const { mutate: generateQuiz, isPending: isQuizPending } = useGenerateQuiz();
  
  const [isReading, setIsReading] = useState(false);
  const synthRef = useRef<SpeechSynthesis | null>(null);

  useEffect(() => {
    if (!currentLesson) {
      setLocation("/");
    }
    
    if (typeof window !== 'undefined') {
      synthRef.current = window.speechSynthesis;
    }
    
    return () => {
      if (synthRef.current) {
        synthRef.current.cancel();
      }
    };
  }, [currentLesson, setLocation]);

  if (!currentLesson) return null;

  const handleReadAloud = () => {
    if (!synthRef.current) return;
    
    if (isReading) {
      synthRef.current.cancel();
      setIsReading(false);
      return;
    }

    const textToRead = `
      ${currentLesson.title}. 
      ${currentLesson.overview}. 
      ${currentLesson.sections.map(s => `${s.heading}. ${s.content}`).join(' ')}
      Key Facts: ${currentLesson.keyFacts.join('. ')}.
      Fun Fact: ${currentLesson.funFact}
    `;

    const utterance = new SpeechSynthesisUtterance(textToRead);
    utterance.rate = 0.95;
    
    utterance.onend = () => setIsReading(false);
    utterance.onerror = () => setIsReading(false);
    
    synthRef.current.speak(utterance);
    setIsReading(true);
  };

  const handleTakeQuiz = () => {
    const fullContent = `${currentLesson.overview} ${currentLesson.sections.map(s => s.content).join(' ')}`;
    
    generateQuiz(
      { data: { lessonContent: fullContent, topic: currentLesson.topic, level: currentLesson.level } },
      {
        onSuccess: (data) => {
          setQuiz(data);
          if (synthRef.current) synthRef.current.cancel();
          setLocation("/quiz");
        },
        onError: (err) => {
          console.error("Failed to generate quiz", err);
          alert("Failed to generate quiz. Please try again.");
        }
      }
    );
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  return (
    <div className="pb-24">
      {/* Sticky Action Bar */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-2xl px-4">
        <div className="glass-card rounded-full p-2 flex items-center justify-between gap-2 shadow-2xl border border-white/20">
          <button
            onClick={() => {
              if (synthRef.current) synthRef.current.cancel();
              setLocation("/");
            }}
            className="p-3 rounded-full hover:bg-white/10 text-muted-foreground hover:text-white transition-colors flex-shrink-0"
            title="Search Again"
          >
            <RotateCcw className="w-5 h-5" />
          </button>
          
          <button
            onClick={handleReadAloud}
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-full font-medium transition-colors ${
              isReading 
                ? 'bg-primary/20 text-primary border border-primary/30' 
                : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            {isReading ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
            <span className="hidden sm:inline">{isReading ? 'Stop Reading' : 'Read Aloud'}</span>
          </button>
          
          <button
            onClick={handleTakeQuiz}
            disabled={isQuizPending}
            className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-full font-bold bg-primary text-white shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isQuizPending ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                Take Quiz <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </div>
      </div>

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="max-w-4xl mx-auto space-y-10"
      >
        <motion.header variants={itemVariants} className="space-y-4 text-center">
          <div className="inline-flex gap-2 mb-2">
            <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-muted-foreground uppercase tracking-wider">
              {currentLesson.topic}
            </span>
            <span className="px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-medium uppercase tracking-wider">
              {currentLesson.level}
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white leading-tight">
            {currentLesson.title}
          </h1>
        </motion.header>

        <motion.section variants={itemVariants} className="glass-card rounded-3xl p-6 md:p-8">
          <h2 className="text-xl font-semibold text-primary mb-4">Overview</h2>
          <p className="text-lg text-white/90 leading-relaxed">
            {currentLesson.overview}
          </p>
        </motion.section>

        <motion.section variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="glass-card rounded-3xl p-6 md:p-8 bg-gradient-to-br from-primary/10 to-transparent border-primary/20">
            <div className="flex items-center gap-3 mb-4 text-primary">
              <Lightbulb className="w-6 h-6" />
              <h2 className="text-xl font-bold">Fun Fact</h2>
            </div>
            <p className="text-white/90 italic leading-relaxed text-lg">
              "{currentLesson.funFact}"
            </p>
          </div>

          <div className="glass-card rounded-3xl p-6 md:p-8">
            <div className="flex items-center gap-3 mb-5 text-white">
              <CheckCircle2 className="w-6 h-6 text-green-400" />
              <h2 className="text-xl font-bold">Key Facts</h2>
            </div>
            <div className="flex flex-wrap gap-2">
              {currentLesson.keyFacts.map((fact, i) => (
                <span key={i} className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-sm font-medium text-white/90">
                  {fact}
                </span>
              ))}
            </div>
          </div>
        </motion.section>

        <div className="space-y-8">
          {currentLesson.sections.map((section, i) => (
            <motion.section key={i} variants={itemVariants} className="glass-card rounded-3xl p-6 md:p-8 relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-1 h-full bg-primary opacity-50 group-hover:opacity-100 transition-opacity" />
              <h3 className="text-2xl font-bold text-white mb-4 pl-4">{section.heading}</h3>
              <p className="text-white/80 leading-relaxed pl-4 text-lg">
                {section.content}
              </p>
            </motion.section>
          ))}
        </div>
        
      </motion.div>
    </div>
  );
}
