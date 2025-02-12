"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const menuItems = [
  { name: "Dashboard", path: "/dashboard" },
  {
    name: "Sales",
    path: "/dashboard/sales",
    subMenu: [
      { name: "Invoices", path: "/dashboard/sales/invoices" },
      { name: "Sales Orders", path: "/dashboard/sales/orders" },
      { name: "Slip Generation", path: "/dashboard/sales/slip" },
    ],
  },
  {
    name: "Accounting",
    path: "/dashboard/accounting",
  },
  {
    name: "Purchase",
    path: "/dashboard/purchase", // ✅ Ensure this exists
    subMenu: [
      
      { name: "Purchase Orders", path: "/dashboard/purchase/orders" },
      { name: "Vendors", path: "/dashboard/purchase/vendors" },
      { name: "Receipts", path: "/dashboard/purchase/receipts" },
    ],
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [openMenus, setOpenMenus] = useState<{ [key: string]: boolean }>({});

  const toggleSubMenu = (menuName: string) => {
    setOpenMenus((prev) => ({
      ...prev,
      [menuName]: !prev[menuName], // ✅ Toggle submenu for each section independently
    }));
  };

  return (
    <aside className="w-64 bg-white shadow-md h-screen p-4 overflow-y-auto">
      <h2 className="text-xl font-semibold mb-6">ERP System</h2>
      <nav>
        {menuItems.map(({ name, path, subMenu }) => (
          <div key={name} className="mb-2">
            {subMenu ? (
              <div>
                {/* Parent Menu */}
                <button
                  onClick={() => toggleSubMenu(name)}
                  className={`w-full text-left p-3 rounded-lg flex justify-between ${
                    pathname.startsWith(path || "") ? "bg-blue-500 text-white" : "hover:bg-gray-200"
                  }`}
                >
                  {name}
                  <span>{openMenus[name] ? "▲" : "▼"}</span>
                </button>
                {/* Submenu Items */}
                {openMenus[name] && (
                  <div className="ml-4 mt-2">
                    {subMenu.map((subItem) => (
                      <Link
                        key={subItem.path}
                        href={subItem.path}
                        className={`block p-2 rounded-lg ${
                          pathname === subItem.path ? "bg-blue-400 text-white" : "hover:bg-gray-100"
                        }`}
                      >
                        {subItem.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <Link
                href={path!}
                className={`block p-3 rounded-lg ${
                  pathname === path ? "bg-blue-500 text-white" : "hover:bg-gray-200"
                }`}
              >
                {name}
              </Link>
            )}
          </div>
        ))}
      </nav>
    </aside>
  );
}
