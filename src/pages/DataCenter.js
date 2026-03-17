import React, { useState, useEffect, useCallback } from 'react';
import { Table, Input, Select, Button, DatePicker, Tag, Popconfirm, message, Drawer, Checkbox, Modal, Tabs } from 'antd';
import { EditOutlined, DownloadOutlined, DeleteOutlined, EyeOutlined, ReloadOutlined, ArrowLeftOutlined, SafetyCertificateOutlined, PlusOutlined } from '@ant-design/icons';
import './PageStyle.css';
import './DataCenter.css';
import TagManagementModal from '../components/TagManagementModal';
import { useTagContext } from '../contexts/TagContext';

const { RangePicker } = DatePicker;

// 模拟数据
const generateMockData = () => {
  const files = [
    { id: 1, name: 'revenue_cost', objectType: 'table', tags: ['部门'], source: '', description: '收入成本表', fileSize: '182.7MB', createTime: '2035-02-26 15:55:51', updateTime: '2026-02-26 15:55:51', creator: '系统' },
    { id: 2, name: '许继电气_关于减额2026年度日常关联交...', objectType: 'file', tags: ['职级'], source: '许继电气及控股公司', description: 'test-1626', fileSize: '179.28KB', createTime: '2028-02-26 18:26:04', updateTime: '2026-02-28 18:52:40', creator: '张三' },
    { id: 3, name: '金晶科技_2024年半年报告.pdf', objectType: 'file', tags: [], source: '金晶玻璃集体', description: '-', fileSize: '4.86MB', createTime: '2026-02-26 17:14:02', updateTime: '2026-02-28 18:16:15', creator: '张三' },
    { id: 4, name: '许继电气_关于预计2026年度日常关联交...', objectType: 'file', tags: [], source: '许继电气/交流输配电', description: '测试文件名', fileSize: '188.04KB', createTime: '2028-01-26 18:14:56', updateTime: '2026-02-28 18:18:31', creator: '张三' },
    { id: 5, name: '金晶科技_2024年年度报告.pdf', objectType: 'file', tags: [], source: '金晶玻璃集体', description: '金晶公告', fileSize: '6.39MB', createTime: '2029-02-26 19:47:48', updateTime: '2026-02-28 16:37:06', creator: '张三' },
    { id: 6, name: '许继电气_上海上工恒泰事务所关于开展组...', objectType: 'file', tags: [], source: '许继电气/交流输配电', description: '导入测试', fileSize: '394.76KB', createTime: '2026-02-27 14:13:58', updateTime: '2026-02-27 14:38:19', creator: '张三' },
    { id: 7, name: '许继电气_关于董事辞职的公告.pdf', objectType: 'file', tags: [], source: '', description: '-', fileSize: '78.45KB', createTime: '2026-02-27 16:01:55', updateTime: '2026-02-27 16:03:54', creator: '张三' },
    { id: 8, name: '许继电气_2026年第一次临时股东会议决...', objectType: 'file', tags: [], source: '许继电气/交流输配电', description: '-', fileSize: '201.84KB', createTime: '2025-02-27 16:03:08', updateTime: '2026-02-27 16:09:26', creator: '张三' },
    { id: 9, name: '辉煌股份_2024年年度报告.pdf', objectType: 'file', tags: [], source: '', description: '-', fileSize: '2.41MB', createTime: '2028-02-27 14:32:41', updateTime: '2026-02-27 15:27:00', creator: '张二' },
    { id: 10, name: '许继电气_2024年年报报告书.pdf', objectType: 'file', tags: [], source: '', description: '-', fileSize: '4.29MB', createTime: '2028-02-27 16:20:27', updateTime: '2026-02-27 17:41:08', creator: '张三' },
  ];

  // 生成更多文件数据
  const extraFiles = [];
  for (let i = 11; i <= 20; i++) {
    extraFiles.push({
      id: i,
      name: `文件${i}_2024年度报告.pdf`,
      objectType: 'file',
      tags: [],
      source: i % 2 === 0 ? '许继电气及控股公司' : '金晶玻璃集体',
      description: '-',
      fileSize: `${(Math.random() * 5 + 0.5).toFixed(2)}MB`,
      createTime: `2026-02-${String(20 + (i % 8)).padStart(2, '0')} ${String(10 + (i % 12)).padStart(2, '0')}:${String(i * 3 % 60).padStart(2, '0')}:00`,
      updateTime: `2026-02-${String(25 + (i % 4)).padStart(2, '0')} ${String(10 + (i % 12)).padStart(2, '0')}:${String(i * 3 % 60).padStart(2, '0')}:00`,
      creator: i % 3 === 0 ? '张三' : (i % 3 === 1 ? '张二' : '李四'),
    });
  }

  // 表数据
  const tables = [];
  for (let i = 1; i <= 10; i++) {
    tables.push({
      id: 20 + i,
      name: `测试表${i}`,
      objectType: 'table',
      tags: [],
      source: i % 2 === 0 ? '中台' : '本地上传',
      description: `测试数据表${i}`,
      fileSize: `${(Math.random() * 200 + 10).toFixed(2)}MB`,
      createTime: `2025-10-${String(15 + i).padStart(2, '0')} ${String(9 + i).padStart(2, '0')}:30:00`,
      updateTime: `2026-02-${String(20 + (i % 8)).padStart(2, '0')} ${String(9 + i).padStart(2, '0')}:30:00`,
      creator: i % 2 === 0 ? '王五' : '赵六',
      fieldCount: 10,
      rowCount: Math.floor(Math.random() * 10000) + 500,
      fields: [
        { id: 1, name: '字段1', type: 'varchar', length: 50, unique: false, description: '字段描述1' },
        { id: 2, name: '字段2', type: 'int', unique: false, description: '字段描述2' },
        { id: 3, name: '字段3', type: 'decimal', precision: 15, scale: 2, unique: false, description: '字段描述3' },
        { id: 4, name: '字段4', type: 'varchar', length: 100, unique: false, description: '字段描述4' },
        { id: 5, name: '字段5', type: 'datetime', unique: false, description: '字段描述5' },
        { id: 6, name: '字段6', type: 'varchar', length: 50, unique: true, description: '字段描述6' },
        { id: 7, name: '字段7', type: 'int', unique: false, description: '字段描述7' },
        { id: 8, name: '字段8', type: 'decimal', precision: 10, scale: 2, unique: false, description: '字段描述8' },
        { id: 9, name: '字段9', type: 'varchar', length: 200, unique: false, description: '字段描述9' },
        { id: 10, name: '字段10', type: 'varchar', length: 50, unique: false, description: '字段描述10' },
      ],
    });
  }

  return [...files, ...extraFiles, ...tables].map((item, index) => ({ ...item, key: String(index + 1) }));
};

