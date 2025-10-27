import React, { useState } from 'react';
import { Table, Button, Tooltip } from 'antd';
import { DownOutlined, RightOutlined, DownloadOutlined, ExportOutlined } from '@ant-design/icons';
import './QueryResult.css';

/**
 * 查询结果展示组件 - 包含可折叠的参数详情
 * @param {object} props
 * @param {object} props.data - 完整数据对象
 * @param {object} props.data.params - 查询参数
 * @param {string} props.data.summary - 描述性总结
 * @param {object} props.data.tableData - antd Table所需的数据
 */
const QueryResult = ({ data }) => {
  const { params, summary, tableData } = data;
  const [isExpanded, setIsExpanded] = useState(false);

  const handleDownload = () => {
    // 模拟下载逻辑
    console.log("Downloading data...", { params, summary, tableData });
    alert('正在准备下载...');
  };

  const handleExport = () => {
    // 模拟导出逻辑
    console.log("Exporting table data...", tableData);
    alert('正在导出表格...');
  };

  return (
    <div className="query-result-wrapper">
      <div className="result-params-header">
        <Button
          type="text"
          icon={isExpanded ? <DownOutlined /> : <RightOutlined />}
          onClick={() => setIsExpanded(!isExpanded)}
          className="expand-btn"
        >
          根据您的查询
        </Button>
        <Tooltip title="下载报告">
          <Button
            type="text"
            icon={<DownloadOutlined />}
            onClick={handleDownload}
            className="header-action-btn"
          />
        </Tooltip>
      </div>

      {isExpanded && (
        <div className="params-details">
          <div><strong>时间段:</strong> {params.timeRange}</div>
          <div><strong>数据范围:</strong> {params.scope}</div>
          <div><strong>数据口径:</strong> {params.caliber}</div>
        </div>
      )}

      <div className="result-content">
        <p className="summary-text">{summary}</p>
        <div className="table-wrapper">
          <div className="table-actions">
            <Tooltip title="导出表格 (CSV)">
              <Button 
                icon={<ExportOutlined />} 
                onClick={handleExport} 
                size="small"
                className="export-btn"
              />
            </Tooltip>
          </div>
          <Table
            columns={tableData.columns}
            dataSource={tableData.dataSource}
            pagination={false}
            size="small"
            bordered
          />
        </div>
      </div>
    </div>
  );
};

export default QueryResult;
