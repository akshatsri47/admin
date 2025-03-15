import { NextResponse, NextRequest } from "next/server";
import { db } from "../../../../../utils/firebase";
import { doc, getDoc, updateDoc, deleteDoc } from "firebase/firestore";


function extractId(url: string): string | null {
  const parts = url.split('/');
  const id = parts.pop();
  return id || null;
}

// GET: Fetch a single disease by id
export async function GET(request: NextRequest) {
  try {
    const id = extractId(request.url);
    if (!id) {
      return NextResponse.json({ error: "Disease id is required" }, { status: 400 });
    }
    const diseaseRef = doc(db, "diseases", id);
    const diseaseSnap = await getDoc(diseaseRef);
    if (!diseaseSnap.exists()) {
      return NextResponse.json({ error: "Disease not found" }, { status: 404 });
    }
    return NextResponse.json({ id: diseaseSnap.id, ...diseaseSnap.data() }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch disease", details: error }, { status: 500 });
  }
}

// PUT: Update a disease by id
export async function PUT(request: NextRequest) {
  try {
    const id = extractId(request.url);
    if (!id) {
      return NextResponse.json({ error: "Disease id is required" }, { status: 400 });
    }
    const { name, imageUrl, cropId } = await request.json();
    if (!name || !imageUrl || !cropId) {
      return NextResponse.json({ error: "Name, imageUrl, and cropId are required" }, { status: 400 });
    }
    const diseaseRef = doc(db, "diseases", id);
    await updateDoc(diseaseRef, { name, imageUrl, cropId });
    return NextResponse.json({ message: "Disease updated successfully" }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to update disease", details: error }, { status: 500 });
  }
}

// DELETE: Delete a disease by id
export async function DELETE(request: NextRequest) {
  try {
    const id = extractId(request.url);
    if (!id) {
      return NextResponse.json({ error: "Disease id is required" }, { status: 400 });
    }
    const diseaseRef = doc(db, "diseases", id);
    await deleteDoc(diseaseRef);
    return NextResponse.json({ message: "Disease deleted successfully" }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete disease", details: error }, { status: 500 });
  }
}