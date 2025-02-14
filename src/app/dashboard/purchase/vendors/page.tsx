"use client";

import { useState, useEffect } from "react";
import {
  Breadcrumb,
  Dropdown,
  MenuProps,
  Button,
  Table,
  Modal,
  Form,
  Input,
  Select,
  message,
  Checkbox,
} from "antd";
import { MoreOutlined, PlusOutlined, SettingOutlined } from "@ant-design/icons";
import Link from "next/link";

const { Option } = Select;

export default function Vendors() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();
  const [vendors, setVendors] = useState([]);
  const [selectedColumns, setSelectedColumns] = useState<string[]>([]);

  // All available columns
  const allColumns = [
    { key: "companyName", title: "Company Name", dataIndex: "companyName" },
    { key: "gstNumber", title: "GST Reg. Number", dataIndex: "gstNumber" },
    { key: "billingAddress", title: "Billing Address", dataIndex: "billingAddress" },
    { key: "contactNumber", title: "Contact Number", dataIndex: "contactNumber" },
    { key: "shippingAddress", title: "Shipping Address", dataIndex: "shippingAddress" },
  ];

  // Fetch vendors from the database
  const fetchVendors = async () => {
    try {
      const res = await fetch("/api/vendors");
      const data = await res.json();
      if (data.success) {
        setVendors(data.vendors);
      } else {
        message.error("Failed to load vendors");
      }
    } catch (error) {
      console.error("Error fetching vendors:", error);
      message.error("Something went wrong!");
    }
  };

  useEffect(() => {
    fetchVendors();
    const storedColumns = localStorage.getItem("vendorSelectedColumns");
    setSelectedColumns(storedColumns ? JSON.parse(storedColumns) : allColumns.map(col => col.key));
  }, []);

  // Handle column selection
  const handleColumnChange = (checkedValues: string[]) => {
    setSelectedColumns(checkedValues);
    localStorage.setItem("vendorSelectedColumns", JSON.stringify(checkedValues));
  };

  // Handle form submission
  const handleSubmit = async (values: any) => {
    try {
      const response = await fetch("/api/vendors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const result = await response.json();
      if (result.success) {
        message.success("Vendor added successfully!");
        form.resetFields();
        setIsModalOpen(false);
        fetchVendors();
      } else {
        message.error("Failed to add vendor.");
      }
    } catch (error) {
      console.error("Error submitting vendor:", error);
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
      <Breadcrumb items={[{ title: <Link href="/dashboard/purchase">Purchase</Link> }, { title: "Vendors" }]} />

      <div className="flex justify-between items-center mt-4 mb-4">
        <h1 className="text-2xl font-semibold">All Vendors</h1>
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
        dataSource={vendors}
        columns={allColumns.filter(col => selectedColumns.includes(col.key))}
        pagination={{ pageSize: 5 }}
        bordered
      />

<Modal title="Add New Vendor" open={isModalOpen} onCancel={handleCancel} footer={null}>
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          {/* Primary Contact */}
          <h3 className="text-lg font-semibold">Primary Contact</h3>
          <div className="grid grid-cols-3 gap-2">
            <Form.Item label="Salutation" name="salutation">
              <Select placeholder="Select">
                <Option value="Mr.">Mr.</Option>
                <Option value="Ms.">Ms.</Option>
                <Option value="Mrs.">Mrs.</Option>
                <Option value="Dr.">Dr.</Option>
              </Select>
            </Form.Item>

            <Form.Item label="First Name" name="firstName" rules={[{ required: true, message: "Please enter first name" }]}>
              <Input />
            </Form.Item>

            <Form.Item label="Last Name" name="lastName" rules={[{ required: true, message: "Please enter last name" }]}>
              <Input />
            </Form.Item>
          </div>

          {/* Company Details */}
          <h3 className="text-lg font-semibold">Company Details</h3>
          <Form.Item label="Company Name" name="companyName" rules={[{ required: true, message: "Please enter company name" }]}>
            <Input />
          </Form.Item>

          <Form.Item label="Email" name="email" rules={[{ required: true, type: "email", message: "Please enter a valid email" }]}>
            <Input />
          </Form.Item>

          <Form.Item label="Phone" name="contactNumber" rules={[{ required: true, message: "Please enter phone number" }]}>
            <Input />
          </Form.Item>

          {/* Other Details */}
          <h3 className="text-lg font-semibold">Other Details</h3>
          <Form.Item label="GST Reg. Number" name="gstNumber" rules={[{ required: true, message: "Please enter GST number" }]}>
            <Input />
          </Form.Item>

          <div className="grid grid-cols-2 gap-2">
            <Form.Item label="State" name="state" rules={[{ required: true, message: "Please enter state" }]}>
              <Input />
            </Form.Item>

            <Form.Item label="Code" name="code" rules={[{ required: true, message: "Please enter code" }]}>
              <Input />
            </Form.Item>
          </div>

          <Form.Item label="Payment Terms" name="paymentTerms" rules={[{ required: true, message: "Please select payment terms" }]}>
            <Select placeholder="Select Payment Terms">
              <Option value="net 15">Net 15</Option>
              <Option value="net 20">Net 20</Option>
              <Option value="net 25">Net 25</Option>
              <Option value="net 30">Net 30</Option>
              <Option value="due on receipt">Due on Receipt</Option>
            </Select>
          </Form.Item>

          {/* Addresses */}
          <h3 className="text-lg font-semibold">Addresses</h3>
          <Form.Item label="Billing Address" name="billingAddress" rules={[{ required: true, message: "Please enter billing address" }]}>
            <Input />
          </Form.Item>

          <Form.Item label="Shipping Address" name="shippingAddress">
            <Input placeholder="Optional" />
          </Form.Item>

          {/* Action Buttons */}
          <div className="flex justify-end gap-2">
            <Button onClick={handleCancel}>Cancel</Button>
            <Button type="primary" htmlType="submit">Save</Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
}
