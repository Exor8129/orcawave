"use client";

import { useState } from "react";
import {
  Breadcrumb,
  Dropdown,
  MenuProps,
  Button,
  Table,
  Modal,
  Form,
  Input,
} from "antd";
import { MoreOutlined, PlusOutlined } from "@ant-design/icons";
import Link from "next/link";

const vendorsData = [
  {
    key: "1",
    companyName: "ABC Traders",
    gstNumber: "GST123456789",
    billingAddress: "123 Street, Dubai, UAE",
    contactNumber: "+971 50 123 4567",
    shippingAddress: "456 Avenue, Dubai, UAE",
  },
  {
    key: "2",
    companyName: "XYZ Enterprises",
    gstNumber: "GST987654321",
    billingAddress: "789 Road, Abu Dhabi, UAE",
    contactNumber: "+971 52 987 6543",
    shippingAddress: "",
  },
];

const menuItems: MenuProps["items"] = [
  { key: "1", label: "Edit" },
  { key: "2", label: "Delete" },
];

export default function Vendors() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();

  // Open the modal
  const showModal = () => {
    setIsModalOpen(true);
  };

  // Close the modal
  const handleCancel = () => {
    setIsModalOpen(false);
    form.resetFields(); // Reset form on close
  };

  // Handle form submission
  const handleSubmit = (values: any) => {
    console.log("New Vendor Details:", values);
    setIsModalOpen(false);
    form.resetFields(); // Reset form after submission
  };

  const columns = [
    {
      title: "Company Name",
      dataIndex: "companyName",
      key: "companyName",
    },
    {
      title: "GST Reg. Number",
      dataIndex: "gstNumber",
      key: "gstNumber",
    },
    {
      title: "Billing Address",
      dataIndex: "billingAddress",
      key: "billingAddress",
    },
    {
      title: "Contact Number",
      dataIndex: "contactNumber",
      key: "contactNumber",
    },
    {
      title: "Shipping Address",
      dataIndex: "shippingAddress",
      key: "shippingAddress",
      render: (text: string) => (text ? text : "N/A"),
    },
  ];

  return (
    <div className="p-4">
      {/* Breadcrumb Navigation */}
      <Breadcrumb
        items={[
          {
            title: <Link href="/dashboard/purchase">Purchase</Link>,
          },
          {
            title: "Vendors",
          },
        ]}
      />

      {/* Header Section with Buttons */}
      <div className="flex justify-between items-center mt-4 mb-4">
        <h1 className="text-2xl font-semibold">All Vendors</h1>

        <div className="flex gap-2">
          {/* "New" Button (Opens Modal) */}
          <Button type="primary" icon={<PlusOutlined />} onClick={showModal}>
            New
          </Button>

          {/* Three-dot Menu Button */}
          <Dropdown menu={{ items: menuItems }} placement="bottomRight" arrow>
            <Button shape="circle" icon={<MoreOutlined />} />
          </Dropdown>
        </div>
      </div>

      {/* Vendor Table */}
      <Table
        dataSource={vendorsData}
        columns={columns}
        pagination={{ pageSize: 5 }}
        bordered
      />

      {/* New Vendor Modal */}
      <Modal
        title="Add New Vendor"
        open={isModalOpen}
        onCancel={handleCancel}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            label="Company Name"
            name="companyName"
            rules={[{ required: true, message: "Please enter company name" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="GST Reg. Number"
            name="gstNumber"
            rules={[{ required: true, message: "Please enter GST number" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Billing Address"
            name="billingAddress"
            rules={[
              { required: true, message: "Please enter billing address" },
            ]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Contact Number"
            name="contactNumber"
            rules={[
              { required: true, message: "Please enter contact number" },
            ]}
          >
            <Input />
          </Form.Item>

          <Form.Item label="Shipping Address" name="shippingAddress">
            <Input placeholder="Optional" />
          </Form.Item>

          <div className="flex justify-end gap-2">
            <Button onClick={handleCancel}>Cancel</Button>
            <Button type="primary" htmlType="submit">
              Save
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
}
