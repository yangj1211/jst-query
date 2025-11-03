import React, { useState } from 'react';
import { LoadingOutlined, DownOutlined, RightOutlined } from '@ant-design/icons';
import './QueryThinking.css';

/**
 * 查询思考过程组件 - 包含相关数据和执行步骤
 * @param {Object} props
 * @param {Array} props.steps - 思考步骤列表，每个步骤包含 {description: string, status: 'loading'|'done'}
 * @param {Object} props.dataInfo - 相关数据信息 {metrics: [], dimensions: []}
 * @param {boolean} props.isComplete - 是否全部完成
 */
const QueryThinking = ({ steps = [], dataInfo = {}, isComplete = false }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const { metrics = [], dimensions = [] } = dataInfo;

  return (
    <div className="query-thinking-wrapper">
      <div className="thinking-header" onClick={() => setIsExpanded(!isExpanded)}>
        <div className="thinking-header-left">
          {!isComplete && <LoadingOutlined style={{ fontSize: 16, color: '#f59e0b' }} spin />}
          {isComplete && <span style={{ color: '#10b981', fontSize: 16 }}>✓</span>}
          <span className="thinking-title">{isComplete ? '查询完成' : '查询思考中'}</span>
          {isExpanded ? <DownOutlined style={{ fontSize: 12 }} /> : <RightOutlined style={{ fontSize: 12 }} />}
        </div>
      </div>
      {isExpanded && (
        <div className="thinking-content">
          {/* 相关数据 */}
          {(metrics.length > 0 || dimensions.length > 0) && (
            <div className="thinking-data-info">
              <div className="data-info-label">相关数据</div>
              {metrics.length > 0 && (
                <div className="data-info-item">
                  <span className="data-info-key">• 指标：</span>
                  <span className="data-info-value">{metrics.join('、')}</span>
                </div>
              )}
              {dimensions.length > 0 && (
                <div className="data-info-item">
                  <span className="data-info-key">• 维度：</span>
                  <span className="data-info-value">{dimensions.join('、')}</span>
                </div>
              )}
            </div>
          )}

          {/* 执行步骤 */}
          <div className="thinking-steps">
            {steps.map((step, index) => (
              <div key={index} className={`thinking-step ${step.status === 'done' ? 'done' : 'loading'}`}>
                <div className="step-marker">
                  {step.status === 'done' ? '✓' : '•'}
                </div>
                <div className="step-description">{step.description}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default QueryThinking;

