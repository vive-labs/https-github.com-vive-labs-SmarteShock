import React, { useState, useEffect } from 'react';
import { Client, Job, JobStatus, Provider, TradeType, UrgencyLevel, UserRole, AiAnalysisResult, Offer, ChatMessage } from './types';
import ClientView from './components/ClientView';
import ProviderView from './components/ProviderView';
import AdminView from './components/AdminView';
import JobDetailsModal from './components/JobDetailsModal';
import ChatView from './components/ChatView';

// Mock Data Expansion
const MOCK_CLIENTS: Client[] = [
  { id: 'c1', name: 'Sarah Jenkins', address: '123 Maple Ave, Springfield' },
  { id: 'c2', name: 'Robert Miller', address: '45 Oak Lane, Springfield' }
];

const MOCK_PROVIDERS: Provider[] = [
  { id: 'p1', name: 'Mike Torque', trade: TradeType.PLUMBING, rating: 4.8, jobsCompleted: 142, isAvailable: true, avatarUrl: '' },
  { id: 'p2', name: 'Elena Watts', trade: TradeType.ELECTRICAL, rating: 4.9, jobsCompleted: 87, isAvailable: true, avatarUrl: '' },
  { id: 'p3', name: 'Tom Chill', trade: TradeType.HVAC, rating: 4.5, jobsCompleted: 210, isAvailable: true, avatarUrl: '' }
];

const INITIAL_JOBS: Job[] = [
  {
    id: 'j1',
    clientId: 'c1',
    description: 'Main circuit breaker keeps tripping when AC is on.',
    category: TradeType.ELECTRICAL,
    urgency: UrgencyLevel.HIGH,
    status: JobStatus.PENDING,
    createdAt: Date.now() - 3600000,
    scheduledAt: Date.now() + 86400000,
    location: '123 Maple Ave',
    priceEstimate: '$200 - $450',
    aiAnalysis: 'Electrical Panel Overload'
  },
  {
    id: 'j2',
    clientId: 'c2',
    description: 'Kitchen sink drain is completely clogged.',
    category: TradeType.PLUMBING,
    urgency: UrgencyLevel.NORMAL,
    status: JobStatus.PENDING,
    createdAt: Date.now() - 7200000,
    location: '45 Oak Lane',
    priceEstimate: '$100 - $200',
    aiAnalysis: 'Clogged Kitchen Drain'
  }
];

