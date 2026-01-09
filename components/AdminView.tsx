import React, { useState } from 'react';
import { Job, Provider, Client, JobStatus, TradeType, UserRole, ChatMessage } from '../types';
import { UsersIcon, UserIcon, BriefcaseIcon, MapPinIcon, ClockIcon, WrenchIcon, SparklesIcon, MessageSquareIcon, EditIcon, SaveIcon } from './Icons';

interface AdminViewProps {
  jobs: Job[];
  providers: Provider[];
  clients: Client[];
  messages: ChatMessage[];
  onAssignJob: (jobId: string, providerId: string) => void;
  onUpdateProvider: (provider: Provider) => void;
  onUpdateClient: (client: Client) => void;
  onViewJobDetail: (job: Job) => void;
  onViewConversation: (jobId: string) => void;
}

const AdminView: React.FC<AdminViewProps> = ({ 
  jobs, 
  providers, 
  clients, 
  messages,
  onAssignJob, 
  onUpdateProvider, 
  onUpdateClient, 
  onViewJobDetail,
  onViewConversation
}) => {
  const [activeTab, setActiveTab] = useState<'jobs' | 'pros' | 'clients' | 'chats'>('jobs');
  const [assigningJobId, setAssigningJobId] = useState<string | null>(null);
  const [editingClient, setEditingClient] = useState<Client | null>(null);

  const getStatusColor = (status: JobStatus) => {
    switch (status) {
      case JobStatus.PENDING: return 'bg-yellow-100 text-yellow-700';
      case JobStatus.MATCHED: return 'bg-indigo-100 text-indigo-700';
      case JobStatus.IN_PROGRESS: return 'bg-blue-100 text-blue-700';
      case JobStatus.COMPLETED: return 'bg-green-100 text-green-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const activeConversations = jobs.filter(j => messages.some(m => m.jobId === j.id));

  const handleSaveClient = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingClient) {
      onUpdateClient(editingClient);
      setEditingClient(null);
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Admin Nav */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between overflow-x-auto">
        <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2 flex-shrink-0 mr-4">
           <SparklesIcon className="w-5 h-5 text-indigo-600" />
           Admin Dashboard
        </h1>
        <div className="flex bg-gray-100 rounded-lg p-1 flex-shrink-0">
          <button 
            onClick={() => setActiveTab('jobs')}
            className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-2 ${activeTab === 'jobs' ? 'bg-white shadow text-indigo-600' : 'text-gray-500'}`}
          >
            <BriefcaseIcon className="w-4 h-4" /> Jobs
          </button>
          <button 
            onClick={() => setActiveTab('pros')}
            className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-2 ${activeTab === 'pros' ? 'bg-white shadow text-indigo-600' : 'text-gray-500'}`}
          >
            <UsersIcon className="w-4 h-4" /> Pros
          </button>
          <button 
            onClick={() => setActiveTab('clients')}
            className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-2 ${activeTab === 'clients' ? 'bg-white shadow text-indigo-600' : 'text-gray-500'}`}
          >
            <UserIcon className="w-4 h-4" /> Clients
          </button>
          <button 
            onClick={() => setActiveTab('chats')}
            className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-2 ${activeTab === 'chats' ? 'bg-white shadow text-indigo-600' : 'text-gray-500'}`}
          >
            <MessageSquareIcon className="w-4 h-4" /> Chats
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-6">
        {activeTab === 'jobs' && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold mb-4">All Service Requests</h2>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden overflow-x-auto">
              <table className="w-full text-left text-sm min-w-[600px]">
                <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 uppercase font-bold text-[10px] tracking-wider">
                  <tr>
                    <th className="px-6 py-3">Issue</th>
                    <th className="px-6 py-3">Category</th>
                    <th className="px-6 py-3">Status</th>
                    <th className="px-6 py-3">Pro Assigned</th>
                    <th className="px-6 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {jobs.map(job => {
                    const assignedPro = providers.find(p => p.id === job.providerId);
                    return (
                      <tr 
                        key={job.id} 
                        className="hover:bg-gray-50 cursor-pointer"
                        onClick={() => onViewJobDetail(job)}
                      >
                        <td className="px-6 py-4">
                          <div className="font-medium text-gray-900">{job.aiAnalysis || job.description}</div>
                          <div className="text-gray-500 text-[10px] truncate max-w-xs">{job.location}</div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="bg-gray-100 px-2 py-1 rounded text-[10px] font-bold uppercase">{job.category}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${getStatusColor(job.status)}`}>
                            {job.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-gray-600">
                          {assignedPro ? assignedPro.name : <span className="text-gray-400 italic">Unassigned</span>}
                        </td>
                        <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                          {(job.status === JobStatus.PENDING || job.status === JobStatus.MATCHED) && (
                            <button 
                              onClick={() => setAssigningJobId(assigningJobId === job.id ? null : job.id)}
                              className="text-indigo-600 font-bold hover:underline"
                            >
                              {assigningJobId === job.id ? 'Cancel' : 'Direct to Pro'}
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'chats' && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold mb-4">Active Conversations Monitor</h2>
            {activeConversations.length === 0 ? (
              <div className="bg-white p-12 rounded-2xl text-center border-2 border-dashed border-gray-200">
                <MessageSquareIcon className="w-12 h-12 text-gray-200 mx-auto mb-4" />
                <p className="text-gray-400">No active conversations found.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {activeConversations.map(job => {
                  const client = clients.find(c => c.id === job.clientId);
                  const provider = providers.find(p => p.id === job.providerId);
                  const lastMsg = messages.filter(m => m.jobId === job.id).slice(-1)[0];
                  
                  return (
                    <button 
                      key={job.id}
                      onClick={() => onViewConversation(job.id)}
                      className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 hover:border-indigo-500 transition-all text-left flex items-start gap-4"
                    >
                      <div className="w-12 h-12 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-600 font-bold flex-shrink-0">
                        {job.aiAnalysis?.[0] || 'J'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-gray-900 truncate mb-1">{job.aiAnalysis || 'Maintenance Job'}</div>
                        <div className="text-[10px] text-indigo-600 font-bold uppercase mb-2">
                          {client?.name} ↔️ {provider?.name || 'Handyman'}
                        </div>
                        {lastMsg && (
                          <div className="text-xs text-gray-500 line-clamp-1 italic">
                            Last: "{lastMsg.text}"
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {activeTab === 'pros' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {providers.map(pro => (
              <div key={pro.id} className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 group relative">
                <div className="flex justify-between items-start mb-4">
                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-xl">👤</div>
                    <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${pro.isAvailable ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'}`}>
                        {pro.isAvailable ? 'Available' : 'Busy'}
                    </span>
                </div>
                <input 
                    type="text" 
                    defaultValue={pro.name}
                    onBlur={(e) => onUpdateProvider({...pro, name: e.target.value})}
                    className="text-lg font-bold text-gray-900 block w-full border-b border-transparent focus:border-indigo-500 outline-none mb-1"
                />
                <select 
                    defaultValue={pro.trade}
                    onChange={(e) => onUpdateProvider({...pro, trade: e.target.value as TradeType})}
                    className="text-sm text-gray-500 block w-full bg-transparent outline-none mb-3"
                >
                    {Object.values(TradeType).map(t => <option key={t} value={t}>{t}</option>)}
                </select>
                <div className="flex justify-between text-xs text-gray-400 border-t pt-3">
                    <span>Jobs: {pro.jobsCompleted}</span>
                    <span>Rating: ⭐ {pro.rating}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'clients' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {clients.map(client => (
              <div key={client.id} className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 relative group transition-all hover:shadow-md">
                <div className="flex items-center gap-4 mb-4">
                    <div className="w-10 h-10 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-600 font-bold">
                        {client.name[0]}
                    </div>
                    <div className="flex-1">
                        <div className="font-bold text-gray-900">{client.name}</div>
                    </div>
                    <button 
                        onClick={() => setEditingClient(client)}
                        className="text-gray-400 hover:text-indigo-600 p-2 rounded-full hover:bg-gray-100 transition-colors"
                    >
                        <EditIcon className="w-4 h-4" />
                    </button>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                    <MapPinIcon className="w-3.5 h-3.5 flex-shrink-0" />
                    <span className="truncate">{client.address}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Edit Client Modal */}
      {editingClient && (
        <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-in slide-in-from-bottom-4 duration-300">
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">Edit Client Details</h2>
              <button onClick={() => setEditingClient(null)} className="text-gray-400 hover:text-gray-600 p-2">
                <span className="text-2xl leading-none">&times;</span>
              </button>
            </div>
            
            <form onSubmit={handleSaveClient} className="p-6 space-y-4">
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1.5">Full Name</label>
                <input 
                  type="text" 
                  value={editingClient.name}
                  onChange={(e) => setEditingClient({...editingClient, name: e.target.value})}
                  className="w-full p-3 bg-gray-100 border-2 border-transparent focus:border-indigo-500 rounded-xl outline-none font-bold text-gray-800 transition-all"
                  required
                />
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1.5">Service Address</label>
                <div className="relative">
                  <MapPinIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input 
                    type="text" 
                    value={editingClient.address}
                    onChange={(e) => setEditingClient({...editingClient, address: e.target.value})}
                    className="w-full p-3 pl-10 bg-gray-100 border-2 border-transparent focus:border-indigo-500 rounded-xl outline-none text-sm text-gray-800 transition-all"
                    required
                  />
                </div>
              </div>
              
              <div className="pt-4 flex gap-3">
                <button 
                  type="button"
                  onClick={() => setEditingClient(null)}
                  className="flex-1 py-3 border-2 border-gray-100 text-gray-500 rounded-xl font-bold hover:bg-gray-50 transition-all"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all flex items-center justify-center gap-2"
                >
                  <SaveIcon className="w-4 h-4" />
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminView;