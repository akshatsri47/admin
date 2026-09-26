import { NextRequest, NextResponse } from "next/server";
import { collection, addDoc, getDocs, DocumentData } from "firebase/firestore";
import { db } from "../../../../utils/firebase";
import { generateKeywords } from "../../../../utils/function"
import cloudinary from "../../../../utils/cloudinary";

 


export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();

    // Extracting fields
    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const category = formData.get("category") as string;
    const manufacturer = formData.get("manufacturer") as string;
    const composition = formData.get("composition") as string;
    const commonlyUsedFor = formData.getAll("commonlyUsedFor") as string[];
    const avoidForCrops = formData.getAll("avoidForCrops") as string[];
    const benefits = formData.getAll("benefits") as string[];
    const stickerImageField = formData.get("stickerImage");
    const stickerLabel = (formData.get("stickerLabel") as string) || "TOP SELLER";
    const trustedFarmers = (formData.get("trustedFarmers") as string) || "638+";
    const rating = Number(formData.get("rating") || 4.6);
    const verifiedReviewsCount = Number(formData.get("verifiedReviewsCount") || 148);
    const reviews = JSON.parse((formData.get("reviews") as string) || "[]") as {
      name: string;
      rating: number;
      comment: string;
      date?: string;
    }[];

    // Extracting dosage details
    const method = formData.get("method") as string;
    const dosage = JSON.parse(formData.get("dosage") as string) as {
      dose: string;
      arce: string;
    };

    // Extracting pricing details
    const pricing = JSON.parse(formData.get("pricing") as string) as {
      packageSize: string;
      price: number;
    }[];

    // Extract discount (optional, defaults to 0)
    const discountRaw = formData.get("discount");
    const discount = discountRaw !== null ? Math.min(100, Math.max(-100, Number(discountRaw))) : 0;

    // Extract COD availability (optional, defaults to true = COD allowed)
    const codAvailableRaw = formData.get("codAvailable");
    const codAvailable = codAvailableRaw === null ? true : codAvailableRaw === "true";
    const paymentEligibilityRaw = formData.get("paymentEligibility");
    const validPaymentEligibility = ["FULL_COD_ALLOWED", "PARTIAL_COD_ONLY", "PREPAID_ONLY", "FULL_COD_AND_PREPAID", "PARTIAL_COD_AND_PREPAID"];
    const paymentEligibility = validPaymentEligibility.includes(String(paymentEligibilityRaw)) ? paymentEligibilityRaw : (codAvailable ? "PARTIAL_COD_AND_PREPAID" : "PREPAID_ONLY");

    // Get image URLs that were uploaded to Cloudinary
    const imageUrls: string[] = [];
    const imageUrlsData = formData.getAll("imageUrls[]") as string[];
    const imageFiles = formData.getAll("images") as File[];
    
    // If we get individual image URLs
    if (imageUrlsData.length > 0) {
      imageUrls.push(...imageUrlsData);
    } else {
      // Alternative: check if they're encoded as JSON
      const imageUrlsJson = formData.get("imageUrls") as string;
      if (imageUrlsJson) {
        try {
          const parsedUrls = JSON.parse(imageUrlsJson);
          if (Array.isArray(parsedUrls)) {
            imageUrls.push(...parsedUrls);
          }
        } catch (e) {
          console.error("Error parsing image URLs:", e);
        }
      }
    }

    for (const image of imageFiles) {
      if (!image || image.size === 0) continue;
      const buffer = await image.arrayBuffer();
      const base64Image = Buffer.from(buffer).toString("base64");
      const uploadResponse = await cloudinary.uploader.upload(`data:${image.type};base64,${base64Image}`, {
        folder: "products",
        format: "jpg",
        transformation: [
          { quality: "auto" },
          { fetch_format: "jpg" },
        ],
      });
      imageUrls.push(uploadResponse.secure_url);
    }

    let stickerImage = typeof stickerImageField === "string" ? stickerImageField : "";
    if (stickerImageField instanceof File && stickerImageField.size > 0) {
      const buffer = await stickerImageField.arrayBuffer();
      const base64Image = Buffer.from(buffer).toString("base64");
      const uploadResponse = await cloudinary.uploader.upload(`data:${stickerImageField.type};base64,${base64Image}`, {
        folder: "products",
        format: "jpg",
        transformation: [
          { quality: "auto" },
          { fetch_format: "jpg" },
        ],
      });
      stickerImage = uploadResponse.secure_url;
    }

    const missingFields = [
      !name && "name",
      !description && "description",
      !category && "category",
      !manufacturer && "manufacturer",
      !composition && "composition",
      !method && "method",
      !dosage && "dosage",
      !pricing.length && "pricing",
      !imageUrls.length && "images",
    ].filter(Boolean);

    if (missingFields.length > 0) {
      return NextResponse.json({
        success: false,
        error: `Missing required fields: ${missingFields.join(", ")}`,
      }, { status: 400 });
    }

    const search = name.toLowerCase().replace(/\s+/g, "");
    const lowercategory = category.toLowerCase().replace(/\s+/g, "");
    const createdAt = new Date().toISOString();
    const keywords = generateKeywords(name);

    // Creating product object
    const newProduct = {
      name,
      description,
      category,
      images: imageUrls, // Use the URLs directly
      createdAt: createdAt,
      manufacturer,
      composition,
      commonlyUsedFor,
      avoidForCrops,
      stickerImage,
      stickerLabel,
      trustedFarmers,
      rating,
      verifiedReviewsCount,
      reviews,
      search,
      pricing,
      dosage: {
        method,
        dosage,
      },
      lowercategory,
      benefits,
      keywords,
      discount,
      codAvailable,
      paymentEligibility,
    };

    // Adding to Firestore
    const docRef = await addDoc(collection(db, "products"), newProduct);
    return NextResponse.json({ success: true, data: { id: docRef.id, ...newProduct } }, { status: 201 });

  } catch (error) {
    console.error("Error adding product:", error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Error adding product",
    }, { status: 500 });
  }
}

// Keep the existing GET function unchanged
export async function GET() {
  try {
    const productsSnapshot = await getDocs(collection(db, "products"));

    if (productsSnapshot.empty) {
      return NextResponse.json(
        {
          success: false,
          error: "No products found",
        },
        { status: 404 }
      );
    }

    const products = productsSnapshot.docs.map((doc: DocumentData) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json(
      {
        success: true,
        data: products,
        message: "Successfully fetched all products",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Error fetching products",
      },
      { status: 500 }
    );
  }
}
