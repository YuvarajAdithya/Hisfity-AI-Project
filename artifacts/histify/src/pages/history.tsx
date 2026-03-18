import { useState } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { Trash2, Clock, PlayCircle, AlertTriangle } from "lucide-react";
import { useGetHistory, useClearHistory, useGenerateLesson, getGetHistoryQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useAppStore } from "@/store/use-app-store";

export default function HistoryPage() {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const setLesson = useAppStore((state) => state.setLesson);
  
  const { data: historyItems, isLoading } = useGetHistory();
  const { mutate: clearHistory, isPending: isClearing } = useClearHistory({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetHistoryQueryKey() });
        setShowConfirmDialog(false);
      }
    }
  });
  
  const { mutate: generateLesson, isPending: isGenerating } = useGenerateLesson();

  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [generatingId, setGeneratingId] = useState<number | null>(null);

  const handleRegenerate = (topic: string, level: string, id: number) => {
    setGeneratingId(id);
    generateLesson(
      { data: { topic, level: level as any } },
      {
        onSuccess: (data) => {
          setLesson(data);
          setLocation("/lesson");
        },
        onError: () => {
          alert("Failed to regenerate lesson.");
          setGeneratingId(null);
        }
      }
    );
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-10">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Clock className="w-8 h-8 text-primary" />
            Your Learning History
          </h1>
          <p className="text-muted-foreground mt-2">Revisit topics you've explored in the past.</p>
        </div>
        
        {historyItems && historyItems.length > 0 && (
          <button
            onClick={() => setShowConfirmDialog(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-destructive/10 text-destructive hover:bg-destructive/20 border border-destructive/20 transition-colors text-sm font-semibold"
          >
            <Trash2 className="w-4 h-4" />
            Clear History
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="glass-card rounded-2xl h-40 animate-pulse bg-white/5" />
          ))}
        </div>
      ) : !historyItems || historyItems.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-card rounded-3xl p-12 text-center max-w-lg mx-auto mt-20"
        >
          <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
            <Clock className="w-10 h-10 text-white/30" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">No history yet</h2>
          <p className="text-muted-foreground mb-8">Start your learning journey by generating your first lesson!</p>
          <button
            onClick={() => setLocation("/")}
            className="px-6 py-3 rounded-full bg-primary text-white font-medium shadow-lg shadow-primary/20 hover:scale-105 transition-transform"
          >
            Generate a Lesson
          </button>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {historyItems.map((item, index) => {
            const isThisGenerating = generatingId === item.id;
            
            return (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                key={item.id}
                className="glass-card rounded-2xl p-6 group hover:border-primary/50 transition-all flex flex-col"
              >
                <div className="flex justify-between items-start mb-4">
                  <span className="px-2.5 py-1 rounded-md bg-white/10 text-xs font-medium text-white/70">
                    {item.level}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {format(new Date(item.createdAt), 'MMM d, yyyy')}
                  </span>
                </div>
                
                <h3 className="text-xl font-bold text-white mb-6 line-clamp-2 flex-1">
                  {item.topic}
                </h3>
                
                <button
                  onClick={() => handleRegenerate(item.topic, item.level, item.id)}
                  disabled={isGenerating}
                  className="w-full py-3 rounded-xl bg-primary/10 text-primary border border-primary/20 font-semibold flex items-center justify-center gap-2 group-hover:bg-primary group-hover:text-white transition-all disabled:opacity-50"
                >
                  {isThisGenerating ? (
                    <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <PlayCircle className="w-5 h-5" /> Revisit Topic
                    </>
                  )}
                </button>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Confirmation Dialog Overlay */}
      {showConfirmDialog && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card rounded-3xl p-8 max-w-md w-full border-destructive/20 shadow-2xl shadow-destructive/10"
          >
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-6 h-6 text-destructive" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Clear History?</h3>
                <p className="text-sm text-muted-foreground">This action cannot be undone.</p>
              </div>
            </div>
            
            <div className="flex gap-3 justify-end mt-8">
              <button
                onClick={() => setShowConfirmDialog(false)}
                disabled={isClearing}
                className="px-5 py-2.5 rounded-xl font-medium text-white/80 hover:bg-white/10 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={() => clearHistory()}
                disabled={isClearing}
                className="px-5 py-2.5 rounded-xl font-medium bg-destructive text-white hover:bg-destructive/90 transition-colors shadow-lg shadow-destructive/20 disabled:opacity-50 flex items-center gap-2"
              >
                {isClearing && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                Yes, clear it
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
