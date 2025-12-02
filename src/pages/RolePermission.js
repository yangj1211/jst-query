import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Table, Input, Button, Tooltip, Popconfirm } from 'antd';
import { SearchOutlined, SettingOutlined, PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import DateTimeRangePicker from '../components/DateTimeRangePicker';
import './PageStyle.css';

const RolePermission = () => {
  const navigate = useNavigate();
  const [searchFilters, setSearchFilters] = useState({
    roleId: '',
    roleName: '',
    remark: '',
  });
  const [createTimeRange, setCreateTimeRange] = useState({ startDate: null, endDate: null });

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

  // 搜索处理
  const handleSearch = (field, value) => {
    const newFilters = {
      ...searchFilters,
      [field]: value,
    };
    setSearchFilters(newFilters);
    applyFilters(newFilters, createTimeRange);
  };

  // 时间范围变化处理
  const handleTimeRangeChange = (range) => {
    setCreateTimeRange(range);
    applyFilters(searchFilters, range);
  };

  // 应用所有过滤条件
  const applyFilters = (filters, timeRange) => {
    // 检查是否所有搜索条件都为空
    const hasAnyFilter = Object.values(filters).some(filter => filter && filter.trim() !== '') ||
      (timeRange.startDate || timeRange.endDate);
    
    if (!hasAnyFilter) {
      setDataSource(allRoles);
      return;
    }

    // 多字段过滤
    const filtered = allRoles.filter((item) => {
      const matchRoleId = !filters.roleId || 
        item.roleId.toString().toLowerCase().includes(filters.roleId.toLowerCase());
      const matchRoleName = !filters.roleName || 
        item.roleName.toLowerCase().includes(filters.roleName.toLowerCase());
      const matchRemark = !filters.remark || 
        (item.remark && item.remark !== '-' && 
         item.remark.toLowerCase().includes(filters.remark.toLowerCase()));
      
      // 时间范围过滤：将创建时间字符串转换为Date对象进行比较
      let matchCreateTime = true;
      if (timeRange.startDate || timeRange.endDate) {
        try {
          // 解析创建时间字符串，格式：MM/DD/YYYY HH:MM:SS AM/PM
          const parseDateTime = (dateStr) => {
            const parts = dateStr.split(' ');
            const datePart = parts[0];
            const timePart = parts[1];
            const period = parts[2];
            const [month, day, year] = datePart.split('/');
            const [hours, minutes, seconds] = timePart.split(':');
            let hour = parseInt(hours);
            if (period === 'PM' && hour !== 12) hour += 12;
            if (period === 'AM' && hour === 12) hour = 0;
            return new Date(year, parseInt(month) - 1, parseInt(day), hour, parseInt(minutes), parseInt(seconds));
          };
          
          const itemDate = parseDateTime(item.createTime);
          
          if (timeRange.startDate && itemDate < timeRange.startDate) {
            matchCreateTime = false;
          }
          if (timeRange.endDate && itemDate > timeRange.endDate) {
            matchCreateTime = false;
          }
        } catch (e) {
          // 如果解析失败，不匹配
          matchCreateTime = false;
        }
      }

      return matchRoleId && matchRoleName && matchRemark && matchCreateTime;
    });
    setDataSource(filtered);
  };

  // 重置搜索条件
  const handleResetSearch = () => {
    setSearchFilters({
      roleId: '',
      roleName: '',
      remark: '',
    });
    setCreateTimeRange({ startDate: null, endDate: null });
    setDataSource(allRoles);
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
      setDataSource(updated);
      // 重新应用过滤条件
      applyFilters(searchFilters, createTimeRange);
      return updated;
    });
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h2>角色权限</h2>
      </div>
      <div className="page-content" style={{ padding: '24px' }}>
        {/* 搜索栏 */}
        <div style={{ 
          background: '#fafafa',
          padding: '16px',
          borderRadius: '4px',
          marginBottom: '24px',
          border: '1px solid #e8e8e8'
        }}>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(2, 1fr)', 
            gap: '16px',
            marginBottom: '16px'
          }}>
            <div>
              <div style={{ marginBottom: '8px', fontSize: '14px', fontWeight: 500 }}>
                角色ID
              </div>
              <Input
                placeholder="搜索角色ID"
                prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
                value={searchFilters.roleId}
                onChange={(e) => handleSearch('roleId', e.target.value)}
                allowClear
              />
            </div>
            <div>
              <div style={{ marginBottom: '8px', fontSize: '14px', fontWeight: 500 }}>
                角色名
              </div>
              <Input
                placeholder="搜索角色名"
                prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
                value={searchFilters.roleName}
                onChange={(e) => handleSearch('roleName', e.target.value)}
                allowClear
              />
            </div>
            <div>
              <div style={{ marginBottom: '8px', fontSize: '14px', fontWeight: 500 }}>
                创建时间
              </div>
              <DateTimeRangePicker
                value={createTimeRange}
                onChange={handleTimeRangeChange}
                placeholder="选择创建时间范围"
              />
            </div>
            <div>
              <div style={{ marginBottom: '8px', fontSize: '14px', fontWeight: 500 }}>
                备注
              </div>
              <Input
                placeholder="搜索备注"
                prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
                value={searchFilters.remark}
                onChange={(e) => handleSearch('remark', e.target.value)}
                allowClear
              />
            </div>
          </div>
          {/* 操作按钮 */}
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: '16px'
          }}>
            <Button 
              onClick={handleResetSearch}
              style={{ minWidth: '80px' }}
            >
              重置
            </Button>
            <Button 
              type="primary" 
              icon={<PlusOutlined />}
              onClick={handleCreateRole}
            >
              新建角色
            </Button>
          </div>
        </div>

        {/* 角色列表 */}
        <div style={{ marginBottom: '16px', fontSize: '16px', fontWeight: 500 }}>
          角色数：<span style={{ fontWeight: 'bold' }}>{dataSource.length}</span>
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

