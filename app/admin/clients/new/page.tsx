'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import QRCode from 'qrcode';

interface ClientData {
  clientName: string;
  companyName: string;
  slug: string;
}

interface SuccessModal {
  isOpen: boolean;
  url: string;
  slug: string;
  qrCodeDataUrl: string | null;
}

export default function CreateClientPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState<ClientData>({
    clientName: '',
    companyName: '',
    slug: '',
  });

  const [file, setFile] = useState<File | null>(null);
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [fileType, setFileType] = useState<'pdf' | 'image' | null>(null);
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [successModal, setSuccessModal] = useState<SuccessModal>({
    isOpen: false,
    url: '',
    slug: '',
    qrCodeDataUrl: null,
  });

  const [slugError, setSlugError] = useState<string>('');

  // Auto-generate slug from client name
  useEffect(() => {
    if (formData.clientName) {
      const generatedSlug = formData.clientName
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');

      setFormData((prev) => ({
        ...prev,
        slug: generatedSlug,
      }));
    }
  }, [formData.clientName]);

  // Validate slug
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
    setIsLoading(true);

    try {
      // Validate form
      if (!formData.clientName || !formData.companyName || !formData.slug) {
        setError('Please fill in all required fields');
        setIsLoading(false);
        return;
      }

      if (!file) {
        setError('Please select a file to upload');
        setIsLoading(false);
        return;
      }

      if (slugError) {
        setError('Please fix the slug error');
        setIsLoading(false);
        return;
      }

      // Upload file to Cloudinary
      const uploadFormData = new FormData();
      uploadFormData.append('file', file);

      const uploadResponse = await fetch('/api/upload', {
        method: 'POST',
        body: uploadFormData,
      });

      if (!uploadResponse.ok) {
        const errorData = await uploadResponse.json();
        setError(errorData.error || 'File upload failed');
        setIsLoading(false);
        return;
      }

      const uploadResult = await uploadResponse.json();

      // Create client
      const clientResponse = await fetch('/api/clients', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          clientName: formData.clientName,
          companyName: formData.companyName,
          slug: formData.slug,
          fileUrl: uploadResult.url,
          fileType: uploadResult.fileType,
        }),
      });

      if (!clientResponse.ok) {
        const errorData = await clientResponse.json();
        setError(errorData.error || 'Failed to create client');
        setIsLoading(false);
        return;
      }

      // Generate QR code
      const fullUrl = `${window.location.origin}/${formData.slug}`;
      const qrDataUrl = await QRCode.toDataURL(fullUrl);

      // Show success modal
      setSuccessModal({
        isOpen: true,
        url: fullUrl,
        slug: formData.slug,
        qrCodeDataUrl: qrDataUrl,
      });

      setFormData({ clientName: '', companyName: '', slug: '' });
      setFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadQR = () => {
    if (!successModal.qrCodeDataUrl) return;

    const link = document.createElement('a');
    link.href = successModal.qrCodeDataUrl;
    link.download = `${successModal.slug}-qrcode.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(successModal.url);
    alert('URL copied to clipboard!');
  };

  const handleCloseModal = () => {
    setSuccessModal({ ...successModal, isOpen: false });
    router.push('/admin/dashboard');
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Create New Client</h1>
        <p className="text-gray-600 mt-1">Add a new branded profile for your client</p>
      </div>

      {/* Form */}
      <div className="bg-white rounded-lg shadow border border-gray-200 p-8 max-w-2xl">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700">{error}</p>
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
              placeholder="John Doe"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              required
              disabled={isLoading}
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
              placeholder="Acme Inc."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              required
              disabled={isLoading}
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
                placeholder="john-doe"
                className={`flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent ${
                  slugError ? 'border-red-300' : 'border-gray-300'
                }`}
                required
                disabled={isLoading}
              />
            </div>
            {slugError && (
              <p className="text-red-600 text-sm mt-1">{slugError}</p>
            )}
            <p className="text-gray-500 text-sm mt-1">
              Only lowercase letters, numbers, and hyphens allowed
            </p>
          </div>

          {/* File Upload */}
          <div className="mb-8">
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Upload File (PDF or Image) *
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
                required
                disabled={isLoading}
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

          {/* Preview Section - Show when file is selected */}
          {file && fileUrl && (
            <div className="mb-8">
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Preview
              </label>
              <div className="border border-gray-200 rounded-lg p-6 bg-gray-50">
                {fileType === 'pdf' ? (
                  <div className="flex items-center gap-4">
                    <div className="text-4xl">📕</div>
                    <div>
                      <p className="font-medium text-gray-900">{file.name}</p>
                      <p className="text-sm text-gray-600">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex justify-center">
                    <img
                      src={fileUrl}
                      alt="Preview"
                      className="max-w-xs max-h-64 rounded-lg shadow object-contain"
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full px-6 py-3 bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Creating Client...' : 'Create Client'}
          </button>
        </form>
      </div>

      {/* Success Modal */}
      {successModal.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-8">
            <div className="text-center mb-6">
              <div className="text-4xl mb-2">✅</div>
              <h2 className="text-2xl font-bold text-slate-900">Success!</h2>
              <p className="text-gray-600 mt-1">Client profile created successfully</p>
            </div>

            {/* Live URL */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Live URL
              </label>
              <div className="flex items-center bg-gray-50 border border-gray-300 rounded-lg p-2">
                <input
                  type="text"
                  value={successModal.url}
                  readOnly
                  className="flex-1 bg-transparent px-2 text-sm text-gray-900 focus:outline-none"
                />
                <button
                  onClick={handleCopyUrl}
                  className="px-3 py-1 bg-amber-500 hover:bg-amber-600 text-white text-sm font-medium rounded transition-colors"
                >
                  Copy
                </button>
              </div>
            </div>

            {/* QR Code */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-900 mb-2 text-center">
                QR Code
              </label>
              {successModal.qrCodeDataUrl && (
                <div className="flex justify-center">
                  <img
                    src={successModal.qrCodeDataUrl}
                    alt="QR Code"
                    className="w-40 h-40 border border-gray-300 rounded-lg p-2"
                  />
                </div>
              )}
            </div>

            {/* Download QR Button */}
            <button
              onClick={handleDownloadQR}
              className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors mb-3"
            >
              Download QR Code
            </button>

            {/* Done Button */}
            <button
              onClick={handleCloseModal}
              className="w-full px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-medium rounded-lg transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
