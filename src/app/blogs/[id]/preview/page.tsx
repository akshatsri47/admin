"use client";

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { getBlogById } from '../../../../lib/blogFirestore';
import { BlogData } from '../../../../types/blog';
import { 
  CalendarIcon, 
  UserIcon, 
  TagIcon, 
  ArrowLeftIcon, 
  EyeIcon,
  PencilIcon 
} from '@heroicons/react/24/outline';
import { convertToDate } from '../../../../types/firebase';

export default function BlogPreviewPage() {
  const params = useParams();
  const blogId = params.id as string;
  
  const [blog, setBlog] = useState<BlogData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (blogId) {
      fetchBlog();
    }
  }, [blogId]);

  const fetchBlog = useCallback(async () => {
    try {
      setLoading(true);
      const blogData = await getBlogById(blogId);
      
      if (!blogData) {
        setError('Blog not found');
        return;
      }

      setBlog(blogData);
    } catch (err) {
      setError('Failed to load blog');
      console.error('Error fetching blog:', err);
    } finally {
      setLoading(false);
    }
  }, [blogId]);

  const formatDate = (timestamp: unknown) => {
    if (!timestamp) return '';
    
    const date = convertToDate(timestamp);
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
      return '';
    }
    
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
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
        <div className="max-w-4xl mx-auto">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading blog preview...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !blog) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center">
            <p className="text-red-600 text-lg">{error}</p>
            <Link
              href="/blogs"
              className="mt-4 inline-flex items-center px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
            >
              <ArrowLeftIcon className="w-4 h-4 mr-2" />
              Back to Blogs
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header with Actions */}
        <div className="mb-8 flex justify-between items-start">
          <div>
            <Link
              href="/blogs"
              className="inline-flex items-center text-emerald-600 hover:text-emerald-700 font-medium mb-4"
            >
              <ArrowLeftIcon className="w-4 h-4 mr-2" />
              Back to Blogs
            </Link>
            <div className="flex items-center gap-4">
              <h1 className="text-3xl font-bold text-gray-900">Blog Preview</h1>
              {getStatusBadge(blog.status)}
            </div>
          </div>
          
          <div className="flex space-x-3">
            <Link
              href={`/blogs/${blogId}/edit`}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <PencilIcon className="w-4 h-4 mr-2" />
              Edit Blog
            </Link>
          </div>
        </div>

        {/* Blog Preview */}
        <article className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Featured Image */}
          {blog.featuredImage && (
            <div className="relative h-64 md:h-96 w-full">
              <Image
                src={blog.featuredImage.url}
                alt={blog.featuredImage.altText || blog.title}
                fill
                className="object-cover"
                priority
              />
            </div>
          )}

          <div className="p-8">
            {/* Categories */}
            {blog.categories.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {blog.categories.map((category) => (
                  <span
                    key={category}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-emerald-100 text-emerald-800"
                  >
                    <TagIcon className="w-3 h-3 mr-1" />
                    {category}
                  </span>
                ))}
              </div>
            )}

            {/* Title */}
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              {blog.title}
            </h1>

            {/* Meta Information */}
            <div className="flex flex-wrap items-center gap-6 text-gray-600 mb-8 pb-6 border-b border-gray-200">
              <div className="flex items-center">
                <UserIcon className="w-5 h-5 mr-2" />
                <span className="font-medium">{blog.author.name}</span>
              </div>
              <div className="flex items-center">
                <CalendarIcon className="w-5 h-5 mr-2" />
                <span>{formatDate(blog.publishDate)}</span>
              </div>
              {blog.analytics?.views && (
                <div className="flex items-center">
                  <EyeIcon className="w-5 h-5 mr-2" />
                  <span>{blog.analytics.views} views</span>
                </div>
              )}
            </div>

            {/* Excerpt */}
            {blog.excerpt && (
              <div className="text-xl text-gray-700 mb-8 p-4 bg-gray-50 rounded-lg border-l-4 border-emerald-500">
                {blog.excerpt}
              </div>
            )}

            {/* Content */}
            <div 
              className="prose prose-lg max-w-none prose-emerald prose-headings:text-gray-900 prose-a:text-emerald-600 hover:prose-a:text-emerald-700"
              dangerouslySetInnerHTML={{ __html: blog.content }}
            />

            {/* Media Items */}
            {blog.mediaItems && blog.mediaItems.length > 0 && (
              <div className="mt-8">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Media Gallery</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {blog.mediaItems.map((media) => (
                    <div key={media.id} className="relative">
                      {media.type === 'image' ? (
                        <div className="relative h-48 w-full rounded-lg overflow-hidden">
                          <Image
                            src={media.url}
                            alt={media.altText || 'Blog media'}
                            fill
                            className="object-cover"
                          />
                        </div>
                      ) : (
                        <video
                          src={media.url}
                          controls
                          className="w-full h-48 rounded-lg"
                        >
                          Your browser does not support the video tag.
                        </video>
                      )}
                      {media.caption && (
                        <p className="mt-2 text-sm text-gray-600 italic">{media.caption}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tags */}
            {blog.tags && blog.tags.length > 0 && (
              <div className="mt-8 pt-6 border-t border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {blog.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-gray-200 transition-colors"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </article>

        {/* SEO Information */}
        {blog.seo && (
          <div className="mt-8 p-6 bg-white rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">SEO Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {blog.seo.metaTitle && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Meta Title</label>
                  <p className="text-sm text-gray-600 p-2 bg-gray-50 rounded">{blog.seo.metaTitle}</p>
                </div>
              )}
              {blog.seo.metaDescription && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Meta Description</label>
                  <p className="text-sm text-gray-600 p-2 bg-gray-50 rounded">{blog.seo.metaDescription}</p>
                </div>
              )}
            </div>
            {blog.seo.keywords && blog.seo.keywords.length > 0 && (
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Keywords</label>
                <p className="text-sm text-gray-600 p-2 bg-gray-50 rounded">{blog.seo.keywords.join(', ')}</p>
              </div>
            )}
          </div>
        )}

        {/* Admin Actions */}
        <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <h4 className="font-medium text-yellow-800 mb-2">Admin Preview</h4>
          <p className="text-sm text-yellow-700 mb-3">
            This is how the blog post will appear to users. Status: <strong>{blog.status}</strong>
          </p>
          <div className="flex space-x-3">
            <Link
              href={`/blogs/${blogId}/edit`}
              className="inline-flex items-center px-3 py-1.5 bg-yellow-600 text-white text-sm rounded-md hover:bg-yellow-700 transition-colors"
            >
              <PencilIcon className="w-4 h-4 mr-1" />
              Edit
            </Link>
            {blog.status === 'published' && (
              <a
                href={`${process.env.NEXT_PUBLIC_FRONTEND_URL || 'http://localhost:3001'}/blogs/${blogId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-3 py-1.5 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 transition-colors"
              >
                <EyeIcon className="w-4 h-4 mr-1" />
                View Live
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}