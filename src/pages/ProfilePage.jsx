// frontend/src/pages/ProfilePage.jsx
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { updateMyProfile } from '../api/authApi';
import toast from 'react-hot-toast';

const ProfilePage = () => {
  const { user, saveUser } = useAuth();

  const [formData, setFormData] = useState({
    name:     user?.name     || '',
    email:    user?.email    || '',
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password && formData.password !== formData.confirmPassword) {
      return toast.error('Passwords do not match');
    }

    setLoading(true);
    try {
      const payload = { name: formData.name, email: formData.email };
      if (formData.password) payload.password = formData.password;

      const res = await updateMyProfile(payload);
      saveUser(res.data);
      toast.success('Profile updated!');
      setFormData((f) => ({ ...f, password: '', confirmPassword: '' }));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">My Profile</h1>

      <div className="card p-6">
        {/* Avatar */}
        <div className="flex items-center gap-4 mb-8 pb-6 border-b border-gray-100">
          <img
            src={user?.profileImage}
            alt={user?.name}
            className="w-16 h-16 rounded-full object-cover border-2 border-gray-200"
          />
          <div>
            <h2 className="font-bold text-gray-900 text-lg">{user?.name}</h2>
            <p className="text-gray-500 text-sm">{user?.email}</p>
            <span className={`badge mt-1 ${
              user?.role === 'admin'
                ? 'bg-purple-100 text-purple-700'
                : 'bg-gray-100 text-gray-600'
            }`}>
              {user?.role}
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Full Name
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="input-field"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Email address
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="input-field"
            />
          </div>

          <div className="border-t border-gray-100 pt-5">
            <h3 className="font-semibold text-gray-800 mb-4">Change Password</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  New Password
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Leave blank to keep current"
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm new password"
                  className="input-field"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent
                  rounded-full animate-spin" />
                Saving...
              </>
            ) : 'Save Changes'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ProfilePage;