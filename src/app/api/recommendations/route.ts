import { NextResponse } from "next/server";
import { db } from "../../../../utils/firebase"// Ensure the correct path to your Firestore setup
import { collection, addDoc, getDocs, query, where } from "firebase/firestore";
import { Recommendation } from "../../../../types/types"; // Ensure correct import of TypeScript types

// ✅ Handle POST request to add recommendations
export async function POST(req: Request) {
    try {
        const { cropId, diseaseId, productIds }: Recommendation = await req.json();

        if (!cropId || !diseaseId || !Array.isArray(productIds) || productIds.length === 0) {
            return NextResponse.json(
                { error: "Invalid input. Provide cropId, diseaseId, and at least one productId." },
                { status: 400 }
            );
        }

        const docRef = await addDoc(collection(db, "recommendations"), {
            cropId,
            diseaseId,
            productIds
        });

        return NextResponse.json({ message: "Recommendation added successfully", id: docRef.id }, { status: 201 });

    } catch (error) {
        return NextResponse.json(
            { error: "Failed to add recommendation", details: (error as Error).message },
            { status: 500 }
        );
    }
}

// ✅ Handle GET request to fetch recommendations
export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const cropId = searchParams.get("cropId");
        const diseaseId = searchParams.get("diseaseId");

        if (!cropId || !diseaseId) {
            return NextResponse.json({ error: "cropId and diseaseId are required" }, { status: 400 });
        }

        // Query Firestore for matching recommendations
        const q = query(collection(db, "recommendations"), where("cropId", "==", cropId), where("diseaseId", "==", diseaseId));
        const recommendationsSnapshot = await getDocs(q);

        const recommendations: Recommendation[] = recommendationsSnapshot.docs.map(doc => {
            const data = doc.data() as Omit<Recommendation, "id">; // Ensure data has required properties
            return { id: doc.id, ...data };
        });
        

        return NextResponse.json(recommendations, { status: 200 });

    } catch (error) {
        return NextResponse.json(
            { error: "Failed to fetch recommendations", details: (error as Error).message },
            { status: 500 }
        );
    }
}
