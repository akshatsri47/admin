"use client";

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { getBlogs, deleteBlog } from '../../lib/blogFirestore';
import { BlogData } from '../../types/blog';
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon, 
  EyeIcon,
  CalendarIcon,
  UserIcon,
  TagIcon
} from '@heroicons/react/24/outline';
import { convertToDate } from '../../types/firebase';

export default function AdminBlogsPage() {
  const [blogs, setBlogs] = useState<BlogData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<'all' | 'draft' | 'published' | 'scheduled'>('all');

  useEffect(() => {
    fetchBlogs();
  }, [statusFilter]);

  const fetchBlogs = useCallback(async () => {
    try {
      setLoading(true);
      // Fetch all blogs and filter client-side to avoid index requirement
      const result = await getBlogs({}, 100);
      // Filter blogs by status on client-side
      const filteredBlogs = statusFilter !== 'all' 
        ? result.blogs.filter(blog => blog.status === statusFilter)
        : result.blogs;
      setBlogs(filteredBlogs);
    } catch (err) {
      setError('Failed to load blogs');
      console.error('Error fetching blogs:', err);
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  const handleDeleteBlog = async (blogId: string, blogTitle: string) => {
    if (!confirm(`Are you sure you want to delete "${blogTitle}"? This action cannot be undone.`)) {
      return;
    }

    try {
      setDeleteLoading(blogId);
      await deleteBlog(blogId);
      setBlogs(blogs.filter(blog => blog.id !== blogId));
    } catch (err) {
      console.error('Error deleting blog:', err);
      alert('Failed to delete blog. Please try again.');
    } finally {
      setDeleteLoading(null);
    }
  };

  const formatDate = (timestamp: unknown) => {
    if (!timestamp) return '';
    
    const date = convertToDate(timestamp);
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
      return '';
    }
    
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusBadge = (status: string) => {
    const statusStyles = {
      draft: 'bg-gray-100 text-gray-800',
      published: 'bg-green-100 text-green-800',
      scheduled: 'bg-blue-100 text-blue-800'
    };

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusStyles[status as keyof typeof statusStyles] || statusStyles.draft}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading blogs...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Blog Management</h1>
              <p className="mt-2 text-gray-600">Create, edit, and manage your blog posts</p>
            </div>
            <Link
              href="/blogs/create"
              className="inline-flex items-center px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
            >
              <PlusIcon className="w-5 h-5 mr-2" />
              Create New Blog
            </Link>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6">
          <div className="flex space-x-2">
            {(['all', 'draft', 'published', 'scheduled'] as const).map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  statusFilter === status
                    ? 'bg-emerald-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                {status === 'all' ? 'All Blogs' : status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600">{error}</p>
            <button 
              onClick={fetchBlogs}
              className="mt-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Blogs Grid */}
        {blogs.length === 0 ? (
          <div className="text-center py-12">
            <div className="max-w-md mx-auto">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No blogs found</h3>
              <p className="mt-1 text-sm text-gray-500">Get started by creating your first blog post.</p>
              <div className="mt-6">
                <Link
                  href="/blogs/create"
                  className="inline-flex items-center px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
                >
                  <PlusIcon className="w-5 h-5 mr-2" />
                  Create New Blog
                </Link>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {blogs.map((blog) => (
              <div key={blog.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                {/* Featured Image */}
                {blog.featuredImage && (
                  <div className="relative h-48 w-full">
                    <Image
                      src={blog.featuredImage.url}
                      alt={blog.featuredImage.altText || blog.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}

                <div className="p-6">
                  {/* Status and Categories */}
                  <div className="flex items-center justify-between mb-3">
                    {getStatusBadge(blog.status)}
                    {blog.categories.length > 0 && (
                      <div className="flex items-center text-sm text-gray-500">
                        <TagIcon className="w-4 h-4 mr-1" />
                        {blog.categories[0]}
                        {blog.categories.length > 1 && ` +${blog.categories.length - 1}`}
                      </div>
                    )}
                  </div>

                  {/* Title */}
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                    {blog.title}
                  </h3>

                  {/* Excerpt */}
                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                    {blog.excerpt || blog.content.replace(/<[^>]*>/g, '').substring(0, 100) + '...'}
                  </p>

                  {/* Meta Info */}
                  <div className="flex items-center text-xs text-gray-500 mb-4 space-x-4">
                    <div className="flex items-center">
                      <UserIcon className="w-3 h-3 mr-1" />
                      {blog.author.name}
                    </div>
                    <div className="flex items-center">
                      <CalendarIcon className="w-3 h-3 mr-1" />
                      {formatDate(blog.publishDate)}
                    </div>
                    {blog.analytics?.views && (
                      <div className="flex items-center">
                        <EyeIcon className="w-3 h-3 mr-1" />
                        {blog.analytics.views}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between">
                    <div className="flex space-x-2">
                      <Link
                        href={`/blogs/${blog.id}/edit`}
                        className="inline-flex items-center px-3 py-1.5 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors"
                      >
                        <PencilIcon className="w-4 h-4 mr-1" />
                        Edit
                      </Link>
                      <Link
                        href={`/blogs/${blog.id}/preview`}
                        className="inline-flex items-center px-3 py-1.5 bg-gray-600 text-white text-sm rounded-md hover:bg-gray-700 transition-colors"
                      >
                        <EyeIcon className="w-4 h-4 mr-1" />
                        Preview
                      </Link>
                    </div>
                    <button
                      onClick={() => handleDeleteBlog(blog.id!, blog.title)}
                      disabled={deleteLoading === blog.id}
                      className="inline-flex items-center px-3 py-1.5 bg-red-600 text-white text-sm rounded-md hover:bg-red-700 transition-colors disabled:opacity-50"
                    >
                      {deleteLoading === blog.id ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-1"></div>
                      ) : (
                        <TrashIcon className="w-4 h-4 mr-1" />
                      )}
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}