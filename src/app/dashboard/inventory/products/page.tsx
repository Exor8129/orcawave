"use client";

import { useState, useEffect } from "react";
import {
  Breadcrumb,
  Dropdown,
  Button,
  Table,
  Modal,
  Form,
  Input,
  Select,
  message,
  Checkbox,
  Tooltip,
  Upload,
} from "antd";
import { MoreOutlined, PlusOutlined, SettingOutlined, QuestionCircleOutlined, UploadOutlined } from "@ant-design/icons";
import Link from "next/link";
import { v4 as uuidv4 } from "uuid";

const { Option } = Select;

export default function Products() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();
  const [products, setProducts] = useState([]);
  const [selectedColumns, setSelectedColumns] = useState<string[]>([]);

  // All available columns
  const allColumns = [
    { key: "productName", title: "Product Name", dataIndex: "productName" },
    { key: "hsnCode", title: "HSN Code", dataIndex: "hsnCode" },
    { key: "sku", title: (
        <span>
          SKU <Tooltip title="Stock Keeping Unit"><QuestionCircleOutlined /></Tooltip>
        </span>
      ), dataIndex: "sku" },
    { key: "tax", title: "Tax", dataIndex: "tax" },
    { key: "barcode", title: "Barcode", dataIndex: "barcode" },
    { key: "warehouseLocation", title: "WHL (Warehouse Location)", dataIndex: "warehouseLocation" },
    { key: "image", title: "Product Image", dataIndex: "image", render: (text: string | undefined) => text ? <img src={text} alt="Product" width={50} /> : "No Image" },
  ];

  // Fetch products from the database
  const fetchProducts = async () => {
    try {
      const res = await fetch("/api/products");
      const data = await res.json();
      if (data.success) {
        setProducts(data.products);
      } else {
        message.error("Failed to load products");
      }
    } catch (error) {
      console.error("Error fetching products:", error);
      message.error("Something went wrong!");
    }
  };

  useEffect(() => {
    fetchProducts();
    const storedColumns = localStorage.getItem("productSelectedColumns");
    setSelectedColumns(storedColumns ? JSON.parse(storedColumns) : allColumns.map(col => col.key));
  }, []);

  // Handle column selection
  const handleColumnChange = (checkedValues: string[]) => {
    setSelectedColumns(checkedValues);
    localStorage.setItem("productSelectedColumns", JSON.stringify(checkedValues));
  };

  // Handle form submission
  const handleSubmit = async (values: any) => {
    values.barcode = uuidv4(); // Auto-generate barcode
    try {
      const response = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const result = await response.json();
      if (result.success) {
        message.success("Product added successfully!");
        form.resetFields();
        setIsModalOpen(false);
        fetchProducts();
      } else {
        message.error("Failed to add product.");
      }
    } catch (error) {
      console.error("Error submitting product:", error);
      message.error("Something went wrong!");
    }
  };

  // Close the modal
  const handleCancel = () => {
    setIsModalOpen(false);
    form.resetFields();
  };

  return (
    <div className="p-4">
      <Breadcrumb items={[{ title: <Link href="/dashboard/inventory">Inventory</Link> }, { title: "Products" }]} />

      <div className="flex justify-between items-center mt-4 mb-4">
        <h1 className="text-2xl font-semibold">All Products</h1>
        <div className="flex gap-2">
          <Dropdown
            menu={{
              items: [
                {
                  key: "columns",
                  label: (
                    <Checkbox.Group value={selectedColumns} onChange={handleColumnChange}>
                      {allColumns.map((col) => (
                        <div key={col.key}>
                          <Checkbox value={col.key}>{col.title}</Checkbox>
                        </div>
                      ))}
                    </Checkbox.Group>
                  ),
                },
              ],
            }}
            placement="bottomRight"
            arrow
          >
            <Button icon={<SettingOutlined />}>Columns</Button>
          </Dropdown>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsModalOpen(true)}>
            New
          </Button>
        </div>
      </div>

      <Table
        dataSource={products}
        columns={allColumns.filter(col => selectedColumns.includes(col.key))}
        pagination={{ pageSize: 5 }}
        bordered
      />

      <Modal title="Add New Product" open={isModalOpen} onCancel={handleCancel} footer={null}>
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item label="Product Name" name="productName" rules={[{ required: true, message: "Please enter product name" }]}> <Input /> </Form.Item>
          <Form.Item label="HSN Code" name="hsnCode" rules={[{ required: true, message: "Please enter HSN code" }]}> <Input /> </Form.Item>
          <Form.Item label="SKU" name="sku" rules={[{ required: true, message: "Please enter SKU" }]}> <Input suffix={<Tooltip title="Stock Keeping Unit"><QuestionCircleOutlined /></Tooltip>} /> </Form.Item>
          <Form.Item label="Tax" name="tax" rules={[{ required: true, message: "Please enter tax" }]}> <Input /> </Form.Item>
          <Form.Item label="Barcode" name="barcode"> <Input disabled /> </Form.Item>
          <Form.Item label="Warehouse Location" name="warehouseLocation"> <Input /> </Form.Item>
          <Form.Item label="Product Image" name="image"> <Upload><Button icon={<UploadOutlined />}>Upload</Button></Upload> </Form.Item>
          <div className="flex justify-end gap-2">
            <Button onClick={handleCancel}>Cancel</Button>
            <Button type="primary" htmlType="submit">Save</Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
}
