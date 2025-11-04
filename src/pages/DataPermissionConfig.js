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

  const [objectName, setObjectName] = useState(null);
  const [selectedPermissions, setSelectedPermissions] = useState([]);
  
  // 数据权限配置相关状态
  const [objectPermissions, setObjectPermissions] = useState([]); // 对象权限列表
  
  // 编辑对象弹窗相关状态
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editingObject, setEditingObject] = useState(null);
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

  // 模拟从数据中心获取对象列表（与数据中心的数据保持一致，只包含表）
  const dataCenterObjects = [
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

  // 获取表对象名称选项（过滤掉已添加的对象）
  const getObjectNameOptions = () => {
    // 获取已添加的对象名称
    const addedObjectNames = objectPermissions.map(obj => obj.objectName);
    
    return dataCenterObjects
      .filter(obj => obj.objectType === 'table')
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
      alert('请选择表对象');
      return;
    }
    
    // 检查是否已经添加过这个对象
    if (objectPermissions.some(obj => obj.objectName === objectName)) {
      alert('该对象已添加，请勿重复添加');
      return;
    }

    const isAdmin = currentRole?.roleName === '管理员' || currentRole?.roleId === '2';
    
    // 确定权限
    let permissions = [];
    if (isAdmin) {
      // 管理员默认拥有所有权限
      permissions = tablePermissionOptions.map(opt => opt.value);
    } else {
      // 普通用户使用已选择的权限（表类型已自动设置为DT8）
      permissions = [...selectedPermissions];
    }

    const newObjectPermission = {
      id: Date.now(),
      objectType: '表',
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
    setEditObjectName(objectPermission.objectName);
    setEditSelectedPermissions(objectPermission.permissions);
    setEditTempColumnConfigs(objectPermission.columnConfigs || []);
    setIsEditModalVisible(true);
  };

  // 关闭编辑弹窗
  const handleEditModalClose = () => {
    setIsEditModalVisible(false);
    setEditingObject(null);
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
      permissions = tablePermissionOptions.map(opt => opt.value);
    } else {
      // 普通用户使用已选择的权限（表类型已自动设置为DT8）
      permissions = [...editSelectedPermissions];
    }

    // 更新对象权限列表
    setObjectPermissions(objectPermissions.map(obj => 
      obj.id === editingObject.id 
        ? {
            ...obj,
            objectType: '表',
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
      '测试表1': [ // 财务表
        { 
          name: '凭证号', 
          type: 'varchar(50)', 
          description: '会计凭证编号',
          sampleData: ['VCH-2025-001', 'VCH-2025-002', 'VCH-2025-003']
        },
        { 
          name: '会计科目', 
          type: 'varchar(100)', 
          description: '会计科目代码及名称',
          sampleData: ['1001-库存现金', '1002-银行存款', '2001-应付账款']
        },
        { 
          name: '借方金额', 
          type: 'decimal(15,2)', 
          description: '借方发生金额',
          sampleData: ['10000.00', '50000.00', '0.00']
        },
        { 
          name: '贷方金额', 
          type: 'decimal(15,2)', 
          description: '贷方发生金额',
          sampleData: ['0.00', '25000.00', '15000.00']
        },
        { 
          name: '余额', 
          type: 'decimal(15,2)', 
          description: '科目余额',
          sampleData: ['500000.00', '750000.00', '1000000.00']
        },
        { 
          name: '会计期间', 
          type: 'varchar(20)', 
          description: '会计期间（年月）',
          sampleData: ['2025-01', '2025-02', '2025-03']
        },
        { 
          name: '部门', 
          type: 'varchar(50)', 
          description: '所属部门',
          sampleData: ['财务部', '销售部', '研发部']
        },
        { 
          name: '项目代码', 
          type: 'varchar(50)', 
          description: '项目编码',
          sampleData: ['PRJ-001', 'PRJ-002', 'PRJ-003']
        },
        { 
          name: '制单人', 
          type: 'varchar(50)', 
          description: '凭证制单人',
          sampleData: ['张三', '李四', '王五']
        },
        { 
          name: '审核人', 
          type: 'varchar(50)', 
          description: '凭证审核人',
          sampleData: ['赵六', '钱七', '孙八']
        },
      ],
      '测试表2': [ // 销售表
        { 
          name: '订单编号', 
          type: 'varchar(50)', 
          description: '订单唯一标识',
          sampleData: ['ORD-2025-001', 'ORD-2025-002', 'ORD-2025-003']
        },
        { 
          name: '客户名称', 
          type: 'varchar(100)', 
          description: '客户公司名称',
          sampleData: ['北京科技有限公司', '上海贸易有限公司', '深圳电子股份有限公司']
        },
        { 
          name: '产品名称', 
          type: 'varchar(100)', 
          description: '销售产品名称',
          sampleData: ['办公软件授权', '企业管理系统', '数据分析平台']
        },
        { 
          name: '销售数量', 
          type: 'int', 
          description: '销售产品数量',
          sampleData: ['10', '50', '100']
        },
        { 
          name: '单价', 
          type: 'decimal(10,2)', 
          description: '产品单价',
          sampleData: ['2999.00', '4999.00', '9999.00']
        },
        { 
          name: '总金额', 
          type: 'decimal(15,2)', 
          description: '订单总金额',
          sampleData: ['29990.00', '249950.00', '999900.00']
        },
        { 
          name: '销售日期', 
          type: 'datetime', 
          description: '订单销售日期',
          sampleData: ['2025-01-15 10:00:00', '2025-02-20 14:30:00', '2025-03-10 09:15:00']
        },
        { 
          name: '销售员', 
          type: 'varchar(50)', 
          description: '负责销售员姓名',
          sampleData: ['张销售', '李销售', '王销售']
        },
        { 
          name: '订单状态', 
          type: 'varchar(20)', 
          description: '订单当前状态',
          sampleData: ['已确认', '已发货', '已完成']
        },
        { 
          name: '客户区域', 
          type: 'varchar(50)', 
          description: '客户所属区域',
          sampleData: ['华北', '华东', '华南']
        },
      ],
    };
    return tableColumnsMap[tableName] || [];
  };

  // 配置行列权限（添加前配置）
  const handleConfigColumnPermissionBeforeAdd = () => {
    if (!objectName) {
      alert('请先选择表对象');
      return;
    }
    
    console.log('配置行列权限（添加前）:', objectName);
    setCurrentEditingObject(null); // 标记为添加前配置
    setIsEditingMode(false);
    
    // 获取当前表的列并初始化配置
    const columns = getTableColumns(objectName);
    
    // 如果已有临时配置则使用，否则初始化
    if (tempColumnConfigs.length > 0) {
      // 确保每个字段都有 relation 字段（兼容旧数据）
      const configsWithRelation = tempColumnConfigs.map(config => ({
        ...config,
        relation: config.relation || '或'
      }));
      setColumnConfigs(configsWithRelation);
    } else {
      const initialConfigs = columns.map(col => ({
        ...col,
        selected: true, // 默认全选
        expressions: [], // 行权限表达式
        relation: '或', // 字段内表达式关系：'且' 或 '或'，对应 SQL 的 AND 和 OR
      }));
      setColumnConfigs(initialConfigs);
    }
    
    setIsRowColumnModalVisible(true);
  };

  // 配置行列权限（编辑模式下的配置）
  const handleConfigColumnPermissionInEditMode = () => {
    if (!editObjectName) {
      alert('请先选择表对象');
      return;
    }
    
    console.log('配置行列权限（编辑模式）:', editObjectName);
    setCurrentEditingObject(null);
    setIsEditingMode(true);
    
    // 获取当前表的列并初始化配置
    const columns = getTableColumns(editObjectName);
    
    // 如果已有临时配置则使用，否则初始化
    if (editTempColumnConfigs.length > 0) {
      // 确保每个字段都有 relation 字段（兼容旧数据）
      const configsWithRelation = editTempColumnConfigs.map(config => ({
        ...config,
        relation: config.relation || '或'
      }));
      setColumnConfigs(configsWithRelation);
    } else {
      const initialConfigs = columns.map(col => ({
        ...col,
        selected: true, // 默认全选
        expressions: [], // 行权限表达式
        relation: '或', // 字段内表达式关系：'且' 或 '或'，对应 SQL 的 AND 和 OR
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
      // 确保每个字段都有 relation 字段（兼容旧数据）
      const configsWithRelation = objectPermission.columnConfigs.map(config => ({
        ...config,
        relation: config.relation || '或'
      }));
      setColumnConfigs(configsWithRelation);
    } else {
      const initialConfigs = columns.map(col => ({
        ...col,
        selected: true, // 默认全选
        expressions: [], // 行权限表达式
        relation: '或', // 字段内表达式关系：'且' 或 '或'，对应 SQL 的 AND 和 OR
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

  // 获取字段内已选择的运算符（排除当前正在编辑的表达式）
  const getExistingOperators = (columnName, excludeExpressionId = null) => {
    const column = columnConfigs.find(col => col.name === columnName);
    if (!column || !column.expressions || column.expressions.length === 0) {
      return [];
    }
    return column.expressions
      .filter(exp => exp.id !== excludeExpressionId)
      .map(exp => exp.operator);
  };

  // 根据已选择的运算符和字段关系，获取允许添加的运算符列表
  const getAllowedOperators = (columnName, excludeExpressionId = null) => {
    const column = columnConfigs.find(col => col.name === columnName);
    if (!column) return [];

    // 如果字段关系为"或"，或者没有表达式，允许所有运算符
    if (!column.relation || column.relation === '或' || !column.expressions || column.expressions.length === 0) {
      return ['等于', '不等于', '大于', '大于等于', '小于', '小于等于', '包含', '模糊匹配'];
    }

    // 字段关系为"且"时，需要根据已有运算符限制
    const existingOperators = getExistingOperators(columnName, excludeExpressionId);
    
    if (existingOperators.length === 0) {
      // 如果没有已有表达式，允许所有运算符
      return ['等于', '不等于', '大于', '大于等于', '小于', '小于等于', '包含', '模糊匹配'];
    }

    // 获取第一个已有表达式的运算符（作为限制标准）
    const firstOperator = existingOperators[0];

    // 根据规则确定允许的运算符
    const allowedOperatorsMap = {
      '等于': [], // 等于：不允许再添加任何表达式
      '不等于': ['不等于', '大于', '大于等于', '小于', '小于等于'], // 不等于：允许继续添加"≠"和范围操作符
      '大于': ['小于', '小于等于'], // 大于：可添加"小于/小于等于"形成区间
      '大于等于': ['小于', '小于等于'], // 大于等于：可添加"小于/小于等于"形成区间
      '小于': ['大于', '大于等于'], // 小于：可添加"大于/大于等于"形成区间
      '小于等于': ['大于', '大于等于'], // 小于等于：可添加"大于/大于等于"形成区间
      '包含': ['不等于'], // 包含：可添加"≠"以排除子集
      '模糊匹配': [], // 模糊匹配：禁止添加其他
    };

    return allowedOperatorsMap[firstOperator] || [];
  };

  // 获取禁止的运算符列表（用于灰显）
  const getDisabledOperators = (columnName, excludeExpressionId = null) => {
    const allOperators = ['等于', '不等于', '大于', '大于等于', '小于', '小于等于', '包含', '模糊匹配'];
    const allowedOperators = getAllowedOperators(columnName, excludeExpressionId);
    return allOperators.filter(op => !allowedOperators.includes(op));
  };

  // 检查是否可以添加新表达式
  const canAddExpression = (columnName) => {
    const column = columnConfigs.find(col => col.name === columnName);
    if (!column || !column.expressions || column.expressions.length === 0) {
      return true; // 没有表达式时，可以添加
    }

    // 如果字段关系为"或"，允许添加
    if (!column.relation || column.relation === '或') {
      return true;
    }

    // 字段关系为"且"时，检查是否允许添加
    const allowedOperators = getAllowedOperators(columnName);
    return allowedOperators.length > 0;
  };

  // 为某一列添加表达式
  const handleAddExpression = (columnName) => {
    const allowedOperators = getAllowedOperators(columnName);
    if (allowedOperators.length === 0) {
      alert('根据当前已选择的运算符，不能再添加新的表达式');
      return;
    }

    // 使用第一个允许的运算符作为默认值
    const defaultOperator = allowedOperators[0];

    setColumnConfigs(columnConfigs.map(col => {
      if (col.name === columnName) {
        return {
          ...col,
          expressions: [
            ...col.expressions,
            {
              id: Date.now(),
              operator: defaultOperator,
              value: '',
              values: [], // 用于"包含"操作符
            }
          ]
        };
      }
      return col;
    }));
  };

  // 验证表达式是否符合"且"关系规则
  const validateExpressionsForAndRelation = (columnName) => {
    const column = columnConfigs.find(col => col.name === columnName);
    if (!column || !column.expressions || column.expressions.length === 0) {
      return { valid: true, message: '' };
    }

    const expressions = column.expressions;
    
    // 如果只有一个表达式，总是符合规则
    if (expressions.length === 1) {
      return { valid: true, message: '' };
    }

    const firstOperator = expressions[0].operator;
    
    // 定义"且"关系下每个运算符允许组合的其他运算符
    const allowedOperatorsMapForAnd = {
      '等于': [], // 等于：不允许再添加任何表达式
      '不等于': ['不等于', '大于', '大于等于', '小于', '小于等于'], // 不等于：允许继续添加"≠"和范围操作符
      '大于': ['小于', '小于等于'], // 大于：可添加"小于/小于等于"形成区间
      '大于等于': ['小于', '小于等于'], // 大于等于：可添加"小于/小于等于"形成区间
      '小于': ['大于', '大于等于'], // 小于：可添加"大于/大于等于"形成区间
      '小于等于': ['大于', '大于等于'], // 小于等于：可添加"大于/大于等于"形成区间
      '包含': ['不等于'], // 包含：可添加"≠"以排除子集
      '模糊匹配': [], // 模糊匹配：禁止添加其他
    };

    const allowedOperators = allowedOperatorsMapForAnd[firstOperator] || [];
    
    // 如果第一个是"等于"或"模糊匹配"，不能有多个表达式
    if (firstOperator === '等于' || firstOperator === '模糊匹配') {
      return {
        valid: false,
        message: `当表达式关系为"且"时，"${firstOperator}"运算符只能单独使用，不能与其他表达式组合。请先删除其他表达式或改为"或"关系。`
      };
    }

    // 如果允许的运算符列表为空，说明第一个运算符不允许添加其他表达式
    if (allowedOperators.length === 0) {
      return {
        valid: false,
        message: `当表达式关系为"且"时，"${firstOperator}"运算符不允许与其他表达式组合。请先删除其他表达式或改为"或"关系。`
      };
    }

    // 检查除了第一个表达式外的其他表达式是否都在允许列表中
    for (let i = 1; i < expressions.length; i++) {
      const operator = expressions[i].operator;
      if (!allowedOperators.includes(operator)) {
        return {
          valid: false,
          message: `当表达式关系为"且"时，不能将"${firstOperator}"和"${operator}"运算符组合使用。请先删除或修改不符合规则的表达式，或改为"或"关系。`
        };
      }
    }

    return { valid: true, message: '' };
  };

  // 更新字段的表达式关系
  const handleUpdateColumnRelation = (columnName, relation) => {
    const column = columnConfigs.find(col => col.name === columnName);
    if (!column) return;

    // 如果切换到"且"关系，需要验证现有表达式是否符合规则
    if (relation === '且') {
      const validation = validateExpressionsForAndRelation(columnName);
      if (!validation.valid) {
        alert(validation.message);
        return; // 阻止切换
      }
    }

    // 验证通过，执行切换
    setColumnConfigs(columnConfigs.map(col => {
      if (col.name === columnName) {
        return {
          ...col,
          relation: relation
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
          <div style={{ fontWeight: 600, marginBottom: '12px' }}>添加表对象</div>
          
          <div style={{ display: 'flex', gap: '12px', marginBottom: '12px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
            <div style={{ width: '300px' }}>
              <Select
                value={objectName}
                onChange={(value) => {
                  setObjectName(value);
                  // 表类型默认选中"表查询"权限
                  setSelectedPermissions(['DT8']);
                  setTempColumnConfigs([]); // 切换对象时清空临时配置
                }}
                style={{ width: '100%' }}
                placeholder="请选择表对象"
              >
                {getObjectNameOptions().map(name => (
                  <Option key={name} value={name}>{name}</Option>
                ))}
              </Select>
            </div>

            {/* 配置行列权限按钮 */}
            <div style={{ paddingBottom: '4px' }}>
              <Button
                type="link"
                size="small"
                icon={<SettingOutlined />}
                onClick={handleConfigColumnPermissionBeforeAdd}
                disabled={!objectName}
                style={{ padding: 0 }}
              >
                配置行列权限 {tempColumnConfigs.length > 0 && '(已配置)'}
              </Button>
            </div>

            {/* 添加按钮 */}
            <Button type="primary" onClick={handleAddObjectPermission}>
              添加
            </Button>
          </div>
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
              暂无配置，请先添加表对象
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
                          backgroundColor: '#e6f7ff',
                          color: '#1890ff',
                          fontSize: '12px',
                          borderRadius: '2px'
                        }}>
                          表
                        </span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      {/* 非管理员才显示编辑按钮 */}
                      {!(currentRole?.roleName === '管理员' || currentRole?.roleId === '2') && (
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
            <div style={{ width: '300px' }}>
              <Select
                value={editObjectName}
                onChange={(value) => {
                  setEditObjectName(value);
                  setEditTempColumnConfigs([]);
                }}
                style={{ width: '100%' }}
                placeholder="请选择表对象"
                disabled
              >
                {getObjectNameOptions().map(name => (
                  <Option key={name} value={name}>{name}</Option>
                ))}
              </Select>
            </div>
          </div>

          {/* 配置行列权限按钮 */}
          <div style={{ marginBottom: '16px' }}>
            <Button
              type="link"
              size="small"
              icon={<SettingOutlined />}
              onClick={handleConfigColumnPermissionInEditMode}
              disabled={!editObjectName}
              style={{ padding: 0 }}
            >
              配置行列权限 {editTempColumnConfigs.length > 0 && '(已配置)'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* 行列权限配置弹窗 */}
      <Modal
        title={`行列权限设置 - ${currentEditingObject?.objectName || (isEditingMode ? editObjectName : objectName) || ''}`}
        open={isRowColumnModalVisible}
        onOk={handleSaveRowColumnPermission}
        onCancel={handleRowColumnModalClose}
        width={1000}
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
                gridTemplateColumns: '50px 120px 100px 400px 200px',
                backgroundColor: '#fafafa',
                borderBottom: '1px solid #e8e8e8',
                fontWeight: 600,
                padding: '12px 16px'
              }}>
                <div>选择</div>
                <div>列名</div>
                <div>表达式关系</div>
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
                    gridTemplateColumns: '50px 120px 100px 400px 200px',
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

                    {/* 表达式关系 */}
                    <div>
                      {!col.selected ? (
                        <div style={{ color: '#999', fontSize: '14px' }}>-</div>
                      ) : (
                        <div style={{ paddingTop: '12px' }}>
                          <Select
                            value={col.relation || '或'}
                            onChange={(value) => handleUpdateColumnRelation(col.name, value)}
                            style={{ width: '80px' }}
                            size="small"
                          >
                            <Option value="且">且</Option>
                            <Option value="或">或</Option>
                          </Select>
                        </div>
                      )}
                    </div>

                    {/* 行权限表达式 */}
                    <div>
                      {!col.selected ? (
                        <div style={{ color: '#999', fontSize: '14px' }}>请先选择此列</div>
                      ) : col.expressions.length === 0 ? (
                        <Button 
                          size="small" 
                          onClick={() => handleAddExpression(col.name)}
                          disabled={!canAddExpression(col.name)}
                        >
                          + 添加表达式
                        </Button>
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                          {col.expressions.map((exp) => (
                            <div key={exp.id} style={{ 
                              padding: '12px 0'
                            }}>
                              <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start', marginBottom: '8px' }}>
                                <Select
                                  value={exp.operator}
                                  onChange={(value) => {
                                    // 如果改为不允许的运算符，给出提示并阻止
                                    const allowedOperators = getAllowedOperators(col.name, exp.id);
                                    if (!allowedOperators.includes(value) && allowedOperators.length > 0) {
                                      alert(`根据当前已选择的运算符，不能使用"${value}"运算符`);
                                      return;
                                    }
                                    handleUpdateExpression(col.name, exp.id, 'operator', value);
                                  }}
                                  style={{ width: 120 }}
                                  size="small"
                                >
                                  {['等于', '不等于', '大于', '大于等于', '小于', '小于等于', '包含', '模糊匹配'].map(op => {
                                    const allowedOperators = getAllowedOperators(col.name, exp.id);
                                    const isDisabled = allowedOperators.length > 0 && !allowedOperators.includes(op);
                                    return (
                                      <Option key={op} value={op} disabled={isDisabled}>
                                        {op}
                                      </Option>
                                    );
                                  })}
                                </Select>

                                {exp.operator !== '包含' && (
                                  <Input
                                    size="small"
                                    value={exp.value}
                                    onChange={(e) => handleUpdateExpression(col.name, exp.id, 'value', e.target.value)}
                                    placeholder={exp.operator === '模糊匹配' ? "例如: '%科技公司'" : '输入值...'}
                                    style={{ width: '120px' }}
                                  />
                                )}

                                <Button
                                  size="small"
                                  onClick={() => handleAddExpression(col.name)}
                                  icon={<span>+</span>}
                                  title="添加表达式"
                                  disabled={!canAddExpression(col.name)}
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
                                        style={{ width: '120px' }}
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
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default DataPermissionConfig;

