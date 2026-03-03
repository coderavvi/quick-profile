'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Client {
  _id: string;
  clientName: string;
  companyName: string;
  slug: string;
  isActive: boolean;
  createdAt: string;
}

export default function DashboardPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/clients', {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch clients');
      }

      const data = await response.json();
      setClients(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this client?')) {
      return;
    }

    try {
      const response = await fetch(`/api/clients/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to delete client');
      }

      setClients(clients.filter((c) => c._id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete client');
    }
  };

  const handleToggleStatus = async (id: string) => {
    console.log('Toggle button clicked for client:', id);
    try {
      console.log('Sending PATCH request to /api/clients/' + id);
      const response = await fetch(`/api/clients/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      console.log('PATCH response status:', response.status);
      console.log('PATCH response ok:', response.ok);

      if (!response.ok) {
        const errorData = await response.json();
        console.log('Error response:', errorData);
        throw new Error(errorData.error || 'Failed to toggle client status');
      }

      const updatedClient = await response.json();
      console.log('Updated client:', updatedClient);
      setClients(clients.map((c) => (c._id === id ? updatedClient : c)));
      setError(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to toggle client status';
      console.error('Toggle status error:', errorMessage);
      setError(errorMessage);
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
      {/* Header */}
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Manage your client profiles</p>
        </div>
        <Link
          href="/admin/clients/new"
          className="px-6 py-3 bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold rounded-lg transition-colors"
        >
          + Add New Client
        </Link>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
          <div className="text-gray-600 text-sm font-medium mb-1">Total Clients</div>
          <div className="text-3xl font-bold text-slate-900">{clients.length}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
          <div className="text-gray-600 text-sm font-medium mb-1">This Month</div>
          <div className="text-3xl font-bold text-amber-500">
            {clients.filter((c) => {
              const date = new Date(c.createdAt);
              const now = new Date();
              return (
                date.getMonth() === now.getMonth() && 
                date.getFullYear() === now.getFullYear()
              );
            }).length}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
          <div className="text-gray-600 text-sm font-medium mb-1">Active Profiles</div>
          <div className="text-3xl font-bold text-slate-900">{clients.filter((c) => c.isActive).length}</div>
        </div>
      </div>

      {/* Clients Table */}
      <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-bold text-slate-900">Clients</h2>
        </div>

        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading clients...</p>
          </div>
        ) : clients.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-gray-600 mb-4">No clients yet</p>
            <Link
              href="/admin/clients/new"
              className="text-amber-500 hover:text-amber-600 font-medium"
            >
              Create your first client
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Client Name</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Company</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">URL Slug</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Created</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody>
                {clients.map((client) => (
                  <tr key={client._id} className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-slate-900">{client.clientName}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{client.companyName}</td>
                    <td className="px-6 py-4 text-sm">
                      <a
                        href={`/${client.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-amber-500 hover:text-amber-600 font-medium"
                      >
                        /{client.slug}
                      </a>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <button
                        type="button"
                        onClick={() => handleToggleStatus(client._id)}
                        className={`px-3 py-1 rounded font-medium transition-colors cursor-pointer ${
                          client.isActive
                            ? 'bg-green-50 text-green-700 hover:bg-green-100'
                            : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        {client.isActive ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{formatDate(client.createdAt)}</td>
                    <td className="px-6 py-4 text-sm flex gap-2">
                      <Link
                        href={`/admin/clients/${client._id}/edit`}
                        className="px-3 py-1 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded transition-colors font-medium"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => handleDelete(client._id)}
                        className="px-3 py-1 bg-red-50 text-red-700 hover:bg-red-100 rounded transition-colors font-medium"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
