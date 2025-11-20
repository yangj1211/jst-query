
import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
  PlusOutlined,
  MessageOutlined,
  FileSearchOutlined,
} from '@ant-design/icons';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import QuestionAssistant from '../pages/QuestionAssistant';
import DataCenter from '../pages/DataCenter';
import PermissionConfig from '../pages/PermissionConfig';
import UserManagement from '../pages/UserManagement';
import RolePermission from '../pages/RolePermission';
import DataPermissionConfig from '../pages/DataPermissionConfig';
import DocumentSearch from '../pages/DocumentSearch';
import DataImport from '../pages/DataImport';
import BackupFiles from '../pages/BackupFiles';
import Dashboard from '../pages/Dashboard';
import { FilePreviewProvider, useFilePreview } from '../contexts/FilePreviewContext';
import { ConversationStateProvider, useConversationState } from '../contexts/ConversationStateContext';
import FilePreviewer from './FilePreviewer';
import ConversationSidebar from './ConversationSidebar';
import './MainLayout.css';

const { Sider, Content } = Layout;

// 将 icon 组件提取到组件外部，避免每次渲染都创建新实例
const QuestionIcon = <CompassOutlined />;
const DocumentIcon = <FileSearchOutlined />;
const DataIcon = <DatabaseOutlined />;
const PermissionIcon = <SettingOutlined />;
const TableIcon = <TableOutlined />;
const UploadIcon = <CloudUploadOutlined />;
const FileIcon = <FileProtectOutlined />;
const UserIcon = <UserOutlined />;
const TeamIcon = <TeamOutlined />;

/**
 * MainLayout 内部组件
 * 使用 FilePreviewContext 来访问文件预览器状态
 */
