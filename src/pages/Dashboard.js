import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Table, Button, Tooltip, Dropdown, Empty, message } from 'antd';
import { DeleteOutlined, TableOutlined, BarChartOutlined, LineChartOutlined, PieChartOutlined, ReloadOutlined, DownOutlined, DownloadOutlined } from '@ant-design/icons';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer } from 'recharts';
import * as XLSX from 'xlsx';
import './Dashboard.css';

/**
 * 仪表盘页面
 */
const Dashboard = () => {
  // 仪表盘项目状态
  const [dashboardItems, setDashboardItems] = useState([]);
  // 每个项目的视图状态
  const [itemViews, setItemViews] = useState({});

  // 加载仪表盘数据
  useEffect(() => {
    loadDashboardItems();
  }, []);

  const loadDashboardItems = () => {
    const items = JSON.parse(localStorage.getItem('dashboardItems') || '[]');
    setDashboardItems(items);
    
    // 初始化每个项目的视图状态
    const initialViews = {};
    items.forEach(item => {
      initialViews[item.id] = {
        viewType: item.viewType,
        chartType: item.chartType
      };
    });
    setItemViews(initialViews);
  };

  /**
   * 切换视图类型
   */
  const handleToggleView = (itemId, viewType, chartType) => {
    setItemViews(prev => ({
      ...prev,
      [itemId]: {
        viewType: viewType,
        chartType: chartType || prev[itemId]?.chartType || 'bar'
      }
    }));
  };

  /**
   * 刷新数据（重新从localStorage加载）
   */
  const handleRefreshData = () => {
    loadDashboardItems();
    message.success('数据已刷新');
  };

  /**
   * 导出Excel
   */
  const handleExportExcel = (item) => {
    if (!item.tableData || !item.tableData.dataSource || !item.tableData.columns) {
      message.error('暂无可导出的数据');
      return;
    }

    try {
      // 准备导出数据
      const { columns, dataSource } = item.tableData;
      
      // 构建表头
      const headers = columns
        .filter(col => col.dataIndex !== 'key')
        .map(col => col.title);
      
      // 构建数据行
      const rows = dataSource.map(row => {
        return columns
          .filter(col => col.dataIndex !== 'key')
          .map(col => {
            const value = row[col.dataIndex];
            // 如果是数字字符串，尝试转换
            if (typeof value === 'string') {
              const numValue = value.replace(/[^\d.-]/g, '');
              return numValue || value;
            }
            return value;
          });
      });

      // 创建工作表
      const worksheet = XLSX.utils.aoa_to_sheet([headers, ...rows]);
      
      // 创建工作簿
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, '数据');
      
      // 导出文件
      const fileName = `${item.title || '数据导出'}_${new Date().getTime()}.xlsx`;
      XLSX.writeFile(workbook, fileName);
      
      message.success('导出成功');
    } catch (error) {
      console.error('导出失败:', error);
      message.error('导出失败，请重试');
    }
  };

  /**
   * 删除仪表盘项目
   */
  const handleDeleteItem = (itemId) => {
    const updatedItems = dashboardItems.filter(item => item.id !== itemId);
    setDashboardItems(updatedItems);
    localStorage.setItem('dashboardItems', JSON.stringify(updatedItems));
    message.success('已从仪表盘移除');
  };

  /**
   * 将表格数据转换为图表数据格式
   */
  const convertTableDataToChartData = (tableData) => {
    if (!tableData || !tableData.columns || !tableData.dataSource) {
      return { chartData: [], xField: '', yFields: [] };
    }

    const { columns, dataSource } = tableData;
    const xField = columns[0]?.dataIndex || 'name';
    const yFields = columns.slice(1)
      .filter(col => col.dataIndex !== 'key')
      .map(col => ({
        dataIndex: col.dataIndex,
        title: col.title
      }));

    const chartData = dataSource.map(row => {
      const item = { name: row[xField] };
      yFields.forEach(field => {
        const value = row[field.dataIndex];
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

    const COLORS = [
      '#5B8FF9', '#61DDAA', '#F6BD16', '#E8684A', 
      '#9270CA', '#5AD8A6', '#FF9845', '#5D7092'
    ];

    if (chartType === 'bar') {
      return (
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData} margin={{ top: 10, right: 20, left: 10, bottom: 10 }}>
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

    if (chartType === 'line') {
      return (
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData} margin={{ top: 10, right: 20, left: 10, bottom: 10 }}>
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

    if (chartType === 'pie') {
      const pieData = chartData.map(item => ({
        name: item.name,
        value: item[yFields[0].dataIndex]
      }));

      return (
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
              outerRadius={100}
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

  return (
    <div className="dashboard-container">
      {/* 添加的仪表盘项目 */}
      {dashboardItems.length > 0 && (
        <div className="dashboard-items-section">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h2 style={{ margin: 0, fontSize: 18, fontWeight: 600 }}>我的图表</h2>
            <span style={{ color: '#999', fontSize: 14 }}>{dashboardItems.length} 个图表</span>
      </div>

          <Row gutter={[24, 24]}>
            {dashboardItems.map((item) => {
              const currentView = itemViews[item.id] || { viewType: item.viewType, chartType: item.chartType };
              
              return (
                <Col xs={24} lg={12} key={item.id}>
                  <Card 
                    title={item.title}
                    className="dashboard-item-card"
                    extra={
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                        {/* 视图切换按钮 */}
                        <Tooltip title={currentView.viewType === 'table' ? '表格视图' : '图表视图'}>
                          <Button
                            type="text"
                            size="small"
                            icon={<TableOutlined />}
                            onClick={() => handleToggleView(item.id, 'table')}
                            style={{ 
                              color: currentView.viewType === 'table' ? '#1890ff' : '#999'
                            }}
                          />
                        </Tooltip>
                        
                        {/* 图表类型切换下拉菜单 */}
                        <Dropdown
                          menu={{
                            items: [
                              {
                                key: 'bar',
                                icon: <BarChartOutlined />,
                                label: '柱状图',
                                onClick: () => handleToggleView(item.id, 'chart', 'bar')
                              },
                              {
                                key: 'line',
                                icon: <LineChartOutlined />,
                                label: '折线图',
                                onClick: () => handleToggleView(item.id, 'chart', 'line')
                              },
                              {
                                key: 'pie',
                                icon: <PieChartOutlined />,
                                label: '饼图',
                                onClick: () => handleToggleView(item.id, 'chart', 'pie')
                              }
                            ],
                            selectedKeys: [currentView.chartType]
                          }}
                          trigger={['click']}
                        >
                          <Button
                            type="text"
                            size="small"
                            style={{ 
                              color: currentView.viewType === 'chart' ? '#1890ff' : '#999'
                            }}
                          >
                            {currentView.viewType === 'chart' && currentView.chartType === 'bar' && <BarChartOutlined />}
                            {currentView.viewType === 'chart' && currentView.chartType === 'line' && <LineChartOutlined />}
                            {currentView.viewType === 'chart' && currentView.chartType === 'pie' && <PieChartOutlined />}
                            {currentView.viewType === 'table' && <BarChartOutlined />}
                            <DownOutlined style={{ fontSize: 10, marginLeft: 4 }} />
                          </Button>
                        </Dropdown>
                        
                        {/* 刷新按钮 */}
                        <Tooltip title="刷新数据">
                          <Button 
                            type="text" 
                            size="small" 
                            icon={<ReloadOutlined />}
                            onClick={handleRefreshData}
                          />
                        </Tooltip>
                        
                        {/* 导出Excel按钮 */}
                        <Tooltip title="导出Excel">
                          <Button 
                            type="text" 
                            size="small" 
                            icon={<DownloadOutlined />}
                            onClick={() => handleExportExcel(item)}
                          />
                        </Tooltip>
                        
                        {/* 删除按钮 */}
                        <Tooltip title="从仪表盘移除">
                          <Button 
                            type="text" 
              size="small"
                            danger
                            icon={<DeleteOutlined />}
                            onClick={() => handleDeleteItem(item.id)}
                          />
                        </Tooltip>
                      </div>
                    }
                  >
                    {currentView.viewType === 'table' ? (
            <Table
                        columns={item.tableData?.columns || []}
                        dataSource={item.tableData?.dataSource || []}
              pagination={false}
              size="small"
                        bordered
                        scroll={{ x: 'max-content' }}
            />
                    ) : (
                      renderChart(item.tableData, currentView.chartType)
                    )}
          </Card>
        </Col>
              );
            })}
      </Row>
        </div>
      )}

      {/* 空状态提示 */}
      {dashboardItems.length === 0 && (
        <div style={{ marginTop: 80, padding: 64, textAlign: 'center', background: '#fafafa', borderRadius: 8 }}>
          <Empty 
            description={
              <span style={{ color: '#999', fontSize: 14 }}>
                还没有添加任何图表到仪表盘<br/>
                <span style={{ fontSize: 13, marginTop: 8, display: 'inline-block' }}>在问数助手页面中，点击表格右上角的"添加到仪表盘"按钮即可添加</span>
              </span>
            }
          />
        </div>
      )}
    </div>
  );
};

export default Dashboard;

