import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import './PageStyle.css';
import './DataCenter.css';

const DataCenter = () => {
  const [showUploadModal, setShowUploadModal] = useState(false); // 控制上传弹窗显示
  const [uploadTab, setUploadTab] = useState('local'); // 'local' 或 'online'
  const [uploadedFile, setUploadedFile] = useState(null);
  const [fields, setFields] = useState([]); // 初始为空，上传文件后根据表头生成
  const [announcementTab, setAnnouncementTab] = useState('annual'); // 公告类型标签
  const [searchResults, setSearchResults] = useState([]); // 搜索结果
  const [showFileNameModal, setShowFileNameModal] = useState(false); // 控制文件名输入弹窗
  const [selectedDoc, setSelectedDoc] = useState(null); // 当前选中的文档
  const [inputFileName, setInputFileName] = useState(''); // 用户输入的文件名
  const [isFileNameValid, setIsFileNameValid] = useState(true); // 文件名是否合法
  const [savedTables, setSavedTables] = useState([
    {
      id: 1,
      name: '2024年财务报告.pdf',
      description: '2024年度公司财务报告',
      objectType: 'file', // 文件类型
      fileSize: '2.5MB',
      createTime: '2025-01-15 09:00:00',
      updateTime: '2025-01-15 09:00:00'
    },
    {
      id: 2,
      name: '2023年对外披露数据.pdf',
      description: '2023年度对外披露的数据文档',
      objectType: 'file', // 文件类型
      fileSize: '1.8MB',
      createTime: '2024-12-20 10:30:00',
      updateTime: '2024-12-20 10:30:00'
    },
    { 
      id: 3, 
      name: '测试表1',
      description: '财务数据表',
      objectType: 'table', // 表类型
      fieldCount: 10,
      rowCount: 1523,
      createTime: '2025-10-20 10:30:00',
      updateTime: '2025-10-20 10:30:00',
      fields: [
        { id: 1, name: '凭证号', type: 'varchar', length: 50, unique: false, description: '会计凭证编号' },
        { id: 2, name: '会计科目', type: 'varchar', length: 100, unique: false, description: '会计科目代码及名称' },
        { id: 3, name: '借方金额', type: 'decimal', precision: 15, scale: 2, unique: false, description: '借方发生金额' },
        { id: 4, name: '贷方金额', type: 'decimal', precision: 15, scale: 2, unique: false, description: '贷方发生金额' },
        { id: 5, name: '余额', type: 'decimal', precision: 15, scale: 2, unique: false, description: '科目余额' },
        { id: 6, name: '会计期间', type: 'varchar', length: 20, unique: false, description: '会计期间（年月）' },
        { id: 7, name: '部门', type: 'varchar', length: 50, unique: false, description: '所属部门' },
        { id: 8, name: '项目代码', type: 'varchar', length: 50, unique: false, description: '项目编码' },
        { id: 9, name: '制单人', type: 'varchar', length: 50, unique: false, description: '凭证制单人' },
        { id: 10, name: '审核人', type: 'varchar', length: 50, unique: false, description: '凭证审核人' }
      ]
    },
    { 
      id: 4, 
      name: '测试表2',
      description: '销售数据表',
      objectType: 'table', // 表类型
      fieldCount: 10,
      rowCount: 8942,
      createTime: '2025-10-21 14:20:00',
      updateTime: '2025-10-21 14:20:00',
      fields: [
        { id: 1, name: '订单编号', type: 'varchar', length: 50, unique: true, description: '订单唯一标识' },
        { id: 2, name: '客户名称', type: 'varchar', length: 100, unique: false, description: '客户公司名称' },
        { id: 3, name: '产品名称', type: 'varchar', length: 100, unique: false, description: '销售产品名称' },
        { id: 4, name: '销售数量', type: 'int', unique: false, description: '销售产品数量' },
        { id: 5, name: '单价', type: 'decimal', precision: 10, scale: 2, unique: false, description: '产品单价' },
        { id: 6, name: '总金额', type: 'decimal', precision: 15, scale: 2, unique: false, description: '订单总金额' },
        { id: 7, name: '销售日期', type: 'datetime', datetimePrecision: 0, unique: false, description: '订单销售日期' },
        { id: 8, name: '销售员', type: 'varchar', length: 50, unique: false, description: '负责销售员姓名' },
        { id: 9, name: '订单状态', type: 'varchar', length: 20, unique: false, description: '订单当前状态' },
        { id: 10, name: '客户区域', type: 'varchar', length: 50, unique: false, description: '客户所属区域' }
      ]
    }
  ]);
  const [importMode, setImportMode] = useState('new'); // 'new' 或 'existing'
  const [selectedTableId, setSelectedTableId] = useState(null);
  const [conflictStrategy, setConflictStrategy] = useState('fail'); // 'fail', 'skip', 'overwrite'
  const [tableName, setTableName] = useState(''); // 表名
  const [tableDescription, setTableDescription] = useState(''); // 表描述
  const [viewingTableId, setViewingTableId] = useState(null); // 当前查看详情的表ID
  const [searchKeyword, setSearchKeyword] = useState(''); // 搜索关键词
  const [currentPage, setCurrentPage] = useState(1); // 当前页码
  const [pageSize] = useState(10); // 每页显示条数
  const [detailTab, setDetailTab] = useState('fields'); // 表详情tab: 'fields' 或 'data'

  // 获取要显示的字段列表（根据导入模式决定）
  const getDisplayFields = () => {
    if (importMode === 'existing' && selectedTableId) {
      // 导入到已有表时，显示已有表的字段结构
      const selectedTable = savedTables.find(table => table.id === selectedTableId);
      return selectedTable?.fields || [];
    }
    // 新建表时，显示上传文件解析的字段
    return fields;
  };

  // 处理文件上传
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const fileExtension = file.name.split('.').pop().toLowerCase();
      if (fileExtension === 'xlsx' || fileExtension === 'xls') {
        // 检查文件大小（200MB = 200 * 1024 * 1024 字节）
        if (file.size > 200 * 1024 * 1024) {
          alert('文件大小超过200MB限制，请选择较小的文件');
          return;
        }
        setUploadedFile(file);
        // 解析文件表头并生成字段配置
        parseFileHeaders(file);
        // 初始化表名（使用文件名去除扩展名）
        const defaultTableName = file.name.replace(/\.(xlsx|xls)$/, '');
        setTableName(defaultTableName);
        setTableDescription('');
      } else {
        alert('请上传 xlsx 或 xls 格式的文件');
      }
    }
  };

  // 解析文件表头（默认第一行为表头）
  const parseFileHeaders = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        // 读取文件数据
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        
        // 获取第一个工作表
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        
        // 将工作表转换为二维数组
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        
        // 获取第一行作为表头
        if (jsonData && jsonData.length > 0) {
          const headers = jsonData[0];
          
          // 过滤掉空值并转换为字段配置
          const parsedFields = headers
            .filter(header => header !== null && header !== undefined && header !== '')
            .map((header, index) => ({
              id: index + 1,
              name: String(header).trim(),
              type: 'varchar',
              length: 255,
              precision: 10,
              scale: 2,
              datetimePrecision: 0,
              unique: false,
              description: ''
            }));
          
          if (parsedFields.length === 0) {
            alert('文件第一行没有找到有效的表头数据');
            return;
          }
          
          setFields(parsedFields);
        } else {
          alert('文件内容为空，请上传包含数据的文件');
        }
      } catch (error) {
        console.error('文件解析失败:', error);
        alert('文件解析失败，请确保文件格式正确');
      }
    };
    
    reader.readAsArrayBuffer(file);
  };

  // 删除已上传的文件
  const handleRemoveFile = () => {
    setUploadedFile(null);
    setFields([]); // 清空字段配置
    setImportMode('new'); // 重置为新建表模式
    setSelectedTableId(null); // 清空选择的表
    setConflictStrategy('fail'); // 重置冲突策略
    setTableName(''); // 清空表名
    setTableDescription(''); // 清空表描述
  };

  // 更新字段
  const handleUpdateField = (id, key, value) => {
    setFields(fields.map(field => {
      if (field.id === id) {
        const updatedField = { ...field, [key]: value };
        // 如果修改类型为文本或日期，自动取消唯一性
        if (key === 'type' && (value === 'varchar' || value === 'datetime')) {
          updatedField.unique = false;
        }
        return updatedField;
      }
      return field;
    }));
  };

  // 保存表结构
  const handleSaveTable = () => {
    if (!uploadedFile) {
      alert('请先上传文件');
      return;
    }
    if (!tableName.trim()) {
      alert('请填写表名');
      return;
    }
    const hasEmptyNames = fields.some(field => !field.name.trim());
    if (hasEmptyNames) {
      alert('请填写所有字段名称');
      return;
    }
    // 这里添加保存表结构的逻辑
    const now = new Date().toLocaleString('zh-CN');
    const newTable = {
      id: savedTables.length + 1,
      name: tableName.trim(),
      description: tableDescription.trim(),
      objectType: 'table', // 表类型
      fieldCount: fields.length,
      rowCount: 0, // 新建表初始行数为0
      createTime: now,
      updateTime: now,
      fields: fields
    };
    setSavedTables([...savedTables, newTable]);
    alert('表结构保存成功');
    // 关闭弹窗
    setShowUploadModal(false);
    // 清空上传状态
    handleRemoveFile();
  };

  // 清空表数据
  const handleClearTable = (id) => {
    if (window.confirm('确定要清空该表的数据吗？')) {
      // 更新表的最近更新时间
      setSavedTables(savedTables.map(table => 
        table.id === id 
          ? { ...table, updateTime: new Date().toLocaleString('zh-CN') }
          : table
      ));
      alert('表数据已清空');
    }
  };

  // 删除表
  const handleDeleteTable = (id) => {
    if (window.confirm('确定要删除这个表吗？')) {
      setSavedTables(savedTables.filter(table => table.id !== id));
    }
  };

  // 预览文件
  const handlePreviewFile = (id) => {
    const file = savedTables.find(item => item.id === id && item.objectType === 'file');
    if (file) {
      alert(`预览文件：${file.name}\n此功能待实现`);
    }
  };

  // 删除文件
  const handleDeleteFile = (id) => {
    if (window.confirm('确定要删除这个文件吗？')) {
      setSavedTables(savedTables.filter(item => item.id !== id));
    }
  };

  // 查看表详情
  const handleViewTable = (id) => {
    setViewingTableId(id);
    setCurrentPage(1); // 重置页码
    setDetailTab('fields'); // 重置为字段列表tab
  };

  // 返回表列表
  const handleBackToList = () => {
    setViewingTableId(null);
  };

  // 获取字段类型显示文本
  const getFieldTypeDisplay = (field) => {
    switch (field.type) {
      case 'varchar':
        return '文本';
      case 'int':
        return '整数';
      case 'text':
        return '文本';
      case 'decimal':
        return '小数';
      case 'datetime':
        return '日期';
      default:
        return field.type;
    }
  };

  // 获取大小显示
  const getSizeDisplay = (item) => {
    if (item.objectType === 'file') {
      return item.fileSize || '-';
    } else if (item.objectType === 'table') {
      // 对于表，估算大小（这里简单估算，实际项目中应该从后端获取）
      const estimatedSize = (item.rowCount * item.fieldCount * 0.001).toFixed(2); // 简单估算
      return `${estimatedSize}MB`;
    }
    return '-';
  };

  // 根据搜索关键词过滤表列表
  const getFilteredTables = () => {
    if (!searchKeyword.trim()) {
      return savedTables;
    }
    return savedTables.filter(table => 
      table.name.toLowerCase().includes(searchKeyword.toLowerCase())
    );
  };

  // 生成表数据（模拟）
  const generateSampleData = (table, count = 100) => {
    const data = [];
    for (let i = 1; i <= count; i++) {
      const row = { _id: i };
      table.fields.forEach(field => {
        switch (field.type) {
          case 'int':
            row[field.name] = Math.floor(Math.random() * 10000);
            break;
          case 'varchar':
          case 'text':
            row[field.name] = `示例数据${i}`;
            break;
          case 'decimal':
            row[field.name] = (Math.random() * 10000).toFixed(2);
            break;
          case 'datetime':
            const date = new Date(2025, 0, 1);
            date.setDate(date.getDate() + i);
            row[field.name] = date.toISOString().slice(0, 19).replace('T', ' ');
            break;
          default:
            row[field.name] = `数据${i}`;
        }
      });
      data.push(row);
    }
    return data;
  };

  // 获取当前页的数据
  const getCurrentPageData = (table) => {
    const allData = generateSampleData(table, 100);
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return allData.slice(startIndex, endIndex);
  };

  // 计算总页数
  const getTotalPages = () => {
    return Math.ceil(100 / pageSize);
  };

  // 根据公告类型获取资讯数据
  const getAnnouncementData = (type) => {
    const dataMap = {
      annual: [
        { id: 1, datetime: '2025-04-03', content: '金盘科技：2024年年度报告' },
        { id: 2, datetime: '2024-03-21', content: '金盘科技：2023年年度报告' },
        { id: 3, datetime: '2023-03-21', content: '金盘科技：2022年年度报告' },
        { id: 4, datetime: '2022-04-16', content: '金盘科技：2021年年度报告' },
      ],
      interim: [
        { id: 1, datetime: '2025-08-15', content: '金盘科技：2025年中期报告' },
        { id: 2, datetime: '2024-08-20', content: '金盘科技：2024年中期报告' },
      ],
      q1: [
        { id: 1, datetime: '2025-04-28', content: '金盘科技：2025年第一季度报告' },
        { id: 2, datetime: '2024-04-25', content: '金盘科技：2024年第一季度报告' },
      ],
      q3: [
        { id: 1, datetime: '2025-10-28 00:56', content: '金盘科技(688676.SH)发布前三季度业绩，归母净利润4.86亿元，同比增长20.27%' },
        { id: 2, datetime: '2025-10-27 18:51', content: '金盘科技前三季度营收51.94亿元同比增8.25%，归母净利润4.86亿元同比增20.27%，销售费用同比增长23.63%' },
        { id: 3, datetime: '2025-10-27 18:23', content: '金盘科技公布三季报 前三季净利增加20.27%' },
        { id: 4, datetime: '2025-10-27 18:22', content: '图解金盘科技三季报：第三季度单季净利润同比增长21.71%' },
      ]
    };
    return dataMap[type] || [];
  };

  // 验证文件名是否合法（只允许中文、英文字母、数字、短横线、下划线）
  const validateFileName = (name) => {
    if (!name.trim()) {
      return false;
    }
    // 正则表达式：只允许中文、英文字母、数字、短横线、下划线
    const validPattern = /^[\u4e00-\u9fa5A-Za-z0-9_-]+$/;
    return validPattern.test(name);
  };

  // 处理文件名输入变化
  const handleFileNameChange = (value) => {
    setInputFileName(value);
    setIsFileNameValid(validateFileName(value));
  };

  // 打开文件名输入弹窗
  const handleImportOnlineDoc = (item) => {
    // 设置默认文件名（过滤掉不合法字符）
    let defaultFileName = item.content.length > 30 
      ? item.content.substring(0, 30) 
      : item.content;
    
    // 替换不合法字符为下划线
    defaultFileName = defaultFileName.replace(/[^\u4e00-\u9fa5A-Za-z0-9_-]/g, '_');
    
    setSelectedDoc(item);
    setInputFileName(defaultFileName);
    setIsFileNameValid(validateFileName(defaultFileName));
    setShowFileNameModal(true);
  };

  // 确认导入文档
  const handleConfirmImport = () => {
    // 检查文件名是否为空
    if (!inputFileName.trim()) {
      alert('文件名不能为空！');
      return;
    }

    // 检查文件名是否合法
    if (!isFileNameValid) {
      alert('文件名包含非法字符！\n只允许使用：中文、英文字母、数字、短横线(-)、下划线(_)');
      return;
    }
    
    const now = new Date().toLocaleString('zh-CN');
    const newFile = {
      id: savedTables.length + 1,
      name: `${inputFileName.trim()}.pdf`,
      description: selectedDoc.content,
      objectType: 'file',
      fileSize: '2.1MB',
      createTime: now,
      updateTime: now
    };
    setSavedTables([...savedTables, newFile]);
    
    // 关闭弹窗并重置状态
    setShowFileNameModal(false);
    setSelectedDoc(null);
    setInputFileName('');
    setIsFileNameValid(true);
    
    alert(`已成功导入文档到文件列表！\n文件名：${inputFileName.trim()}.pdf`);
  };

  // 取消导入
  const handleCancelImport = () => {
    setShowFileNameModal(false);
    setSelectedDoc(null);
    setInputFileName('');
    setIsFileNameValid(true);
  };

  // 关闭弹窗时重置状态
  const handleCloseModal = () => {
    setShowUploadModal(false);
    setUploadTab('local');
    setAnnouncementTab('annual');
    setSearchResults([]);
  };

  // 获取标签显示名称
  const getTabLabel = (type) => {
    const labels = {
      annual: '年度报告',
      interim: '中期报告',
      q1: '一季度报告',
      q3: '三季度报告'
    };
    return labels[type] || type;
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="header-left">
          {viewingTableId && (
            <button className="back-icon-btn" onClick={handleBackToList}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                <path d="M11 1L4 8l7 7" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          )}
          <h2>{viewingTableId ? '表详情' : '数据中心'}</h2>
        </div>
      </div>
      <div className="page-content">
        {/* 表列表和详情 */}
        {!viewingTableId ? (
          <>
            {/* 搜索栏 */}
            <div className="table-search-bar">
              <input
                type="text"
                className="search-input"
                placeholder="搜索文件名/表名..."
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
              />
              {searchKeyword && (
                <button className="clear-search-btn" onClick={() => setSearchKeyword('')}>
                  ✕
                </button>
              )}
            </div>

            {/* 表列表 */}
            {getFilteredTables().length === 0 ? (
              <div className="empty-state">
                {searchKeyword ? '未找到匹配的表' : '暂无数据表'}
              </div>
            ) : (
              <div className="table-list-container">
                <div className="table-list-header">
                  <div className="list-col-name">文件名/表名</div>
                  <div className="list-col-type">对象类型</div>
                  <div className="list-col-desc">描述</div>
                  <div className="list-col-size">大小</div>
                  <div className="list-col-time">创建时间</div>
                  <div className="list-col-time">最近更新时间</div>
                  <div className="list-col-actions">操作</div>
                </div>
                {getFilteredTables().map((item) => (
                  <div key={item.id} className="table-list-row">
                    <div className="list-col-name">
                      <span style={{ cursor: 'default', color: '#333' }}>
                        {item.name}
                      </span>
                    </div>
                    <div className="list-col-type">
                      <span className={`type-badge ${item.objectType === 'file' ? 'type-file' : 'type-table'}`}>
                        {item.objectType === 'file' ? '文件' : '表'}
                      </span>
                    </div>
                    <div className="list-col-desc">{item.description || '-'}</div>
                    <div className="list-col-size">{getSizeDisplay(item)}</div>
                    <div className="list-col-time">{item.createTime}</div>
                    <div className="list-col-time">{item.updateTime}</div>
                    <div className="list-col-actions">
                      {item.objectType === 'table' && (
                        <>
                          <button 
                            className="list-action-btn"
                            onClick={() => handleViewTable(item.id)}
                            title="预览"
                          >
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                              <path d="M8 3C4.5 3 1.5 5.5 0 8c1.5 2.5 4.5 5 8 5s6.5-2.5 8-5c-1.5-2.5-4.5-5-8-5zm0 8.5c-1.93 0-3.5-1.57-3.5-3.5S6.07 4.5 8 4.5s3.5 1.57 3.5 3.5S9.93 11.5 8 11.5z"/>
                              <circle cx="8" cy="8" r="2"/>
                            </svg>
                          </button>
                          <button 
                            className="list-action-btn"
                            onClick={() => handleClearTable(item.id)}
                            title="清空数据"
                          >
                            <svg width="16" height="16" viewBox="0 0 1024 1024" fill="currentColor">
                              <path d="M899.1 869.6l-53-305.6H864c14.4 0 26-11.6 26-26V346c0-14.4-11.6-26-26-26H618V138c0-14.4-11.6-26-26-26H432c-14.4 0-26 11.6-26 26v182H160c-14.4 0-26 11.6-26 26v192c0 14.4 11.6 26 26 26h17.9l-53 305.6c-0.3 1.5-0.4 3-0.4 4.4 0 14.4 11.6 26 26 26h723c1.5 0 3-0.1 4.4-0.4 14.2-2.4 23.7-15.9 21.2-30zM204 390h272V182h72v208h272v104H204V390z m468 440V674c0-4.4-3.6-8-8-8h-48c-4.4 0-8 3.6-8 8v156H416V674c0-4.4-3.6-8-8-8h-48c-4.4 0-8 3.6-8 8v156H202.8l45.1-260H776l45.1 260H672z"/>
                            </svg>
                          </button>
                          <button 
                            className="list-action-btn"
                            onClick={() => handleDeleteTable(item.id)}
                            title="删除表"
                          >
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                              <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"/>
                              <path fillRule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4L4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"/>
                            </svg>
                          </button>
                        </>
                      )}
                      {item.objectType === 'file' && (
                        <>
                          <button 
                            className="list-action-btn"
                            onClick={() => handlePreviewFile(item.id)}
                            title="预览"
                          >
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                              <path d="M8 3C4.5 3 1.5 5.5 0 8c1.5 2.5 4.5 5 8 5s6.5-2.5 8-5c-1.5-2.5-4.5-5-8-5zm0 8.5c-1.93 0-3.5-1.57-3.5-3.5S6.07 4.5 8 4.5s3.5 1.57 3.5 3.5S9.93 11.5 8 11.5z"/>
                              <circle cx="8" cy="8" r="2"/>
                            </svg>
                          </button>
                          <button 
                            className="list-action-btn"
                            onClick={() => handleDeleteFile(item.id)}
                            title="删除文件"
                          >
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                              <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"/>
                              <path fillRule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4L4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"/>
                            </svg>
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        ) : (
          /* 表详情 */
          (() => {
            const table = savedTables.find(t => t.id === viewingTableId);
            if (!table) return null;
            
            return (
              <div className="table-detail-section">
                <div className="detail-header">
                  <div className="detail-title">
                    <h3>{table.name}</h3>
                    <p className="detail-description">{table.description || '暂无描述'}</p>
                  </div>
                </div>

                <div className="detail-stats">
                  <div className="stat-item">
                    <span className="stat-label">表行数：</span>
                    <span className="stat-value">{table.rowCount}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">表列数：</span>
                    <span className="stat-value">{table.fieldCount}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">创建时间：</span>
                    <span className="stat-value">{table.createTime}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">更新时间：</span>
                    <span className="stat-value">{table.updateTime}</span>
                  </div>
                </div>

                {/* Tab切换 */}
                <div className="detail-tabs">
                  <button 
                    className={`detail-tab-button ${detailTab === 'fields' ? 'active' : ''}`}
                    onClick={() => setDetailTab('fields')}
                  >
                    字段信息
                  </button>
                  <button 
                    className={`detail-tab-button ${detailTab === 'data' ? 'active' : ''}`}
                    onClick={() => setDetailTab('data')}
                  >
                    表数据
                  </button>
                </div>

                {/* 字段列表 */}
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
                        {table.fields.map((field) => (
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

                {/* 表数据 */}
                {detailTab === 'data' && (
                  <div className="detail-sample-data">
                    <div className="sample-data-table-wrapper">
                      <table className="sample-data-table">
                        <thead>
                          <tr>
                            <th>序号</th>
                            {table.fields.map((field) => (
                              <th key={field.id}>{field.name}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {getCurrentPageData(table).map((row) => (
                            <tr key={row._id}>
                              <td>{row._id}</td>
                              {table.fields.map((field) => (
                                <td key={field.id}>{row[field.name]}</td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <div className="pagination">
                      <button 
                        className="page-btn"
                        onClick={() => setCurrentPage(1)}
                        disabled={currentPage === 1}
                      >
                        首页
                      </button>
                      <button 
                        className="page-btn"
                        onClick={() => setCurrentPage(currentPage - 1)}
                        disabled={currentPage === 1}
                      >
                        上一页
                      </button>
                      <span className="page-info">
                        第 {currentPage} / {getTotalPages()} 页
                      </span>
                      <button 
                        className="page-btn"
                        onClick={() => setCurrentPage(currentPage + 1)}
                        disabled={currentPage === getTotalPages()}
                      >
                        下一页
                      </button>
                      <button 
                        className="page-btn"
                        onClick={() => setCurrentPage(getTotalPages())}
                        disabled={currentPage === getTotalPages()}
                      >
                        末页
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })()
        )}

        {/* 上传弹窗 */}
        {showUploadModal && (
          <div className="modal-overlay" onClick={handleCloseModal}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3>导入数据</h3>
                <button className="modal-close-btn" onClick={handleCloseModal}>✕</button>
              </div>
              <div className="modal-body">
                {/* Tab切换 */}
                <div className="upload-tabs">
                  <button 
                    className={`upload-tab-btn ${uploadTab === 'local' ? 'active' : ''}`}
                    onClick={() => setUploadTab('local')}
                  >
                    上传本地文件
                  </button>
                  <button 
                    className={`upload-tab-btn ${uploadTab === 'online' ? 'active' : ''}`}
                    onClick={() => setUploadTab('online')}
                  >
                    网站公告
                  </button>
                </div>

                {/* 上传本地文件内容 */}
                {uploadTab === 'local' && (
                  <div className="upload-section">
                    {/* 上传文件 */}
                    <div className="section-title">上传文件</div>
                  <div className="upload-area">
                    {!uploadedFile ? (
                      <label className="upload-label">
                        <input 
                          type="file" 
                          accept=".xlsx,.xls"
                          onChange={handleFileUpload}
                          style={{ display: 'none' }}
                        />
                        <div className="upload-placeholder">
                          <div className="upload-icon excel-icon">
                            <svg viewBox="0 0 48 48" width="48" height="48">
                              {/* 文档背景 */}
                              <path d="M8 2h24l8 8v34a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z" fill="#E8E8E8"/>
                              {/* 文档折角 */}
                              <path d="M32 2v6a2 2 0 0 0 2 2h6z" fill="#D0D0D0"/>
                              {/* Excel 绿色标识 */}
                              <rect x="24" y="24" width="18" height="18" rx="2" fill="#1D6F42"/>
                              {/* X 字母 */}
                              <text x="33" y="37" fontSize="12" fontWeight="bold" fill="#fff" textAnchor="middle">X</text>
                              {/* 表格线条 */}
                              <line x1="27" y1="28" x2="39" y2="28" stroke="#fff" strokeWidth="0.5" opacity="0.6"/>
                              <line x1="27" y1="31" x2="39" y2="31" stroke="#fff" strokeWidth="0.5" opacity="0.6"/>
                              <line x1="27" y1="34" x2="39" y2="34" stroke="#fff" strokeWidth="0.5" opacity="0.6"/>
                              <line x1="30" y1="25" x2="30" y2="41" stroke="#fff" strokeWidth="0.5" opacity="0.6"/>
                              <line x1="36" y1="25" x2="36" y2="41" stroke="#fff" strokeWidth="0.5" opacity="0.6"/>
                            </svg>
                          </div>
                          <div>点击上传或拖拽文件到这里</div>
                          <div className="upload-hint">
                            支持上传单个不超过200MB的xlsx/xls格式文件
                          </div>
                        </div>
                      </label>
                    ) : (
                      <div className="uploaded-file">
                        <div className="file-icon excel-icon">
                          <svg viewBox="0 0 48 48" width="40" height="40">
                            {/* 文档背景 */}
                            <path d="M8 2h24l8 8v34a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z" fill="#E8E8E8"/>
                            {/* 文档折角 */}
                            <path d="M32 2v6a2 2 0 0 0 2 2h6z" fill="#D0D0D0"/>
                            {/* Excel 绿色标识 */}
                            <rect x="24" y="24" width="18" height="18" rx="2" fill="#1D6F42"/>
                            {/* X 字母 */}
                            <text x="33" y="37" fontSize="12" fontWeight="bold" fill="#fff" textAnchor="middle">X</text>
                            {/* 表格线条 */}
                            <line x1="27" y1="28" x2="39" y2="28" stroke="#fff" strokeWidth="0.5" opacity="0.6"/>
                            <line x1="27" y1="31" x2="39" y2="31" stroke="#fff" strokeWidth="0.5" opacity="0.6"/>
                            <line x1="30" y1="26" x2="30" y2="32" stroke="#fff" strokeWidth="0.5" opacity="0.6"/>
                            <line x1="36" y1="26" x2="36" y2="32" stroke="#fff" strokeWidth="0.5" opacity="0.6"/>
                          </svg>
                        </div>
                        <span className="file-name">{uploadedFile.name}</span>
                        <button className="remove-file-btn" onClick={handleRemoveFile}>✕</button>
                        <span className="file-check">✓</span>
                      </div>
                    )}
                  </div>

                  {/* 导入方式选择 - 始终显示 */}
                  <div className="section-title">导入方式</div>
                  <div className="import-mode-selector">
                    <label className="mode-option">
                      <input
                        type="radio"
                        value="new"
                        checked={importMode === 'new'}
                        onChange={(e) => setImportMode(e.target.value)}
                      />
                      <span>新建表</span>
                    </label>
                    <label className="mode-option">
                      <input
                        type="radio"
                        value="existing"
                        checked={importMode === 'existing'}
                        onChange={(e) => setImportMode(e.target.value)}
                      />
                      <span>导入到已有表</span>
                    </label>
                  </div>

                  {/* 新建表配置 */}
                  {importMode === 'new' && (
                    <div className="table-config-section">
                      <div className="config-row">
                        <label className="config-label">
                          <span className="required">*</span>表名：
                        </label>
                        <input
                          type="text"
                          className="config-input"
                          value={tableName}
                          onChange={(e) => setTableName(e.target.value)}
                          placeholder="请输入表名"
                          disabled={!uploadedFile}
                        />
                      </div>
                      <div className="config-row">
                        <label className="config-label">表描述：</label>
                        <input
                          type="text"
                          className="config-input"
                          value={tableDescription}
                          onChange={(e) => setTableDescription(e.target.value)}
                          placeholder="请输入表描述（可选）"
                          disabled={!uploadedFile}
                        />
                      </div>
                    </div>
                  )}

                  {/* 选择已有表 */}
                  {importMode === 'existing' && (
                    <>
                      <div className="existing-table-selector">
                        <label>
                          选择目标表：
                          <span 
                            className="info-tip-icon"
                            data-tooltip='默认导入模式为"追加"。若需覆盖现有表数据，请先在表列表中清空该表的数据，再重新导入。'
                          >
                            <svg 
                              width="16" 
                              height="16" 
                              viewBox="0 0 16 16" 
                              fill="none" 
                              stroke="currentColor" 
                              strokeWidth="1.5"
                            >
                              <circle cx="8" cy="8" r="7"/>
                              <line x1="8" y1="7" x2="8" y2="11" strokeLinecap="round"/>
                              <circle cx="8" cy="4.5" r="0.5" fill="currentColor"/>
                            </svg>
                          </span>
                        </label>
                        <select
                          className="table-select"
                          value={selectedTableId || ''}
                          onChange={(e) => setSelectedTableId(parseInt(e.target.value))}
                        >
                          <option value="">请选择表</option>
                          {savedTables.filter(item => item.objectType === 'table').map((table) => (
                            <option key={table.id} value={table.id}>
                              {table.name} ({table.fieldCount}个字段)
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* 唯一字段冲突处理 */}
                      <div className="conflict-strategy-selector">
                        <label className="strategy-label">唯一字段冲突处理</label>
                        <div className="strategy-options">
                          <label className="strategy-option">
                            <input
                              type="radio"
                              value="fail"
                              checked={conflictStrategy === 'fail'}
                              onChange={(e) => setConflictStrategy(e.target.value)}
                            />
                            <span>全部导入取消</span>
                          </label>
                          <label className="strategy-option">
                            <input
                              type="radio"
                              value="skip"
                              checked={conflictStrategy === 'skip'}
                              onChange={(e) => setConflictStrategy(e.target.value)}
                            />
                            <span>跳过冲突行</span>
                          </label>
                          <label className="strategy-option">
                            <input
                              type="radio"
                              value="overwrite"
                              checked={conflictStrategy === 'overwrite'}
                              onChange={(e) => setConflictStrategy(e.target.value)}
                            />
                            <span>覆盖冲突行</span>
                          </label>
                        </div>
                      </div>
                    </>
                  )}

                  {/* 表结构定义 - 始终显示 */}
                  <div className="section-title">表结构</div>

                  {/* 字段配置表格 - 始终显示表头 */}
                  <div className="fields-table">
                    <div className="table-header">
                      <div className="col-drag"></div>
                      <div className="col-name"><span className="required">*</span> 字段名称</div>
                      <div className="col-type-wrapper"><span className="required">*</span> 字段类型</div>
                      <div className="col-unique">是否唯一</div>
                      <div className="col-description">字段描述</div>
                    </div>
                    {/* 根据模式显示字段行 */}
                    {getDisplayFields().map((field) => (
                      <div key={field.id} className="table-row">
                        <div className="col-drag">☰</div>
                        <div className="col-name">
                          <input
                            type="text"
                            value={field.name}
                            readOnly
                            placeholder="请输入"
                          />
                        </div>
                        <div className="col-type-wrapper">
                          <div className="type-inputs">
                            <select
                              className="type-select"
                              value={field.type}
                              onChange={(e) => handleUpdateField(field.id, 'type', e.target.value)}
                              disabled={importMode === 'existing'}
                            >
                              <option value="varchar">文本</option>
                              <option value="int">整数</option>
                              <option value="decimal">小数</option>
                              <option value="datetime">日期</option>
                            </select>
                          </div>
                        </div>
                        <div className="col-unique">
                          <input
                            type="checkbox"
                            checked={(field.type !== 'varchar' && field.type !== 'datetime') && (field.unique || false)}
                            onChange={(e) => handleUpdateField(field.id, 'unique', e.target.checked)}
                            disabled={importMode === 'existing' || field.type === 'varchar' || field.type === 'datetime'}
                          />
                        </div>
                        <div className="col-description">
                          <input
                            type="text"
                            value={field.description || ''}
                            onChange={(e) => handleUpdateField(field.id, 'description', e.target.value)}
                            placeholder={importMode === 'existing' ? '' : '请输入'}
                            disabled={importMode === 'existing'}
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* 操作按钮 */}
                  {((importMode === 'new' && uploadedFile && fields.length > 0) || 
                    (importMode === 'existing' && selectedTableId && uploadedFile)) && (
                    <div className="action-buttons">
                      {importMode === 'new' && (
                        <button className="save-btn" onClick={handleSaveTable}>保存表结构</button>
                      )}
                      {importMode === 'existing' && (
                        <button className="save-btn" onClick={() => alert(`导入到表ID: ${selectedTableId}, 冲突策略: ${conflictStrategy}`)}>导入数据</button>
                      )}
                    </div>
                  )}
                  </div>
                )}

                {/* 网站公告内容 */}
                {uploadTab === 'online' && (
                  <div className="announcement-section">
                    <div className="announcement-header">
                      <h4>资讯与公告</h4>
                    </div>
                    
                    {/* 公告类型标签导航 */}
                    <div className="announcement-tabs">
                      {['annual', 'interim', 'q1', 'q3'].map((type) => (
                        <button
                          key={type}
                          className={`announcement-tab-btn ${announcementTab === type ? 'active' : ''}`}
                          onClick={() => setAnnouncementTab(type)}
                        >
                          {getTabLabel(type)}
                        </button>
                      ))}
                    </div>

                    {/* 资讯列表 */}
                    <div className="announcement-content">
                      <div className="announcement-title">
                        {getTabLabel(announcementTab)}相关资讯：
                      </div>
                      <div className="announcement-list">
                        {getAnnouncementData(announcementTab).map((item) => (
                          <div 
                            key={item.id} 
                            className="announcement-item"
                          >
                            <span className="announcement-datetime">{item.datetime}</span>
                            <span className="announcement-text">{item.content}</span>
                            <button 
                              className="import-doc-btn"
                              onClick={() => handleImportOnlineDoc(item)}
                              title="导入此文件"
                            >
                              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                                <path d="M8.5 1.5v9m-3-3l3 3 3-3M2 13h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                              </svg>
                              导入
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* 文件名输入弹窗 */}
        {showFileNameModal && (
          <div className="modal-overlay" onClick={handleCancelImport}>
            <div className="filename-modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="filename-modal-header">
                <h3>输入文件名</h3>
                <button className="modal-close-btn" onClick={handleCancelImport}>✕</button>
              </div>
              <div className="filename-modal-body">
                <div className="filename-input-group">
                  <label className="filename-label">文件名：</label>
                  <input
                    type="text"
                    className={`filename-input ${!isFileNameValid ? 'invalid' : ''}`}
                    value={inputFileName}
                    onChange={(e) => handleFileNameChange(e.target.value)}
                    placeholder="请输入文件名"
                    autoFocus
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && isFileNameValid) {
                        handleConfirmImport();
                      }
                    }}
                  />
                  <span className="filename-suffix">.pdf</span>
                </div>
                {!isFileNameValid && (
                  <div className="filename-error">
                    文件名包含非法字符！只允许使用：中文、英文字母、数字、短横线(-)、下划线(_)
                  </div>
                )}
                <div className="filename-hint">提示：文件名会自动添加 .pdf 后缀</div>
              </div>
              <div className="filename-modal-footer">
                <button className="cancel-import-btn" onClick={handleCancelImport}>
                  取消
                </button>
                <button 
                  className="confirm-import-btn" 
                  onClick={handleConfirmImport}
                  disabled={!isFileNameValid || !inputFileName.trim()}
                >
                  确认导入
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DataCenter;
