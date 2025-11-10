import React, { useState, useEffect, useMemo } from 'react';
import { Table, Button, Tooltip, Tag, Dropdown, message } from 'antd';
import { DownloadOutlined, DatabaseOutlined, TableOutlined, BarChartOutlined, FileOutlined, DatabaseOutlined as DbIcon, LineChartOutlined, PieChartOutlined } from '@ant-design/icons';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer } from 'recharts';
import { useFilePreview } from '../contexts/FilePreviewContext';
import './QueryResult.css';

/**
 * 查询结果展示组件 - 支持多个表格块，每个块有独立来源
 * data: {
 *   summary: string,
 *   resultBlocks?: [{ title?: string, tableData, sources: Source[] }]
 *   // 兼容旧结构
 *   tableData?, sources?
 * }
 */
const StreamingText = ({
  text,
  as: Component = 'p',
  className,
  style,
  chunkSize = 6,
  stepDelay = 120,
  startDelay = 80,
}) => {
  const [visibleText, setVisibleText] = useState(text || '');

  useEffect(() => {
    if (!text) {
      setVisibleText('');
      return;
    }

    const normalized = text;
    const chars = Array.from(normalized);
    const effectiveChunk = Math.max(1, chunkSize);
    const segments = [];
    for (let i = 0; i < chars.length; i += effectiveChunk) {
      segments.push(chars.slice(i, i + effectiveChunk).join(''));
    }

    if (segments.length <= 1) {
      setVisibleText(normalized);
      return;
    }

    setVisibleText(segments[0]);
    let index = 1;
    const timers = [];

    const emit = () => {
      setVisibleText((prev) => prev + (segments[index] || ''));
      index += 1;
      if (index < segments.length) {
        timers.push(setTimeout(emit, stepDelay));
      }
    };

    timers.push(setTimeout(emit, startDelay));

    return () => {
      timers.forEach(clearTimeout);
    };
  }, [text, chunkSize, stepDelay, startDelay]);

  if (!text) {
    return null;
  }

  return (
    <Component className={className} style={style}>
      {visibleText}
    </Component>
  );
};

const StreamingParagraphs = ({
  text,
  as: Component = 'div',
  className,
  paragraphClass,
  paragraphSpacing = 16,
  chunkSize = 8,
  stepDelay = 120,
  initialDelay = 140,
  paragraphDelay = 260,
  textStyle,
}) => {
  const paragraphs = useMemo(() => {
    if (!text) return [];
    const splitted = String(text)
      .split(/\n\s*\n/)
      .map(p => p.trim())
      .filter(Boolean);
    if (splitted.length === 0 && String(text).trim()) {
      return [String(text).trim()];
    }
    return splitted;
  }, [text]);

  const [visibleCount, setVisibleCount] = useState(() => (paragraphs.length > 0 ? 1 : 0));

  useEffect(() => {
    if (paragraphs.length === 0) {
      setVisibleCount(0);
      return;
    }

    setVisibleCount(1);
    const timers = [];
    for (let i = 1; i < paragraphs.length; i += 1) {
      const timer = setTimeout(() => {
        setVisibleCount(prev => (prev < i + 1 ? i + 1 : prev));
      }, initialDelay + paragraphDelay * i);
      timers.push(timer);
    }

    return () => {
      timers.forEach(clearTimeout);
    };
  }, [paragraphs, initialDelay, paragraphDelay]);

  if (paragraphs.length === 0) {
    return null;
  }

  return (
    <Component className={className}>
      {paragraphs.slice(0, visibleCount).map((paragraph, idx) => (
        <StreamingText
          key={`streaming-paragraph-${idx}`}
          text={paragraph}
          as="div"
          className={paragraphClass}
          style={{
            marginBottom: idx < visibleCount - 1 ? paragraphSpacing : 0,
            ...textStyle,
          }}
          chunkSize={chunkSize}
          stepDelay={stepDelay}
          startDelay={idx === 0 ? initialDelay : 80}
        />
      ))}
    </Component>
  );
};

