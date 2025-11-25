
import React, { useState, useEffect, useCallback } from 'react';
import { Layout, Menu } from 'antd';
import {
  CompassOutlined,
  DatabaseOutlined,
  SettingOutlined,
  UserOutlined,
  TableOutlined,
  CloudUploadOutlined,
  TeamOutlined,
  FileProtectOutlined,
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import QuestionAssistant from '../pages/QuestionAssistant';
import DataCenter from '../pages/DataCenter';
import PermissionConfig from '../pages/PermissionConfig';
import UserManagement from '../pages/UserManagement';
import RolePermission from '../pages/RolePermission';
import DataPermissionConfig from '../pages/DataPermissionConfig';
import CreateRole from '../pages/CreateRole';
import DocumentSearch from '../pages/DocumentSearch';
import DataImport from '../pages/DataImport';
import BackupFiles from '../pages/BackupFiles';
import Dashboard from '../pages/Dashboard';
import { FilePreviewProvider, useFilePreview } from '../contexts/FilePreviewContext';
import FilePreviewer from './FilePreviewer';
import './MainLayout.css';

const { Sider, Content } = Layout;

/**
 * MainLayout 内部组件
 * 使用 FilePreviewContext 来访问文件预览器状态
 */
const MainLayoutContent = ({ collapsed, setCollapsed }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { previewFile, isPreviewVisible, closePreview } = useFilePreview();

  // 根据当前路径和折叠状态确定选中的菜单项
  const getSelectedKey = useCallback(() => {
    if (location.pathname.startsWith('/question')) {
      return 'question';
    }
    if (location.pathname.startsWith('/data')) {
      if (collapsed) return 'data';
      if (location.pathname === '/data/view') return 'data-view';
      if (location.pathname === '/data/import') return 'data-import';
      if (location.pathname === '/data/backup') return 'data-backup';
      return 'data-view';
    }
    if (location.pathname.startsWith('/permission')) {
      return collapsed ? 'permission' : (location.pathname.includes('user-management') ? 'user-management' : 'role-permission');
    }
    return 'question';
  }, [location.pathname, collapsed]);

  const [selectedKey, setSelectedKey] = useState(() => {
    if (location.pathname.startsWith('/question')) {
      return 'question';
    }
    if (location.pathname.startsWith('/data')) {
      if (collapsed) return 'data';
      if (location.pathname === '/data/view') return 'data-view';
      if (location.pathname === '/data/import') return 'data-import';
      if (location.pathname === '/data/backup') return 'data-backup';
      return 'data-view';
    }
    if (location.pathname.startsWith('/permission')) {
      return collapsed ? 'permission' : (location.pathname.includes('user-management') ? 'user-management' : 'role-permission');
    }
    return 'question';
  });

  // 当路径或折叠状态变化时，更新选中的菜单项
  useEffect(() => {
    const newKey = getSelectedKey();
    setSelectedKey(newKey);
  }, [location.pathname, collapsed, getSelectedKey]);

  // 假设路由结构为 /question, /document, /data, /permission
  const [activeTab, setActiveTab] = useState('question');

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === 'question') {
      navigate('/question');
    } else if (tab === 'document') {
      navigate('/document');
    }
  };


  const renderContent = () => {
    // 简单的路由逻辑
    if (location.pathname.startsWith('/dashboard')) {
      return <Dashboard />;
    }
    // 先判断更具体的路径
    if (location.pathname === '/data/import') {
      return <DataImport />;
    }
    if (location.pathname === '/data/backup') {
      return <BackupFiles />;
    }
    if (location.pathname === '/data/view') {
      return <DataCenter />;
    }
    if (location.pathname.startsWith('/data')) {
      return <DataCenter />;
    }
    if (location.pathname === '/permission/user-management') {
      return <UserManagement />;
    }
    if (location.pathname === '/permission/role-permission') {
      return <RolePermission />;
    }
    if (location.pathname === '/permission/create-role') {
      return <CreateRole />;
    }
    if (location.pathname === '/permission/data-permission') {
      return <DataPermissionConfig />;
    }
    if (location.pathname.startsWith('/permission')) {
      return <PermissionConfig />;
    }
    // 默认显示问数助手相关的布局
    return (
      <>
        <div className="main-tabs">
          <button
            className={`main-tab-button ${activeTab === 'question' ? 'active' : ''}`}
            onClick={() => handleTabChange('question')}
          >
            智能问数
          </button>
          <button
            className={`main-tab-button ${activeTab === 'document' ? 'active' : ''}`}
            onClick={() => handleTabChange('document')}
          >
            单据检索
          </button>
        </div>
        <div className="main-tab-content">
          {activeTab === 'question' ? <QuestionAssistant /> : <DocumentSearch />}
        </div>
      </>
    );
  };

  // 基础菜单项配置
  const baseMenuItems = [
    {
      key: 'question',
      icon: <CompassOutlined />,
      label: '问数助手',
      path: '/question',
    },
    {
      key: 'data',
      icon: <DatabaseOutlined />, 
      label: '数据管理',
      children: [
        {
          key: 'data-view',
          icon: <TableOutlined />,
          label: '数据总览',
          path: '/data/view',
        },
        {
          key: 'data-import',
          icon: <CloudUploadOutlined />,
          label: '数据导入',
          path: '/data/import',
        },
        {
          key: 'data-backup',
          icon: <FileProtectOutlined />,
          label: '备份文件',
          path: '/data/backup',
        },
      ],
    },
    {
      key: 'permission',
      icon: <SettingOutlined />, 
      label: '权限配置',
      children: [
        {
          key: 'user-management',
          icon: <UserOutlined />,
          label: '用户信息',
          path: '/permission/user-management',
        },
        {
          key: 'role-permission',
          icon: <TeamOutlined />,
          label: '角色权限',
          path: '/permission/role-permission',
        },
      ],
    },
  ];

  const menuItems = baseMenuItems;

  const handleMenuClick = ({ key }) => {
    // 查找主菜单项
    let item = menuItems.find((menu) => menu.key === key);
    
    // 如果没找到，查找子菜单项
    if (!item) {
      for (const menu of menuItems) {
        if (menu.children) {
          item = menu.children.find((child) => child.key === key);
          if (item) break;
        }
      }
    }
    
    if (item && item.path) {
      setSelectedKey(key);
      navigate(item.path);
    }
  };

  const toggleCollapsed = () => {
    setCollapsed(!collapsed);
  };

  return (
    <Layout className="main-layout">
      <Sider 
        width={180} 
        collapsedWidth={72}
        collapsed={collapsed}
        className="sidebar"
        trigger={null}
      >
        <div className="sidebar-content">
          <div className="sidebar-header">
            <h1 className="sidebar-title">
              {collapsed ? 'JST' : '金盘问数智能体'}
            </h1>
          </div>

          <div className="divider-with-button">
            <div className="divider-line"></div>
          </div>

          <div className="menu-section">
            <Menu
              mode="inline"
              selectedKeys={[selectedKey]}
              onClick={handleMenuClick}
              items={menuItems}
              className="menu"
              inlineCollapsed={collapsed}
              forceSubMenuRender={true}
            />
          </div>

          <div className="collapse-btn-container">
            <button
              onClick={toggleCollapsed}
              className="collapse-btn"
              aria-label={collapsed ? '展开菜单' : '折叠菜单'}
            >
              <div className="collapse-btn-icon">
                <span className={`collapse-arrow ${collapsed ? 'collapse-arrow-right' : 'collapse-arrow-left'}`}></span>
                <span className="collapse-line collapse-line-top"></span>
                <span className="collapse-line collapse-line-middle"></span>
                <span className="collapse-line collapse-line-bottom"></span>
              </div>
            </button>
          </div>
        </div>
      </Sider>
      
      <Layout style={{ display: 'flex', flexDirection: 'row', height: '100vh', overflow: 'hidden' }}>
        <Content 
          className="main-content"
          style={{ 
            flex: isPreviewVisible ? '0 0 calc(100% - 720px)' : '1 1 auto',
            overflow: 'auto'
          }}
        >
          {renderContent()}
        </Content>
        
        {/* 文件预览器 */}
        {isPreviewVisible && (
          <FilePreviewer 
            visible={isPreviewVisible}
            file={previewFile}
            onClose={closePreview}
          />
        )}
      </Layout>
    </Layout>
  );
};

/**
 * MainLayout 主组件
 * 提供 FilePreviewProvider Context
 */
const MainLayout = () => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <FilePreviewProvider onSidebarCollapse={(shouldCollapse) => setCollapsed(shouldCollapse)}>
      <MainLayoutContent collapsed={collapsed} setCollapsed={setCollapsed} />
    </FilePreviewProvider>
  );
};

export default MainLayout;

