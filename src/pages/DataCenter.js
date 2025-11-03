import React, { useState } from 'react';
import './PageStyle.css';
import './DataCenter.css';

const DataCenter = () => {
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
      description: '用户信息表',
      objectType: 'table', // 表类型
      fieldCount: 3,
      rowCount: 1523,
      createTime: '2025-10-20 10:30:00',
      updateTime: '2025-10-20 10:30:00',
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
      objectType: 'table', // 表类型
      fieldCount: 2,
      rowCount: 8942,
      createTime: '2025-10-21 14:20:00',
      updateTime: '2025-10-21 14:20:00',
      fields: [
        { id: 1, name: '订单编号', type: 'varchar', length: 50, unique: true, description: '订单唯一标识' },
        { id: 2, name: '金额', type: 'decimal', precision: 10, scale: 2, unique: false, description: '订单金额' }
      ]
    }
  ]);
  const [viewingTableId, setViewingTableId] = useState(null); // 当前查看详情的表ID
  const [searchKeyword, setSearchKeyword] = useState(''); // 搜索关键词
  const [currentPage, setCurrentPage] = useState(1); // 当前页码
  const [pageSize] = useState(10); // 每页显示条数
  const [detailTab, setDetailTab] = useState('fields'); // 表详情tab: 'fields' 或 'data'

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
      </div>
    </div>
  );
};

export default DataCenter;
