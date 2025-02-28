"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (res.ok) {
      router.push("/admin");
    } else {
      alert("Invalid credentials");
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-[#d3d3d3]">
      <form
        onSubmit={handleLogin}
        className="flex flex-col items-center gap-5 p-5 rounded-md border-2 border-[#323232] shadow-[4px_4px_0_0_#323232] bg-white"
      >
        <p className="text-2xl font-bold text-[#323232] text-center">
          Welcome Samarth Gupta
        </p>
        <p className="text-[#323232] text-center">
          signing to continue
        </p>

        <input
          type="text"
          placeholder="Username"
          name="username"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-[250px] h-[40px] rounded-md border-2 border-[#323232] shadow-[4px_4px_0_0_#323232] text-[15px] font-semibold text-[#323232] px-3 outline-none"
        />
        <input
          type="password"
          placeholder="Password"
          name="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-[250px] h-[40px] rounded-md border-2 border-[#323232] shadow-[4px_4px_0_0_#323232] text-[15px] font-semibold text-[#323232] px-3 outline-none"
        />
        <button
          type="submit"
          className="relative group flex justify-center items-center gap-2 w-[250px] h-[40px] rounded-md border-2 border-[#323232] bg-white shadow-[4px_4px_0_0_#323232] text-[16px] font-semibold text-[#323232] cursor-pointer transition-all duration-250 overflow-hidden"
        >
          <span className="absolute top-0 left-0 h-full w-0 bg-[#212121] -z-10 shadow-[4px_8px_19px_-3px_rgba(0,0,0,0.27)] transition-all duration-250 group-hover:w-full"></span>
          Login
        </button>
      </form>
    </div>
  );
}
