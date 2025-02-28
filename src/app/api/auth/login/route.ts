import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

const SECRET_KEY = "your-secret-key"; // Replace with an environment variable in production

let adminUser: { email: string; password: string } | null = null; // Hardcoded user storage

export async function POST(req: Request) {
  const { email, password } = await req.json();

  if (email!=="sarthak@gmail.com" || password!=="1233") {
    return NextResponse.json({ message: "Invalid credentials" }, { status: 401 });
  }

  // Generate JWT token
  const token = jwt.sign({ email }, SECRET_KEY, { expiresIn: "1h" });

  const response = NextResponse.json({ message: "Login successful" });
  response.cookies.set("token", token, { httpOnly: true, secure: true, path: "/" });

  return response;
}
