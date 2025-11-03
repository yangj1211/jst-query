import React, { useState } from 'react';
import { CheckCircleOutlined, LoadingOutlined, DownOutlined, RightOutlined } from '@ant-design/icons';
import './IntentRecognition.css';

/**
 * 意图识别组件 - 只显示识别到的用户意图
 * @param {Object} props
 * @param {Object} props.intentData - 识别的意图数据，包含 {description, status}
 * @param {boolean} props.isComplete - 是否识别完成
 */
const IntentRecognition = ({ intentData = {}, isComplete = false }) => {
  const [isExpanded, setIsExpanded] = useState(true);

  const { description = '', status = 'loading' } = intentData;

  return (
    <div className="intent-recognition-wrapper">
      <div className="intent-header" onClick={() => setIsExpanded(!isExpanded)}>
        <div className="intent-header-left">
          {status === 'done' ? (
            <CheckCircleOutlined style={{ color: '#52c41a', fontSize: 16 }} />
          ) : (
            <LoadingOutlined style={{ fontSize: 16, color: '#1677ff' }} spin />
          )}
          <span className="intent-title">意图识别</span>
          {isExpanded ? <DownOutlined style={{ fontSize: 12 }} /> : <RightOutlined style={{ fontSize: 12 }} />}
        </div>
      </div>
      
      {isExpanded && (
        <div className="intent-content">
          <div className="intent-section">
            <div className="intent-label">识别到用户意图为：</div>
            <div className="intent-text">{description}</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default IntentRecognition;

