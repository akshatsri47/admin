import {  NextResponse } from "next/server";
import cloudinary from "../../../../utils/cloudinary";
export async function GET( ) {
  const timestamp = Math.round(new Date().getTime() / 1000);
  
  // Generate the signature
  const signature = cloudinary.utils.api_sign_request({
    timestamp: timestamp,
    folder: "products",
  }, process.env.CLOUDINARY_API_SECRET || "");
  
  return NextResponse.json({
    signature,
    timestamp,
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY
  });
}