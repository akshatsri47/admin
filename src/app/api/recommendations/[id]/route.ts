import { NextResponse } from "next/server";
import { db } from "../../../../../utils/firebase";
import { doc, getDoc, updateDoc, deleteDoc } from "firebase/firestore";


function extractId(url: string): string | null {
  const parts = url.split("/");
  const id = parts.pop();
  return id || null;
}

// GET: Fetch a single recommendation by id
export async function GET(req: Request) {
  try {
    const id = extractId(req.url);
    if (!id) {
      return NextResponse.json({ error: "No ID found in URL" }, { status: 400 });
    }

    const recommendationRef = doc(db, "recommendations", id);
    const recommendationSnap = await getDoc(recommendationRef);
    if (!recommendationSnap.exists()) {
      return NextResponse.json({ error: "Recommendation not found" }, { status: 404 });
    }

    return NextResponse.json(
      { id: recommendationSnap.id, ...recommendationSnap.data() },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch recommendation", details: String(error) },
      { status: 500 }
    );
  }
}

// PUT: Update a recommendation by id
export async function PUT(req: Request) {
  try {
    const id = extractId(req.url);
    if (!id) {
      return NextResponse.json({ error: "No ID found in URL" }, { status: 400 });
    }

    const { cropId, diseaseId, productIds } = await req.json();
    if (!cropId || !diseaseId || !Array.isArray(productIds) || productIds.length === 0) {
      return NextResponse.json(
        {
          error: "Invalid input. Provide cropId, diseaseId, and at least one productId."
        },
        { status: 400 }
      );
    }

    const recommendationRef = doc(db, "recommendations", id);
    await updateDoc(recommendationRef, { cropId, diseaseId, productIds });

    return NextResponse.json(
      { message: "Recommendation updated successfully" },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update recommendation", details: String(error) },
      { status: 500 }
    );
  }
}

// DELETE: Delete a recommendation by id
export async function DELETE(req: Request) {
  try {
    const id = extractId(req.url);
    if (!id) {
      return NextResponse.json({ error: "No ID found in URL" }, { status: 400 });
    }

    const recommendationRef = doc(db, "recommendations", id);
    await deleteDoc(recommendationRef);

    return NextResponse.json(
      { message: "Recommendation deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete recommendation", details: String(error) },
      { status: 500 }
    );
  }
}

