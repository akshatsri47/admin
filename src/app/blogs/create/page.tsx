"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

export default function CreateBlogPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    excerpt: '',
    categories: '',
    tags: '',
    status: 'draft' as 'draft' | 'published' | 'scheduled',
    publishDate: '',
    seo: {
      metaTitle: '',
      metaDescription: '',
      keywords: ''
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Prepare the blog data
      const blogData = {
        title: formData.title,
        content: formData.content,
        excerpt: formData.excerpt,
        categories: formData.categories.split(',').map(cat => cat.trim()).filter(Boolean),
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean),
        status: formData.status,
        publishDate: formData.publishDate ? new Date(formData.publishDate).toISOString() : undefined,
        seo: {
          metaTitle: formData.seo.metaTitle || formData.title,
          metaDescription: formData.seo.metaDescription || formData.excerpt,
          keywords: formData.seo.keywords.split(',').map(kw => kw.trim()).filter(Boolean)
        },
        author: {
          id: 'krishdoctor-1',
          name: 'krishdoctor',
          email: 'krishdoctor@example.com'
        }
      };

      const response = await fetch('/api/blogs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(blogData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create blog');
      }

      await response.json();
      
      // Redirect to the blog management page
      router.push('/blogs');
    } catch (error) {
      console.error('Error creating blog:', error);
      alert(error instanceof Error ? error.message : 'Failed to create blog');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name.startsWith('seo.')) {
      const seoField = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        seo: {
          ...prev.seo,
          [seoField]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/blogs"
            className="inline-flex items-center text-emerald-600 hover:text-emerald-700 font-medium mb-4"
          >
            <ArrowLeftIcon className="w-4 h-4 mr-2" />
            Back to Blogs
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Create New Blog Post</h1>
          <p className="mt-2 text-gray-600">Fill in the details below to create a new blog post</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-8">
          <div className="space-y-6">
            {/* Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                Title *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                required
                value={formData.title}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                placeholder="Enter blog title"
              />
            </div>

            {/* Content */}
            <div>
              <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
                Content *
              </label>
              <textarea
                id="content"
                name="content"
                required
                rows={12}
                value={formData.content}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                placeholder="Write your blog content here... (HTML supported)"
              />
            </div>

            {/* Excerpt */}
            <div>
              <label htmlFor="excerpt" className="block text-sm font-medium text-gray-700 mb-2">
                Excerpt
              </label>
              <textarea
                id="excerpt"
                name="excerpt"
                rows={3}
                value={formData.excerpt}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                placeholder="Brief description of the blog post"
              />
            </div>

            {/* Categories and Tags */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="categories" className="block text-sm font-medium text-gray-700 mb-2">
                  Categories *
                </label>
                <input
                  type="text"
                  id="categories"
                  name="categories"
                  required
                  value={formData.categories}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="technology, agriculture (comma-separated)"
                />
              </div>

              <div>
                <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-2">
                  Tags
                </label>
                <input
                  type="text"
                  id="tags"
                  name="tags"
                  value={formData.tags}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="farming, tips, guide (comma-separated)"
                />
              </div>
            </div>

            {/* Status and Publish Date */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                  <option value="scheduled">Scheduled</option>
                </select>
              </div>

              <div>
                <label htmlFor="publishDate" className="block text-sm font-medium text-gray-700 mb-2">
                  Publish Date
                </label>
                <input
                  type="datetime-local"
                  id="publishDate"
                  name="publishDate"
                  value={formData.publishDate}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>
            </div>

            {/* SEO Section */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">SEO Settings</h3>
              
              <div className="space-y-4">
                <div>
                  <label htmlFor="seo.metaTitle" className="block text-sm font-medium text-gray-700 mb-2">
                    Meta Title
                  </label>
                  <input
                    type="text"
                    id="seo.metaTitle"
                    name="seo.metaTitle"
                    value={formData.seo.metaTitle}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    placeholder="SEO title (defaults to blog title)"
                  />
                </div>

                <div>
                  <label htmlFor="seo.metaDescription" className="block text-sm font-medium text-gray-700 mb-2">
                    Meta Description
                  </label>
                  <textarea
                    id="seo.metaDescription"
                    name="seo.metaDescription"
                    rows={2}
                    value={formData.seo.metaDescription}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    placeholder="SEO description (defaults to excerpt)"
                  />
                </div>

                <div>
                  <label htmlFor="seo.keywords" className="block text-sm font-medium text-gray-700 mb-2">
                    SEO Keywords
                  </label>
                  <input
                    type="text"
                    id="seo.keywords"
                    name="seo.keywords"
                    value={formData.seo.keywords}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    placeholder="keyword1, keyword2, keyword3"
                  />
                </div>
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="flex justify-end space-x-4 pt-6 border-t">
              <Link
                href="/blogs"
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Creating...
                  </div>
                ) : (
                  'Create Blog Post'
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}