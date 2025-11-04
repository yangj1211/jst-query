import React, { useState } from 'react';
import { Table, Button, Tooltip, Tag, Dropdown, Input, message } from 'antd';
import { DownOutlined, RightOutlined, DownloadOutlined, ExportOutlined, DatabaseOutlined, TableOutlined, BarChartOutlined, EyeOutlined, FileOutlined, DatabaseOutlined as DbIcon, LineChartOutlined, PieChartOutlined, BulbOutlined, ClockCircleOutlined, PlusSquareOutlined } from '@ant-design/icons';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer } from 'recharts';
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
const QueryResult = ({ data }) => {
  const { summary } = data;
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
   * 切换引用数字的选中状态
   */
  const toggleReferenceActive = (refKey) => {
    setActiveReferences(prev => ({
      ...prev,
      [refKey]: !prev[refKey]
    }));
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
      
      // 去掉文件后缀
      const displayName = isFile 
        ? source.name.replace(/\.(xlsx?|pdf)$/i, '') 
        : source.name;

      return (
        <Tooltip key={i} title={source.fullPath || source.name}>
          <Button
            type="link"
            icon={isFile ? <FileOutlined /> : <DbIcon />}
            size="small"
            className="source-link"
            onClick={() => console.log('查看来源:', source)}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}
          >
            {displayName}
            {isFile && <Tag size="small" color="orange">网页</Tag>}
            {source.type === 'database' && <Tag size="small" color="blue">表</Tag>}
            
            {/* 如果是文件且有引用，在后面显示圆形数字 */}
            {hasReferences && (
              <span style={{ display: 'inline-flex', gap: 4, marginLeft: 4 }}>
                {source.references.map((ref, refIdx) => {
                  const refKey = `${prefix}-${i}-${refIdx}`;
                  const isActive = activeReferences[refKey];
                  
                  return (
                    <span 
                      key={refIdx}
                      onClick={(e) => {
                        e.stopPropagation(); // 阻止事件冒泡到Button
                        toggleReferenceActive(refKey);
                        console.log('查看引用:', ref);
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
                })}
              </span>
            )}
          </Button>
        </Tooltip>
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
    const { chartData, xField, yFields } = convertTableDataToChartData(tableData);

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
   */
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

  const headerActions = (
    <div className="header-actions">
      <Tooltip title="下载报告">
        <Button type="text" icon={<DownloadOutlined />} size="small" />
      </Tooltip>
    </div>
  );

  return (
    <div className="query-result-wrapper">
      <div className="result-params-header">
        {headerActions}
      </div>

      <div className="result-content">
        {summary && <p className="summary-text">{summary}</p>}

        {/* 查询结果表格 - 先显示 */}
        {blocks.map((block, idx) => (
          <div key={idx} style={{ marginBottom: idx < blocks.length - 1 ? 24 : 0 }}>
            {block.description && <p className="block-description">{block.description}</p>}
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
                  <Tooltip title="添加到仪表盘">
                    <Button 
                      icon={<PlusSquareOutlined />} 
                      onClick={() => handleAddToDashboard(block, idx, activeViews[idx], chartTypes[idx])} 
                      size="small" 
                      className="table-action-btn" 
                    />
                  </Tooltip>
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
          </div>
        ))}

        {/* 分析型输出（四块内容）- 后显示 */}
        {data.analysis && (
          <div className="analysis-sections" style={{ marginTop: 24 }}>
            <div className="analysis-card overview">
              <div className="analysis-header"><span className="badge">1</span> 一. 概览</div>
              <div className="analysis-text">{data.analysis.resultSummary}</div>
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
                        <Tooltip title="添加到仪表盘">
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
                        </Tooltip>
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
              <div className="analysis-text" style={{ whiteSpace: 'pre-wrap' }}>{data.analysis.dimensionAnalysis}</div>
            </div>
            <div className="analysis-card factor">
              <div className="analysis-header"><span className="badge">3</span> 三. 因子影响</div>
              {data.analysis.factorAnalysisList ? (
                <>
                  {/* 因子分析列表 - 每个因子一个区块 */}
                  {data.analysis.factorAnalysisList.map((factor, idx) => (
                    <div key={idx} style={{ marginBottom: 16 }}>
                      <div className="analysis-subtitle">③-{idx + 1}. {factor.title}</div>
                      <div className="analysis-text" style={{ marginBottom: 8 }}>{factor.content}</div>
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
                        <Tooltip title="添加到仪表盘">
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
                        </Tooltip>
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
                  <div className="analysis-text" style={{ whiteSpace: 'pre-wrap' }}>{data.analysis.factorAnalysis}</div>
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
                  <div className="analysis-text" style={{ whiteSpace: 'pre-wrap' }}>{data.analysis.factorAnalysis}</div>
                </>
              ) : null}
            </div>
            <div className="analysis-card conclusion">
              <div className="analysis-header"><span className="badge">4</span> 四. 结论</div>
              <div className="analysis-text">{data.analysis.conclusion}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default QueryResult;
