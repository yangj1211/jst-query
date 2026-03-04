import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Input, Select, Checkbox, message, Tabs, Drawer, Modal } from 'antd';
import { PlusOutlined, SettingOutlined, DeleteOutlined } from '@ant-design/icons';
import './PageStyle.css';

const { Option } = Select;
const { TextArea } = Input;

// 模拟从数据管理获取对象列表
const dataCenterObjects = [
  { id: 3, name: '测试表1', objectType: 'table' },
  { id: 4, name: '测试表2', objectType: 'table' },
  { id: 5, name: '测试表3', objectType: 'table' },
  { id: 6, name: '测试表4', objectType: 'table' },
  { id: 7, name: '测试表5', objectType: 'table' },
  { id: 8, name: '测试表6', objectType: 'table' },
  { id: 9, name: '测试表7', objectType: 'table' },
  { id: 10, name: '测试表8', objectType: 'table' },
  { id: 11, name: '测试表9', objectType: 'table' },
  { id: 12, name: '测试表10', objectType: 'table' },
];

const documentTypes = [
  '运行证明', '销售发票', '中标通知书', '报价单', '合同',
  '通电验收单', '竣工验收单', '应收账款催收各类单据',
  '代付协议', '拣配单', '产品退货单', '装箱清单',
];

const menuPermissions = [
  { key: 'question', label: '智能问数' },
  { key: 'document', label: '单据检索' },
  {
    key: 'data',
    label: '数据管理',
    children: [
      { key: 'data-view', label: '数据总览' },
      { key: 'data-import', label: '数据导入' },
      { key: 'data-backup', label: '备份文件' },
    ],
  },
  {
    key: 'work-order',
    label: '工单管理',
    children: [
      { key: 'work-order-submitted', label: '我提交的' },
      { key: 'work-order-handled', label: '我处理的' },
      { key: 'work-order-config', label: '工单配置' },
    ],
  },
  {
    key: 'permission',
    label: '权限配置',
    children: [
      { key: 'user-management', label: '用户列表' },
      { key: 'role-permission', label: '角色权限' },
    ],
  },
];

// 根据角色获取默认对象权限（模拟数据，与 DataPermissionConfig 保持一致）
const getDefaultObjectPermissions = (role) => {
  const buildTablePermissions = (tableNames) => dataCenterObjects
    .filter(item => tableNames.includes(item.name))
    .map(item => ({
      id: Date.now() + Math.random(),
      objectType: '表',
      objectName: item.name,
      permissions: ['DT8'],
      columnConfigs: [],
    }));

  const buildDocumentPermissions = (docNames) => documentTypes
    .filter(name => docNames.includes(name))
    .map(type => ({
      id: Date.now() + Math.random(),
      objectType: '单据',
      objectName: type,
      permissions: ['DT8'],
      columnConfigs: [],
    }));

  const roleName = role?.roleName || '';
  const roleId = role?.roleId || '';

  if (roleName === '超级管理员' || roleName === 'admin' || roleId === '1' || roleId === '2') {
    return [
      ...buildTablePermissions(dataCenterObjects.map(item => item.name)),
      ...buildDocumentPermissions(documentTypes),
    ];
  }
  if (roleName === '财务角色') {
    return [
      ...buildTablePermissions(['测试表1', '测试表5', '测试表10']),
      ...buildDocumentPermissions(['销售发票', '合同', '报价单']),
    ];
  }
  if (roleName === '销售角色') {
    return [
      ...buildTablePermissions(['测试表2', '测试表5', '测试表7']),
      ...buildDocumentPermissions(['报价单', '合同', '销售发票']),
    ];
  }
  if (roleName === '财务总监角色') {
    return [
      ...buildTablePermissions(['测试表1', '测试表10']),
      ...buildDocumentPermissions(['合同', '竣工验收单', '通电验收单']),
    ];
  }
  return [
    ...buildTablePermissions(['测试表1', '测试表2']),
    ...buildDocumentPermissions(['运行证明', '销售发票']),
  ];
};

