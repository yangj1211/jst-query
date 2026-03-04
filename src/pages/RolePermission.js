import { useState, useCallback, useRef, useEffect } from 'react';
import { Table, Input, Button, Popconfirm, DatePicker, Modal, Radio, Select, Tabs, message } from 'antd';
import { PlusOutlined, ReloadOutlined, SearchOutlined } from '@ant-design/icons';
import CreateRole from './CreateRole';
import DataPermissionConfig from './DataPermissionConfig';
import './PageStyle.css';

const { RangePicker } = DatePicker;

// 模拟角色数据
const mockRoles = [
  { key: '1', roleId: '2', roleName: 'admin', remark: '超级管理员角色', createTime: '2026/2/26 14:54:52' },
  { key: '2', roleId: '10001', roleName: '财务-收入成本页', remark: '初始化角色: 财务-收入成本页', createTime: '2026/2/26 16:18:59' },
  { key: '3', roleId: '10002', roleName: '财务部-BP', remark: '初始化角色: 财务部-BP', createTime: '2026/2/26 16:19:00' },
  { key: '4', roleId: '10003', roleName: '总裁角色', remark: '初始化角色: 总裁角色', createTime: '2026/2/26 16:19:00' },
  { key: '5', roleId: '10004', roleName: '财务部-总账', remark: '初始化角色: 财务部-总账', createTime: '2026/2/26 16:19:00' },
  { key: '6', roleId: '10005', roleName: '人力', remark: '初始化角色: 人力', createTime: '2026/2/26 16:19:01' },
  { key: '7', roleId: '10006', roleName: '销售运维', remark: '初始化角色: 销售运维', createTime: '2026/2/26 16:19:01' },
  { key: '8', roleId: '10007', roleName: '标书组', remark: '初始化角色: 标书组', createTime: '2026/2/26 16:19:01' },
  { key: '9', roleId: '10008', roleName: '业务运维', remark: '初始化角色: 业务运维', createTime: '2026/2/26 16:19:02' },
  { key: '10', roleId: '10009', roleName: '财务部-信息', remark: '初始化角色: 财务部-信息', createTime: '2026/2/26 16:19:02' },
  { key: '11', roleId: '10010', roleName: '财务部-基础', remark: '初始化角色: 财务部-基础', createTime: '2026/2/26 16:19:03' },
  { key: '12', roleId: '10011', roleName: '财务-收入结转流', remark: '初始化角色: 财务-收入结转流', createTime: '2026/2/26 16:19:03' },
  { key: '13', roleId: '10012', roleName: '储能产品部', remark: '初始化角色: 储能产品部', createTime: '2026/2/26 16:19:04' },
  { key: '14', roleId: '10013', roleName: '信息化组', remark: '初始化角色: 信息化组', createTime: '2026/2/26 16:19:04' },
  { key: '15', roleId: '10014', roleName: '国网南网事业部', remark: '初始化角色: 国网南网事业部', createTime: '2026/2/26 16:19:05' },
  { key: '16', roleId: '10015', roleName: '售后服务组', remark: '初始化角色: 售后服务组', createTime: '2026/2/26 16:19:05' },
  { key: '17', roleId: '10016', roleName: '装备事业部', remark: '初始化角色: 装备事业部', createTime: '2026/2/26 16:19:06' },
];

// 构建有向图的邻接表（权限流向：父->子）
// inheritFrom[A] = [B] 表示 A 继承自 B，权限从 B 流向 A，边：B -> A
// grantTo[A] = [C] 表示 A 授权给 C，权限从 A 流向 C，边：A -> C
const buildGraph = (inheritFromMap, grantToMap) => {
  const adj = {};
  const addEdge = (from, to) => {
    if (!adj[from]) adj[from] = [];
    adj[from].push(to);
  };
  // 继承边：B -> A（B 是 A 的父角色）
  for (const [childId, parents] of Object.entries(inheritFromMap)) {
    for (const p of parents) {
      addEdge(p.roleId, childId);
    }
  }
  // 授权边：A -> C
  for (const [fromId, targets] of Object.entries(grantToMap)) {
    for (const t of targets) {
      addEdge(fromId, t.roleId);
    }
  }
  return adj;
};

