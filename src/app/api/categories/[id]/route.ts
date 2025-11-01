import { NextRequest, NextResponse } from "next/server";
import { getCategoryById, updateCategory, deleteCategory, checkCategorySlugExists, getBlogs } from "../../../../lib/blogFirestore";
import { validateCategoryData, formDataToCategoryData } from "../../../../lib/categoryUtils";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: categoryId } = await params;

    if (!categoryId) {
      return NextResponse.json(
        { success: false, error: "Category ID is required" },
        { status: 400 }
      );
    }

    // Get category from Firestore
    const category = await getCategoryById(categoryId);

    if (!category) {
      return NextResponse.json(
        { success: false, error: "Category not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: category,
        message: "Successfully fetched category"
      },
      { status: 200 }
    );

  } catch (error) {
    console.error("Error fetching category:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Error fetching category",
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: categoryId } = await params;
    const body = await req.json();
    const { name, description, color } = body;

    if (!categoryId) {
      return NextResponse.json(
        { success: false, error: "Category ID is required" },
        { status: 400 }
      );
    }

    // Check if category exists
    const existingCategory = await getCategoryById(categoryId);
    if (!existingCategory) {
      return NextResponse.json(
        { success: false, error: "Category not found" },
        { status: 404 }
      );
    }

    // Create category data from form data
    const categoryData = formDataToCategoryData({
      name: name || existingCategory.name,
      description: description !== undefined ? description : existingCategory.description,
      color: color !== undefined ? color : existingCategory.color
    });

    // Validate category data
    const validation = validateCategoryData(categoryData);
    if (!validation.isValid) {
      return NextResponse.json(
        { success: false, error: "Validation failed", details: validation.errors },
        { status: 400 }
      );
    }

    // Check if slug already exists (excluding current category)
    if (categoryData.slug !== existingCategory.slug) {
      const slugExists = await checkCategorySlugExists(categoryData.slug, categoryId);
      if (slugExists) {
        // Generate a unique slug by appending a number
        let counter = 1;
        let uniqueSlug = `${categoryData.slug}-${counter}`;
        
        while (await checkCategorySlugExists(uniqueSlug, categoryId)) {
          counter++;
          uniqueSlug = `${categoryData.slug}-${counter}`;
        }
        
        categoryData.slug = uniqueSlug;
      }
    }

    // Update category in Firestore
    await updateCategory(categoryId, categoryData);

    // Get updated category
    const updatedCategory = await getCategoryById(categoryId);

    return NextResponse.json(
      {
        success: true,
        data: updatedCategory,
        message: "Category updated successfully"
      },
      { status: 200 }
    );

  } catch (error) {
    console.error("Error updating category:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Error updating category",
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: categoryId } = await params;

    if (!categoryId) {
      return NextResponse.json(
        { success: false, error: "Category ID is required" },
        { status: 400 }
      );
    }

    // Check if category exists
    const existingCategory = await getCategoryById(categoryId);
    if (!existingCategory) {
      return NextResponse.json(
        { success: false, error: "Category not found" },
        { status: 404 }
      );
    }

    // Check if category is being used by any blogs
    const blogsWithCategory = await getBlogs({ category: existingCategory.name }, 1);
    if (blogsWithCategory.blogs.length > 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: "Cannot delete category that is being used by blog posts",
          details: `This category is used by ${blogsWithCategory.totalCount} blog post(s). Please reassign or delete those posts first.`
        },
        { status: 409 }
      );
    }

    // Delete category from Firestore
    await deleteCategory(categoryId);

    return NextResponse.json(
      {
        success: true,
        message: "Category deleted successfully"
      },
      { status: 200 }
    );

  } catch (error) {
    console.error("Error deleting category:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Error deleting category",
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}