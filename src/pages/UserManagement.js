import React, { useState } from 'react';
import { Table, Input, Button, Modal, Checkbox, message } from 'antd';
import { SearchOutlined, EditOutlined } from '@ant-design/icons';
import './PageStyle.css';

const UserManagement = () => {
  const [searchText, setSearchText] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [selectedRoles, setSelectedRoles] = useState([]);

  // 模拟用户数据
  const mockData = [
    {
      key: '1',
      userId: '1',
      username: 'admin',
      account: 'admin@company.com',
      department: '信息技术部',
      role: '超级管理员',
      roles: ['超级管理员'],
      defaultRole: '超级管理员',
      createTime: '01/15/2025 9:00:00 AM',
    },
    {
      key: '2',
      userId: '1001',
      username: '张伟',
      account: 'zhangwei@company.com',
      department: '财务部',
      role: '管理员',
      roles: ['管理员'],
      defaultRole: '管理员',
      createTime: '03/20/2025 10:30:15 AM',
    },
    {
      key: '3',
      userId: '1002',
      username: '李娜',
      account: 'lina@company.com',
      department: '人力资源部',
      role: '管理员',
      roles: ['管理员'],
      defaultRole: '管理员',
      createTime: '04/05/2025 2:15:30 PM',
    },
    {
      key: '4',
      userId: '1003',
      username: '王芳',
      account: 'wangfang@company.com',
      department: '销售部',
      role: '管理员',
      roles: ['管理员'],
      defaultRole: '管理员',
      createTime: '05/12/2025 11:20:45 AM',
    },
    {
      key: '5',
      userId: '2001',
      username: '刘强',
      account: 'liuqiang@company.com',
      department: '市场部',
      role: '普通用户',
      roles: ['普通用户'],
      defaultRole: '普通用户',
      createTime: '06/08/2025 3:45:20 PM',
    },
    {
      key: '6',
      userId: '2002',
      username: '陈静',
      account: 'chenjing@company.com',
      department: '财务部',
      role: '普通用户',
      roles: ['普通用户'],
      defaultRole: '普通用户',
      createTime: '07/15/2025 8:30:00 AM',
    },
    {
      key: '7',
      userId: '2003',
      username: '杨明',
      account: 'yangming@company.com',
      department: '信息技术部',
      role: '开发者',
      roles: ['开发者'],
      defaultRole: '开发者',
      createTime: '08/22/2025 1:15:35 PM',
    },
    {
      key: '8',
      userId: '2004',
      username: '赵丽',
      account: 'zhaoli@company.com',
      department: '信息技术部',
      role: '开发者',
      roles: ['开发者'],
      defaultRole: '开发者',
      createTime: '09/10/2025 4:20:10 PM',
    },
    {
      key: '9',
      userId: '2005',
      username: '孙浩',
      account: 'sunhao@company.com',
      department: '采购部',
      role: '普通用户',
      roles: ['普通用户'],
      defaultRole: '普通用户',
      createTime: '09/28/2025 10:05:50 AM',
    },
    {
      key: '10',
      userId: '2006',
      username: '周敏',
      account: 'zhoumin@company.com',
      department: '信息技术部',
      role: '开发者',
      roles: ['开发者'],
      defaultRole: '开发者',
      createTime: '10/15/2025 2:40:25 PM',
    },
    {
      key: '11',
      userId: '2007',
      username: '吴刚',
      account: 'wugang@company.com',
      department: '销售部',
      role: '普通用户',
      roles: ['普通用户'],
      defaultRole: '普通用户',
      createTime: '10/20/2025 9:15:00 AM',
    },
    {
      key: '12',
      userId: '2008',
      username: '郑萍',
      account: 'zhengping@company.com',
      department: '人力资源部',
      role: '普通用户',
      roles: ['普通用户'],
      defaultRole: '普通用户',
      createTime: '10/25/2025 3:50:40 PM',
    },
    {
      key: '13',
      userId: '1004',
      username: '冯涛',
      account: 'fengtao@company.com',
      department: '运营部',
      role: '管理员',
      roles: ['管理员'],
      defaultRole: '管理员',
      createTime: '06/18/2025 11:45:20 AM',
    },
    {
      key: '14',
      userId: '2009',
      username: '黄秀英',
      account: 'huangxiuying@company.com',
      department: '客服部',
      role: '普通用户',
      roles: ['普通用户'],
      defaultRole: '普通用户',
      createTime: '10/28/2025 8:25:15 AM',
    },
    {
      key: '15',
      userId: '2010',
      username: '徐磊',
      account: 'xulei@company.com',
      department: '信息技术部',
      role: '开发者',
      roles: ['开发者'],
      defaultRole: '开发者',
      createTime: '10/30/2025 2:10:30 PM',
    },
    {
      key: '16',
      userId: '2011',
      username: '朱婷',
      account: 'zhuting@company.com',
      department: '市场部',
      role: '普通用户',
      roles: ['普通用户'],
      defaultRole: '普通用户',
      createTime: '11/01/2025 9:35:45 AM',
    },
    {
      key: '17',
      userId: '1005',
      username: '马超',
      account: 'machao@company.com',
      department: '采购部',
      role: '管理员',
      roles: ['管理员'],
      defaultRole: '管理员',
      createTime: '07/22/2025 3:20:00 PM',
    },
    {
      key: '18',
      userId: '2012',
      username: '胡雪',
      account: 'huxue@company.com',
      department: '信息技术部',
      role: '开发者',
      roles: ['开发者'],
      defaultRole: '开发者',
      createTime: '11/01/2025 10:55:20 AM',
    },
    {
      key: '19',
      userId: '2013',
      username: '林峰',
      account: 'linfeng@company.com',
      department: '销售部',
      role: '普通用户',
      roles: ['普通用户'],
      defaultRole: '普通用户',
      createTime: '11/01/2025 1:40:10 PM',
    },
    {
      key: '20',
      userId: '2014',
      username: '郭静',
      account: 'guojing@company.com',
      department: '信息技术部',
      role: '开发者',
      roles: ['开发者'],
      defaultRole: '开发者',
      createTime: '11/01/2025 4:15:35 PM',
    },
    {
      key: '21',
      userId: '2015',
      username: '何军',
      account: 'hejun@company.com',
      department: '运营部',
      role: '普通用户',
      roles: ['普通用户'],
      defaultRole: '普通用户',
      createTime: '11/02/2025 8:50:25 AM',
    },
    {
      key: '22',
      userId: '2016',
      username: '罗红',
      account: 'luohong@company.com',
      department: '信息技术部',
      role: '开发者',
      roles: ['开发者'],
      defaultRole: '开发者',
      createTime: '11/02/2025 9:30:40 AM',
    },
  ];

  const [dataSource, setDataSource] = useState(mockData);
  const [allUsers, setAllUsers] = useState(mockData); // 保存所有用户数据（包括更新后的）

  // 可用角色列表
  const roleOptions = [
    '超级管理员',
    '管理员',
    '开发者',
    '普通用户',
  ];

  // 打开编辑角色弹窗
  const handleEditRoles = (record) => {
    setEditingUser(record);
    setSelectedRoles([...record.roles]);
    setIsModalVisible(true);
  };

  // 关闭弹窗
  const handleCancel = () => {
    setIsModalVisible(false);
    setEditingUser(null);
    setSelectedRoles([]);
  };

  // 处理角色选择变化
  const handleRoleCheckboxChange = (role, checked) => {
    if (checked) {
      // 添加角色
      setSelectedRoles([...selectedRoles, role]);
    } else {
      // 移除角色，但不能移除默认角色
      if (role === editingUser.defaultRole) {
        message.warning('默认角色不能删除');
        return;
      }
      setSelectedRoles(selectedRoles.filter(r => r !== role));
    }
  };

  // 保存角色更改
  const handleSaveRoles = () => {
    if (!editingUser) return;

    // 确保默认角色始终在选中列表中
    if (!selectedRoles.includes(editingUser.defaultRole)) {
      setSelectedRoles([...selectedRoles, editingUser.defaultRole]);
      message.warning('默认角色不能删除，已自动添加');
      return;
    }

    const updatedData = allUsers.map(item => {
      if (item.userId === editingUser.userId) {
        return {
          ...item,
          roles: [...selectedRoles],
          role: selectedRoles.join(', '), // 显示多个角色，用逗号分隔
        };
      }
      return item;
    });

    setAllUsers(updatedData);
    
    // 如果当前有搜索条件，需要重新过滤
    if (searchText) {
      const filtered = updatedData.filter(
        (item) =>
          item.username.toLowerCase().includes(searchText.toLowerCase()) ||
          item.account.toLowerCase().includes(searchText.toLowerCase()) ||
          item.department.toLowerCase().includes(searchText.toLowerCase())
      );
      setDataSource(filtered);
    } else {
      setDataSource(updatedData);
    }

    message.success('用户角色已更新');
    handleCancel();
  };

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
      width: 250,
    },
    {
      title: '部门',
      dataIndex: 'department',
      key: 'department',
      width: 150,
    },
    {
      title: '角色',
      dataIndex: 'role',
      key: 'role',
      width: 180,
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      key: 'createTime',
      width: 220,
      sorter: (a, b) => new Date(a.createTime) - new Date(b.createTime),
    },
    {
      title: '操作',
      key: 'action',
      width: 120,
      render: (_, record) => (
        <Button
          type="link"
          icon={<EditOutlined />}
          onClick={() => handleEditRoles(record)}
          size="small"
        >
          编辑角色
        </Button>
      ),
    },
  ];

  // 搜索处理
  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchText(value);
    
    if (!value) {
      setDataSource(allUsers);
      return;
    }

    const filtered = allUsers.filter(
      (item) =>
        item.username.toLowerCase().includes(value.toLowerCase()) ||
        item.account.toLowerCase().includes(value.toLowerCase()) ||
        item.department.toLowerCase().includes(value.toLowerCase())
    );
    setDataSource(filtered);
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h2>用户信息</h2>
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
              placeholder="搜索用户名/账号/部门"
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

        {/* 编辑角色弹窗 */}
        <Modal
          title="编辑用户角色"
          open={isModalVisible}
          onOk={handleSaveRoles}
          onCancel={handleCancel}
          okText="保存"
          cancelText="取消"
          width={500}
        >
          {editingUser && (
            <div>
              <div style={{ marginBottom: '16px' }}>
                <strong>用户：</strong>{editingUser.username} ({editingUser.account})
              </div>
              <div style={{ marginBottom: '8px' }}>
                <strong>默认角色：</strong>
                <span style={{ 
                  color: '#1890ff', 
                  fontWeight: 500,
                  marginLeft: '8px'
                }}>
                  {editingUser.defaultRole}
                </span>
                <span style={{ 
                  color: '#999', 
                  fontSize: '12px',
                  marginLeft: '8px'
                }}>
                  (不可删除)
                </span>
              </div>
              <div style={{ marginTop: '16px' }}>
                <div style={{ marginBottom: '12px', fontWeight: 500 }}>
                  选择角色：
                </div>
                <div style={{ 
                  border: '1px solid #d9d9d9',
                  borderRadius: '4px',
                  padding: '12px',
                  maxHeight: '200px',
                  overflowY: 'auto'
                }}>
                  {roleOptions.map(role => {
                    const isDefault = role === editingUser.defaultRole;
                    const isChecked = selectedRoles.includes(role);
                    return (
                      <div key={role} style={{ marginBottom: '8px' }}>
                        <Checkbox
                          checked={isChecked}
                          disabled={isDefault}
                          onChange={(e) => handleRoleCheckboxChange(role, e.target.checked)}
                        >
                          <span style={{ 
                            color: isDefault ? '#1890ff' : 'inherit',
                            fontWeight: isDefault ? 500 : 'normal'
                          }}>
                            {role}
                            {isDefault && (
                              <span style={{ 
                                color: '#999', 
                                fontSize: '12px',
                                marginLeft: '8px'
                              }}>
                                (默认)
                              </span>
                            )}
                          </span>
                        </Checkbox>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </div>
  );
};

export default UserManagement;

