import React, { useState } from 'react';
import { Table, Input } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import './PageStyle.css';

const UserManagement = () => {
  const [searchText, setSearchText] = useState('');

  // 模拟用户数据
  const mockData = [
    {
      key: '1',
      userId: '20001',
      username: 'ls',
      account: 'lisong@mat...',
      status: '正常',
      role: '开发者',
      createTime: '09/19/2025 2:05:40 PM',
      remark: '-',
    },
    {
      key: '2',
      userId: '2',
      username: 'admin',
      account: 'yangjing@...',
      status: '正常',
      role: '超级管理员',
      createTime: '07/05/2025 7:01:24 PM',
      remark: 'admin',
    },
  ];

  const [dataSource, setDataSource] = useState(mockData);

  // 表格列定义
  const columns = [
    {
      title: '用户 ID',
      dataIndex: 'userId',
      key: 'userId',
      width: 120,
    },
    {
      title: '用户名',
      dataIndex: 'username',
      key: 'username',
      width: 150,
    },
    {
      title: '账号',
      dataIndex: 'account',
      key: 'account',
      width: 180,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status) => (
        <span style={{ 
          display: 'inline-block',
          padding: '2px 12px',
          backgroundColor: '#f6ffed',
          color: '#52c41a',
          borderRadius: '4px',
          fontSize: '14px'
        }}>
          {status}
        </span>
      ),
    },
    {
      title: '角色',
      dataIndex: 'role',
      key: 'role',
      width: 180,
      render: (role) => (
        <span style={{ color: '#52c41a', fontSize: '14px' }}>
          <span style={{ marginRight: 6 }}>✓</span>
          {role}
        </span>
      ),
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      key: 'createTime',
      width: 220,
      sorter: (a, b) => new Date(a.createTime) - new Date(b.createTime),
    },
    {
      title: '备注',
      dataIndex: 'remark',
      key: 'remark',
      width: 150,
    },
  ];

  // 搜索处理
  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchText(value);
    
    if (!value) {
      setDataSource(mockData);
      return;
    }

    const filtered = mockData.filter(
      (item) =>
        item.username.toLowerCase().includes(value.toLowerCase()) ||
        item.remark.toLowerCase().includes(value.toLowerCase())
    );
    setDataSource(filtered);
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h2>用户管理</h2>
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
            用户数：<span style={{ fontWeight: 'bold' }}>{dataSource.length}</span>
          </div>
          <div>
            <Input
              placeholder="搜索用户名/备注"
              prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
              value={searchText}
              onChange={handleSearch}
              style={{ width: 300 }}
              allowClear
            />
          </div>
        </div>

        {/* 用户表格 */}
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

export default UserManagement;

