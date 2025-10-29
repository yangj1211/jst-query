import React, { useState } from 'react';
import { Table, Input, Button, Modal, Select, Checkbox } from 'antd';
import { SearchOutlined, SettingOutlined } from '@ant-design/icons';
import './PageStyle.css';

const { Option } = Select;

const RolePermission = () => {
  const [searchText, setSearchText] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [currentRole, setCurrentRole] = useState(null);
  const [objectType, setObjectType] = useState('表');
  const [objectName, setObjectName] = useState(null);
  const [selectedPermissions, setSelectedPermissions] = useState([]);
  
  // 行列权限配置相关状态
  const [isRowColumnModalVisible, setIsRowColumnModalVisible] = useState(false);
  const [columnConfigs, setColumnConfigs] = useState([]); // 列配置，包含是否选中和行权限表达式

  // 权限选项
  const permissionOptions = [
    { value: 'DT8', label: 'DT8 - 表查询', hasConfig: true },
    { value: 'DT9', label: 'DT9 - 表写入' },
    { value: 'DT10', label: 'DT10 - 表更新' },
  ];

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

  // 根据对象类别获取对象名称选项
  const getObjectNameOptions = (type) => {
    const typeMap = {
      '表': 'table',
      '文件': 'file',
    };
    return dataCenterObjects
      .filter(obj => obj.objectType === typeMap[type])
      .map(obj => obj.name);
  };

  // 模拟角色数据
  const mockData = [
    {
      key: '1',
      roleId: '10001',
      roleName: '开发者',
      status: '正常',
      createTime: '09/19/2025 2:05:21 PM',
      updateTime: '09/19/2025 2:05:21 PM',
      remark: '-',
    },
    {
      key: '2',
      roleId: '1',
      roleName: '超级管理员',
      status: '正常',
      createTime: '07/05/2025 7:01:24 PM',
      updateTime: '07/05/2025 7:01:24 PM',
      remark: '超级管理员',
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
      render: (status) => (
        <span style={{ 
          display: 'inline-block',
          padding: '2px 12px',
          backgroundColor: '#f6ffed',
          color: '#52c41a',
          borderRadius: '4px',
          fontSize: '14px'
        }}>
          {status}
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
      render: (_, record) => (
        <Button 
          type="link" 
          onClick={() => handleConfigPermission(record)}
          style={{ padding: 0 }}
        >
          配置数据权限
        </Button>
      ),
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

    const filtered = mockData.filter(
      (item) =>
        item.roleName.toLowerCase().includes(value.toLowerCase()) ||
        item.remark.toLowerCase().includes(value.toLowerCase())
    );
    setDataSource(filtered);
  };

  // 配置数据权限处理
  const handleConfigPermission = (record) => {
    console.log('配置数据权限:', record);
    setCurrentRole(record);
    setIsModalVisible(true);
    // 重置表单
    setObjectType('表');
    setObjectName(null);
    setSelectedPermissions([]);
  };

  // 关闭弹窗
  const handleModalClose = () => {
    setIsModalVisible(false);
    setCurrentRole(null);
    setObjectType('表');
    setObjectName(null);
    setSelectedPermissions([]);
  };

  // 保存权限配置
  const handleSavePermission = () => {
    console.log('保存权限配置:', {
      role: currentRole,
      objectType,
      objectName,
      permissions: selectedPermissions,
    });
    // TODO: 调用API保存权限配置
    handleModalClose();
  };

  // 全选/取消全选
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedPermissions(permissionOptions.map(opt => opt.value));
    } else {
      setSelectedPermissions([]);
    }
  };

  // 单个权限选择
  const handlePermissionChange = (value) => {
    const newSelected = selectedPermissions.includes(value)
      ? selectedPermissions.filter(v => v !== value)
      : [...selectedPermissions, value];
    setSelectedPermissions(newSelected);
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

  // 配置行列权限
  const handleConfigColumnPermission = () => {
    console.log('配置行列权限');
    if (!objectName) {
      alert('请先选择对象名称');
      return;
    }
    // 获取当前表的列并初始化配置
    const columns = getTableColumns(objectName);
    const initialConfigs = columns.map(col => ({
      ...col,
      selected: false, // 默认不选中
      expressions: [], // 行权限表达式
    }));
    setColumnConfigs(initialConfigs);
    setIsRowColumnModalVisible(true);
  };

  // 关闭行列权限配置弹窗
  const handleRowColumnModalClose = () => {
    setIsRowColumnModalVisible(false);
  };

  // 保存行列权限配置
  const handleSaveRowColumnPermission = () => {
    const selectedConfigs = columnConfigs.filter(col => col.selected);
    console.log('保存行列权限配置:', selectedConfigs);
    // TODO: 调用API保存行列权限配置
    setIsRowColumnModalVisible(false);
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

      {/* 配置数据权限弹窗 */}
      <Modal
        title={`配置数据权限 - ${currentRole?.roleName || ''}`}
        open={isModalVisible}
        onOk={handleSavePermission}
        onCancel={handleModalClose}
        width={600}
        okText="保存"
        cancelText="取消"
      >
        <div style={{ padding: '20px 0' }}>
          {/* 对象类别 */}
          <div style={{ marginBottom: '24px' }}>
            <div style={{ marginBottom: '8px' }}>
              <span style={{ color: '#ff4d4f', marginRight: '4px' }}>*</span>
              <span style={{ fontWeight: 500 }}>对象类别</span>
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
          <div style={{ marginBottom: '24px' }}>
            <div style={{ marginBottom: '8px' }}>
              <span style={{ color: '#ff4d4f', marginRight: '4px' }}>*</span>
              <span style={{ fontWeight: 500 }}>对象名称</span>
            </div>
            <Select
              value={objectName}
              onChange={setObjectName}
              style={{ width: '100%' }}
              placeholder="请选择对象名称"
            >
              {getObjectNameOptions(objectType).map(name => (
                <Option key={name} value={name}>{name}</Option>
              ))}
            </Select>
          </div>

          {/* 对象权限 */}
          <div>
            <div style={{ marginBottom: '12px', fontWeight: 500 }}>
              对象权限
            </div>
            <div>
              {/* 全选 */}
              <div style={{ marginBottom: '12px' }}>
                <Checkbox
                  checked={selectedPermissions.length === permissionOptions.length}
                  indeterminate={selectedPermissions.length > 0 && selectedPermissions.length < permissionOptions.length}
                  onChange={handleSelectAll}
                >
                  <span style={{ fontWeight: 500 }}>
                    全选 已选择 ({selectedPermissions.length})
                  </span>
                </Checkbox>
              </div>

              {/* 权限列表 */}
              <div style={{ 
                paddingLeft: '24px',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px'
              }}>
                {permissionOptions.map(option => (
                  <div key={option.value} style={{ display: 'flex', alignItems: 'center' }}>
                    <Checkbox
                      checked={selectedPermissions.includes(option.value)}
                      onChange={() => handlePermissionChange(option.value)}
                    >
                      {option.label}
                    </Checkbox>
                    {option.hasConfig && selectedPermissions.includes(option.value) && (
                      <Button
                        type="link"
                        size="small"
                        icon={<SettingOutlined />}
                        onClick={handleConfigColumnPermission}
                        style={{ marginLeft: '8px' }}
                      >
                        行列权限
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </Modal>

      {/* 行列权限配置弹窗 */}
      <Modal
        title={`行列权限设置 - ${objectName || ''}`}
        open={isRowColumnModalVisible}
        onOk={handleSaveRowColumnPermission}
        onCancel={handleRowColumnModalClose}
        width={1200}
        okText="确定"
        cancelText="取消"
        bodyStyle={{ maxHeight: '70vh', overflow: 'auto' }}
      >
        <div style={{ padding: '8px 0' }}>
          <div style={{ 
            color: '#666', 
            fontSize: '14px', 
            marginBottom: '24px',
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
                gridTemplateColumns: '60px 200px 1fr 200px',
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
                    gridTemplateColumns: '60px 200px 1fr 200px',
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
              marginTop: '24px',
              padding: '16px',
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

export default RolePermission;

