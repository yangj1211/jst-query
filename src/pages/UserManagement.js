import { useState, useCallback } from 'react';
import { Table, Input, Button, Modal, message, Select, Tag, DatePicker, Popconfirm } from 'antd';
import { EditOutlined, SyncOutlined, ReloadOutlined, TagOutlined, PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import './PageStyle.css';

const { RangePicker } = DatePicker;

// 模拟用户数据 - 匹配截图中的格式
const generateMockData = () => {
  const roles = [
    { userId: '000002', username: '用户000002', account: '', roles: ['总裁角色'], tags: [{ tagName: '部门', tagValue: '财务部' }], createTime: '2026/2/26 15:21:31' },
    { userId: '000003', username: '用户000003', account: '', roles: ['总裁角色'], tags: [{ tagName: '部门', tagValue: '财务部' }, { tagName: '职级', tagValue: '高级' }], createTime: '2026/2/26 15:21:31' },
    { userId: '000015', username: '用户000015', account: '', roles: ['财务部-BP', '财务部-信息', '财务部-基础'], tags: [{ tagName: '部门', tagValue: '财务部' }], createTime: '2026/2/26 15:21:32' },
    { userId: '000023', username: '用户000023', account: '', roles: ['财务-收入结转流', '财务部-总账', '财务部-基础'], tags: [{ tagName: '部门', tagValue: '财务部' }, { tagName: '职级', tagValue: '中级' }], createTime: '2026/2/26 15:21:32' },
    { userId: '000026', username: '用户000026', account: '', roles: ['总裁角色'], tags: [{ tagName: '部门', tagValue: '财务部' }], createTime: '2026/2/26 15:21:32' },
    { userId: '000037', username: '用户000037', account: '', roles: ['总裁角色'], tags: [{ tagName: '部门', tagValue: '财务部' }, { tagName: '职级', tagValue: '初级' }], createTime: '2026/2/26 15:21:33' },
  ];

  // 生成更多数据到76条
  const extraData = [];
  for (let i = 7; i <= 76; i++) {
    const id = String(i * 3).padStart(6, '0');
    const rolePool = ['总裁角色', '财务部-BP', '财务部-信息', '财务部-基础', '财务-收入结转流', '财务部-总账', '普通角色', '销售角色'];
    const userRoles = [rolePool[i % rolePool.length]];
    const tagPool = [
      [{ tagName: '部门', tagValue: '财务部' }],
      [{ tagName: '部门', tagValue: '销售部' }],
      [{ tagName: '部门', tagValue: '信息技术部' }, { tagName: '职级', tagValue: '高级' }],
      [{ tagName: '部门', tagValue: '人力资源部' }, { tagName: '职级', tagValue: '中级' }],
      [{ tagName: '部门', tagValue: '市场部' }],
    ];
    extraData.push({
      userId: id,
      username: `用户${id}`,
      account: '',
      roles: userRoles,
      tags: tagPool[i % tagPool.length],
      createTime: `2026/2/26 15:21:${30 + (i % 30)}`,
    });
  }

  return [...roles, ...extraData].map((item) => ({ ...item, key: item.userId }));
};

// 角色颜色映射
const getRoleColor = (role) => {
  const colorMap = {
    '总裁角色': '#1890ff',
    '财务部-BP': '#1890ff',
    '财务部-信息': '#1890ff',
    '财务部-基础': '#1890ff',
    '财务-收入结转流': '#1890ff',
    '财务部-总账': '#1890ff',
    '普通角色': '#1890ff',
    '销售角色': '#1890ff',
    '超级管理员': '#1890ff',
  };
  return colorMap[role] || '#1890ff';
};

// 角色选项
const roleFilterOptions = [
  '总裁角色',
  '财务部-BP',
  '财务部-信息',
  '财务部-基础',
  '财务-收入结转流',
  '财务部-总账',
  '普通角色',
  '销售角色',
  '超级管理员',
];

// 可分配角色列表
const roleOptions = [
  '超级管理员',
  '普通角色',
  '财务角色',
  '销售角色',
  '财务总监角色',
  '总裁角色',
  '财务部-BP',
  '财务部-信息',
  '财务部-基础',
  '财务-收入结转流',
  '财务部-总账',
];

const UserManagement = () => {
  const [searchFilters, setSearchFilters] = useState({
    userId: '',
    username: '',
    account: '',
    department: '',
    role: undefined,
    tagName: undefined,
    tagValue: '',
  });
  const [createTimeRange, setCreateTimeRange] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [selectedRoles, setSelectedRoles] = useState([]);
  const [editingUserTags, setEditingUserTags] = useState([]);

  const mockData = generateMockData();
  const [dataSource, setDataSource] = useState(mockData);
  const [allUsers, setAllUsers] = useState(mockData);

  // 批量赋角色相关状态
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [isBatchRoleModalVisible, setIsBatchRoleModalVisible] = useState(false);
  const [batchSelectedRoles, setBatchSelectedRoles] = useState([]);
  // 标签管理相关状态
  const [isTagModalVisible, setIsTagModalVisible] = useState(false);
  const [userTags, setUserTags] = useState([{ key: '1', name: '部门' }, { key: '2', name: '职级' }]);
  const [isAddTagModalVisible, setIsAddTagModalVisible] = useState(false);
  const [newTagName, setNewTagName] = useState('');
  const [editingTagKey, setEditingTagKey] = useState(null);
  const [editingTagName, setEditingTagName] = useState('');

  // 打开编辑弹窗
  const handleEditRoles = (record) => {
    setEditingUser(record);
    setSelectedRoles([...record.roles]);
    setEditingUserTags(record.tags ? record.tags.map(t => ({ ...t })) : []);
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setEditingUser(null);
    setSelectedRoles([]);
    setEditingUserTags([]);
  };


  // 标签编辑操作
  const handleAddUserTag = () => {
    setEditingUserTags([...editingUserTags, { tagName: undefined, tagValue: '' }]);
  };

  const handleRemoveUserTag = (index) => {
    setEditingUserTags(editingUserTags.filter((_, i) => i !== index));
  };

  const handleUpdateUserTag = (index, field, value) => {
    setEditingUserTags(editingUserTags.map((t, i) => i === index ? { ...t, [field]: value } : t));
  };

  // 批量赋角色
  const handleBatchRoleOpen = () => {
    setBatchSelectedRoles([]);
    setIsBatchRoleModalVisible(true);
  };

  const handleBatchRoleSave = () => {
    if (batchSelectedRoles.length === 0) {
      message.warning('请选择至少一个角色');
      return;
    }
    const selectedUserIds = new Set(selectedRowKeys);
    const updatedData = allUsers.map(item => {
      if (!selectedUserIds.has(item.userId)) return item;
      const newRoles = [...new Set([...item.roles, ...batchSelectedRoles])];
      return { ...item, roles: newRoles };
    });
    setAllUsers(updatedData);
    applyFilters(searchFilters, createTimeRange, updatedData);
    message.success(`已为 ${selectedUserIds.size} 个用户追加角色`);
    setIsBatchRoleModalVisible(false);
    setSelectedRowKeys([]);
  };

  const handleSaveRoles = () => {
    if (!editingUser) return;
    const updatedData = allUsers.map(item => {
      if (item.userId === editingUser.userId) {
        return { ...item, roles: [...selectedRoles], tags: [...editingUserTags] };
      }
      return item;
    });
    setAllUsers(updatedData);
    applyFilters(searchFilters, createTimeRange, updatedData);
    message.success('用户信息已更新');
    handleCancel();
  };

  // 应用过滤
  const applyFilters = useCallback((filters, timeRange, data) => {
    const source = data || allUsers;
    const hasAnyFilter = filters.userId || filters.username || filters.account || 
      filters.department || filters.role || filters.tagName || filters.tagValue || timeRange;
    
    if (!hasAnyFilter) {
      setDataSource(source);
      return;
    }

    const filtered = source.filter((item) => {
      const matchUserId = !filters.userId || item.userId.includes(filters.userId);
      const matchUsername = !filters.username || item.username.includes(filters.username);
      const matchAccount = !filters.account || item.account.includes(filters.account);
      const matchDepartment = !filters.department || (item.tags && item.tags.some(t => t.tagName === '部门' && t.tagValue.includes(filters.department)));
      const matchRole = !filters.role || item.roles.includes(filters.role);
      const matchTag = (!filters.tagName && !filters.tagValue) || (item.tags && item.tags.some(t => 
        (!filters.tagName || t.tagName === filters.tagName) && 
        (!filters.tagValue || t.tagValue.includes(filters.tagValue))
      ));

      let matchTime = true;
      if (timeRange && timeRange.length === 2) {
        const itemDate = new Date(item.createTime);
        if (timeRange[0]) matchTime = itemDate >= timeRange[0].toDate();
        if (timeRange[1] && matchTime) matchTime = itemDate <= timeRange[1].toDate();
      }

      return matchUserId && matchUsername && matchAccount && matchDepartment && matchRole && matchTag && matchTime;
    });
    setDataSource(filtered);
  }, [allUsers]);

  const handleSearch = (field, value) => {
    const newFilters = { ...searchFilters, [field]: value };
    setSearchFilters(newFilters);
    applyFilters(newFilters, createTimeRange);
  };

  const handleTimeRangeChange = (dates) => {
    setCreateTimeRange(dates);
    applyFilters(searchFilters, dates);
  };

  const handleResetSearch = () => {
    setSearchFilters({ userId: '', username: '', account: '', department: '', role: undefined, tagName: undefined, tagValue: '' });
    setCreateTimeRange(null);
    setDataSource(allUsers);
  };

  const handleSyncUsers = () => {
    message.loading({ content: '正在同步用户信息...', key: 'sync' });
    setTimeout(() => {
      message.success({ content: '用户信息同步完成', key: 'sync' });
    }, 1500);
  };

  // 标签管理
  const handleAddTag = () => {
    const trimmed = newTagName.trim();
    if (!trimmed) { message.warning('标签名称不能为空'); return; }
    if (userTags.some(t => t.name === trimmed)) { message.warning('标签已存在'); return; }
    setUserTags([...userTags, { key: String(Date.now()), name: trimmed }]);
    setNewTagName('');
    setIsAddTagModalVisible(false);
    message.success('标签创建成功');
  };

  const handleEditTag = () => {
    const trimmed = editingTagName.trim();
    if (!trimmed) { message.warning('标签名称不能为空'); return; }
    if (userTags.some(t => t.name === trimmed && t.key !== editingTagKey)) { message.warning('标签名称已存在'); return; }
    setUserTags(userTags.map(t => t.key === editingTagKey ? { ...t, name: trimmed } : t));
    setEditingTagKey(null);
    setEditingTagName('');
    message.success('标签修改成功');
  };

  const handleDeleteTag = (key) => {
    setUserTags(userTags.filter(t => t.key !== key));
    message.success('标签已删除');
  };

  const tagColumns = [
    { title: '名称', dataIndex: 'name', key: 'name' },
    {
      title: '操作', key: 'action', width: 150,
      render: (_, record) => (
        <span style={{ display: 'flex', gap: '16px' }}>
          <a
            onClick={() => { if (record.name !== '部门') { setEditingTagKey(record.key); setEditingTagName(record.name); } }}
            style={record.name === '部门' ? { color: '#d9d9d9', cursor: 'not-allowed' } : {}}
          >修改</a>
          <Popconfirm
            title="确认删除该标签？"
            onConfirm={() => handleDeleteTag(record.key)}
            okText="删除"
            cancelText="取消"
            disabled={record.name === '部门'}
          >
            <a style={record.name === '部门' ? { color: '#d9d9d9', cursor: 'not-allowed' } : {}}>删除</a>
          </Popconfirm>
        </span>
      ),
    },
  ];

  // 表格列定义
  const columns = [
    { title: '用户 ID', dataIndex: 'userId', key: 'userId', width: 120 },
    { title: '用户名', dataIndex: 'username', key: 'username', width: 150 },
    { title: '账号', dataIndex: 'account', key: 'account', width: 180 },
    {
      title: '部门',
      key: 'department',
      width: 120,
      render: (_, record) => {
        const dept = record.tags && record.tags.find(t => t.tagName === '部门');
        return dept ? dept.tagValue : '-';
      },
    },
    {
      title: '角色',
      dataIndex: 'roles',
      key: 'roles',
      width: 280,
      render: (roles) => (
        <span>
          {roles.map((role) => (
            <Tag key={role} color={getRoleColor(role)} style={{ marginBottom: 4 }}>
              {role}
            </Tag>
          ))}
        </span>
      ),
    },
    {
      title: '标签',
      dataIndex: 'tags',
      key: 'tags',
      width: 240,
      render: (tags) => (
        <span>
          {tags && tags.map((tag, idx) => (
            <Tag key={idx} color="green" style={{ marginBottom: 4 }}>
              {tag.tagName}: {tag.tagValue}
            </Tag>
          ))}
        </span>
      ),
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      key: 'createTime',
      width: 200,
      sorter: (a, b) => new Date(a.createTime) - new Date(b.createTime),
    },
    {
      title: '操作',
      key: 'action',
      width: 80,
      render: (_, record) => (
        <Button
          type="link"
          icon={<EditOutlined />}
          onClick={() => handleEditRoles(record)}
          size="small"
        />
      ),
    },
  ];

  return (
    <div className="page-container">
      <div className="page-header">
        <h2>用户列表</h2>
        <div style={{ display: 'flex', gap: '12px' }}>
          <Button icon={<TagOutlined />} onClick={() => setIsTagModalVisible(true)}>
            用户标签
          </Button>
          <Button type="primary" icon={<SyncOutlined />} onClick={handleSyncUsers}>
            同步用户信息
          </Button>
        </div>
      </div>
      <div className="page-content" style={{ padding: '24px' }}>
        {/* 用户总数 */}
        <div style={{ marginBottom: '16px', fontSize: '14px', color: '#333' }}>
          共 <span style={{ fontWeight: 600 }}>{dataSource.length}</span> 个用户
        </div>

        {/* 搜索栏 - 第一行 */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '12px', flexWrap: 'wrap' }}>
          <Input
            placeholder="用户 ID"
            value={searchFilters.userId}
            onChange={(e) => handleSearch('userId', e.target.value)}
            allowClear
            style={{ width: 160 }}
          />
          <Input
            placeholder="用户名"
            value={searchFilters.username}
            onChange={(e) => handleSearch('username', e.target.value)}
            allowClear
            style={{ width: 160 }}
          />
          <Input
            placeholder="账号"
            value={searchFilters.account}
            onChange={(e) => handleSearch('account', e.target.value)}
            allowClear
            style={{ width: 160 }}
          />
          <Input
            placeholder="部门"
            value={searchFilters.department}
            onChange={(e) => handleSearch('department', e.target.value)}
            allowClear
            style={{ width: 160 }}
          />
          <Select
            placeholder="角色"
            value={searchFilters.role}
            onChange={(value) => handleSearch('role', value)}
            allowClear
            style={{ width: 160 }}
            options={roleFilterOptions.map(r => ({ label: r, value: r }))}
          />
          <Select
            placeholder="标签名"
            value={searchFilters.tagName}
            onChange={(value) => handleSearch('tagName', value)}
            allowClear
            style={{ width: 140 }}
            options={userTags.map(t => ({ label: t.name, value: t.name }))}
          />
          <Input
            placeholder="标签值"
            value={searchFilters.tagValue}
            onChange={(e) => handleSearch('tagValue', e.target.value)}
            allowClear
            style={{ width: 160 }}
          />
        </div>

        {/* 搜索栏 - 第二行 */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', alignItems: 'center' }}>
          <RangePicker
            value={createTimeRange}
            onChange={handleTimeRangeChange}
            placeholder={['创建开始时间', '创建结束时间']}
            showTime
            style={{ width: 360 }}
          />
          <Button icon={<ReloadOutlined />} onClick={handleResetSearch}>
            重置
          </Button>
        </div>

        {/* 用户表格 */}
        <Table
          rowSelection={{
            selectedRowKeys,
            onChange: (keys, selectedRows, info) => {
              if (info.type === 'all') {
                // 判断当前页是否全选
                const currentPageKeys = dataSource.slice(0, 10).map(item => item.key);
                const isSelectAll = currentPageKeys.every(key => keys.includes(key));
                if (isSelectAll) {
                  setSelectedRowKeys(dataSource.map(item => item.key));
                } else {
                  setSelectedRowKeys([]);
                }
              } else {
                setSelectedRowKeys(keys);
              }
            },
            preserveSelectedRowKeys: true,
          }}
          dataSource={dataSource}
          columns={columns}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `共 ${total} 条`,
            showQuickJumper: true,
            pageSizeOptions: ['10', '20', '50', '100'],
          }}
          size="middle"
        />

        {/* 编辑角色弹窗 */}
        <Modal
          title="修改用户信息"
          open={isModalVisible}
          onOk={handleSaveRoles}
          onCancel={handleCancel}
          okText="保存"
          cancelText="取消"
          width={560}
        >
          {editingUser && (
            <div>
              <div style={{ marginBottom: '16px' }}>
                <strong>用户：</strong>{editingUser.username} ({editingUser.userId})
              </div>
              <div style={{ marginTop: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <span style={{ fontWeight: 500, whiteSpace: 'nowrap' }}>角色：</span>
                  <Select
                    mode="multiple"
                    value={selectedRoles}
                    onChange={setSelectedRoles}
                    placeholder="请选择角色"
                    style={{ flex: 1 }}
                    showSearch
                    optionFilterProp="label"
                    options={roleOptions.map(role => ({ label: role, value: role }))}
                  />
                </div>
              </div>

              {/* 标签编辑 */}
              <div style={{ marginTop: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                  <span style={{ fontWeight: 500, whiteSpace: 'nowrap', paddingTop: '8px' }}>标签：</span>
                  <div style={{ flex: 1 }}>
                    {editingUserTags.map((tag, index) => (
                      <div key={index} style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '10px' }}>
                        <Select
                          value={tag.tagName}
                          onChange={(val) => handleUpdateUserTag(index, 'tagName', val)}
                          placeholder="请选择标签"
                          style={{ width: 160 }}
                          options={userTags.map(t => ({ label: t.name, value: t.name }))}
                        />
                        <Input
                          value={tag.tagValue}
                          onChange={(e) => handleUpdateUserTag(index, 'tagValue', e.target.value)}
                          placeholder="请输入标签值"
                          style={{ flex: 1 }}
                        />
                        <Button
                          type="text"
                          danger
                          icon={<DeleteOutlined />}
                          onClick={() => handleRemoveUserTag(index)}
                        />
                      </div>
                    ))}
                    <Button type="link" onClick={handleAddUserTag} style={{ padding: 0 }}>
                      + 添加标签
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </Modal>

        {/* 标签管理弹窗 */}
        <Modal
          title="标签管理"
          open={isTagModalVisible}
          onCancel={() => { setIsTagModalVisible(false); setEditingTagKey(null); }}
          footer={null}
          width={600}
        >
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px' }}>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => { setNewTagName(''); setIsAddTagModalVisible(true); }}>
              创 建
            </Button>
          </div>

          <Table
            dataSource={userTags}
            columns={tagColumns}
            pagination={{ pageSize: 10, showSizeChanger: true, pageSizeOptions: ['10', '20', '50'] }}
            size="middle"
          />
        </Modal>

        {/* 创建标签弹窗 */}
        <Modal
          title="创建标签"
          open={isAddTagModalVisible}
          onOk={handleAddTag}
          onCancel={() => setIsAddTagModalVisible(false)}
          okText="确认"
          cancelText="取消"
          width={400}
        >
          <div style={{ padding: '12px 0', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ whiteSpace: 'nowrap' }}><span style={{ color: '#ff4d4f' }}>*</span> 标签名称：</span>
            <Input
              value={newTagName}
              onChange={(e) => setNewTagName(e.target.value)}
              onPressEnter={handleAddTag}
              placeholder="请输入标签名称"
              autoFocus
            />
          </div>
        </Modal>

        {/* 修改标签弹窗 */}
        <Modal
          title="修改标签"
          open={!!editingTagKey}
          onOk={handleEditTag}
          onCancel={() => { setEditingTagKey(null); setEditingTagName(''); }}
          okText="修 改"
          cancelText="取 消"
          width={400}
        >
          <div style={{ padding: '12px 0', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ whiteSpace: 'nowrap' }}><span style={{ color: '#ff4d4f' }}>*</span> 标签名称：</span>
            <Input
              value={editingTagName}
              onChange={(e) => setEditingTagName(e.target.value)}
              onPressEnter={handleEditTag}
              autoFocus
            />
          </div>
        </Modal>

        {/* 批量赋角色弹窗 */}
        <Modal
          title={null}
          open={isBatchRoleModalVisible}
          onOk={handleBatchRoleSave}
          onCancel={() => setIsBatchRoleModalVisible(false)}
          okText="确认分配"
          cancelText="取消"
          width={480}
          centered
        >
          <div style={{ textAlign: 'center', padding: '16px 0 24px' }}>
            <div style={{ fontSize: '18px', fontWeight: 600, marginBottom: '8px' }}>批量赋角色</div>
            <div style={{ color: '#666' }}>已选择 <span style={{ color: '#1890ff', fontWeight: 600 }}>{selectedRowKeys.length}</span> 个用户</div>
          </div>
          <div>
            <div style={{ marginBottom: '8px', color: '#333' }}>选择要追加的角色：</div>
            <Select
              mode="multiple"
              value={batchSelectedRoles}
              onChange={setBatchSelectedRoles}
              placeholder="点击选择角色"
              style={{ width: '100%' }}
              showSearch
              optionFilterProp="label"
              options={roleOptions.map(role => ({ label: role, value: role }))}
              maxTagCount={3}
              maxTagPlaceholder={(omitted) => `+${omitted.length} 个角色`}
            />
            {batchSelectedRoles.length > 0 && (
              <div style={{ marginTop: '12px', padding: '12px', background: '#f5f5f5', borderRadius: '6px' }}>
                <div style={{ fontSize: '12px', color: '#999', marginBottom: '8px' }}>将追加以下角色：</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {batchSelectedRoles.map(role => (
                    <Tag key={role} color="blue">{role}</Tag>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Modal>

        {/* 底部浮动操作栏 */}
        {selectedRowKeys.length > 0 && (
          <div style={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            background: '#fff',
            boxShadow: '0 -2px 8px rgba(0,0,0,0.1)',
            padding: '12px 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            zIndex: 100,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ color: '#666' }}>已选择</span>
              <span style={{ fontSize: '20px', fontWeight: 600, color: '#1890ff' }}>{selectedRowKeys.length}</span>
              <span style={{ color: '#666' }}>个用户</span>
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <Button onClick={() => setSelectedRowKeys([])}>取消选择</Button>
              <Button type="primary" onClick={handleBatchRoleOpen}>批量赋角色</Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserManagement;
