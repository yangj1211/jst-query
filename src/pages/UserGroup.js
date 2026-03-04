import React, { useState } from 'react';
import { Button, Form, Input, Modal, Popconfirm, Select, Table, Tag, message } from 'antd';
import dayjs from 'dayjs';
import './PageStyle.css';

const UserGroup = () => {
  const allMembers = [
    '王敏',
    '李强',
    '陈涛',
    '赵静',
    '孙凯',
    '周颖',
    '何磊',
    '郑娜',
    '许晨',
    '吴涛',
    '钱超',
    '冯哲',
    '韩梅',
    '邹宇',
    '薛峰',
    '吕航',
    '邓杰',
    '许晴',
    '曹宇',
    '林雪',
    '姚晨',
    '蒋涵',
  ];
  const memberOptions = allMembers.map((member) => ({ label: member, value: member }));
  const allRoles = [
    '管理员',
    '业务负责人',
    '审核员',
    '数据分析师',
    '只读用户',
    '运维',
  ];
  const roleOptions = allRoles.map((role) => ({ label: role, value: role }));

  const [dataSource, setDataSource] = useState([
    {
      key: 'dept-sales',
      groupName: '销售部用户组',
      remark: '系统默认',
      isSystem: true,
      members: ['王敏', '李强', '陈涛'],
      roles: ['管理员', '业务负责人'],
      createTime: '08/01/2025 10:00:00 AM',
    },
    {
      key: 'dept-marketing',
      groupName: '市场部用户组',
      remark: '系统默认',
      isSystem: true,
      members: ['赵静', '孙凯'],
      roles: ['业务负责人'],
      createTime: '08/01/2025 10:00:00 AM',
    },
    {
      key: 'dept-hr',
      groupName: '人力资源部用户组',
      remark: '系统默认',
      isSystem: true,
      members: ['周颖', '何磊'],
      roles: ['审核员'],
      createTime: '08/01/2025 10:00:00 AM',
    },
    {
      key: 'dept-finance',
      groupName: '财务部用户组',
      remark: '系统默认',
      isSystem: true,
      members: ['郑娜', '许晨'],
      roles: ['审核员'],
      createTime: '08/01/2025 10:00:00 AM',
    },
    {
      key: 'dept-it',
      groupName: 'IT部用户组',
      remark: '系统默认',
      isSystem: true,
      members: ['吴涛', '钱超', '冯哲'],
      roles: ['运维'],
      createTime: '08/01/2025 10:00:00 AM',
    },
    {
      key: 'dept-rd',
      groupName: '研发部用户组',
      remark: '系统默认',
      isSystem: true,
      members: ['韩梅', '邹宇', '薛峰'],
      roles: ['数据分析师'],
      createTime: '08/01/2025 10:00:00 AM',
    },
    {
      key: 'dept-ops',
      groupName: '运维部用户组',
      remark: '系统默认',
      isSystem: true,
      members: ['吕航'],
      roles: ['运维'],
      createTime: '08/01/2025 10:00:00 AM',
    },
    {
      key: 'custom-project-a',
      groupName: '项目A用户组',
      remark: '业务自定义',
      isSystem: false,
      members: ['邓杰', '许晴'],
      roles: ['数据分析师'],
      createTime: '08/05/2025 09:30:00 AM',
    },
    {
      key: 'custom-project-b',
      groupName: '项目B用户组',
      remark: '业务自定义',
      isSystem: false,
      members: ['曹宇', '林雪', '姚晨'],
      roles: ['审核员', '只读用户'],
      createTime: '08/06/2025 02:15:00 PM',
    },
    {
      key: 'custom-temp',
      groupName: '临时协作用户组',
      remark: '业务自定义',
      isSystem: false,
      members: ['蒋涵'],
      roles: ['只读用户'],
      createTime: '08/07/2025 11:00:00 AM',
    },
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState(null);
  const [form] = Form.useForm();

  const columns = [
    {
      title: '用户组名',
      dataIndex: 'groupName',
      key: 'groupName',
      width: 200,
    },
    {
      title: '备注',
      dataIndex: 'remark',
      key: 'remark',
      width: 200,
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      key: 'createTime',
      width: 220,
    },
    {
      title: '角色',
      dataIndex: 'roles',
      key: 'roles',
      width: 220,
      render: (roles = []) => (
        <div>
          {roles.map((role) => (
            <Tag key={role}>{role}</Tag>
          ))}
        </div>
      ),
    },
    {
      title: '操作',
      key: 'actions',
      width: 120,
      render: (_, record) => {
        const isSystem = record.isSystem;
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'nowrap' }}>
            <Button
              type="link"
              disabled={isSystem}
              onClick={() => {
                if (isSystem) return;
                setEditingGroup(record);
                setIsModalOpen(true);
                form.setFieldsValue({
                  groupName: record.groupName,
                  remark: record.remark,
                  members: record.members || [],
                  roles: record.roles || [],
                });
              }}
            >
              编辑
            </Button>
            {isSystem ? (
              <Button type="link" danger disabled>
                删除
              </Button>
            ) : (
              <Popconfirm
                title="确认删除该用户组？"
                okText="删除"
                cancelText="取消"
                onConfirm={() => {
                  setDataSource((prev) => prev.filter((item) => item.key !== record.key));
                  message.success('用户组已删除');
                }}
              >
                <Button type="link" danger>
                  删除
                </Button>
              </Popconfirm>
            )}
          </div>
        );
      },
    },
  ];

  const handleCreateGroup = async () => {
    try {
      const values = await form.validateFields();
      const normalizedMembers = (values.members || [])
        .map((member) => member.trim())
        .filter((member) => member);
      if (normalizedMembers.length === 0) {
        message.error('请至少添加 1 个成员');
        return;
      }

      const normalizedRoles = (values.roles || [])
        .map((role) => role.trim())
        .filter((role) => role);
      if (normalizedRoles.length === 0) {
        message.error('请至少选择 1 个角色');
        return;
      }

      if (editingGroup) {
        setDataSource((prev) => prev.map((item) => (
          item.key === editingGroup.key
            ? {
                ...item,
                groupName: values.groupName.trim(),
                remark: values.remark ? values.remark.trim() : item.remark,
                members: normalizedMembers,
                roles: normalizedRoles,
              }
            : item
        )));
        message.success('用户组已更新');
      } else {
        const now = dayjs().format('MM/DD/YYYY hh:mm:ss A');
        const newGroup = {
          key: `dept-${Date.now()}`,
          groupName: values.groupName.trim(),
          remark: values.remark ? values.remark.trim() : '业务自定义',
          isSystem: false,
          members: normalizedMembers,
          roles: normalizedRoles,
          createTime: now,
        };
        setDataSource((prev) => [newGroup, ...prev]);
        message.success('用户组已创建');
      }

      form.resetFields();
      setIsModalOpen(false);
      setEditingGroup(null);
    } catch (error) {
      // 表单校验失败，不做处理
    }
  };

  return (
    <div className="page-container">
      <div className="page-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h2>用户组</h2>
        <Button
          type="primary"
          onClick={() => {
            setEditingGroup(null);
            setIsModalOpen(true);
            form.resetFields();
          }}
        >
          新建用户组
        </Button>
      </div>
      <div className="page-content" style={{ padding: '24px' }}>
        <Table
          dataSource={dataSource}
          columns={columns}
          pagination={{ pageSize: 10 }}
        />
      </div>

      <Modal
        title={editingGroup ? '编辑用户组' : '新建用户组'}
        open={isModalOpen}
        onOk={handleCreateGroup}
        onCancel={() => {
          form.resetFields();
          setIsModalOpen(false);
          setEditingGroup(null);
        }}
        okText={editingGroup ? '保存' : '创建'}
        cancelText="取消"
      >
        <Form form={form} layout="vertical">
          <Form.Item
            label="用户组名"
            name="groupName"
            rules={[
              { required: true, message: '请输入用户组名' },
              { max: 30, message: '用户组名最多 30 个字符' },
            ]}
          >
            <Input placeholder="例如：销售部用户组" maxLength={30} />
          </Form.Item>
          <Form.Item
            label="成员"
            name="members"
            rules={[{ required: true, message: '请添加成员' }]}
          >
            <Select
              mode="tags"
              placeholder="输入成员姓名后回车"
              tokenSeparators={[',', '，']}
              options={memberOptions}
            />
          </Form.Item>
          <Form.Item
            label="角色"
            name="roles"
            rules={[{ required: true, message: '请选择角色' }]}
          >
            <Select
              mode="multiple"
              placeholder="请选择角色"
              options={roleOptions}
            />
          </Form.Item>
          <Form.Item
            label="备注"
            name="remark"
            rules={[{ max: 50, message: '备注最多 50 个字符' }]}
          >
            <Input placeholder="可选" maxLength={50} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default UserGroup;
