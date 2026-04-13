import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/features/auth/AuthContext';
import { useTrades } from '@/hooks/useTrades';
import { useConstraints } from '@/hooks/useConstraints';
import { useWeatherOptions } from '@/hooks/useWeatherOptions';
import { useLaborRoles } from '@/hooks/useLaborRoles';

interface ReferenceItem {
  id: string;
  nameEn: string;
  nameZh: string;
  category?: string;
  active: boolean;
  type: 'trade' | 'constraint' | 'weather' | 'labor';
}

export default function AdminReference() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'trades' | 'constraints' | 'weather' | 'labor'>('trades');
  const [editingItem, setEditingItem] = useState<ReferenceItem | null>(null);
  const [showForm, setShowForm] = useState(false);

  const { trades } = useTrades();
  const { constraints } = useConstraints();
  const { weatherOptions } = useWeatherOptions();
  const { laborRoles } = useLaborRoles();

  const getItems = () => {
    switch (activeTab) {
      case 'trades':
        return trades.map((t) => ({ ...t, type: 'trade' as const }));
      case 'constraints':
        return constraints.map((c) => ({ ...c, type: 'constraint' as const }));
      case 'weather':
        return weatherOptions.map((w) => ({ ...w, type: 'weather' as const }));
      case 'labor':
        return laborRoles.map((r) => ({ ...r, type: 'labor' as const }));
    }
  };

  const items = getItems();
  const activeCount = items.filter((i) => i.active).length;
  const inactiveCount = items.filter((i) => !i.active).length;

  const handleToggleActive = (item: ReferenceItem) => {
    // In real app: update Firestore
    alert(`Toggle ${item.nameEn} ${item.active ? 'inactive' : 'active'} - Firestore update`);
  };

  const handleDelete = (item: ReferenceItem) => {
    if (!confirm(`Delete "${item.nameEn}"? Historical reports will still reference this ID.`)) return;
    // In real app: soft-delete in Firestore
    alert('Delete functionality - soft delete in Firestore');
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <header className="p-4 border-b border-gray-700 flex justify-between items-center">
        <h1 className="text-2xl font-bold">📚 Reference Data Management</h1>
        <button onClick={() => navigate('/admin')} className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg">
          ← Admin
        </button>
      </header>

      <main className="p-4 max-w-6xl mx-auto">
        {/* Info Box */}
        <div className="mb-6 p-4 bg-blue-900/30 border border-blue-600 rounded-xl">
          <h3 className="text-lg font-bold text-blue-300 mb-2">💡 Reference Data</h3>
          <p className="text-blue-200 text-sm">
            Manage trades, constraints, weather options, and labor roles. 
            Changes apply immediately to all users. Historical reports store IDs (not names), 
            so renaming won't break historical data.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto">
          {(['trades', 'constraints', 'weather', 'labor'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg capitalize whitespace-nowrap ${
                activeTab === tab ? 'bg-teal-600' : 'bg-gray-700 hover:bg-gray-600'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="p-4 bg-gray-800 rounded-xl text-center">
            <p className="text-3xl font-bold text-white">{items.length}</p>
            <p className="text-sm text-gray-400">Total {activeTab}</p>
          </div>
          <div className="p-4 bg-gray-800 rounded-xl text-center">
            <p className="text-3xl font-bold text-green-400">{activeCount}</p>
            <p className="text-sm text-gray-400">Active</p>
          </div>
          <div className="p-4 bg-gray-800 rounded-xl text-center">
            <p className="text-3xl font-bold text-red-400">{inactiveCount}</p>
            <p className="text-sm text-gray-400">Inactive</p>
          </div>
        </div>

        {/* Add Button */}
        <button
          onClick={() => setShowForm(true)}
          className="mb-4 px-4 py-2 bg-teal-600 hover:bg-teal-700 rounded-lg"
        >
          ➕ Add {activeTab.slice(0, -1).toUpperCase()}
        </button>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="p-3 text-left">
                  {activeTab === 'trades' ? 'Trade Name (EN / 中文)' :
                   activeTab === 'constraints' ? 'Constraint Name (EN / 中文)' :
                   activeTab === 'weather' ? 'Weather' :
                   'Role Name (EN / 中文)'}
                </th>
                {activeTab === 'trades' && <th className="p-3 text-left">Standard Unit</th>}
                {activeTab === 'constraints' && <th className="p-3 text-left">Category</th>}
                {activeTab === 'weather' && <th className="p-3 text-left">Icon</th>}
                {activeTab === 'labor' && (
                  <>
                    <th className="p-3 text-left">Category</th>
                    <th className="p-3 text-right">Default Rate</th>
                  </>
                )}
                <th className="p-3 text-center">Status</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id} className="border-b border-gray-800 hover:bg-gray-800/50">
                  <td className="p-3">
                    <p className="font-bold">{item.nameEn}</p>
                    <p className="text-gray-400 text-sm">{item.nameZh}</p>
                  </td>
                  {activeTab === 'trades' && (
                    <td className="p-3">
                      <span className="px-2 py-1 bg-teal-900/50 text-teal-400 rounded text-xs">
                        {(item as any).standardUnit}
                      </span>
                    </td>
                  )}
                  {activeTab === 'constraints' && (
                    <td className="p-3 text-gray-400">{item.category}</td>
                  )}
                  {activeTab === 'weather' && (
                    <td className="p-3 text-2xl">{(item as any).icon || '🌤️'}</td>
                  )}
                  {activeTab === 'labor' && (
                    <>
                      <td className="p-3 text-gray-400">{item.category}</td>
                      <td className="p-3 text-right">
                        {(item as any).defaultRate ? `$${(item as any).defaultRate}/day` : '—'}
                      </td>
                    </>
                  )}
                  <td className="p-3 text-center">
                    <button
                      onClick={() => handleToggleActive(item)}
                      className={`px-3 py-1 rounded-full text-xs font-bold ${
                        item.active ? 'bg-green-900/50 text-green-400' : 'bg-red-900/50 text-red-400'
                      }`}
                    >
                      {item.active ? '✅ Active' : '❌ Inactive'}
                    </button>
                  </td>
                  <td className="p-3 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => { setEditingItem(item); setShowForm(true); }}
                        className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded-lg text-xs"
                      >
                        ✏️ Edit
                      </button>
                      <button
                        onClick={() => handleDelete(item)}
                        className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded-lg text-xs"
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Edit/Add Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
            <div className="bg-gray-800 rounded-xl p-6 max-w-md w-full">
              <h2 className="text-2xl font-bold mb-4">
                {editingItem ? '✏️ Edit' : '➕ Add'} {activeTab.slice(0, -1)}
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Name (English)</label>
                  <input
                    type="text"
                    defaultValue={editingItem?.nameEn}
                    className="w-full p-3 bg-gray-700 rounded-lg"
                    placeholder="e.g., Steel Fixer"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Name (繁體中文)</label>
                  <input
                    type="text"
                    defaultValue={editingItem?.nameZh}
                    className="w-full p-3 bg-gray-700 rounded-lg"
                    placeholder="e.g., 鋼筋工"
                  />
                </div>
                {activeTab === 'trades' && (
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Standard Unit</label>
                    <select defaultValue={editingItem ? (editingItem as any).standardUnit : 'kg'}
                      className="w-full p-3 bg-gray-700 rounded-lg">
                      <option value="kg">kg</option>
                      <option value="ton">ton</option>
                      <option value="m²">m²</option>
                      <option value="m³">m³</option>
                      <option value="m">m</option>
                      <option value="day">day</option>
                    </select>
                  </div>
                )}
                {activeTab === 'constraints' && (
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Category</label>
                    <input type="text" defaultValue={editingItem?.category}
                      className="w-full p-3 bg-gray-700 rounded-lg" />
                  </div>
                )}
              </div>

              <div className="flex gap-3 mt-6">
                <button onClick={() => { setShowForm(false); setEditingItem(null); }}
                  className="flex-1 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg">
                  Cancel
                </button>
                <button onClick={() => { setShowForm(false); setEditingItem(null); alert('Save to Firestore'); }}
                  className="flex-1 py-3 bg-teal-600 hover:bg-teal-700 rounded-lg">
                  Save
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}