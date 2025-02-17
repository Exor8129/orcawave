"use client";

import React, { useState } from "react";
import { Table, Button, Popconfirm, Upload, Layout, Row, Col, Card } from "antd";
import * as XLSX from "xlsx";
import type { UploadChangeParam } from "antd/es/upload";
import type { ColumnsType } from "antd/es/table";

const { Content } = Layout;

interface PurchaseEntry {
  key: string;
  purchase_order_id: string;
  product_id: string;
  vendor_id: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

const PurchasePipeline: React.FC = () => {
  const [data, setData] = useState<PurchaseEntry[]>([]);

  const columns: ColumnsType<PurchaseEntry> = [
    {
      title: "Purchase Order ID",
      dataIndex: "purchase_order_id",
    },
    {
      title: "Product ID",
      dataIndex: "product_id",
    },
    {
      title: "Vendor ID",
      dataIndex: "vendor_id",
    },
    {
      title: "Quantity",
      dataIndex: "quantity",
    },
    {
      title: "Unit Price",
      dataIndex: "unit_price",
    },
    {
      title: "Total Price",
      dataIndex: "total_price",
      render: (_, record) => (record.quantity * record.unit_price).toFixed(2),
    },
    {
      title: "Actions",
      dataIndex: "actions",
      render: (_, record) => (
        <Popconfirm
          title="Are you sure to delete?"
          onConfirm={() => handleDelete(record.key)}
        >
          <Button type="link" danger>Delete</Button>
        </Popconfirm>
      ),
    },
  ];

  const handleDelete = (key: string) => {
    setData(data.filter((item) => item.key !== key));
  };

  const handleExport = () => {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Purchase Entries");
    XLSX.writeFile(workbook, "purchase_entries.xlsx");
  };

  const handleImport = (info: UploadChangeParam) => {
    const file = info.file.originFileObj;
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: "array" });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData: PurchaseEntry[] = XLSX.utils.sheet_to_json(sheet);
        setData(jsonData);
      };
      reader.readAsArrayBuffer(file);
    }
  };

  return (
    <Layout style={{ padding: "20px" }}>
      <Row gutter={16}>
        {/* Section 1: Low Stock Items (Placeholder) */}
        <Col span={6}>
          <Card title="Low Stock Items" style={{ minHeight: "400px" }}>
            {/* Placeholder for low stock items */}
          </Card>
        </Col>

        {/* Section 2: Create Purchase Order (Placeholder) */}
        <Col span={6}>
          <Card title="Create Purchase Order" style={{ minHeight: "400px" }}>
            {/* Placeholder for purchase order form */}
          </Card>
        </Col>

        {/* Section 3: Purchase Entry */}
        <Col span={12}>
          <Card title="Purchase Entry" style={{ minHeight: "400px" }}>
            <Upload beforeUpload={() => false} onChange={handleImport} showUploadList={false}>
              <Button type="default">Import from Excel</Button>
            </Upload>
            <Button onClick={handleExport} type="primary" style={{ margin: "10px" }}>
              Export to Excel
            </Button>
            <Table
              rowKey="key"
              columns={columns}
              dataSource={data}
              pagination={{ pageSize: 10 }}
            />
          </Card>
        </Col>
      </Row>
    </Layout>
  );
};

export default PurchasePipeline;
