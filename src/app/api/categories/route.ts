import { NextRequest, NextResponse } from "next/server";
import { createCategory, getCategories, checkCategorySlugExists } from "../../../lib/blogFirestore";
import { validateCategoryData, formDataToCategoryData } from "../../../lib/categoryUtils";
import { Timestamp } from "firebase/firestore";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, description, color } = body;

    // Validate required fields
    if (!name) {
      return NextResponse.json(
        { success: false, error: "Category name is required" },
        { status: 400 }
      );
    }

    // Create category data from form data
    const categoryData = formDataToCategoryData({
      name,
      description,
      color
    });

    // Validate category data
    const validation = validateCategoryData(categoryData);
    if (!validation.isValid) {
      return NextResponse.json(
        { success: false, error: "Validation failed", details: validation.errors },
        { status: 400 }
      );
    }

    // Check if slug already exists
    const slugExists = await checkCategorySlugExists(categoryData.slug);
    if (slugExists) {
      // Generate a unique slug by appending a number
      let counter = 1;
      let uniqueSlug = `${categoryData.slug}-${counter}`;
      
      while (await checkCategorySlugExists(uniqueSlug)) {
        counter++;
        uniqueSlug = `${categoryData.slug}-${counter}`;
      }
      
      categoryData.slug = uniqueSlug;
    }

    // Create category in Firestore
    const categoryId = await createCategory({
      ...categoryData,
      blogCount: 0
    });

    return NextResponse.json(
      {
        success: true,
        data: { id: categoryId, ...categoryData, blogCount: 0, createdAt: Timestamp.now() },
        message: "Category created successfully"
      },
      { status: 201 }
    );

  } catch (error) {
    console.error("Error creating category:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Error creating category",
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    // Get all categories from Firestore
    const categories = await getCategories();

    return NextResponse.json(
      {
        success: true,
        data: categories,
        message: "Successfully fetched categories"
      },
      { status: 200 }
    );

  } catch (error) {
    console.error("Error fetching categories:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Error fetching categories",
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}