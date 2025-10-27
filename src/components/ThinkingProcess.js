import React from 'react';
import { Spin } from 'antd';
import './ThinkingProcess.css';

/**
 * AI思考过程展示组件
 * @param {object} props
 * @param {object} props.params - 查询参数
 * @param {string} props.params.timeRange - 时间段
 * @param {string} props.params.scope - 数据范围
 * @param {string} props.params.caliber - 数据口径
 */
const ThinkingProcess = ({ params }) => {
  return (
    <div className="thinking-process-container">
      <div className="thinking-spinner">
        <Spin size="small" />
      </div>
      <div className="thinking-content">
        <p className="thinking-title">正在处理您的请求...</p>
        <div className="thinking-params">
          <div><strong>时间段:</strong> {params.timeRange}</div>
          <div><strong>数据范围:</strong> {params.scope}</div>
          <div><strong>数据口径:</strong> {params.caliber}</div>
        </div>
      </div>
    </div>
  );
};

export default ThinkingProcess;
