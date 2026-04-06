// frontend/src/pages/admin/AdminUsers.jsx
import { useState, useEffect } from 'react';
import { getAllUsers, toggleUser } from '../../api/authApi';
import Spinner from '../../components/ui/Spinner';
import { formatDate } from '../../utils/helpers';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const AdminUsers = () => {
  const { user: currentUser } = useAuth();
  const [users,    setUsers]    = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [search,   setSearch]   = useState('');
  const [toggling, setToggling] = useState(null);

  useEffect(() => {
    getAllUsers()
      .then((res) => setUsers(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleToggle = async (id) => {
    setToggling(id);
    try {
      const res = await toggleUser(id);
      setUsers((prev) =>
        prev.map((u) =>
          u._id === id ? { ...u, isActive: res.data.isActive } : u
        )
      );
      toast.success(res.message);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Action failed');
    } finally {
      setToggling(null);
    }
  };

  const filtered = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <Spinner />;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Users</h1>
        <p className="text-gray-500 text-sm mt-1">
          {users.length} total •{' '}
          {users.filter((u) => u.isActive).length} active •{' '}
          {users.filter((u) => u.role === 'admin').length} admins
        </p>
      </div>

      <div className="mb-5">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or email..."
          className="input-field max-w-sm"
        />
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left px-4 py-3 font-semibold text-gray-600">User</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Role</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Joined</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Status</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((u) => (
                <tr key={u._id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={u.profileImage}
                        alt={u.name}
                        className="w-9 h-9 rounded-full object-cover border border-gray-200"
                      />
                      <div>
                        <p className="font-medium text-gray-800">
                          {u.name}
                          {u._id === currentUser._id && (
                            <span className="ml-2 badge bg-blue-100 text-blue-600 text-xs">
                              You
                            </span>
                          )}
                        </p>
                        <p className="text-xs text-gray-400">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`badge capitalize ${
                      u.role === 'admin'
                        ? 'bg-purple-100 text-purple-700'
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {formatDate(u.createdAt)}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`badge ${
                      u.isActive
                        ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {u.isActive ? 'Active' : 'Deactivated'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {u._id !== currentUser._id ? (
                      <button
                        onClick={() => handleToggle(u._id)}
                        disabled={toggling === u._id}
                        className={`text-xs font-medium px-3 py-1.5 rounded-lg
                          transition-colors disabled:opacity-50 ${
                          u.isActive
                            ? 'bg-red-50 text-red-600 hover:bg-red-100'
                            : 'bg-green-50 text-green-600 hover:bg-green-100'
                        }`}
                      >
                        {toggling === u._id
                          ? '...'
                          : u.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                    ) : (
                      <span className="text-gray-300 text-xs">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminUsers;