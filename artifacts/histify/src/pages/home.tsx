import { useState } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { Sparkles, ArrowRight, BrainCircuit, GraduationCap, Flame } from "lucide-react";
import { useGenerateLesson, type GenerateLessonBodyLevel } from "@workspace/api-client-react";
import { useAppStore } from "@/store/use-app-store";

export default function Home() {
  const [, setLocation] = useLocation();
  const setLesson = useAppStore((state) => state.setLesson);
  const { mutate: generateLesson, isPending } = useGenerateLesson();
  
  const [topic, setTopic] = useState("");
  const [level, setLevel] = useState<GenerateLessonBodyLevel>("Beginner");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) return;

    generateLesson(
      { data: { topic, level } },
      {
        onSuccess: (data) => {
          setLesson(data);
          setLocation("/lesson");
        },
        onError: (err) => {
          console.error("Failed to generate lesson", err);
          // In a real app, show a toast here
          alert("Failed to generate lesson. Please try again.");
        }
      }
    );
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-8rem)] py-12">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center max-w-3xl mb-12"
      >
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary mb-6">
          <Sparkles className="w-4 h-4" />
          <span className="text-sm font-semibold tracking-wide uppercase">AI-Powered Learning</span>
        </div>
        <h1 className="text-5xl md:text-7xl font-extrabold mb-6 leading-tight">
          Learn History.<br />
          <span className="text-gradient">The Smart Way.</span>
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          Instantly generate personalized history lessons and interactive quizzes on any topic, tailored to your knowledge level.
        </p>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="w-full max-w-2xl"
      >
        <div className="glass-card rounded-3xl p-6 md:p-8 relative overflow-hidden">
          {/* Decorative blur blob */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 blur-[80px] rounded-full pointer-events-none -translate-y-1/2 translate-x-1/3" />
          
          <form onSubmit={handleSubmit} className="relative z-10 flex flex-col gap-6">
            <div className="space-y-2">
              <label htmlFor="topic" className="text-sm font-medium text-white/80 ml-1">
                What do you want to learn about?
              </label>
              <input
                id="topic"
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g. The Roman Empire, Cold War, Samurai..."
                className="w-full px-5 py-4 rounded-xl bg-black/20 border border-white/10 text-white placeholder:text-white/30 focus-ring text-lg"
                required
                disabled={isPending}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-white/80 ml-1">
                Select your knowledge level
              </label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { value: "Beginner", icon: <BrainCircuit className="w-5 h-5 mb-1" /> },
                  { value: "Intermediate", icon: <GraduationCap className="w-5 h-5 mb-1" /> },
                  { value: "Advanced", icon: <Flame className="w-5 h-5 mb-1" /> }
                ].map((lvl) => (
                  <button
                    key={lvl.value}
                    type="button"
                    onClick={() => setLevel(lvl.value as GenerateLessonBodyLevel)}
                    disabled={isPending}
                    className={`flex flex-col items-center justify-center p-4 rounded-xl border transition-all duration-200 ${
                      level === lvl.value 
                        ? 'bg-primary/20 border-primary text-white shadow-lg shadow-primary/20' 
                        : 'bg-black/20 border-white/10 text-muted-foreground hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    {lvl.icon}
                    <span className="text-sm font-medium">{lvl.value}</span>
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={!topic.trim() || isPending}
              className="mt-2 group relative w-full flex items-center justify-center gap-3 px-8 py-4 rounded-xl font-bold text-lg bg-primary text-white overflow-hidden transition-transform duration-200 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 shadow-xl shadow-primary/25"
            >
              {isPending ? (
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Generating your lesson...
                </div>
              ) : (
                <>
                  Generate Lesson
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
