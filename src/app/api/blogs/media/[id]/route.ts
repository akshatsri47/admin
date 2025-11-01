import { NextRequest, NextResponse } from 'next/server';
import cloudinary from '../../../../../../utils/cloudinary';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    if (!id) {
      return NextResponse.json(
        { error: 'Media ID is required' },
        { status: 400 }
      );
    }
    
    // Decode the ID in case it was URL encoded
    const decodedId = decodeURIComponent(id);
    
    try {
      // Delete from Cloudinary
      const result = await cloudinary.uploader.destroy(decodedId, {
        resource_type: 'auto' // This will handle both images and videos
      });
      
      if (result.result === 'ok') {
        return NextResponse.json({
          success: true,
          message: 'Media deleted successfully',
          cloudinaryId: decodedId
        });
      } else if (result.result === 'not found') {
        return NextResponse.json(
          { 
            error: 'Media not found',
            cloudinaryId: decodedId
          },
          { status: 404 }
        );
      } else {
        return NextResponse.json(
          { 
            error: 'Failed to delete media',
            details: result,
            cloudinaryId: decodedId
          },
          { status: 500 }
        );
      }
      
    } catch (cloudinaryError) {
      console.error('Cloudinary deletion error:', cloudinaryError);
      
      // Check if it's a "not found" error
      if (cloudinaryError instanceof Error && cloudinaryError.message.includes('not found')) {
        return NextResponse.json(
          { 
            error: 'Media not found',
            cloudinaryId: decodedId
          },
          { status: 404 }
        );
      }
      
      return NextResponse.json(
        { 
          error: 'Failed to delete media from Cloudinary',
          message: cloudinaryError instanceof Error ? cloudinaryError.message : 'Unknown error',
          cloudinaryId: decodedId
        },
        { status: 500 }
      );
    }
    
  } catch (error) {
    console.error('Error in media deletion endpoint:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Optional: Add GET method to check if media exists
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    if (!id) {
      return NextResponse.json(
        { error: 'Media ID is required' },
        { status: 400 }
      );
    }
    
    const decodedId = decodeURIComponent(id);
    
    try {
      // Check if resource exists in Cloudinary
      const result = await cloudinary.api.resource(decodedId, {
        resource_type: 'auto'
      });
      
      return NextResponse.json({
        exists: true,
        cloudinaryId: decodedId,
        url: result.secure_url,
        resourceType: result.resource_type,
        format: result.format,
        size: result.bytes,
        dimensions: {
          width: result.width,
          height: result.height
        },
        createdAt: result.created_at
      });
      
    } catch (cloudinaryError) {
      if (cloudinaryError instanceof Error && cloudinaryError.message.includes('not found')) {
        return NextResponse.json(
          { 
            exists: false,
            cloudinaryId: decodedId
          },
          { status: 404 }
        );
      }
      
      throw cloudinaryError;
    }
    
  } catch (error) {
    console.error('Error checking media existence:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}