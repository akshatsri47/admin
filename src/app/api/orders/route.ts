import { NextResponse } from "next/server";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { db } from "../../../../utils/firebase";

export async function GET() {
  try {
    const snapshot = await getDocs(query(collection(db, "orders"), orderBy("createdAt", "desc")));
    return NextResponse.json({ success: true, data: snapshot.docs.map((item) => ({ id: item.id, ...item.data() })) });
  } catch (error) {
    console.error("Unable to load orders", error);
    return NextResponse.json({ success: false, error: "Unable to load orders" }, { status: 500 });
  }
}
