import React, { useState } from 'react';
import { CheckCircleOutlined, LoadingOutlined, DownOutlined, RightOutlined } from '@ant-design/icons';
import './CombinedThinking.css';

/**
 * 合并的意图识别和思考过程组件
 * @param {Object} props
 * @param {Object} props.intentData - 意图数据 {description, status}
 * @param {Object} props.config - 配置信息 {source, scope, caliber}
 * @param {Object} props.dataInfo - 相关数据信息 {metrics: [], dimensions: []}
 * @param {Array} props.steps - 思考步骤列表
 * @param {boolean} props.isComplete - 是否全部完成
 */
const CombinedThinking = ({ intentData = {}, config = {}, dataInfo = {}, steps = [], isComplete = false }) => {
  const [isExpanded, setIsExpanded] = useState(true);

  const { description = '', status = 'loading' } = intentData;
  const { time = '', metrics = [], dimensions = [] } = dataInfo;
  const { source = '全部数据', scope = '集团总数据', caliber = '内部管理用（管口）' } = config;

  // 判断当前阶段
  const currentPhase = status === 'done' ? (isComplete ? 'completed' : 'thinking') : 'recognizing';

  return (
    <div className="combined-thinking-wrapper">
      <div className="combined-header" onClick={() => setIsExpanded(!isExpanded)}>
        <div className="combined-header-left">
          {currentPhase === 'completed' ? (
            <CheckCircleOutlined style={{ color: '#52c41a', fontSize: 16 }} />
          ) : (
            <LoadingOutlined style={{ fontSize: 16, color: currentPhase === 'recognizing' ? '#1677ff' : '#f59e0b' }} spin />
          )}
          <span className="combined-title">
            {currentPhase === 'completed' ? '查询完成' : currentPhase === 'recognizing' ? '意图识别' : '查询完成'}
          </span>
          {isExpanded ? <DownOutlined style={{ fontSize: 12 }} /> : <RightOutlined style={{ fontSize: 12 }} />}
        </div>
      </div>
      
      {isExpanded && (
        <div className="combined-content">
          {/* 数据配置信息（白色区域） */}
          <div className="intent-section">
            {/* 数据配置信息 */}
            <div className="config-info">
              <div className="config-item">
                <span className="config-key">• 数据来源：</span>
                <span className="config-value">{source}</span>
              </div>
              <div className="config-item">
                <span className="config-key">• 数据范围：</span>
                <span className="config-value">{scope}</span>
              </div>
              <div className="config-item">
                <span className="config-key">• 数据口径：</span>
                <span className="config-value">{caliber}</span>
              </div>
            </div>
          </div>

          {/* 思考过程：执行步骤 */}
          {status === 'done' && (
            <div className="thinking-section">
              {steps.length > 0 && (
                <div className="steps-list">
                  {steps.map((step, index) => (
                    <div key={index} className="step-wrapper">
                      <div className={`step-item ${step.status === 'done' ? 'done' : 'loading'}`}>
                        <div className="step-marker">
                          {step.status === 'done' ? '✓' : '•'}
                        </div>
                        <div className="step-description">{step.description}</div>
                      </div>
                      {/* 在问题拆解步骤下显示详细的时间、指标和维度 */}
                      {step.showDetails && step.status === 'done' && (time || metrics.length > 0 || dimensions.length > 0) && (
                        <div className="step-sub-details">
                          {time && (
                            <div className="sub-detail-item">
                              <span className="sub-detail-key">• 时间：</span>
                              <span className="sub-detail-value">{time}</span>
                            </div>
                          )}
                          {metrics.length > 0 && (
                            <div className="sub-detail-item">
                              <span className="sub-detail-key">• 指标：</span>
                              <span className="sub-detail-value">{metrics.join('、')}</span>
                            </div>
                          )}
                          {dimensions.length > 0 && (
                            <div className="sub-detail-item">
                              <span className="sub-detail-key">• 维度：</span>
                              <span className="sub-detail-value">{dimensions.join('、')}</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 加载中提示 */}
          {!isComplete && status === 'loading' && (
            <div className="loading-hint">正在执行中</div>
          )}
        </div>
      )}
    </div>
  );
};

export default CombinedThinking;

