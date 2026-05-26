import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Sparkles, Activity, Image as ImageIcon, X, Paperclip, Loader2, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { storage } from '@/src/lib/firebase';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';

interface PromptBoxProps {
  onSubmit: (issue: string, mediaUrls: string[]) => void;
  isLoading?: boolean;
}

export const PromptBox: React.FC<PromptBoxProps> = ({ onSubmit, isLoading }) => {
  const [issue, setIssue] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setFiles(prev => [...prev, ...newFiles]);
      
      const newPreviews = newFiles.map(file => URL.createObjectURL(file as Blob));
      setPreviews(prev => [...prev, ...newPreviews]);
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
    setPreviews(prev => {
      URL.revokeObjectURL(prev[index]);
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!issue.trim() && files.length === 0) return;

    setUploading(true);
    const mediaUrls: string[] = [];

    try {
      for (const file of files) {
        const storageRef = ref(storage, `reports/${Date.now()}-${file.name}`);
        const uploadTask = await uploadBytesResumable(storageRef, file);
        const url = await getDownloadURL(uploadTask.ref);
        mediaUrls.push(url);
      }
      onSubmit(issue, mediaUrls);
      setIssue('');
      setFiles([]);
      setPreviews([]);
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="w-full max-w-2xl mx-auto will-change-[transform,opacity]"
    >
      <Card className="relative overflow-hidden border-none bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl shadow-2xl shadow-medical-500/10 ring-1 ring-medical-500/20 dark:ring-medical-500/10 transition-colors will-change-transform">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-medical-500 to-medical-200 dark:from-medical-600 dark:to-medical-400" />
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 rounded-full bg-medical-100 dark:bg-medical-900/40 text-medical-600 dark:text-medical-400 transition-colors">
              <Activity size={20} />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 transition-colors">Describe your discomfort</h3>
          </div>

          <div className="relative group bg-white/50 dark:bg-slate-800/50 border border-medical-100 dark:border-medical-900/50 rounded-2xl overflow-hidden focus-within:ring-2 focus-within:ring-medical-500 transition-all duration-300">
            <Textarea
              placeholder="e.g., 'I have a sharp pain in my lower back when I bend over...'"
              className="min-h-[120px] md:min-h-[160px] bg-transparent border-none focus-visible:ring-0 resize-none text-base md:text-lg transition-all duration-300 placeholder:text-gray-400 dark:text-gray-200"
              value={issue}
              onChange={(e) => setIssue(e.target.value)}
            />

            <div className="p-3 md:p-4 space-y-3">
              <AnimatePresence>
                {files.length > 0 && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="flex flex-wrap gap-2 items-center"
                  >
                    {previews.map((url, i) => (
                      <motion.div 
                        key={i}
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="relative w-16 h-16 md:w-20 md:h-20 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 group/item shadow-sm bg-white dark:bg-slate-900 transition-colors"
                      >
                        <img src={url} alt="preview" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => removeFile(i)}
                          className="absolute top-1 right-1 p-1 bg-red-500/80 hover:bg-red-500 text-white rounded-full opacity-100 md:opacity-0 md:group-hover/item:opacity-100 transition-opacity z-10 backdrop-blur-sm"
                        >
                          <X size={10} />
                        </button>
                      </motion.div>
                    ))}
                    
                    <label
                      htmlFor="media-upload"
                      className="w-16 h-16 md:w-20 md:h-20 rounded-xl border-2 border-dashed border-medical-200 dark:border-medical-800 flex items-center justify-center text-medical-400 dark:text-gray-500 hover:text-medical-600 dark:hover:text-medical-400 hover:border-medical-400 dark:hover:border-medical-700 transition-all cursor-pointer bg-white/80 dark:bg-slate-900/80 hover:bg-medical-50 dark:hover:bg-medical-900/20 shadow-sm"
                      title="Add more media"
                    >
                      <Plus size={24} />
                    </label>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <input
                    type="file"
                    id="media-upload"
                    multiple
                    accept="image/*,video/*"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                  
                  {files.length === 0 && (
                    <motion.label
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      htmlFor="media-upload"
                      className="flex items-center gap-2 px-4 py-2 rounded-full bg-white dark:bg-slate-900 border border-medical-100 dark:border-medical-900 text-medical-600 dark:text-medical-400 text-sm font-medium hover:bg-medical-50 dark:hover:bg-medical-900/20 transition-all cursor-pointer shadow-sm active:scale-95"
                    >
                      <Paperclip size={16} />
                      <span>Add Media</span>
                    </motion.label>
                  )}
                </div>

                <AnimatePresence>
                  {(issue.length > 10 || files.length > 0) && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                    >
                      <Button 
                        type="submit" 
                        disabled={isLoading || uploading}
                        className="bg-medical-600 hover:bg-medical-500 text-white rounded-full px-5 md:px-8 py-5 md:py-6 h-auto shadow-lg shadow-medical-600/20 hover:shadow-medical-500/40 transition-all active:scale-95 relative group overflow-hidden text-sm md:text-base font-bold"
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-shimmer" />
                        {isLoading || uploading ? (
                          <div className="flex items-center gap-2">
                            <Loader2 size={18} className="animate-spin" />
                            <span>{uploading ? 'Uploading...' : 'Analyzing...'}</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <span>Analyze Issue</span>
                            <Send size={14} />
                          </div>
                        )}
                      </Button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400 px-1 transition-colors">
            <div className="flex items-center gap-1">
              <Sparkles size={14} className="text-medical-500 dark:text-medical-400" />
              <span>AI-Powered Diagnosis</span>
            </div>
            <div className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-700 mx-1" />
            <span>Personalized Exercises</span>
          </div>
        </form>
      </Card>
    </motion.div>
  );
};
