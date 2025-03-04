import { NextRequest, NextResponse } from "next/server";
import { db } from "../../../../../utils/firebase";
import { doc, getDoc ,deleteDoc, updateDoc} from "firebase/firestore";
import cloudinary from "../../../../../utils/cloudinary";

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


export async function PUT(req: NextRequest) {
  try {
    const id = req.url.split("/").pop();
    if (!id) {
      return NextResponse.json({ success: false, error: "Product ID is required" }, { status: 400 });
    }

    const productRef = doc(db, "products", id);
    const productSnap = await getDoc(productRef);
    if (!productSnap.exists()) {
      return NextResponse.json({ success: false, error: "Product not found" }, { status: 404 });
    }

    const formData = await req.formData();
    const updatedFields: any = {};

    // Extract text fields
    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const category = formData.get("category") as string;
    const manufacturer = formData.get("manufacturer") as string;
    const composition = formData.get("composition") as string;
    const method = formData.get("method") as string;

    if (name) updatedFields.name = name;
    if (description) updatedFields.description = description;
    if (category) updatedFields.category = category;
    if (manufacturer) updatedFields.manufacturer = manufacturer;
    if (composition) updatedFields.composition = composition;
    if (method) updatedFields.method = method;

    // Handle images: REMOVE OLD IMAGES and ADD NEW ONES
    const newImages = formData.getAll("images") as File[];
    const uploadedImageUrls: string[] = [];

    // Upload new images to Cloudinary
    for (const image of newImages) {
      const buffer = await image.arrayBuffer();
      const base64Image = Buffer.from(buffer).toString("base64");
      const uploadResponse = await cloudinary.uploader.upload(`data:${image.type};base64,${base64Image}`, {
        folder: "products",
        format: "jpg", // Convert to JPG for consistency
        transformation: [{ quality: "auto" }],
      });

      uploadedImageUrls.push(uploadResponse.secure_url);
    }

    // Replace images with the newly uploaded ones
    updatedFields.images = uploadedImageUrls;

    // Update Firestore
    await updateDoc(productRef, updatedFields);

    return NextResponse.json({ success: true, message: "Product updated successfully", data: updatedFields }, { status: 200 });

  } catch (error) {
    console.error("Error updating product:", error);
    return NextResponse.json({ success: false, error: "Error updating product" }, { status: 500 });
  }
}