// 检测添加新边后是否会成环（从 toId 出发能否沿现有边到达 fromId）
const wouldCreateCycle = (adj, fromId, toId) => {
  // 如果添加 fromId -> toId 的边，检查现有图中 toId 能否到达 fromId
  if (fromId === toId) return true;
  const visited = new Set();
  const dfs = (current) => {
    if (current === fromId) return true;
    if (visited.has(current)) return false;
    visited.add(current);
    for (const next of (adj[current] || [])) {
      if (dfs(next)) return true;
    }
    return false;
  };
  return dfs(toId);
};

// 检查添加继承关系是否会成环
// A 继承自 parentIds => 边：每个 parentId -> A
const wouldInheritCauseCycle = (inheritFromMap, grantToMap, childId, parentIds) => {
  const adj = buildGraph(inheritFromMap, grantToMap);
  for (const parentId of parentIds) {
    if (wouldCreateCycle(adj, parentId, childId)) return true;
  }
  return false;
};

// 检查添加授权关系是否会成环
// A 授权给 targetIds => 边：A -> 每个 targetId
const wouldGrantCauseCycle = (inheritFromMap, grantToMap, fromId, targetIds) => {
  const adj = buildGraph(inheritFromMap, grantToMap);
  for (const targetId of targetIds) {
    if (wouldCreateCycle(adj, fromId, targetId)) return true;
  }
  return false;
};

