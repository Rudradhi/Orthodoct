import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileText, 
  Calendar, 
  ChevronRight, 
  Image as ImageIcon, 
  Activity,
  Clock,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Sparkles,
  ArrowRight,
  Trash2
} from 'lucide-react';
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  onSnapshot,
  Timestamp,
  deleteDoc,
  doc
} from 'firebase/firestore';
import { db } from '@/src/lib/firebase';
import { Card } from '@/components/ui/card';

interface Analysis {
  id: string;
  issue: string;
  result: string;
  mediaUrls?: string[];
  createdAt: Timestamp;
}

interface PatientReportsProps {
  uid: string;
  hideTitle?: boolean;
}

export const PatientReports: React.FC<PatientReportsProps> = ({ uid, hideTitle = false }) => {
  const [reports, setReports] = useState<Analysis[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (e: React.MouseEvent, reportId: string) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to permanently delete this report? This action cannot be undone.')) {
      setDeletingId(reportId);
      try {
        await deleteDoc(doc(db, 'analyses', reportId));
      } catch (error) {
        console.error('Error deleting report:', error);
        alert('Failed to delete report. Please try again.');
      } finally {
        setDeletingId(null);
      }
    }
  };

  useEffect(() => {
    const q = query(
      collection(db, 'analyses'),
      where('uid', '==', uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const reportsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Analysis[];
      setReports(reportsData);
      setLoading(false);
    }, (error) => {
      console.error('PatientReports onSnapshot error:', error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [uid]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-4">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="text-medical-600 dark:text-medical-400 transition-colors"
        >
          <Activity size={32} />
        </motion.div>
        <p className="text-gray-500 dark:text-gray-400 font-medium transition-colors">Loading your reports...</p>
      </div>
    );
  }

  if (reports.length === 0) {
    return (
      <div className="text-center py-12 px-6 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm rounded-3xl border border-dashed border-gray-200 dark:border-gray-800 transition-colors">
        <div className="w-16 h-16 bg-gray-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400 dark:text-gray-500 transition-colors">
          <FileText size={32} />
        </div>
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 transition-colors">No reports yet</h3>
        <p className="text-gray-500 dark:text-gray-400 max-w-xs mx-auto transition-colors">
          Submit your first orthopedic concern above to start your recovery journey.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {!hideTitle && (
        <div className="flex items-center justify-between px-2">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2 transition-colors">
            <FileText className="text-medical-600 dark:text-medical-400" />
            Your Recovery Reports
          </h2>
          <span className="text-sm font-medium text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-slate-800 px-3 py-1 rounded-full transition-colors">
            {reports.length} {reports.length === 1 ? 'Report' : 'Reports'}
          </span>
        </div>
      )}

      <div className="flex flex-col relative pb-32">
        {reports.map((report, index) => (
          <motion.div
            key={report.id}
            initial={{ opacity: 0, y: 100 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ margin: "0px 0px -200px 0px" }}
            transition={{ 
              duration: 0.8,
              ease: [0.16, 1, 0.3, 1],
              delay: index * 0.05 
            }}
            className="md:sticky mb-[-240px] last:mb-0"
            style={{ 
              top: `calc(120px + ${index * 20}px)`,
              zIndex: index + 1
            }}
          >
            <Card className={`overflow-hidden border-none transition-all duration-700 rounded-[3rem] ${
              expandedId === report.id 
                ? 'ring-4 ring-medical-500 ring-offset-4 dark:ring-offset-slate-950 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)]' 
                : 'shadow-[0_20px_50px_-12px_rgba(0,0,0,0.15)] bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl border border-white/20 dark:border-gray-800'
            } md:h-[320px] flex flex-col group/card relative`}>
              {/* Card Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />
              
              <div 
                className="p-10 cursor-pointer flex flex-col h-full relative z-10"
                onClick={() => setExpandedId(expandedId === report.id ? null : report.id)}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-6">
                  <div className="flex items-center gap-6">
                    <motion.div 
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      className="p-5 rounded-[2rem] bg-medical-600 text-white shrink-0 shadow-xl shadow-medical-600/20"
                    >
                      <Activity size={32} />
                    </motion.div>
                    <div className="space-y-2">
                      <h4 className="text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-gray-100 line-clamp-1 tracking-tight">
                        {report.issue}
                      </h4>
                      <div className="flex items-center gap-6 text-sm text-gray-500 dark:text-gray-400 font-semibold uppercase tracking-wider">
                        <span className="flex items-center gap-2">
                          <Calendar size={18} className="text-medical-500" />
                          {report.createdAt.toDate().toLocaleDateString(undefined, { month: 'long', day: 'numeric' })}
                        </span>
                        <span className="flex items-center gap-2">
                          <Clock size={18} className="text-royal-gold" />
                          {report.createdAt.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    {report.mediaUrls && report.mediaUrls.length > 0 && (
                      <div className="px-5 py-2 bg-gray-100 dark:bg-slate-800 rounded-full text-xs font-black text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700">
                        {report.mediaUrls.length} ATTACHMENT{report.mediaUrls.length > 1 ? 'S' : ''}
                      </div>
                    )}
                    <motion.div
                      animate={{ rotate: expandedId === report.id ? 180 : 0 }}
                      className="p-3 rounded-2xl bg-gray-50 dark:bg-slate-800 text-gray-400 dark:text-gray-600"
                    >
                      <ChevronDown size={24} />
                    </motion.div>
                  </div>
                </div>

                <div className="flex-1 overflow-hidden">
                  <div className={`space-y-4 ${expandedId === report.id ? '' : 'line-clamp-2'}`}>
                    <div className="flex items-center gap-3">
                      <div className="h-[2px] w-8 bg-medical-500 rounded-full" />
                      <h5 className="text-[12px] font-black text-medical-600 dark:text-medical-400 uppercase tracking-[0.3em]">
                        Advanced Clinical Context
                      </h5>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-lg font-medium italic opacity-90">
                      "{report.result}"
                    </p>
                  </div>
                </div>

                <AnimatePresence>
                  {expandedId === report.id && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="pt-8 mt-6 border-t border-gray-100 dark:border-gray-800 flex justify-between items-end"
                    >
                      <div className="flex gap-3">
                        {report.mediaUrls?.slice(0, 3).map((url, i) => (
                          <div key={i} className="w-16 h-16 rounded-2xl overflow-hidden ring-2 ring-white dark:ring-slate-800 shadow-lg">
                            <img src={url} className="w-full h-full object-cover" />
                          </div>
                        ))}
                      </div>
                      <div className="flex items-center gap-4">
                        <button 
                          onClick={(e) => handleDelete(e, report.id)}
                          disabled={deletingId === report.id}
                          className="px-6 py-4 rounded-2xl bg-red-50 dark:bg-red-900/20 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/40 transition-all font-bold text-sm flex items-center gap-2 disabled:opacity-50"
                          title="Delete Report"
                        >
                          <Trash2 size={18} className={deletingId === report.id ? 'animate-pulse' : ''} />
                          {deletingId === report.id ? 'Deleting...' : 'Delete'}
                        </button>
                        <button className="px-8 py-4 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-2xl font-bold text-sm shadow-xl flex items-center gap-2 group/btn">
                          View Details
                          <ArrowRight size={18} className="group-hover/btn:translate-x-1 transition-transform" />
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
                
                {/* Decorative Background Icon */}
                <div className="absolute bottom-[-20%] right-[-5%] text-medical-500/5 dark:text-white/5 pointer-events-none group-hover/card:scale-110 group-hover/card:rotate-12 transition-transform duration-1000">
                  <Activity size={240} strokeWidth={1} />
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
