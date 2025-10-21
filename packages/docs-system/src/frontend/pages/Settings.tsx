/**
 * Settings page for the Promethean Documentation System
 */

import React from 'react';
import {
  Card,
  Typography,
  Form,
  Input,
  Button,
  Switch,
  Select,
  InputNumber,
  Space,
  Divider,
  Alert,
} from 'antd';
import { SaveOutlined, ReloadOutlined } from '@ant-design/icons';

const { Title, Paragraph } = Typography;
const { Option } = Select;
const { TextArea } = Input;

export function Settings(): React.ReactElement {
  const [form] = Form.useForm();

  // TODO: Load actual settings from API
  const handleSaveSettings = async (values: any) => {
    try {
      console.log('Saving settings:', values);
      // TODO: Implement actual settings save
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  };

  const handleResetSettings = () => {
    form.resetFields();
  };

  const handleTestConnection = async (service: string) => {
    console.log(`Testing connection to ${service}`);
    // TODO: Implement connection testing
  };

  return (
    <div>
      <Title level={2}>Settings</Title>
      <Paragraph>
        Configure system settings and preferences for the Promethean Documentation System.
      </Paragraph>

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSaveSettings}
        initialValues={{
          // Default values
          siteName: 'Promethean Documentation System',
          siteDescription: 'AI-powered documentation system',
          defaultLanguage: 'en',
          timezone: 'UTC',
          enableFuzzySearch: true,
          enableSemanticSearch: true,
          searchTimeout: 30,
          defaultModel: 'llama2',
          maxTokens: 2048,
          temperature: 0.7,
          enableStreaming: true,
          cacheResults: true,
          cacheExpiration: 3600,
          enableRateLimit: true,
          rateLimitWindow: 900,
          rateLimitMax: 100,
          enableAuditLog: true,
          sessionTimeout: 3600,
          enableCaching: true,
          cacheExpiration2: 1800,
          enableCompression: true,
          maxUploadSize: 10,
          concurrentJobs: 5,
        }}
      >
        {/* General Settings */}
        <Card title="General Settings" style={{ marginBottom: 24 }}>
          <Form.Item
            name="siteName"
            label="Site Name"
            rules={[{ required: true, message: 'Please enter site name' }]}
          >
            <Input placeholder="Enter site name" />
          </Form.Item>

          <Form.Item
            name="siteDescription"
            label="Site Description"
          >
            <TextArea rows={3} placeholder="Enter site description" />
          </Form.Item>

          <Form.Item
            name="contactEmail"
            label="Contact Email"
            rules={[
              { required: true, message: 'Please enter contact email' },
              { type: 'email', message: 'Please enter a valid email' }
            ]}
          >
            <Input placeholder="contact@example.com" />
          </Form.Item>

          <Space size="large">
            <Form.Item
              name="defaultLanguage"
              label="Default Language"
            >
              <Select style={{ width: 150 }}>
                <Option value="en">English</Option>
                <Option value="es">Spanish</Option>
                <Option value="fr">French</Option>
                <Option value="de">German</Option>
                <Option value="zh">Chinese</Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="timezone"
              label="Timezone"
            >
              <Select style={{ width: 200 }}>
                <Option value="UTC">UTC</Option>
                <Option value="America/New_York">Eastern Time</Option>
                <Option value="America/Los_Angeles">Pacific Time</Option>
                <Option value="Europe/London">London</Option>
                <Option value="Asia/Tokyo">Tokyo</Option>
              </Select>
            </Form.Item>
          </Space>
        </Card>

        {/* Search Settings */}
        <Card title="Search Settings" style={{ marginBottom: 24 }}>
          <Form.Item
            name="defaultResultsPerPage"
            label="Default Results Per Page"
          >
            <InputNumber min={5} max={100} />
          </Form.Item>

          <Form.Item
            name="maxResultsPerPage"
            label="Max Results Per Page"
          >
            <InputNumber min={10} max={200} />
          </Form.Item>

          <Space size="large">
            <Form.Item
              name="enableFuzzySearch"
              label="Enable Fuzzy Search"
              valuePropName="checked"
            >
              <Switch />
            </Form.Item>

            <Form.Item
              name="enableSemanticSearch"
              label="Enable Semantic Search"
              valuePropName="checked"
            >
              <Switch />
            </Form.Item>
          </Space>

          <Form.Item
            name="searchTimeout"
            label="Search Timeout (seconds)"
          >
            <InputNumber min={5} max={300} />
          </Form.Item>
        </Card>

        {/* AI Settings */}
        <Card title="AI Settings" style={{ marginBottom: 24 }}>
          <Alert
            message="AI Configuration"
            description="Configure Ollama endpoint and model settings. Make sure Ollama is running and accessible."
            type="info"
            showIcon
            style={{ marginBottom: 16 }}
          />

          <Form.Item
            name="ollamaEndpoint"
            label="Ollama Endpoint"
            rules={[{ required: true, message: 'Please enter Ollama endpoint' }]}
          >
            <Input placeholder="http://localhost:11434" />
          </Form.Item>

          <Form.Item
            name="defaultModel"
            label="Default Model"
          >
            <Select placeholder="Select default model">
              <Option value="llama2">Llama 2</Option>
              <Option value="codellama">Code Llama</Option>
              <Option value="mistral">Mistral</Option>
              <Option value="vicuna">Vicuna</Option>
            </Select>
          </Form.Item>

          <Space size="large">
            <Form.Item
              name="maxTokens"
              label="Max Tokens"
            >
              <InputNumber min={128} max={8192} />
            </Form.Item>

            <Form.Item
              name="temperature"
              label="Temperature"
              step={0.1}
              min={0}
              max={2}
            >
              <InputNumber />
            </Form.Item>
          </Space>

          <Space size="large">
            <Form.Item
              name="enableStreaming"
              label="Enable Streaming"
              valuePropName="checked"
            >
              <Switch />
            </Form.Item>

            <Form.Item
              name="cacheResults"
              label="Cache Results"
              valuePropName="checked"
            >
              <Switch />
            </Form.Item>
          </Space>

          <Form.Item
            name="cacheExpiration"
            label="Cache Expiration (seconds)"
          >
            <InputNumber min={300} max={86400} />
          </Form.Item>

          <Button
            type="dashed"
            onClick={() => handleTestConnection('ollama')}
          >
            Test Ollama Connection
          </Button>
        </Card>

        {/* Security Settings */}
        <Card title="Security Settings" style={{ marginBottom: 24 }}>
          <Space size="large">
            <Form.Item
              name="enableRateLimit"
              label="Enable Rate Limiting"
              valuePropName="checked"
            >
              <Switch />
            </Form.Item>

            <Form.Item
              name="enableAuditLog"
              label="Enable Audit Log"
              valuePropName="checked"
            >
              <Switch />
            </Form.Item>
          </Space>

          <Space size="large">
            <Form.Item
              name="rateLimitWindow"
              label="Rate Limit Window (seconds)"
            >
              <InputNumber min={60} max={3600} />
            </Form.Item>

            <Form.Item
              name="rateLimitMax"
              label="Rate Limit Max Requests"
            >
              <InputNumber min={10} max={1000} />
            </Form.Item>
          </Space>

          <Form.Item
            name="sessionTimeout"
            label="Session Timeout (seconds)"
          >
            <InputNumber min={300} max={86400} />
          </Form.Item>
        </Card>

        {/* Performance Settings */}
        <Card title="Performance Settings" style={{ marginBottom: 24 }}>
          <Space size="large">
            <Form.Item
              name="enableCaching"
              label="Enable Caching"
              valuePropName="checked"
            >
              <Switch />
            </Form.Item>

            <Form.Item
              name="enableCompression"
              label="Enable Compression"
              valuePropName="checked"
            >
              <Switch />
            </Form.Item>
          </Space>

          <Space size="large">
            <Form.Item
              name="cacheExpiration2"
              label="Cache Expiration (seconds)"
            >
              <InputNumber min={300} max={86400} />
            </Form.Item>

            <Form.Item
              name="maxUploadSize"
              label="Max Upload Size (MB)"
            >
              <InputNumber min={1} max={100} />
            </Form.Item>
          </Space>

          <Form.Item
            name="concurrentJobs"
            label="Concurrent Jobs"
          >
            <InputNumber min={1} max={20} />
          </Form.Item>
        </Card>

        <Divider />

        <Space>
          <Button
            type="primary"
            htmlType="submit"
            icon={<SaveOutlined />}
          >
            Save Settings
          </Button>
          <Button
            onClick={handleResetSettings}
            icon={<ReloadOutlined />}
          >
            Reset to Defaults
          </Button>
        </Space>
      </Form>
    </div>
  );
}