const App: React.FC = () => {
  const [currentUserRole, setCurrentUserRole] = useState<UserRole>(UserRole.CLIENT);
  const [jobs, setJobs] = useState<Job[]>(INITIAL_JOBS);
  const [providers, setProviders] = useState<Provider[]>(MOCK_PROVIDERS);
  const [clients, setClients] = useState<Client[]>(MOCK_CLIENTS);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [declinedJobIdsByPro, setDeclinedJobIdsByPro] = useState<Record<string, string[]>>({});
  
  // Detail Modal State
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // Chat State
  const [activeChatJobId, setActiveChatJobId] = useState<string | null>(null);

  const currentUserId = currentUserRole === UserRole.CLIENT ? clients[0].id : (currentUserRole === UserRole.PROVIDER ? providers[0].id : 'admin');

  const handleViewJobDetail = (job: Job) => {
    setSelectedJob(job);
    setIsDetailModalOpen(true);
  };

  const handleCloseDetailModal = () => {
    setIsDetailModalOpen(false);
    setSelectedJob(null);
  };

  const handleSendMessage = (jobId: string, text: string) => {
    const newMessage: ChatMessage = {
      id: `m${Date.now()}`,
      jobId,
      senderId: currentUserId,
      senderRole: currentUserRole,
      text,
      timestamp: Date.now()
    };
    setMessages(prev => [...prev, newMessage]);
  };

  // -- Actions --
  const handleCreateJob = (description: string, analysis: AiAnalysisResult, scheduledAt?: number, image?: string) => {
    const newJob: Job = {
      id: `j${Date.now()}`,
      clientId: clients[0].id,
      description,
      category: analysis.category,
      urgency: analysis.urgency,
      status: JobStatus.PENDING,
      createdAt: Date.now(),
      scheduledAt,
      location: clients[0].address,
      imagePreview: image,
      priceEstimate: analysis.estimatedPriceRange,
      aiAnalysis: analysis.summary
    };
    setJobs(prev => [newJob, ...prev]);
  };

  const handleUpdateJob = (jobId: string, description: string, analysis: AiAnalysisResult, scheduledAt?: number, image?: string) => {
    setJobs(prev => prev.map(j => j.id === jobId ? {
      ...j,
      description,
      category: analysis.category,
      urgency: analysis.urgency,
      scheduledAt,
      imagePreview: image,
      priceEstimate: analysis.estimatedPriceRange,
      aiAnalysis: analysis.summary
    } : j));
  };

  const handleProviderAvailabilityUpdate = (isAvailable: boolean) => {
    const proId = providers[0].id;
    setProviders(prev => prev.map(p => p.id === proId ? { ...p, isAvailable } : p));
  };

  const handleProviderAction = (jobId: string, action: 'offer' | 'decline' | 'complete' | 'chat') => {
    const proId = providers[0].id;
    if (action === 'decline') {
      setDeclinedJobIdsByPro(prev => ({
        ...prev,
        [proId]: [...(prev[proId] || []), jobId]
      }));
    } else if (action === 'offer') {
      const price = prompt("Enter your price estimate:", "$250");
      const message = prompt("Enter a message to the client:", "I can fix this today!");
      if (price && message) {
        const newOffer: Offer = {
          id: `o${Date.now()}`,
          jobId,
          providerId: proId,
          price,
          message,
          timestamp: Date.now()
        };
        setOffers(prev => [...prev, newOffer]);
      }
    } else if (action === 'chat') {
      setActiveChatJobId(jobId);
    } else if (action === 'complete') {
      setJobs(prev => prev.map(j => j.id === jobId ? { ...j, status: JobStatus.COMPLETED } : j));
    }
  };

  const handleAcceptOffer = (jobId: string, offer: Offer) => {
    setJobs(prev => prev.map(j => 
      j.id === jobId ? { ...j, status: JobStatus.MATCHED, providerId: offer.providerId, priceEstimate: offer.price } : j
    ));
    setOffers(prev => prev.filter(o => o.jobId !== jobId));
    setIsDetailModalOpen(false);
  };

  const handleAssignJob = (jobId: string, providerId: string) => {
    setJobs(prev => prev.map(j => 
        j.id === jobId ? { ...j, status: JobStatus.MATCHED, providerId } : j
    ));
    setOffers(prev => prev.filter(o => o.jobId !== jobId));
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      
      {/* Role Switcher */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur border-b border-gray-200 px-4 py-2 flex justify-between items-center shadow-sm h-14">
        <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center text-white font-bold text-lg">F</div>
            <span className="font-bold text-gray-900 tracking-tight">FixItNow</span>
        </div>
        <div className="flex bg-gray-100 rounded-lg p-1">
          <button onClick={() => setCurrentUserRole(UserRole.CLIENT)} className={`px-3 py-1.5 rounded-md text-[10px] font-bold transition-all ${currentUserRole === UserRole.CLIENT ? 'bg-white shadow text-black' : 'text-gray-500'}`}>Client</button>
          <button onClick={() => setCurrentUserRole(UserRole.PROVIDER)} className={`px-3 py-1.5 rounded-md text-[10px] font-bold transition-all ${currentUserRole === UserRole.PROVIDER ? 'bg-white shadow text-black' : 'text-gray-500'}`}>Pro</button>
          <button onClick={() => setCurrentUserRole(UserRole.ADMIN)} className={`px-3 py-1.5 rounded-md text-[10px] font-bold transition-all ${currentUserRole === UserRole.ADMIN ? 'bg-white shadow text-black' : 'text-gray-500'}`}>Admin</button>
        </div>
      </div>

      <main className="flex-1 mt-14 overflow-hidden flex flex-col h-[calc(100vh-3.5rem)]">
        {currentUserRole === UserRole.CLIENT && (
          <ClientView 
            client={clients[0]} 
            jobs={jobs.filter(j => j.clientId === clients[0].id)} 
            offers={offers}
            onCreateJob={handleCreateJob}
            onUpdateJob={handleUpdateJob} 
            onJobAction={(id, action) => {
              if (action === 'chat') setActiveChatJobId(id);
              else if (action === 'cancel') setJobs(prev => prev.map(j => j.id === id ? {...j, status: JobStatus.CANCELLED} : j));
            }}
            onViewJobDetail={handleViewJobDetail}
          />
        )}
        {currentUserRole === UserRole.PROVIDER && (
          <ProviderView 
            provider={providers[0]}
            jobs={jobs.filter(j => !(declinedJobIdsByPro[providers[0].id] || []).includes(j.id))}
            onJobAction={handleProviderAction}
            onViewJobDetail={handleViewJobDetail}
            onUpdateAvailability={handleProviderAvailabilityUpdate}
          />
        )}
        {currentUserRole === UserRole.ADMIN && (
          <AdminView 
            jobs={jobs}
            providers={providers}
            clients={clients}
            messages={messages}
            onAssignJob={handleAssignJob}
            onUpdateProvider={(p) => setProviders(prev => prev.map(x => x.id === p.id ? p : x))}
            onUpdateClient={(c) => setClients(prev => prev.map(x => x.id === c.id ? c : x))}
            onViewJobDetail={handleViewJobDetail}
            onViewConversation={(jobId) => setActiveChatJobId(jobId)}
          />
        )}
      </main>

      <JobDetailsModal 
        isOpen={isDetailModalOpen} 
        job={selectedJob} 
        onClose={handleCloseDetailModal} 
        offers={offers.filter(o => o.jobId === selectedJob?.id)}
        providers={providers}
        userRole={currentUserRole}
        onAcceptOffer={handleAcceptOffer}
      />

      {activeChatJobId && (
        <ChatView 
          job={jobs.find(j => j.id === activeChatJobId)!}
          messages={messages.filter(m => m.jobId === activeChatJobId)}
          currentUserRole={currentUserRole}
          currentUserId={currentUserId}
          isAdmin={currentUserRole === UserRole.ADMIN}
          onSendMessage={(text) => handleSendMessage(activeChatJobId, text)}
          onClose={() => setActiveChatJobId(null)}
        />
      )}

    </div>
  );
};

export default App;