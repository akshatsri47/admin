import { BlogData, BlogFormData, MediaItem } from '../types/blog';
import { Timestamp } from 'firebase/firestore';

// Validation functions
export const validateBlogTitle = (title: string): { isValid: boolean; error?: string } => {
  if (!title || title.trim().length === 0) {
    return { isValid: false, error: 'Title is required' };
  }
  
  if (title.length < 10) {
    return { isValid: false, error: 'Title must be at least 10 characters long' };
  }
  
  if (title.length > 200) {
    return { isValid: false, error: 'Title must be less than 200 characters' };
  }
  
  return { isValid: true };
};

export const validateBlogContent = (content: string): { isValid: boolean; error?: string } => {
  if (!content || content.trim().length === 0) {
    return { isValid: false, error: 'Content is required' };
  }
  
  // Remove HTML tags to check actual text content length
  const textContent = content.replace(/<[^>]*>/g, '').trim();
  if (textContent.length < 50) {
    return { isValid: false, error: 'Content must be at least 50 characters long' };
  }
  
  return { isValid: true };
};

export const validateMediaItem = (file: File): { isValid: boolean; error?: string } => {
  const imageTypes = ['image/jpeg', 'image/png', 'image/webp'];
  const videoTypes = ['video/mp4', 'video/webm'];
  const maxImageSize = 5 * 1024 * 1024; // 5MB
  const maxVideoSize = 50 * 1024 * 1024; // 50MB
  
  if (imageTypes.includes(file.type)) {
    if (file.size > maxImageSize) {
      return { isValid: false, error: 'Image size must be less than 5MB' };
    }
  } else if (videoTypes.includes(file.type)) {
    if (file.size > maxVideoSize) {
      return { isValid: false, error: 'Video size must be less than 50MB' };
    }
  } else {
    return { 
      isValid: false, 
      error: 'Invalid file type. Supported formats: JPEG, PNG, WebP for images; MP4, WebM for videos' 
    };
  }
  
  return { isValid: true };
};

// Slug generation
export const generateSlug = (title: string): string => {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/[\s_-]+/g, '-') // Replace spaces and underscores with hyphens
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
};

// Content sanitization
export const sanitizeHtmlContent = (html: string): string => {
  // Basic HTML sanitization - in production, consider using a library like DOMPurify
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove script tags
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '') // Remove iframe tags
    .replace(/on\w+="[^"]*"/gi, '') // Remove event handlers
    .replace(/javascript:/gi, ''); // Remove javascript: URLs
};

// Auto-generate excerpt from content
export const generateExcerpt = (content: string, maxLength: number = 160): string => {
  const textContent = content.replace(/<[^>]*>/g, '').trim();
  if (textContent.length <= maxLength) {
    return textContent;
  }
  
  return textContent.substring(0, maxLength).replace(/\s+\S*$/, '') + '...';
};

// Convert form data to blog data
export const formDataToBlogData = (
  formData: BlogFormData,
  author: { id: string; name: string; email: string },
  existingBlog?: BlogData
): Omit<BlogData, 'id'> => {
  const now = Timestamp.now();
  const slug = generateSlug(formData.title);
  
  const blogData: Record<string, unknown> = {
    title: formData.title.trim(),
    slug,
    content: sanitizeHtmlContent(formData.content),
    excerpt: formData.excerpt || generateExcerpt(formData.content),
    mediaItems: existingBlog?.mediaItems || [],
    categories: formData.categories,
    tags: formData.tags.map(tag => tag.trim().toLowerCase()),
    status: formData.status,
    publishDate: formData.publishDate ? Timestamp.fromDate(formData.publishDate) : now,
    createdAt: existingBlog?.createdAt || now,
    updatedAt: now,
    author,
    seo: {
      metaTitle: formData.seo.metaTitle || formData.title,
      metaDescription: formData.seo.metaDescription || generateExcerpt(formData.content),
      keywords: formData.seo.keywords || []
    },
    analytics: existingBlog?.analytics || {
      views: 0
    }
  };

  // Only add featuredImage if it exists
  if (formData.featuredImage) {
    blogData.featuredImage = formData.featuredImage;
  }

  return blogData as Omit<BlogData, 'id'>;
};

// Validate complete blog data
export const validateBlogData = (blogData: Partial<BlogData>): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (!blogData.title) {
    errors.push('Title is required');
  } else {
    const titleValidation = validateBlogTitle(blogData.title);
    if (!titleValidation.isValid) {
      errors.push(titleValidation.error!);
    }
  }
  
  if (!blogData.content) {
    errors.push('Content is required');
  } else {
    const contentValidation = validateBlogContent(blogData.content);
    if (!contentValidation.isValid) {
      errors.push(contentValidation.error!);
    }
  }
  
  if (!blogData.categories || blogData.categories.length === 0) {
    errors.push('At least one category is required');
  }
  
  if (!blogData.author || !blogData.author.id) {
    errors.push('Author information is required');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Media utilities
export const sortMediaByPosition = (mediaItems: MediaItem[]): MediaItem[] => {
  return [...mediaItems].sort((a, b) => a.position - b.position);
};

export const updateMediaPositions = (mediaItems: MediaItem[]): MediaItem[] => {
  return mediaItems.map((item, index) => ({
    ...item,
    position: index
  }));
};