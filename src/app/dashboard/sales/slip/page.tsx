"use client";

import { Breadcrumb } from "antd";
import Link from "next/link";

export default function Slip() {
  return (
    <div>
      <Breadcrumb
        items={[
          
          {
            title: <Link href="/dashboard/sales">Sales</Link>,
          },
          {
            title: "Slip Generation",
          },
        ]}
      />

      <h1 className="text-2xl font-semibold mt-4">Slip Generation</h1>
    </div>
  );
}
