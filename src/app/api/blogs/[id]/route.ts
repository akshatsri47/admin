import { NextRequest, NextResponse } from "next/server";
import { getBlogById, updateBlog, deleteBlog } from "../../../../lib/blogFirestore";
import { validateBlogData, formDataToBlogData } from "../../../../lib/blogUtils";
import { BlogFormData } from "../../../../types/blog";

export async function GET(request: NextRequest) {
  try {
    const id = request.url.split('/').pop();

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Blog ID is required" },
        { status: 400 }
      );
    }

    const blog = await getBlogById(id);

    if (!blog) {
      return NextResponse.json(
        { success: false, error: "Blog not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: blog,
        message: "Successfully fetched blog"
      },
      { status: 200 }
    );

  } catch (error) {
    console.error("Error fetching blog:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Error fetching blog",
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const id = req.url.split('/').pop();
    
    if (!id) {
      return NextResponse.json(
        { success: false, error: "Blog ID is required" },
        { status: 400 }
      );
    }

    // Check if blog exists
    const existingBlog = await getBlogById(id);
    if (!existingBlog) {
      return NextResponse.json(
        { success: false, error: "Blog not found" },
        { status: 404 }
      );
    }

    const body = await req.json();
    const {
      title,
      content,
      excerpt,
      featuredImage,
      categories,
      tags,
      status,
      publishDate,
      seo,
      author
    } = body as BlogFormData & { author: { id: string; name: string; email: string } };

    // Validate required fields
    if (!title || !content || !categories || !author) {
      return NextResponse.json(
        { success: false, error: "Missing required fields: title, content, categories, and author are required" },
        { status: 400 }
      );
    }

    // Create updated blog data from form data
    const updatedBlogData = formDataToBlogData(
      {
        title,
        content,
        excerpt: excerpt || "",
        featuredImage,
        categories,
        tags: tags || [],
        status: status || existingBlog.status,
        publishDate: publishDate ? new Date(publishDate) : undefined,
        seo: seo || {}
      },
      author,
      existingBlog
    );

    // Validate blog data
    const validation = validateBlogData(updatedBlogData);
    if (!validation.isValid) {
      return NextResponse.json(
        { success: false, error: "Validation failed", details: validation.errors },
        { status: 400 }
      );
    }

    // Update blog in Firestore
    await updateBlog(id, updatedBlogData);

    return NextResponse.json(
      {
        success: true,
        data: { id, ...updatedBlogData },
        message: "Blog updated successfully"
      },
      { status: 200 }
    );

  } catch (error) {
    console.error("Error updating blog:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Error updating blog",
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const id = req.url.split('/').pop();

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Blog ID is required" },
        { status: 400 }
      );
    }

    // Check if blog exists
    const existingBlog = await getBlogById(id);
    if (!existingBlog) {
      return NextResponse.json(
        { success: false, error: "Blog not found" },
        { status: 404 }
      );
    }

    // Delete blog from Firestore
    await deleteBlog(id);

    // Note: In a production environment, you might also want to:
    // 1. Delete associated media files from Cloudinary
    // 2. Update category blog counts
    // 3. Log the deletion for audit purposes

    return NextResponse.json(
      {
        success: true,
        message: "Blog deleted successfully"
      },
      { status: 200 }
    );

  } catch (error) {
    console.error("Error deleting blog:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Error deleting blog",
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}