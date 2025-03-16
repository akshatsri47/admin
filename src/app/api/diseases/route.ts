import { NextResponse } from "next/server";
import { db } from "../../../../utils/firebase"
import { collection, addDoc, query, where, getDocs } from "firebase/firestore";
import { Disease } from "../../../../types/types";

export async function POST(req: Request) {
  try {
    const { name, imageUrl, cropId }: Disease = await req.json();

    if (!name || !imageUrl || !cropId) {
      return NextResponse.json({ error: "Name, Image URL, and Crop ID are required" }, { status: 400 });
    }

    // Add disease to Firestore
    const docRef = await addDoc(collection(db, "diseases"), {
      name,
      imageUrl,
      cropId,
    });

    return NextResponse.json({ message: "Disease added successfully", id: docRef.id }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to add disease", details: error }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const cropId = searchParams.get("cropId");

    let diseasesSnapshot;

    if (cropId) {
      // If cropId is provided, query for diseases of that crop
      const q = query(collection(db, "diseases"), where("cropId", "==", cropId));
      diseasesSnapshot = await getDocs(q);
    } else {
      // Otherwise, fetch all diseases
      diseasesSnapshot = await getDocs(collection(db, "diseases"));
    }

    const diseases: Disease[] = diseasesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Disease[];

    return NextResponse.json(diseases, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch diseases", details: error }, { status: 500 });
  }
}
