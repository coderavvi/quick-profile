'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';

interface Admin {
  _id: string;
  name: string;
  email: string;
  createdAt: string;
}

interface ChangePasswordForm {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface AddAdminForm {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export default function SettingsPage() {
  const { data: session } = useSession();
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  // Change Password Form
  const [changePasswordForm, setChangePasswordForm] = useState<ChangePasswordForm>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [changePasswordLoading, setChangePasswordLoading] = useState(false);

  // Add Admin Form
  const [addAdminForm, setAddAdminForm] = useState<AddAdminForm>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [addAdminLoading, setAddAdminLoading] = useState(false);

  useEffect(() => {
    fetchAdmins();
  }, []);

  const fetchAdmins = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admins');

      if (!response.ok) {
        throw new Error('Failed to fetch admins');
      }

      const data = await response.json();
      setAdmins(data);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!changePasswordForm.currentPassword || !changePasswordForm.newPassword || !changePasswordForm.confirmPassword) {
      setError('Please fill in all password fields');
      return;
    }

    if (changePasswordForm.newPassword !== changePasswordForm.confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    if (changePasswordForm.newPassword.length < 6) {
      setError('New password must be at least 6 characters');
      return;
    }

    setChangePasswordLoading(true);

    try {
      const response = await fetch(`/api/admins/${(session?.user as any)?.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentPassword: changePasswordForm.currentPassword,
          newPassword: changePasswordForm.newPassword,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to change password');
        return;
      }

      setSuccess('Password changed successfully');
      setChangePasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setChangePasswordLoading(false);
    }
  };

  const handleAddAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!addAdminForm.name || !addAdminForm.email || !addAdminForm.password || !addAdminForm.confirmPassword) {
      setError('Please fill in all required fields');
      return;
    }

    if (addAdminForm.password !== addAdminForm.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (addAdminForm.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setAddAdminLoading(true);

    try {
      const response = await fetch('/api/admins', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: addAdminForm.name,
          email: addAdminForm.email,
          password: addAdminForm.password,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to create admin');
        return;
      }

      setSuccess('Admin created successfully');
      setAddAdminForm({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
      });

      // Refresh admins list
      fetchAdmins();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setAddAdminLoading(false);
    }
  };

  const handleDeleteAdmin = async (adminId: string) => {
    if (!confirm('Are you sure you want to delete this admin?')) {
      return;
    }

    try {
      const response = await fetch(`/api/admins/${adminId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to delete admin');
        return;
      }

      setSuccess('Admin deleted successfully');
      fetchAdmins();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Settings</h1>
        <p className="text-gray-600 mt-1">Manage admin accounts and settings</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {success && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-green-700">{success}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Change Password Section */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-slate-900 mb-4">Change Password</h2>
            <form onSubmit={handleChangePassword}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-900 mb-1">
                  Current Password
                </label>
                <input
                  type="password"
                  value={changePasswordForm.currentPassword}
                  onChange={(e) =>
                    setChangePasswordForm((prev) => ({
                      ...prev,
                      currentPassword: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent text-sm"
                  disabled={changePasswordLoading}
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-900 mb-1">
                  New Password
                </label>
                <input
                  type="password"
                  value={changePasswordForm.newPassword}
                  onChange={(e) =>
                    setChangePasswordForm((prev) => ({
                      ...prev,
                      newPassword: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent text-sm"
                  disabled={changePasswordLoading}
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-900 mb-1">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  value={changePasswordForm.confirmPassword}
                  onChange={(e) =>
                    setChangePasswordForm((prev) => ({
                      ...prev,
                      confirmPassword: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent text-sm"
                  disabled={changePasswordLoading}
                />
              </div>
              <button
                type="submit"
                disabled={changePasswordLoading}
                className="w-full px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-900 font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                {changePasswordLoading ? 'Updating...' : 'Update Password'}
              </button>
            </form>
          </div>
        </div>

        {/* Add New Admin Section */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-slate-900 mb-4">Add New Admin</h2>
            <form onSubmit={handleAddAdmin}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-900 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  value={addAdminForm.name}
                  onChange={(e) =>
                    setAddAdminForm((prev) => ({
                      ...prev,
                      name: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent text-sm"
                  disabled={addAdminLoading}
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-900 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={addAdminForm.email}
                  onChange={(e) =>
                    setAddAdminForm((prev) => ({
                      ...prev,
                      email: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent text-sm"
                  disabled={addAdminLoading}
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-900 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  value={addAdminForm.password}
                  onChange={(e) =>
                    setAddAdminForm((prev) => ({
                      ...prev,
                      password: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent text-sm"
                  disabled={addAdminLoading}
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-900 mb-1">
                  Confirm Password
                </label>
                <input
                  type="password"
                  value={addAdminForm.confirmPassword}
                  onChange={(e) =>
                    setAddAdminForm((prev) => ({
                      ...prev,
                      confirmPassword: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent text-sm"
                  disabled={addAdminLoading}
                />
              </div>
              <button
                type="submit"
                disabled={addAdminLoading}
                className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                {addAdminLoading ? 'Creating...' : 'Create Admin'}
              </button>
            </form>
          </div>
        </div>

        {/* Admin List Section */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-slate-900 mb-4">Admin Accounts</h2>

            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500 mx-auto mb-4"></div>
                <p className="text-gray-600 text-sm">Loading...</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {admins.map((admin) => (
                  <div key={admin._id} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <p className="font-medium text-sm text-slate-900">{admin.name}</p>
                        <p className="text-xs text-gray-600 truncate">{admin.email}</p>
                        <p className="text-xs text-gray-500 mt-1">{formatDate(admin.createdAt)}</p>
                      </div>
                      {(session?.user as any)?.id !== admin._id && (
                        <button
                          onClick={() => handleDeleteAdmin(admin._id)}
                          className="ml-2 px-2 py-1 bg-red-50 hover:bg-red-100 text-red-600 text-xs font-medium rounded transition-colors"
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