// 绘制继承关系图
const drawInheritGraph = (canvas, currentRole, inheritList, grantList, allRoles) => {
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const dpr = window.devicePixelRatio || 1;
  const w = canvas.parentElement.clientWidth || 560;
  const h = 360;
  canvas.width = w * dpr;
  canvas.height = h * dpr;
  canvas.style.width = w + 'px';
  canvas.style.height = h + 'px';
  ctx.scale(dpr, dpr);
  ctx.clearRect(0, 0, w, h);

  // 收集节点
  const nodes = [];
  const edges = [];
  const nodeMap = {};

  const addNode = (id, name) => {
    if (!nodeMap[id]) {
      nodeMap[id] = { id, name, x: 0, y: 0 };
      nodes.push(nodeMap[id]);
    }
  };

  addNode(currentRole.roleId, currentRole.roleName);

  inheritList.forEach(r => {
    addNode(r.roleId, r.roleName);
    edges.push({ from: r.roleId, to: currentRole.roleId, label: '继承' });
  });

  grantList.forEach(r => {
    addNode(r.roleId, r.roleName);
    edges.push({ from: currentRole.roleId, to: r.roleId, label: '授权' });
  });

  if (nodes.length === 1 && edges.length === 0) {
    ctx.fillStyle = '#999';
    ctx.font = '14px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('暂无继承或授权关系', w / 2, h / 2);
    return;
  }

  // 布局：当前角色居中，继承来源在上方，授权目标在下方
  const centerX = w / 2;
  const centerY = h / 2;
  nodeMap[currentRole.roleId].x = centerX;
  nodeMap[currentRole.roleId].y = centerY;

  const topNodes = inheritList.map(r => nodeMap[r.roleId]).filter(Boolean);
  const bottomNodes = grantList.map(r => nodeMap[r.roleId]).filter(Boolean);

  const layoutRow = (rowNodes, y) => {
    const spacing = Math.min(160, (w - 80) / Math.max(rowNodes.length, 1));
    const startX = centerX - ((rowNodes.length - 1) * spacing) / 2;
    rowNodes.forEach((n, i) => { n.x = startX + i * spacing; n.y = y; });
  };

  if (topNodes.length) layoutRow(topNodes, 60);
  if (bottomNodes.length) layoutRow(bottomNodes, h - 60);

  // 画箭头
  const drawArrow = (fromX, fromY, toX, toY, color, label) => {
    const headLen = 10;
    const dx = toX - fromX;
    const dy = toY - fromY;
    const angle = Math.atan2(dy, dx);
    // 缩短到节点边缘
    const nodeRadius = 30;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const ratio = nodeRadius / dist;
    const ax = fromX + dx * ratio;
    const ay = fromY + dy * ratio;
    const bx = toX - dx * ratio;
    const by = toY - dy * ratio;

    ctx.beginPath();
    ctx.moveTo(ax, ay);
    ctx.lineTo(bx, by);
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // 箭头
    ctx.beginPath();
    ctx.moveTo(bx, by);
    ctx.lineTo(bx - headLen * Math.cos(angle - Math.PI / 6), by - headLen * Math.sin(angle - Math.PI / 6));
    ctx.lineTo(bx - headLen * Math.cos(angle + Math.PI / 6), by - headLen * Math.sin(angle + Math.PI / 6));
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();

    // 标签
    if (label) {
      const mx = (ax + bx) / 2;
      const my = (ay + by) / 2;
      ctx.fillStyle = '#666';
      ctx.font = '11px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(label, mx + 16, my);
    }
  };

  // 画边
  edges.forEach(e => {
    const from = nodeMap[e.from];
    const to = nodeMap[e.to];
    if (from && to) {
      const color = e.label === '继承' ? '#1890ff' : '#52c41a';
      drawArrow(from.x, from.y, to.x, to.y, color, e.label);
    }
  });

  // 画节点
  nodes.forEach(n => {
    const isCurrent = n.id === currentRole.roleId;
    ctx.beginPath();
    ctx.arc(n.x, n.y, 28, 0, Math.PI * 2);
    ctx.fillStyle = isCurrent ? '#1890ff' : '#f0f0f0';
    ctx.fill();
    ctx.strokeStyle = isCurrent ? '#1890ff' : '#d9d9d9';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = isCurrent ? '#fff' : '#333';
    ctx.font = `${isCurrent ? 'bold ' : ''}12px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    // 截断长名称
    const displayName = n.name.length > 6 ? n.name.slice(0, 5) + '…' : n.name;
    ctx.fillText(displayName, n.x, n.y);
  });

  // 图例
  ctx.fillStyle = '#1890ff';
  ctx.fillRect(12, h - 28, 12, 12);
  ctx.fillStyle = '#666';
  ctx.font = '11px sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('继承', 28, h - 17);
  ctx.fillStyle = '#52c41a';
  ctx.fillRect(62, h - 28, 12, 12);
  ctx.fillStyle = '#666';
  ctx.fillText('授权', 78, h - 17);
};

const RolePermission = () => {
  const [searchFilters, setSearchFilters] = useState({ roleId: '', roleName: '', remark: '' });
  const [createTimeRange, setCreateTimeRange] = useState(null);
  const [allRoles, setAllRoles] = useState(mockRoles);
  const [dataSource, setDataSource] = useState(mockRoles);
  const [isCreateRoleVisible, setIsCreateRoleVisible] = useState(false);
  const [isEditRoleVisible, setIsEditRoleVisible] = useState(false);
  const [editingRole, setEditingRole] = useState(null);
  const [isViewRoleVisible, setIsViewRoleVisible] = useState(false);
  const [viewingRole, setViewingRole] = useState(null);

  // 新建角色弹窗相关
  const [isCreateModeVisible, setIsCreateModeVisible] = useState(false);
  const [createMode, setCreateMode] = useState('new'); // 'new' | 'copy'
  const [copyFromRole, setCopyFromRole] = useState(undefined);
  const [copySourceRole, setCopySourceRole] = useState(null); // 复制创建时传给 CreateRole 的源角色

  // 继承管理相关状态
  const [isInheritVisible, setIsInheritVisible] = useState(false);
  const [inheritRole, setInheritRole] = useState(null);
  const [inheritTab, setInheritTab] = useState('inherit');
  // 继承列表：当前角色从哪些角色继承
  const [inheritFrom, setInheritFrom] = useState({});
  // 授权列表：当前角色授权给哪些角色
  const [grantTo, setGrantTo] = useState({});
  const [isAddInheritVisible, setIsAddInheritVisible] = useState(false);
  const [addInheritRoles, setAddInheritRoles] = useState([]);
  const [isAddGrantVisible, setIsAddGrantVisible] = useState(false);
  const [addGrantRoles, setAddGrantRoles] = useState([]);
  const graphCanvasRef = useRef(null);

  // 绘制继承关系图
  useEffect(() => {
    if (inheritTab === 'view' && inheritRole && graphCanvasRef.current) {
      setTimeout(() => {
        drawInheritGraph(
          graphCanvasRef.current,
          inheritRole,
          getInheritList(inheritRole.roleId),
          getGrantList(inheritRole.roleId),
          allRoles
        );
      }, 50);
    }
  });

  const applyFilters = useCallback((filters, timeRange, data) => {
    const source = data || allRoles;
    const hasAnyFilter = filters.roleId || filters.roleName || filters.remark || timeRange;

    if (!hasAnyFilter) {
      setDataSource(source);
      return;
    }

    const filtered = source.filter((item) => {
      const matchId = !filters.roleId || item.roleId.includes(filters.roleId);
      const matchName = !filters.roleName || item.roleName.toLowerCase().includes(filters.roleName.toLowerCase());
      const matchRemark = !filters.remark || (item.remark && item.remark.toLowerCase().includes(filters.remark.toLowerCase()));

      let matchTime = true;
      if (timeRange && timeRange.length === 2) {
        const itemDate = new Date(item.createTime);
        if (timeRange[0]) matchTime = itemDate >= timeRange[0].toDate();
        if (timeRange[1] && matchTime) matchTime = itemDate <= timeRange[1].toDate();
      }

      return matchId && matchName && matchRemark && matchTime;
    });
    setDataSource(filtered);
  }, [allRoles]);

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
    setSearchFilters({ roleId: '', roleName: '', remark: '' });
    setCreateTimeRange(null);
    setDataSource(allRoles);
  };

  const handleDeleteRole = (roleKey) => {
    const updated = allRoles.filter((item) => item.key !== roleKey);
    setAllRoles(updated);
    setDataSource(updated);
    message.success('角色已删除');
  };

  const handleConfigPermission = (record) => {
    setEditingRole(record);
    setIsEditRoleVisible(true);
  };

  // 打开新建角色选择弹窗
  const handleOpenCreateMode = () => {
    setCreateMode('new');
    setCopyFromRole(undefined);
    setIsCreateModeVisible(true);
  };

  // 下一步：根据选择的模式执行
  const handleCreateModeNext = () => {
    if (createMode === 'new') {
      setIsCreateModeVisible(false);
      setCopySourceRole(null);
      setIsCreateRoleVisible(true);
    } else if (createMode === 'copy') {
      if (!copyFromRole) {
        message.warning('请选择要复制的角色');
        return;
      }
      // 解析选中的值，可能带 _copy 后缀
      const actualRoleId = copyFromRole.endsWith('_copy') 
        ? copyFromRole.replace(/_copy$/, '') 
        : copyFromRole;
      const sourceRole = allRoles.find(r => r.roleId === actualRoleId);
      if (!sourceRole) return;
      // 打开 CreateRole 抽屉，传入源角色信息以预填权限
      setCopySourceRole(sourceRole);
      setIsCreateModeVisible(false);
      setIsCreateRoleVisible(true);
    }
  };

  // 继承管理
  const handleOpenInherit = (record) => {
    setInheritRole(record);
    setInheritTab('inherit');
    setIsInheritVisible(true);
  };

  const getInheritList = (roleId) => inheritFrom[roleId] || [];
  const getGrantList = (roleId) => grantTo[roleId] || [];

  const handleAddInherit = () => {
    if (!addInheritRoles.length || !inheritRole) return;
    // 环检测
    if (wouldInheritCauseCycle(inheritFrom, grantTo, inheritRole.roleId, addInheritRoles)) {
      message.error('添加失败：会导致继承关系成环（与现有授权关系冲突）');
      return;
    }
    const current = getInheritList(inheritRole.roleId);
    const newItems = addInheritRoles
      .filter(id => !current.some(r => r.roleId === id))
      .map(id => { const r = allRoles.find(x => x.roleId === id); return r ? { roleId: r.roleId, roleName: r.roleName } : null; })
      .filter(Boolean);
    if (!newItems.length) { message.warning('所选角色已存在继承关系'); setIsAddInheritVisible(false); return; }
    const newInheritFrom = { ...inheritFrom, [inheritRole.roleId]: [...current, ...newItems] };
    // 同步：被继承角色的授权列表自动加上当前角色
    const newGrantTo = { ...grantTo };
    const currentRoleRef = { roleId: inheritRole.roleId, roleName: inheritRole.roleName };
    newItems.forEach(item => {
      const parentGrants = newGrantTo[item.roleId] || [];
      if (!parentGrants.some(r => r.roleId === inheritRole.roleId)) {
        newGrantTo[item.roleId] = [...parentGrants, currentRoleRef];
      }
    });
    setInheritFrom(newInheritFrom);
    setGrantTo(newGrantTo);
    setAddInheritRoles([]);
    setIsAddInheritVisible(false);
    message.success('继承添加成功');
  };

  const handleRemoveInherit = (roleId, targetRoleId) => {
    setInheritFrom({ ...inheritFrom, [roleId]: (inheritFrom[roleId] || []).filter(r => r.roleId !== targetRoleId) });
    // 同步：从被继承角色的授权列表中移除当前角色
    setGrantTo({ ...grantTo, [targetRoleId]: (grantTo[targetRoleId] || []).filter(r => r.roleId !== roleId) });
  };

  const handleAddGrant = () => {
    if (!addGrantRoles.length || !inheritRole) return;
    // 环检测
    if (wouldGrantCauseCycle(inheritFrom, grantTo, inheritRole.roleId, addGrantRoles)) {
      message.error('添加失败：会导致授权关系成环（与现有继承关系冲突）');
      return;
    }
    const current = getGrantList(inheritRole.roleId);
    const newItems = addGrantRoles
      .filter(id => !current.some(r => r.roleId === id))
      .map(id => { const r = allRoles.find(x => x.roleId === id); return r ? { roleId: r.roleId, roleName: r.roleName } : null; })
      .filter(Boolean);
    if (!newItems.length) { message.warning('所选角色已存在授权关系'); setIsAddGrantVisible(false); return; }
    const newGrantTo = { ...grantTo, [inheritRole.roleId]: [...current, ...newItems] };
    // 同步：被授权角色的继承列表自动加上当前角色
    const newInheritFrom = { ...inheritFrom };
    const currentRoleRef = { roleId: inheritRole.roleId, roleName: inheritRole.roleName };
    newItems.forEach(item => {
      const childInherits = newInheritFrom[item.roleId] || [];
      if (!childInherits.some(r => r.roleId === inheritRole.roleId)) {
        newInheritFrom[item.roleId] = [...childInherits, currentRoleRef];
      }
    });
    setGrantTo(newGrantTo);
    setInheritFrom(newInheritFrom);
    setAddGrantRoles([]);
    setIsAddGrantVisible(false);
    message.success('授权添加成功');
  };

  const handleRemoveGrant = (roleId, targetRoleId) => {
    setGrantTo({ ...grantTo, [roleId]: (grantTo[roleId] || []).filter(r => r.roleId !== targetRoleId) });
    // 同步：从被授权角色的继承列表中移除当前角色
    setInheritFrom({ ...inheritFrom, [targetRoleId]: (inheritFrom[targetRoleId] || []).filter(r => r.roleId !== roleId) });
  };

  const inheritTableColumns = [
    { title: '名称', dataIndex: 'roleName', key: 'roleName' },
    {
      title: '操作', key: 'action', width: 80,
      render: (_, record) => (
        <a style={{ color: '#ff4d4f' }} onClick={() => handleRemoveInherit(inheritRole.roleId, record.roleId)}>删除</a>
      ),
    },
  ];

  const grantTableColumns = [
    { title: '名称', dataIndex: 'roleName', key: 'roleName' },
    {
      title: '操作', key: 'action', width: 80,
      render: (_, record) => (
        <a style={{ color: '#ff4d4f' }} onClick={() => handleRemoveGrant(inheritRole.roleId, record.roleId)}>删除</a>
      ),
    },
  ];

  const columns = [
    { title: '角色 ID', dataIndex: 'roleId', key: 'roleId', width: 120 },
    { title: '角色名', dataIndex: 'roleName', key: 'roleName', width: 180 },
    { title: '备注', dataIndex: 'remark', key: 'remark', ellipsis: true },
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
      width: 200,
      render: (_, record) => {
        const isAdmin = record.roleName === 'admin' || record.roleId === '2';
        return (
          <span style={{ display: 'flex', gap: '16px' }}>
            <a onClick={() => { setViewingRole(record); setIsViewRoleVisible(true); }}>查看</a>
            <a
              onClick={() => { if (!isAdmin) handleConfigPermission(record); }}
              style={isAdmin ? { color: '#d9d9d9', cursor: 'not-allowed' } : {}}
            >修改</a>
            <a
              onClick={() => { if (!isAdmin) handleOpenInherit(record); }}
              style={isAdmin ? { color: '#d9d9d9', cursor: 'not-allowed' } : {}}
            >继承</a>
            <Popconfirm
              title="确认删除该角色？"
              okText="删除"
              cancelText="取消"
              onConfirm={() => handleDeleteRole(record.key)}
              disabled={isAdmin}
            >
              <a style={isAdmin ? { color: '#d9d9d9', cursor: 'not-allowed' } : { color: '#ff4d4f' }}>删除</a>
            </Popconfirm>
          </span>
        );
      },
    },
  ];

  return (
    <div className="page-container">
      <div className="page-header">
        <h2>角色权限</h2>
      </div>
      <div className="page-content" style={{ padding: '24px' }}>
        {/* 角色总数 + 创建按钮 */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div style={{ fontSize: '14px', color: '#333' }}>
            共 <span style={{ fontWeight: 600 }}>{dataSource.length}</span> 个角色
          </div>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleOpenCreateMode}>
            创建角色
          </Button>
        </div>

        {/* 搜索栏 */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', flexWrap: 'wrap', alignItems: 'center' }}>
          <Input
            placeholder="角色 ID"
            value={searchFilters.roleId}
            onChange={(e) => handleSearch('roleId', e.target.value)}
            allowClear
            style={{ width: 150 }}
          />
          <Input
            placeholder="角色名"
            value={searchFilters.roleName}
            onChange={(e) => handleSearch('roleName', e.target.value)}
            allowClear
            style={{ width: 180 }}
          />
          <Input
            placeholder="备注"
            value={searchFilters.remark}
            onChange={(e) => handleSearch('remark', e.target.value)}
            allowClear
            style={{ width: 150 }}
          />
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

        {/* 角色表格 */}
        <Table
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

        <CreateRole
          key={copySourceRole ? copySourceRole.roleId : 'new'}
          open={isCreateRoleVisible}
          onClose={() => { setIsCreateRoleVisible(false); setCopySourceRole(null); }}
          onSaved={() => { setIsCreateRoleVisible(false); setCopySourceRole(null); }}
          copyFromRole={copySourceRole}
        />

        {editingRole && (
          <DataPermissionConfig
            open={isEditRoleVisible}
            role={editingRole}
            inheritedRoles={getInheritList(editingRole.roleId)}
            onClose={() => { setIsEditRoleVisible(false); setEditingRole(null); }}
            onSaved={() => { setIsEditRoleVisible(false); setEditingRole(null); }}
          />
        )}

        {viewingRole && (
          <DataPermissionConfig
            open={isViewRoleVisible}
            role={viewingRole}
            inheritedRoles={getInheritList(viewingRole.roleId)}
            readOnly
            onClose={() => { setIsViewRoleVisible(false); setViewingRole(null); }}
            onSaved={() => { setIsViewRoleVisible(false); setViewingRole(null); }}
          />
        )}

        {/* 新建角色 - 选择创建方式弹窗 */}
        <Modal
          title="新建角色"
          open={isCreateModeVisible}
          onCancel={() => setIsCreateModeVisible(false)}
          footer={[
            <Button key="cancel" onClick={() => setIsCreateModeVisible(false)}>取 消</Button>,
            <Button key="next" type="primary" onClick={handleCreateModeNext}>下一步</Button>,
          ]}
          width={520}
        >
          <div style={{ marginBottom: '16px', fontWeight: 600, fontSize: '14px' }}>选择创建方式</div>
          <Radio.Group
            value={createMode}
            onChange={(e) => { setCreateMode(e.target.value); setCopyFromRole(undefined); }}
            style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}
          >
            <Radio value="new">从零开始新建角色</Radio>
            <Radio value="copy">基于已有角色快速创建</Radio>
          </Radio.Group>

          {createMode === 'copy' && (
            <div style={{ marginTop: '20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ whiteSpace: 'nowrap' }}>选择角色</span>
              <Select
                value={copyFromRole}
                onChange={(val) => setCopyFromRole(val)}
                placeholder="请选择要复制的角色"
                style={{ flex: 1 }}
                showSearch
                optionFilterProp="label"
                suffixIcon={<SearchOutlined />}
                options={[
                  ...allRoles.map(role => ({
                    label: `${role.roleName}_copy`,
                    value: `${role.roleId}_copy`,
                  })),
                  ...allRoles.map(role => ({
                    label: role.roleName,
                    value: role.roleId,
                  })),
                ]}
              />
            </div>
          )}
        </Modal>

        {/* 继承管理弹窗 */}
        <Modal
          title={`继承管理 ${inheritRole ? inheritRole.roleName : ''}`}
          open={isInheritVisible}
          onCancel={() => { setIsInheritVisible(false); setInheritRole(null); }}
          okText="确认"
          cancelText="取消"
          onOk={() => { setIsInheritVisible(false); setInheritRole(null); message.success('保存成功'); }}
          width={640}
        >
          <Tabs activeKey={inheritTab} onChange={setInheritTab} items={[
            {
              key: 'inherit',
              label: '继承',
              children: (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px' }}>
                    <Button type="primary" onClick={() => { setAddInheritRoles([]); setIsAddInheritVisible(true); }}>新建继承</Button>
                  </div>
                  <Table
                    dataSource={inheritRole ? getInheritList(inheritRole.roleId) : []}
                    columns={inheritTableColumns}
                    rowKey="roleId"
                    pagination={false}
                    size="middle"
                  />
                </div>
              ),
            },
            {
              key: 'grant',
              label: '授权',
              children: (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px' }}>
                    <Button type="primary" onClick={() => { setAddGrantRoles([]); setIsAddGrantVisible(true); }}>新建授权</Button>
                  </div>
                  <Table
                    dataSource={inheritRole ? getGrantList(inheritRole.roleId) : []}
                    columns={grantTableColumns}
                    rowKey="roleId"
                    pagination={false}
                    size="middle"
                  />
                </div>
              ),
            },
            {
              key: 'view',
              label: '查看',
              children: (
                <div style={{ textAlign: 'center' }}>
                  <canvas
                    ref={graphCanvasRef}
                    style={{ width: '100%', height: '360px', border: '1px solid #f0f0f0', borderRadius: '4px' }}
                  />
                </div>
              ),
            },
          ]} />
        </Modal>

        {/* 新建继承弹窗 */}
        <Modal
          title="新建继承"
          open={isAddInheritVisible}
          onOk={handleAddInherit}
          onCancel={() => setIsAddInheritVisible(false)}
          okText="确认"
          cancelText="取消"
          width={480}
        >
          <div style={{ padding: '12px 0', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ whiteSpace: 'nowrap' }}><span style={{ color: '#ff4d4f' }}>*</span> 继承角色：</span>
            <Select
              mode="multiple"
              value={addInheritRoles}
              onChange={setAddInheritRoles}
              placeholder="请选择要继承的角色"
              style={{ flex: 1 }}
              showSearch
              optionFilterProp="label"
              options={allRoles
                .filter(r => inheritRole && r.roleId !== inheritRole.roleId)
                .map(r => {
                  const conflict = wouldInheritCauseCycle(inheritFrom, grantTo, inheritRole.roleId, [r.roleId]);
                  const already = getInheritList(inheritRole.roleId).some(x => x.roleId === r.roleId);
                  return { label: r.roleName + (conflict ? '（冲突）' : ''), value: r.roleId, disabled: conflict || already };
                })}
            />
          </div>
        </Modal>

        {/* 新建授权弹窗 */}
        <Modal
          title="新建授权"
          open={isAddGrantVisible}
          onOk={handleAddGrant}
          onCancel={() => setIsAddGrantVisible(false)}
          okText="确认"
          cancelText="取消"
          width={480}
        >
          <div style={{ padding: '12px 0', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ whiteSpace: 'nowrap' }}><span style={{ color: '#ff4d4f' }}>*</span> 授权角色：</span>
            <Select
              mode="multiple"
              value={addGrantRoles}
              onChange={setAddGrantRoles}
              placeholder="请选择要授权的角色"
              style={{ flex: 1 }}
              showSearch
              optionFilterProp="label"
              options={allRoles
                .filter(r => inheritRole && r.roleId !== inheritRole.roleId)
                .map(r => {
                  const conflict = wouldGrantCauseCycle(inheritFrom, grantTo, inheritRole.roleId, [r.roleId]);
                  const already = getGrantList(inheritRole.roleId).some(x => x.roleId === r.roleId);
                  return { label: r.roleName + (conflict ? '（冲突）' : ''), value: r.roleId, disabled: conflict || already };
                })}
            />
          </div>
        </Modal>
      </div>
    </div>
  );
};

export default RolePermission;
