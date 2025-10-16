/**
 * Ollama Jobs page for the Promethean Documentation System
 */

import React, { useState } from 'react';
import {
  Card,
  Typography,
  Button,
  Select,
  Input,
  Space,
  Table,
  Tag,
  Progress,
  Modal,
  Form,
  message,
} from 'antd';
import { PlusOutlined, PlayCircleOutlined, PauseCircleOutlined, StopOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';

const { Title, Paragraph, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

interface OllamaJob {
  _id: string;
  type: string;
  status: string;
  priority: string;
  model: string;
  progress: {
    current: number;
    total: number;
    percentage: number;
  };
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
  error?: any;
}

export function OllamaJobs(): React.ReactElement {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();

  // TODO: Replace with actual data from API
  const jobs: OllamaJob[] = [];

  const jobTypes = [
    { value: 'generate', label: 'Text Generation' },
    { value: 'chat', label: 'Chat Completion' },
    { value: 'embedding', label: 'Text Embedding' },
    { value: 'summarization', label: 'Text Summarization' },
    { value: 'analysis', label: 'Content Analysis' },
    { value: 'classification', label: 'Text Classification' },
  ];

  const priorities = [
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
    { value: 'urgent', label: 'Urgent' },
  ];

  const models = [
    { value: 'llama2', label: 'Llama 2' },
    { value: 'codellama', label: 'Code Llama' },
    { value: 'mistral', label: 'Mistral' },
    { value: 'vicuna', label: 'Vicuna' },
  ];

  const columns: ColumnsType<OllamaJob> = [
    {
      title: 'Job ID',
      dataIndex: '_id',
      key: '_id',
      render: (id: string) => <Text code>{id.substring(0, 8)}...</Text>,
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      render: (type: string) => {
        const color = {
          generate: 'blue',
          chat: 'green',
          embedding: 'purple',
          summarization: 'orange',
          analysis: 'cyan',
          classification: 'magenta',
        }[type] || 'default';
        return <Tag color={color}>{type}</Tag>;
      },
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const color = {
          queued: 'orange',
          running: 'blue',
          completed: 'green',
          failed: 'red',
          cancelled: 'gray',
          timeout: 'volcano',
        }[status] || 'default';
        return <Tag color={color}>{status}</Tag>;
      },
    },
    {
      title: 'Priority',
      dataIndex: 'priority',
      key: 'priority',
      render: (priority: string) => {
        const color = {
          low: 'default',
          medium: 'blue',
          high: 'orange',
          urgent: 'red',
        }[priority] || 'default';
        return <Tag color={color}>{priority}</Tag>;
      },
    },
    {
      title: 'Model',
      dataIndex: 'model',
      key: 'model',
    },
    {
      title: 'Progress',
      dataIndex: 'progress',
      key: 'progress',
      render: (progress: OllamaJob['progress'], record: OllamaJob) => {
        if (record.status === 'completed') {
          return <Progress percent={100} size="small" status="success" />;
        } else if (record.status === 'failed') {
          return <Progress percent={progress.percentage} size="small" status="exception" />;
        } else if (record.status === 'running') {
          return <Progress percent={progress.percentage} size="small" status="active" />;
        } else {
          return <Progress percent={0} size="small" />;
        }
      },
    },
    {
      title: 'Created',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => new Date(date).toLocaleString(),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space size="small">
          {record.status === 'queued' && (
            <Button
              type="text"
              icon={<PlayCircleOutlined />}
              onClick={() => console.log('Start job:', record._id)}
            >
              Start
            </Button>
          )}
          {record.status === 'running' && (
            <Button
              type="text"
              icon={<PauseCircleOutlined />}
              onClick={() => console.log('Pause job:', record._id)}
            >
              Pause
            </Button>
          )}
          {(record.status === 'running' || record.status === 'queued') && (
            <Button
              type="text"
              danger
              icon={<StopOutlined />}
              onClick={() => console.log('Cancel job:', record._id)}
            >
              Cancel
            </Button>
          )}
        </Space>
      ),
    },
  ];

  const handleCreateJob = async (values: any) => {
    try {
      console.log('Creating job:', values);
      // TODO: Implement actual job creation
      message.success('Job created successfully');
      setIsModalVisible(false);
      form.resetFields();
    } catch (error) {
      console.error('Error creating job:', error);
      message.error('Failed to create job');
    }
  };

  const handleJobAction = (jobId: string, action: string) => {
    console.log(`Job ${action}:`, jobId);
    // TODO: Implement job actions
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Title level={2}>Ollama Jobs</Title>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setIsModalVisible(true)}
        >
          Create Job
        </Button>
      </div>

      <Paragraph>
        Manage and monitor AI processing jobs running on Ollama models.
      </Paragraph>

      <Card>
        <Table
          columns={columns}
          dataSource={jobs}
          rowKey="_id"
          pagination={{
            total: jobs.length,
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} of ${total} jobs`,
          }}
          locale={{
            emptyText: 'No jobs found. Create your first job to get started.',
          }}
        />
      </Card>

      <Modal
        title="Create New Ollama Job"
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleCreateJob}
        >
          <Form.Item
            name="type"
            label="Job Type"
            rules={[{ required: true, message: 'Please select a job type' }]}
          >
            <Select placeholder="Select job type">
              {jobTypes.map(type => (
                <Option key={type.value} value={type.value}>
                  {type.label}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="model"
            label="Model"
            rules={[{ required: true, message: 'Please select a model' }]}
          >
            <Select placeholder="Select model">
              {models.map(model => (
                <Option key={model.value} value={model.value}>
                  {model.label}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="priority"
            label="Priority"
            rules={[{ required: true, message: 'Please select a priority' }]}
          >
            <Select placeholder="Select priority">
              {priorities.map(priority => (
                <Option key={priority.value} value={priority.value}>
                  {priority.label}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="prompt"
            label="Prompt"
            rules={[{ required: true, message: 'Please enter a prompt' }]}
          >
            <TextArea
              rows={4}
              placeholder="Enter the prompt or input for the job..."
            />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                Create Job
              </Button>
              <Button onClick={() => setIsModalVisible(false)}>
                Cancel
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}