import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Input, Select, Checkbox, Form, message, Modal } from 'antd';
import { ArrowLeftOutlined, SettingOutlined } from '@ant-design/icons';
import './PageStyle.css';

const { Option } = Select;
const { TextArea } = Input;

const CreateRole = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [objectName, setObjectName] = useState([]);
  const [selectedPermissions, setSelectedPermissions] = useState([]);
  const [objectPermissions, setObjectPermissions] = useState([]);

  // 行列权限配置相关状态
  const [isRowColumnModalVisible, setIsRowColumnModalVisible] = useState(false);
  const [currentEditingObject, setCurrentEditingObject] = useState(null);
  const [columnConfigs, setColumnConfigs] = useState([]);

  // 表权限选项
  const tablePermissionOptions = [
    { value: 'DT8', label: '表查询', hasConfig: true },
  ];

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

  // 获取表的列信息（从 DataPermissionConfig 复制）
  const getTableColumns = (tableName) => {
    const tableColumnsMap = {
      '测试表1': [
        { name: '科目代码', type: 'varchar(50)', description: '会计科目代码', sampleData: ['1001', '1002', '2001'] },
        { name: '科目名称', type: 'varchar(100)', description: '会计科目名称', sampleData: ['库存现金', '银行存款', '应付账款'] },
        { name: '借方金额', type: 'decimal(15,2)', description: '借方发生金额', sampleData: ['10000.00', '50000.00', '0.00'] },
        { name: '贷方金额', type: 'decimal(15,2)', description: '贷方发生金额', sampleData: ['0.00', '25000.00', '15000.00'] },
        { name: '余额', type: 'decimal(15,2)', description: '科目余额', sampleData: ['500000.00', '750000.00', '1000000.00'] },
      ],
      '测试表2': [
        { name: '订单编号', type: 'varchar(50)', description: '订单唯一标识', sampleData: ['ORD-2025-001', 'ORD-2025-002', 'ORD-2025-003'] },
        { name: '客户名称', type: 'varchar(100)', description: '客户公司名称', sampleData: ['北京科技有限公司', '上海贸易有限公司', '深圳电子股份有限公司'] },
        { name: '产品名称', type: 'varchar(100)', description: '销售产品名称', sampleData: ['办公软件授权', '企业管理系统', '数据分析平台'] },
        { name: '销售数量', type: 'int', description: '销售产品数量', sampleData: ['10', '50', '100'] },
        { name: '单价', type: 'decimal(10,2)', description: '产品单价', sampleData: ['2999.00', '4999.00', '9999.00'] },
        { name: '总金额', type: 'decimal(15,2)', description: '订单总金额', sampleData: ['29990.00', '249950.00', '999900.00'] },
        { name: '销售日期', type: 'datetime', description: '订单销售日期', sampleData: ['2025-01-15 10:00:00', '2025-02-20 14:30:00', '2025-03-10 09:15:00'] },
        { name: '销售员', type: 'varchar(50)', description: '负责销售员姓名', sampleData: ['张销售', '李销售', '王销售'] },
        { name: '订单状态', type: 'varchar(20)', description: '订单当前状态', sampleData: ['已确认', '已发货', '已完成'] },
        { name: '客户区域', type: 'varchar(50)', description: '客户所属区域', sampleData: ['华北', '华东', '华南'] },
      ],
      '测试表3': [
        { name: '员工编号', type: 'varchar(50)', description: '员工唯一标识', sampleData: ['EMP-001', 'EMP-002', 'EMP-003'] },
        { name: '员工姓名', type: 'varchar(50)', description: '员工姓名', sampleData: ['张明', '李华', '王芳'] },
        { name: '部门', type: 'varchar(50)', description: '所属部门', sampleData: ['技术部', '市场部', '人事部'] },
        { name: '职位', type: 'varchar(50)', description: '职位名称', sampleData: ['高级工程师', '市场经理', '人事专员'] },
        { name: '入职日期', type: 'date', description: '入职日期', sampleData: ['2020-03-15', '2021-06-20', '2022-09-10'] },
        { name: '薪资', type: 'decimal(10,2)', description: '月薪', sampleData: ['15000.00', '12000.00', '10000.00'] },
      ],
      '测试表4': [
        { name: '商品编号', type: 'varchar(50)', description: '商品唯一标识', sampleData: ['PROD-001', 'PROD-002', 'PROD-003'] },
        { name: '商品名称', type: 'varchar(100)', description: '商品名称', sampleData: ['笔记本电脑', '智能手机', '平板电脑'] },
        { name: '商品类别', type: 'varchar(50)', description: '商品分类', sampleData: ['电子产品', '办公用品', '数码配件'] },
        { name: '库存数量', type: 'int', description: '当前库存数量', sampleData: ['500', '300', '200'] },
        { name: '单价', type: 'decimal(10,2)', description: '商品单价', sampleData: ['5999.00', '3999.00', '2999.00'] },
        { name: '仓库位置', type: 'varchar(50)', description: '仓库位置', sampleData: ['A区-001', 'B区-002', 'C区-003'] },
      ],
      '测试表5': [
        { name: '客户编号', type: 'varchar(50)', description: '客户唯一标识', sampleData: ['CUST-001', 'CUST-002', 'CUST-003'] },
        { name: '客户名称', type: 'varchar(100)', description: '客户公司名称', sampleData: ['北京科技发展有限公司', '上海贸易集团', '深圳创新科技有限公司'] },
        { name: '联系人', type: 'varchar(50)', description: '联系人姓名', sampleData: ['王总', '李经理', '张主任'] },
        { name: '联系电话', type: 'varchar(50)', description: '联系电话', sampleData: ['010-12345678', '021-87654321', '0755-11223344'] },
        { name: '邮箱', type: 'varchar(100)', description: '电子邮箱', sampleData: ['wang@example.com', 'li@example.com', 'zhang@example.com'] },
        { name: '客户等级', type: 'varchar(20)', description: '客户等级', sampleData: ['VIP', '普通', '金牌'] },
      ],
      '测试表6': [
        { name: '供应商编号', type: 'varchar(50)', description: '供应商唯一标识', sampleData: ['SUPP-001', 'SUPP-002', 'SUPP-003'] },
        { name: '供应商名称', type: 'varchar(100)', description: '供应商公司名称', sampleData: ['XX制造有限公司', 'YY材料股份有限公司', 'ZZ配件科技有限公司'] },
        { name: '联系人', type: 'varchar(50)', description: '联系人姓名', sampleData: ['陈经理', '刘总', '周主任'] },
        { name: '联系电话', type: 'varchar(50)', description: '联系电话', sampleData: ['020-12345678', '027-87654321', '028-11223344'] },
        { name: '邮箱', type: 'varchar(100)', description: '电子邮箱', sampleData: ['chen@example.com', 'liu@example.com', 'zhou@example.com'] },
        { name: '供应类别', type: 'varchar(50)', description: '供应产品类别', sampleData: ['原材料', '零部件', '成品'] },
      ],
      '测试表7': [
        { name: '产品编号', type: 'varchar(50)', description: '产品唯一标识', sampleData: ['PRD-001', 'PRD-002', 'PRD-003'] },
        { name: '产品名称', type: 'varchar(100)', description: '产品名称', sampleData: ['智能办公系统', '数据分析平台', '云存储服务'] },
        { name: '产品类别', type: 'varchar(50)', description: '产品分类', sampleData: ['软件产品', '硬件产品', '服务产品'] },
        { name: '规格型号', type: 'varchar(100)', description: '产品规格型号', sampleData: ['标准版', '专业版', '企业版'] },
        { name: '单价', type: 'decimal(10,2)', description: '产品单价', sampleData: ['9999.00', '19999.00', '29999.00'] },
        { name: '单位', type: 'varchar(20)', description: '计量单位', sampleData: ['套', '台', '年'] },
      ],
      '测试表8': [
        { name: '项目编号', type: 'varchar(50)', description: '项目唯一标识', sampleData: ['PRJ-001', 'PRJ-002', 'PRJ-003'] },
        { name: '项目名称', type: 'varchar(100)', description: '项目名称', sampleData: ['企业管理系统升级', '移动端应用开发', '数据分析平台建设'] },
        { name: '项目类型', type: 'varchar(50)', description: '项目类型', sampleData: ['软件开发', '系统集成', '咨询服务'] },
        { name: '项目经理', type: 'varchar(50)', description: '项目经理姓名', sampleData: ['张经理', '李经理', '王经理'] },
        { name: '开始日期', type: 'date', description: '项目开始日期', sampleData: ['2025-01-01', '2025-02-01', '2025-03-01'] },
        { name: '结束日期', type: 'date', description: '项目结束日期', sampleData: ['2025-06-30', '2025-08-31', '2025-12-31'] },
      ],
      '测试表9': [
        { name: '员工ID', type: 'varchar(50)', description: '员工唯一标识', sampleData: ['E001', 'E002', 'E003'] },
        { name: '姓名', type: 'varchar(50)', description: '员工姓名', sampleData: ['赵明', '钱华', '孙芳'] },
        { name: '工号', type: 'varchar(50)', description: '员工工号', sampleData: ['GH001', 'GH002', 'GH003'] },
        { name: '部门', type: 'varchar(50)', description: '所属部门', sampleData: ['研发部', '运营部', '财务部'] },
        { name: '职位', type: 'varchar(50)', description: '职位名称', sampleData: ['软件工程师', '运营专员', '财务分析师'] },
        { name: '入职日期', type: 'date', description: '入职日期', sampleData: ['2021-03-15', '2022-06-20', '2023-09-10'] },
      ],
      '测试表10': [
        { name: '合同编号', type: 'varchar(50)', description: '合同唯一标识', sampleData: ['CON-2025-001', 'CON-2025-002', 'CON-2025-003'] },
        { name: '合同名称', type: 'varchar(100)', description: '合同名称', sampleData: ['软件服务合同', '设备采购合同', '技术服务合同'] },
        { name: '合同类型', type: 'varchar(50)', description: '合同类型', sampleData: ['销售合同', '采购合同', '服务合同'] },
        { name: '甲方', type: 'varchar(100)', description: '甲方公司名称', sampleData: ['我司名称', '我司名称', '我司名称'] },
        { name: '乙方', type: 'varchar(100)', description: '乙方公司名称', sampleData: ['客户A公司', '供应商B公司', '客户C公司'] },
        { name: '合同金额', type: 'decimal(15,2)', description: '合同总金额（元）', sampleData: ['1000000.00', '500000.00', '2000000.00'] },
      ],
    };
    return tableColumnsMap[tableName] || [];
  };

  // 获取表对象名称选项（过滤掉已添加的对象）
  const getObjectNameOptions = () => {
    const addedObjectNames = objectPermissions.map(obj => obj.objectName);
    return dataCenterObjects
      .filter(obj => obj.objectType === 'table')
      .filter(obj => !addedObjectNames.includes(obj.name))
      .map(obj => obj.name);
  };

  // 处理全选表对象
  const handleSelectAllObjects = (checked) => {
    const availableOptions = getObjectNameOptions();
    if (checked) {
      setObjectName(availableOptions);
      setSelectedPermissions(['DT8']);
    } else {
      setObjectName([]);
      setSelectedPermissions([]);
    }
  };

  // 返回到角色权限列表
  const handleBack = () => {
    navigate('/permission/role-permission');
  };

  // 添加对象权限
  const handleAddObjectPermission = () => {
    if (!objectName || objectName.length === 0) {
      message.warning('请选择表对象');
      return;
    }

    const permissions = [...selectedPermissions];
    const addedObjectNames = objectPermissions.map(obj => obj.objectName);
    
    const newObjectPermissions = objectName
      .filter(name => !addedObjectNames.includes(name))
      .map(name => ({
        id: Date.now() + Math.random(),
        objectType: '表',
        objectName: name,
        permissions: [...permissions],
        columnConfigs: [],
      }));

    if (newObjectPermissions.length === 0) {
      message.warning('所选对象已全部添加，请勿重复添加');
      return;
    }

    setObjectPermissions([...objectPermissions, ...newObjectPermissions]);
    setObjectName([]);
    setSelectedPermissions([]);
  };

  // 删除对象权限
  const handleRemoveObjectPermission = (id) => {
    setObjectPermissions(objectPermissions.filter(obj => obj.id !== id));
  };

  // 配置行列权限（从已添加的对象列表编辑）
  const handleConfigColumnPermissionFromList = (objectPermission) => {
    setCurrentEditingObject(objectPermission);
    
    // 获取当前表的列并初始化配置
    const columns = getTableColumns(objectPermission.objectName);
    
    // 如果已有配置则使用已有的，否则初始化
    if (objectPermission.columnConfigs && objectPermission.columnConfigs.length > 0) {
      const configsWithRelation = objectPermission.columnConfigs.map(config => ({
        ...config,
        relation: config.relation || '或'
      }));
      setColumnConfigs(configsWithRelation);
    } else {
      const initialConfigs = columns.map(col => ({
        ...col,
        selected: true,
        expressions: [],
        relation: '或',
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
      setObjectPermissions(objectPermissions.map(obj => 
        obj.id === currentEditingObject.id 
          ? { ...obj, columnConfigs: columnConfigs }
          : obj
      ));
    }
    setIsRowColumnModalVisible(false);
    setCurrentEditingObject(null);
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

  // 获取允许的运算符列表
  const getAllowedOperators = (columnName, excludeExpressionId = null) => {
    const column = columnConfigs.find(col => col.name === columnName);
    if (!column) return [];

    if (!column.relation || column.relation === '或' || !column.expressions || column.expressions.length === 0) {
      return ['等于', '不等于', '大于', '大于等于', '小于', '小于等于', '包含', '模糊匹配'];
    }

    const existingOperators = column.expressions
      .filter(exp => exp.id !== excludeExpressionId)
      .map(exp => exp.operator);
    
    if (existingOperators.length === 0) {
      return ['等于', '不等于', '大于', '大于等于', '小于', '小于等于', '包含', '模糊匹配'];
    }

    const firstOperator = existingOperators[0];
    const allowedOperatorsMap = {
      '等于': [],
      '不等于': ['不等于', '大于', '大于等于', '小于', '小于等于'],
      '大于': ['小于', '小于等于'],
      '大于等于': ['小于', '小于等于'],
      '小于': ['大于', '大于等于'],
      '小于等于': ['大于', '大于等于'],
      '包含': ['不等于'],
      '模糊匹配': [],
    };

    return allowedOperatorsMap[firstOperator] || [];
  };

  // 检查是否可以添加新表达式
  const canAddExpression = (columnName) => {
    const column = columnConfigs.find(col => col.name === columnName);
    if (!column || !column.expressions || column.expressions.length === 0) {
      return true;
    }
    if (!column.relation || column.relation === '或') {
      return true;
    }
    const allowedOperators = getAllowedOperators(columnName);
    return allowedOperators.length > 0;
  };

  // 为某一列添加表达式
  const handleAddExpression = (columnName) => {
    const allowedOperators = getAllowedOperators(columnName);
    if (allowedOperators.length === 0) {
      message.warning('根据当前已选择的运算符，不能再添加新的表达式');
      return;
    }

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
              values: [],
            }
          ]
        };
      }
      return col;
    }));
  };

  // 更新字段的表达式关系
  const handleUpdateColumnRelation = (columnName, relation) => {
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

  // 保存角色
  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      
      if (!values.roleName || !values.roleName.trim()) {
        message.error('请输入角色名');
        return;
      }

      // 构建角色数据
      const roleData = {
        roleName: values.roleName.trim(),
        remark: values.remark || '',
        objectPermissions: objectPermissions,
      };

      console.log('保存角色数据:', roleData);
      
      // TODO: 调用后端API保存角色
      // await saveRole(roleData);
      
      message.success('角色创建成功');
      navigate('/permission/role-permission');
    } catch (error) {
      console.error('表单验证失败:', error);
    }
  };

  // 取消创建
  const handleCancel = () => {
    navigate('/permission/role-permission');
  };

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
          <h2 style={{ margin: 0 }}>新建角色</h2>
        </div>
      </div>
      <div className="page-content" style={{ padding: '24px' }}>
        <Form
          form={form}
          layout="vertical"
          style={{ maxWidth: '1200px' }}
        >
          {/* 角色基本信息 */}
          <div style={{ 
            marginBottom: '32px',
            padding: '24px',
            backgroundColor: '#fafafa',
            borderRadius: '4px'
          }}>
            <h3 style={{ marginBottom: '24px', fontSize: '16px', fontWeight: 600 }}>基本信息</h3>
            
            <Form.Item
              label="角色名"
              name="roleName"
              rules={[
                { required: true, message: '请输入角色名' },
                { max: 50, message: '角色名不能超过50个字符' }
              ]}
            >
              <Input 
                placeholder="请输入角色名" 
                style={{ maxWidth: '400px' }}
              />
            </Form.Item>

            <Form.Item
              label="角色备注"
              name="remark"
              rules={[
                { max: 200, message: '备注不能超过200个字符' }
              ]}
            >
              <TextArea 
                placeholder="请输入角色备注" 
                rows={4}
                style={{ maxWidth: '600px' }}
                showCount
                maxLength={200}
              />
            </Form.Item>
          </div>

          {/* 权限配置 */}
          <div style={{ marginBottom: '32px' }}>
            <h3 style={{ marginBottom: '16px', fontSize: '16px', fontWeight: 600 }}>权限配置</h3>
            
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
                    mode="multiple"
                    value={objectName}
                    onChange={(value) => {
                      setObjectName(value);
                      setSelectedPermissions(['DT8']);
                    }}
                    style={{ width: '100%' }}
                    placeholder="请选择表对象"
                    maxTagCount="responsive"
                    dropdownRender={(menu) => {
                      const availableOptions = getObjectNameOptions();
                      const allSelected = availableOptions.length > 0 && 
                        availableOptions.every(name => objectName.includes(name));
                      const someSelected = objectName.length > 0 && !allSelected;
                      
                      return (
                        <div>
                          <div style={{ 
                            padding: '8px 12px',
                            borderBottom: '1px solid #e8e8e8',
                            backgroundColor: '#fafafa'
                          }}>
                            <Checkbox
                              checked={allSelected}
                              indeterminate={someSelected}
                              onChange={(e) => handleSelectAllObjects(e.target.checked)}
                            >
                              <span style={{ fontWeight: 500 }}>全选</span>
                            </Checkbox>
                          </div>
                          {menu}
                        </div>
                      );
                    }}
                  >
                    {getObjectNameOptions().map(name => (
                      <Option key={name} value={name}>{name}</Option>
                    ))}
                  </Select>
                </div>

                <Button type="primary" onClick={handleAddObjectPermission}>
                  添加
                </Button>
              </div>
            </div>

            {/* 已配置对象列表 */}
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
                          <Button
                            size="small"
                            icon={<SettingOutlined />}
                            onClick={() => handleConfigColumnPermissionFromList(obj)}
                          >
                            配置行列权限
                          </Button>
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
          </div>

          {/* 操作按钮 */}
          <div style={{ 
            display: 'flex', 
            justifyContent: 'flex-end', 
            gap: '12px',
            paddingTop: '24px',
            borderTop: '1px solid #e8e8e8'
          }}>
            <Button onClick={handleCancel}>
              取消
            </Button>
            <Button type="primary" onClick={handleSave}>
              保存
            </Button>
          </div>
        </Form>
      </div>

      {/* 行列权限配置弹窗 */}
      <Modal
        title={`行列权限设置 - ${currentEditingObject?.objectName || ''}`}
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
                                    const allowedOperators = getAllowedOperators(col.name, exp.id);
                                    if (!allowedOperators.includes(value) && allowedOperators.length > 0) {
                                      message.warning(`根据当前已选择的运算符，不能使用"${value}"运算符`);
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

export default CreateRole;
