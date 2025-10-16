/**
 * Header component for the Promethean Documentation System
 */

import React from 'react';
import { Layout, Typography, Space, Button, Avatar, Dropdown } from 'antd';
import { UserOutlined, SettingOutlined, LogoutOutlined } from '@ant-design/icons';
import type { MenuProps } from 'antd';

const { Header: AntHeader } = Layout;
const { Title } = Typography;

export function Header(): React.ReactElement {
  // TODO: Get actual user data from authentication context
  const user = {
    name: 'John Doe',
    email: 'john.doe@example.com',
    avatar: undefined,
  };

  const userMenuItems: MenuProps['items'] = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: 'Profile',
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: 'Settings',
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Logout',
      danger: true,
    },
  ];

  const handleUserMenuClick: MenuProps['onClick'] = ({ key }) => {
    switch (key) {
      case 'profile':
        // TODO: Navigate to profile
        console.log('Navigate to profile');
        break;
      case 'settings':
        // TODO: Navigate to settings
        console.log('Navigate to settings');
        break;
      case 'logout':
        // TODO: Implement logout
        console.log('Logout user');
        break;
    }
  };

  return (
    <AntHeader
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: '#001529',
        padding: '0 24px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <Title
          level={3}
          style={{
            color: '#fff',
            margin: 0,
            fontWeight: 'bold',
          }}
        >
          Promethean Docs
        </Title>
      </div>

      <Space size="middle">
        <Button type="text" style={{ color: '#fff' }}>
          Documentation
        </Button>
        <Button type="text" style={{ color: '#fff' }}>
          API
        </Button>

        <Dropdown
          menu={{
            items: userMenuItems,
            onClick: handleUserMenuClick,
          }}
          placement="bottomRight"
        >
          <Space style={{ cursor: 'pointer', color: '#fff' }}>
            <Avatar
              size="small"
              icon={<UserOutlined />}
              src={user.avatar}
              style={{ backgroundColor: '#1890ff' }}
            />
            <span>{user.name}</span>
          </Space>
        </Dropdown>
      </Space>
    </AntHeader>
  );
}