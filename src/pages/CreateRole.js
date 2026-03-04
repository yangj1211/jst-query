import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Input, Select, Checkbox, message, Tabs, Drawer } from 'antd';
import { SettingOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';
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
  { key: 'data-view', label: '数据总览' },
  { key: 'data-import', label: '数据导入' },
  { key: 'data-backup', label: '备份文件' },
  { key: 'user-management', label: '用户列表' },
  { key: 'role-permission', label: '角色权限' },
];

const CreateRole = ({ open = true, onClose, onSaved }) => {
  const navigate = useNavigate();
  const [roleName, setRoleName] = useState('');
  const [roleRemark, setRoleRemark] = useState('');
  const [mainTab, setMainTab] = useState('menu');
  const [activeTab, setActiveTab] = useState('table');
  const [objectName, setObjectName] = useState([]);
  const [selectedDocumentTypes, setSelectedDocumentTypes] = useState([]);
  const [objectPermissions, setObjectPermissions] = useState([]);
  const [selectedMenuPermissions, setSelectedMenuPermissions] = useState(new Set());

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

  const handleToggleMenuPermission = (key) => {
    setSelectedMenuPermissions(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key); else next.add(key);
      return next;
    });
  };

  const handleSelectAllMenu = (checked) => {
    setSelectedMenuPermissions(checked ? new Set(menuPermissions.map(p => p.key)) : new Set());
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
        id: Date.now() + Math.random(), objectType: '表', objectName: n, permissions: ['DT8'],
      }));
    } else {
      if (!selectedDocumentTypes.length) { message.warning('请选择单据类型'); return; }
      newItems = selectedDocumentTypes.filter(t => !added.has(t)).map(t => ({
        id: Date.now() + Math.random(), objectType: '单据', objectName: t, permissions: ['DT8'],
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
        {list.map((obj, idx) => (
          <div key={obj.id} style={{ padding: '12px 16px', borderBottom: idx < list.length - 1 ? '1px solid #e8e8e8' : 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '14px', fontWeight: 500 }}>{obj.objectName}</span>
            <Button danger size="small" onClick={() => handleRemoveObject(obj.id)}>删除</Button>
          </div>
        ))}
      </div>
    );
  };

  return (
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
                      checked={selectedMenuPermissions.size === menuPermissions.length}
                      indeterminate={selectedMenuPermissions.size > 0 && selectedMenuPermissions.size < menuPermissions.length}
                      onChange={(e) => handleSelectAllMenu(e.target.checked)}
                    >
                      全选
                    </Checkbox>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', paddingLeft: '4px' }}>
                    {menuPermissions.map(perm => (
                      <Checkbox
                        key={perm.key}
                        checked={selectedMenuPermissions.has(perm.key)}
                        onChange={() => handleToggleMenuPermission(perm.key)}
                      >
                        {perm.label}
                      </Checkbox>
                    ))}
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
  );
};

export default CreateRole;
