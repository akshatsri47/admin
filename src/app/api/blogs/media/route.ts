import { NextRequest, NextResponse } from 'next/server';
import cloudinary from '../../../../../utils/cloudinary';
import { MediaItem } from '../../../../types/blog';
import { validateMediaItem } from '../../../../lib/blogUtils';

// File validation constants
const MAX_FILES = 10;
const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm'];

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const files = formData.getAll('files') as File[];
    
    // Validate file count
    if (files.length === 0) {
      return NextResponse.json(
        { error: 'No files provided' },
        { status: 400 }
      );
    }
    
    if (files.length > MAX_FILES) {
      return NextResponse.json(
        { error: `Maximum ${MAX_FILES} files allowed` },
        { status: 400 }
      );
    }
    
    // Validate each file
    const validationErrors: string[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const validation = validateMediaItem(file);
      if (!validation.isValid) {
        validationErrors.push(`File ${i + 1}: ${validation.error}`);
      }
    }
    
    if (validationErrors.length > 0) {
      return NextResponse.json(
        { error: 'File validation failed', details: validationErrors },
        { status: 400 }
      );
    }
    
    // Upload files to Cloudinary
    const uploadedMedia: MediaItem[] = [];
    const uploadErrors: string[] = [];
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      try {
        // Convert file to buffer
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        
        // Determine resource type and folder
        const isVideo = ALLOWED_VIDEO_TYPES.includes(file.type);
        const resourceType = isVideo ? 'video' : 'image';
        const folder = `blogs/${resourceType}s`;
        
        // Upload to Cloudinary
        const uploadResult = await new Promise((resolve, reject) => {
          cloudinary.uploader.upload_stream(
            {
              resource_type: resourceType,
              folder: folder,
              use_filename: true,
              unique_filename: true,
              overwrite: false,
            },
            (error, result) => {
              if (error) reject(error);
              else if (result) resolve(result);
              else reject(new Error('Upload failed - no result'));
            }
          ).end(buffer);
        }) as { secure_url: string; public_id: string; width?: number; height?: number };
        
        // Create MediaItem object
        const mediaItem: MediaItem = {
          id: uploadResult.public_id,
          type: isVideo ? 'video' : 'image',
          url: uploadResult.secure_url,
          cloudinaryId: uploadResult.public_id,
          position: i,
          size: file.size,
          dimensions: {
            width: uploadResult.width || 0,
            height: uploadResult.height || 0,
          },
        };
        
        uploadedMedia.push(mediaItem);
        
      } catch (error) {
        console.error(`Error uploading file ${file.name}:`, error);
        uploadErrors.push(`Failed to upload ${file.name}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }
    
    // Return results
    if (uploadedMedia.length === 0) {
      return NextResponse.json(
        { 
          error: 'All uploads failed', 
          details: uploadErrors 
        },
        { status: 500 }
      );
    }
    
    const response: {
      success: boolean;
      mediaItems: MediaItem[];
      uploadedCount: number;
      totalCount: number;
      partialSuccess?: boolean;
      errors?: string[];
    } = {
      success: true,
      mediaItems: uploadedMedia,
      uploadedCount: uploadedMedia.length,
      totalCount: files.length,
    };
    
    if (uploadErrors.length > 0) {
      response.partialSuccess = true;
      response.errors = uploadErrors;
    }
    
    return NextResponse.json(response, { status: 201 });
    
  } catch (error) {
    console.error('Error in media upload endpoint:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}