const MainLayoutContent = ({ collapsed, setCollapsed }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { previewFile, isPreviewVisible, closePreview } = useFilePreview();
  const isQuestionPage = location.pathname.startsWith('/question');
  
  // React Hooks 必须在组件顶层无条件调用
  const conversationState = useConversationState();

  // 根据当前路径和折叠状态确定选中的菜单项
  const getSelectedKey = useCallback(() => {
    if (location.pathname.startsWith('/question')) {
      return 'question';
    }
    if (location.pathname.startsWith('/document')) {
      return 'document';
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
    if (location.pathname.startsWith('/document')) {
      return 'document';
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
  }, [location.pathname, collapsed]); // 移除 getSelectedKey 依赖，避免无限循环

  // 进入问数助手页面时，如果没有激活的对话，自动选择最新的对话
  useEffect(() => {
    if (location.pathname.startsWith('/question') && conversationState) {
      const { conversations, activeConversationId, setActiveConversationId } = conversationState;
      // 如果没有激活的对话，或者当前激活的对话不在列表中，选择最新的对话
      if (conversations && conversations.length > 0) {
        if (!activeConversationId || !conversations.find(c => c.id === activeConversationId)) {
          // 按时间排序，选择最新的对话（时间字符串格式：YYYY-MM-DD HH:mm）
          const sortedConversations = [...conversations].sort((a, b) => {
            const timeA = new Date(a.time).getTime();
            const timeB = new Date(b.time).getTime();
            return timeB - timeA; // 降序，最新的在前
          });
          if (sortedConversations.length > 0) {
            setActiveConversationId(sortedConversations[0].id);
          }
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  // 稳定 selectedKeys 数组引用
  const selectedKeys = useMemo(() => [selectedKey], [selectedKey]);


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
    if (location.pathname === '/permission/data-permission') {
      return <DataPermissionConfig />;
    }
    if (location.pathname.startsWith('/permission')) {
      return <PermissionConfig />;
    }
    // 问数助手页面
    if (location.pathname.startsWith('/question')) {
      return <QuestionAssistant />;
    }
    // 单据检索页面
    if (location.pathname.startsWith('/document')) {
      return <DocumentSearch />;
    }
    // 默认显示问数助手
    return <QuestionAssistant />;
  };

  // 基础菜单项配置 - 使用 useMemo 稳定引用，避免无限重新渲染
  // 注意：icon 已经在组件外部定义，确保引用稳定
  const menuItems = useMemo(() => [
    {
      key: 'question',
      icon: QuestionIcon,
      label: '智能问数',
      path: '/question',
    },
    {
      key: 'document',
      icon: DocumentIcon,
      label: '单据检索',
      path: '/document',
    },
    {
      key: 'data',
      icon: DataIcon, 
      label: '数据管理',
      children: [
        {
          key: 'data-view',
          icon: TableIcon,
          label: '数据总览',
          path: '/data/view',
        },
        {
          key: 'data-import',
          icon: UploadIcon,
          label: '数据导入',
          path: '/data/import',
        },
        {
          key: 'data-backup',
          icon: FileIcon,
          label: '备份文件',
          path: '/data/backup',
        },
      ],
    },
    {
      key: 'permission',
      icon: PermissionIcon, 
      label: '权限配置',
      children: [
        {
          key: 'user-management',
          icon: UserIcon,
          label: '用户信息',
          path: '/permission/user-management',
        },
        {
          key: 'role-permission',
          icon: TeamIcon,
          label: '角色权限',
          path: '/permission/role-permission',
        },
      ],
    },
  ], []);

  // 使用 useCallback 稳定 handleMenuClick 函数引用
  const handleMenuClick = useCallback(({ key }) => {
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
      
      // 如果点击的是"问数助手"，且当前没有激活的对话，则自动选择最新的对话
      if (key === 'question' && conversationState) {
        const { conversations, activeConversationId, setActiveConversationId } = conversationState;
        // 如果没有激活的对话，或者当前激活的对话不在列表中，选择最新的对话
        if (conversations && conversations.length > 0) {
          if (!activeConversationId || !conversations.find(c => c.id === activeConversationId)) {
            // 按时间排序，选择最新的对话（时间字符串格式：YYYY-MM-DD HH:mm）
            const sortedConversations = [...conversations].sort((a, b) => {
              const timeA = new Date(a.time).getTime();
              const timeB = new Date(b.time).getTime();
              return timeB - timeA; // 降序，最新的在前
            });
            if (sortedConversations.length > 0) {
              setActiveConversationId(sortedConversations[0].id);
            }
          }
        }
      }
    }
  }, [menuItems, navigate, conversationState]);

  const toggleCollapsed = () => {
    setCollapsed(!collapsed);
  };

  return (
    <Layout className="main-layout">
      <Sider 
        width={280} 
        collapsedWidth={72}
        collapsed={collapsed}
        className="sidebar"
        trigger={null}
      >
        <div className="sidebar-content">
          <div className="sidebar-header">
            <h1 className="sidebar-title">
              {!collapsed && '问数智能体'}
            </h1>
            <div className="header-actions">
              {/* 新建对话按钮 - 只在问数助手页面显示（收缩时也显示） */}
              {isQuestionPage && conversationState && (
                <button
                  onClick={conversationState.createNewConversation}
                  className="new-conversation-icon-btn"
                  aria-label="新建对话"
                  title="新建对话"
                >
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    {/* 圆角正方形 */}
                    <rect x="2.5" y="2.5" width="15" height="15" rx="2.5" stroke="currentColor" strokeWidth="1.5" fill="none"/>
                    {/* 加号 - 居中 */}
                    <line x1="10" y1="6.5" x2="10" y2="10.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                    <line x1="8.5" y1="8.5" x2="11.5" y2="8.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                </button>
              )}
              <button
                onClick={toggleCollapsed}
                className="collapse-btn-header"
                aria-label={collapsed ? '展开菜单' : '折叠菜单'}
              >
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="2" y="2" width="16" height="16" rx="2" stroke="currentColor" strokeWidth="1.5" fill="white"/>
                  <line x1="5" y1="6" x2="7" y2="6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  <line x1="5" y1="9" x2="7" y2="9" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </button>
            </div>
          </div>

          <div className="divider-with-button">
            <div className="divider-line"></div>
          </div>

          <div className="menu-section">
            <Menu
              mode="inline"
              selectedKeys={selectedKeys}
              onClick={handleMenuClick}
              items={menuItems}
              className="menu"
              inlineCollapsed={collapsed}
            />
          </div>

          {/* 对话列表 - 只在问数助手页面且未折叠时显示 */}
          {isQuestionPage && !collapsed && conversationState && (
            <ConversationSidebar
              conversations={conversationState.conversations}
              activeConversationId={conversationState.activeConversationId}
              onSelectConversation={conversationState.setActiveConversationId}
              onNewConversation={conversationState.createNewConversation}
              onRename={conversationState.renameConversation}
              onPin={conversationState.togglePinConversation}
              onDelete={conversationState.deleteConversation}
              formatDateTime={conversationState.formatDateTime}
            />
          )}
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
          <Outlet />
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
      <ConversationStateProvider>
        <MainLayoutContent collapsed={collapsed} setCollapsed={setCollapsed} />
      </ConversationStateProvider>
    </FilePreviewProvider>
  );
};

export default MainLayout;

