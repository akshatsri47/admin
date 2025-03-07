
import {  NextResponse } from "next/server";
import { db } from "../../../../utils/firebase";
import {  collection,getDocs } from "firebase/firestore";



export async function GET() {
    try {
      const productsSnapshot = await getDocs(collection(db, "products"));
  
      if (productsSnapshot.empty) {
        return NextResponse.json(
          { success: false, error: "No products found" },
          { status: 404 }
        );
      }
  
      const products = productsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
  
      // Convert to JSON format
      const jsonData = JSON.stringify(products, null, 2);
  
      // Create a response with file download headers
      return new NextResponse(jsonData, {
        headers: {
          "Content-Type": "application/json",
          "Content-Disposition": 'attachment; filename="products.json"',
        },
      });
    } catch (error) {
      console.error("Error downloading products:", error);
      return NextResponse.json(
        { success: false, error: "Error downloading products" },
        { status: 500 }
      );
    }
  }
  