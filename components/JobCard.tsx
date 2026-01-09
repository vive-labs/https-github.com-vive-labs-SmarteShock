import React from 'react';
import { Job, JobStatus, UrgencyLevel, UserRole, Offer } from '../types';
import { MapPinIcon, ClockIcon, CheckCircleIcon, MessageSquareIcon } from './Icons';

interface JobCardProps {
  job: Job;
  userRole: UserRole;
  offers?: Offer[];
  onAction: (jobId: string, action: 'accept' | 'complete' | 'cancel' | 'edit' | 'offer' | 'decline' | 'chat') => void;
  onViewDetail?: (job: Job) => void;
}

const JobCard: React.FC<JobCardProps> = ({ job, userRole, offers = [], onAction, onViewDetail }) => {
  const getUrgencyColor = (urgency: UrgencyLevel) => {
    switch (urgency) {
      case UrgencyLevel.EMERGENCY: return 'bg-red-100 text-red-700 border-red-200';
      case UrgencyLevel.HIGH: return 'bg-orange-100 text-orange-700 border-orange-200';
      default: return 'bg-blue-50 text-blue-700 border-blue-200';
    }
  };

  const getStatusColor = (status: JobStatus) => {
    switch (status) {
      case JobStatus.PENDING: return 'bg-yellow-50 text-yellow-600';
      case JobStatus.MATCHED: return 'bg-indigo-50 text-indigo-600';
      case JobStatus.IN_PROGRESS: return 'bg-blue-50 text-blue-600 animate-pulse';
      case JobStatus.COMPLETED: return 'bg-green-50 text-green-600';
      default: return 'bg-gray-100 text-gray-500';
    }
  };

  const formatScheduledTime = (timestamp: number) => {
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric'
    }).format(new Date(timestamp));
  };

  return (
    <div 
      className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 mb-4 hover:shadow-md transition-shadow cursor-pointer relative group"
      onClick={() => onViewDetail && onViewDetail(job)}
    >
      <div className="flex justify-between items-start mb-3">
        <div className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${getUrgencyColor(job.urgency)}`}>
          {job.urgency}
        </div>
        <div className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${getStatusColor(job.status)}`}>
          {job.status.replace('_', ' ')}
        </div>
      </div>

      <div className="flex gap-4">
        {job.imagePreview && (
          <div className="flex-shrink-0 w-20 h-20 bg-gray-100 rounded-lg overflow-hidden border border-gray-100">
            <img src={job.imagePreview} alt="Issue" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-bold text-gray-900 mb-1 truncate">{job.aiAnalysis || job.description}</h3>
          <p className="text-sm text-gray-500 mb-2 line-clamp-2">{job.description}</p>
          
          <div className="space-y-1.5 mb-3">
             <div className="flex items-center gap-1.5 text-xs text-gray-500">
               <MapPinIcon className="w-3.5 h-3.5" />
               <span className="truncate">{job.location}</span>
             </div>
             {job.scheduledAt && (
               <div className="flex items-center gap-1.5 text-xs text-indigo-600 font-medium">
                 <ClockIcon className="w-3.5 h-3.5" />
                 Scheduled: {formatScheduledTime(job.scheduledAt)}
               </div>
             )}
             {userRole === UserRole.CLIENT && job.status === JobStatus.PENDING && offers.length > 0 && (
               <div className="bg-indigo-50 text-indigo-700 px-2 py-1 rounded-md text-[10px] font-bold inline-flex items-center gap-1">
                 <CheckCircleIcon className="w-3 h-3" />
                 {offers.length} Offer{offers.length !== 1 ? 's' : ''} received
               </div>
             )}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2 mt-2" onClick={(e) => e.stopPropagation()}>
        {userRole === UserRole.PROVIDER && job.status === JobStatus.PENDING && (
          <>
            <button 
              onClick={() => onAction(job.id, 'offer')}
              className="flex-1 bg-black text-white py-2 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
            >
              Send Offer
            </button>
            <button 
              onClick={() => onAction(job.id, 'decline')}
              className="px-4 border border-gray-200 text-gray-400 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
            >
              Decline
            </button>
          </>
        )}
        
        {(job.status === JobStatus.IN_PROGRESS || job.status === JobStatus.MATCHED) && (
          <button 
            onClick={() => onAction(job.id, 'chat')}
            className="flex-1 border-2 border-indigo-600 text-indigo-600 py-2 rounded-lg text-sm font-bold hover:bg-indigo-50 transition-colors flex items-center justify-center gap-2"
          >
            <MessageSquareIcon className="w-4 h-4" />
            Open Chat
          </button>
        )}

        {userRole === UserRole.PROVIDER && job.status === JobStatus.IN_PROGRESS && (
          <button 
            onClick={() => onAction(job.id, 'complete')}
            className="flex-1 bg-green-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
          >
            Finish Work
          </button>
        )}
      </div>
    </div>
  );
};

export default JobCard;