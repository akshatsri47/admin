"use client";

import { useState } from 'react';
import { PhotoIcon, ArrowUpTrayIcon } from '@heroicons/react/24/outline';
import { uploadMediaFiles, validateFileForUpload } from '../lib/mediaUtils';
import { BlogFormData } from '../types/blog';

type FeaturedImage = NonNullable<BlogFormData['featuredImage']>;

interface BlogFeaturedImageUploadProps {
  value?: FeaturedImage;
  onChange: (image: FeaturedImage) => void;
  onUploadingChange?: (uploading: boolean) => void;
}

export default function BlogFeaturedImageUpload({
  value,
  onChange,
  onUploadingChange,
}: BlogFeaturedImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const validation = validateFileForUpload(file);
    if (!validation.isValid || !file.type.startsWith('image/')) {
      setError(validation.error || 'Please select a JPEG, PNG, or WebP image.');
      event.target.value = '';
      return;
    }

    setError('');
    setUploading(true);
    onUploadingChange?.(true);

    try {
      const result = await uploadMediaFiles([file]);
      const uploadedImage = result.mediaItems.find((item) => item.type === 'image');
      if (!uploadedImage) throw new Error('The image could not be uploaded.');

      onChange({
        url: uploadedImage.url,
        cloudinaryId: uploadedImage.cloudinaryId,
        altText: value?.altText || file.name.replace(/\.[^.]+$/, '').replace(/[-_]+/g, ' '),
      });
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : 'Image upload failed.');
    } finally {
      setUploading(false);
      onUploadingChange?.(false);
      event.target.value = '';
    }
  };

  return (
    <section className="rounded-lg border-2 border-dashed border-emerald-300 bg-emerald-50/50 p-5">
      <div className="mb-4 flex items-start gap-3">
        <PhotoIcon className="mt-0.5 h-6 w-6 text-emerald-600" />
        <div>
          <h2 className="font-semibold text-gray-900">Blog Card / Featured Image</h2>
          <p className="text-sm text-gray-600">
            This image appears above the heading on the blog listing and article page.
          </p>
        </div>
      </div>

      {value?.url && (
        <div className="mb-4 overflow-hidden rounded-lg border border-gray-200 bg-white">
          {/* A plain image preview supports every Cloudinary delivery URL without changing app configuration. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={value.url} alt={value.altText || 'Featured image preview'} className="h-56 w-full object-cover" />
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-[auto_1fr] sm:items-end">
        <label className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-md bg-emerald-600 px-5 py-2.5 font-medium text-white hover:bg-emerald-700">
          <ArrowUpTrayIcon className="h-5 w-5" />
          {uploading ? 'Uploading...' : value ? 'Replace Image' : 'Upload Image'}
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="sr-only"
            disabled={uploading}
            onChange={handleFileChange}
          />
        </label>

        <div>
          <label htmlFor="featuredImageAlt" className="mb-1 block text-sm font-medium text-gray-700">
            Image description (for SEO and accessibility)
          </label>
          <input
            id="featuredImageAlt"
            type="text"
            value={value?.altText || ''}
            disabled={!value || uploading}
            onChange={(event) => value && onChange({ ...value, altText: event.target.value })}
            placeholder="Describe what is shown in the image"
            className="w-full rounded-md border border-gray-300 px-3 py-2 disabled:bg-gray-100"
          />
        </div>
      </div>

      <p className="mt-3 text-xs text-gray-500">JPEG, PNG or WebP. Maximum size: 5 MB.</p>
      {error && <p className="mt-2 text-sm font-medium text-red-600">{error}</p>}
    </section>
  );
}
