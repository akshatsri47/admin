import { NextRequest, NextResponse } from "next/server";
import { db } from "../../../../utils/firebase";
import { collection, getDocs, addDoc, updateDoc, doc } from "firebase/firestore"; 

type Slide = {
  title: string;
  description: string;
  imageUrl: string;
  link: string;
  bgColor: string;
};

// ✅ GET Handler - Fetch all slides
export async function GET() {
  try {
    const snapshot = await getDocs(collection(db, "slides"));
    const slides: Slide[] = snapshot.docs.map((doc) => ({
      id: doc.id, // Include Firestore document ID
      ...(doc.data() as Slide),
    }));

    return NextResponse.json(slides, { status: 200 });
  } catch (error) {
    console.error("Error fetching slides:", error);
    return NextResponse.json({ message: "Error fetching slides" }, { status: 500 });
  }
}

// ✅ POST Handler - Add a new slide
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { title, description, imageUrl, link, bgColor } = body;

    if (!title || !description || !imageUrl || !link || !bgColor) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
    }

    const newSlide = { title, description, imageUrl, link, bgColor };
    const docRef = await addDoc(collection(db, "slides"), newSlide);

    return NextResponse.json({ id: docRef.id, ...newSlide }, { status: 201 });
  } catch (error) {
    console.error("Error adding slide:", error);
    return NextResponse.json({ message: "Error adding slide" }, { status: 500 });
  }
}

// ✅ PUT Handler - Update an existing slide
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, title, description, imageUrl, link, bgColor } = body;

    if (!id) {
      return NextResponse.json({ message: "Slide ID is required for updating." }, { status: 400 });
    }

    const slideRef = doc(db, "slides", id);

    await updateDoc(slideRef, {
      title,
      description,
      imageUrl,
      link,
      bgColor,
    });

    return NextResponse.json({ message: "Slide updated successfully" }, { status: 200 });
  } catch (error) {
    console.error("Error updating slide:", error);
    return NextResponse.json({ message: "Error updating slide" }, { status: 500 });
  }
}
