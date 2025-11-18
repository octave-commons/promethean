/**
 * Sidebar component for the Promethean Documentation System
 */

import React from 'react';
import { Layout, Menu } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  DashboardOutlined,
  FileTextOutlined,
  SearchOutlined,
  RobotOutlined,
  SettingOutlined,
} from '@ant-design/icons';

const { Sider } = Layout;

export function Sidebar(): React.ReactElement {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    {
      key: '/',
      icon: <DashboardOutlined />,
      label: 'Dashboard',
    },
    {
      key: '/documents',
      icon: <FileTextOutlined />,
      label: 'Documents',
    },
    {
      key: '/queries',
      icon: <SearchOutlined />,
      label: 'Queries',
    },
    {
      key: '/ollama',
      icon: <RobotOutlined />,
      label: 'Ollama Jobs',
    },
    {
      key: '/settings',
      icon: <SettingOutlined />,
      label: 'Settings',
    },
  ];

  const handleMenuClick = ({ key }: { key: string }) => {
    navigate(key);
  };

  const getSelectedKey = () => {
    return location.pathname;
  };

  return (
    <Sider
      width={200}
      style={{
        background: '#fff',
        borderRight: '1px solid #f0f0f0',
      }}
    >
      <Menu
        mode="inline"
        selectedKeys={[getSelectedKey()]}
        items={menuItems}
        onClick={handleMenuClick}
        style={{
          height: '100%',
          borderRight: 0,
        }}
      />
    </Sider>
  );
}