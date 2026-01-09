import React from 'react';
import { Job, JobStatus, UrgencyLevel, Offer, Provider, UserRole } from '../types';
import { MapPinIcon, ClockIcon, CheckCircleIcon, WrenchIcon, SparklesIcon } from './Icons';

interface JobDetailsModalProps {
  job: Job | null;
  isOpen: boolean;
  onClose: () => void;
  offers?: Offer[];
  providers?: Provider[];
  userRole?: UserRole;
  onAcceptOffer?: (jobId: string, offer: Offer) => void;
}

const JobDetailsModal: React.FC<JobDetailsModalProps> = ({ 
  job, 
  isOpen, 
  onClose, 
  offers = [], 
  providers = [], 
  userRole,
  onAcceptOffer 
}) => {
  if (!isOpen || !job) return null;

  const getUrgencyColor = (urgency: UrgencyLevel) => {
    switch (urgency) {
      case UrgencyLevel.EMERGENCY: return 'bg-red-100 text-red-700 border-red-200';
      case UrgencyLevel.HIGH: return 'bg-orange-100 text-orange-700 border-orange-200';
      default: return 'bg-blue-50 text-blue-700 border-blue-200';
    }
  };

  const getStatusColor = (status: JobStatus) => {
    switch (status) {
      case JobStatus.PENDING: return 'bg-yellow-100 text-yellow-700';
      case JobStatus.MATCHED: return 'bg-indigo-100 text-indigo-700';
      case JobStatus.IN_PROGRESS: return 'bg-blue-100 text-blue-700';
      case JobStatus.COMPLETED: return 'bg-green-100 text-green-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const formatTime = (timestamp: number) => {
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: 'numeric'
    }).format(new Date(timestamp));
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh] animate-in slide-in-from-bottom-4 duration-300">
        {/* Header */}
        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <h2 className="text-lg font-bold text-gray-900">Request Overview</h2>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded-full transition-colors">
            <span className="text-2xl leading-none">&times;</span>
          </button>
        </div>

        <div className="overflow-y-auto">
          {/* Main Visual Section */}
          <div className="relative h-48 md:h-64 bg-gray-100">
            {job.imagePreview ? (
              <img src={job.imagePreview} alt="Issue preview" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                <WrenchIcon className="w-12 h-12 mb-2" />
                <span className="text-sm">No photo provided</span>
              </div>
            )}
            <div className="absolute top-4 left-4 flex gap-2">
              <span className={`px-3 py-1 rounded-full text-xs font-bold border shadow-sm ${getUrgencyColor(job.urgency)}`}>
                {job.urgency} Urgency
              </span>
              <span className={`px-3 py-1 rounded-full text-xs font-bold border shadow-sm ${getStatusColor(job.status)}`}>
                {job.status.replace('_', ' ')}
              </span>
            </div>
          </div>

          <div className="p-6">
            <div className="mb-6">
              <h1 className="text-2xl font-extrabold text-gray-900 mb-2">{job.aiAnalysis || "Maintenance Request"}</h1>
              <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-1.5">
                  <MapPinIcon className="w-4 h-4 text-gray-400" />
                  {job.location}
                </div>
                {job.scheduledAt && (
                  <div className="flex items-center gap-1.5 font-medium text-indigo-600">
                    <ClockIcon className="w-4 h-4" />
                    {formatTime(job.scheduledAt)}
                  </div>
                )}
              </div>
            </div>

            {/* Offer Section for Clients */}
            {userRole === UserRole.CLIENT && job.status === JobStatus.PENDING && offers.length > 0 && (
              <div className="mb-8">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Pros who offered to help ({offers.length})</h3>
                <div className="space-y-3">
                  {offers.map(offer => {
                    const pro = providers.find(p => p.id === offer.providerId);
                    return (
                      <div key={offer.id} className="bg-indigo-50/50 border border-indigo-100 p-4 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center font-bold text-indigo-600 border border-indigo-100">
                            {pro?.name[0] || 'P'}
                          </div>
                          <div>
                            <div className="font-bold text-gray-900">{pro?.name || 'Handyman'}</div>
                            <div className="text-[10px] text-gray-500 font-bold uppercase tracking-tighter">⭐ {pro?.rating} • {pro?.jobsCompleted} Jobs</div>
                          </div>
                        </div>
                        <div className="flex-1 md:px-4">
                           <p className="text-xs text-gray-600 italic">"{offer.message}"</p>
                        </div>
                        <div className="flex items-center justify-between md:flex-col md:items-end gap-2">
                           <div className="text-lg font-black text-indigo-600">{offer.price}</div>
                           <button 
                             onClick={() => onAcceptOffer?.(job.id, offer)}
                             className="bg-black text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-gray-800 transition-colors"
                           >
                             Hire This Pro
                           </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="space-y-6">
              <section>
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Original Request</h3>
                <p className="text-gray-700 leading-relaxed bg-gray-50 p-4 rounded-xl border border-gray-100">
                  {job.description}
                </p>
              </section>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-100 bg-gray-50">
          <button 
            onClick={onClose}
            className="w-full py-3 bg-black text-white rounded-xl font-bold hover:bg-gray-800 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default JobDetailsModal;