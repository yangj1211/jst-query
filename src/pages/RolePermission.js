import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Table, Input, Button, Tooltip } from 'antd';
import { SearchOutlined, SettingOutlined } from '@ant-design/icons';
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
      roleName: '管理员',
      status: '正常',
      createTime: '07/10/2025 10:30:15 AM',
      updateTime: '10/15/2025 3:20:10 PM',
      remark: '负责日常管理工作',
    },
    {
      key: '3',
      roleId: '10001',
      roleName: '开发者',
      status: '正常',
      createTime: '09/19/2025 2:05:21 PM',
      updateTime: '09/19/2025 2:05:21 PM',
      remark: '负责系统开发与维护',
    },
    {
      key: '4',
      roleId: '10002',
      roleName: '测试工程师',
      status: '禁用',
      createTime: '08/01/2025 9:15:30 AM',
      updateTime: '10/20/2025 4:50:45 PM',
      remark: '负责功能测试和bug反馈',
    },
    {
      key: '5',
      roleId: '10003',
      roleName: '运营人员',
      status: '正常',
      createTime: '08/15/2025 11:20:00 AM',
      updateTime: '10/25/2025 2:35:18 PM',
      remark: '负责业务运营和数据分析',
    },
    {
      key: '6',
      roleId: '10004',
      roleName: '产品经理',
      status: '正常',
      createTime: '07/20/2025 3:45:10 PM',
      updateTime: '10/28/2025 10:15:25 AM',
      remark: '负责产品规划和需求管理',
    },
    {
      key: '7',
      roleId: '10005',
      roleName: '销售主管',
      status: '正常',
      createTime: '09/01/2025 8:30:00 AM',
      updateTime: '10/30/2025 5:40:30 PM',
      remark: '管理销售团队和客户关系',
    },
    {
      key: '8',
      roleId: '10006',
      roleName: '财务专员',
      status: '禁用',
      createTime: '09/10/2025 1:20:45 PM',
      updateTime: '10/31/2025 11:25:50 AM',
      remark: '负责财务报表和账务处理',
    },
    {
      key: '9',
      roleId: '10007',
      roleName: '客服人员',
      status: '正常',
      createTime: '09/25/2025 10:10:20 AM',
      updateTime: '11/01/2025 9:05:15 AM',
      remark: '处理客户咨询和售后服务',
    },
    {
      key: '10',
      roleId: '10008',
      roleName: '数据分析师',
      status: '正常',
      createTime: '10/05/2025 2:50:35 PM',
      updateTime: '11/01/2025 3:30:40 PM',
      remark: '负责数据挖掘和业务洞察',
    },
  ];

  const [dataSource, setDataSource] = useState(mockData);

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
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status) => {
        const isNormal = status === '正常';
        return (
          <span style={{ 
            display: 'inline-block',
            padding: '2px 12px',
            backgroundColor: isNormal ? '#f6ffed' : '#fff1f0',
            color: isNormal ? '#52c41a' : '#ff4d4f',
            borderRadius: '4px',
            fontSize: '14px'
          }}>
            {status}
          </span>
        );
      },
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      key: 'createTime',
      width: 200,
      sorter: (a, b) => new Date(a.createTime) - new Date(b.createTime),
    },
    {
      title: '更新时间',
      dataIndex: 'updateTime',
      key: 'updateTime',
      width: 200,
      sorter: (a, b) => new Date(a.updateTime) - new Date(b.updateTime),
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
        // 超级管理员默认拥有所有权限，不需要配置
        if (record.roleName === '超级管理员' || record.roleId === '1') {
          return (
            <span style={{ color: '#999', fontSize: '14px' }}>
              -
            </span>
          );
        }
        // 管理员默认拥有所有权限，不需要配置
        if (record.roleName === '管理员' || record.roleId === '2') {
          return (
            <span style={{ color: '#999', fontSize: '14px' }}>
              -
            </span>
          );
        }
        // 禁用状态的角色不能配置
        if (record.status === '禁用') {
          return (
            <span style={{ color: '#999', fontSize: '14px' }}>
              -
            </span>
          );
        }
        return (
          <Tooltip title="配置数据权限">
            <Button 
              type="link" 
              icon={<SettingOutlined />}
              onClick={() => handleConfigPermission(record)}
              style={{ padding: 0, fontSize: '16px' }}
            />
          </Tooltip>
        );
      },
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

    const searchLower = value.toLowerCase().trim();
    const filtered = mockData.filter((item) => {
      // 搜索角色名
      const roleNameMatch = item.roleName && 
        item.roleName.toLowerCase().includes(searchLower);
      
      // 搜索备注（排除"-"等占位符）
      const remarkMatch = item.remark && 
        item.remark !== '-' && 
        item.remark.toLowerCase().includes(searchLower);
      
      return roleNameMatch || remarkMatch;
    });
    
    setDataSource(filtered);
  };

  // 配置数据权限处理
  const handleConfigPermission = (record) => {
    console.log('配置数据权限:', record);
    navigate('/permission/data-permission', { state: { role: record } });
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
          <div>
            <Input
              placeholder="搜索角色名/备注"
              prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
              value={searchText}
              onChange={handleSearch}
              style={{ width: 300 }}
              allowClear
            />
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

