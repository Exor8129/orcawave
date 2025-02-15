"use client";

import { useState, useEffect, useRef } from "react";
import {
  Breadcrumb,
  Dropdown,
  Button,
  Table,
  Modal,
  Form,
  Input,
  message,
  Checkbox,
  Tooltip,
  Upload,
} from "antd";
import {
  MoreOutlined,
  PlusOutlined,
  SettingOutlined,
  QuestionCircleOutlined,
  SearchOutlined,
  ImportOutlined,
  ExportOutlined,
  EditOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import Link from "next/link";
import { v4 as uuidv4 } from "uuid";
import * as XLSX from "xlsx";
import JsBarcode from "jsbarcode";

interface Product {
  key: string;
  productName: string;
  hsnCode?: string;
  sku?: string;
  tax?: number;
  barcode?: string;
  warehouseLocation?: string;
}

export default function Products() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [searchText, setSearchText] = useState("");
  const [selectedColumns, setSelectedColumns] = useState<string[]>([]);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const barcodeRef = useRef(null);

  const allColumns = [
    { key: "productName", title: "Product Name", dataIndex: "productName" },
    { key: "hsnCode", title: "HSN Code", dataIndex: "hsnCode" },
    {
      key: "sku",
      title: (
        <span>
          SKU{" "}
          <Tooltip title="Stock Keeping Unit">
            <QuestionCircleOutlined />
          </Tooltip>
        </span>
      ),
      dataIndex: "sku",
    },
    { key: "tax", title: "Tax", dataIndex: "tax" },
    { key: "barcode", title: "Barcode", dataIndex: "barcode" },
    {
      key: "warehouseLocation",
      title: "WHL (Warehouse Location)",
      dataIndex: "warehouseLocation",
    },
    {
      key: "actions",
      title: "Actions",
      render: (_: unknown, record: Product) => (
        <div className="flex gap-2">
          <Button icon={<EditOutlined />} onClick={() => handleEdit(record)} />
          <Button
            icon={<DeleteOutlined />}
            danger
            onClick={() => handleDelete(record.key)}
          />
        </div>
      ),
    },
  ];

  useEffect(() => {
    if (selectedProduct && barcodeRef.current) {
      JsBarcode(barcodeRef.current, selectedProduct.barcode ?? "", {
        // ✅ Ensures a string
        displayValue: true,
        width: 1,
        height: 20,
        fontSize: 8,
        margin: 3,
      });
    }
  }, [selectedProduct]);

  const handleImport = async (info: any) => {
    const file = info.file.originFileObj || info.file;
    if (!file) {
      console.error("No file selected or file is undefined!", info.file);
      message.error("No file selected!");
      return;
    }

    console.log("File selected:", file);
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        console.log("am here");
        const data = new Uint8Array(event.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const parsedData: any[] = XLSX.utils.sheet_to_json(sheet);
        console.log("Raw Parsed Data from Excel:", parsedData);

        // Ensure proper mapping and unique barcodes
        const productsWithBarcode = parsedData.map((item) => ({
          key: uuidv4(),
          productName: item.productName || "",
          hsnCode: item.hsnCode ? String(item.hsnCode) : "",
          sku: item.sku || "",
          tax: item.tax || 0,
          barcode: item.barcode || Math.random().toString(36).substring(2, 8).toUpperCase(),
          warehouseLocation: item.warehouseLocation || "",
        }));
        
        console.log("Parsed Data After Mapping:", productsWithBarcode);

        // Ensure data is in correct format before sending to API
        if (productsWithBarcode.length === 0) {
          message.warning("No valid data found in Excel file!");
          return;
        }

        // Send data to API
        const response = await fetch("/api/products", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ products: productsWithBarcode }),
        });

        const result = await response.json();
        if (result.success) {
          message.success("Products imported successfully!");
          fetchProducts(); // Refresh product list
        } else {
          message.error(result.error || "Failed to import products.");
        }
      } catch (error) {
        console.error("Error importing products:", error);
        message.error("Something went wrong during import!");
      }
    };

    reader.readAsArrayBuffer(file);
  };

  useEffect(() => {
    fetchProducts();
    const storedColumns = localStorage.getItem("productSelectedColumns");
    setSelectedColumns(
      storedColumns
        ? JSON.parse(storedColumns)
        : allColumns.map((col) => col.key)
    );
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await fetch("/api/products");
      const data = await res.json();
      if (data.success) {
        setProducts(data.products);
        setFilteredProducts(data.products);
      } else {
        message.error("Failed to load products");
      }
    } catch (error) {
      console.error("Error fetching products:", error);
      message.error("Something went wrong!");
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    form.setFieldsValue(product);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/products?id=${id}`, {
        method: "DELETE",
      });
      const data = await response.json();
      if (data.success) {
        message.success("Product deleted successfully");
        fetchProducts();
      } else {
        message.error(data.error || "Failed to delete product");
      }
    } catch (error) {
      console.error("Error deleting product:", error);
      message.error("Something went wrong!");
    }
  };

  const handleColumnChange = (checkedValues: string[]) => {
    setSelectedColumns(checkedValues);
    localStorage.setItem(
      "productSelectedColumns",
      JSON.stringify(checkedValues)
    );
  };

  const handleSearch = (e: any) => {
    const value = e.target.value.toLowerCase();
    setSearchText(value);
    const filtered = products.filter((product) =>
      product.productName.toLowerCase().includes(value)
    );
    setFilteredProducts(filtered);
  };

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(products);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Products");
    XLSX.writeFile(workbook, "products.xlsx");
  };

  const handleSave = async (values: any) => {
    values.barcode = Math.random().toString(36).substring(2, 8).toUpperCase();

    try {
      const response = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const data = await response.json();
      if (data.success) {
        message.success("Product added successfully");
        fetchProducts();
        setIsModalOpen(false);
        form.resetFields();
      } else {
        message.error("Failed to add product");
      }
    } catch (error) {
      console.error("Error adding product:", error);
      message.error("Something went wrong!");
    }
  };

  return (
    <div className="p-4">
      <Breadcrumb
        items={[
          { title: <Link href="/dashboard/inventory">Inventory</Link> },
          { title: "Products" },
        ]}
      />
      <div className="flex justify-between items-center mt-4 mb-4">
        <h1 className="text-2xl font-semibold">All Products</h1>
        <div className="flex gap-2">
          <Input
            placeholder="Search Product Name"
            value={searchText}
            onChange={handleSearch}
            prefix={<SearchOutlined />}
          />
          <Upload
            beforeUpload={() => false}
            onChange={handleImport}
            showUploadList={false}
          >
            <Button icon={<ImportOutlined />}>Import</Button>
          </Upload>

          <Button icon={<ExportOutlined />} onClick={exportToExcel}>
            Export
          </Button>
          <Dropdown
            menu={{
              items: [
                {
                  key: "columns",
                  label: (
                    <Checkbox.Group
                      value={selectedColumns}
                      onChange={handleColumnChange}
                    >
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
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              form.resetFields();
              setEditingProduct(null);
              setIsModalOpen(true);
            }}
          >
            New
          </Button>
        </div>
      </div>
      <Table
        dataSource={filteredProducts}
        columns={allColumns.filter((col) => selectedColumns.includes(col.key))}
        pagination={{ pageSize: 5 }}
        bordered
        onRow={(record) => ({
          onDoubleClick: () => {
            setSelectedProduct(record);
            setIsDetailModalOpen(true);
          },
        })}
      />
      <Modal
        title={editingProduct ? "Edit Product" : "Add New Product"}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={handleSave}>
          <Form.Item
            label="Product Name"
            name="productName"
            rules={[{ required: true, message: "Please enter product name" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="HSN Code"
            name="hsnCode"
            rules={[{ required: true, message: "Please enter HSN code" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="SKU"
            name="sku"
            rules={[{ required: true, message: "Please enter SKU" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Tax"
            name="tax"
            rules={[{ required: true, message: "Please enter tax" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item label="Warehouse Location" name="warehouseLocation">
            <Input />
          </Form.Item>
          <div className="flex justify-end gap-2">
            <Button onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button type="primary" htmlType="submit">
              Save
            </Button>
          </div>
        </Form>
      </Modal>
      <Modal
        title="Product Details"
        open={isDetailModalOpen}
        onCancel={() => setIsDetailModalOpen(false)}
        footer={null}
      >
        {selectedProduct && (
          <div>
            <h2>{selectedProduct.productName}</h2>
            <p>HSN Code: {selectedProduct.hsnCode}</p>
            <p>SKU: {selectedProduct.sku}</p>
            <p>Tax: {selectedProduct.tax}%</p>
            <p>Warehouse Location: {selectedProduct.warehouseLocation}</p>

            {/* Barcode Display */}
            <div className="barcode">
              <canvas ref={barcodeRef}></canvas>
              <Button onClick={() => window.print()}>Print Barcode</Button>
            </div>

            {/* Placeholder Graphs */}
            <h3>Sales Quantity by Month</h3>
            <div
              style={{
                height: 200,
                backgroundColor: "#f0f0f0",
                marginBottom: 20,
              }}
            >
              <p>Graph Placeholder</p>
            </div>

            <h3>Purchase Quantity by Month</h3>
            <div style={{ height: 200, backgroundColor: "#f0f0f0" }}>
              <p>Graph Placeholder</p>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
