import React, { useState, useEffect, useMemo } from 'react';
import { analyzeIssue } from '../services/geminiService';
import { AiAnalysisResult, TradeType, UrgencyLevel, Job } from '../types';
import { CameraIcon, SparklesIcon, ClockIcon, CheckCircleIcon, WrenchIcon, CalendarIcon } from './Icons';

interface NewRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (description: string, analysis: AiAnalysisResult, scheduledAt?: number, image?: string) => void;
  editingJob?: Job | null;
}

type Step = 'details' | 'schedule' | 'review';

const NewRequestModal: React.FC<NewRequestModalProps> = ({ isOpen, onClose, onSubmit, editingJob }) => {
  const [currentStep, setCurrentStep] = useState<Step>('details');
  const [description, setDescription] = useState('');
  const [scheduledAt, setScheduledAt] = useState<string>('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<AiAnalysisResult | null>(null);

  const minDateTime = useMemo(() => {
    const now = new Date();
    return new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
  }, [isOpen]);

  useEffect(() => {
    if (editingJob && isOpen) {
      setDescription(editingJob.description);
      setImagePreview(editingJob.imagePreview || null);
      setAnalysis({
        category: editingJob.category,
        urgency: editingJob.urgency,
        estimatedPriceRange: editingJob.priceEstimate || '',
        summary: editingJob.aiAnalysis || editingJob.description
      });
      if (editingJob.scheduledAt) {
        const date = new Date(editingJob.scheduledAt);
        const isoString = new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
        setScheduledAt(isoString);
      } else {
        setScheduledAt('');
      }
      setCurrentStep('review'); // Jump to review for edits
    } else if (!editingJob && isOpen) {
      setDescription('');
      setScheduledAt('');
      setImagePreview(null);
      setAnalysis(null);
      setCurrentStep('details');
    }
  }, [editingJob, isOpen]);

  if (!isOpen) return null;

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleNextToSchedule = () => {
    if (description.length >= 10) setCurrentStep('schedule');
  };

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    const result = await analyzeIssue(description, imagePreview || undefined);
    setAnalysis(result);
    setIsAnalyzing(false);
    setCurrentStep('review');
  };

  const handleFinalSubmit = () => {
    if (analysis && description) {
      const scheduledTimestamp = scheduledAt ? new Date(scheduledAt).getTime() : undefined;
      onSubmit(description, analysis, scheduledTimestamp, imagePreview || undefined);
      onClose();
    }
  };

  const setQuickSchedule = (type: 'asap' | 'today-evening' | 'tomorrow-morning') => {
    const now = new Date();
    let targetDate = new Date();

    if (type === 'asap') {
      setScheduledAt('');
      return;
    }

    if (type === 'today-evening') {
      targetDate.setHours(18, 0, 0, 0);
      // If it's already past 6pm, set it for tomorrow evening
      if (targetDate < now) targetDate.setDate(targetDate.getDate() + 1);
    } else if (type === 'tomorrow-morning') {
      targetDate.setDate(targetDate.getDate() + 1);
      targetDate.setHours(9, 0, 0, 0);
    }

    const isoString = new Date(targetDate.getTime() - targetDate.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
    setScheduledAt(isoString);
  };

  const steps = [
    { id: 'details', label: 'Issue' },
    { id: 'schedule', label: 'Time' },
    { id: 'review', label: 'Confirm' }
  ];

  const getScheduledDisplay = () => {
    if (!scheduledAt) return "As soon as possible";
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric'
    }).format(new Date(scheduledAt));
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-[70] flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col max-h-[90vh] animate-in slide-in-from-bottom-4 duration-300">
        
        {/* Stepper Header */}
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-100">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-black text-gray-900 tracking-tight">
              {editingJob ? 'Edit Request' : 'Post a Request'}
            </h2>
            <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-200">
              <span className="text-2xl leading-none">&times;</span>
            </button>
          </div>
          
          <div className="flex items-center gap-2">
            {steps.map((s, idx) => (
              <React.Fragment key={s.id}>
                <div className="flex items-center gap-2">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-colors ${
                    currentStep === s.id ? 'bg-black text-white' : 
                    steps.findIndex(x => x.id === currentStep) > idx ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-500'
                  }`}>
                    {steps.findIndex(x => x.id === currentStep) > idx ? '✓' : idx + 1}
                  </div>
                  <span className={`text-xs font-bold transition-colors ${currentStep === s.id ? 'text-black' : 'text-gray-400'}`}>
                    {s.label}
                  </span>
                </div>
                {idx < steps.length - 1 && <div className="flex-1 h-px bg-gray-200 mx-2" />}
              </React.Fragment>
            ))}
          </div>
        </div>

        <div className="p-6 overflow-y-auto flex-1">
          {/* STEP 1: Details */}
          {currentStep === 'details' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-widest text-[10px]">What's the problem?</label>
                <textarea
                  autoFocus
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="E.g., The pipe under my kitchen sink is burst and leaking water..."
                  className="w-full p-4 bg-gray-50 border-2 border-transparent focus:border-black rounded-2xl outline-none resize-none h-40 transition-all text-gray-800"
                />
                <div className="flex justify-between mt-2 px-1">
                  <span className={`text-[10px] font-bold ${description.length < 10 ? 'text-orange-500' : 'text-green-500'}`}>
                    {description.length < 10 ? 'Min 10 characters' : 'Looks good!'}
                  </span>
                  <span className="text-[10px] text-gray-400 font-bold">{description.length} characters</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-widest text-[10px]">Add a photo</label>
                <div className="flex items-center gap-4">
                  <label className="group cursor-pointer flex flex-col items-center justify-center w-24 h-24 rounded-2xl border-2 border-dashed border-gray-300 hover:border-black hover:bg-gray-50 transition-all">
                    <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                    <CameraIcon className="text-gray-400 group-hover:text-black w-6 h-6 transition-colors" />
                    <span className="text-[8px] font-bold uppercase mt-1 text-gray-400 group-hover:text-black">Upload</span>
                  </label>
                  {imagePreview && (
                    <div className="relative w-24 h-24 rounded-2xl overflow-hidden shadow-md group">
                      <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                      <button 
                        onClick={() => setImagePreview(null)}
                        className="absolute inset-0 bg-black/60 text-white text-[10px] font-bold flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        REMOVE
                      </button>
                    </div>
                  )}
                  {!imagePreview && (
                    <div className="flex-1 text-xs text-gray-400 leading-relaxed italic">
                      "A photo helps our AI give you a more accurate price estimate."
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Schedule (Enhanced) */}
          {currentStep === 'schedule' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="text-center">
                <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <CalendarIcon className="w-7 h-7" />
                </div>
                <h3 className="text-lg font-bold text-gray-900">Schedule Appointment</h3>
                <p className="text-xs text-gray-500 mt-1">Select a time that works for you, or choose ASAP.</p>
              </div>

              {/* Quick Select Chips */}
              <div className="flex flex-wrap gap-2 justify-center">
                <button 
                  onClick={() => setQuickSchedule('asap')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold border-2 transition-all ${!scheduledAt ? 'bg-black border-black text-white' : 'bg-white border-gray-100 text-gray-500 hover:border-gray-200'}`}
                >
                  ⚡ ASAP
                </button>
                <button 
                  onClick={() => setQuickSchedule('today-evening')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold border-2 transition-all ${scheduledAt.includes('T18:00') ? 'bg-black border-black text-white' : 'bg-white border-gray-100 text-gray-500 hover:border-gray-200'}`}
                >
                  🌇 Today Evening
                </button>
                <button 
                  onClick={() => setQuickSchedule('tomorrow-morning')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold border-2 transition-all ${scheduledAt.includes('T09:00') ? 'bg-black border-black text-white' : 'bg-white border-gray-100 text-gray-500 hover:border-gray-200'}`}
                >
                  ☀️ Tomorrow Morning
                </button>
              </div>

              <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3">Custom Date & Time</label>
                <div className="relative group">
                  <input
                    type="datetime-local"
                    value={scheduledAt}
                    min={minDateTime}
                    onChange={(e) => setScheduledAt(e.target.value)}
                    className="w-full p-4 bg-white border-2 border-transparent focus:border-black rounded-xl text-sm font-bold outline-none transition-all pr-12 appearance-none shadow-sm"
                  />
                  <ClockIcon className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none group-focus-within:text-black transition-colors" />
                </div>
                
                <div className="mt-4 flex items-center gap-2 px-2">
                  <div className={`w-2 h-2 rounded-full ${scheduledAt ? 'bg-indigo-500 animate-pulse' : 'bg-orange-500'}`} />
                  <span className="text-[11px] font-bold text-gray-600">
                    Appointment: <span className="text-gray-900">{getScheduledDisplay()}</span>
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Review */}
          {currentStep === 'review' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              {isAnalyzing ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="relative w-20 h-20 mb-6">
                    <div className="absolute inset-0 border-4 border-indigo-100 rounded-full"></div>
                    <div className="absolute inset-0 border-4 border-indigo-600 rounded-full border-t-transparent animate-spin"></div>
                    <SparklesIcon className="absolute inset-0 m-auto w-8 h-8 text-indigo-600 animate-pulse" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">Diagnosing issue...</h3>
                  <p className="text-sm text-gray-500">Our AI is categorizing your request.</p>
                </div>
              ) : analysis ? (
                <div className="space-y-4">
                  <div className="bg-indigo-600 text-white rounded-3xl p-6 shadow-xl shadow-indigo-100 relative overflow-hidden">
                    <SparklesIcon className="absolute -right-4 -top-4 w-24 h-24 text-white/10 rotate-12" />
                    <div className="flex items-center gap-2 mb-4">
                      <div className="bg-white/20 p-1.5 rounded-lg">
                        <WrenchIcon className="w-4 h-4 text-white" />
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-widest">Smart Diagnosis</span>
                    </div>
                    
                    <h3 className="text-xl font-bold mb-4">"{analysis.summary}"</h3>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-white/10 rounded-2xl p-3 border border-white/10">
                        <span className="block text-[8px] font-black uppercase tracking-widest mb-1 text-white/60">Required Pro</span>
                        <span className="text-sm font-bold">{analysis.category}</span>
                      </div>
                      <div className="bg-white/10 rounded-2xl p-3 border border-white/10">
                        <span className="block text-[8px] font-black uppercase tracking-widest mb-1 text-white/60">Priority</span>
                        <span className={`text-sm font-bold ${analysis.urgency === UrgencyLevel.EMERGENCY ? 'text-red-300' : 'text-white'}`}>
                          {analysis.urgency}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100">
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Market Estimate</span>
                      <span className="text-lg font-black text-gray-900">{analysis.estimatedPriceRange}</span>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-gray-400 font-bold">
                      <CheckCircleIcon className="w-3 h-3 text-green-500" />
                      Based on current local service rates
                    </div>
                  </div>

                  <div className="px-2 flex items-center justify-between">
                    <div>
                      <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Timeframe</h4>
                      <p className="text-xs font-bold text-indigo-600">{getScheduledDisplay()}</p>
                    </div>
                    {imagePreview && (
                      <div className="w-12 h-12 rounded-lg overflow-hidden border border-gray-100">
                        <img src={imagePreview} className="w-full h-full object-cover" />
                      </div>
                    )}
                  </div>
                </div>
              ) : null}
            </div>
          )}
        </div>

        {/* Action Bar */}
        <div className="p-6 border-t border-gray-100 bg-white flex gap-3">
          {currentStep === 'details' && (
            <button
              onClick={handleNextToSchedule}
              disabled={description.length < 10}
              className="flex-1 py-4 bg-black text-white rounded-2xl font-bold hover:bg-gray-800 disabled:bg-gray-200 disabled:text-gray-400 transition-all active:scale-95"
            >
              Next: Schedule
            </button>
          )}

          {currentStep === 'schedule' && (
            <>
              <button
                onClick={() => setCurrentStep('details')}
                className="px-6 py-4 border-2 border-gray-100 text-gray-500 rounded-2xl font-bold hover:bg-gray-50 transition-all"
              >
                Back
              </button>
              <button
                onClick={handleAnalyze}
                className="flex-1 py-4 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-2xl font-bold hover:shadow-lg hover:shadow-indigo-100 transition-all flex items-center justify-center gap-2 active:scale-95"
              >
                <SparklesIcon className="w-4 h-4" />
                Diagnose & Post
              </button>
            </>
          )}

          {currentStep === 'review' && !isAnalyzing && (
            <>
              <button
                onClick={() => setCurrentStep('schedule')}
                className="px-6 py-4 border-2 border-gray-100 text-gray-500 rounded-2xl font-bold hover:bg-gray-50 transition-all"
              >
                Back
              </button>
              <button
                onClick={handleFinalSubmit}
                className="flex-1 py-4 bg-black text-white rounded-2xl font-bold hover:bg-gray-800 transition-all flex items-center justify-center gap-2 active:scale-95 shadow-xl shadow-gray-200"
              >
                <CheckCircleIcon className="w-4 h-4" />
                {editingJob ? 'Save Changes' : 'Confirm Order'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default NewRequestModal;