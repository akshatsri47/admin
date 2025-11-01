import { MediaItem } from '../types/blog';

// Media upload response types
export interface MediaUploadResponse {
  success: boolean;
  mediaItems: MediaItem[];
  uploadedCount: number;
  totalCount: number;
  partialSuccess?: boolean;
  errors?: string[];
}

export interface MediaDeleteResponse {
  success: boolean;
  message: string;
  cloudinaryId: string;
}

// Upload multiple media files
export const uploadMediaFiles = async (files: File[]): Promise<MediaUploadResponse> => {
  const formData = new FormData();
  
  // Append all files to form data
  files.forEach(file => {
    formData.append('files', file);
  });
  
  try {
    const response = await fetch('/api/blogs/media', {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Upload failed');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error uploading media files:', error);
    throw error;
  }
};

// Delete a media file
export const deleteMediaFile = async (cloudinaryId: string): Promise<MediaDeleteResponse> => {
  try {
    const encodedId = encodeURIComponent(cloudinaryId);
    const response = await fetch(`/api/blogs/media/${encodedId}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Delete failed');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error deleting media file:', error);
    throw error;
  }
};

// Check if media file exists
export const checkMediaExists = async (cloudinaryId: string): Promise<boolean> => {
  try {
    const encodedId = encodeURIComponent(cloudinaryId);
    const response = await fetch(`/api/blogs/media/${encodedId}`, {
      method: 'GET',
    });
    
    if (response.ok) {
      const data = await response.json();
      return data.exists;
    }
    
    return false;
  } catch (error) {
    console.error('Error checking media existence:', error);
    return false;
  }
};

// Generate Cloudinary transformation URLs
export const generateCloudinaryUrl = (
  cloudinaryId: string,
  transformations?: {
    width?: number;
    height?: number;
    crop?: 'fill' | 'fit' | 'scale' | 'crop';
    quality?: 'auto' | number;
    format?: 'auto' | 'webp' | 'jpg' | 'png';
  }
): string => {
  const baseUrl = `https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}`;
  
  if (!transformations) {
    return `${baseUrl}/image/upload/${cloudinaryId}`;
  }
  
  const transformParts: string[] = [];
  
  if (transformations.width) {
    transformParts.push(`w_${transformations.width}`);
  }
  
  if (transformations.height) {
    transformParts.push(`h_${transformations.height}`);
  }
  
  if (transformations.crop) {
    transformParts.push(`c_${transformations.crop}`);
  }
  
  if (transformations.quality) {
    transformParts.push(`q_${transformations.quality}`);
  }
  
  if (transformations.format) {
    transformParts.push(`f_${transformations.format}`);
  }
  
  const transformString = transformParts.length > 0 ? `${transformParts.join(',')}/` : '';
  
  return `${baseUrl}/image/upload/${transformString}${cloudinaryId}`;
};

// Generate responsive image URLs
export const generateResponsiveImageUrls = (
  cloudinaryId: string,
  sizes: number[] = [320, 640, 768, 1024, 1280, 1920]
): { [key: number]: string } => {
  const urls: { [key: number]: string } = {};
  
  sizes.forEach(size => {
    urls[size] = generateCloudinaryUrl(cloudinaryId, {
      width: size,
      crop: 'scale',
      quality: 'auto',
      format: 'auto'
    });
  });
  
  return urls;
};

// Validate file before upload
export const validateFileForUpload = (file: File): { isValid: boolean; error?: string } => {
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

// Batch validate files
export const validateFilesForUpload = (files: File[]): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  const maxFiles = 10;
  
  if (files.length === 0) {
    errors.push('No files selected');
  }
  
  if (files.length > maxFiles) {
    errors.push(`Maximum ${maxFiles} files allowed`);
  }
  
  files.forEach((file, index) => {
    const validation = validateFileForUpload(file);
    if (!validation.isValid) {
      errors.push(`File ${index + 1} (${file.name}): ${validation.error}`);
    }
  });
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Clean up media items that are no longer referenced
export const cleanupUnusedMedia = async (mediaItems: MediaItem[]): Promise<void> => {
  // This function would be called when a blog is deleted or media is removed
  // It ensures that Cloudinary resources are properly cleaned up
  
  const deletePromises = mediaItems.map(async (item) => {
    try {
      await deleteMediaFile(item.cloudinaryId);
    } catch (error) {
      console.error(`Failed to delete media ${item.cloudinaryId}:`, error);
      // Don't throw - we want to continue cleaning up other items
    }
  });
  
  await Promise.allSettled(deletePromises);
};