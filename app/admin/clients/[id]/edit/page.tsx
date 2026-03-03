'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';

interface ClientData {
  _id: string;
  clientName: string;
  companyName: string;
  slug: string;
  fileUrl: string;
  fileType: 'pdf' | 'image';
}

interface FormData {
  clientName: string;
  companyName: string;
  slug: string;
}

export default function EditClientPage() {
  const router = useRouter();
  const params = useParams();
  const clientId = params.id as string;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [client, setClient] = useState<ClientData | null>(null);
  const [formData, setFormData] = useState<FormData>({
    clientName: '',
    companyName: '',
    slug: '',
  });

  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [slugError, setSlugError] = useState<string>('');

  useEffect(() => {
    fetchClient();
  }, [clientId]);

  const fetchClient = async () => {
    try {
      const response = await fetch(`/api/clients/${clientId}`);

      if (!response.ok) {
        setError('Failed to load client');
        return;
      }

      const data = await response.json();
      setClient(data);
      setFormData({
        clientName: data.clientName,
        companyName: data.companyName,
        slug: data.slug,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const validateSlug = (value: string) => {
    const slugRegex = /^[a-z0-9-]+$/;
    if (!slugRegex.test(value)) {
      setSlugError('Slug can only contain lowercase letters, numbers, and hyphens');
    } else {
      setSlugError('');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (name === 'slug') {
      validateSlug(value);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    // Validate file type
    const validTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
    if (!validTypes.includes(selectedFile.type)) {
      setError('Only PDF, JPG, and PNG files are allowed');
      return;
    }

    // Validate file size (max 50MB)
    if (selectedFile.size > 50 * 1024 * 1024) {
      setError('File size must be less than 50MB');
      return;
    }

    setFile(selectedFile);
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsSaving(true);

    try {
      // Validate form
      if (!formData.clientName || !formData.companyName || !formData.slug) {
        setError('Please fill in all required fields');
        setIsSaving(false);
        return;
      }

      if (slugError) {
        setError('Please fix the slug error');
        setIsSaving(false);
        return;
      }

      let fileUrl = client?.fileUrl;
      let fileType = client?.fileType;

      // Upload new file if selected
      if (file) {
        const uploadFormData = new FormData();
        uploadFormData.append('file', file);

        const uploadResponse = await fetch('/api/upload', {
          method: 'POST',
          body: uploadFormData,
        });

        if (!uploadResponse.ok) {
          const errorData = await uploadResponse.json();
          setError(errorData.error || 'File upload failed');
          setIsSaving(false);
          return;
        }

        const uploadResult = await uploadResponse.json();
        fileUrl = uploadResult.url;
        fileType = uploadResult.fileType;
      }

      // Update client
      const updateResponse = await fetch(`/api/clients/${clientId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          clientName: formData.clientName,
          companyName: formData.companyName,
          slug: formData.slug,
          fileUrl,
          fileType,
        }),
      });

      if (!updateResponse.ok) {
        const errorData = await updateResponse.json();
        setError(errorData.error || 'Failed to update client');
        setIsSaving(false);
        return;
      }

      setSuccess('Client updated successfully');
      setFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      setTimeout(() => {
        router.push('/admin/dashboard');
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading client...</p>
        </div>
      </div>
    );
  }

  if (!client) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 mb-4">Client not found</p>
        <button
          onClick={() => router.push('/admin/dashboard')}
          className="text-amber-500 hover:text-amber-600 font-medium"
        >
          Go back to dashboard
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Edit Client</h1>
        <p className="text-gray-600 mt-1">Update client information and files</p>
      </div>

      {/* Form */}
      <div className="bg-white rounded-lg shadow border border-gray-200 p-8 max-w-2xl">
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

        <form onSubmit={handleSubmit}>
          {/* Client Name */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Client Name *
            </label>
            <input
              type="text"
              name="clientName"
              value={formData.clientName}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              required
              disabled={isSaving}
            />
          </div>

          {/* Company Name */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Company Name *
            </label>
            <input
              type="text"
              name="companyName"
              value={formData.companyName}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              required
              disabled={isSaving}
            />
          </div>

          {/* Slug */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Custom URL Slug *
            </label>
            <div className="flex items-center">
              <span className="text-gray-600 mr-2">quickprofile.vercel.app/</span>
              <input
                type="text"
                name="slug"
                value={formData.slug}
                onChange={handleInputChange}
                className={`flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent ${
                  slugError ? 'border-red-300' : 'border-gray-300'
                }`}
                required
                disabled={isSaving}
              />
            </div>
            {slugError && (
              <p className="text-red-600 text-sm mt-1">{slugError}</p>
            )}
          </div>

          {/* Current File */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Current File
            </label>
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-sm text-gray-600 mb-2">
                Type: <span className="font-medium text-gray-900">{client.fileType.toUpperCase()}</span>
              </p>
              <a
                href={client.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-amber-500 hover:text-amber-600 text-sm font-medium break-all"
              >
                View File
              </a>
            </div>
          </div>

          {/* Replace File */}
          <div className="mb-8">
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Replace File (Optional)
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-amber-500 transition-colors cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={handleFileChange}
                className="hidden"
                disabled={isSaving}
              />
              <div>
                <div className="text-4xl mb-2">📄</div>
                <p className="text-gray-900 font-medium">
                  {file ? file.name : 'Click to upload or drag and drop'}
                </p>
                <p className="text-gray-500 text-sm mt-1">
                  PDF, JPG, or PNG (max 50MB)
                </p>
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={isSaving}
              className="flex-1 px-6 py-3 bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
            <button
              type="button"
              onClick={() => router.push('/admin/dashboard')}
              disabled={isSaving}
              className="flex-1 px-6 py-3 border-2 border-slate-900 text-slate-900 font-bold rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
