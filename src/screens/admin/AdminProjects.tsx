import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/features/auth/AuthContext';

interface Project {
  id: string;
  name: string;
  nameZh: string;
  address?: string;
  startDate: string;
  endDate?: string;
  status: 'active' | 'completed' | 'onhold';
  sites: Site[];
}

interface Site {
  id: string;
  name: string;
  nameZh: string;
  active: boolean;
}

export default function AdminProjects() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    setLoading(true);
    // Mock data - in real app: query Firestore /projects collection
    const mockProjects: Project[] = [
      {
        id: 'proj-1',
        name: 'Kai Tak Development',
        nameZh: '啟德發展計劃',
        address: 'Kai Tak, Kowloon City',
        startDate: '2025-01-01',
        status: 'active',
        sites: [
          { id: 'site-1', name: 'Site A', nameZh: 'A 工地', active: true },
          { id: 'site-2', name: 'Site B', nameZh: 'B 工地', active: true },
        ],
      },
      {
        id: 'proj-2',
        name: 'Lantau Tomorrow Vision',
        nameZh: '明日大嶼願景',
        address: 'Lantau Island',
        startDate: '2025-06-01',
        status: 'active',
        sites: [
          { id: 'site-3', name: 'Reclamation Area C', nameZh: '填海區 C', active: true },
        ],
      },
      {
        id: 'proj-3',
        name: 'Tseung Kwan O Extension',
        nameZh: '將軍澳延伸',
        address: 'Tseung Kwan O, Sai Kung',
        startDate: '2024-03-01',
        endDate: '2026-02-28',
        status: 'completed',
        sites: [
          { id: 'site-4', name: 'Lot 5', nameZh: '地段 5', active: false },
        ],
      },
    ];
    setProjects(mockProjects);
    setLoading(false);
  };

  const handleToggleSite = async (projectId: string, siteId: string) => {
    // In real app: update Firestore
    setProjects(projects.map((p) =>
      p.id === projectId
        ? { ...p, sites: p.sites.map((s) => s.id === siteId ? { ...s, active: !s.active } : s) }
        : p
    ));
  };

  const getStatusBadge = (status: string) => {
    const badges: Record<string, string> = {
      active: 'bg-green-900/50 text-green-400',
      completed: 'bg-blue-900/50 text-blue-400',
      onhold: 'bg-yellow-900/50 text-yellow-400',
    };
    return badges[status] || 'bg-gray-700';
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <header className="p-4 border-b border-gray-700 flex justify-between items-center">
        <h1 className="text-2xl font-bold">🏢 Projects & Sites</h1>
        <div className="flex gap-2">
          <button onClick={() => navigate('/admin')} className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg">
            ← Admin
          </button>
          <button
            onClick={() => setShowForm(true)}
            className="px-4 py-2 bg-teal-600 hover:bg-teal-700 rounded-lg"
          >
            ➕ Add Project
          </button>
        </div>
      </header>

      <main className="p-4 max-w-6xl mx-auto">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="p-4 bg-gray-800 rounded-xl text-center">
            <p className="text-3xl font-bold text-white">{projects.length}</p>
            <p className="text-sm text-gray-400">Total Projects</p>
          </div>
          <div className="p-4 bg-gray-800 rounded-xl text-center">
            <p className="text-3xl font-bold text-green-400">
              {projects.filter((p) => p.status === 'active').length}
            </p>
            <p className="text-sm text-gray-400">Active</p>
          </div>
          <div className="p-4 bg-gray-800 rounded-xl text-center">
            <p className="text-3xl font-bold text-teal-400">
              {projects.reduce((sum, p) => sum + p.sites.filter((s) => s.active).length, 0)}
            </p>
            <p className="text-sm text-gray-400">Active Sites</p>
          </div>
        </div>

        {/* Projects List */}
        {loading ? (
          <div className="text-center py-12 text-gray-400">Loading projects...</div>
        ) : (
          <div className="space-y-6">
            {projects.map((project) => (
              <div key={project.id} className="p-6 bg-gray-800 rounded-xl border border-gray-700">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h2 className="text-2xl font-bold">{project.name}</h2>
                    <p className="text-gray-400">{project.nameZh}</p>
                    {project.address && (
                      <p className="text-sm text-gray-500 mt-1">📍 {project.address}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-4 py-2 rounded-full text-sm font-bold ${getStatusBadge(project.status)}`}>
                      {project.status.toUpperCase()}
                    </span>
                    <button
                      onClick={() => {/* Edit project */}}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg"
                    >
                      ✏️ Edit
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-400">Start Date</p>
                    <p className="text-lg">{new Date(project.startDate).toLocaleDateString('en-HK', { timeZone: 'Asia/Hong_Kong' })}</p>
                  </div>
                  {project.endDate && (
                    <div>
                      <p className="text-sm text-gray-400">End Date</p>
                      <p className="text-lg">{new Date(project.endDate).toLocaleDateString('en-HK', { timeZone: 'Asia/Hong_Kong' })}</p>
                    </div>
                  )}
                </div>

                {/* Sites */}
                <div>
                  <h3 className="text-lg font-bold mb-3">🏗️ Sites ({project.sites.length})</h3>
                  <div className="grid md:grid-cols-2 gap-3">
                    {project.sites.map((site) => (
                      <div
                        key={site.id}
                        className={`p-4 rounded-lg border ${
                          site.active ? 'bg-gray-700 border-gray-600' : 'bg-red-900/20 border-red-700 opacity-60'
                        }`}
                      >
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="font-bold">{site.name}</p>
                            <p className="text-gray-400 text-sm">{site.nameZh}</p>
                          </div>
                          <button
                            onClick={() => handleToggleSite(project.id, site.id)}
                            className={`px-3 py-1 rounded-full text-xs font-bold ${
                              site.active ? 'bg-green-900/50 text-green-400' : 'bg-red-900/50 text-red-400'
                            }`}
                          >
                            {site.active ? '✅ Active' : '❌ Inactive'}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Add Project Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
            <div className="bg-gray-800 rounded-xl p-6 max-w-md w-full">
              <h2 className="text-2xl font-bold mb-4">➕ Add New Project</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Project Name (English)</label>
                  <input type="text" className="w-full p-3 bg-gray-700 rounded-lg" placeholder="e.g., Kai Tak Development" />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Project Name (中文)</label>
                  <input type="text" className="w-full p-3 bg-gray-700 rounded-lg" placeholder="e.g., 啟德發展計劃" />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Address</label>
                  <input type="text" className="w-full p-3 bg-gray-700 rounded-lg" placeholder="e.g., Kai Tak, Kowloon City" />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Start Date</label>
                  <input type="date" className="w-full p-3 bg-gray-700 rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Status</label>
                  <select className="w-full p-3 bg-gray-700 rounded-lg">
                    <option value="active">Active</option>
                    <option value="completed">Completed</option>
                    <option value="onhold">On Hold</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button onClick={() => setShowForm(false)} className="flex-1 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg">
                  Cancel
                </button>
                <button onClick={() => { setShowForm(false); alert('Create project in Firestore'); }} className="flex-1 py-3 bg-teal-600 hover:bg-teal-700 rounded-lg">
                  Create Project
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}