'use client';

import { useEffect, useState } from 'react';
import React from 'react';

interface ClientData {
  _id: string;
  clientName: string;
  companyName: string;
  slug: string;
  fileUrl: string;
  isActive: boolean;
  createdAt: string;
}

export default function ClientProfilePage({ params }: { params: Promise<{ slug: string }> }) {
  const [client, setClient] = useState<ClientData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [slug, setSlug] = useState<string | null>(null);

  // Unwrap params on mount
  useEffect(() => {
    const unwrapParams = async () => {
      const resolvedParams = await params;
      setSlug(resolvedParams.slug);
    };
    unwrapParams();
  }, [params]);

  // Fetch client when slug is available
  useEffect(() => {
    if (!slug) return;

    const fetchClient = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/clients?slug=${slug}`);
        
        if (!response.ok) {
          setError('Client not found');
          return;
        }

        const clients = await response.json();
        const foundClient = clients.find((c: any) => c.slug === slug);

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
  }, [slug]);

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

  // Check if profile is active
  if (!client.isActive) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Profile Unavailable</h1>
          <p className="text-gray-600 mb-4">This profile is currently inactive</p>
          <a href="/" className="text-amber-500 hover:text-amber-600 font-medium">
            Go back home
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm flex-shrink-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <h1 className="text-xl font-bold text-slate-900">QuickProfile</h1>
        </div>
      </div>

      {/* Image Display - Full Height */}
      <div className="flex-1 flex flex-col items-center justify-center overflow-hidden bg-black p-4">
        <div className="max-w-6xl w-full h-full flex items-center justify-center">
          <img
            src={client.fileUrl}
            alt={`${client.clientName} Profile`}
            className="w-full h-full object-contain rounded-lg"
          />
        </div>
      </div>

      {/* Footer - Client Info and Actions */}
      <div className="bg-white border-t border-gray-200 shadow-sm flex-shrink-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="mb-4">
            <h2 className="text-2xl font-bold text-slate-900">{client.clientName}</h2>
            <p className="text-amber-500 text-lg">{client.companyName}</p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 flex-wrap">
            <a
              href={client.fileUrl}
              download
              className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white font-medium rounded-lg transition-colors inline-flex items-center gap-2"
            >
              <span>📥</span>
              <span>Download Image</span>
            </a>
            <a
              href={client.fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors inline-flex items-center gap-2"
            >
              <span>🔍</span>
              <span>Open in New Tab</span>
            </a>
          </div>

          {/* Created Date */}
          <p className="text-gray-600 text-sm mt-6">
            Created on {new Date(client.createdAt).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>
        </div>
      </div>
    </div>
  );
}
