import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Table, Input, Button, Tooltip, Popconfirm } from 'antd';
import { SearchOutlined, SettingOutlined, PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import './PageStyle.css';

const RolePermission = () => {
  const navigate = useNavigate();
  const [searchText, setSearchText] = useState('');

  // 模拟角色数据
  const mockData = [
    {
      key: '1',
      roleId: '1',
      roleName: '超级管理员',
      status: '正常',
      createTime: '07/05/2025 7:01:24 PM',
      updateTime: '07/05/2025 7:01:24 PM',
      remark: '拥有系统所有权限',
    },
    {
      key: '2',
      roleId: '2',
      roleName: '普通角色',
      status: '正常',
      createTime: '07/10/2025 10:30:15 AM',
      updateTime: '07/10/2025 10:30:15 AM',
      remark: '普通用户角色',
    },
    {
      key: '3',
      roleId: '3',
      roleName: '财务角色',
      status: '正常',
      createTime: '07/15/2025 11:20:00 AM',
      updateTime: '07/15/2025 11:20:00 AM',
      remark: '财务部门角色',
    },
    {
      key: '4',
      roleId: '4',
      roleName: '销售角色',
      status: '正常',
      createTime: '07/20/2025 2:15:30 PM',
      updateTime: '07/20/2025 2:15:30 PM',
      remark: '销售部门角色',
    },
    {
      key: '5',
      roleId: '5',
      roleName: '财务总监角色',
      status: '正常',
      createTime: '07/25/2025 3:45:10 PM',
      updateTime: '07/25/2025 3:45:10 PM',
      remark: '财务总监角色',
    },
  ];

  const [allRoles, setAllRoles] = useState(mockData);
  const [dataSource, setDataSource] = useState(mockData);

  const filterRoles = (list, keyword) => {
    if (!keyword) {
      return list;
    }

    const searchLower = keyword.toLowerCase().trim();
    return list.filter((item) => {
      const roleNameMatch = item.roleName && 
        item.roleName.toLowerCase().includes(searchLower);
      const remarkMatch = item.remark && 
        item.remark !== '-' && 
        item.remark.toLowerCase().includes(searchLower);
      return roleNameMatch || remarkMatch;
    });
  };

  // 表格列定义
  const columns = [
    {
      title: '角色 ID',
      dataIndex: 'roleId',
      key: 'roleId',
      width: 120,
    },
    {
      title: '角色名',
      dataIndex: 'roleName',
      key: 'roleName',
      width: 150,
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      key: 'createTime',
      width: 200,
      sorter: (a, b) => new Date(a.createTime) - new Date(b.createTime),
    },
    {
      title: '备注',
      dataIndex: 'remark',
      key: 'remark',
      width: 150,
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      render: (_, record) => {
        const isSuperAdmin = record.roleName === '超级管理员' || record.roleId === '1';
        return (
          <span style={{ display: 'flex', gap: '8px' }}>
            <Tooltip title="配置数据权限">
              <Button 
                type="link" 
                icon={<SettingOutlined />}
                onClick={() => handleConfigPermission(record)}
                disabled={isSuperAdmin}
                style={{ 
                  padding: 0, 
                  fontSize: '16px',
                  ...(isSuperAdmin ? { color: '#d9d9d9', cursor: 'not-allowed' } : {})
                }}
              />
            </Tooltip>
            <Tooltip title="删除角色">
              <Popconfirm
                title="确认删除该角色？"
                okText="删除"
                cancelText="取消"
                onConfirm={() => handleDeleteRole(record.key)}
              >
                <Button 
                  type="link" 
                  danger
                  icon={<DeleteOutlined />}
                  disabled={isSuperAdmin}
                  style={{ 
                    padding: 0, 
                    fontSize: '16px',
                    ...(isSuperAdmin ? { color: '#d9d9d9', cursor: 'not-allowed' } : {})
                  }}
                />
              </Popconfirm>
            </Tooltip>
          </span>
        );
      },
    },
  ];

  // 搜索处理
  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchText(value);
    
    setDataSource(filterRoles(allRoles, value));
  };

  // 配置数据权限处理
  const handleConfigPermission = (record) => {
    console.log('配置数据权限:', record);
    navigate('/permission/data-permission', { state: { role: record } });
  };

  // 新建角色处理
  const handleCreateRole = () => {
    navigate('/permission/create-role');
  };

  // 删除角色
  const handleDeleteRole = (roleKey) => {
    setAllRoles((prev) => {
      const updated = prev.filter((item) => item.key !== roleKey);
      setDataSource(filterRoles(updated, searchText));
      return updated;
    });
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h2>角色权限</h2>
      </div>
      <div className="page-content" style={{ padding: '24px' }}>
        {/* 顶部统计和搜索栏 */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: '24px'
        }}>
          <div style={{ fontSize: '16px', fontWeight: 500 }}>
            角色数：<span style={{ fontWeight: 'bold' }}>{dataSource.length}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Input
              placeholder="搜索角色名/备注"
              prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
              value={searchText}
              onChange={handleSearch}
              style={{ width: 300 }}
              allowClear
            />
            <Button 
              type="primary" 
              icon={<PlusOutlined />}
              onClick={handleCreateRole}
            >
              新建角色
            </Button>
          </div>
        </div>

        {/* 角色表格 */}
        <Table
          dataSource={dataSource}
          columns={columns}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `共 ${total} 条`,
            pageSizeOptions: ['10', '20', '50', '100'],
          }}
        />
      </div>
    </div>
  );
};

export default RolePermission;

