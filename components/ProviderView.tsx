import React, { useState } from 'react';
import { Job, UserRole, Provider, JobStatus } from '../types';
import JobCard from './JobCard';

interface ProviderViewProps {
  provider: Provider;
  jobs: Job[];
  onJobAction: (jobId: string, action: 'offer' | 'decline' | 'complete' | 'chat') => void;
  onViewJobDetail: (job: Job) => void;
  onUpdateAvailability: (isAvailable: boolean) => void;
}

const ProviderView: React.FC<ProviderViewProps> = ({ provider, jobs, onJobAction, onViewJobDetail, onUpdateAvailability }) => {
  const [tab, setTab] = useState<'feed' | 'my-jobs'>('feed');

  const myActiveJobs = jobs.filter(j => j.providerId === provider.id && (j.status === JobStatus.IN_PROGRESS || j.status === JobStatus.MATCHED));
  const myCompletedJobs = jobs.filter(j => j.providerId === provider.id && j.status === JobStatus.COMPLETED);
  
  const jobFeed = jobs.filter(j => 
    j.status === JobStatus.PENDING && 
    (j.category === provider.trade || j.category === 'GENERAL' || j.category === 'OTHER')
  );

  return (
    <div className="pb-20 overflow-y-auto h-full">
      <div className="bg-gray-900 text-white p-6 pb-12">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center text-2xl shadow-inner border border-white/10">👨‍🔧</div>
              <div>
                  <h1 className="text-xl font-black tracking-tight">{provider.name}</h1>
                  <p className="text-gray-400 text-sm font-medium">{provider.trade} Specialist • ⭐ {provider.rating}</p>
              </div>
          </div>
          
          {/* Availability Toggle */}
          <div className="flex items-center gap-3 bg-white/5 p-3 rounded-2xl border border-white/10 self-start md:self-center">
            <span className={`text-[10px] font-black uppercase tracking-widest ${provider.isAvailable ? 'text-green-400' : 'text-gray-500'}`}>
              {provider.isAvailable ? 'Accepting Jobs' : 'Offline'}
            </span>
            <button 
              onClick={() => onUpdateAvailability(!provider.isAvailable)}
              className={`relative w-12 h-6 rounded-full transition-colors duration-200 outline-none ring-offset-2 ring-offset-gray-900 focus:ring-2 focus:ring-indigo-500 ${provider.isAvailable ? 'bg-green-500' : 'bg-gray-600'}`}
              aria-pressed={provider.isAvailable}
              aria-label="Toggle availability"
            >
              <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform duration-200 shadow-sm ${provider.isAvailable ? 'translate-x-6' : 'translate-x-0'}`} />
            </button>
          </div>
        </div>
      </div>

      <div className="px-4 -mt-8 mb-6">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-5 flex justify-around">
            <div className="text-center group">
                <div className="text-2xl font-black text-gray-900 group-hover:scale-110 transition-transform">{myCompletedJobs.length}</div>
                <div className="text-[10px] text-gray-400 uppercase font-black tracking-widest mt-1">Done</div>
            </div>
            <div className="w-px bg-gray-100"></div>
            <div className="text-center group">
                <div className="text-2xl font-black text-indigo-600 group-hover:scale-110 transition-transform">{myActiveJobs.length}</div>
                <div className="text-[10px] text-gray-400 uppercase font-black tracking-widest mt-1">Active</div>
            </div>
        </div>
      </div>

      <div className="px-4 mb-4">
          <div className="flex bg-gray-100 p-1.5 rounded-2xl max-w-md mx-auto">
              <button 
                onClick={() => setTab('feed')} 
                className={`flex-1 py-2.5 text-xs font-black uppercase tracking-wider rounded-xl transition-all ${tab === 'feed' ? 'bg-white shadow-md text-gray-900' : 'text-gray-400 hover:text-gray-600'}`}
              >
                Marketplace ({jobFeed.length})
              </button>
              <button 
                onClick={() => setTab('my-jobs')} 
                className={`flex-1 py-2.5 text-xs font-black uppercase tracking-wider rounded-xl transition-all ${tab === 'my-jobs' ? 'bg-white shadow-md text-gray-900' : 'text-gray-400 hover:text-gray-600'}`}
              >
                My Schedule
              </button>
          </div>
      </div>

      <div className="p-4 max-w-2xl mx-auto">
        {!provider.isAvailable && tab === 'feed' && (
          <div className="text-center py-16 px-6 bg-orange-50 rounded-3xl border-2 border-dashed border-orange-100 mb-6">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
              <span className="text-2xl">💤</span>
            </div>
            <h3 className="text-lg font-bold text-orange-900">You are currently offline</h3>
            <p className="text-sm text-orange-700/70 mt-2 max-w-xs mx-auto">Toggle your status in the header to start seeing and accepting new service requests in your area.</p>
          </div>
        )}

        {tab === 'feed' ? (
            <div className={`space-y-4 transition-opacity duration-300 ${!provider.isAvailable ? 'opacity-40 pointer-events-none grayscale' : ''}`}>
                {jobFeed.length === 0 ? (
                     <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-gray-100">
                        <p className="text-gray-400 font-medium">No new requests match your profile right now.</p>
                     </div>
                ) : (
                    jobFeed.map(job => (
                        <JobCard 
                            key={job.id} 
                            job={job} 
                            userRole={UserRole.PROVIDER} 
                            onAction={onJobAction} 
                            onViewDetail={onViewJobDetail}
                        />
                    ))
                )}
            </div>
        ) : (
            <div className="space-y-4">
                 {myActiveJobs.length === 0 && (
                     <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-gray-100">
                        <p className="text-gray-400 font-medium">Your schedule is currently clear.</p>
                     </div>
                 )}
                 {myActiveJobs.map(job => (
                    <JobCard 
                        key={job.id} 
                        job={job} 
                        userRole={UserRole.PROVIDER} 
                        onAction={onJobAction} 
                        onViewDetail={onViewJobDetail}
                    />
                ))}
            </div>
        )}
      </div>
    </div>
  );
};

export default ProviderView;