const QueryResult = ({ data }) => {
  const { summary } = data;
  const { openPreview, isPreviewVisible } = useFilePreview();
  
  // 兼容老结构
  const blocks = Array.isArray(data.resultBlocks)
    ? data.resultBlocks
    : [{ tableData: data.tableData, sources: data.sources || [] }];

  // 为每个 block 维护独立的视图状态
  const [activeViews, setActiveViews] = useState(
    blocks.map(() => 'table')
  );
  
  // 为每个 block 维护独立的图表类型状态
  const [chartTypes, setChartTypes] = useState(
    blocks.map(() => 'bar')
  );
  
  // 分析部分的维度表格视图状态
  const [dimensionView, setDimensionView] = useState('table');
  const [dimensionChartType, setDimensionChartType] = useState('bar');
  
  // 引用数字的选中状态：记录哪些引用被点击了 {refKey: boolean}
  const [activeReferences, setActiveReferences] = useState({});

  // 当预览器关闭时，清除所有点亮的状态
  useEffect(() => {
    if (!isPreviewVisible) {
      setActiveReferences({});
    }
  }, [isPreviewVisible]);

  useEffect(() => {
    setActiveViews(prev => {
      if (prev.length === blocks.length) return prev;
      const next = [...prev];
      while (next.length < blocks.length) {
        next.push('table');
      }
      return next.slice(0, blocks.length);
    });

    setChartTypes(prev => {
      if (prev.length === blocks.length) return prev;
      const next = [...prev];
      while (next.length < blocks.length) {
        next.push('bar');
      }
      return next.slice(0, blocks.length);
    });
  }, [blocks.length]);

  const handleViewChange = (blockIdx, view) => {
    setActiveViews(prev => {
      const newViews = [...prev];
      newViews[blockIdx] = view;
      return newViews;
    });
  };

  const handleChartTypeChange = (blockIdx, chartType) => {
    setChartTypes(prev => {
      const newTypes = [...prev];
      newTypes[blockIdx] = chartType;
      return newTypes;
    });
  };

  /**
   * 切换引用数字的选中状态（单选模式：同一文件只有一个数字可以被选中）
   */
  const toggleReferenceActive = (refKey) => {
    setActiveReferences(prev => {
      // 提取当前 refKey 的前缀（去掉最后的索引部分）
      // refKey 格式: prefix-sourceIndex-refIndex
      const parts = refKey.split('-');
      const prefix = parts.slice(0, -1).join('-'); // 获取前缀和 sourceIndex
      
      // 如果当前数字已经选中，则取消选中
      if (prev[refKey]) {
        const newState = { ...prev };
        delete newState[refKey];
        return newState;
      }
      
      // 否则，先清除同一文件下所有其他数字的选中状态
      const newState = {};
      Object.keys(prev).forEach(key => {
        // 如果不是同一文件下的引用，保留其状态
        if (!key.startsWith(prefix + '-')) {
          newState[key] = prev[key];
        }
      });
      
      // 设置当前点击的数字为选中状态
      newState[refKey] = true;
      return newState;
    });
  };

  /**
   * 渲染数据来源
   */
  const renderDataSources = (sources, prefix = '') => {
    if (!Array.isArray(sources) || sources.length === 0) {
      return <span style={{ color: '#999', fontSize: '12px' }}>暂无数据来源</span>;
    }

    return sources.map((source, i) => {
      const isFile = source.type === 'excel' || source.type === 'pdf';
      const hasReferences = isFile && source.references && source.references.length > 0;
      
      // 对于文件类型，统一显示 .pdf 后缀
      let displayName = source.name;
      if (isFile) {
        // 先去掉原有后缀
        const nameWithoutExt = source.name.replace(/\.(xlsx?|pdf|docx?)$/i, '');
        // 统一添加 .pdf 后缀
        displayName = nameWithoutExt + '.pdf';
      }

      // 获取原始文件名或表名（用于 hover 提示）
      // 显示名统一显示为 .pdf 后缀，hover 时显示原始完整文件名或表名
      let tooltipTitle = null;
      if (isFile) {
        // 对于文件类型，优先显示原始文件名（source.name），如果没有则显示完整路径
        // 这样可以在文件名过长时，通过hover看到完整名称
        tooltipTitle = source.name || source.fullPath || source.path;
      } else {
        // 对于表类型，显示用户友好的表名（source.name），而不是技术性表名
        // 这样可以在表名过长时，通过hover看到完整名称
        // 总是显示 source.name（用户友好名称），即使与 displayName 相同也可以显示完整名称
        tooltipTitle = source.name || source.fullPath || source.path;
      }

      return (
        <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
          <Tooltip title={tooltipTitle}>
            <Button
              type="link"
              icon={isFile ? <FileOutlined /> : <DbIcon />}
              size="small"
              className="source-link"
              onClick={() => console.log('查看来源:', source)}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}
            >
              {displayName}
              {isFile && <Tag size="small" color="orange">文件</Tag>}
              {source.type === 'database' && <Tag size="small" color="blue">表</Tag>}
            </Button>
          </Tooltip>
          
          {/* 如果是文件，在后面显示圆形数字（不在 Tooltip 内） */}
          {isFile && (
            <span style={{ display: 'inline-flex', gap: 4, marginLeft: 4 }}>
              {hasReferences ? (
                // 如果有引用，显示所有引用数字
                source.references.map((ref, refIdx) => {
                  const refKey = `${prefix}-${i}-${refIdx}`;
                  const isActive = activeReferences[refKey];
                  
                  return (
                    <span 
                      key={refIdx}
                      onClick={(e) => {
                        e.stopPropagation(); // 阻止事件冒泡到Button
                        toggleReferenceActive(refKey);
                        // 打开文件预览器
                        openPreview({
                          name: displayName || source.name,
                          type: source.type,
                          path: source.fullPath || source.path || tooltipTitle,
                          content: ref.content || null,
                        });
                      }}
                      style={{ 
                        display: 'inline-block', 
                        width: 18, 
                        height: 18, 
                        lineHeight: '18px',
                        textAlign: 'center',
                        background: isActive ? '#1890ff' : '#d9d9d9',
                        color: '#fff',
                        borderRadius: '50%',
                        fontSize: 11,
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        transition: 'background 0.2s'
                      }}
                      title={ref.location || `引用位置 ${refIdx + 1}`}
                    >
                      {refIdx + 1}
                    </span>
                  );
                })
              ) : (
                // 如果没有引用，显示一个序号圆圈数字
                <span 
                  onClick={(e) => {
                    e.stopPropagation(); // 阻止事件冒泡到Button
                    // 打开文件预览器
                    openPreview({
                      name: displayName || source.name,
                      type: source.type,
                      path: source.fullPath || source.path || tooltipTitle,
                      content: null,
                    });
                  }}
                  style={{ 
                    display: 'inline-block', 
                    width: 18, 
                    height: 18, 
                    lineHeight: '18px',
                    textAlign: 'center',
                    background: '#d9d9d9',
                    color: '#fff',
                    borderRadius: '50%',
                    fontSize: 11,
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    transition: 'background 0.2s'
                  }}
                  title="点击预览文件"
                >
                  {i + 1}
                </span>
              )}
            </span>
          )}
        </span>
      );
    });
  };

  /**
   * 将表格数据转换为图表数据格式
   */
  const convertTableDataToChartData = (tableData) => {
    if (!tableData || !tableData.columns || !tableData.dataSource) {
      return { chartData: [], xField: '', yFields: [] };
    }

    const { columns, dataSource } = tableData;
    
    // 第一列作为 X 轴（通常是名称、日期等）
    const xField = columns[0]?.dataIndex || 'name';
    
    // 其他数值列作为 Y 轴数据
    const yFields = columns.slice(1)
      .filter(col => col.dataIndex !== 'key')
      .map(col => ({
        dataIndex: col.dataIndex,
        title: col.title
      }));

    // 转换数据格式
    const chartData = dataSource.map(row => {
      const item = { name: row[xField] };
      yFields.forEach(field => {
        const value = row[field.dataIndex];
        // 尝试转换为数字，去除单位和百分号
        if (typeof value === 'string') {
          const numMatch = value.replace(/[^\d.-]/g, '');
          item[field.dataIndex] = numMatch ? parseFloat(numMatch) : 0;
        } else {
          item[field.dataIndex] = value || 0;
        }
      });
      return item;
    });

    return { chartData, xField, yFields };
  };

  /**
   * 渲染图表
   */
  const renderChart = (tableData, chartType) => {
    const { chartData, yFields } = convertTableDataToChartData(tableData); // xField is returned but not used in render

    if (!chartData.length || !yFields.length) {
      return (
        <div style={{ padding: '40px', textAlign: 'center', color: '#999' }}>
          暂无可展示的图表数据
        </div>
      );
    }

    // 使用柔和、饱和度较低的配色方案
    const COLORS = [
      '#5B8FF9', // 柔和蓝
      '#61DDAA', // 柔和绿
      '#F6BD16', // 柔和黄
      '#E8684A', // 柔和红
      '#9270CA', // 柔和紫
      '#5AD8A6', // 柔和青
      '#FF9845', // 柔和橙
      '#5D7092'  // 柔和灰蓝
    ];

    // 柱状图
    if (chartType === 'bar') {
      return (
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <RechartsTooltip />
            <Legend />
            {yFields.map((field, idx) => (
              <Bar 
                key={field.dataIndex} 
                dataKey={field.dataIndex} 
                fill={COLORS[idx % COLORS.length]} 
                name={field.title}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      );
    }

    // 折线图
    if (chartType === 'line') {
      return (
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <RechartsTooltip />
            <Legend />
            {yFields.map((field, idx) => (
              <Line 
                key={field.dataIndex} 
                type="monotone" 
                dataKey={field.dataIndex} 
                stroke={COLORS[idx % COLORS.length]} 
                strokeWidth={2}
                name={field.title}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      );
    }

    // 饼图（只展示第一个数值字段）
    if (chartType === 'pie') {
      const pieData = chartData.map(item => ({
        name: item.name,
        value: item[yFields[0].dataIndex]
      }));

      return (
        <ResponsiveContainer width="100%" height={400}>
          <PieChart>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
              outerRadius={120}
              fill="#8884d8"
              dataKey="value"
            >
              {pieData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <RechartsTooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      );
    }

    return null;
  };

  const handleExport = (block) => {
    console.log('Exporting table block...', block);
    alert('正在导出表格...');
  };

  /**
   * 添加表格到仪表盘
   * 注意：此函数目前未使用（相关按钮已注释），保留以备将来使用
   */
  // eslint-disable-next-line no-unused-vars
  const handleAddToDashboard = (block, blockIdx, viewType, chartType) => {
    // 获取当前显示的内容配置
    const dashboardItem = {
      id: `dashboard_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      title: block.title || '未命名图表',
      tableData: block.tableData,
      sources: block.sources,
      viewType: viewType, // 'table' or 'chart'
      chartType: chartType, // 'bar', 'line', 'pie'
      addedTime: new Date().toISOString()
    };

    // 从 localStorage 获取现有的仪表盘数据
    const existingDashboard = JSON.parse(localStorage.getItem('dashboardItems') || '[]');
    
    // 添加新项目
    existingDashboard.push(dashboardItem);
    
    // 保存到 localStorage
    localStorage.setItem('dashboardItems', JSON.stringify(existingDashboard));
    
    // 显示成功消息
    message.success({
      content: `已添加"${block.title || '图表'}"到仪表盘`,
      duration: 2
    });
    
    console.log('Added to dashboard:', dashboardItem);
  };

  return (
    <div className="query-result-wrapper">
      <div className="result-content">
        {summary && (
          <StreamingText
            key="summary"
            text={summary}
            className="summary-text"
            chunkSize={6}
            stepDelay={110}
            startDelay={60}
          />
        )}

        {/* 查询结果表格 - 先显示 */}
        {blocks.map((block, idx) => (
          <div key={idx} style={{ marginBottom: idx < blocks.length - 1 ? 24 : 0 }}>
            {/* 如果没有 tableData，只显示文字描述和数据来源 */}
            {!block.tableData ? (
              <>
                {block.summary && <p className="summary-text">{block.summary}</p>}
                {block.description && (
                  <StreamingText
                    key={`block-desc-${idx}`}
                    text={block.description}
                    className="block-description"
                    style={{ whiteSpace: 'pre-line' }}
                    chunkSize={8}
                    stepDelay={120}
                    startDelay={120}
                  />
                )}
                {/* 数据来源区域 */}
                {block.sources && block.sources.length > 0 && (
                  <div className="data-sources" style={{ marginTop: 16 }}>
                    <div className="sources-label">数据来源:</div>
                    <div className="sources-list">
                      {renderDataSources(block.sources, `block-${idx}`)}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <>
                {block.description && (
                  <StreamingText
                    key={`block-desc-bottom-${idx}`}
                    text={block.description}
                    className="block-description"
                    chunkSize={8}
                    stepDelay={120}
                    startDelay={120}
                  />
                )}
                <div className="result-block" style={{ marginBottom: idx === blocks.length - 1 ? 16 : 0 }}>
                  <div className="block-header">
                    {block.title && <h4 className="block-title">{block.title}</h4>}
                    <div className="table-actions">
                  <Tooltip title="表格">
                    <Button 
                      icon={<TableOutlined />} 
                      type={activeViews[idx] === 'table' ? 'primary' : 'default'} 
                      size="small" 
                      className="table-action-btn"
                      onClick={() => handleViewChange(idx, 'table')}
                    />
                  </Tooltip>
                  <Dropdown
                    menu={{
                      items: [
                        {
                          key: 'bar',
                          icon: <BarChartOutlined />,
                          label: '柱状图',
                          onClick: () => {
                            handleViewChange(idx, 'chart');
                            handleChartTypeChange(idx, 'bar');
                          }
                        },
                        {
                          key: 'line',
                          icon: <LineChartOutlined />,
                          label: '折线图',
                          onClick: () => {
                            handleViewChange(idx, 'chart');
                            handleChartTypeChange(idx, 'line');
                          }
                        },
                        {
                          key: 'pie',
                          icon: <PieChartOutlined />,
                          label: '饼状图',
                          onClick: () => {
                            handleViewChange(idx, 'chart');
                            handleChartTypeChange(idx, 'pie');
                          }
                        }
                      ],
                      selectable: true,
                      selectedKeys: [chartTypes[idx]]
                    }}
                    trigger={['click']}
                  >
                    <Tooltip title="图表">
                      <Button 
                        icon={<BarChartOutlined />} 
                        type={activeViews[idx] === 'chart' ? 'primary' : 'default'} 
                        size="small" 
                        className="table-action-btn"
                      />
                    </Tooltip>
                  </Dropdown>
                  <Tooltip title="查看SQL">
                    <Button 
                      icon={<DatabaseOutlined />} 
                      size="small" 
                      className="table-action-btn" 
                    />
                  </Tooltip>
                  <Tooltip title="导出">
                    <Button 
                      icon={<DownloadOutlined />} 
                      onClick={() => handleExport(block)} 
                      size="small" 
                      className="table-action-btn" 
                    />
                  </Tooltip>
                  {/* 添加到仪表盘按钮已隐藏（代码保留，取消注释即可恢复） */}
                  {/* <Tooltip title="添加到仪表盘">
                    <Button 
                      icon={<PlusSquareOutlined />} 
                      onClick={() => handleAddToDashboard(block, idx, activeViews[idx], chartTypes[idx])} 
                      size="small" 
                      className="table-action-btn" 
                    />
                  </Tooltip> */}
                </div>
              </div>
              <div className="table-wrapper">
              {activeViews[idx] === 'table' && (
                <Table
                  columns={block.tableData?.columns || []}
                  dataSource={block.tableData?.dataSource || []}
                  pagination={false}
                  size="middle"
                  bordered
                  className="custom-result-table"
                  scroll={block.tableData?.scroll}
                />
              )}
              {activeViews[idx] === 'chart' && renderChart(block.tableData, chartTypes[idx])}
            </div>
            {/* 数据来源区域（每个块独立） */}
            <div className="data-sources">
              <div className="sources-label">数据来源:</div>
              <div className="sources-list">
                {renderDataSources(block.sources, `block-${idx}`)}
              </div>
            </div>
          </div>
          </>
            )}
          </div>
        ))}

        {/* 分析型输出（四块内容）- 后显示 */}
        {data.analysis && (
          <div className="analysis-sections" style={{ marginTop: 24 }}>
            <div className="analysis-card overview">
              <div className="analysis-header"><span className="badge">1</span> 一. 概览</div>
              <StreamingText
                text={data.analysis.resultSummary}
                as="div"
                className="analysis-text"
                chunkSize={8}
                stepDelay={120}
                startDelay={140}
              />
            </div>
            <div className="analysis-card dimension">
              <div className="analysis-header"><span className="badge">2</span> 二. 维度影响</div>
              {data.analysis.dimensionTableData && (
                <div style={{ marginTop: 16, marginBottom: 24 }}>
                  <div className="result-block">
                    <div className="block-header">
                      <h4 className="block-title">维度数据明细表</h4>
                      <div className="table-actions">
                        <Tooltip title="表格">
                          <Button 
                            icon={<TableOutlined />} 
                            type={dimensionView === 'table' ? 'primary' : 'default'} 
                            size="small" 
                            className="table-action-btn"
                            onClick={() => setDimensionView('table')}
                          />
                        </Tooltip>
                        <Dropdown
                          menu={{
                            items: [
                              {
                                key: 'bar',
                                icon: <BarChartOutlined />,
                                label: '柱状图',
                                onClick: () => {
                                  setDimensionView('chart');
                                  setDimensionChartType('bar');
                                }
                              },
                              {
                                key: 'line',
                                icon: <LineChartOutlined />,
                                label: '折线图',
                                onClick: () => {
                                  setDimensionView('chart');
                                  setDimensionChartType('line');
                                }
                              },
                              {
                                key: 'pie',
                                icon: <PieChartOutlined />,
                                label: '饼状图',
                                onClick: () => {
                                  setDimensionView('chart');
                                  setDimensionChartType('pie');
                                }
                              }
                            ],
                            selectable: true,
                            selectedKeys: [dimensionChartType]
                          }}
                          trigger={['click']}
                        >
                          <Tooltip title="图表">
                            <Button 
                              icon={<BarChartOutlined />} 
                              type={dimensionView === 'chart' ? 'primary' : 'default'} 
                              size="small" 
                              className="table-action-btn"
                            />
                          </Tooltip>
                        </Dropdown>
                        <Tooltip title="查看SQL">
                          <Button 
                            icon={<DatabaseOutlined />} 
                            size="small" 
                            className="table-action-btn" 
                          />
                        </Tooltip>
                        <Tooltip title="导出">
                          <Button 
                            icon={<DownloadOutlined />} 
                            onClick={() => handleExport({ tableData: data.analysis.dimensionTableData })} 
                            size="small" 
                            className="table-action-btn" 
                          />
                        </Tooltip>
                        {/* 添加到仪表盘按钮已隐藏（代码保留，取消注释即可恢复） */}
                        {/* <Tooltip title="添加到仪表盘">
                          <Button 
                            icon={<PlusSquareOutlined />} 
                            onClick={() => handleAddToDashboard(
                              { 
                                title: '维度数据明细表', 
                                tableData: data.analysis.dimensionTableData, 
                                sources: data.analysis.dimensionSources 
                              }, 
                              'dimension', 
                              dimensionView, 
                              dimensionChartType
                            )} 
                            size="small" 
                            className="table-action-btn" 
                          />
                        </Tooltip> */}
                      </div>
                    </div>
                    <div className="table-wrapper">
                      {dimensionView === 'table' && (
                        <Table
                          columns={data.analysis.dimensionTableData.columns || []}
                          dataSource={data.analysis.dimensionTableData.dataSource || []}
                          pagination={false}
                          size="middle"
                          bordered
                          className="custom-result-table"
                        />
                      )}
                      {dimensionView === 'chart' && renderChart(data.analysis.dimensionTableData, dimensionChartType)}
                    </div>
                    
                    {/* 数据来源区域 */}
                    <div className="data-sources">
                      <div className="sources-label">数据来源:</div>
                      <div className="sources-list">
                        {renderDataSources(data.analysis.dimensionSources, 'dimension')}
                      </div>
                    </div>
                  </div>
                </div>
              )}
              <div className="analysis-subtitle">2-2. 解读</div>
              <StreamingParagraphs
                text={data.analysis.dimensionAnalysis}
                paragraphClass="analysis-text"
                paragraphSpacing={16}
                chunkSize={8}
                stepDelay={120}
                initialDelay={160}
                paragraphDelay={260}
                textStyle={{ whiteSpace: 'pre-wrap' }}
              />
            </div>
            <div className="analysis-card factor">
              <div className="analysis-header"><span className="badge">3</span> 三. 因子影响</div>
              {data.analysis.factorAnalysisList ? (
                <>
                  {/* 因子分析列表 - 每个因子一个区块 */}
                  {data.analysis.factorAnalysisList.map((factor, idx) => (
                    <div key={idx} style={{ marginBottom: 16 }}>
                      <div className="analysis-subtitle">③-{idx + 1}. {factor.title}</div>
                      <StreamingParagraphs
                        text={factor.content}
                        paragraphClass="analysis-text"
                        paragraphSpacing={12}
                        chunkSize={8}
                        stepDelay={120}
                        initialDelay={140}
                        paragraphDelay={240}
                        textStyle={{ marginBottom: 8 }}
                      />
                      {factor.sources && factor.sources.length > 0 && (
                        <div className="data-sources" style={{ marginTop: 8, marginBottom: 8 }}>
                          <div className="sources-label">数据来源:</div>
                          <div className="sources-list">
                            {renderDataSources(factor.sources, `factor-${idx}`)}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </>
              ) : data.analysis.factorTableData ? (
                <div style={{ marginTop: 16, marginBottom: 24 }}>
                  <div className="result-block">
                    <div className="block-header">
                      <h4 className="block-title">因子分解明细表</h4>
                      <div className="table-actions">
                        <Tooltip title="表格">
                          <Button 
                            icon={<TableOutlined />} 
                            type="primary"
                            size="small" 
                            className="table-action-btn"
                          />
                        </Tooltip>
                        <Tooltip title="查看SQL">
                          <Button 
                            icon={<DatabaseOutlined />} 
                            size="small" 
                            className="table-action-btn" 
                          />
                        </Tooltip>
                        <Tooltip title="导出">
                          <Button 
                            icon={<DownloadOutlined />} 
                            onClick={() => handleExport({ tableData: data.analysis.factorTableData })} 
                            size="small" 
                            className="table-action-btn" 
                          />
                        </Tooltip>
                        {/* 添加到仪表盘按钮已隐藏（代码保留，取消注释即可恢复） */}
                        {/* <Tooltip title="添加到仪表盘">
                          <Button 
                            icon={<PlusSquareOutlined />} 
                            onClick={() => handleAddToDashboard(
                              { 
                                title: '因子分解明细表', 
                                tableData: data.analysis.factorTableData, 
                                sources: data.analysis.factorSources 
                              }, 
                              'factor', 
                              'table', 
                              'bar'
                            )} 
                            size="small" 
                            className="table-action-btn" 
                          />
                        </Tooltip> */}
                      </div>
                    </div>
                    <div className="table-wrapper">
                      <Table
                        columns={data.analysis.factorTableData.columns || []}
                        dataSource={data.analysis.factorTableData.dataSource || []}
                        pagination={false}
                        size="middle"
                        bordered
                        className="custom-result-table"
                      />
                    </div>
                    
                    {/* 数据来源区域 */}
                    <div className="data-sources">
                      <div className="sources-label">数据来源:</div>
                      <div className="sources-list">
                        {renderDataSources(data.analysis.factorSources, 'factorTable')}
                      </div>
                    </div>
                  </div>
                  <div className="analysis-subtitle" style={{ marginTop: 16 }}>3-2. 解读</div>
                  <StreamingParagraphs
                    text={data.analysis.factorAnalysis}
                    paragraphClass="analysis-text"
                    paragraphSpacing={16}
                    chunkSize={8}
                    stepDelay={120}
                    initialDelay={160}
                    paragraphDelay={260}
                    textStyle={{ whiteSpace: 'pre-wrap' }}
                  />
                </div>
              ) : data.analysis.factors ? (
                <>
                  <div className="analysis-subtitle">3-1. 关键因子及其影响</div>
                  <ul className="factor-list">
                    <li>数量：变化率约 +{data.analysis.factors?.qtyGrowth}%</li>
                    <li>价格：变化率约 +{data.analysis.factors?.priceGrowth}%</li>
                    <li>结构：变化率约 +{data.analysis.factors?.mixEffect}%</li>
                  </ul>
                  <div className="analysis-subtitle">3-2. 解读</div>
                  <StreamingParagraphs
                    text={data.analysis.factorAnalysis}
                    paragraphClass="analysis-text"
                    paragraphSpacing={16}
                    chunkSize={8}
                    stepDelay={120}
                    initialDelay={160}
                    paragraphDelay={260}
                    textStyle={{ whiteSpace: 'pre-wrap' }}
                  />
                </>
              ) : null}
            </div>
            <div className="analysis-card conclusion">
              <div className="analysis-header"><span className="badge">4</span> 四. 结论</div>
              <StreamingParagraphs
                text={data.analysis.conclusion}
                paragraphClass="analysis-text"
                paragraphSpacing={16}
                chunkSize={8}
                stepDelay={120}
                initialDelay={160}
                paragraphDelay={260}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default QueryResult;
