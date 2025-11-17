/**
 * Documents page for the Promethean Documentation System
 */

import React from 'react';
import { Card, Typography, Table, Button, Space, Tag, Input, Select } from 'antd';
import { PlusOutlined, SearchOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';

const { Title } = Typography;
const { Search } = Input;
const { Option } = Select;

interface Document {
  _id: string;
  title: string;
  type: string;
  category: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

export function Documents(): React.ReactElement {
  // TODO: Replace with actual data from API
  const documents: Document[] = [];

  const columns: ColumnsType<Document> = [
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
      render: (text: string) => <strong>{text}</strong>,
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      render: (type: string) => {
        const color = {
          markdown: 'blue',
          documentation: 'green',
          'api-reference': 'orange',
          tutorial: 'purple',
          guide: 'cyan',
          policy: 'red',
          specification: 'magenta',
          'code-example': 'geekblue',
        }[type] || 'default';
        return <Tag color={color}>{type}</Tag>;
      },
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const color = {
          draft: 'orange',
          published: 'green',
          archived: 'gray',
          deprecated: 'red',
        }[status] || 'default';
        return <Tag color={color}>{status}</Tag>;
      },
    },
    {
      title: 'Created',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => new Date(date).toLocaleDateString(),
    },
    {
      title: 'Updated',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      render: (date: string) => new Date(date).toLocaleDateString(),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space size="middle">
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => console.log('Edit document:', record._id)}
          >
            Edit
          </Button>
          <Button
            type="text"
            danger
            icon={<DeleteOutlined />}
            onClick={() => console.log('Delete document:', record._id)}
          >
            Delete
          </Button>
        </Space>
      ),
    },
  ];

  const handleSearch = (value: string) => {
    console.log('Search:', value);
    // TODO: Implement search functionality
  };

  const handleFilterChange = (value: string, field: string) => {
    console.log('Filter:', field, value);
    // TODO: Implement filter functionality
  };

  const handleCreateDocument = () => {
    console.log('Create new document');
    // TODO: Navigate to create document page
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Title level={2}>Documents</Title>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleCreateDocument}
        >
          Create Document
        </Button>
      </div>

      <Card>
        <div style={{ marginBottom: 16 }}>
          <Space size="middle">
            <Search
              placeholder="Search documents..."
              allowClear
              enterButton={<SearchOutlined />}
              style={{ width: 300 }}
              onSearch={handleSearch}
            />
            <Select
              placeholder="Filter by type"
              style={{ width: 150 }}
              allowClear
              onChange={(value) => handleFilterChange(value, 'type')}
            >
              <Option value="markdown">Markdown</Option>
              <Option value="documentation">Documentation</Option>
              <Option value="api-reference">API Reference</Option>
              <Option value="tutorial">Tutorial</Option>
              <Option value="guide">Guide</Option>
              <Option value="policy">Policy</Option>
              <Option value="specification">Specification</Option>
              <Option value="code-example">Code Example</Option>
            </Select>
            <Select
              placeholder="Filter by status"
              style={{ width: 150 }}
              allowClear
              onChange={(value) => handleFilterChange(value, 'status')}
            >
              <Option value="draft">Draft</Option>
              <Option value="published">Published</Option>
              <Option value="archived">Archived</Option>
              <Option value="deprecated">Deprecated</Option>
            </Select>
          </Space>
        </div>

        <Table
          columns={columns}
          dataSource={documents}
          rowKey="_id"
          pagination={{
            total: documents.length,
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} of ${total} documents`,
          }}
          locale={{
            emptyText: 'No documents found. Create your first document to get started.',
          }}
        />
      </Card>
    </div>
  );
}