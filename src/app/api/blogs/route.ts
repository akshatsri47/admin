import { NextRequest, NextResponse } from "next/server";
import { createBlog, getBlogs } from "../../../lib/blogFirestore";
import { validateBlogData, formDataToBlogData } from "../../../lib/blogUtils";
import { BlogFormData, BlogFilters } from "../../../types/blog";

export async function POST(req: NextRequest) {
  try {
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
      author,
    } = body as BlogFormData & {
      author: { id: string; name: string; email: string };
    };

    // Validate required fields
    if (!title || !content || !categories || !author) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Missing required fields: title, content, categories, and author are required",
        },
        { status: 400 }
      );
    }

    // Create blog data from form data
    const blogData = formDataToBlogData(
      {
        title,
        content,
        excerpt: excerpt || "",
        featuredImage,
        categories,
        tags: tags || [],
        status: status || "draft",
        publishDate: publishDate ? new Date(publishDate) : undefined,
        seo: seo || {},
      },
      author
    );

    // Validate blog data
    const validation = validateBlogData(blogData);
    if (!validation.isValid) {
      return NextResponse.json(
        {
          success: false,
          error: "Validation failed",
          details: validation.errors,
        },
        { status: 400 }
      );
    }

    // Create blog in Firestore
    const blogId = await createBlog(blogData);

    return NextResponse.json(
      {
        success: true,
        data: { id: blogId, ...blogData },
        message: "Blog created successfully",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating blog:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Error creating blog",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    // Parse query parameters
    const status = searchParams.get("status") as
      | "draft"
      | "published"
      | "scheduled"
      | null;
    const category = searchParams.get("category");
    const tags = searchParams.get("tags")?.split(",").filter(Boolean);
    const searchQuery = searchParams.get("search");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    // Build filters
    const filters: BlogFilters = {};

    if (status) filters.status = status;
    if (category) filters.category = category;
    if (tags && tags.length > 0) filters.tags = tags;
    if (searchQuery) filters.searchQuery = searchQuery;

    if (startDate || endDate) {
      filters.dateRange = {};
      if (startDate) filters.dateRange.start = new Date(startDate);
      if (endDate) filters.dateRange.end = new Date(endDate);
    }

    // Get blogs from Firestore
    const result = await getBlogs(filters, limit);

    // If search query is provided, filter results client-side
    // (Note: For production, consider implementing server-side search with Algolia or similar)
    let filteredBlogs = result.blogs;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filteredBlogs = result.blogs.filter(
        (blog) =>
          blog.title.toLowerCase().includes(query) ||
          blog.content.toLowerCase().includes(query) ||
          blog.excerpt.toLowerCase().includes(query) ||
          blog.tags.some((tag) => tag.toLowerCase().includes(query))
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: {
          blogs: filteredBlogs,
          totalCount: filteredBlogs.length,
          hasMore: result.hasMore,
          currentPage: page,
          totalPages: Math.ceil(filteredBlogs.length / limit),
        },
        message: "Successfully fetched blogs",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching blogs:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Error fetching blogs",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
