/**
 * Dashboard page for the Promethean Documentation System
 */

import React from 'react';
import { Card, Row, Col, Statistic, Typography, List, Tag, Space } from 'antd';
import {
  FileTextOutlined,
  SearchOutlined,
  RobotOutlined,
  UserOutlined,
} from '@ant-design/icons';

const { Title, Paragraph } = Typography;

export function Dashboard(): React.ReactElement {
  // TODO: Replace with actual data from API
  const stats = {
    totalDocuments: 0,
    totalQueries: 0,
    activeJobs: 0,
    totalUsers: 0,
  };

  const recentActivity = [
    {
      id: '1',
      type: 'document',
      title: 'New document created',
      description: 'Getting Started Guide',
      timestamp: '2 minutes ago',
    },
    {
      id: '2',
      type: 'query',
      title: 'Query executed',
      description: 'Search for "authentication"',
      timestamp: '5 minutes ago',
    },
    {
      id: '3',
      type: 'job',
      title: 'Ollama job completed',
      description: 'Document summarization',
      timestamp: '10 minutes ago',
    },
  ];

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'document':
        return <FileTextOutlined style={{ color: '#1890ff' }} />;
      case 'query':
        return <SearchOutlined style={{ color: '#52c41a' }} />;
      case 'job':
        return <RobotOutlined style={{ color: '#fa8c16' }} />;
      default:
        return <UserOutlined style={{ color: '#722ed1' }} />;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'document':
        return 'blue';
      case 'query':
        return 'green';
      case 'job':
        return 'orange';
      default:
        return 'purple';
    }
  };

  return (
    <div>
      <Title level={2}>Dashboard</Title>
      <Paragraph>
        Welcome to the Promethean Documentation System. Here's an overview of your system.
      </Paragraph>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Total Documents"
              value={stats.totalDocuments}
              prefix={<FileTextOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Total Queries"
              value={stats.totalQueries}
              prefix={<SearchOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Active Jobs"
              value={stats.activeJobs}
              prefix={<RobotOutlined />}
              valueStyle={{ color: '#fa8c16' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Total Users"
              value={stats.totalUsers}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card title="Recent Activity" bordered={false}>
            <List
              dataSource={recentActivity}
              renderItem={(item) => (
                <List.Item>
                  <List.Item.Meta
                    avatar={getActivityIcon(item.type)}
                    title={
                      <Space>
                        {item.title}
                        <Tag color={getActivityColor(item.type)}>
                          {item.type}
                        </Tag>
                      </Space>
                    }
                    description={
                      <div>
                        <div>{item.description}</div>
                        <div style={{ fontSize: '12px', color: '#999' }}>
                          {item.timestamp}
                        </div>
                      </div>
                    }
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="Quick Actions" bordered={false}>
            <List
              dataSource={[
                {
                  title: 'Create New Document',
                  description: 'Add a new document to the knowledge base',
                  action: () => console.log('Navigate to create document'),
                },
                {
                  title: 'Run Query',
                  description: 'Search the knowledge base with AI-powered queries',
                  action: () => console.log('Navigate to queries'),
                },
                {
                  title: 'Submit Ollama Job',
                  description: 'Submit a job to Ollama for AI processing',
                  action: () => console.log('Navigate to Ollama jobs'),
                },
              ]}
              renderItem={(item) => (
                <List.Item
                  style={{ cursor: 'pointer' }}
                  onClick={item.action}
                >
                  <List.Item.Meta
                    title={item.title}
                    description={item.description}
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
}