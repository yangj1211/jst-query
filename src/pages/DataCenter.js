import React, { useState, useEffect } from 'react';
import './PageStyle.css';
import './DataCenter.css';
import DateTimeRangePicker from '../components/DateTimeRangePicker';
import TagManagementModal from '../components/TagManagementModal';

const DataCenter = () => {
  const [savedTables, setSavedTables] = useState([
    {
      id: 1,
      name: '2024年财务报告.pdf',
      objectType: 'file', // 文件类型
      tags: ['财务', '报告', '2024'],
      source: '上市公司公告', // 文件来源
      fileSize: '2.5MB',
      createTime: '2025-01-15 09:00:00',
      updateTime: '2025-01-15 09:00:00',
      creator: '张三'
    },
    {
      id: 2,
      name: '2023年对外披露数据.pdf',
      objectType: 'file', // 文件类型
      tags: ['披露'],
      source: '上市公司公告', // 文件来源
      fileSize: '1.8MB',
      createTime: '2024-12-20 10:30:00',
      updateTime: '2024-12-20 10:30:00',
      creator: '李四'
    },
    { 
      id: 3, 
      name: '测试表1',
      description: '财务数据表',
      objectType: 'table', // 表类型
      tags: ['财务', '数据'],
      source: '本地上传', // 表来源
      fieldCount: 10,
      rowCount: 1523,
      createTime: '2025-10-20 10:30:00',
      updateTime: '2025-10-20 10:30:00',
      creator: '王五',
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
      tags: ['销售'],
      source: '中台', // 表来源
      fieldCount: 10,
      rowCount: 8942,
      createTime: '2025-10-21 14:20:00',
      updateTime: '2025-10-21 14:20:00',
      creator: '赵六',
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
  const [viewingTableId, setViewingTableId] = useState(null); // 当前查看详情的表ID
  const [searchKeyword, setSearchKeyword] = useState(''); // 文件名/表名搜索关键词
  const [creatorSearchKeyword, setCreatorSearchKeyword] = useState(''); // 创建人搜索关键词
  const [currentPage, setCurrentPage] = useState(1); // 当前页码
  const [pageSize] = useState(10); // 每页显示条数
  const [detailTab, setDetailTab] = useState('fields'); // 表详情tab: 'fields' 或 'data'
  const [objectTypeFilter, setObjectTypeFilter] = useState('all'); // 对象类型筛选: 'all' | 'file' | 'table'
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false); // 对象类型筛选下拉菜单是否打开
  const [tagFilter, setTagFilter] = useState([]); // 标签筛选：多选
  const [isTagFilterDropdownOpen, setIsTagFilterDropdownOpen] = useState(false); // 标签筛选下拉菜单是否打开
  const [tagFilterSearchKeyword, setTagFilterSearchKeyword] = useState(''); // 标签筛选搜索关键词
  const [sourceFilter, setSourceFilter] = useState('all'); // 来源筛选: 'all' | source名称
  const [isSourceFilterDropdownOpen, setIsSourceFilterDropdownOpen] = useState(false); // 来源筛选下拉菜单是否打开
  const [createTimeRange, setCreateTimeRange] = useState({ startDate: null, endDate: null }); // 创建时间范围筛选
  const [isTagManagementModalVisible, setIsTagManagementModalVisible] = useState(false); // 标签管理模态框显示状态
  const [allTags, setAllTags] = useState([]); // 所有可用标签列表
  const [allSources, setAllSources] = useState([]); // 所有可用来源列表
  const [editingItemId, setEditingItemId] = useState(null); // 正在编辑标签的项目ID
  const [editingItemTags, setEditingItemTags] = useState([]); // 正在编辑的标签列表
  const [tagSearchInput, setTagSearchInput] = useState(''); // 标签搜索输入
  const [isTagDropdownOpen, setIsTagDropdownOpen] = useState(false); // 标签下拉菜单是否打开

  // 初始化标签列表和来源列表
  useEffect(() => {
    const tags = new Set();
    const sources = new Set();
    savedTables.forEach(item => {
      if (item.tags && Array.isArray(item.tags)) {
        item.tags.forEach(tag => {
          if (tag) {
            tags.add(tag);
          }
        });
      }
      if (item.source) {
        sources.add(item.source);
      }
    });
    const newTags = Array.from(tags);
    const newSources = Array.from(sources);
    setAllTags(newTags);
    setAllSources(newSources);
    
    // 移除已被删除的标签筛选项
    if (Array.isArray(tagFilter) && tagFilter.length > 0) {
      const validTags = tagFilter.filter(tag => newTags.includes(tag));
      if (validTags.length !== tagFilter.length) {
        setTagFilter(validTags);
      }
    }

    // 如果当前选中的来源不再存在，重置为"全部来源"
    if (sourceFilter !== 'all' && !newSources.includes(sourceFilter)) {
      setSourceFilter('all');
    }
  }, [savedTables, sourceFilter, tagFilter]);

  // 检查标签是否被使用
  const checkTagInUse = (tag) => {
    return savedTables.some(item => 
      item.tags && Array.isArray(item.tags) && item.tags.includes(tag)
    );
  };

  // 下载单个对象
  const handleDownloadObject = (item) => {
    if (item.objectType === 'file') {
      // 下载文件（模拟下载PDF文件）
      // 在实际项目中，这里应该调用后端API获取文件内容
      alert(`正在下载文件：${item.name}\n此功能需要后端API支持`);
      // 模拟下载
      const link = document.createElement('a');
      link.href = '#'; // 实际应该使用文件URL
      link.download = item.name;
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else if (item.objectType === 'table') {
      // 下载表数据为CSV格式
      const table = savedTables.find(t => t.id === item.id);
      if (!table || !table.fields) {
        alert('表数据不存在');
        return;
      }

      // 生成表数据
      const sampleData = generateSampleData(table, table.rowCount || 100);
      
      // 创建CSV内容
      const headers = table.fields.map(field => field.name);
      const rows = sampleData.map(row => 
        headers.map(header => `"${row[header] || ''}"`).join(',')
      );
      
      const csvContent = [
        headers.join(','),
        ...rows
      ].join('\n');

      // 添加BOM以支持中文
      const BOM = '\uFEFF';
      const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      
      link.setAttribute('href', url);
      link.setAttribute('download', `${item.name}_${new Date().toISOString().slice(0, 10)}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  };

  // 打开编辑标签模态框
  const handleOpenEditTags = (itemId) => {
    const item = savedTables.find(t => t.id === itemId);
    if (item) {
      setEditingItemId(itemId);
      setEditingItemTags(item.tags && Array.isArray(item.tags) ? [...item.tags] : []);
      setTagSearchInput('');
      setIsTagDropdownOpen(false);
    }
  };

  // 关闭编辑标签模态框
  const handleCloseEditTags = () => {
    setEditingItemId(null);
    setEditingItemTags([]);
    setTagSearchInput('');
    setIsTagDropdownOpen(false);
  };

  // 保存编辑的标签
  const handleSaveEditTags = () => {
    if (editingItemId) {
      setSavedTables(savedTables.map(item => {
        if (item.id === editingItemId) {
          return { ...item, tags: editingItemTags };
        }
        return item;
      }));
      handleCloseEditTags();
    }
  };

  // 添加标签到编辑列表
  const handleAddTagToEdit = (tag) => {
    if (!editingItemTags.includes(tag)) {
      setEditingItemTags([...editingItemTags, tag]);
    }
    setTagSearchInput('');
    setIsTagDropdownOpen(false);
  };

  // 从编辑列表移除标签
  const handleRemoveTagFromEdit = (tag) => {
    setEditingItemTags(editingItemTags.filter(t => t !== tag));
  };

  // 处理标签变更
  const handleTagsChange = (newTags, oldTagName = null, newTagName = null) => {
    const oldTags = new Set(allTags);
    const newTagsSet = new Set(newTags);
    
    // 如果提供了重命名信息，更新使用该标签的数据项
    if (oldTagName && newTagName && oldTagName !== newTagName) {
      setSavedTables(savedTables.map(item => {
        if (item.tags && Array.isArray(item.tags) && item.tags.includes(oldTagName)) {
          return { 
            ...item, 
            tags: item.tags.map(tag => tag === oldTagName ? newTagName : tag)
          };
        }
        return item;
      }));
    }
    
    // 找出被删除的标签
    const deletedTags = [];
    oldTags.forEach(tag => {
      if (!newTagsSet.has(tag)) {
        deletedTags.push(tag);
      }
    });
    
    // 更新数据项中的标签（删除的标签）
    setSavedTables(savedTables.map(item => {
      // 如果标签被删除，从数组中移除该标签
      if (item.tags && Array.isArray(item.tags)) {
        const filteredTags = item.tags.filter(tag => !deletedTags.includes(tag));
        if (filteredTags.length !== item.tags.length) {
          return { ...item, tags: filteredTags.length > 0 ? filteredTags : [] };
        }
      }
      return item;
    }));
    
    setAllTags(newTags);
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

  // 解析日期时间字符串为Date对象
  const parseDateTimeString = (dateTimeStr) => {
    if (!dateTimeStr) return null;
    const match = dateTimeStr.match(/(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2}):(\d{2})/);
    if (!match) return null;
    const [, year, month, day, hour, minute, second] = match.map(Number);
    return new Date(year, month - 1, day, hour, minute, second);
  };

  // 根据搜索关键词和对象类型过滤表列表
  const getFilteredTables = () => {
    let filtered = savedTables;

    // 按文件名/表名搜索关键词筛选
    if (searchKeyword.trim()) {
      const keyword = searchKeyword.toLowerCase();
      filtered = filtered.filter(table => 
        table.name.toLowerCase().includes(keyword)
      );
    }

    // 按创建人搜索关键词筛选
    if (creatorSearchKeyword.trim()) {
      const keyword = creatorSearchKeyword.toLowerCase();
      filtered = filtered.filter(table => 
        table.creator && table.creator.toLowerCase().includes(keyword)
      );
    }

    // 按对象类型筛选
    if (objectTypeFilter !== 'all') {
      filtered = filtered.filter(table => table.objectType === objectTypeFilter);
    }

    // 按标签筛选（多选，包含任意一个即可）
    if (Array.isArray(tagFilter) && tagFilter.length > 0) {
      filtered = filtered.filter(table => 
        table.tags && Array.isArray(table.tags) &&
        tagFilter.some(selectedTag => table.tags.includes(selectedTag))
      );
    }

    // 按来源筛选
    if (sourceFilter !== 'all') {
      filtered = filtered.filter(table => table.source === sourceFilter);
    }

    // 按创建时间范围筛选
    if (createTimeRange.startDate || createTimeRange.endDate) {
      filtered = filtered.filter(table => {
        const createTime = parseDateTimeString(table.createTime);
        if (!createTime) return false;

        if (createTimeRange.startDate && createTimeRange.endDate) {
          return createTime >= createTimeRange.startDate && createTime <= createTimeRange.endDate;
        } else if (createTimeRange.startDate) {
          return createTime >= createTimeRange.startDate;
        } else if (createTimeRange.endDate) {
          return createTime <= createTimeRange.endDate;
        }
        return true;
      });
    }

    return filtered;
  };

  // 处理筛选选项点击
  const handleFilterSelect = (value) => {
    setObjectTypeFilter(value);
    setIsFilterDropdownOpen(false);
  };

  // 处理标签筛选选项点击（多选）
  const handleTagFilterSelect = (value) => {
    if (value === 'all') {
      setTagFilter([]);
      return;
    }
    setTagFilter(prev => {
      if (Array.isArray(prev) && prev.includes(value)) {
        return prev.filter(tag => tag !== value);
      }
      return Array.isArray(prev) ? [...prev, value] : [value];
    });
  };

  // 处理来源筛选选项点击
  const handleSourceFilterSelect = (value) => {
    setSourceFilter(value);
    setIsSourceFilterDropdownOpen(false);
  };

  // 重置搜索条件
  const handleResetSearch = () => {
    setSearchKeyword('');
    setCreatorSearchKeyword('');
    setTagFilter([]);
    setTagFilterSearchKeyword('');
    setIsTagFilterDropdownOpen(false);
    setCreateTimeRange({ startDate: null, endDate: null });
  };

  // 点击外部关闭下拉菜单
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isFilterDropdownOpen && !event.target.closest('.object-type-filter-wrapper')) {
        setIsFilterDropdownOpen(false);
      }
      if (isTagFilterDropdownOpen && !event.target.closest('.tag-filter-search-group')) {
        setIsTagFilterDropdownOpen(false);
      }
      if (isSourceFilterDropdownOpen && !event.target.closest('.source-filter-wrapper')) {
        setIsSourceFilterDropdownOpen(false);
      }
      if (isTagDropdownOpen && !event.target.closest('.edit-tag-dropdown-wrapper')) {
        setIsTagDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isFilterDropdownOpen, isTagFilterDropdownOpen, isSourceFilterDropdownOpen, isTagDropdownOpen]);

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

  // 计算文件数量和表数量
  const fileCount = savedTables.filter(item => item.objectType === 'file').length;
  const tableCount = savedTables.filter(item => item.objectType === 'table').length;

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
          <h2>{viewingTableId ? '表详情' : '数据总览'}</h2>
        </div>
        {!viewingTableId && (
          <div className="header-right">
            <button 
              className="tag-management-btn-primary"
              onClick={() => setIsTagManagementModalVisible(true)}
              title="标签管理"
            >
              <svg width="18" height="18" viewBox="0 0 16 16" fill="currentColor">
                <path d="M2 2h12v12H2V2zm1 1v10h10V3H3zm2 1h6v1H5V4zm0 2h6v1H5V6zm0 2h4v1H5V8z"/>
              </svg>
              <span>标签管理</span>
            </button>
          </div>
        )}
      </div>
      <div className="page-content">
        {/* 表列表和详情 */}
        {!viewingTableId ? (
          <>
            {/* 搜索栏 */}
            <div className="table-search-bar">
              <div className="search-row">
                <div className="search-group">
                  <label className="search-label">文件名/表名：</label>
                  <div className="search-input-wrapper">
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
                </div>
                <div className="search-group">
                  <label className="search-label">创建人：</label>
                  <div className="search-input-wrapper">
                    <input
                      type="text"
                      className="search-input"
                      placeholder="搜索创建人..."
                      value={creatorSearchKeyword}
                      onChange={(e) => setCreatorSearchKeyword(e.target.value)}
                    />
                    {creatorSearchKeyword && (
                      <button className="clear-search-btn" onClick={() => setCreatorSearchKeyword('')}>
                        ✕
                      </button>
                    )}
                  </div>
                </div>
                <div className={`search-group tag-filter-search-group ${isTagFilterDropdownOpen ? 'active' : ''}`}>
                  <label className="search-label">标签：</label>
                  <div className="tag-filter-wrapper">
                    <button
                      type="button"
                      className="tag-filter-btn"
                      onClick={() => {
                        const nextState = !isTagFilterDropdownOpen;
                        setIsTagFilterDropdownOpen(nextState);
                        if (nextState) {
                          setTagFilterSearchKeyword('');
                        }
                      }}
                    >
                      <span>
                        {Array.isArray(tagFilter) && tagFilter.length > 0
                          ? `已选 ${tagFilter.length} 个`
                          : '全部标签'}
                      </span>
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
                        <path d="M6 9L1 4h10L6 9z"/>
                      </svg>
                    </button>
                    {isTagFilterDropdownOpen && (
                      <div className="filter-dropdown tag-filter-dropdown">
                        <div className="tag-filter-search-input">
                          <input
                            type="text"
                            placeholder="输入关键字搜索"
                            value={tagFilterSearchKeyword}
                            onChange={(e) => setTagFilterSearchKeyword(e.target.value)}
                          />
                        </div>
                        <div
                          className={`filter-dropdown-item ${Array.isArray(tagFilter) && tagFilter.length === 0 ? 'active' : ''}`}
                          onClick={() => handleTagFilterSelect('all')}
                        >
                          {Array.isArray(tagFilter) && tagFilter.length === 0 && (
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                              <path d="M13.5 2L6 9.5 2.5 6l1.41-1.41L6 6.68l6.09-6.09L13.5 2z"/>
                            </svg>
                          )}
                          <span>全部标签</span>
                        </div>
                        {allTags.length === 0 ? (
                          <div className="filter-dropdown-item disabled">
                            <span>暂无标签</span>
                          </div>
                        ) : (
                          allTags
                            .filter(tag =>
                              tagFilterSearchKeyword
                                ? tag.toLowerCase().includes(tagFilterSearchKeyword.toLowerCase())
                                : true
                            )
                            .map(tag => {
                              const isSelected = Array.isArray(tagFilter) && tagFilter.includes(tag);
                              return (
                                <div
                                  key={tag}
                                  className={`filter-dropdown-item ${isSelected ? 'active' : ''}`}
                                  onClick={() => handleTagFilterSelect(tag)}
                                >
                                  {isSelected && (
                                    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                                      <path d="M13.5 2L6 9.5 2.5 6l1.41-1.41L6 6.68l6.09-6.09L13.5 2z"/>
                                    </svg>
                                  )}
                                  <span>{tag}</span>
                                </div>
                              );
                            })
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="search-row">
                <div className="search-group date-range-group">
                  <label className="search-label">创建时间：</label>
                  <div className="date-range-picker-field">
                    <DateTimeRangePicker
                      value={createTimeRange}
                      onChange={setCreateTimeRange}
                      placeholder="选择创建时间范围"
                    />
                  </div>
                </div>
              <div className="search-group search-actions-group">
                <label className="search-label">&nbsp;</label>
                <div className="search-actions">
                  <button className="search-reset-btn" onClick={handleResetSearch}>
                    重置
                  </button>
                </div>
              </div>
              </div>
            </div>

            {/* 统计信息 */}
            <div className="data-stats-header">
              <span className="stat-item-header">文件数量 {fileCount}个</span>
              <span className="stat-item-header">表数量 {tableCount}个</span>
            </div>

            {/* 表列表 */}
            {getFilteredTables().length === 0 ? (
              <div className="empty-state">
                {(searchKeyword || creatorSearchKeyword) ? '未找到匹配的表' : '暂无数据表'}
              </div>
            ) : (
              <div className="table-list-container">
                <div className="table-list-header">
                  <div className="list-col-name">文件名/表名</div>
                  <div className="list-col-type">
                    <div className={`object-type-filter-wrapper ${isFilterDropdownOpen ? 'active' : ''}`}>
                      <button 
                        className="object-type-filter-btn"
                        onClick={() => setIsFilterDropdownOpen(!isFilterDropdownOpen)}
                      >
                        <span>对象类型</span>
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
                          <path d="M6 9L1 4h10L6 9z"/>
                        </svg>
                      </button>
                      {isFilterDropdownOpen && (
                        <div className="filter-dropdown">
                          <div 
                            className={`filter-dropdown-item ${objectTypeFilter === 'all' ? 'active' : ''}`}
                            onClick={() => handleFilterSelect('all')}
                          >
                            {objectTypeFilter === 'all' && (
                              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                                <path d="M13.5 2L6 9.5 2.5 6l1.41-1.41L6 6.68l6.09-6.09L13.5 2z"/>
                              </svg>
                            )}
                            <span>全部对象类型</span>
                          </div>
                          <div 
                            className={`filter-dropdown-item ${objectTypeFilter === 'file' ? 'active' : ''}`}
                            onClick={() => handleFilterSelect('file')}
                          >
                            {objectTypeFilter === 'file' && (
                              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                                <path d="M13.5 2L6 9.5 2.5 6l1.41-1.41L6 6.68l6.09-6.09L13.5 2z"/>
                              </svg>
                            )}
                            <span>文件</span>
                          </div>
                          <div 
                            className={`filter-dropdown-item ${objectTypeFilter === 'table' ? 'active' : ''}`}
                            onClick={() => handleFilterSelect('table')}
                          >
                            {objectTypeFilter === 'table' && (
                              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                                <path d="M13.5 2L6 9.5 2.5 6l1.41-1.41L6 6.68l6.09-6.09L13.5 2z"/>
                              </svg>
                            )}
                            <span>表</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="list-col-tags">标签</div>
                  <div className="list-col-source">
                    <div className={`source-filter-wrapper ${isSourceFilterDropdownOpen ? 'active' : ''}`}>
                      <button 
                        className="source-filter-btn"
                        onClick={() => setIsSourceFilterDropdownOpen(!isSourceFilterDropdownOpen)}
                      >
                        <span>来源</span>
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
                          <path d="M6 9L1 4h10L6 9z"/>
                        </svg>
                      </button>
                      {isSourceFilterDropdownOpen && (
                        <div className="filter-dropdown">
                          <div 
                            className={`filter-dropdown-item ${sourceFilter === 'all' ? 'active' : ''}`}
                            onClick={() => handleSourceFilterSelect('all')}
                          >
                            {sourceFilter === 'all' && (
                              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                                <path d="M13.5 2L6 9.5 2.5 6l1.41-1.41L6 6.68l6.09-6.09L13.5 2z"/>
                              </svg>
                            )}
                            <span>全部来源</span>
                          </div>
                          {allSources.length === 0 ? (
                            <div className="filter-dropdown-item disabled">
                              <span>暂无来源</span>
                            </div>
                          ) : (
                            allSources.map((source) => (
                              <div 
                                key={source}
                                className={`filter-dropdown-item ${sourceFilter === source ? 'active' : ''}`}
                                onClick={() => handleSourceFilterSelect(source)}
                              >
                                {sourceFilter === source && (
                                  <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                                    <path d="M13.5 2L6 9.5 2.5 6l1.41-1.41L6 6.68l6.09-6.09L13.5 2z"/>
                                  </svg>
                                )}
                                <span>{source}</span>
                              </div>
                            ))
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="list-col-desc">描述</div>
                  <div className="list-col-size">大小</div>
                  <div className="list-col-time">创建时间</div>
                  <div className="list-col-creator">创建人</div>
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
                    <div className="list-col-tags">
                      {item.tags && Array.isArray(item.tags) && item.tags.length > 0 ? (
                        <div className="tags-container">
                          {item.tags.slice(0, 5).map((tag, index) => (
                            <span key={index} className="tag-badge">{tag}</span>
                          ))}
                          {item.tags.length > 5 && (
                            <span className="tag-more" title={item.tags.slice(5).join('、')}>
                              +{item.tags.length - 5}
                            </span>
                          )}
                        </div>
                      ) : (
                        <span style={{ color: '#999' }}>-</span>
                      )}
                    </div>
                    <div className="list-col-source">
                      <span className="source-badge">{item.source || '-'}</span>
                    </div>
                    <div className="list-col-desc">{item.objectType === 'file' ? '-' : (item.description || '-')}</div>
                    <div className="list-col-size">{getSizeDisplay(item)}</div>
                    <div className="list-col-time">{item.createTime}</div>
                    <div className="list-col-creator">{item.creator || '-'}</div>
                    <div className="list-col-actions">
                      <button 
                        className="list-action-btn"
                        onClick={() => handleOpenEditTags(item.id)}
                        title="编辑标签"
                      >
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                          <path d="M11.013 1.427a1.75 1.75 0 0 1 2.474 0l1.086 1.086a1.75 1.75 0 0 1 0 2.474l-8.61 8.61c-.21.21-.47.364-.756.445l-3.251.93a.75.75 0 0 1-.927-.928l.929-3.25c.08-.286.235-.547.445-.758l8.61-8.61Zm1.414 1.06a.25.25 0 0 0-.354 0L10.811 3.75l1.439 1.44 1.263-1.263a.25.25 0 0 0 0-.354L11.427 2.487ZM11.19 6.25L9.75 4.81l-6.286 6.287a.25.25 0 0 0-.064.108l-.558 1.953 1.953-.558a.25.25 0 0 0 .108-.064l6.286-6.286Z"/>
                        </svg>
                      </button>
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
                            onClick={() => handleDownloadObject(item)}
                            title="下载"
                          >
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                              <path d="M8 10l-3-3h2V3h2v4h2l-3 3zM3 11v2h10v-2H3z"/>
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
                            onClick={() => handleDownloadObject(item)}
                            title="下载"
                          >
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                              <path d="M8 10l-3-3h2V3h2v4h2l-3 3zM3 11v2h10v-2H3z"/>
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
      </div>
      
      {/* 标签管理模态框 */}
      <TagManagementModal
        visible={isTagManagementModalVisible}
        onClose={() => setIsTagManagementModalVisible(false)}
        allTags={allTags}
        onTagsChange={handleTagsChange}
        checkTagInUse={checkTagInUse}
      />

      {/* 编辑标签模态框 */}
      {editingItemId && (() => {
        const editingItem = savedTables.find(item => item.id === editingItemId);
        if (!editingItem) return null;
        
        // 过滤可用的标签（排除已选中的）
        const availableTags = allTags.filter(tag => !editingItemTags.includes(tag));
        const filteredAvailableTags = availableTags.filter(tag => 
          tag.toLowerCase().includes(tagSearchInput.toLowerCase())
        );

        return (
          <div className="edit-tag-modal-overlay" onClick={handleCloseEditTags}>
            <div className="edit-tag-modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="edit-tag-modal-header">
                <h3>编辑标签 - {editingItem.name}</h3>
                <button className="edit-tag-modal-close-btn" onClick={handleCloseEditTags}>
                  ✕
                </button>
              </div>
              <div className="edit-tag-modal-body">
                {/* 当前标签 */}
                <div className="edit-tag-section">
                  <div className="edit-tag-section-title">当前标签</div>
                  <div className="edit-tag-list">
                    {editingItemTags.length === 0 ? (
                      <div className="edit-tag-empty">暂无标签</div>
                    ) : (
                      editingItemTags.map((tag) => (
                        <span key={tag} className="edit-tag-badge">
                          {tag}
                          <button
                            className="edit-tag-remove-btn"
                            onClick={() => handleRemoveTagFromEdit(tag)}
                            title="移除标签"
                          >
                            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                              <path d="M3 3l6 6M9 3l-6 6"/>
                            </svg>
                          </button>
                        </span>
                      ))
                    )}
                  </div>
                </div>

                {/* 添加标签 */}
                <div className="edit-tag-section">
                  <div className="edit-tag-section-title">添加标签</div>
                  <div className="edit-tag-dropdown-wrapper">
                    <input
                      type="text"
                      className="edit-tag-input"
                      placeholder="搜索或输入标签名称"
                      value={tagSearchInput}
                      onChange={(e) => {
                        setTagSearchInput(e.target.value);
                        setIsTagDropdownOpen(true);
                      }}
                      onFocus={() => setIsTagDropdownOpen(true)}
                    />
                    {isTagDropdownOpen && (filteredAvailableTags.length > 0 || tagSearchInput.trim()) && (
                      <div className="edit-tag-dropdown">
                        {filteredAvailableTags.slice(0, 10).map((tag) => (
                          <div
                            key={tag}
                            className="edit-tag-dropdown-item"
                            onClick={() => handleAddTagToEdit(tag)}
                          >
                            {tag}
                          </div>
                        ))}
                        {tagSearchInput.trim() && !availableTags.includes(tagSearchInput.trim()) && (
                          <div
                            className="edit-tag-dropdown-item edit-tag-dropdown-item-new"
                            onClick={() => {
                              const newTag = tagSearchInput.trim();
                              handleAddTagToEdit(newTag);
                              // 如果新标签不在allTags中，添加到allTags
                              if (!allTags.includes(newTag)) {
                                setAllTags([...allTags, newTag]);
                              }
                            }}
                          >
                            <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
                              <path d="M7 0C3.13 0 0 3.13 0 7s3.13 7 7 7 7-3.13 7-7-3.13-7-7-7zm0 12.6c-3.09 0-5.6-2.51-5.6-5.6S3.91 1.4 7 1.4s5.6 2.51 5.6 5.6-2.51 5.6-5.6 5.6z"/>
                              <path d="M7 3.5c-.38 0-.7.32-.7.7v1.4H4.9c-.38 0-.7.32-.7.7s.32.7.7.7h1.4v1.4c0 .38.32.7.7.7s.7-.32.7-.7V6.3h1.4c.38 0 .7-.32.7-.7s-.32-.7-.7-.7H7.7V4.2c0-.38-.32-.7-.7-.7z"/>
                            </svg>
                            创建标签 "{tagSearchInput.trim()}"
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="edit-tag-modal-footer">
                <button className="edit-tag-cancel-btn" onClick={handleCloseEditTags}>
                  取消
                </button>
                <button className="edit-tag-save-btn" onClick={handleSaveEditTags}>
                  保存
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
};

export default DataCenter;

