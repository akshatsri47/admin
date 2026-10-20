import { NextRequest, NextResponse } from "next/server";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../../../../utils/firebase";

const settingRef = () => doc(db, "siteSettings", "homeVideo");

export async function GET() {
  try {
    const snapshot = await getDoc(settingRef());
    const videoUrl = snapshot.exists() ? snapshot.data().videoUrl : "";
    return NextResponse.json({ videoUrl: typeof videoUrl === "string" ? videoUrl : "" });
  } catch (error) {
    console.error("Error fetching home video:", error);
    return NextResponse.json({ error: "Failed to fetch home video" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const videoUrl = typeof body.videoUrl === "string" ? body.videoUrl.trim() : "";

    if (videoUrl) {
      let parsedUrl: URL;
      try {
        parsedUrl = new URL(videoUrl);
      } catch {
        return NextResponse.json({ error: "Enter a valid video URL" }, { status: 400 });
      }
      if (parsedUrl.protocol !== "https:" && parsedUrl.protocol !== "http:") {
        return NextResponse.json({ error: "Enter a valid video URL" }, { status: 400 });
      }
    }

    await setDoc(settingRef(), { videoUrl, updatedAt: Date.now() }, { merge: true });
    return NextResponse.json({ videoUrl });
  } catch (error) {
    console.error("Error saving home video:", error);
    return NextResponse.json({ error: "Failed to save home video" }, { status: 500 });
  }
}
