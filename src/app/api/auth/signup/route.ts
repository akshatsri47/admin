import { NextResponse } from "next/server";

let adminUser: { email: string; password: string } | null = null;

export async function POST(req: Request) {
  const { email, password } = await req.json();

  if (adminUser) {
    return NextResponse.json({ message: "Admin already exists" }, { status: 400 });
  }

  // Store admin user (hardcoded storage)
  adminUser = { email, password };
  return NextResponse.json({ message: "Admin registered successfully" }, { status: 201 });
}
