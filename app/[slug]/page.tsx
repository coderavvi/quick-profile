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
        const foundClient = clients.find((c: any) => c.slug.toLowerCase() === slug.toLowerCase());

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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-black flex items-center justify-center p-4">
      {/* Image Display - Centered with subtle info on hover */}
      <div className="relative w-full max-w-5xl group">
        <div className="overflow-hidden rounded-xl shadow-2xl">
          <img
            src={client.fileUrl}
            alt={`${client.clientName} Profile`}
            className="w-full h-auto object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </div>
        
        {/* Subtle Info Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none flex flex-col justify-end p-6">
          <h2 className="text-2xl font-bold text-white mb-1">{client.clientName}</h2>
          <p className="text-amber-400 text-lg mb-4">{client.companyName}</p>
          <p className="text-gray-300 text-xs">
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
