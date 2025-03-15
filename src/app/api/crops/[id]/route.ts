import { NextResponse, NextRequest } from "next/server";
import { db } from "../../../../../utils/firebase";
import { doc, getDoc, updateDoc, deleteDoc } from "firebase/firestore";

// Helper function to extract id from the request URL
function extractId(url: string): string | null {
  const parts = url.split('/');
  const id = parts.pop();
  return id || null;
}

// GET: Fetch a single crop by id
export async function GET(request: NextRequest) {
  try {
    const id = extractId(request.url);
    if (!id) {
      return NextResponse.json(
        { success: false, error: "Product ID is required" },
        { status: 400 }
      );
    }
    const cropRef = doc(db, "crops", id);
    const cropSnap = await getDoc(cropRef);
    if (!cropSnap.exists()) {
      return NextResponse.json(
        { error: "Crop not found" },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { id: cropSnap.id, ...cropSnap.data() },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch crop", details: error },
      { status: 500 }
    );
  }
}

// PUT: Update a crop by id
export async function PUT(request: NextRequest) {
  try {
    const id = extractId(request.url);
    if (!id) {
      return NextResponse.json(
        { error: "Product ID is required" },
        { status: 400 }
      );
    }
    const { name, imageUrl } = await request.json();
    if (!name || !imageUrl) {
      return NextResponse.json(
        { error: "Name and imageUrl are required" },
        { status: 400 }
      );
    }
    const cropRef = doc(db, "crops", id);
    await updateDoc(cropRef, { name, imageUrl });
    return NextResponse.json(
      { message: "Crop updated successfully" },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update crop", details: error },
      { status: 500 }
    );
  }
}

// DELETE: Delete a crop by id
export async function DELETE(request: NextRequest) {
  try {
    const id = extractId(request.url);
    if (!id) {
      return NextResponse.json(
        { error: "Product ID is required" },
        { status: 400 }
      );
    }
    const cropRef = doc(db, "crops", id);
    await deleteDoc(cropRef);
    return NextResponse.json(
      { message: "Crop deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete crop", details: error },
      { status: 500 }
    );
  }
}
