import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import './PageStyle.css';
import './DataImport.css';

const DataImport = () => {
  const [showImportModal, setShowImportModal] = useState(false); // 控制导入弹窗
  const [mainTab, setMainTab] = useState('local'); // 'local' 或 'announcement'
  
  // 本地上传相关状态
  const [uploadedFile, setUploadedFile] = useState(null);
  const [fields, setFields] = useState([]);
  const [importMode, setImportMode] = useState('new');
  const [selectedTableId, setSelectedTableId] = useState(null);
  const [conflictStrategy, setConflictStrategy] = useState('fail');
  const [tableName, setTableName] = useState('');
  const [tableDescription, setTableDescription] = useState('');
  
  // 载入任务列表
  const [importTasks, setImportTasks] = useState([
    {
      id: 1,
      type: 'excel',
      source: '本地上传',
      objectName: '财务报表2024',
      status: 'completed',
      recordCount: 1523,
      createTime: '2025-11-01 14:30:00',
      completeTime: '2025-11-01 14:32:15',
      creator: '张三',
      errorDetail: null,
      config: {
        fileName: '财务报表2024.xlsx',
        importMode: 'new',
        tableName: '财务报表2024',
        tableDescription: '2024年度财务数据',
        conflictStrategy: 'fail'
      }
    },
    {
      id: 2,
      type: 'announcement',
      source: '上市公司公告',
      objectName: '金盘科技_2024年年度报告.pdf',
      status: 'completed',
      createTime: '2025-11-01 10:15:00',
      completeTime: '2025-11-01 10:15:23',
      creator: '李四',
      errorDetail: null,
      config: {
        companyName: '金盘科技',
        stockCode: '688676',
        announcementType: 'annual',
        fileName: '金盘科技_2024年年度报告.pdf'
      }
    },
    {
      id: 3,
      type: 'excel',
      source: '本地上传',
      objectName: '客户信息表',
      status: 'processing',
      recordCount: 856,
      createTime: '2025-11-02 09:20:00',
      completeTime: null,
      creator: '王五',
      errorDetail: null,
      config: {
        fileName: '客户信息表.xlsx',
        importMode: 'append',
        tableName: '客户信息表',
        tableDescription: '客户基础信息',
        conflictStrategy: 'update'
      }
    },
    {
      id: 4,
      type: 'announcement',
      source: '上市公司公告',
      objectName: '贵州茅台_2025年第三季度报告.pdf',
      status: 'paused',
      createTime: '2025-11-01 16:45:00',
      completeTime: null,
      creator: '赵六',
      errorDetail: null,
      config: {
        companyName: '贵州茅台',
        stockCode: '600519',
        announcementType: 'quarterly',
        fileName: '贵州茅台_2025年第三季度报告.pdf'
      }
    },
    {
      id: 5,
      type: 'excel',
      source: '本地上传',
      objectName: '供应商数据',
      status: 'failed',
      createTime: '2025-11-02 10:30:00',
      completeTime: null,
      creator: '张三',
      errorDetail: 'Error: 数据格式不符合要求 - 第15行缺少必填字段"供应商名称"；第23行"联系电话"格式错误',
      config: {
        fileName: '供应商数据.xlsx',
        importMode: 'new',
        tableName: '供应商数据',
        tableDescription: '供应商信息表',
        conflictStrategy: 'fail'
      }
    },
  ]);
  

  // 筛选条件
  const [filterSource, setFilterSource] = useState('all'); // all, local, online
  const [filterStatus, setFilterStatus] = useState('all'); // all, processing, pausing, paused, completed, failed
  
  // 任务列表分页
  const [taskPage, setTaskPage] = useState(1);
  const [taskPageSize, setTaskPageSize] = useState(10);
  
  // 公司公告相关状态
  const [searchKeyword, setSearchKeyword] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [selectedCompanyId, setSelectedCompanyId] = useState(null);
  const [announcementPage, setAnnouncementPage] = useState(1);
  const [announcementPageSize] = useState(20);
  const [announcementSearchKeyword, setAnnouncementSearchKeyword] = useState('');
  const [selectedAnnouncements, setSelectedAnnouncements] = useState([]); // 已选中的公告ID列表
  
  // 文件名输入弹窗
  const [showFileNameModal, setShowFileNameModal] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [inputFileName, setInputFileName] = useState('');
  const [inputDescription, setInputDescription] = useState('');
  const [isFileNameValid, setIsFileNameValid] = useState(true);
  
  // 模拟已保存的表数据
  const [savedTables] = useState([
    { 
      id: 3, 
      name: '测试表1',
      description: '用户信息表',
      objectType: 'table',
      fieldCount: 3,
      rowCount: 1523,
      fields: [
        { id: 1, name: '用户ID', type: 'int', unique: true, description: '主键' },
        { id: 2, name: '用户名', type: 'varchar', length: 100, unique: false, description: '' },
        { id: 3, name: '创建时间', type: 'datetime', datetimePrecision: 0, unique: false, description: '' }
      ]
    },
    { 
      id: 4, 
      name: '测试表2',
      description: '订单数据表',
      objectType: 'table',
      fieldCount: 2,
      rowCount: 8942,
      fields: [
        { id: 1, name: '订单编号', type: 'varchar', length: 50, unique: true, description: '订单唯一标识' },
        { id: 2, name: '金额', type: 'decimal', precision: 10, scale: 2, unique: false, description: '订单金额' }
      ]
    }
  ]);

  // 模拟上市公司数据
  const [companies] = useState([
    { id: 1, code: '688676', name: '金盘科技', market: '科创板', industry: '电气设备' },
    { id: 2, code: '600519', name: '贵州茅台', market: '主板', industry: '食品饮料' },
    { id: 3, code: '000858', name: '五粮液', market: '主板', industry: '食品饮料' },
    { id: 4, code: '000651', name: '格力电器', market: '主板', industry: '家用电器' },
    { id: 5, code: '601318', name: '中国平安', market: '主板', industry: '保险' },
    { id: 6, code: '600036', name: '招商银行', market: '主板', industry: '银行' },
    { id: 7, code: '000333', name: '美的集团', market: '主板', industry: '家用电器' },
    { id: 8, code: '601888', name: '中国中免', market: '主板', industry: '零售' },
    { id: 9, code: '300750', name: '宁德时代', market: '创业板', industry: '电气设备' },
    { id: 10, code: '002475', name: '立讯精密', market: '主板', industry: '电子' },
    { id: 11, code: '600887', name: '伊利股份', market: '主板', industry: '食品饮料' },
    { id: 12, code: '000568', name: '泸州老窖', market: '主板', industry: '食品饮料' },
    { id: 13, code: '600031', name: '三一重工', market: '主板', industry: '机械设备' },
    { id: 14, code: '002594', name: '比亚迪', market: '主板', industry: '汽车' },
    { id: 15, code: '600276', name: '恒瑞医药', market: '主板', industry: '医药生物' },
    { id: 16, code: '000661', name: '长春高新', market: '主板', industry: '医药生物' },
    { id: 17, code: '600309', name: '万华化学', market: '主板', industry: '化工' },
    { id: 18, code: '601012', name: '隆基绿能', market: '主板', industry: '电气设备' },
    { id: 19, code: '002129', name: '中环股份', market: '主板', industry: '电子' },
    { id: 20, code: '688981', name: '中芯国际', market: '科创板', industry: '半导体' },
    { id: 21, code: '688008', name: '澜起科技', market: '科创板', industry: '半导体' },
    { id: 22, code: '603259', name: '药明康德', market: '主板', industry: '医药生物' },
    { id: 23, code: '300760', name: '迈瑞医疗', market: '创业板', industry: '医疗器械' },
    { id: 24, code: '601128', name: '常熟银行', market: '主板', industry: '银行' },
    { id: 25, code: '600196', name: '复星医药', market: '主板', industry: '医药生物' },
  ]);

  // ========== 本地上传相关函数 ==========
  
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const fileExtension = file.name.split('.').pop().toLowerCase();
      if (fileExtension === 'xlsx' || fileExtension === 'xls') {
        if (file.size > 200 * 1024 * 1024) {
          alert('文件大小超过200MB限制，请选择较小的文件');
          return;
        }
        setUploadedFile(file);
        parseFileHeaders(file);
        const defaultTableName = file.name.replace(/\.(xlsx|xls)$/, '');
        setTableName(defaultTableName);
        setTableDescription('');
      } else {
        alert('请上传 xlsx 或 xls 格式的文件');
      }
    }
  };

  const parseFileHeaders = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        
        if (jsonData && jsonData.length > 0) {
          const headers = jsonData[0];
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

  const handleRemoveFile = () => {
    setUploadedFile(null);
    setFields([]);
    setImportMode('new');
    setSelectedTableId(null);
    setConflictStrategy('fail');
    setTableName('');
    setTableDescription('');
  };

  const handleUpdateField = (id, key, value) => {
    setFields(fields.map(field => {
      if (field.id === id) {
        const updatedField = { ...field, [key]: value };
        if (key === 'type' && (value === 'varchar' || value === 'datetime')) {
          updatedField.unique = false;
        }
        return updatedField;
      }
      return field;
    }));
  };

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
    alert('表结构保存成功！数据已导入到数据中心。');
    handleRemoveFile();
  };

  const getDisplayFields = () => {
    if (importMode === 'existing' && selectedTableId) {
      const selectedTable = savedTables.find(table => table.id === selectedTableId);
      return selectedTable?.fields || [];
    }
    return fields;
  };

  // ========== 公司公告相关函数 ==========
  
  const generateAnnouncements = (companyId) => {
    const company = companies.find(c => c.id === companyId);
    if (!company) return [];

    // 返回所有公告，不再分类
    return [
      { id: 1, datetime: '2025-04-03', content: `${company.name}：2024年年度报告`, url: `http://www.cninfo.com.cn/new/disclosure/detail?stockCode=${company.code}&announcementId=1234567890` },
      { id: 2, datetime: '2024-03-21', content: `${company.name}：2023年年度报告`, url: `http://www.cninfo.com.cn/new/disclosure/detail?stockCode=${company.code}&announcementId=1234567891` },
      { id: 3, datetime: '2023-03-21', content: `${company.name}：2022年年度报告`, url: `http://www.cninfo.com.cn/new/disclosure/detail?stockCode=${company.code}&announcementId=1234567892` },
      { id: 4, datetime: '2025-08-15', content: `${company.name}：2025年中期报告`, url: `http://www.cninfo.com.cn/new/disclosure/detail?stockCode=${company.code}&announcementId=1234567893` },
      { id: 5, datetime: '2024-08-20', content: `${company.name}：2024年中期报告`, url: `http://www.cninfo.com.cn/new/disclosure/detail?stockCode=${company.code}&announcementId=1234567894` },
      { id: 6, datetime: '2025-10-28', content: `${company.name}：2025年第三季度报告`, url: `http://www.cninfo.com.cn/new/disclosure/detail?stockCode=${company.code}&announcementId=1234567895` },
      { id: 7, datetime: '2025-04-28', content: `${company.name}：2025年第一季度报告`, url: `http://www.cninfo.com.cn/new/disclosure/detail?stockCode=${company.code}&announcementId=1234567896` },
      { id: 8, datetime: '2024-04-25', content: `${company.name}：2024年第一季度报告`, url: `http://www.cninfo.com.cn/new/disclosure/detail?stockCode=${company.code}&announcementId=1234567897` },
      { id: 9, datetime: '2022-04-16', content: `${company.name}：2021年年度报告`, url: `http://www.cninfo.com.cn/new/disclosure/detail?stockCode=${company.code}&announcementId=1234567898` },
    ];
  };

  const getFilteredCompanies = () => {
    if (!searchKeyword.trim()) return companies;
    return companies.filter(company =>
      company.name.toLowerCase().includes(searchKeyword.toLowerCase()) ||
      company.code.includes(searchKeyword)
    );
  };

  const getCurrentPageCompanies = () => {
    const filtered = getFilteredCompanies();
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return filtered.slice(startIndex, endIndex);
  };

  const getTotalPages = () => {
    return Math.ceil(getFilteredCompanies().length / pageSize);
  };

  const handleSelectCompany = (companyId) => {
    setSelectedCompanyId(companyId);
    setAnnouncementPage(1);
  };

  const handleBackToList = () => {
    setSelectedCompanyId(null);
    setAnnouncementPage(1);
    setAnnouncementSearchKeyword('');
    setSelectedAnnouncements([]); // 返回列表时清空选择
  };

  const getFilteredAnnouncements = () => {
    if (!selectedCompanyId) return [];
    const allAnnouncements = generateAnnouncements(selectedCompanyId);
    if (!announcementSearchKeyword.trim()) return allAnnouncements;
    return allAnnouncements.filter(announcement =>
      announcement.content.toLowerCase().includes(announcementSearchKeyword.toLowerCase())
    );
  };

  const getCurrentPageAnnouncements = () => {
    const filtered = getFilteredAnnouncements();
    const startIndex = (announcementPage - 1) * announcementPageSize;
    const endIndex = startIndex + announcementPageSize;
    return filtered.slice(startIndex, endIndex);
  };

  const getAnnouncementTotalPages = () => {
    const filtered = getFilteredAnnouncements();
    return Math.ceil(filtered.length / announcementPageSize);
  };

  // 直接导入公告，使用公告内容作为文件名
  const handleImportOnlineDoc = (item) => {
    let fileName = item.content.length > 30 
      ? item.content.substring(0, 30) 
      : item.content;
    fileName = fileName.replace(/[^\u4e00-\u9fa5A-Za-z0-9_-]/g, '_');
    
    // 直接执行导入
    alert(`已成功导入文档！\n文件名：${fileName}.pdf`);
  };

  // 切换单个公告的选中状态
  const handleToggleAnnouncement = (announcementId) => {
    setSelectedAnnouncements(prev => {
      if (prev.includes(announcementId)) {
        return prev.filter(id => id !== announcementId);
      } else {
        return [...prev, announcementId];
      }
    });
  };

  // 全选/取消全选当前页
  const handleToggleAllCurrentPage = () => {
    const currentPageAnnouncementIds = getCurrentPageAnnouncements().map(item => item.id);
    const allSelected = currentPageAnnouncementIds.every(id => selectedAnnouncements.includes(id));
    
    if (allSelected) {
      // 取消选中当前页所有
      setSelectedAnnouncements(prev => prev.filter(id => !currentPageAnnouncementIds.includes(id)));
    } else {
      // 选中当前页所有
      setSelectedAnnouncements(prev => {
        const newIds = currentPageAnnouncementIds.filter(id => !prev.includes(id));
        return [...prev, ...newIds];
      });
    }
  };


  // 批量导入选中的公告
  const handleBatchImport = () => {
    if (selectedAnnouncements.length === 0) {
      alert('请至少选择一个公告！');
      return;
    }

    const allAnnouncements = getFilteredAnnouncements();
    const selectedItems = allAnnouncements.filter(item => selectedAnnouncements.includes(item.id));
    
    const fileNames = selectedItems.map(item => {
      let fileName = item.content.length > 30 
        ? item.content.substring(0, 30) 
        : item.content;
      return fileName.replace(/[^\u4e00-\u9fa5A-Za-z0-9_-]/g, '_') + '.pdf';
    });

    alert(`已成功批量导入 ${selectedItems.length} 个文档！\n\n文件列表：\n${fileNames.join('\n')}`);
    setSelectedAnnouncements([]); // 导入后清空选择
  };

  // 检查当前页是否全选
  const isCurrentPageAllSelected = () => {
    const currentPageAnnouncementIds = getCurrentPageAnnouncements().map(item => item.id);
    if (currentPageAnnouncementIds.length === 0) return false;
    return currentPageAnnouncementIds.every(id => selectedAnnouncements.includes(id));
  };

  // 翻页并清空选择
  const handleAnnouncementPageChange = (newPage) => {
    setAnnouncementPage(newPage);
    setSelectedAnnouncements([]); // 翻页时清空选择
  };

  const validateFileName = (name) => {
    if (!name.trim()) return false;
    const validPattern = /^[\u4e00-\u9fa5A-Za-z0-9_-]+$/;
    return validPattern.test(name);
  };

  const handleFileNameChange = (value) => {
    setInputFileName(value);
    setIsFileNameValid(validateFileName(value));
  };

  const handleConfirmImport = () => {
    if (!inputFileName.trim()) {
      alert('文件名不能为空！');
      return;
    }
    if (!isFileNameValid) {
      alert('文件名包含非法字符！\n只允许使用：中文、英文字母、数字、短横线(-)、下划线(_)');
      return;
    }
    const descriptionText = inputDescription.trim() ? `\n描述：${inputDescription.trim()}` : '';
    alert(`已成功导入文档！\n文件名：${inputFileName.trim()}.pdf${descriptionText}`);
    setShowFileNameModal(false);
    setSelectedDoc(null);
    setInputFileName('');
    setInputDescription('');
    setIsFileNameValid(true);
  };

  const handleCancelImport = () => {
    setShowFileNameModal(false);
    setSelectedDoc(null);
    setInputFileName('');
    setInputDescription('');
    setIsFileNameValid(true);
  };

  // 关闭导入弹窗
  const handleCloseImportModal = () => {
    setShowImportModal(false);
    setMainTab('local');
    setSelectedCompanyId(null);
    setUploadedFile(null);
    setFields([]);
    setImportMode('new');
    setSelectedTableId(null);
    setTableName('');
    setTableDescription('');
  };

  // 获取状态显示文本
  const getStatusText = (status) => {
    const statusMap = {
      processing: '载入中',
      pausing: '终止中',
      paused: '终止',
      completed: '完成',
      failed: '失败'
    };
    return statusMap[status] || status;
  };

  // 获取状态样式类
  const getStatusClass = (status) => {
    return `status-${status}`;
  };

  // 终止任务
  const handlePauseTask = (taskId) => {
    // 先设置为终止中
    setImportTasks(tasks => tasks.map(task => 
      task.id === taskId && task.status === 'processing'
        ? { ...task, status: 'pausing' }
        : task
    ));
    
    // 模拟异步操作，1秒后设置为已终止
    setTimeout(() => {
      setImportTasks(tasks => tasks.map(task => 
        task.id === taskId && task.status === 'pausing'
          ? { ...task, status: 'paused' }
          : task
      ));
    }, 1000);
  };

  // 重新运行任务
  const handleResumeTask = (taskId) => {
    setImportTasks(tasks => tasks.map(task => 
      task.id === taskId && task.status === 'paused'
        ? { ...task, status: 'processing' }
        : task
    ));
  };

  // 重新运行失败的任务
  const handleRerunTask = (taskId) => {
    setImportTasks(tasks => tasks.map(task => 
      task.id === taskId && task.status === 'failed'
        ? { ...task, status: 'processing', completeTime: null, errorDetail: null }
        : task
    ));
  };

  // 删除任务
  const handleDeleteTask = (taskId) => {
    const task = importTasks.find(t => t.id === taskId);
    if (task && (task.status === 'completed' || task.status === 'paused' || task.status === 'failed')) {
      if (window.confirm('确认删除此任务？')) {
        setImportTasks(tasks => tasks.filter(t => t.id !== taskId));
      }
    } else {
      alert('只能删除已完成、已终止或失败的任务');
    }
  };


  // 获取筛选后的任务列表
  const getFilteredTasks = () => {
    return importTasks.filter(task => {
      // 来源筛选
      if (filterSource !== 'all') {
        if (filterSource === 'local' && task.type !== 'excel') return false;
        if (filterSource === 'online' && task.type !== 'announcement') return false;
      }
      
      // 状态筛选
      if (filterStatus !== 'all' && task.status !== filterStatus) {
        return false;
      }
      
      return true;
    });
  };

  // 获取当前页的任务
  const getCurrentPageTasks = () => {
    const allTasks = getFilteredTasks();
    const startIndex = (taskPage - 1) * taskPageSize;
    const endIndex = startIndex + taskPageSize;
    return allTasks.slice(startIndex, endIndex);
  };

  // 获取总页数
  const getTaskTotalPages = () => {
    const allTasks = getFilteredTasks();
    return Math.ceil(allTasks.length / taskPageSize);
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h2>数据载入</h2>
        <button className="import-entry-btn" onClick={() => setShowImportModal(true)}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" style={{ marginRight: '6px' }}>
            <path d="M8 2v12M2 8h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          导入数据
        </button>
      </div>

      <div className="page-content">
        {/* 载入任务列表 */}
        <div className="import-tasks-section">
          <div className="tasks-header">
            <h3>载入任务</h3>
          </div>
          
          {getFilteredTasks().length === 0 ? (
            <div className="empty-state">
              {importTasks.length === 0 ? '暂无载入任务' : '没有符合条件的任务'}
            </div>
          ) : (
            <div className="tasks-list">
              <div className="tasks-list-header">
                <div className="task-col-type">
                  <div className="header-filter-dropdown">
                    来源
                    <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor" style={{ marginLeft: '4px' }}>
                      <path d="M1.5 2.5h13l-5 6v5l-3 1v-6l-5-6z" fill="currentColor"/>
                    </svg>
                    {filterSource !== 'all' && <span className="header-filter-badge"></span>}
                    <div className="header-filter-menu">
                      <div 
                        className={`filter-menu-item ${filterSource === 'all' ? 'active' : ''}`}
                        onClick={() => {
                          setFilterSource('all');
                          setTaskPage(1);
                        }}
                      >
                        全部来源
                      </div>
                      <div 
                        className={`filter-menu-item ${filterSource === 'local' ? 'active' : ''}`}
                        onClick={() => {
                          setFilterSource('local');
                          setTaskPage(1);
                        }}
                      >
                        本地上传
                      </div>
                      <div 
                        className={`filter-menu-item ${filterSource === 'online' ? 'active' : ''}`}
                        onClick={() => {
                          setFilterSource('online');
                          setTaskPage(1);
                        }}
                      >
                        上市公司公告
                      </div>
                    </div>
                  </div>
                </div>
                <div className="task-col-object">载入对象名</div>
                <div className="task-col-status">
                  <div className="header-filter-dropdown">
                    状态
                    <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor" style={{ marginLeft: '4px' }}>
                      <path d="M1.5 2.5h13l-5 6v5l-3 1v-6l-5-6z" fill="currentColor"/>
                    </svg>
                    {filterStatus !== 'all' && <span className="header-filter-badge"></span>}
                    <div className="header-filter-menu">
                      <div 
                        className={`filter-menu-item ${filterStatus === 'all' ? 'active' : ''}`}
                        onClick={() => {
                          setFilterStatus('all');
                          setTaskPage(1);
                        }}
                      >
                        全部状态
                      </div>
                      <div 
                        className={`filter-menu-item ${filterStatus === 'processing' ? 'active' : ''}`}
                        onClick={() => {
                          setFilterStatus('processing');
                          setTaskPage(1);
                        }}
                      >
                        载入中
                      </div>
                      <div 
                        className={`filter-menu-item ${filterStatus === 'pausing' ? 'active' : ''}`}
                        onClick={() => {
                          setFilterStatus('pausing');
                          setTaskPage(1);
                        }}
                      >
                        终止中
                      </div>
                      <div 
                        className={`filter-menu-item ${filterStatus === 'paused' ? 'active' : ''}`}
                        onClick={() => {
                          setFilterStatus('paused');
                          setTaskPage(1);
                        }}
                      >
                        终止
                      </div>
                      <div 
                        className={`filter-menu-item ${filterStatus === 'completed' ? 'active' : ''}`}
                        onClick={() => {
                          setFilterStatus('completed');
                          setTaskPage(1);
                        }}
                      >
                        完成
                      </div>
                      <div 
                        className={`filter-menu-item ${filterStatus === 'failed' ? 'active' : ''}`}
                        onClick={() => {
                          setFilterStatus('failed');
                          setTaskPage(1);
                        }}
                      >
                        失败
                      </div>
                    </div>
                  </div>
                </div>
                <div className="task-col-createtime">创建时间</div>
                <div className="task-col-completetime">完成时间</div>
                <div className="task-col-creator">创建人</div>
                <div className="task-col-detail">详情</div>
                <div className="task-col-action">操作</div>
              </div>
              {getCurrentPageTasks().map((task) => (
                <div key={task.id} className="tasks-list-row">
                  <div className="task-col-type">
                    <span className={`source-badge ${task.type === 'excel' ? 'source-local' : 'source-online'}`}>
                      <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor" className="source-icon">
                        {task.type === 'excel' ? (
                          <path d="M4 2h8l2 2v10l-2 2H4l-2-2V4l2-2zm1 3v6h6V5H5z"/>
                        ) : (
                          <path d="M4 2h8v12H4V2zm2 2v2h4V4H6zm0 3v2h4V7H6zm0 3v2h4v-2H6z"/>
                        )}
                      </svg>
                      {task.source}
                    </span>
                  </div>
                  <div className="task-col-object">{task.objectName}</div>
                  <div className="task-col-status">
                    <span className={`status-badge ${getStatusClass(task.status)}`}>
                      {getStatusText(task.status)}
                    </span>
                  </div>
                  <div className="task-col-createtime">{task.createTime}</div>
                  <div className="task-col-completetime">{task.completeTime || '-'}</div>
                  <div className="task-col-creator">{task.creator}</div>
                  <div className="task-col-detail">
                    {task.status === 'failed' && task.errorDetail ? (
                      <span className="error-detail" title={task.errorDetail}>
                        {task.errorDetail}
                      </span>
                    ) : (
                      '-'
                    )}
                  </div>
                  <div className="task-col-action">
                    {task.status === 'processing' && (
                      <button 
                        className="task-action-btn pause-btn" 
                        title="终止"
                        onClick={() => handlePauseTask(task.id)}
                      >
                        <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
                          <path d="M5 3h2v10H5V3zm4 0h2v10H9V3z"/>
                        </svg>
                      </button>
                    )}
                    {task.status === 'pausing' && (
                      <button 
                        className="task-action-btn pause-btn disabled" 
                        title="终止中..."
                        disabled
                      >
                        <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
                          <path d="M8 2a6 6 0 1 0 0 12A6 6 0 0 0 8 2zm0 1a5 5 0 1 1 0 10A5 5 0 0 1 8 3z" opacity="0.3"/>
                          <path d="M8 2v3l2.5 2.5" stroke="currentColor" strokeWidth="1.5" fill="none"/>
                        </svg>
                      </button>
                    )}
                    {task.status === 'paused' && (
                      <button 
                        className="task-action-btn resume-btn" 
                        title="重新运行"
                        onClick={() => handleResumeTask(task.id)}
                      >
                        <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
                          <path d="M5 3l8 5-8 5V3z"/>
                        </svg>
                      </button>
                    )}
                    {task.status === 'failed' && (
                      <button 
                        className="task-action-btn resume-btn" 
                        title="重新运行"
                        onClick={() => handleRerunTask(task.id)}
                      >
                        <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
                          <path d="M5 3l8 5-8 5V3z"/>
                        </svg>
                      </button>
                    )}
                      <button
                        className={`task-action-btn delete-btn ${(task.status !== 'completed' && task.status !== 'paused' && task.status !== 'failed') ? 'disabled' : ''}`}
                        title={(task.status === 'completed' || task.status === 'paused' || task.status === 'failed') ? '删除' : '只能删除已完成、已终止或失败的任务'}
                        onClick={() => handleDeleteTask(task.id)}
                        disabled={task.status !== 'completed' && task.status !== 'paused' && task.status !== 'failed'}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="3 6 5 6 21 6"></polyline>
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        </svg>
                      </button>
                  </div>
                </div>
              ))}
              
              {/* 分页控件 */}
              <div className="task-pagination">
                <div className="pagination-left">
                  <button 
                    className="page-nav-btn" 
                    onClick={() => setTaskPage(Math.max(1, taskPage - 1))} 
                    disabled={taskPage === 1}
                  >
                    <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
                      <path d="M10 2L4 8l6 6V2z"/>
                    </svg>
                  </button>
                  <span className="page-current">{taskPage}</span>
                  <button 
                    className="page-nav-btn" 
                    onClick={() => setTaskPage(Math.min(getTaskTotalPages(), taskPage + 1))} 
                    disabled={taskPage === getTaskTotalPages()}
                  >
                    <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
                      <path d="M6 2v12l6-6-6-6z"/>
                    </svg>
                  </button>
                </div>
                <div className="pagination-right">
                  <select 
                    className="page-size-select" 
                    value={taskPageSize} 
                    onChange={(e) => {
                      setTaskPageSize(Number(e.target.value));
                      setTaskPage(1);
                    }}
                  >
                    <option value={5}>5 条/页</option>
                    <option value={10}>10 条/页</option>
                    <option value={20}>20 条/页</option>
                    <option value={50}>50 条/页</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 导入数据弹窗 */}
        {showImportModal && (
          <div className="modal-overlay" onClick={handleCloseImportModal}>
            <div className="modal-content import-modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3>导入数据</h3>
                <button className="modal-close-btn" onClick={handleCloseImportModal}>✕</button>
              </div>
              <div className="modal-body">
                {/* 主标签切换 */}
                <div className="main-tabs-section">
          <button
            className={`main-tab-btn ${mainTab === 'local' ? 'active' : ''}`}
            onClick={() => {
              setMainTab('local');
              setSelectedCompanyId(null);
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" style={{ marginRight: '8px' }}>
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            本地上传
          </button>
          <button
            className={`main-tab-btn ${mainTab === 'announcement' ? 'active' : ''}`}
            onClick={() => setMainTab('announcement')}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" style={{ marginRight: '8px' }}>
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            上市公司公告
          </button>
        </div>

        {/* 本地上传内容 */}
        {mainTab === 'local' && (
          <div className="upload-section">
            {/* 上传文件 */}
            <div className="section-title">上传Excel文件</div>
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
                        <path d="M8 2h24l8 8v34a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z" fill="#E8E8E8"/>
                        <path d="M32 2v6a2 2 0 0 0 2 2h6z" fill="#D0D0D0"/>
                        <rect x="24" y="24" width="18" height="18" rx="2" fill="#1D6F42"/>
                        <text x="33" y="37" fontSize="12" fontWeight="bold" fill="#fff" textAnchor="middle">X</text>
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
                      <path d="M8 2h24l8 8v34a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z" fill="#E8E8E8"/>
                      <path d="M32 2v6a2 2 0 0 0 2 2h6z" fill="#D0D0D0"/>
                      <rect x="24" y="24" width="18" height="18" rx="2" fill="#1D6F42"/>
                      <text x="33" y="37" fontSize="12" fontWeight="bold" fill="#fff" textAnchor="middle">X</text>
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

        {/* 公司公告内容 */}
        {mainTab === 'announcement' && (
          <div className="announcement-section">
            {!selectedCompanyId ? (
              <>
                {/* 搜索栏 */}
                <div className="search-section">
                  <div className="search-bar">
                    <svg className="search-icon" width="20" height="20" viewBox="0 0 20 20" fill="none">
                      <path d="M9 17A8 8 0 1 0 9 1a8 8 0 0 0 0 16zM19 19l-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <input
                      type="text"
                      className="search-input"
                      placeholder="搜索公司名称或股票代码..."
                      value={searchKeyword}
                      onChange={(e) => {
                        setSearchKeyword(e.target.value);
                        setCurrentPage(1);
                      }}
                    />
                    {searchKeyword && (
                      <button className="clear-search-btn" onClick={() => {
                        setSearchKeyword('');
                        setCurrentPage(1);
                      }}>
                        ✕
                      </button>
                    )}
                  </div>
                </div>

                {/* 公司列表 */}
                {getFilteredCompanies().length === 0 ? (
                  <div className="empty-state">未找到匹配的上市公司</div>
                ) : (
                  <>
                    <div className="company-list">
                      <div className="company-list-header">
                        <div className="col-code">股票代码</div>
                        <div className="col-name">公司名称</div>
                        <div className="col-action">操作</div>
                      </div>
                      {getCurrentPageCompanies().map((company) => (
                        <div key={company.id} className="company-list-row">
                          <div className="col-code">{company.code}</div>
                          <div className="col-name">{company.name}</div>
                          <div className="col-action">
                            <button 
                              className="view-announcement-btn"
                              onClick={() => handleSelectCompany(company.id)}
                            >
                              查看公告
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* 分页 */}
                    <div className="pagination">
                      <button className="page-btn" onClick={() => setCurrentPage(1)} disabled={currentPage === 1}>首页</button>
                      <button className="page-btn" onClick={() => setCurrentPage(currentPage - 1)} disabled={currentPage === 1}>上一页</button>
                      <span className="page-info">第 {currentPage} / {getTotalPages()} 页</span>
                      <button className="page-btn" onClick={() => setCurrentPage(currentPage + 1)} disabled={currentPage === getTotalPages()}>下一页</button>
                      <button className="page-btn" onClick={() => setCurrentPage(getTotalPages())} disabled={currentPage === getTotalPages()}>末页</button>
                    </div>
                  </>
                )}
              </>
            ) : (
              /* 公告详情 */
              (() => {
                const company = companies.find(c => c.id === selectedCompanyId);
                if (!company) return null;

                return (
                  <div className="announcement-detail-section">
                    <div className="announcement-header-bar">
                      <button className="back-btn-icon" onClick={handleBackToList}>
                        <svg width="20" height="20" viewBox="0 0 16 16" fill="currentColor">
                          <path d="M11 1L4 8l7 7" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </button>
                      <h3 className="announcement-title">{company.name}公司公告</h3>
                    </div>

                    {/* 公告列表 */}
                    <div className="announcement-content">
                      {/* 公告搜索框 */}
                      <div className="announcement-search-bar">
                        <input
                          type="text"
                          className="announcement-search-input"
                          placeholder="搜索公告标题..."
                          value={announcementSearchKeyword}
                          onChange={(e) => {
                            setAnnouncementSearchKeyword(e.target.value);
                            setAnnouncementPage(1);
                            setSelectedAnnouncements([]); // 搜索时清空选择
                          }}
                        />
                        {announcementSearchKeyword && (
                          <button 
                            className="clear-search-btn"
                            onClick={() => {
                              setAnnouncementSearchKeyword('');
                              setAnnouncementPage(1);
                              setSelectedAnnouncements([]); // 清空搜索时清空选择
                            }}
                          >
                            <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
                              <path d="M4 4l8 8m0-8l-8 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                            </svg>
                          </button>
                        )}
                      </div>
                      
                      {/* 批量操作栏 */}
                      {getCurrentPageAnnouncements().length > 0 && (
                        <div className="announcement-batch-actions">
                          <div className="batch-select-actions">
                            <label className="checkbox-label">
                              <input
                                type="checkbox"
                                checked={isCurrentPageAllSelected()}
                                onChange={handleToggleAllCurrentPage}
                              />
                              <span>全选</span>
                            </label>
                            {selectedAnnouncements.length > 0 && (
                              <span className="selected-count">
                                已选择 {selectedAnnouncements.length} 项
                              </span>
                            )}
                          </div>
                          <button 
                            className="batch-import-btn"
                            onClick={handleBatchImport}
                            disabled={selectedAnnouncements.length === 0}
                          >
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" style={{ marginRight: '6px' }}>
                              <path d="M8.5 1.5v9m-3-3l3 3 3-3M2 13h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                            </svg>
                            批量导入
                          </button>
                        </div>
                      )}

                      <div className="announcement-list">
                        {getCurrentPageAnnouncements().length === 0 ? (
                          <div className="empty-announcement">{announcementSearchKeyword ? '未找到匹配的公告' : '暂无公告'}</div>
                        ) : (
                          getCurrentPageAnnouncements().map((item) => (
                            <div key={item.id} className="announcement-item">
                              <label className="announcement-checkbox">
                                <input
                                  type="checkbox"
                                  checked={selectedAnnouncements.includes(item.id)}
                                  onChange={() => handleToggleAnnouncement(item.id)}
                                />
                              </label>
                              <div className="announcement-main">
                                <span className="announcement-datetime">{item.datetime}</span>
                                <a 
                                  href={item.url} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="announcement-link"
                                >
                                  {item.content}
                                </a>
                              </div>
                              <button 
                                className="import-announcement-btn"
                                onClick={() => handleImportOnlineDoc(item)}
                                title="导入此公告"
                              >
                                <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                                  <path d="M8.5 1.5v9m-3-3l3 3 3-3M2 13h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                                </svg>
                                导入
                              </button>
                            </div>
                          ))
                        )}
                      </div>

                      {/* 公告分页 */}
                      {getCurrentPageAnnouncements().length > 0 && getAnnouncementTotalPages() > 1 && (
                        <div className="pagination">
                          <button className="page-btn" onClick={() => handleAnnouncementPageChange(1)} disabled={announcementPage === 1}>首页</button>
                          <button className="page-btn" onClick={() => handleAnnouncementPageChange(announcementPage - 1)} disabled={announcementPage === 1}>上一页</button>
                          <span className="page-info">第 {announcementPage} / {getAnnouncementTotalPages()} 页</span>
                          <button className="page-btn" onClick={() => handleAnnouncementPageChange(announcementPage + 1)} disabled={announcementPage === getAnnouncementTotalPages()}>下一页</button>
                          <button className="page-btn" onClick={() => handleAnnouncementPageChange(getAnnouncementTotalPages())} disabled={announcementPage === getAnnouncementTotalPages()}>末页</button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })()
            )}
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
              <h3>导入公告</h3>
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
                    if (e.key === 'Enter' && isFileNameValid && inputFileName.trim()) {
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
              
              <div className="description-input-group">
                <label className="description-label">
                  描述：
                  <span className="optional-tag">（非必填）</span>
                </label>
                <textarea
                  className="description-input"
                  value={inputDescription}
                  onChange={(e) => setInputDescription(e.target.value)}
                  placeholder="请输入描述信息（选填）"
                  rows="3"
                />
              </div>
            </div>
            <div className="filename-modal-footer">
              <button className="cancel-import-btn" onClick={handleCancelImport}>取消</button>
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

export default DataImport;

