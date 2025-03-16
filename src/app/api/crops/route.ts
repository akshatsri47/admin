import { NextResponse } from "next/server";
import { db } from "../../../../utils/firebase";
import {addDoc, collection, getDocs} from "firebase/firestore"
import { Crop } from "../../../../types/types";
export async function POST(req:Request) {
    try {
        const {name, imageUrl}: Crop = await req.json();
        if(!name || !imageUrl){
            return NextResponse.json({error:"name and image url is required"}, {status : 400} )
        }
        const docref = await addDoc(collection(db, "crops"), {
            name,
            imageUrl
        })
        return NextResponse.json({message: "Crop added successfully", id: docref.id}, {status: 201})
        
    } catch (error) {
        return NextResponse.json({ error: "Failed to add crop", details: error }, { status: 500 })
        
    }
    
}
export async function GET() {
    try {
      const cropsSnapshot = await getDocs(collection(db, "crops"));
  
      const crops: Crop[] = cropsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Crop[];
  
      return NextResponse.json(crops, { status: 200 });
    } catch (error) {
      return NextResponse.json({ error: "Failed to fetch crops", details: error }, { status: 500 });
    }
  }