// 根据角色获取默认菜单权限
const allMenuKeys = menuPermissions.flatMap(p => p.children ? p.children.map(c => c.key) : [p.key]);

const getDefaultMenuPermissions = (role) => {
  const roleName = role?.roleName || '';
  const roleId = role?.roleId || '';
  if (roleName === '超级管理员' || roleName === 'admin' || roleId === '1' || roleId === '2') {
    return new Set(allMenuKeys);
  }
  // 默认：给基础菜单权限
  return new Set(['question', 'document', 'data-view']);
};

const CreateRole = ({ open = true, onClose, onSaved, copyFromRole }) => {
  const navigate = useNavigate();
  const [roleName, setRoleName] = useState(copyFromRole ? `${copyFromRole.roleName}_copy` : '');
  const [roleRemark, setRoleRemark] = useState('');
  const [mainTab, setMainTab] = useState('menu');
  const [activeTab, setActiveTab] = useState('table');
  const [objectName, setObjectName] = useState([]);
  const [selectedDocumentTypes, setSelectedDocumentTypes] = useState([]);
  const [objectPermissions, setObjectPermissions] = useState(() =>
    copyFromRole ? getDefaultObjectPermissions(copyFromRole) : []
  );
  const [selectedMenuPermissions, setSelectedMenuPermissions] = useState(() =>
    copyFromRole ? getDefaultMenuPermissions(copyFromRole) : new Set()
  );

  const handleBack = () => {
    if (onClose) { onClose(); return; }
    navigate('/permission/role-permission');
  };

  const handleSave = () => {
    if (!roleName.trim()) { message.warning('请输入角色名'); return; }
    console.log('创建角色:', { roleName, roleRemark, objectPermissions, menuPermissions: Array.from(selectedMenuPermissions) });
    message.success(`角色 "${roleName}" 创建成功`);
    if (onSaved) onSaved();
    else navigate('/permission/role-permission');
  };

  // 获取所有叶子节点 key（用于全选/反选）— 使用模块级 allMenuKeys

  const handleToggleMenuPermission = (key) => {
    setSelectedMenuPermissions(prev => {
      const next = new Set(prev);
      // 查找是否是父级菜单
      const parent = menuPermissions.find(p => p.key === key);
      if (parent && parent.children) {
        const childKeys = parent.children.map(c => c.key);
        const allChecked = childKeys.every(k => next.has(k));
        if (allChecked) {
          childKeys.forEach(k => next.delete(k));
        } else {
          childKeys.forEach(k => next.add(k));
        }
      } else {
        if (next.has(key)) next.delete(key); else next.add(key);
      }
      return next;
    });
  };

  const handleSelectAllMenu = (checked) => {
    setSelectedMenuPermissions(checked ? new Set(allMenuKeys) : new Set());
  };

  // 获取可选表对象（过滤已添加）
  const getObjectNameOptions = () => {
    const added = new Set(objectPermissions.map(o => o.objectName));
    return dataCenterObjects.filter(o => o.objectType === 'table' && !added.has(o.name)).map(o => o.name);
  };

  // 获取可选单据（过滤已添加）
  const getDocumentTypeOptions = () => {
    const added = new Set(objectPermissions.map(o => o.objectName));
    return documentTypes.filter(t => !added.has(t));
  };

  const handleAddObject = () => {
    const added = new Set(objectPermissions.map(o => o.objectName));
    let newItems = [];
    if (activeTab === 'table') {
      if (!objectName.length) { message.warning('请选择表对象'); return; }
      newItems = objectName.filter(n => !added.has(n)).map(n => ({
        id: Date.now() + Math.random(), objectType: '表', objectName: n, permissions: ['DT8'], columnConfigs: [],
      }));
    } else {
      if (!selectedDocumentTypes.length) { message.warning('请选择单据类型'); return; }
      newItems = selectedDocumentTypes.filter(t => !added.has(t)).map(t => ({
        id: Date.now() + Math.random(), objectType: '单据', objectName: t, permissions: ['DT8'], columnConfigs: [],
      }));
    }
    if (!newItems.length) { message.warning('所选对象已全部添加'); return; }
    setObjectPermissions([...objectPermissions, ...newItems]);
    setObjectName([]);
    setSelectedDocumentTypes([]);
  };

  const handleRemoveObject = (id) => {
    setObjectPermissions(objectPermissions.filter(o => o.id !== id));
  };

  // 行列权限相关状态
  const [isRowColModalVisible, setIsRowColModalVisible] = useState(false);
  const [editingObjId, setEditingObjId] = useState(null);
  const [columnConfigs, setColumnConfigs] = useState([]);
  const [colSearch, setColSearch] = useState('');
  const [rowColTab, setRowColTab] = useState('col');
  const [isRowPermModalVisible, setIsRowPermModalVisible] = useState(false);
  const [rowPermCol, setRowPermCol] = useState(null); // column being edited for row permission

  // 获取表的列信息（通用模拟）
  const getTableColumns = (tableName) => {
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

  const handleOpenRowColConfig = (obj) => {
    setEditingObjId(obj.id);
    const cols = getTableColumns(obj.objectName);
    if (obj.columnConfigs && obj.columnConfigs.length > 0) {
      setColumnConfigs(obj.columnConfigs.map(c => ({ ...c, relation: c.relation || '或' })));
    } else {
      setColumnConfigs(cols.map(col => ({ ...col, selected: true, expressions: [], relation: '或' })));
    }
    setColSearch('');
    setExpandedCol(null);
    setIsRowColModalVisible(true);
  };

  const handleSaveRowColConfig = () => {
    setObjectPermissions(prev => prev.map(obj =>
      obj.id === editingObjId ? { ...obj, columnConfigs } : obj
    ));
    setIsRowColModalVisible(false);
    setEditingObjId(null);
  };

  const handleRowColModalClose = () => {
    setIsRowColModalVisible(false);
    setEditingObjId(null);
  };

  const getFilteredCols = () => {
    if (!colSearch.trim()) return columnConfigs;
    return columnConfigs.filter(c => c.name.toLowerCase().includes(colSearch.toLowerCase()));
  };

  const handleSelectAllCols = (e) => {
    setColumnConfigs(prev => prev.map(c => ({ ...c, selected: e.target.checked })));
    setExpandedCol(null);
  };

  const handleToggleCol = (colName) => {
    setColumnConfigs(prev => prev.map(c => c.name === colName ? { ...c, selected: !c.selected } : c));
    if (expandedCol === colName) setExpandedCol(null);
  };

  const handleAddExpression = (colName) => {
    setColumnConfigs(prev => prev.map(c => {
      if (c.name === colName) {
        return { ...c, expressions: [...c.expressions, { id: Date.now(), operator: '=', value: '', values: [] }] };
      }
      return c;
    }));
  };

  const handleRemoveExpression = (colName, expId) => {
    setColumnConfigs(prev => prev.map(c => {
      if (c.name === colName) return { ...c, expressions: c.expressions.filter(e => e.id !== expId) };
      return c;
    }));
  };

  const handleUpdateExpression = (colName, expId, field, value) => {
    setColumnConfigs(prev => prev.map(c => {
      if (c.name === colName) {
        return {
          ...c,
          expressions: c.expressions.map(exp => {
            if (exp.id === expId) {
              const updated = { ...exp, [field]: value };
              if (field === 'operator' && value === 'in' && !updated.values) { updated.values = ['']; delete updated.value; }
              if (field === 'operator' && value !== 'in') { delete updated.values; if (!updated.value) updated.value = ''; }
              return updated;
            }
            return exp;
          }),
        };
      }
      return c;
    }));
  };

  const handleUpdateColRelation = (colName, relation) => {
    setColumnConfigs(prev => prev.map(c => c.name === colName ? { ...c, relation } : c));
  };

  const handleAddInValue = (colName, expId) => {
    setColumnConfigs(prev => prev.map(c => {
      if (c.name === colName) {
        return { ...c, expressions: c.expressions.map(exp => exp.id === expId ? { ...exp, values: [...(exp.values || []), ''] } : exp) };
      }
      return c;
    }));
  };

  const handleUpdateInValue = (colName, expId, index, value) => {
    setColumnConfigs(prev => prev.map(c => {
      if (c.name === colName) {
        return { ...c, expressions: c.expressions.map(exp => {
          if (exp.id === expId) { const nv = [...(exp.values || [])]; nv[index] = value; return { ...exp, values: nv }; }
          return exp;
        }) };
      }
      return c;
    }));
  };

  const handleRemoveInValue = (colName, expId, index) => {
    setColumnConfigs(prev => prev.map(c => {
      if (c.name === colName) {
        return { ...c, expressions: c.expressions.map(exp => exp.id === expId ? { ...exp, values: (exp.values || []).filter((_, i) => i !== index) } : exp) };
      }
      return c;
    }));
  };

  const renderObjectList = (type) => {
    const list = objectPermissions.filter(o => o.objectType === type);
    if (!list.length) {
      return (
        <div style={{ textAlign: 'center', padding: '32px', color: '#999', backgroundColor: '#fafafa', borderRadius: '4px' }}>
          暂无配置的{type === '表' ? '表' : '单据'}对象
        </div>
      );
    }
    return (
      <div style={{ border: '1px solid #e8e8e8', borderRadius: '4px', overflow: 'hidden' }}>
        {type === '表' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', padding: '10px 16px', backgroundColor: '#fafafa', borderBottom: '1px solid #e8e8e8', fontWeight: 600, fontSize: '13px' }}>
            <div>表对象名称</div>
            <div>操作</div>
          </div>
        )}
        {list.map((obj, idx) => (
          <div key={obj.id} style={{ padding: '12px 16px', borderBottom: idx < list.length - 1 ? '1px solid #e8e8e8' : 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff' }}>
            <span style={{ fontSize: '14px', fontWeight: 500 }}>{obj.objectName}</span>
            <div style={{ display: 'flex', gap: '8px' }}>
              {type === '表' && (
                <Button
                  size="small"
                  icon={<SettingOutlined />}
                  onClick={() => handleOpenRowColConfig(obj)}
                >
                  配置行列权限
                </Button>
              )}
              <Button danger size="small" onClick={() => handleRemoveObject(obj.id)}>删除</Button>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <>
    <Drawer
      title="新建角色"
      placement="right"
      open={open}
      onClose={handleBack}
      width="30%"
      footer={
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
          <Button onClick={handleBack}>取 消</Button>
          <Button type="primary" onClick={handleSave}>保 存</Button>
        </div>
      }
    >
      {/* 基本信息 */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px' }}>基本信息</div>
        <div style={{ marginBottom: '16px' }}>
          <div style={{ marginBottom: '6px' }}><span style={{ color: '#ff4d4f' }}>*</span> 角色名</div>
          <Input
            value={roleName}
            onChange={(e) => setRoleName(e.target.value)}
            placeholder="请输入角色名"
            style={{ width: '300px' }}
          />
        </div>
        <div>
          <div style={{ marginBottom: '6px' }}>角色备注</div>
          <TextArea
            value={roleRemark}
            onChange={(e) => setRoleRemark(e.target.value)}
            placeholder="请输入角色备注"
            rows={3}
            showCount
            maxLength={200}
          />
        </div>
      </div>

      {/* 权限配置 */}
      <div>
        <div style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px' }}>权限配置</div>
        <Tabs
          activeKey={mainTab}
          onChange={setMainTab}
          items={[
            {
              key: 'menu',
              label: '菜单权限',
              children: (
                <div style={{ padding: '8px 0' }}>
                  <div style={{ marginBottom: '16px' }}>
                    <Checkbox
                      checked={selectedMenuPermissions.size === allMenuKeys.length && allMenuKeys.length > 0}
                      indeterminate={selectedMenuPermissions.size > 0 && selectedMenuPermissions.size < allMenuKeys.length}
                      onChange={(e) => handleSelectAllMenu(e.target.checked)}
                    >
                      全选
                    </Checkbox>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', paddingLeft: '4px' }}>
                    {menuPermissions.map(perm => {
                      if (perm.children) {
                        const childKeys = perm.children.map(c => c.key);
                        const checkedCount = childKeys.filter(k => selectedMenuPermissions.has(k)).length;
                        const allChecked = checkedCount === childKeys.length;
                        const indeterminate = checkedCount > 0 && checkedCount < childKeys.length;
                        return (
                          <div key={perm.key}>
                            <Checkbox
                              checked={allChecked}
                              indeterminate={indeterminate}
                              onChange={() => handleToggleMenuPermission(perm.key)}
                            >
                              {perm.label}
                            </Checkbox>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', paddingLeft: '24px', marginTop: '8px' }}>
                              {perm.children.map(child => (
                                <Checkbox
                                  key={child.key}
                                  checked={selectedMenuPermissions.has(child.key)}
                                  onChange={() => handleToggleMenuPermission(child.key)}
                                >
                                  {child.label}
                                </Checkbox>
                              ))}
                            </div>
                          </div>
                        );
                      }
                      return (
                        <Checkbox
                          key={perm.key}
                          checked={selectedMenuPermissions.has(perm.key)}
                          onChange={() => handleToggleMenuPermission(perm.key)}
                        >
                          {perm.label}
                        </Checkbox>
                      );
                    })}
                  </div>
                </div>
              ),
            },
            {
              key: 'object',
              label: '对象权限',
              children: (
                <Tabs
                  activeKey={activeTab}
                  onChange={setActiveTab}
                  items={[
            {
              key: 'table',
              label: '表',
              children: (
                <div>
                  <div style={{ fontWeight: 500, marginBottom: '8px' }}>添加表对象</div>
                  <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
                    <Select
                      mode="multiple"
                      value={objectName}
                      onChange={setObjectName}
                      style={{ width: '300px' }}
                      placeholder="请选择表对象（支持多选）"
                      maxTagCount="responsive"
                    >
                      {getObjectNameOptions().map(name => (
                        <Option key={name} value={name}>{name}</Option>
                      ))}
                    </Select>
                    <Button type="primary" icon={<PlusOutlined />} onClick={handleAddObject}>添加</Button>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <span style={{ fontWeight: 500 }}>已配置对象列表</span>
                    <span style={{ color: '#666', fontSize: '13px' }}>共 {objectPermissions.filter(o => o.objectType === '表').length} 个对象</span>
                  </div>
                  {renderObjectList('表')}
                </div>
              ),
            },
            {
              key: 'document',
              label: '单据',
              children: (
                <div>
                  <div style={{ fontWeight: 500, marginBottom: '8px' }}>添加单据对象</div>
                  <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
                    <Select
                      mode="multiple"
                      value={selectedDocumentTypes}
                      onChange={setSelectedDocumentTypes}
                      style={{ width: '300px' }}
                      placeholder="请选择单据类型（支持多选）"
                      maxTagCount="responsive"
                    >
                      {getDocumentTypeOptions().map(type => (
                        <Option key={type} value={type}>{type}</Option>
                      ))}
                    </Select>
                    <Button type="primary" icon={<PlusOutlined />} onClick={handleAddObject}>添加</Button>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <span style={{ fontWeight: 500 }}>已配置单据类型对象列表</span>
                    <span style={{ color: '#666', fontSize: '13px' }}>共 {objectPermissions.filter(o => o.objectType === '单据').length} 个对象</span>
                  </div>
                  {renderObjectList('单据')}
                </div>
              ),
            },
          ]}
        />
              ),
            },
          ]}
        />
      </div>
    </Drawer>

    {/* 行列权限配置抽屉 */}
    <Drawer
      title={objectPermissions.find(o => o.id === editingObjId)?.objectName || ''}
      placement="right"
      open={isRowColModalVisible}
      onClose={handleRowColModalClose}
      width={640}
      footer={
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
          <Button onClick={handleRowColModalClose}>取消</Button>
          <Button type="primary" onClick={handleSaveRowColConfig}>确认</Button>
        </div>
      }
    >
      <Tabs activeKey={rowColTab} onChange={setRowColTab} items={[
        {
          key: 'col',
          label: '列权限',
          children: (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                <Input allowClear placeholder="搜索列名" value={colSearch} onChange={(e) => setColSearch(e.target.value)} style={{ width: 220 }} />
              </div>
              <div style={{ border: '1px solid #e8e8e8', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '44px 1.5fr 2fr 50px', backgroundColor: '#fafafa', borderBottom: '1px solid #e8e8e8', fontWeight: 600, padding: '10px 12px', fontSize: '13px' }}>
                  <div><Checkbox checked={columnConfigs.length > 0 && columnConfigs.every(c => c.selected)} indeterminate={columnConfigs.some(c => c.selected) && !columnConfigs.every(c => c.selected)} onChange={handleSelectAllCols} /></div>
                  <div>列名</div>
                  <div>样例数据</div>
                  <div style={{ textAlign: 'center' }}>设置行权限</div>
                </div>
                {getFilteredCols().map((col, idx) => {
                  const hasExp = col.expressions?.length > 0;
                  const sampleText = Array.isArray(col.sampleData) ? col.sampleData.join('    ') : '-';
                  return (
                    <div key={col.name} style={{ display: 'grid', gridTemplateColumns: '44px 1.5fr 2fr 50px', padding: '12px', alignItems: 'center', borderBottom: idx < getFilteredCols().length - 1 ? '1px solid #e8e8e8' : 'none', backgroundColor: col.selected ? '#f0f7ff' : '#fff' }}>
                      <div><Checkbox checked={col.selected} onChange={() => handleToggleCol(col.name)} /></div>
                      <div>
                        <span style={{ fontWeight: 500, marginRight: '8px' }}>{col.name}</span>
                        <span style={{ fontSize: '11px', color: '#1677ff', background: '#e6f4ff', borderRadius: '3px', padding: '1px 6px' }}>{col.type ? col.type.toUpperCase() : 'TEXT'}</span>
                      </div>
                      <div style={{ fontSize: '12px', color: '#666', lineHeight: '20px', whiteSpace: 'pre-wrap' }}>{sampleText}</div>
                      <div style={{ textAlign: 'center' }}>
                        <Button type="text" size="small" disabled={!col.selected} style={{ color: col.selected ? (hasExp ? '#1677ff' : '#333') : '#ccc', fontWeight: 600, fontSize: '16px' }} onClick={() => { setRowPermCol(col); setIsRowPermModalVisible(true); }}>+</Button>
                      </div>
                    </div>
                  );
                })}
                {getFilteredCols().length === 0 && (
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
              <Button type="primary" icon={<PlusOutlined />} block style={{ marginBottom: '16px' }} onClick={() => { setRowPermCol(null); setIsRowPermModalVisible(true); }}>添加行权限</Button>
              <div style={{ border: '1px solid #e8e8e8', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr auto', padding: '10px 16px', backgroundColor: '#fafafa', borderBottom: '1px solid #e8e8e8', fontWeight: 600, fontSize: '13px' }}>
                  <div>列</div>
                  <div>行权限表达式</div>
                  <div>操作</div>
                </div>
                {(() => {
                  const rowPerms = columnConfigs.filter(c => c.expressions?.length > 0);
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
                        <Button type="link" size="small" onClick={() => { setRowPermCol(col); setIsRowPermModalVisible(true); }}>编辑</Button>
                        <Button type="link" size="small" danger onClick={() => {
                          setColumnConfigs(prev => prev.map(c => c.name === col.name ? { ...c, expressions: [] } : c));
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
      open={isRowPermModalVisible}
      onCancel={() => { setIsRowPermModalVisible(false); setRowPermCol(null); }}
      onOk={() => {
        setIsRowPermModalVisible(false);
        setRowPermCol(null);
      }}
      okText="确 认"
      cancelText="取 消"
      width={520}
      zIndex={2100}
    >
      {(() => {
        const col = rowPermCol ? columnConfigs.find(c => c.name === rowPermCol.name) : null;
        return (
          <div>
            <div style={{ marginBottom: '20px' }}>
              <div style={{ marginBottom: '6px' }}><span style={{ color: '#ff4d4f' }}>*</span> 列</div>
              <Select
                value={col?.name || undefined}
                disabled={!!rowPermCol}
                style={{ width: '100%' }}
                placeholder="请选择列"
                onChange={(v) => {
                  const found = columnConfigs.find(c => c.name === v);
                  if (found) setRowPermCol(found);
                }}
              >
                {columnConfigs.filter(c => c.selected).map(c => (
                  <Option key={c.name} value={c.name}>
                    {c.name} <span style={{ fontSize: '11px', color: '#1677ff', background: '#e6f4ff', borderRadius: '3px', padding: '1px 6px', marginLeft: '8px' }}>{c.type ? c.type.toUpperCase() : 'TEXT'}</span>
                  </Option>
                ))}
              </Select>
            </div>
            {col && (
              <>
                <div style={{ borderLeft: '2px solid #d9d9d9', paddingLeft: '16px', marginLeft: '4px' }}>
                  {col.expressions.map(exp => (
                    <div key={exp.id} style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '12px' }}>
                      <Select value={exp.operator} onChange={(v) => handleUpdateExpression(col.name, exp.id, 'operator', v)} style={{ width: 110 }}>
                        {['=', '!=', '>', '>=', '<', '<=', 'in', 'like', '正则'].map(op => (
                          <Option key={op} value={op}>{op}</Option>
                        ))}
                      </Select>
                      {exp.operator !== 'in' ? (
                        <Input value={exp.value || ''} onChange={(e) => handleUpdateExpression(col.name, exp.id, 'value', e.target.value)} placeholder="输入值..." style={{ flex: 1 }} />
                      ) : (
                        <div style={{ flex: 1 }}>
                          {(exp.values || []).map((val, vi) => (
                            <div key={vi} style={{ display: 'flex', gap: '8px', marginBottom: '6px' }}>
                              <Input value={val} onChange={(e) => handleUpdateInValue(col.name, exp.id, vi, e.target.value)} placeholder="输入值..." style={{ flex: 1 }} />
                              <Button type="text" danger icon={<DeleteOutlined />} onClick={() => handleRemoveInValue(col.name, exp.id, vi)} />
                            </div>
                          ))}
                          <Button type="dashed" size="small" onClick={() => handleAddInValue(col.name, exp.id)}>+ 添加值</Button>
                        </div>
                      )}
                      <Button type="text" danger icon={<DeleteOutlined />} onClick={() => handleRemoveExpression(col.name, exp.id)} />
                    </div>
                  ))}
                </div>
                <Button type="dashed" onClick={() => handleAddExpression(col.name)} icon={<PlusOutlined />} style={{ marginTop: '4px' }}>添加表达式</Button>
              </>
            )}
          </div>
        );
      })()}
    </Modal>
    </>
  );
};

export default CreateRole;
