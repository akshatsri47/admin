"use client";

import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="bg-gray-800 p-4">
      <ul className="flex space-x-6">
        {/* <li>
          <Link href="/questionnaire" className="text-white hover:text-gray-300">
            Questionnaire
          </Link>
        </li> */}
        <li>
          <Link href="/adminslider" className="text-white hover:text-gray-300">
            Slider
          </Link>
        </li>
        <li>
          <Link href="/product" className="text-white hover:text-gray-300">
            Dashboard
          </Link>
        </li>
        <li>
          <Link href="/dashform" className="text-white hover:text-gray-300">
                Questionare
          </Link>
        </li>
        <li>
          <Link href="/" className="text-white hover:text-gray-300">
            Add Product
          </Link>
        </li>
      </ul>
    </nav>
  );
}
