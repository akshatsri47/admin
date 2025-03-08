import {  NextResponse } from 'next/server';
import {doc, collection, getDocs, updateDoc } from "firebase/firestore";
import { db } from "../../../../utils/firebase";


export async function GET( ) {
    try {
      // Fetch all products from Firestore
      const productsSnapshot = await getDocs(collection(db, "products"));
      
      if (productsSnapshot.empty) {
        return NextResponse.json(
          { success: false, message: "No products found to update" },
          { status: 404 }
        );
      }
      
      const updatePromises = [];
      let updatedCount = 0;
      
      // Process each product
      for (const docSnapshot of productsSnapshot.docs) {
        const productData = docSnapshot.data();
        const productId = docSnapshot.id;
        
        // Check if the product has a category field
        if (productData.category) {
          // Create lowercase version of category with spaces removed
          const lowercategory = productData.category.toLowerCase().replace(/\s+/g, "");
          
          // Only update if the lowercategory field doesn't exist or is different
          if (!productData.lowercategory || productData.lowercategory !== lowercategory) {
            const productRef = doc(db, "products", productId);
            
            // Update the document with the new lowercategory field
            const updatePromise = updateDoc(productRef, {
              lowercategory: lowercategory
            }).then(() => {
              updatedCount++;
              return { id: productId, success: true };
            }).catch(error => {
              console.error(`Error updating product ${productId}:`, error);
              return { id: productId, success: false, error: error.message };
            });
            
            updatePromises.push(updatePromise);
          }
        }
      }
      
      // Wait for all updates to complete
      const results = await Promise.all(updatePromises);
      
      return NextResponse.json(
        { 
          success: true, 
          message: `Successfully processed ${productsSnapshot.size} products. Updated ${updatedCount} products.`,
          results 
        },
        { status: 200 }
      );
      
    } catch (error:unknown) {
      console.error("Error updating product categories:", error);
      return NextResponse.json(
        { success: false, error: "Error updating product categories", details: error },
        { status: 500 }
      );
    }
  }