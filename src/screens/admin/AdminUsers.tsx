import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/features/auth/AuthContext';

interface User {
  uid: string;
  email?: string;
  phone?: string;
  displayName: string;
  role: string;
  siteIds: string[];
  createdAt: string;
  lastLogin?: string;
  active: boolean;
}

export default function AdminUsers() {
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [showForm, setShowForm] = useState(false);

  const [newUser, setNewUser] = useState<Partial<User>>({
    role: 'foreman',
    active: true,
    siteIds: [],
  });

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    // Mock data - in real app: query Firestore /users collection
    const mockUsers: User[] = [
      {
        uid: 'user-1',
        email: 'foreman1@subcon.com',
        phone: '+852 9123 4567',
        displayName: 'Chan Tai Man',
        role: 'foreman',
        siteIds: ['site-1'],
        createdAt: '2026-03-01T00:00:00Z',
        lastLogin: '2026-04-12T08:00:00Z',
        active: true,
      },
      {
        uid: 'user-2',
        email: 'manager@chunwo.com',
        displayName: 'Lee Kwok Fai',
        role: 'manager',
        siteIds: ['site-1', 'site-2'],
        createdAt: '2026-02-15T00:00:00Z',
        lastLogin: '2026-04-12T09:30:00Z',
        active: true,
      },
      {
        uid: 'user-3',
        email: 'estimator@asiaalliedgroup.com',
        displayName: 'Wong Mei Ling',
        role: 'estimator',
        siteIds: ['site-1', 'site-2', 'site-3'],
        createdAt: '2026-02-20T00:00:00Z',
        lastLogin: '2026-04-11T17:00:00Z',
        active: true,
      },
      {
        uid: 'user-4',
        phone: '+852 6987 6543',
        displayName: 'Subcon Worker',
        role: 'subcontractor',
        siteIds: ['site-2'],
        createdAt: '2026-03-10T00:00:00Z',
        lastLogin: '2026-04-10T18:00:00Z',
        active: false,
      },
    ];
    setUsers(mockUsers);
    setLoading(false);
  };

  const handleCreateUser = async () => {
    // In real app: create user in Firebase Auth + Firestore
    alert('Create user functionality - integrates with Firebase Auth');
    setShowForm(false);
    setNewUser({ role: 'foreman', active: true, siteIds: [] });
  };

  const handleToggleActive = async (uid: string) => {
    const user = users.find((u) => u.uid === uid);
    if (!user) return;
    
    // In real app: update Firestore
    setUsers(users.map((u) =>
      u.uid === uid ? { ...u, active: !u.active } : u
    ));
  };

  const handleDeleteUser = async (uid: string) => {
    if (!confirm('Delete this user? This cannot be undone.')) return;
    // In real app: soft-delete in Firestore
    setUsers(users.filter((u) => u.uid !== uid));
  };

  const getRoleBadge = (role: string) => {
    const colors: Record<string, string> = {
      foreman: 'bg-blue-900/50 text-blue-400',
      subcontractor: 'bg-purple-900/50 text-purple-400',
      manager: 'bg-green-900/50 text-green-400',
      estimator: 'bg-yellow-900/50 text-yellow-400',
      superuser: 'bg-red-900/50 text-red-400',
    };
    return colors[role] || 'bg-gray-700';
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <header className="p-4 border-b border-gray-700 flex justify-between items-center">
        <h1 className="text-2xl font-bold">👥 User Management</h1>
        <div className="flex gap-2">
          <button onClick={() => navigate('/admin')} className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg">
            ← Admin
          </button>
          <button
            onClick={() => setShowForm(true)}
            className="px-4 py-2 bg-teal-600 hover:bg-teal-700 rounded-lg"
          >
            ➕ Add User
          </button>
        </div>
      </header>

      <main className="p-4 max-w-6xl mx-auto">
        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="p-4 bg-gray-800 rounded-xl text-center">
            <p className="text-3xl font-bold text-white">{users.length}</p>
            <p className="text-sm text-gray-400">Total Users</p>
          </div>
          <div className="p-4 bg-gray-800 rounded-xl text-center">
            <p className="text-3xl font-bold text-green-400">{users.filter((u) => u.active).length}</p>
            <p className="text-sm text-gray-400">Active</p>
          </div>
          <div className="p-4 bg-gray-800 rounded-xl text-center">
            <p className="text-3xl font-bold text-red-400">{users.filter((u) => !u.active).length}</p>
            <p className="text-sm text-gray-400">Inactive</p>
          </div>
          <div className="p-4 bg-gray-800 rounded-xl text-center">
            <p className="text-3xl font-bold text-teal-400">
              {users.filter((u) => u.lastLogin && new Date(u.lastLogin!).toDateString() === new Date().toDateString()).length}
            </p>
            <p className="text-sm text-gray-400">Online Today</p>
          </div>
        </div>

        {/* User Table */}
        {loading ? (
          <div className="text-center py-12 text-gray-400">Loading users...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="p-3 text-left">User</th>
                  <th className="p-3 text-left">Contact</th>
                  <th className="p-3 text-left">Role</th>
                  <th className="p-3 text-left">Sites</th>
                  <th className="p-3 text-left">Last Login</th>
                  <th className="p-3 text-center">Status</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.uid} className="border-b border-gray-800 hover:bg-gray-800/50">
                    <td className="p-3">
                      <p className="font-bold">{user.displayName}</p>
                      <p className="text-xs text-gray-500">Created: {new Date(user.createdAt).toLocaleDateString()}</p>
                    </td>
                    <td className="p-3">
                      {user.email && <p className="text-gray-300">{user.email}</p>}
                      {user.phone && <p className="text-gray-400 text-sm">{user.phone}</p>}
                    </td>
                    <td className="p-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${getRoleBadge(user.role)}`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="p-3">
                      <p className="text-xs">{user.siteIds.join(', ') || 'None'}</p>
                    </td>
                    <td className="p-3">
                      {user.lastLogin ? (
                        <p className="text-gray-300">
                          {new Date(user.lastLogin).toLocaleDateString('en-HK', { timeZone: 'Asia/Hong_Kong' })}
                        </p>
                      ) : (
                        <span className="text-gray-500">Never</span>
                      )}
                    </td>
                    <td className="p-3 text-center">
                      <button
                        onClick={() => handleToggleActive(user.uid)}
                        className={`px-3 py-1 rounded-full text-xs font-bold ${
                          user.active ? 'bg-green-900/50 text-green-400' : 'bg-red-900/50 text-red-400'
                        }`}
                      >
                        {user.active ? '✅ Active' : '❌ Inactive'}
                      </button>
                    </td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => handleDeleteUser(user.uid)}
                        className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded-lg text-xs"
                      >
                        🗑️ Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Add User Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
            <div className="bg-gray-800 rounded-xl p-6 max-w-md w-full">
              <h2 className="text-2xl font-bold mb-4">➕ Add New User</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Display Name</label>
                  <input
                    type="text"
                    value={newUser.displayName || ''}
                    onChange={(e) => setNewUser({ ...newUser, displayName: e.target.value })}
                    className="w-full p-3 bg-gray-700 rounded-lg"
                    placeholder="e.g., Chan Tai Man"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-2">Email (for corporate login)</label>
                  <input
                    type="email"
                    value={newUser.email || ''}
                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                    className="w-full p-3 bg-gray-700 rounded-lg"
                    placeholder="name@chunwo.com"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-2">Phone (for PIN login)</label>
                  <input
                    type="tel"
                    value={newUser.phone || ''}
                    onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
                    className="w-full p-3 bg-gray-700 rounded-lg"
                    placeholder="+852 9123 4567"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-2">Role</label>
                  <select
                    value={newUser.role}
                    onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                    className="w-full p-3 bg-gray-700 rounded-lg"
                  >
                    <option value="foreman">Foreman</option>
                    <option value="subcontractor">Subcontractor</option>
                    <option value="manager">Manager</option>
                    <option value="estimator">Estimator/QS</option>
                    <option value="superuser">Superuser (Admin)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-2">Assigned Sites</label>
                  <select
                    multiple
                    value={newUser.siteIds}
                    onChange={(e) => setNewUser({ ...newUser, siteIds: Array.from(e.target.selectedOptions, o => o.value) })}
                    className="w-full p-3 bg-gray-700 rounded-lg h-32"
                  >
                    <option value="site-1">Kai Tak Site A</option>
                    <option value="site-2">Tseung Kwan O Site B</option>
                    <option value="site-3">Lantau Site C</option>
                  </select>
                  <p className="text-xs text-gray-500 mt-1">Hold Ctrl/Cmd to select multiple</p>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowForm(false)}
                  className="flex-1 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateUser}
                  className="flex-1 py-3 bg-teal-600 hover:bg-teal-700 rounded-lg"
                >
                  Create User
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}