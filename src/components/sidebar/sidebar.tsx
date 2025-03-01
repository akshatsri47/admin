import React from "react";
import {
  LockClosedIcon,
  Squares2X2Icon,
  ShoppingCartIcon,
  TagIcon,
  UsersIcon,
  TruckIcon,
  TicketIcon,
  UserGroupIcon,
  Cog6ToothIcon,
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
        bg-white
        text-black
        w-16
        hover:w-64
        transition-all
        duration-300
        overflow-hidden
        relative
        z-10
        border-r
        border-green-500
        
      "
      onMouseEnter={() => onHover(true)}
    onMouseLeave={() => onHover(false)}
    >
      {/* Vertical green line */}
      <div className="absolute top-0 left-0 bottom-0 w-1 bg-green-500" />

      {/* Header */}
      <div className="flex items-center px-4 py-6">
        <LockClosedIcon className="w-6 h-6 text-green-500" />
        <span
          className="
            ml-2
            text-xl
            font-bold
            opacity-0
            group-hover:opacity-100
            transition-all
            duration-300
            whitespace-nowrap
          "
        >
          Admin
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex flex-col mt-4 space-y-2">
        <a
          href="#"
          className="flex items-center text-gray-700 hover:text-black px-4"
        >
          <Squares2X2Icon className="w-5 h-5 flex-shrink-0" />
          <span
            className="
              ml-2
              opacity-0
              group-hover:opacity-100
              transition-all
              duration-300
              whitespace-nowrap
            "
          >
            Dashboard
          </span>
        </a>
        <a
          href="#"
          className="flex items-center text-gray-700 hover:text-black px-4"
        >
          <ShoppingCartIcon className="w-5 h-5 flex-shrink-0" />
          <span
            className="
              ml-2
              opacity-0
              group-hover:opacity-100
              transition-all
              duration-300
              whitespace-nowrap
            "
          >
            Products
          </span>
        </a>
        <a
          href="#"
          className="flex items-center text-gray-700 hover:text-black px-4"
        >
          <TagIcon className="w-5 h-5 flex-shrink-0" />
          <span
            className="
              ml-2
              opacity-0
              group-hover:opacity-100
              transition-all
              duration-300
              whitespace-nowrap
            "
          >
            Categories
          </span>
        </a>
        <a
          href="#"
          className="flex items-center text-gray-700 hover:text-black px-4"
        >
          <UsersIcon className="w-5 h-5 flex-shrink-0" />
          <span
            className="
              ml-2
              opacity-0
              group-hover:opacity-100
              transition-all
              duration-300
              whitespace-nowrap
            "
          >
            Customers
          </span>
        </a>
        <a
          href="#"
          className="flex items-center text-gray-700 hover:text-black px-4"
        >
          <TruckIcon className="w-5 h-5 flex-shrink-0" />
          <span
            className="
              ml-2
              opacity-0
              group-hover:opacity-100
              transition-all
              duration-300
              whitespace-nowrap
            "
          >
            Orders
          </span>
        </a>
        <a
          href="#"
          className="flex items-center text-gray-700 hover:text-black px-4"
        >
          <TicketIcon className="w-5 h-5 flex-shrink-0" />
          <span
            className="
              ml-2
              opacity-0
              group-hover:opacity-100
              transition-all
              duration-300
              whitespace-nowrap
            "
          >
            Coupons
          </span>
        </a>
        <a
          href="#"
          className="flex items-center text-gray-700 hover:text-black px-4"
        >
          <UserGroupIcon className="w-5 h-5 flex-shrink-0" />
          <span
            className="
              ml-2
              opacity-0
              group-hover:opacity-100
              transition-all
              duration-300
              whitespace-nowrap
            "
          >
            Staff
          </span>
        </a>
        <a
          href="#"
          className="flex items-center text-gray-700 hover:text-black px-4"
        >
          <Cog6ToothIcon className="w-5 h-5 flex-shrink-0" />
          <span
            className="
              ml-2
              opacity-0
              group-hover:opacity-100
              transition-all
              duration-300
              whitespace-nowrap
            "
          >
            Settings
          </span>
        </a>
      </nav>
    </aside>
  );
}
