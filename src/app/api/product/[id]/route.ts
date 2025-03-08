import { NextRequest, NextResponse } from "next/server";
import { db } from "../../../../../utils/firebase";
import { doc, getDoc ,deleteDoc, updateDoc} from "firebase/firestore";
import cloudinary from "../../../../../utils/cloudinary";
// import { Product } from "../../../../../types/types";


export const config = {
  api: {
    bodyParser: {
      sizeLimit: '16mb', // Increased to handle larger images
    },
    responseLimit: false,
  },
};

export async function GET(request: NextRequest) {
  try {
    const  id  = request.url.split('/').pop();

    if (!id) {
      return NextResponse.json({ success: false, error: "Product ID is required" }, { status: 400 });
    }

    const productRef = doc(db, "products", id);
    const productSnap = await getDoc(productRef);

    if (!productSnap.exists()) {
      return NextResponse.json({ success: false, error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: { id: productSnap.id, ...productSnap.data() },
      message: "Successfully fetched product",
    }, { status: 200 });

  } catch (error) {
    console.error("Error fetching product:", error);
    return NextResponse.json({ success: false, error: "Error fetching product" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    
    const  id  = req.url.split('/').pop()

    if (!id) return NextResponse.json({ success: false, error: "Product ID is required" }, { status: 400 });

    const productRef = doc(db, "products", id);
    const productSnap = await getDoc(productRef);

    if (!productSnap.exists()) return NextResponse.json({ success: false, error: "Product not found" }, { status: 404 });

    await deleteDoc(productRef);

    return NextResponse.json({ success: true, message: "Product deleted successfully" }, { status: 200 });
  } catch (e) {
    return NextResponse.json({ success: false, error: "Error deleting product"+e }, { status: 500 });
  }
}


export async function PUT(
  req: NextRequest,

) {
  try {
    // Correct way to access the id from the URL in App Router
    const id = req.url.split('/').pop();
    
    if (!id) {
      return NextResponse.json(
        { success: false, error: "Product ID is required" },
        { status: 400 }
      );
    }
    
    const formData = await req.formData();
    // Check if product exists first
    const productRef = doc(db, "products", id);
    const productSnap = await getDoc(productRef);

    if (!productSnap.exists()) {
      return NextResponse.json(
        { success: false, error: "Product not found" },
        { status: 404 }
      );
    }

    const existingProduct = productSnap.data();

    // Extracting fields
    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const category = formData.get("category") as string;
    const manufacturer = formData.get("manufacturer") as string;
    const composition = formData.get("composition") as string;
    const commonlyUsedFor = formData.getAll("commonlyUsedFor") as string[];
    const avoidForCrops = formData.getAll("avoidForCrops") as string[];
    const benefits = formData.getAll("benefits") as string[];

    // Extracting dosage details
    const method = formData.get("method") as string;
    const dosage = JSON.parse(formData.get("dosage") as string) as {
      dose: string;
      arce: string;
    };

    // Extracting pricing details
    const pricing = JSON.parse(formData.get("pricing") as string) as {
      packageSize: string;
      price: number;
    }[];

    // Get image URLs - exactly as done in POST API
    const imageUrls: string[] = [];
    const imageUrlsData = formData.getAll("imageUrls[]") as string[];
    
    // If we get individual image URLs
    if (imageUrlsData.length > 0) {
      imageUrls.push(...imageUrlsData);
    } else {
      // Alternative: check if they're encoded as JSON
      const imageUrlsJson = formData.get("imageUrls") as string;
      if (imageUrlsJson) {
        try {
          const parsedUrls = JSON.parse(imageUrlsJson);
          if (Array.isArray(parsedUrls)) {
            imageUrls.push(...parsedUrls);
          }
        } catch (e) {
          console.error("Error parsing image URLs:", e);
        }
      }
    }

    // Get existing images from the product
    const oldImages = existingProduct.images || [];
    
    // Find images that need to be deleted (in old but not in new)
    const imagesToDelete = oldImages.filter(
      (oldUrl: string) => !imageUrls.includes(oldUrl)
    );

    // Delete old images from Cloudinary
    if (imagesToDelete.length > 0) {
      for (const imageUrl of imagesToDelete) {
        try {
          // Extract public_id from URL
          const urlParts = imageUrl.split("/");
          const filenameWithExt = urlParts[urlParts.length - 1];
          const publicId = filenameWithExt.split(".")[0];
          
          // Delete from Cloudinary
          await cloudinary.uploader.destroy(publicId);
          console.log(`Deleted image from Cloudinary: ${publicId}`);
        } catch (error) {
          console.error("Error deleting image from Cloudinary:", error);
        }
      }
    }

    // Validate required fields
    if (
      !name ||
      !description ||
      !category ||
      !manufacturer ||
      !composition ||
      !method ||
      !dosage ||
      !pricing.length ||
      !imageUrls.length
    ) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

   
    
    const updatedAt = new Date().toISOString();
   

    // Creating updated product object
    const updatedProduct = {
      name,
      description,
      category,
      images: imageUrls,
      updatedAt,
      manufacturer,
      composition,
      commonlyUsedFor,
      avoidForCrops,
     
      pricing,
      dosage: {
        method,
        dosage,
      },
     
      benefits,
      
    };

    // Update in Firestore
    await updateDoc(productRef, updatedProduct);

    return NextResponse.json({
      success: true,
      data: { id, ...updatedProduct }
    }, { status: 200 });

  } catch (error) {
    console.error("Error updating product:", error);
    return NextResponse.json(
      { success: false, error: "Error updating product", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

// Make sure to import cloudinary properly