const DataCenter = () => {
  const { updateTags } = useTagContext();
  const [savedTables, setSavedTables] = useState(() => generateMockData());
  const [dataSource, setDataSource] = useState(() => generateMockData());
  const [viewingTableId, setViewingTableId] = useState(null);
  const [detailTab, setDetailTab] = useState('fields');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);

  // 搜索筛选
  const [searchFilters, setSearchFilters] = useState({
    name: '',
    tags: '',
    source: '',
    objectType: undefined,
    creator: '',
  });
  const [createTimeRange, setCreateTimeRange] = useState(null);
  const [updateTimeRange, setUpdateTimeRange] = useState(null);

  // 标签管理
  const [isTagManagementModalVisible, setIsTagManagementModalVisible] = useState(false);
  const [allTags, setAllTags] = useState([]);

  // 表权限配置
  const [isPermDrawerVisible, setIsPermDrawerVisible] = useState(false);
  const [permConfigTable, setPermConfigTable] = useState(null);
  const [permRoleChecked, setPermRoleChecked] = useState({});

  // 模拟角色列表
  const mockRoles = [
    { roleId: '2', roleName: 'admin' },
    { roleId: '10001', roleName: '财务-收入成本页' },
    { roleId: '10002', roleName: '财务部-BP' },
    { roleId: '10003', roleName: '总裁角色' },
    { roleId: '10004', roleName: '财务部-总账' },
    { roleId: '10005', roleName: '人力' },
    { roleId: '10006', roleName: '销售运维' },
    { roleId: '10007', roleName: '标书组' },
    { roleId: '10008', roleName: '业务运维' },
    { roleId: '10009', roleName: '财务部-信息' },
    { roleId: '10010', roleName: '财务部-基础' },
    { roleId: '10011', roleName: '财务-收入结转流' },
  ];

  const handleOpenPermConfig = (record) => {
    setPermConfigTable(record);
    // 模拟：admin 默认有所有表权限，其他角色随机
    const checked = {};
    mockRoles.forEach(r => {
      checked[r.roleId] = r.roleId === '2'; // admin 默认勾选
    });
    setPermRoleChecked(checked);
    setIsPermDrawerVisible(true);
  };

  const handleToggleRolePerm = (roleId) => {
    setPermRoleChecked(prev => ({ ...prev, [roleId]: !prev[roleId] }));
  };

  const handleSelectAllRolePerm = (checked) => {
    const next = {};
    mockRoles.forEach(r => { next[r.roleId] = checked; });
    setPermRoleChecked(next);
  };

  const handleSavePermConfig = () => {
    const grantedRoles = mockRoles.filter(r => permRoleChecked[r.roleId]).map(r => r.roleName);
    console.log(`表 "${permConfigTable?.name}" 权限配置:`, { roles: grantedRoles, roleColumnConfigs: permRoleColumnConfigs });
    message.success(`"${permConfigTable?.name}" 权限配置已保存`);
    setIsPermDrawerVisible(false);
    setPermConfigTable(null);
    setEditingRoleId(null);
  };

  // 行列权限相关状态（per-role）
  const [permRoleColumnConfigs, setPermRoleColumnConfigs] = useState({}); // { [roleId]: columnConfigs[] }
  const [editingRoleId, setEditingRoleId] = useState(null); // 当前编辑行列权限的角色
  const [roleColSearch, setRoleColSearch] = useState('');
  const [roleExpandedCol, setRoleExpandedCol] = useState(null);
  const [isRoleRowPermModalVisible, setIsRoleRowPermModalVisible] = useState(false);
  const [roleColTab, setRoleColTab] = useState('col');

  // 模拟表的列信息
  const getTableColumnsForPerm = (tableName) => {
    const defaultCols = [
      { name: '字段1', type: 'varchar(50)', sampleData: ['示例A', '示例B', '示例C'] },
      { name: '字段2', type: 'int', sampleData: ['100', '200', '300'] },
      { name: '字段3', type: 'decimal(15,2)', sampleData: ['1000.00', '2500.50', '999.99'] },
      { name: '字段4', type: 'varchar(100)', sampleData: ['北京', '上海', '深圳'] },
      { name: '字段5', type: 'datetime', sampleData: ['2025-01-15', '2025-02-20', '2025-03-10'] },
      { name: '字段6', type: 'varchar(50)', sampleData: ['类型A', '类型B', '类型C'] },
      { name: '字段7', type: 'int', sampleData: ['1', '2', '3'] },
      { name: '字段8', type: 'decimal(10,2)', sampleData: ['50.00', '75.50', '100.00'] },
      { name: '字段9', type: 'varchar(200)', sampleData: ['描述信息1', '描述信息2', '描述信息3'] },
      { name: '字段10', type: 'varchar(50)', sampleData: ['状态A', '状态B', '状态C'] },
    ];
    return defaultCols;
  };

  const initPermColumnConfigs = (record) => {
    const cols = getTableColumnsForPerm(record.name);
    return cols.map(col => ({
      ...col,
      selected: true,
      expressions: [],
      relation: '或',
    }));
  };

  // 重写 handleOpenPermConfig 以初始化行列权限
  const origHandleOpenPermConfig = handleOpenPermConfig;
  // (已在上面定义，这里覆盖不了，改用 useEffect 方式)

  // 当 permConfigTable 变化时初始化
  useEffect(() => {
    if (permConfigTable && permConfigTable.objectType === 'table') {
      setPermRoleColumnConfigs({});
      setEditingRoleId(null);
      setRoleColSearch('');
      setRoleExpandedCol(null);
    }
  }, [permConfigTable]);

  // 打开某角色的行列权限配置
  const handleOpenRoleColConfig = (roleId) => {
    if (!permRoleColumnConfigs[roleId]) {
      // 首次打开，初始化该角色的列配置
      setPermRoleColumnConfigs(prev => ({ ...prev, [roleId]: initPermColumnConfigs(permConfigTable) }));
    }
    setEditingRoleId(roleId);
    setRoleColSearch('');
    setRoleExpandedCol(null);
    setRoleColTab('col');
  };

  // 获取当前编辑角色的列配置
  const getCurRoleColConfigs = () => permRoleColumnConfigs[editingRoleId] || [];
  const setCurRoleColConfigs = (updater) => {
    setPermRoleColumnConfigs(prev => {
      const old = prev[editingRoleId] || [];
      const next = typeof updater === 'function' ? updater(old) : updater;
      return { ...prev, [editingRoleId]: next };
    });
  };

  // 列权限操作（per-role）
  const handlePermSelectAllCols = (checked) => {
    setCurRoleColConfigs(prev => prev.map(col => ({ ...col, selected: checked })));
    setRoleExpandedCol(null);
  };

  const handlePermToggleCol = (colName) => {
    setCurRoleColConfigs(prev => prev.map(col =>
      col.name === colName ? { ...col, selected: !col.selected } : col
    ));
    if (roleExpandedCol === colName) setRoleExpandedCol(null);
  };

  const getPermFilteredCols = () => {
    const configs = getCurRoleColConfigs();
    if (!roleColSearch.trim()) return configs;
    return configs.filter(col => col.name.toLowerCase().includes(roleColSearch.toLowerCase()));
  };

  // 行权限表达式操作（per-role）
  const handlePermAddExpression = (colName) => {
    setCurRoleColConfigs(prev => prev.map(col => {
      if (col.name === colName) {
        return { ...col, expressions: [...col.expressions, { id: Date.now(), operator: '=', value: '', values: [] }] };
      }
      return col;
    }));
  };

  const handlePermRemoveExpression = (colName, expId) => {
    setCurRoleColConfigs(prev => prev.map(col => {
      if (col.name === colName) {
        return { ...col, expressions: col.expressions.filter(e => e.id !== expId) };
      }
      return col;
    }));
  };

  const handlePermUpdateExpression = (colName, expId, field, value) => {
    setCurRoleColConfigs(prev => prev.map(col => {
      if (col.name === colName) {
        return {
          ...col,
          expressions: col.expressions.map(exp => {
            if (exp.id === expId) {
              const updated = { ...exp, [field]: value };
              if (field === 'operator' && value === 'in' && !updated.values) {
                updated.values = [''];
                delete updated.value;
              }
              if (field === 'operator' && value !== 'in') {
                delete updated.values;
                if (!updated.value) updated.value = '';
              }
              return updated;
            }
            return exp;
          }),
        };
      }
      return col;
    }));
  };

  const handlePermUpdateColRelation = (colName, relation) => {
    setCurRoleColConfigs(prev => prev.map(col =>
      col.name === colName ? { ...col, relation } : col
    ));
  };

  const handlePermAddInValue = (colName, expId) => {
    setCurRoleColConfigs(prev => prev.map(col => {
      if (col.name === colName) {
        return {
          ...col,
          expressions: col.expressions.map(exp =>
            exp.id === expId ? { ...exp, values: [...(exp.values || []), ''] } : exp
          ),
        };
      }
      return col;
    }));
  };

  const handlePermUpdateInValue = (colName, expId, index, value) => {
    setCurRoleColConfigs(prev => prev.map(col => {
      if (col.name === colName) {
        return {
          ...col,
          expressions: col.expressions.map(exp => {
            if (exp.id === expId) {
              const newValues = [...(exp.values || [])];
              newValues[index] = value;
              return { ...exp, values: newValues };
            }
            return exp;
          }),
        };
      }
      return col;
    }));
  };

  const handlePermRemoveInValue = (colName, expId, index) => {
    setCurRoleColConfigs(prev => prev.map(col => {
      if (col.name === colName) {
        return {
          ...col,
          expressions: col.expressions.map(exp =>
            exp.id === expId ? { ...exp, values: (exp.values || []).filter((_, i) => i !== index) } : exp
          ),
        };
      }
      return col;
    }));
  };

  useEffect(() => {
    const tags = new Set();
    savedTables.forEach(item => {
      if (item.tags && Array.isArray(item.tags)) {
        item.tags.forEach(tag => { if (tag) tags.add(tag); });
      }
    });
    const tagArray = Array.from(tags);
    setAllTags(tagArray);
    updateTags(tagArray);
  }, [savedTables]);

  const checkTagInUse = (tag) => savedTables.some(item => item.tags?.includes(tag));

  const handleTagsChange = (newTags, oldTagName, newTagName) => {
    if (oldTagName && newTagName && oldTagName !== newTagName) {
      setSavedTables(prev => prev.map(item =>
        item.tags?.includes(oldTagName)
          ? { ...item, tags: item.tags.map(t => t === oldTagName ? newTagName : t) }
          : item
      ));
    }
    const oldSet = new Set(allTags);
    const newSet = new Set(newTags);
    const deleted = [];
    oldSet.forEach(t => { if (!newSet.has(t)) deleted.push(t); });
    if (deleted.length) {
      setSavedTables(prev => prev.map(item => {
        if (item.tags?.length) {
          const filtered = item.tags.filter(t => !deleted.includes(t));
          return filtered.length !== item.tags.length ? { ...item, tags: filtered } : item;
        }
        return item;
      }));
    }
    setAllTags(newTags);
    updateTags(newTags);
  };

  // 过滤逻辑
  const applyFilters = useCallback((filters, ctRange, utRange, data) => {
    const source = data || savedTables;
    let filtered = source;

    if (filters.name) {
      filtered = filtered.filter(item => item.name.toLowerCase().includes(filters.name.toLowerCase()));
    }
    if (filters.tags) {
      filtered = filtered.filter(item => item.tags?.some(t => t.includes(filters.tags)));
    }
    if (filters.source) {
      filtered = filtered.filter(item => item.source?.toLowerCase().includes(filters.source.toLowerCase()));
    }
    if (filters.objectType) {
      filtered = filtered.filter(item => item.objectType === filters.objectType);
    }
    if (filters.creator) {
      filtered = filtered.filter(item => item.creator?.toLowerCase().includes(filters.creator.toLowerCase()));
    }
    if (ctRange && ctRange.length === 2) {
      filtered = filtered.filter(item => {
        const d = new Date(item.createTime);
        if (ctRange[0]) { if (d < ctRange[0].toDate()) return false; }
        if (ctRange[1]) { if (d > ctRange[1].toDate()) return false; }
        return true;
      });
    }
    if (utRange && utRange.length === 2) {
      filtered = filtered.filter(item => {
        const d = new Date(item.updateTime);
        if (utRange[0]) { if (d < utRange[0].toDate()) return false; }
        if (utRange[1]) { if (d > utRange[1].toDate()) return false; }
        return true;
      });
    }
    setDataSource(filtered);
  }, [savedTables]);

  const handleSearch = (field, value) => {
    const newFilters = { ...searchFilters, [field]: value };
    setSearchFilters(newFilters);
    applyFilters(newFilters, createTimeRange, updateTimeRange);
  };

  const handleResetSearch = () => {
    setSearchFilters({ name: '', tags: '', source: '', objectType: undefined, creator: '' });
    setCreateTimeRange(null);
    setUpdateTimeRange(null);
    setDataSource(savedTables);
  };

  const handleCreateTimeChange = (dates) => {
    setCreateTimeRange(dates);
    applyFilters(searchFilters, dates, updateTimeRange);
  };

  const handleUpdateTimeChange = (dates) => {
    setUpdateTimeRange(dates);
    applyFilters(searchFilters, createTimeRange, dates);
  };

  // 操作
  const handleDeleteItem = (id) => {
    const updated = savedTables.filter(item => item.id !== id);
    setSavedTables(updated);
    applyFilters(searchFilters, createTimeRange, updateTimeRange, updated);
    message.success('删除成功');
  };

  const handleDownloadItem = (item) => {
    message.info(`正在下载：${item.name}`);
  };

  const handleViewTable = (id) => {
    setViewingTableId(id);
    setDetailTab('fields');
    setCurrentPage(1);
  };

  const handleBackToList = () => {
    setViewingTableId(null);
  };

  const fileCount = savedTables.filter(item => item.objectType === 'file').length;
  const tableCount = savedTables.filter(item => item.objectType === 'table').length;

  // 生成表数据（模拟）
  const generateSampleData = (table, count = 100) => {
    const data = [];
    for (let i = 1; i <= count; i++) {
      const row = { _id: i };
      table.fields?.forEach(field => {
        switch (field.type) {
          case 'int': row[field.name] = Math.floor(Math.random() * 10000); break;
          case 'varchar': case 'text': row[field.name] = `示例数据${i}`; break;
          case 'decimal': row[field.name] = (Math.random() * 10000).toFixed(2); break;
          case 'datetime': { const d = new Date(2025, 0, 1); d.setDate(d.getDate() + i); row[field.name] = d.toISOString().slice(0, 19).replace('T', ' '); break; }
          default: row[field.name] = `数据${i}`;
        }
      });
      data.push(row);
    }
    return data;
  };

  const getFieldTypeDisplay = (field) => {
    switch (field.type) {
      case 'varchar': return '文本';
      case 'int': return '整数';
      case 'text': return '文本';
      case 'decimal': return '小数';
      case 'datetime': return '日期';
      default: return field.type;
    }
  };

  const getCurrentPageData = (table) => {
    const allData = generateSampleData(table, 100);
    const start = (currentPage - 1) * pageSize;
    return allData.slice(start, start + pageSize);
  };

  const getTotalPages = () => Math.ceil(100 / pageSize);

  // 表格列定义
  const columns = [
    {
      title: '文件名/表名',
      dataIndex: 'name',
      key: 'name',
      width: 280,
      ellipsis: true,
      render: (text) => <span style={{ fontWeight: 500 }}>{text}</span>,
    },
    {
      title: '对象类型',
      dataIndex: 'objectType',
      key: 'objectType',
      width: 90,
      render: (type) => (
        <Tag color={type === 'file' ? 'blue' : 'green'}>
          {type === 'file' ? '文件' : '表'}
        </Tag>
      ),
    },
    {
      title: '标签',
      dataIndex: 'tags',
      key: 'tags',
      width: 120,
      render: (tags) => tags?.length > 0
        ? tags.map((t, i) => <Tag key={i}>{t}</Tag>)
        : <span style={{ color: '#999' }}>-</span>,
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
      width: 120,
      ellipsis: true,
      render: (text) => text || '-',
    },
    {
      title: '大小',
      dataIndex: 'fileSize',
      key: 'fileSize',
      width: 100,
      render: (text) => text || '-',
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      key: 'createTime',
      width: 170,
      sorter: (a, b) => new Date(a.createTime) - new Date(b.createTime),
    },
    {
      title: '最近更新时间',
      dataIndex: 'updateTime',
      key: 'updateTime',
      width: 170,
      sorter: (a, b) => new Date(a.updateTime) - new Date(b.updateTime),
    },
    {
      title: '创建人',
      dataIndex: 'creator',
      key: 'creator',
      width: 80,
    },
    {
      title: '操作',
      key: 'action',
      width: 160,
      render: (_, record) => (
        <span style={{ display: 'flex', gap: '8px' }}>
          {record.objectType === 'table' && (
            <>
              <Button type="link" size="small" icon={<EyeOutlined />} onClick={() => handleViewTable(record.id)} title="预览" />
              <Button type="link" size="small" icon={<SafetyCertificateOutlined />} onClick={() => handleOpenPermConfig(record)} title="权限配置" />
            </>
          )}
          <Button type="link" size="small" icon={<EditOutlined />} onClick={() => message.info('编辑功能')} title="编辑" />
          <Button type="link" size="small" icon={<DownloadOutlined />} onClick={() => handleDownloadItem(record)} title="下载" />
          <Popconfirm title="确认删除？" onConfirm={() => handleDeleteItem(record.id)} okText="删除" cancelText="取消">
            <Button type="link" size="small" danger icon={<DeleteOutlined />} title="删除" />
          </Popconfirm>
        </span>
      ),
    },
  ];

  // 表详情视图
  if (viewingTableId) {
    const table = savedTables.find(t => t.id === viewingTableId);
    if (!table) return null;

    return (
      <div className="page-container">
        <div className="page-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Button type="text" icon={<ArrowLeftOutlined />} onClick={handleBackToList} />
            <h2>表详情</h2>
          </div>
        </div>
        <div className="page-content" style={{ padding: '24px' }}>
          <div className="table-detail-section">
            <div className="detail-header">
              <div className="detail-title">
                <h3>{table.name}</h3>
                <p className="detail-description">{table.description || '暂无描述'}</p>
              </div>
            </div>
            <div className="detail-stats">
              <div className="stat-item"><span className="stat-label">表行数：</span><span className="stat-value">{table.rowCount}</span></div>
              <div className="stat-item"><span className="stat-label">表列数：</span><span className="stat-value">{table.fieldCount}</span></div>
              <div className="stat-item"><span className="stat-label">创建时间：</span><span className="stat-value">{table.createTime}</span></div>
              <div className="stat-item"><span className="stat-label">更新时间：</span><span className="stat-value">{table.updateTime}</span></div>
            </div>
            <div className="detail-tabs">
              <button className={`detail-tab-button ${detailTab === 'fields' ? 'active' : ''}`} onClick={() => setDetailTab('fields')}>字段信息</button>
              <button className={`detail-tab-button ${detailTab === 'data' ? 'active' : ''}`} onClick={() => setDetailTab('data')}>表数据</button>
            </div>
            {detailTab === 'fields' && (
              <div className="detail-fields">
                <div className="detail-fields-table">
                  <div className="detail-table-header">
                    <div className="detail-col-name">字段名</div>
                    <div className="detail-col-type">字段类型</div>
                    <div className="detail-col-unique">是否唯一</div>
                    <div className="detail-col-desc">字段描述</div>
                  </div>
                  <div className="detail-table-body">
                    {table.fields?.map((field) => (
                      <div key={field.id} className="detail-table-row">
                        <div className="detail-col-name">{field.name}</div>
                        <div className="detail-col-type">{getFieldTypeDisplay(field)}</div>
                        <div className="detail-col-unique">{field.unique ? '是' : '否'}</div>
                        <div className="detail-col-desc">{field.description || '-'}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
            {detailTab === 'data' && (
              <div className="detail-sample-data">
                <div className="sample-data-table-wrapper">
                  <table className="sample-data-table">
                    <thead><tr><th>序号</th>{table.fields?.map(f => <th key={f.id}>{f.name}</th>)}</tr></thead>
                    <tbody>
                      {getCurrentPageData(table).map(row => (
                        <tr key={row._id}><td>{row._id}</td>{table.fields?.map(f => <td key={f.id}>{row[f.name]}</td>)}</tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="pagination">
                  <button className="page-btn" onClick={() => setCurrentPage(1)} disabled={currentPage === 1}>首页</button>
                  <button className="page-btn" onClick={() => setCurrentPage(currentPage - 1)} disabled={currentPage === 1}>上一页</button>
                  <span className="page-info">第 {currentPage} / {getTotalPages()} 页</span>
                  <button className="page-btn" onClick={() => setCurrentPage(currentPage + 1)} disabled={currentPage === getTotalPages()}>下一页</button>
                  <button className="page-btn" onClick={() => setCurrentPage(getTotalPages())} disabled={currentPage === getTotalPages()}>末页</button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h2>数据总览</h2>
        <Button type="primary" onClick={() => setIsTagManagementModalVisible(true)}>
          标签管理
        </Button>
      </div>
      <div className="page-content" style={{ padding: '24px' }}>
        {/* 统计 */}
        <div style={{ marginBottom: '16px', fontSize: '14px', color: '#333' }}>
          文件数量 <span style={{ fontWeight: 600 }}>{fileCount}</span> 个
          <span style={{ marginLeft: '24px' }}>表数量 <span style={{ fontWeight: 600 }}>{tableCount}</span> 个</span>
        </div>

        {/* 搜索栏 - 第一行 */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '12px', flexWrap: 'wrap' }}>
          <Input
            placeholder="文件名/表名"
            value={searchFilters.name}
            onChange={(e) => handleSearch('name', e.target.value)}
            allowClear
            style={{ width: 180 }}
          />
          <Input
            placeholder="标签"
            value={searchFilters.tags}
            onChange={(e) => handleSearch('tags', e.target.value)}
            allowClear
            style={{ width: 140 }}
          />
          <Input
            placeholder="创建人"
            value={searchFilters.creator}
            onChange={(e) => handleSearch('creator', e.target.value)}
            allowClear
            style={{ width: 140 }}
          />
          <Select
            placeholder="对象类型"
            value={searchFilters.objectType}
            onChange={(value) => handleSearch('objectType', value)}
            allowClear
            style={{ width: 140 }}
            options={[
              { label: '文件', value: 'file' },
              { label: '表', value: 'table' },
            ]}
          />
          <Input
            placeholder="标签"
            value={searchFilters.source}
            onChange={(e) => handleSearch('source', e.target.value)}
            allowClear
            style={{ width: 140 }}
          />
        </div>

        {/* 搜索栏 - 第二行 */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', alignItems: 'center', flexWrap: 'wrap' }}>
          <RangePicker
            value={createTimeRange}
            onChange={handleCreateTimeChange}
            placeholder={['创建开始时间', '创建结束时间']}
            showTime
            style={{ width: 360 }}
          />
          <RangePicker
            value={updateTimeRange}
            onChange={handleUpdateTimeChange}
            placeholder={['更新开始时间', '更新结束时间']}
            showTime
            style={{ width: 360 }}
          />
          <Button icon={<ReloadOutlined />} onClick={handleResetSearch}>
            重置
          </Button>
        </div>

        {/* 数据表格 */}
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
      </div>

      <TagManagementModal
        visible={isTagManagementModalVisible}
        onClose={() => setIsTagManagementModalVisible(false)}
        allTags={allTags}
        onTagsChange={handleTagsChange}
        checkTagInUse={checkTagInUse}
      />

      {/* 表权限配置抽屉 */}
      <Drawer
        title={`权限配置 - ${permConfigTable?.name || ''}`}
        placement="right"
        open={isPermDrawerVisible}
        onClose={() => { setIsPermDrawerVisible(false); setPermConfigTable(null); setEditingRoleId(null); }}
        width={520}
        footer={
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
            <Button onClick={() => { setIsPermDrawerVisible(false); setPermConfigTable(null); setEditingRoleId(null); }}>取消</Button>
            <Button type="primary" onClick={handleSavePermConfig}>保存</Button>
          </div>
        }
      >
        {permConfigTable && (
          <div>
            <div style={{ marginBottom: '16px' }}>
              <Checkbox
                checked={mockRoles.every(r => permRoleChecked[r.roleId])}
                indeterminate={mockRoles.some(r => permRoleChecked[r.roleId]) && !mockRoles.every(r => permRoleChecked[r.roleId])}
                onChange={(e) => handleSelectAllRolePerm(e.target.checked)}
              >
                全选
              </Checkbox>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', paddingLeft: '4px' }}>
              {mockRoles.map(role => (
                <div key={role.roleId} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Checkbox checked={!!permRoleChecked[role.roleId]} onChange={() => handleToggleRolePerm(role.roleId)}>
                    {role.roleName}
                  </Checkbox>
                  {permRoleChecked[role.roleId] && (
                    <Button
                      size="small"
                      type={permRoleColumnConfigs[role.roleId] ? 'primary' : 'default'}
                      onClick={() => handleOpenRoleColConfig(role.roleId)}
                    >
                      {permRoleColumnConfigs[role.roleId] ? '已配置行列权限' : '配置行列权限'}
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </Drawer>

      {/* 角色行列权限配置抽屉 */}
      <Drawer
        title={`${permConfigTable?.name || ''} - ${mockRoles.find(r => r.roleId === editingRoleId)?.roleName || ''}`}
        placement="right"
        open={!!editingRoleId}
        onClose={() => { setEditingRoleId(null); setRoleColSearch(''); setRoleExpandedCol(null); }}
        width={640}
        footer={
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
            <Button onClick={() => { setEditingRoleId(null); setRoleColSearch(''); setRoleExpandedCol(null); }}>取消</Button>
            <Button type="primary" onClick={() => { setEditingRoleId(null); setRoleColSearch(''); setRoleExpandedCol(null); }}>确认</Button>
          </div>
        }
      >
        <Tabs activeKey={roleColTab} onChange={setRoleColTab} items={[
          {
            key: 'col',
            label: '列权限',
            children: (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                  <Input allowClear placeholder="搜索列名" value={roleColSearch} onChange={(e) => setRoleColSearch(e.target.value)} style={{ width: 220 }} />
                </div>
                <div style={{ border: '1px solid #e8e8e8', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '44px 1.5fr 2fr 50px', backgroundColor: '#fafafa', borderBottom: '1px solid #e8e8e8', fontWeight: 600, padding: '10px 12px', fontSize: '13px' }}>
                    <div><Checkbox checked={getCurRoleColConfigs().length > 0 && getCurRoleColConfigs().every(c => c.selected)} indeterminate={getCurRoleColConfigs().some(c => c.selected) && !getCurRoleColConfigs().every(c => c.selected)} onChange={(e) => handlePermSelectAllCols(e.target.checked)} /></div>
                    <div>列名</div>
                    <div>样例数据</div>
                    <div style={{ textAlign: 'center' }}>设置行权限</div>
                  </div>
                  {getPermFilteredCols().map((col, idx) => {
                    const hasExp = col.expressions?.length > 0;
                    const sampleText = Array.isArray(col.sampleData) ? col.sampleData.join('    ') : '-';
                    return (
                      <div key={col.name} style={{ display: 'grid', gridTemplateColumns: '44px 1.5fr 2fr 50px', padding: '12px', alignItems: 'center', borderBottom: idx < getPermFilteredCols().length - 1 ? '1px solid #e8e8e8' : 'none', backgroundColor: col.selected ? '#f0f7ff' : '#fff' }}>
                        <div><Checkbox checked={col.selected} onChange={() => handlePermToggleCol(col.name)} /></div>
                        <div>
                          <span style={{ fontWeight: 500, marginRight: '8px' }}>{col.name}</span>
                          <span style={{ fontSize: '11px', color: '#1677ff', background: '#e6f4ff', borderRadius: '3px', padding: '1px 6px' }}>{col.type ? col.type.toUpperCase() : 'TEXT'}</span>
                        </div>
                        <div style={{ fontSize: '12px', color: '#666', lineHeight: '20px', whiteSpace: 'pre-wrap' }}>{sampleText}</div>
                        <div style={{ textAlign: 'center' }}>
                          <Button type="text" size="small" disabled={!col.selected} style={{ color: col.selected ? (hasExp ? '#1677ff' : '#333') : '#ccc', fontWeight: 600, fontSize: '16px' }} onClick={() => { setRoleExpandedCol(col); setIsRoleRowPermModalVisible(true); }}>+</Button>
                        </div>
                      </div>
                    );
                  })}
                  {getPermFilteredCols().length === 0 && (
                    <div style={{ padding: '20px', textAlign: 'center', color: '#999' }}>未找到匹配的列</div>
                  )}
                </div>
              </div>
            ),
          },
          {
            key: 'row',
            label: '行权限',
            children: (
              <div>
                <Button type="primary" icon={<PlusOutlined />} block style={{ marginBottom: '16px' }} onClick={() => { setRoleExpandedCol(null); setIsRoleRowPermModalVisible(true); }}>添加行权限</Button>
                <div style={{ border: '1px solid #e8e8e8', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr auto', padding: '10px 16px', backgroundColor: '#fafafa', borderBottom: '1px solid #e8e8e8', fontWeight: 600, fontSize: '13px' }}>
                    <div>列</div>
                    <div>行权限表达式</div>
                    <div>操作</div>
                  </div>
                  {(() => {
                    const configs = getCurRoleColConfigs();
                    const rowPerms = configs.filter(c => c.expressions?.length > 0);
                    if (!rowPerms.length) return (
                      <div style={{ padding: '40px', textAlign: 'center', color: '#999' }}>
                        <div style={{ fontSize: '40px', marginBottom: '8px' }}>📭</div>
                        暂无数据
                      </div>
                    );
                    return rowPerms.map((col, idx) => (
                      <div key={col.name} style={{ display: 'grid', gridTemplateColumns: '1fr 2fr auto', padding: '12px 16px', alignItems: 'center', borderBottom: idx < rowPerms.length - 1 ? '1px solid #e8e8e8' : 'none' }}>
                        <div>
                          <span style={{ fontWeight: 500, marginRight: '6px' }}>{col.name}</span>
                          <span style={{ fontSize: '11px', color: '#1677ff', background: '#e6f4ff', borderRadius: '3px', padding: '1px 6px' }}>{col.type ? col.type.toUpperCase() : 'TEXT'}</span>
                        </div>
                        <div style={{ fontSize: '13px', color: '#333' }}>
                          {col.expressions.map((exp, ei) => (
                            <span key={exp.id}>
                              {ei > 0 && <span style={{ color: '#999', margin: '0 4px' }}>{col.relation === '且' ? 'AND' : 'OR'}</span>}
                              {exp.operator} {exp.operator === 'in' ? `(${(exp.values || []).join(', ')})` : (exp.value || '')}
                            </span>
                          ))}
                        </div>
                        <div style={{ display: 'flex', gap: '4px' }}>
                          <Button type="link" size="small" onClick={() => { setRoleExpandedCol(col); setIsRoleRowPermModalVisible(true); }}>编辑</Button>
                          <Button type="link" size="small" danger onClick={() => {
                            setCurRoleColConfigs(prev => prev.map(c => c.name === col.name ? { ...c, expressions: [] } : c));
                          }}>删除</Button>
                        </div>
                      </div>
                    ));
                  })()}
                </div>
              </div>
            ),
          },
        ]} />
      </Drawer>

      {/* 添加行权限弹窗 */}
      <Modal
        title="添加行权限"
        open={isRoleRowPermModalVisible}
        onCancel={() => { setIsRoleRowPermModalVisible(false); setRoleExpandedCol(null); }}
        onOk={() => { setIsRoleRowPermModalVisible(false); setRoleExpandedCol(null); }}
        okText="确 认"
        cancelText="取 消"
        width={520}
        zIndex={2100}
      >
        {(() => {
          const col = roleExpandedCol ? getCurRoleColConfigs().find(c => c.name === roleExpandedCol.name) : null;
          const configs = getCurRoleColConfigs();
          return (
            <div>
              <div style={{ marginBottom: '20px' }}>
                <div style={{ marginBottom: '6px' }}><span style={{ color: '#ff4d4f' }}>*</span> 列</div>
                <Select
                  value={col?.name || undefined}
                  disabled={!!roleExpandedCol}
                  style={{ width: '100%' }}
                  placeholder="请选择列"
                  onChange={(v) => {
                    const found = configs.find(c => c.name === v);
                    if (found) setRoleExpandedCol(found);
                  }}
                >
                  {configs.filter(c => c.selected).map(c => (
                    <Select.Option key={c.name} value={c.name}>
                      {c.name} <span style={{ fontSize: '11px', color: '#1677ff', background: '#e6f4ff', borderRadius: '3px', padding: '1px 6px', marginLeft: '8px' }}>{c.type ? c.type.toUpperCase() : 'TEXT'}</span>
                    </Select.Option>
                  ))}
                </Select>
              </div>
              {col && (
                <>
                  <div style={{ borderLeft: '2px solid #d9d9d9', paddingLeft: '16px', marginLeft: '4px' }}>
                    {col.expressions && col.expressions.map(exp => (
                      <div key={exp.id} style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '12px' }}>
                        <Select value={exp.operator} onChange={(v) => handlePermUpdateExpression(col.name, exp.id, 'operator', v)} style={{ width: 110 }}>
                          {['=', '!=', '>', '>=', '<', '<=', 'in', 'like', '正则'].map(op => (
                            <Select.Option key={op} value={op}>{op}</Select.Option>
                          ))}
                        </Select>
                        {exp.operator !== 'in' ? (
                          <Input value={exp.value || ''} onChange={(e) => handlePermUpdateExpression(col.name, exp.id, 'value', e.target.value)} placeholder="输入值..." style={{ flex: 1 }} />
                        ) : (
                          <div style={{ flex: 1 }}>
                            {(exp.values || []).map((val, vi) => (
                              <div key={vi} style={{ display: 'flex', gap: '8px', marginBottom: '6px' }}>
                                <Input value={val} onChange={(e) => handlePermUpdateInValue(col.name, exp.id, vi, e.target.value)} placeholder="输入值..." style={{ flex: 1 }} />
                                <Button type="text" danger icon={<DeleteOutlined />} onClick={() => handlePermRemoveInValue(col.name, exp.id, vi)} />
                              </div>
                            ))}
                            <Button type="dashed" size="small" onClick={() => handlePermAddInValue(col.name, exp.id)}>+ 添加值</Button>
                          </div>
                        )}
                        <Button type="text" danger icon={<DeleteOutlined />} onClick={() => handlePermRemoveExpression(col.name, exp.id)} />
                      </div>
                    ))}
                  </div>
                  <Button type="dashed" onClick={() => handlePermAddExpression(col.name)} icon={<PlusOutlined />} style={{ marginTop: '4px' }}>添加表达式</Button>
                </>
              )}
            </div>
          );
        })()}
      </Modal>
    </div>
  );
};

export default DataCenter;
