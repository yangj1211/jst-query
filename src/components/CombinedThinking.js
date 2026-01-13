import React, { useState, useEffect, useRef } from 'react';
import { CheckOutlined, LoadingOutlined, DownOutlined, RightOutlined } from '@ant-design/icons';
import { Tree } from 'antd';
import './CombinedThinking.css';

/**
 * 合并的意图识别和思考过程组件
 * @param {Object} props
 * @param {Object} props.intentData - 意图数据 {description, status}
 * @param {Object} props.config - 配置信息 {source, scope, caliber}
 * @param {Object} props.dataInfo - 相关数据信息 {metrics: [], dimensions: []}
 * @param {Array} props.steps - 思考步骤列表
 * @param {boolean} props.isComplete - 是否全部完成
 * @param {boolean} props.isStopped - 是否已停止
 */
const CombinedThinking = ({ intentData = {}, config = {}, dataInfo = {}, steps = [], isComplete = false, isStopped = false }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [visibleSteps, setVisibleSteps] = useState([]); // 当前可见的步骤数量
  const [expandedKeys, setExpandedKeys] = useState([]); // 树形结构展开的节点
  const prevFilteredTreeDataRef = useRef(null); // 用于跟踪数据变化

  const { status = 'loading' } = intentData;
  const { time = '', metrics = [], dimensions = [] } = dataInfo;
  const {
    dataObject = '默认对象',
    source = '全部数据',
    scope = '集团总数据',
    scopeTreeData = null,
    scopeSelectedKeys = [],
    scopeLabel = '',
    filter = '全部数据',
    caliber = '内部管理用（管口）',
  } = config;

  // 判断当前阶段
  const currentPhase = isStopped ? 'stopped' : (status === 'done' ? (isComplete ? 'completed' : 'thinking') : 'recognizing');

  // 过滤树形数据，只保留选中的节点及其必要的父节点
  const filterTreeData = (treeData, selectedKeys) => {
    if (!treeData || selectedKeys.length === 0) return [];

    const filterNode = (node) => {
      const isSelected = selectedKeys.includes(node.key);
      
      // 递归过滤子节点
      let filteredChildren = null;
      if (node.children && node.children.length > 0) {
        filteredChildren = node.children
          .map(child => filterNode(child))
          .filter(Boolean);
      }

      // 如果当前节点被选中，或者有被选中的子节点，则保留该节点
      if (isSelected || (filteredChildren && filteredChildren.length > 0)) {
        return {
          ...node,
          children: filteredChildren && filteredChildren.length > 0 ? filteredChildren : undefined
        };
      }

      return null;
    };

    return treeData.map(filterNode).filter(Boolean);
  };

  // 计算过滤后的树形数据
  const filteredTreeData = scopeTreeData && scopeSelectedKeys.length > 0
    ? filterTreeData(scopeTreeData, scopeSelectedKeys)
    : null;

  // 初始化展开的节点：默认展开所有有子节点的节点（因为只显示选中的节点，所以全部展开）
  useEffect(() => {
    // 检查数据是否真正变化（通过比较 JSON 字符串）
    const currentDataStr = JSON.stringify(filteredTreeData);
    const prevDataStr = JSON.stringify(prevFilteredTreeDataRef.current);
    
    if (filteredTreeData && filteredTreeData.length > 0) {
      // 只在数据真正变化时才重新初始化展开状态
      if (currentDataStr !== prevDataStr) {
        const getAllParentKeys = (nodes) => {
          const keys = [];
          nodes.forEach((node) => {
            if (node.children && node.children.length > 0) {
              keys.push(node.key);
              keys.push(...getAllParentKeys(node.children));
            }
          });
          return keys;
        };
        setExpandedKeys(getAllParentKeys(filteredTreeData));
        prevFilteredTreeDataRef.current = filteredTreeData;
      }
    } else {
      // 当数据清空时，重置展开状态
      setExpandedKeys([]);
      prevFilteredTreeDataRef.current = null;
    }
  }, [filteredTreeData]);

  // 流式输出步骤
  useEffect(() => {
    if (status === 'done' && steps.length > 0) {
      if (isStopped) {
        // 如果已停止，只显示已完成的步骤（status === 'done' 的步骤）
        const completedStepIndices = steps
          .map((step, index) => step.status === 'done' ? index : -1)
          .filter(index => index !== -1);
        setVisibleSteps(completedStepIndices);
      } else {
        // 重置可见步骤
        setVisibleSteps([]);
        
        // 存储所有定时器ID
        const timers = [];
        
        // 逐个显示步骤
        steps.forEach((step, index) => {
          const delay = index === 0 ? 300 : index * 500 + 300; // 第一个步骤300ms，之后每个间隔500ms
          const timer = setTimeout(() => {
            setVisibleSteps(prev => [...prev, index]);
          }, delay);
          timers.push(timer);
        });
        
        // 清理函数
        return () => {
          timers.forEach(timer => clearTimeout(timer));
        };
      }
    } else {
      // 如果状态不是done，清空可见步骤
      setVisibleSteps([]);
    }
  }, [status, steps, isStopped]);

  return (
    <div className={`combined-thinking-wrapper ${!isExpanded ? 'collapsed' : ''}`}>
      <div className="combined-header" onClick={() => setIsExpanded(!isExpanded)}>
        <div className="combined-header-left">
          {currentPhase === 'completed' ? (
            <CheckOutlined style={{ color: '#52c41a', fontSize: isExpanded ? 16 : 14 }} />
          ) : currentPhase === 'stopped' ? (
            <CheckOutlined style={{ color: '#999', fontSize: isExpanded ? 16 : 14 }} />
          ) : (
            <LoadingOutlined style={{ fontSize: isExpanded ? 16 : 14, color: currentPhase === 'recognizing' ? '#1677ff' : '#f59e0b' }} spin />
          )}
          <span className="combined-title">
            {currentPhase === 'completed' ? '思考完成' : currentPhase === 'stopped' ? '已停止' : currentPhase === 'recognizing' ? '意图识别' : '思考中'}
          </span>
          {isExpanded ? <DownOutlined style={{ fontSize: 12 }} /> : <RightOutlined style={{ fontSize: 10 }} />}
        </div>
      </div>
      
      {isExpanded && (
        <div className="combined-content">
          {/* 数据配置信息（白色区域） */}
          <div className="intent-section">
            {/* 数据配置信息 */}
            <div className="config-info">
              <div className="config-item">
                <span className="config-key">• 数据对象：</span>
                <span className="config-value">{dataObject}</span>
              </div>
              <div className="config-item">
                <span className="config-key">• 数据口径：</span>
                <span className="config-value">{caliber}</span>
              </div>
              {config?.filter && (
                <div className="config-item">
                  <span className="config-key">• 过滤条件：</span>
                  <span className="config-value">{config.filter}</span>
                </div>
              )}
              <div className="config-item">
                <span className="config-key">• 数据来源：</span>
                <span className="config-value">
                  {source.split('\n').map((line, idx) => (
                    <React.Fragment key={idx}>
                      {line}
                      {idx < source.split('\n').length - 1 && <br />}
                    </React.Fragment>
                  ))}
                </span>
              </div>
              <div className="config-item">
                <span className="config-key">• 数据范围：</span>
                <span className="config-value">
                  {filteredTreeData && filteredTreeData.length > 0 ? (
                    <div className="scope-tree-container">
                      <Tree
                        treeData={filteredTreeData}
                        expandedKeys={expandedKeys}
                        onExpand={(keys) => {
                          setExpandedKeys(keys);
                        }}
                        showLine={false}
                        switcherIcon={({ expanded }) => expanded ? <DownOutlined /> : <RightOutlined />}
                        style={{ 
                          background: 'transparent',
                          fontSize: '14px',
                          lineHeight: '1.6'
                        }}
                      />
                    </div>
                  ) : (
                    <span>{scope}</span>
                  )}
                </span>
              </div>
            </div>
          </div>

          {/* 思考过程：执行步骤（流式输出） */}
          {status === 'done' && (
            <div className="thinking-section">
              {steps.length > 0 && (
                <div className="steps-list">
                  {steps.map((step, index) => {
                    // 只显示已经在 visibleSteps 中的步骤
                    const isVisible = visibleSteps.includes(index);
                    if (!isVisible) return null;
                    
                    return (
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
                                <span className="sub-detail-key">✓ 时间：</span>
                                <span className="sub-detail-value">{time}</span>
                              </div>
                            )}
                            {metrics.length > 0 && (
                              <div className="sub-detail-item">
                                <span className="sub-detail-key">✓ 指标：</span>
                                <span className="sub-detail-value">{metrics.join('、')}</span>
                              </div>
                            )}
                            {dimensions.length > 0 && (
                              <div className="sub-detail-item">
                                <span className="sub-detail-key">✓ 维度：</span>
                                <span className="sub-detail-value">{dimensions.join('、')}</span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
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

