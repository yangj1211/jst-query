import React, { useState } from 'react';
import './PageStyle.css';
import './DataImport.css';
import DateTimeRangePicker from '../components/DateTimeRangePicker';

const BackupFiles = () => {
  // 模拟备份文件数据
  const [backupFiles, setBackupFiles] = useState([
    {
      id: 1,
      fileName: '财务数据备份_20250115.xlsx',
      tableName: '财务数据表',
      uploadTime: '2025-01-15 10:30:00',
      uploader: '张三',
    },
    {
      id: 2,
      fileName: '销售数据备份_20250114.xlsx',
      tableName: '销售数据表',
      uploadTime: '2025-01-14 15:20:00',
      uploader: '李四',
    },
    {
      id: 3,
      fileName: '库存数据备份_20250113.xlsx',
      tableName: '库存数据表',
      uploadTime: '2025-01-13 09:15:00',
      uploader: '王五',
    },
    {
      id: 4,
      fileName: '客户数据备份_20250112.xlsx',
      tableName: '客户信息表',
      uploadTime: '2025-01-12 14:45:00',
      uploader: '赵六',
    },
  ]);

  // 分页状态
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // 搜索关键词
  const [fileNameKeyword, setFileNameKeyword] = useState(''); // 文件名搜索关键词
  const [tableNameKeyword, setTableNameKeyword] = useState(''); // 载入表名搜索关键词
  const [uploaderKeyword, setUploaderKeyword] = useState(''); // 上传人搜索关键词
  const [uploadTimeRange, setUploadTimeRange] = useState({ startDate: null, endDate: null }); // 上传时间范围筛选

  // 解析日期时间字符串为Date对象
  const parseDateTimeString = (dateTimeStr) => {
    if (!dateTimeStr) return null;
    const match = dateTimeStr.match(/(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2}):(\d{2})/);
    if (!match) return null;
    const [, year, month, day, hour, minute, second] = match.map(Number);
    return new Date(year, month - 1, day, hour, minute, second);
  };

  // 过滤文件列表
  const getFilteredFiles = () => {
    let filtered = backupFiles;

    // 按文件名搜索
    if (fileNameKeyword.trim()) {
      const keyword = fileNameKeyword.toLowerCase();
      filtered = filtered.filter(file => 
        file.fileName.toLowerCase().includes(keyword)
      );
    }

    // 按载入表名搜索
    if (tableNameKeyword.trim()) {
      const keyword = tableNameKeyword.toLowerCase();
      filtered = filtered.filter(file => 
        file.tableName.toLowerCase().includes(keyword)
      );
    }

    // 按上传人搜索
    if (uploaderKeyword.trim()) {
      const keyword = uploaderKeyword.toLowerCase();
      filtered = filtered.filter(file => 
        file.uploader.toLowerCase().includes(keyword)
      );
    }

    // 按上传时间范围筛选
    if (uploadTimeRange.startDate || uploadTimeRange.endDate) {
      filtered = filtered.filter(file => {
        const uploadTime = parseDateTimeString(file.uploadTime);
        if (!uploadTime) return false;

        if (uploadTimeRange.startDate && uploadTimeRange.endDate) {
          return uploadTime >= uploadTimeRange.startDate && uploadTime <= uploadTimeRange.endDate;
        } else if (uploadTimeRange.startDate) {
          return uploadTime >= uploadTimeRange.startDate;
        } else if (uploadTimeRange.endDate) {
          return uploadTime <= uploadTimeRange.endDate;
        }
        return true;
      });
    }

    return filtered;
  };

  // 计算总页数
  const getTotalPages = () => {
    return Math.ceil(getFilteredFiles().length / pageSize);
  };

  // 获取当前页的数据
  const getCurrentPageFiles = () => {
    const filtered = getFilteredFiles();
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return filtered.slice(startIndex, endIndex);
  };

  // 下载文件
  const handleDownload = (file) => {
    // 模拟下载Excel文件
    alert(`正在下载文件：${file.fileName}\n此功能需要后端API支持`);
    // 实际项目中应该调用后端API获取文件并下载
    const link = document.createElement('a');
    link.href = '#'; // 实际应该使用文件URL
    link.download = file.fileName;
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // 删除文件
  const handleDelete = (id) => {
    if (window.confirm('确定要删除这个备份文件吗？')) {
      setBackupFiles(backupFiles.filter(file => file.id !== id));
      // 如果删除后当前页没有数据，跳转到上一页
      const filtered = getFilteredFiles();
      if (filtered.length > 0 && getCurrentPageFiles().length === 1 && currentPage > 1) {
        setCurrentPage(currentPage - 1);
      }
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="header-left">
          <h2>备份文件</h2>
        </div>
      </div>
      <div className="page-content">
        {/* 搜索栏 */}
        <div className="task-search-section">
          <div className="task-search-item">
            <span className="task-search-label">文件名：</span>
            <div className="task-search-bar">
              <svg className="task-search-icon" width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M9 17A8 8 0 1 0 9 1a8 8 0 0 0 0 16zM19 19l-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <input
                type="text"
                className="task-search-input"
                placeholder="搜索文件名..."
                value={fileNameKeyword}
                onChange={(e) => {
                  setFileNameKeyword(e.target.value);
                  setCurrentPage(1);
                }}
              />
              {fileNameKeyword && (
                <button 
                  className="task-clear-search-btn" 
                  onClick={() => {
                    setFileNameKeyword('');
                    setCurrentPage(1);
                  }}
                  title="清除搜索"
                >
                  ✕
                </button>
              )}
            </div>
          </div>
          <div className="task-search-item">
            <span className="task-search-label">载入表名：</span>
            <div className="task-search-bar">
              <svg className="task-search-icon" width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M9 17A8 8 0 1 0 9 1a8 8 0 0 0 0 16zM19 19l-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <input
                type="text"
                className="task-search-input"
                placeholder="搜索载入表名..."
                value={tableNameKeyword}
                onChange={(e) => {
                  setTableNameKeyword(e.target.value);
                  setCurrentPage(1);
                }}
              />
              {tableNameKeyword && (
                <button 
                  className="task-clear-search-btn" 
                  onClick={() => {
                    setTableNameKeyword('');
                    setCurrentPage(1);
                  }}
                  title="清除搜索"
                >
                  ✕
                </button>
              )}
            </div>
          </div>
          <div className="task-search-item">
            <span className="task-search-label">上传人：</span>
            <div className="task-search-bar">
              <svg className="task-search-icon" width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M9 17A8 8 0 1 0 9 1a8 8 0 0 0 0 16zM19 19l-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <input
                type="text"
                className="task-search-input"
                placeholder="搜索上传人..."
                value={uploaderKeyword}
                onChange={(e) => {
                  setUploaderKeyword(e.target.value);
                  setCurrentPage(1);
                }}
              />
              {uploaderKeyword && (
                <button 
                  className="task-clear-search-btn" 
                  onClick={() => {
                    setUploaderKeyword('');
                    setCurrentPage(1);
                  }}
                  title="清除搜索"
                >
                  ✕
                </button>
              )}
            </div>
          </div>
          <DateTimeRangePicker
            value={uploadTimeRange}
            onChange={(range) => {
              setUploadTimeRange(range);
              setCurrentPage(1);
            }}
            placeholder="选择上传时间范围"
          />
        </div>

        {getFilteredFiles().length === 0 ? (
          <div className="empty-state">
            {(fileNameKeyword || tableNameKeyword || uploaderKeyword || uploadTimeRange.startDate || uploadTimeRange.endDate) ? '未找到匹配的备份文件' : '暂无备份文件'}
          </div>
        ) : (
          <div className="tasks-list">
            <div className="tasks-list-header" style={{ gridTemplateColumns: '1fr 200px 180px 120px 150px', minWidth: '850px' }}>
              <div className="task-col-object">文件名</div>
              <div className="task-col-createtime">载入表名</div>
              <div className="task-col-createtime">上传时间</div>
              <div className="task-col-creator">上传人</div>
              <div className="task-col-action">操作</div>
            </div>
            {getCurrentPageFiles().map((file) => (
              <div key={file.id} className="tasks-list-row" style={{ gridTemplateColumns: '1fr 200px 180px 120px 150px', minWidth: '850px' }}>
                <div className="task-col-object">{file.fileName}</div>
                <div className="task-col-createtime">{file.tableName}</div>
                <div className="task-col-createtime">{file.uploadTime}</div>
                <div className="task-col-creator">{file.uploader}</div>
                <div className="task-col-action">
                  <button
                    className="task-action-btn view-btn"
                    title="下载"
                    onClick={() => handleDownload(file)}
                  >
                    <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
                      <path d="M8 10l-3-3h2V3h2v4h2l-3 3zM3 11v2h10v-2H3z"/>
                    </svg>
                  </button>
                  <button
                    className="task-action-btn delete-btn"
                    title="删除"
                    onClick={() => handleDelete(file.id)}
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
            {getTotalPages() > 1 && (
              <div className="task-pagination">
                <div className="pagination-left">
                  <button 
                    className="page-nav-btn" 
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))} 
                    disabled={currentPage === 1}
                  >
                    <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
                      <path d="M10 2L4 8l6 6V2z"/>
                    </svg>
                  </button>
                  <span className="page-current">{currentPage}</span>
                  <button 
                    className="page-nav-btn" 
                    onClick={() => setCurrentPage(Math.min(getTotalPages(), currentPage + 1))} 
                    disabled={currentPage === getTotalPages()}
                  >
                    <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
                      <path d="M6 2v12l6-6-6-6z"/>
                    </svg>
                  </button>
                </div>
                <div className="pagination-right">
                  <select 
                    className="page-size-select" 
                    value={pageSize} 
                    onChange={(e) => {
                      setPageSize(Number(e.target.value));
                      setCurrentPage(1);
                    }}
                  >
                    <option value={10}>10条/页</option>
                    <option value={20}>20条/页</option>
                    <option value={50}>50条/页</option>
                    <option value={100}>100条/页</option>
                  </select>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default BackupFiles;

