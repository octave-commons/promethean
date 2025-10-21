/**
 * Queries page for the Promethean Documentation System
 */

import React, { useState } from 'react';
import {
  Card,
  Typography,
  Input,
  Button,
  Select,
  Space,
  List,
  Tag,
  Collapse,
  Spin,
  Alert,
} from 'antd';
import { SearchOutlined, PlusOutlined, HistoryOutlined } from '@ant-design/icons';

const { Title, Paragraph, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;
const { Panel } = Collapse;

interface Query {
  _id: string;
  text: string;
  type: string;
  status: string;
  createdAt: string;
  result?: any;
}

export function Queries(): React.ReactElement {
  const [queryText, setQueryText] = useState('');
  const [queryType, setQueryType] = useState('search');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // TODO: Replace with actual data from API
  const recentQueries: Query[] = [];

  const queryTypes = [
    { value: 'search', label: 'Search', description: 'Search documents' },
    { value: 'qa', label: 'Q&A', description: 'Ask questions about documents' },
    { value: 'summarization', label: 'Summarization', description: 'Summarize content' },
    { value: 'analysis', label: 'Analysis', description: 'Analyze documents' },
    { value: 'recommendation', label: 'Recommendation', description: 'Get recommendations' },
  ];

  const handleSubmitQuery = async () => {
    if (!queryText.trim()) {
      return;
    }

    setIsSubmitting(true);
    try {
      // TODO: Implement actual query submission
      console.log('Submitting query:', { text: queryText, type: queryType });
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Clear form on success
      setQueryText('');
    } catch (error) {
      console.error('Error submitting query:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors = {
      pending: 'orange',
      processing: 'blue',
      completed: 'green',
      failed: 'red',
      cancelled: 'gray',
    };
    return colors[status as keyof typeof colors] || 'default';
  };

  const getTypeColor = (type: string) => {
    const colors = {
      search: 'blue',
      qa: 'green',
      summarization: 'purple',
      analysis: 'orange',
      recommendation: 'cyan',
    };
    return colors[type as keyof typeof colors] || 'default';
  };

  return (
    <div>
      <Title level={2}>Queries</Title>
      <Paragraph>
        Ask questions and search through your documentation using AI-powered queries.
      </Paragraph>

      <Card title="New Query" style={{ marginBottom: 24 }}>
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          <div>
            <Text strong>Query Type:</Text>
            <Select
              value={queryType}
              onChange={setQueryType}
              style={{ width: '100%', marginTop: 8 }}
            >
              {queryTypes.map(type => (
                <Option key={type.value} value={type.value}>
                  <div>
                    <strong>{type.label}</strong>
                    <div style={{ fontSize: '12px', color: '#666' }}>
                      {type.description}
                    </div>
                  </div>
                </Option>
              ))}
            </Select>
          </div>

          <div>
            <Text strong>Query:</Text>
            <TextArea
              value={queryText}
              onChange={(e) => setQueryText(e.target.value)}
              placeholder={
                queryType === 'search' 
                  ? 'Enter your search terms...'
                  : queryType === 'qa'
                  ? 'Ask a question about your documents...'
                  : queryType === 'summarization'
                  ? 'Paste content to summarize...'
                  : queryType === 'analysis'
                  ? 'Describe what you want to analyze...'
                  : 'Describe what recommendations you need...'
              }
              rows={4}
              style={{ marginTop: 8 }}
            />
          </div>

          <Button
            type="primary"
            icon={<SearchOutlined />}
            onClick={handleSubmitQuery}
            loading={isSubmitting}
            disabled={!queryText.trim()}
            size="large"
          >
            Submit Query
          </Button>
        </Space>
      </Card>

      <div style={{ display: 'flex', gap: 24 }}>
        <div style={{ flex: 2 }}>
          <Card 
            title="Recent Queries" 
            extra={
              <Button 
                type="text" 
                icon={<HistoryOutlined />}
                onClick={() => console.log('View all query history')}
              >
                View All
              </Button>
            }
          >
            {recentQueries.length === 0 ? (
              <Alert
                message="No queries yet"
                description="Submit your first query to see results here."
                type="info"
                showIcon
              />
            ) : (
              <List
                dataSource={recentQueries}
                renderItem={(query) => (
                  <List.Item>
                    <List.Item.Meta
                      title={
                        <Space>
                          <Text>{query.text}</Text>
                          <Tag color={getTypeColor(query.type)}>
                            {query.type}
                          </Tag>
                          <Tag color={getStatusColor(query.status)}>
                            {query.status}
                          </Tag>
                        </Space>
                      }
                      description={
                        <div>
                          <Text type="secondary">
                            Created: {new Date(query.createdAt).toLocaleString()}
                          </Text>
                          {query.result && (
                            <div style={{ marginTop: 8 }}>
                              <Collapse ghost>
                                <Panel header="View Result" key="result">
                                  <pre style={{ 
                                    background: '#f5f5f5', 
                                    padding: 8, 
                                    borderRadius: 4,
                                    fontSize: '12px',
                                    overflow: 'auto'
                                  }}>
                                    {JSON.stringify(query.result, null, 2)}
                                  </pre>
                                </Panel>
                              </Collapse>
                            </div>
                          )}
                        </div>
                      }
                    />
                  </List.Item>
                )}
              />
            )}
          </Card>
        </div>

        <div style={{ flex: 1 }}>
          <Card title="Query Tips" size="small">
            <div>
              <Title level={5}>Search Tips:</Title>
              <ul>
                <li>Use specific keywords for better results</li>
                <li>Combine terms with AND, OR operators</li>
                <li>Use quotes for exact phrases</li>
              </ul>

              <Title level={5}>Q&A Tips:</Title>
              <ul>
                <li>Be specific in your questions</li>
                <li>Include context when relevant</li>
                <li>Ask follow-up questions for clarification</li>
              </ul>

              <Title level={5}>Analysis Tips:</Title>
              <ul>
                <li>Clearly define what you want to analyze</li>
                <li>Specify the type of analysis needed</li>
                <li>Provide relevant context or criteria</li>
              </ul>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}