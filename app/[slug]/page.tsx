'use client';

import { useEffect, useState } from 'react';
import dbConnect from '@/lib/db';
import Client from '@/lib/models/Client';
import { notFound } from 'next/navigation';
import Image from 'next/image';

export default function ClientProfilePage({ params }: { params: { slug: string } }) {
  const [client, setClient] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchClient = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/clients?slug=${params.slug}`);
        
        if (!response.ok) {
          setError('Client not found');
          return;
        }

        const clients = await response.json();
        const foundClient = clients.find((c: any) => c.slug === params.slug);

        if (!foundClient) {
          setError('Client not found');
          return;
        }

        setClient(foundClient);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchClient();
  }, [params.slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error || !client) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">404</h1>
          <p className="text-gray-600 mb-4">Profile not found</p>
          <a href="/" className="text-amber-500 hover:text-amber-600 font-medium">
            Go back home
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <h1 className="text-xl font-bold text-slate-900">QuickProfile</h1>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Client Info */}
          <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white p-8">
            <h2 className="text-3xl font-bold mb-2">{client.clientName}</h2>
            <p className="text-amber-500 text-lg">{client.companyName}</p>
          </div>

          {/* Document Viewer */}
          <div className="p-8">
            {client.fileType === 'pdf' ? (
              <div className="bg-gray-100 rounded-lg overflow-hidden" style={{ height: '70vh' }}>
                <iframe
                  src={client.fileUrl}
                  style={{ width: '100%', height: '100%', border: 'none' }}
                  title={`${client.clientName} Document`}
                />
              </div>
            ) : (
              <div className="flex justify-center items-center bg-gray-100 rounded-lg p-8" style={{ minHeight: '70vh' }}>
                <div className="max-w-2xl w-full">
                  <img
                    src={client.fileUrl}
                    alt={`${client.clientName} Image`}
                    className="w-full h-auto rounded-lg shadow-lg"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="bg-gray-50 border-t border-gray-200 p-8 text-center">
            <p className="text-gray-600 text-sm">
              Created on {new Date(client.createdAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
