import React, { useState } from 'react';
import { Job, UserRole, Client, AiAnalysisResult, Offer } from '../types';
import JobCard from './JobCard';
import NewRequestModal from './NewRequestModal';
import { PlusIcon } from './Icons';

interface ClientViewProps {
  client: Client;
  jobs: Job[];
  offers: Offer[];
  onCreateJob: (description: string, analysis: AiAnalysisResult, scheduledAt?: number, image?: string) => void;
  onUpdateJob: (jobId: string, description: string, analysis: AiAnalysisResult, scheduledAt?: number, image?: string) => void;
  onJobAction: (jobId: string, action: 'cancel' | 'chat') => void;
  onViewJobDetail: (job: Job) => void;
}

const ClientView: React.FC<ClientViewProps> = ({ client, jobs, offers, onCreateJob, onUpdateJob, onJobAction, onViewJobDetail }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<Job | null>(null);

  const activeJobs = jobs.filter(j => j.status !== 'COMPLETED' && j.status !== 'CANCELLED');
  const pastJobs = jobs.filter(j => j.status === 'COMPLETED' || j.status === 'CANCELLED');

  const handleOpenNew = () => {
    setEditingJob(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (jobId: string) => {
    const job = jobs.find(j => j.id === jobId);
    if (job) {
      setEditingJob(job);
      setIsModalOpen(true);
    }
  };

  const handleSubmit = (desc: string, analysis: AiAnalysisResult, scheduledAt?: number, img?: string) => {
    if (editingJob) {
      onUpdateJob(editingJob.id, desc, analysis, scheduledAt, img);
    } else {
      onCreateJob(desc, analysis, scheduledAt, img);
    }
  };

  return (
    <div className="pb-20 overflow-y-auto h-full">
      <div className="bg-white p-6 border-b border-gray-100">
        <h1 className="text-2xl font-bold text-gray-900">Hello, {client.name.split(' ')[0]} 👋</h1>
        <p className="text-gray-500">Manage your home service requests.</p>
      </div>

      <div className="p-4 max-w-2xl mx-auto">
        <section className="mb-8">
          <h2 className="text-lg font-bold text-gray-800 mb-4">Active Requests</h2>
          {activeJobs.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-3xl border-2 border-dashed border-gray-100">
              <p className="text-gray-400">No active issues. Everything looks good!</p>
            </div>
          ) : (
            activeJobs.map(job => (
              <JobCard 
                key={job.id} 
                job={job} 
                userRole={UserRole.CLIENT} 
                offers={offers.filter(o => o.jobId === job.id)}
                onAction={(id, action) => {
                  if (action === 'edit') handleOpenEdit(id);
                  else if (action === 'cancel') onJobAction(id, 'cancel');
                  else if (action === 'chat') onJobAction(id, 'chat');
                }}
                onViewDetail={onViewJobDetail}
              />
            ))
          )}
        </section>

        {pastJobs.length > 0 && (
          <section>
            <h2 className="text-lg font-bold text-gray-800 mb-4">History</h2>
            <div className="opacity-75">
                {pastJobs.map(job => (
                <JobCard 
                    key={job.id} 
                    job={job} 
                    userRole={UserRole.CLIENT} 
                    onAction={() => {}} 
                    onViewDetail={onViewJobDetail}
                />
                ))}
            </div>
          </section>
        )}
      </div>

      <div className="fixed bottom-6 right-6 z-40">
        <button onClick={handleOpenNew} className="bg-black text-white w-14 h-14 rounded-full shadow-xl flex items-center justify-center hover:scale-105 transition-transform active:scale-95"><PlusIcon className="w-6 h-6" /></button>
      </div>

      <NewRequestModal isOpen={isModalOpen} onClose={() => { setIsModalOpen(false); setEditingJob(null); }} onSubmit={handleSubmit} editingJob={editingJob} />
    </div>
  );
};

export default ClientView;