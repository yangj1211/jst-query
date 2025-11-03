import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button, Select, Checkbox, Modal, Input } from 'antd';
import { SettingOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import './PageStyle.css';

const { Option } = Select;

const DataPermissionConfig = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const currentRole = location.state?.role; // 从路由参数获取角色信息
  
  console.log('DataPermissionConfig 组件加载');
  console.log('location.state:', location.state);
  console.log('currentRole:', currentRole);

  const [objectType, setObjectType] = useState('表');
  const [objectName, setObjectName] = useState(null);
  const [selectedPermissions, setSelectedPermissions] = useState([]);
  
  // 数据权限配置相关状态
  const [objectPermissions, setObjectPermissions] = useState([]); // 对象权限列表
  
  // 编辑对象弹窗相关状态
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editingObject, setEditingObject] = useState(null);
  const [editObjectType, setEditObjectType] = useState('表');
  const [editObjectName, setEditObjectName] = useState(null);
  const [editSelectedPermissions, setEditSelectedPermissions] = useState([]);
  const [editTempColumnConfigs, setEditTempColumnConfigs] = useState([]);
  
  // 行列权限配置相关状态
  const [isRowColumnModalVisible, setIsRowColumnModalVisible] = useState(false);
  const [currentEditingObject, setCurrentEditingObject] = useState(null); // 当前编辑的对象
  const [columnConfigs, setColumnConfigs] = useState([]); // 列配置，包含是否选中和行权限表达式
  const [tempColumnConfigs, setTempColumnConfigs] = useState([]); // 临时保存正在添加对象的行列权限配置
  const [isEditingMode, setIsEditingMode] = useState(false); // 标记是否在编辑模式

  // 表权限选项（普通用户只能查询，不能写入）
  const tablePermissionOptions = [
    { value: 'DT8', label: '表查询', hasConfig: true },
  ];

  // 文件权限选项
  const filePermissionOptions = [
    { value: 'DT10', label: '查看' },
  ];

  // 根据对象类型获取权限选项
  const getPermissionOptions = (type) => {
    return type === '文件' ? filePermissionOptions : tablePermissionOptions;
  };

  // 模拟从数据中心获取对象列表（与数据中心的数据保持一致）
  const dataCenterObjects = [
    {
      id: 1,
      name: '2024年财务报告.pdf',
      objectType: 'file',
    },
    {
      id: 2,
      name: '2023年对外披露数据.pdf',
      objectType: 'file',
    },
    { 
      id: 3, 
      name: '测试表1',
      objectType: 'table',
    },
    { 
      id: 4, 
      name: '测试表2',
      objectType: 'table',
    }
  ];

  // 根据对象类别获取对象名称选项（过滤掉已添加的对象）
  const getObjectNameOptions = (type) => {
    const typeMap = {
      '表': 'table',
      '文件': 'file',
    };
    // 获取已添加的同类型对象名称
    const addedObjectNames = objectPermissions
      .filter(obj => obj.objectType === type)
      .map(obj => obj.objectName);
    
    return dataCenterObjects
      .filter(obj => obj.objectType === typeMap[type])
      .filter(obj => !addedObjectNames.includes(obj.name)) // 过滤掉已添加的对象
      .map(obj => obj.name);
  };

  useEffect(() => {
    // 如果没有角色信息，返回到角色权限列表
    if (!currentRole) {
      console.log('没有角色信息，重定向到角色权限列表');
      navigate('/permission/role-permission', { replace: true });
    } else {
      console.log('当前角色:', currentRole);
      // TODO: 从后端加载该角色已配置的对象权限
      setObjectPermissions([]); // 初始化为空，实际应该加载已有配置
    }
  }, [currentRole, navigate]);

  // 返回到角色权限列表
  const handleBack = () => {
    navigate('/permission/role-permission');
  };

  // 添加对象权限
  const handleAddObjectPermission = () => {
    if (!objectName) {
      alert('请选择对象名称');
      return;
    }
    
    // 检查是否已经添加过这个对象
    if (objectPermissions.some(obj => obj.objectName === objectName && obj.objectType === objectType)) {
      alert('该对象已添加，请勿重复添加');
      return;
    }

    const isAdmin = currentRole?.roleName === '管理员' || currentRole?.roleId === '2';
    
    // 确定权限
    let permissions = [];
    if (isAdmin) {
      // 管理员默认拥有所有权限
      permissions = objectType === '文件' 
        ? filePermissionOptions.map(opt => opt.value)
        : tablePermissionOptions.map(opt => opt.value);
    } else {
      // 普通用户使用已选择的权限（表类型已自动设置为DT8，文件类型为DT10）
      permissions = [...selectedPermissions];
    }

    const newObjectPermission = {
      id: Date.now(),
      objectType,
      objectName,
      permissions,
      columnConfigs: tempColumnConfigs.length > 0 ? [...tempColumnConfigs] : [], // 使用临时配置的行列权限
    };

    setObjectPermissions([...objectPermissions, newObjectPermission]);
    
    // 重置选择
    setObjectName(null);
    setSelectedPermissions([]);
    setTempColumnConfigs([]); // 清空临时行列权限配置
  };

  // 删除对象权限
  const handleRemoveObjectPermission = (id) => {
    setObjectPermissions(objectPermissions.filter(obj => obj.id !== id));
  };

  // 编辑对象权限 - 打开编辑弹窗
  const handleEditObjectPermission = (objectPermission) => {
    setEditingObject(objectPermission);
    setEditObjectType(objectPermission.objectType);
    setEditObjectName(objectPermission.objectName);
    setEditSelectedPermissions(objectPermission.permissions);
    setEditTempColumnConfigs(objectPermission.columnConfigs || []);
    setIsEditModalVisible(true);
  };

  // 关闭编辑弹窗
  const handleEditModalClose = () => {
    setIsEditModalVisible(false);
    setEditingObject(null);
    setEditObjectType('表');
    setEditObjectName(null);
    setEditSelectedPermissions([]);
    setEditTempColumnConfigs([]);
  };

  // 保存编辑后的对象权限
  const handleSaveEditedObjectPermission = () => {
    const isAdmin = currentRole?.roleName === '管理员' || currentRole?.roleId === '2';
    
    // 确定权限
    let permissions = [];
    if (isAdmin) {
      // 管理员默认拥有所有权限
      permissions = editObjectType === '文件' 
        ? filePermissionOptions.map(opt => opt.value)
        : tablePermissionOptions.map(opt => opt.value);
    } else {
      // 普通用户使用已选择的权限（表类型已自动设置为DT8，文件类型为DT10）
      permissions = [...editSelectedPermissions];
    }

    // 更新对象权限列表
    setObjectPermissions(objectPermissions.map(obj => 
      obj.id === editingObject.id 
        ? {
            ...obj,
            objectType: editObjectType,
            objectName: editObjectName,
            permissions,
            columnConfigs: editTempColumnConfigs.length > 0 ? [...editTempColumnConfigs] : []
          }
        : obj
    ));

    handleEditModalClose();
  };

  // 编辑模式下的权限选择
  const handleEditPermissionChange = (value) => {
    if (!editObjectName) {
      return;
    }
    const newSelected = editSelectedPermissions.includes(value)
      ? editSelectedPermissions.filter(v => v !== value)
      : [...editSelectedPermissions, value];
    setEditSelectedPermissions(newSelected);
    
    // 如果取消了表查询权限，清空行列权限配置
    if (value === 'DT8' && !newSelected.includes('DT8')) {
      setEditTempColumnConfigs([]);
    }
  };

  // 保存所有权限配置
  const handleSaveAllPermissions = () => {
    console.log('保存所有权限配置:', {
      role: currentRole,
      objectPermissions,
    });
    // TODO: 调用API保存所有权限配置
    navigate('/permission/role-permission'); // 保存后返回列表
  };

  // 单个权限选择
  const handlePermissionChange = (value) => {
    if (!objectName) {
      return;
    }
    const newSelected = selectedPermissions.includes(value)
      ? selectedPermissions.filter(v => v !== value)
      : [...selectedPermissions, value];
    setSelectedPermissions(newSelected);
    
    // 如果取消了表查询权限，清空临时行列权限配置
    if (value === 'DT8' && !newSelected.includes('DT8')) {
      setTempColumnConfigs([]);
    }
  };

  // 获取表的列信息（模拟数据，包含类型、描述、样例数据）
  const getTableColumns = (tableName) => {
    // 根据表名返回对应的列详细信息
    const tableColumnsMap = {
      '测试表1': [
        { 
          name: '用户ID', 
          type: 'int', 
          description: '主键ID',
          sampleData: ['1', '12345', '9999']
        },
        { 
          name: '用户名', 
          type: 'varchar(100)', 
          description: '用户名',
          sampleData: ['admin', 'user123', 'test_user']
        },
        { 
          name: '创建时间', 
          type: 'datetime', 
          description: '创建时间',
          sampleData: ['2025-01-01 10:00:00', '2025-01-15 14:30:00', '2025-02-20 09:15:00']
        },
      ],
      '测试表2': [
        { 
          name: '订单编号', 
          type: 'varchar(50)', 
          description: '订单唯一标识',
          sampleData: ['ORD001', 'ORD002', 'ORD003']
        },
        { 
          name: '金额', 
          type: 'decimal(10,2)', 
          description: '订单金额',
          sampleData: ['100.50', '299.99', '1580.00']
        },
      ],
    };
    return tableColumnsMap[tableName] || [];
  };

  // 配置行列权限（添加前配置）
  const handleConfigColumnPermissionBeforeAdd = () => {
    if (!objectName) {
      alert('请先选择对象名称');
      return;
    }
    
    console.log('配置行列权限（添加前）:', objectName);
    setCurrentEditingObject(null); // 标记为添加前配置
    setIsEditingMode(false);
    
    // 获取当前表的列并初始化配置
    const columns = getTableColumns(objectName);
    
    // 如果已有临时配置则使用，否则初始化
    if (tempColumnConfigs.length > 0) {
      setColumnConfigs(tempColumnConfigs);
    } else {
      const initialConfigs = columns.map(col => ({
        ...col,
        selected: true, // 默认全选
        expressions: [], // 行权限表达式
      }));
      setColumnConfigs(initialConfigs);
    }
    
    setIsRowColumnModalVisible(true);
  };

  // 配置行列权限（编辑模式下的配置）
  const handleConfigColumnPermissionInEditMode = () => {
    if (!editObjectName) {
      alert('请先选择对象名称');
      return;
    }
    
    console.log('配置行列权限（编辑模式）:', editObjectName);
    setCurrentEditingObject(null);
    setIsEditingMode(true);
    
    // 获取当前表的列并初始化配置
    const columns = getTableColumns(editObjectName);
    
    // 如果已有临时配置则使用，否则初始化
    if (editTempColumnConfigs.length > 0) {
      setColumnConfigs(editTempColumnConfigs);
    } else {
      const initialConfigs = columns.map(col => ({
        ...col,
        selected: true, // 默认全选
        expressions: [], // 行权限表达式
      }));
      setColumnConfigs(initialConfigs);
    }
    
    setIsRowColumnModalVisible(true);
  };

  // 配置行列权限（从已添加的对象列表编辑）
  const handleConfigColumnPermissionFromList = (objectPermission) => {
    console.log('配置行列权限（编辑）:', objectPermission);
    setCurrentEditingObject(objectPermission);
    
    // 获取当前表的列并初始化配置
    const columns = getTableColumns(objectPermission.objectName);
    
    // 如果已有配置则使用已有的，否则初始化
    if (objectPermission.columnConfigs && objectPermission.columnConfigs.length > 0) {
      setColumnConfigs(objectPermission.columnConfigs);
    } else {
      const initialConfigs = columns.map(col => ({
        ...col,
        selected: true, // 默认全选
        expressions: [], // 行权限表达式
      }));
      setColumnConfigs(initialConfigs);
    }
    
    setIsRowColumnModalVisible(true);
  };

  // 关闭行列权限配置弹窗
  const handleRowColumnModalClose = () => {
    setIsRowColumnModalVisible(false);
  };

  // 保存行列权限配置
  const handleSaveRowColumnPermission = () => {
    if (currentEditingObject) {
      // 编辑已添加对象的行列权限
      setObjectPermissions(objectPermissions.map(obj => 
        obj.id === currentEditingObject.id 
          ? { ...obj, columnConfigs: columnConfigs }
          : obj
      ));
    } else if (isEditingMode) {
      // 编辑模式下的配置，保存到编辑临时状态
      setEditTempColumnConfigs(columnConfigs);
    } else {
      // 添加前配置，保存到添加临时状态
      setTempColumnConfigs(columnConfigs);
    }
    setIsRowColumnModalVisible(false);
    setCurrentEditingObject(null);
    setIsEditingMode(false);
  };

  // 全选/取消全选列
  const handleSelectAllColumns = (e) => {
    setColumnConfigs(columnConfigs.map(col => ({
      ...col,
      selected: e.target.checked,
    })));
  };

  // 切换单个列的选中状态
  const handleToggleColumn = (columnName) => {
    setColumnConfigs(columnConfigs.map(col => 
      col.name === columnName ? { ...col, selected: !col.selected } : col
    ));
  };

  // 为某一列添加表达式
  const handleAddExpression = (columnName) => {
    setColumnConfigs(columnConfigs.map(col => {
      if (col.name === columnName) {
        return {
          ...col,
          expressions: [
            ...col.expressions,
            {
              id: Date.now(),
              operator: '等于',
              value: '',
              values: [], // 用于"包含"操作符
            }
          ]
        };
      }
      return col;
    }));
  };

  // 删除某一列的表达式
  const handleRemoveExpression = (columnName, expressionId) => {
    setColumnConfigs(columnConfigs.map(col => {
      if (col.name === columnName) {
        return {
          ...col,
          expressions: col.expressions.filter(exp => exp.id !== expressionId)
        };
      }
      return col;
    }));
  };

  // 更新某一列的表达式
  const handleUpdateExpression = (columnName, expressionId, field, value) => {
    setColumnConfigs(columnConfigs.map(col => {
      if (col.name === columnName) {
        return {
          ...col,
          expressions: col.expressions.map(exp => {
            if (exp.id === expressionId) {
              const updated = { ...exp, [field]: value };
              // 如果改变操作符，重置值
              if (field === 'operator') {
                if (value === '包含') {
                  updated.value = '';
                  updated.values = [];
                } else {
                  updated.value = '';
                  updated.values = [];
                }
              }
              return updated;
            }
            return exp;
          })
        };
      }
      return col;
    }));
  };

  // 为"包含"操作符添加值
  const handleAddValueToExpression = (columnName, expressionId) => {
    setColumnConfigs(columnConfigs.map(col => {
      if (col.name === columnName) {
        return {
          ...col,
          expressions: col.expressions.map(exp => {
            if (exp.id === expressionId) {
              return {
                ...exp,
                values: [...exp.values, '']
              };
            }
            return exp;
          })
        };
      }
      return col;
    }));
  };

  // 更新"包含"操作符的某个值
  const handleUpdateExpressionValue = (columnName, expressionId, index, value) => {
    setColumnConfigs(columnConfigs.map(col => {
      if (col.name === columnName) {
        return {
          ...col,
          expressions: col.expressions.map(exp => {
            if (exp.id === expressionId) {
              const newValues = [...exp.values];
              newValues[index] = value;
              return { ...exp, values: newValues };
            }
            return exp;
          })
        };
      }
      return col;
    }));
  };

  // 删除"包含"操作符的某个值
  const handleRemoveExpressionValue = (columnName, expressionId, index) => {
    setColumnConfigs(columnConfigs.map(col => {
      if (col.name === columnName) {
        return {
          ...col,
          expressions: col.expressions.map(exp => {
            if (exp.id === expressionId) {
              return {
                ...exp,
                values: exp.values.filter((_, i) => i !== index)
              };
            }
            return exp;
          })
        };
      }
      return col;
    }));
  };

  // 对象类别改变
  const handleObjectTypeChange = (value) => {
    setObjectType(value);
    setObjectName(null);
    // 文件类型默认选中"查看"权限，表类型默认选中"表查询"权限
    if (value === '文件') {
      setSelectedPermissions(['DT10']);
    } else if (value === '表') {
      setSelectedPermissions(['DT8']);
    } else {
      setSelectedPermissions([]);
    }
    setTempColumnConfigs([]); // 清空临时行列权限配置
  };

  // 如果没有角色信息，显示加载中（实际上会立即重定向）
  if (!currentRole) {
    return (
      <div className="page-container">
        <div className="page-header">
          <h2>加载中...</h2>
        </div>
        <div className="page-content" style={{ padding: '24px', textAlign: 'center' }}>
          正在跳转...
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <Button 
            type="text" 
            icon={<ArrowLeftOutlined />} 
            onClick={handleBack}
            style={{ fontSize: '16px' }}
          >
            返回
          </Button>
          <h2 style={{ margin: 0 }}>配置数据权限 - {currentRole.roleName}</h2>
        </div>
      </div>
      <div className="page-content" style={{ padding: '16px' }}>
        {/* 添加对象区域 */}
        <div style={{ 
          padding: '16px',
          backgroundColor: '#f5f5f5',
          borderRadius: '4px',
          marginBottom: '16px'
        }}>
          <div style={{ fontWeight: 600, marginBottom: '12px' }}>添加对象</div>
          
          <div style={{ display: 'flex', gap: '12px', marginBottom: '12px', flexWrap: 'wrap' }}>
            {/* 对象类别 */}
            <div style={{ width: '200px' }}>
              <div style={{ marginBottom: '8px', fontSize: '14px' }}>
                <span style={{ color: '#ff4d4f', marginRight: '4px' }}>*</span>
                对象类别
              </div>
              <Select
                value={objectType}
                onChange={handleObjectTypeChange}
                style={{ width: '100%' }}
                placeholder="请选择对象类别"
              >
                <Option value="表">表</Option>
                <Option value="文件">文件</Option>
              </Select>
            </div>

            {/* 对象名称 */}
            <div style={{ width: '300px' }}>
              <div style={{ marginBottom: '8px', fontSize: '14px' }}>
                <span style={{ color: '#ff4d4f', marginRight: '4px' }}>*</span>
                对象名称
              </div>
              <Select
                value={objectName}
                onChange={(value) => {
                  setObjectName(value);
                  // 文件类型默认选中"查看"权限，表类型默认选中"表查询"权限
                  if (objectType === '文件') {
                    setSelectedPermissions(['DT10']);
                  } else if (objectType === '表') {
                    setSelectedPermissions(['DT8']);
                  } else {
                    setSelectedPermissions([]);
                  }
                  setTempColumnConfigs([]); // 切换对象时清空临时配置
                }}
                style={{ width: '100%' }}
                placeholder="请选择对象名称"
              >
                {getObjectNameOptions(objectType).map(name => (
                  <Option key={name} value={name}>{name}</Option>
                ))}
              </Select>
            </div>

            {/* 表类型显示配置行列权限按钮 - 管理员不显示 */}
            {!(currentRole?.roleName === '管理员' || currentRole?.roleId === '2') && objectType === '表' && objectName && (
              <div style={{ alignSelf: 'flex-end', paddingBottom: '4px' }}>
                <Button
                  type="link"
                  size="small"
                  icon={<SettingOutlined />}
                  onClick={handleConfigColumnPermissionBeforeAdd}
                  style={{ padding: 0 }}
                >
                  配置行列权限 {tempColumnConfigs.length > 0 && '(已配置)'}
                </Button>
              </div>
            )}
          </div>

          <Button type="primary" onClick={handleAddObjectPermission}>
            + 添加到列表
          </Button>
        </div>

        {/* 已添加的对象列表 */}
        <div>
          <div style={{ 
            fontWeight: 600, 
            marginBottom: '12px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <span>已配置对象列表</span>
            <span style={{ fontSize: '14px', fontWeight: 400, color: '#666' }}>
              共 {objectPermissions.length} 个对象
            </span>
          </div>

          {objectPermissions.length === 0 ? (
            <div style={{ 
              textAlign: 'center', 
              padding: '32px', 
              color: '#999',
              backgroundColor: '#fafafa',
              borderRadius: '4px'
            }}>
              暂无配置，请先添加对象
            </div>
          ) : (
            <div style={{ 
              border: '1px solid #e8e8e8',
              borderRadius: '4px',
              overflow: 'hidden'
            }}>
              {objectPermissions.map((obj, index) => (
                <div 
                  key={obj.id}
                  style={{
                    padding: '12px 16px',
                    borderBottom: index < objectPermissions.length - 1 ? '1px solid #e8e8e8' : 'none',
                    backgroundColor: '#fff'
                  }}
                >
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between',
                    alignItems: 'start'
                  }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ 
                        display: 'flex', 
                        alignItems: 'center',
                        gap: '12px',
                        marginBottom: '8px'
                      }}>
                        <span style={{ 
                          fontSize: '16px', 
                          fontWeight: 600 
                        }}>
                          {obj.objectName}
                        </span>
                        <span style={{ 
                          padding: '2px 8px',
                          backgroundColor: obj.objectType === '表' ? '#e6f7ff' : '#fff7e6',
                          color: obj.objectType === '表' ? '#1890ff' : '#fa8c16',
                          fontSize: '12px',
                          borderRadius: '2px'
                        }}>
                          {obj.objectType}
                        </span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      {/* 表类型且非管理员才显示编辑按钮 */}
                      {!(currentRole?.roleName === '管理员' || currentRole?.roleId === '2') && obj.objectType === '表' && (
                        <Button
                          size="small"
                          onClick={() => handleEditObjectPermission(obj)}
                        >
                          编辑
                        </Button>
                      )}
                      <Button
                        danger
                        size="small"
                        onClick={() => handleRemoveObjectPermission(obj.id)}
                      >
                        删除
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 底部操作按钮 */}
        <div style={{ 
          marginTop: '16px',
          display: 'flex',
          justifyContent: 'flex-end',
          gap: '12px'
        }}>
          <Button onClick={handleBack}>取消</Button>
          <Button type="primary" onClick={handleSaveAllPermissions}>
            保存
          </Button>
        </div>
      </div>

      {/* 编辑对象权限弹窗 */}
      <Modal
        title={`编辑对象权限 - ${editingObject?.objectName || ''}`}
        open={isEditModalVisible}
        onOk={handleSaveEditedObjectPermission}
        onCancel={handleEditModalClose}
        width={700}
        okText="保存"
        cancelText="取消"
        zIndex={1500}
        getContainer={() => document.body}
      >
        <div style={{ padding: '12px 0' }}>
          <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', flexWrap: 'wrap' }}>
            {/* 对象类别 */}
            <div style={{ width: '200px' }}>
              <div style={{ marginBottom: '8px', fontSize: '14px' }}>
                <span style={{ color: '#ff4d4f', marginRight: '4px' }}>*</span>
                对象类别
              </div>
              <Select
                value={editObjectType}
                onChange={(value) => {
                  setEditObjectType(value);
                  setEditObjectName(null);
                  setEditTempColumnConfigs([]);
                }}
                style={{ width: '100%' }}
                placeholder="请选择对象类别"
                disabled
              >
                <Option value="表">表</Option>
                <Option value="文件">文件</Option>
              </Select>
            </div>

            {/* 对象名称 */}
            <div style={{ width: '300px' }}>
              <div style={{ marginBottom: '8px', fontSize: '14px' }}>
                <span style={{ color: '#ff4d4f', marginRight: '4px' }}>*</span>
                对象名称
              </div>
              <Select
                value={editObjectName}
                onChange={(value) => {
                  setEditObjectName(value);
                  setEditTempColumnConfigs([]);
                }}
                style={{ width: '100%' }}
                placeholder="请选择对象名称"
                disabled
              >
                {getObjectNameOptions(editObjectType).map(name => (
                  <Option key={name} value={name}>{name}</Option>
                ))}
              </Select>
            </div>
          </div>

          {/* 表类型显示配置行列权限按钮 - 管理员不显示 */}
          {!(currentRole?.roleName === '管理员' || currentRole?.roleId === '2') && editObjectType === '表' && editObjectName && (
            <div style={{ marginBottom: '16px' }}>
              <Button
                type="link"
                size="small"
                icon={<SettingOutlined />}
                onClick={handleConfigColumnPermissionInEditMode}
                style={{ padding: 0 }}
              >
                配置行列权限 {editTempColumnConfigs.length > 0 && '(已配置)'}
              </Button>
            </div>
          )}
        </div>
      </Modal>

      {/* 行列权限配置弹窗 */}
      <Modal
        title={`行列权限设置 - ${currentEditingObject?.objectName || (isEditingMode ? editObjectName : objectName) || ''}`}
        open={isRowColumnModalVisible}
        onOk={handleSaveRowColumnPermission}
        onCancel={handleRowColumnModalClose}
        width={780}
        okText="确定"
        cancelText="取消"
        bodyStyle={{ maxHeight: '60vh', overflow: 'auto' }}
        zIndex={2000}
        getContainer={() => document.body}
      >
        <div style={{ padding: '8px 0' }}>
          <div style={{ 
            color: '#666', 
            fontSize: '14px', 
            marginBottom: '16px',
            padding: '12px',
            backgroundColor: '#f5f5f5',
            borderRadius: '4px'
          }}>
            选择该表中可以访问的列，并可为每列设置值范围的正则表达式式规则
          </div>

          {/* 列权限配置 */}
          <div>
            <div style={{ 
              fontSize: '16px', 
              fontWeight: 600, 
              marginBottom: '16px'
            }}>
              列权限配置
            </div>
            
            <div style={{ marginBottom: '12px' }}>
              <Checkbox
                checked={columnConfigs.filter(col => col.selected).length === columnConfigs.length && columnConfigs.length > 0}
                indeterminate={columnConfigs.filter(col => col.selected).length > 0 && columnConfigs.filter(col => col.selected).length < columnConfigs.length}
                onChange={handleSelectAllColumns}
              >
                <span style={{ fontWeight: 500 }}>
                  全选列 已选择 {columnConfigs.filter(col => col.selected).length}/{columnConfigs.length} 列
                </span>
              </Checkbox>
            </div>

            {/* 表格形式展示列配置 */}
            <div style={{ 
              border: '1px solid #e8e8e8',
              borderRadius: '4px',
              overflow: 'hidden'
            }}>
              {/* 表头 */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '50px 120px 1fr 140px',
                backgroundColor: '#fafafa',
                borderBottom: '1px solid #e8e8e8',
                fontWeight: 600,
                padding: '12px 16px'
              }}>
                <div>选择</div>
                <div>列名</div>
                <div>行权限表达式</div>
                <div>样例数据</div>
              </div>

              {/* 表体 */}
              {columnConfigs.map((col, index) => (
                <div 
                  key={col.name}
                  style={{
                    borderBottom: index < columnConfigs.length - 1 ? '1px solid #e8e8e8' : 'none',
                    backgroundColor: col.selected ? '#fffbe6' : '#fff'
                  }}
                >
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: '50px 120px 1fr 140px',
                    padding: '16px',
                    alignItems: 'start'
                  }}>
                    {/* 选择列 */}
                    <div>
                      <Checkbox
                        checked={col.selected}
                        onChange={() => handleToggleColumn(col.name)}
                      />
                    </div>

                    {/* 列名 */}
                    <div>
                      <div style={{ fontWeight: 500 }}>{col.name}</div>
                    </div>

                    {/* 行权限表达式 */}
                    <div>
                      {!col.selected ? (
                        <div style={{ color: '#999', fontSize: '14px' }}>请先选择此列</div>
                      ) : col.expressions.length === 0 ? (
                        <Button 
                          size="small" 
                          onClick={() => handleAddExpression(col.name)}
                        >
                          + 添加表达式
                        </Button>
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                          {col.expressions.map((exp) => (
                            <div key={exp.id} style={{ 
                              border: '1px solid #d9d9d9',
                              borderRadius: '4px',
                              padding: '12px',
                              backgroundColor: '#fff'
                            }}>
                              <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start', marginBottom: '8px' }}>
                                <Select
                                  value={exp.operator}
                                  onChange={(value) => handleUpdateExpression(col.name, exp.id, 'operator', value)}
                                  style={{ width: 120 }}
                                  size="small"
                                >
                                  <Option value="等于">等于</Option>
                                  <Option value="不等于">不等于</Option>
                                  <Option value="大于">大于</Option>
                                  <Option value="大于等于">大于等于</Option>
                                  <Option value="小于">小于</Option>
                                  <Option value="小于等于">小于等于</Option>
                                  <Option value="包含">包含</Option>
                                  <Option value="模糊匹配">模糊匹配</Option>
                                </Select>

                                {exp.operator !== '包含' && (
                                  <Input
                                    size="small"
                                    value={exp.value}
                                    onChange={(e) => handleUpdateExpression(col.name, exp.id, 'value', e.target.value)}
                                    placeholder={exp.operator === '模糊匹配' ? "例如: '%科技公司'" : '输入值...'}
                                    style={{ flex: 1 }}
                                  />
                                )}

                                <Button
                                  size="small"
                                  onClick={() => handleAddExpression(col.name)}
                                  icon={<span>+</span>}
                                  title="添加表达式"
                                />
                                <Button
                                  size="small"
                                  danger
                                  onClick={() => handleRemoveExpression(col.name, exp.id)}
                                  title="删除"
                                >
                                  ×
                                </Button>
                              </div>

                              {/* 包含操作符的多值输入 */}
                              {exp.operator === '包含' && (
                                <div style={{ marginTop: '8px' }}>
                                  {exp.values.map((val, valIndex) => (
                                    <div key={valIndex} style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                                      <Input
                                        size="small"
                                        value={val}
                                        onChange={(e) => handleUpdateExpressionValue(col.name, exp.id, valIndex, e.target.value)}
                                        placeholder="输入值..."
                                        style={{ flex: 1 }}
                                      />
                                      <Button
                                        size="small"
                                        danger
                                        onClick={() => handleRemoveExpressionValue(col.name, exp.id, valIndex)}
                                      >
                                        删除
                                      </Button>
                                    </div>
                                  ))}
                                  <Button 
                                    size="small" 
                                    onClick={() => handleAddValueToExpression(col.name, exp.id)}
                                    style={{ marginTop: '4px' }}
                                  >
                                    + 添加值
                                  </Button>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* 样例数据 */}
                    <div style={{ fontSize: '12px', color: '#666' }}>
                      {col.sampleData.map((data, idx) => (
                        <div key={idx} style={{ marginBottom: '4px' }}>{data}</div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* 底部说明 */}
            <div style={{ 
              marginTop: '16px',
              padding: '12px',
              backgroundColor: '#f5f5f5',
              borderRadius: '4px',
              fontSize: '13px',
              color: '#666'
            }}>
              <div style={{ fontWeight: 600, marginBottom: '8px' }}>行权限表达式规则：</div>
              <ul style={{ margin: 0, paddingLeft: '20px' }}>
                <li>支持为每一列设置多个行权限表达式</li>
                <li>表达式条件分类：
                  <ul style={{ marginTop: '4px', paddingLeft: '20px' }}>
                    <li>精确匹配：等于、不等于（支持多值，支持且/或关系）</li>
                  </ul>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default DataPermissionConfig;

