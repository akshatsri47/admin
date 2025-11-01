"use client";

import Link from "next/link";
import {
  LockClosedIcon,
  Squares2X2Icon,
  ShoppingCartIcon,
  TagIcon,
  UsersIcon,
  TicketIcon,
  UserGroupIcon,
  DocumentTextIcon,
} from "@heroicons/react/24/outline";

interface AdminSidebarProps {
  onHover: (expanded: boolean) => void;
}

export default function AdminSidebar({ onHover }: AdminSidebarProps) {
  return (
    <aside
      className="
        flex flex-col
        h-screen
        bg-gray-900
        text-white
        w-16
        hover:w-64
        transition-all
        duration-300
        overflow-hidden
        relative
        z-10
        border-r border-green-500
      "
      onMouseEnter={() => onHover(true)}
      onMouseLeave={() => onHover(false)}
    >
      {/* Vertical green line */}
      <div className="absolute top-0 left-0 bottom-0 w-1 bg-green-500" />

      {/* Sidebar Header */}
      <div className="flex items-center px-4 py-6">
        <LockClosedIcon className="w-6 h-6 text-green-500" />
        <span
          className="
            ml-2 text-xl font-bold opacity-0
            hover:opacity-100 transition-all
            duration-300 whitespace-nowrap
          "
        >
          Admin Panel
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex flex-col mt-4 space-y-2">
        <Link href="/product" className="flex items-center px-4 py-2 text-gray-400 hover:text-white">
          <Squares2X2Icon className="w-5 h-5 flex-shrink-0" />
          <span className="ml-2 opacity-0 hover:opacity-100 transition-all duration-300 whitespace-nowrap">
            Dashboard
          </span>
        </Link>

        <Link href="/adminslider" className="flex items-center px-4 py-2 text-gray-400 hover:text-white">
          <ShoppingCartIcon className="w-5 h-5 flex-shrink-0" />
          <span className="ml-2 opacity-0 hover:opacity-100 transition-all duration-300 whitespace-nowrap">
            Slider
          </span>
        </Link>

        <Link href="/dashform" className="flex items-center px-4 py-2 text-gray-400 hover:text-white">
          <TagIcon className="w-5 h-5 flex-shrink-0" />
          <span className="ml-2 opacity-0 hover:opacity-100 transition-all duration-300 whitespace-nowrap">
            Questionnaire
          </span>
        </Link>

        <Link href="/users" className="flex items-center px-4 py-2 text-gray-400 hover:text-white">
          <UsersIcon className="w-5 h-5 flex-shrink-0" />
          <span className="ml-2 opacity-0 hover:opacity-100 transition-all duration-300 whitespace-nowrap">
            Customers
          </span>
        </Link>

        <Link href="/coupons" className="flex items-center px-4 py-2 text-gray-400 hover:text-white">
          <TicketIcon className="w-5 h-5 flex-shrink-0" />
          <span className="ml-2 opacity-0 hover:opacity-100 transition-all duration-300 whitespace-nowrap">
            Coupons
          </span>
        </Link>

        <Link href="/blogs" className="flex items-center px-4 py-2 text-gray-400 hover:text-white">
          <DocumentTextIcon className="w-5 h-5 flex-shrink-0" />
          <span className="ml-2 opacity-0 hover:opacity-100 transition-all duration-300 whitespace-nowrap">
            Blog Management
          </span>
        </Link>

        <Link href="/" className="flex items-center px-4 py-2 text-gray-400 hover:text-white">
          <UserGroupIcon className="w-5 h-5 flex-shrink-0" />
          <span className="ml-2 opacity-0 hover:opacity-100 transition-all duration-300 whitespace-nowrap">
            Add Product
          </span>
        </Link>
      </nav>
    </aside>
  );
}
