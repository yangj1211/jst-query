import React, { useState, useEffect } from 'react';
import { Modal, Radio, Select, Divider, Typography, Space, Tag, Button } from 'antd';
import { TableOutlined, FileTextOutlined, DatabaseOutlined } from '@ant-design/icons';

const { Option } = Select;
const { Text } = Typography;

// 假数据（常量，定义在组件外部）
const tableOptions = ['销售月报', '用户区域统计', '订单明细', '库存快照'];
const fileOptions = ['销售数据2024.xlsx', '仓储盘点.pdf', '市场跟踪.xlsx'];
const branchList = ['分公司 A', '分公司 B', '分公司 C', '分公司 D'];

/**
 * 查询配置弹窗（优化视觉与交互）
 * props:
 * - visible: boolean
 * - initialConfig: object
 * - onOk: (config) => void
 * - onCancel: () => void
 */
const QueryConfigModal = ({ visible, initialConfig = {}, onOk, onCancel }) => {
  const [sourceMode, setSourceMode] = useState(initialConfig.sourceMode || 'all'); // all | custom
  const [tables, setTables] = useState(initialConfig.tables || []);
  const [files, setFiles] = useState(initialConfig.files || []);
  const [scopeType, setScopeType] = useState(initialConfig.scopeType || 'group'); // group | branches
  const [branches, setBranches] = useState(initialConfig.branches || []);
  const [caliber, setCaliber] = useState(initialConfig.caliber || 'internal'); // internal | external

  useEffect(() => {
    if (visible) {
      setSourceMode(initialConfig.sourceMode || 'all');
      
      // 恢复表选择：如果表列表等于全部表，则显示"全部表"标记
      const initialTables = initialConfig.tables || [];
      const isAllTables = Array.isArray(initialTables) && 
                         initialTables.length === tableOptions.length &&
                         tableOptions.every(table => initialTables.includes(table));
      setTables(isAllTables ? ['__ALL_TABLES__'] : initialTables);
      
      // 恢复文件选择：如果文件列表等于全部文件，则显示"全部文件"标记
      const initialFiles = initialConfig.files || [];
      const isAllFiles = Array.isArray(initialFiles) && 
                        initialFiles.length === fileOptions.length &&
                        fileOptions.every(file => initialFiles.includes(file));
      setFiles(isAllFiles ? ['__ALL_FILES__'] : initialFiles);
      
      setScopeType(initialConfig.scopeType || 'group');
      setBranches(initialConfig.branches || []);
      setCaliber(initialConfig.caliber || 'internal');
    }
  }, [visible, initialConfig]);

  const tagRender = (props) => {
    const { label, value, closable, onClose } = props;
    // 如果是全选标记，显示自定义文本
    if (value === '__ALL_TABLES__') {
      return (
        <Tag color="#1890ff" closable={closable} onClose={onClose} style={{ marginRight: 4, fontWeight: 'bold' }}>
          全部表
        </Tag>
      );
    }
    if (value === '__ALL_FILES__') {
      return (
        <Tag color="#1890ff" closable={closable} onClose={onClose} style={{ marginRight: 4, fontWeight: 'bold' }}>
          全部文件
        </Tag>
      );
    }
    return (
      <Tag color="#1677ff" closable={closable} onClose={onClose} style={{ marginRight: 4 }}>
        {label}
      </Tag>
    );
  };

  // 处理表格选择变化
  const handleTablesChange = (selectedTables) => {
    // 如果选择了"全部表"
    if (selectedTables.includes('__ALL_TABLES__')) {
      // 如果之前已经是全选标记，再次点击则清空
      if (tables.includes('__ALL_TABLES__')) {
        setTables([]);
      } else {
        // 只保留全选标记，清除其他具体项
        setTables(['__ALL_TABLES__']);
      }
    } else {
      // 如果选择了其他具体项，移除全选标记
      setTables(selectedTables.filter(t => t !== '__ALL_TABLES__'));
    }
  };

  // 处理文件选择变化
  const handleFilesChange = (selectedFiles) => {
    // 如果选择了"全部文件"
    if (selectedFiles.includes('__ALL_FILES__')) {
      // 如果之前已经是全选标记，再次点击则清空
      if (files.includes('__ALL_FILES__')) {
        setFiles([]);
      } else {
        // 只保留全选标记，清除其他具体项
        setFiles(['__ALL_FILES__']);
      }
    } else {
      // 如果选择了其他具体项，移除全选标记
      setFiles(selectedFiles.filter(f => f !== '__ALL_FILES__'));
    }
  };

  const handleSave = (applyScope) => {
    // 处理全选标记，转换为实际的表/文件列表
    const finalTables = tables.includes('__ALL_TABLES__') ? tableOptions : tables;
    const finalFiles = files.includes('__ALL_FILES__') ? fileOptions : files;
    
    onOk && onOk({ 
      sourceMode, 
      tables: finalTables, 
      files: finalFiles, 
      scopeType, 
      branches, 
      caliber, 
      applyScope 
    });
  };

  return (
    <Modal
      open={visible}
      title="问数配置"
      onCancel={onCancel}
      footer={[
        <Button key="cancel" onClick={onCancel}>
          取消
        </Button>,
        <Button 
          key="current" 
          onClick={() => handleSave('current')}
          style={{ 
            borderColor: '#1890ff', 
            color: '#1890ff' 
          }}
        >
          应用到本对话
        </Button>,
        <Button key="all" type="primary" onClick={() => handleSave('all')}>
          应用到全部对话
        </Button>
      ]}
      width={720}
      destroyOnClose
    >
      {/* 数据来源 */}
      <Space direction="vertical" size={4} style={{ width: '100%' }}>
        <Space align="center" size={8}>
          <Text strong>数据来源</Text>
          <Text type="secondary" style={{ fontSize: 12 }}>
            选择数据来自哪里
          </Text>
        </Space>
        <Radio.Group value={sourceMode} onChange={(e) => setSourceMode(e.target.value)}>
          <Radio value="all">全部数据</Radio>
          <Radio value="custom">指定来源</Radio>
        </Radio.Group>
        {sourceMode === 'custom' && (
          <div style={{ marginTop: 8 }}>
            <Space direction="vertical" size={8} style={{ width: '100%' }}>
              <Space align="center" size={6}>
                <DatabaseOutlined />
                <Text type="secondary">选择数据库表</Text>
              </Space>
              <Select
                mode="multiple"
                value={tables}
                onChange={handleTablesChange}
                style={{ width: '100%' }}
                placeholder="请选择一个或多个表"
                showSearch
                tagRender={tagRender}
                maxTagCount="responsive"
                allowClear
              >
                <Option key="__ALL_TABLES__" value="__ALL_TABLES__">
                  <Space size={6}>
                    <DatabaseOutlined style={{ color: '#1890ff', fontWeight: 'bold' }} />
                    <span style={{ fontWeight: 'bold', color: '#1890ff' }}>全部表</span>
                  </Space>
                </Option>
                {tableOptions.map((name) => (
                  <Option key={name} value={name}>
                    <Space size={6}>
                      <TableOutlined />
                      <span>{name}</span>
                    </Space>
                  </Option>
                ))}
              </Select>
              <Divider dashed style={{ margin: '8px 0' }} />
              <Space align="center" size={6}>
                <FileTextOutlined />
                <Text type="secondary">选择文件</Text>
              </Space>
              <Select
                mode="multiple"
                value={files}
                onChange={handleFilesChange}
                style={{ width: '100%' }}
                placeholder="请选择一个或多个文件"
                showSearch
                tagRender={tagRender}
                maxTagCount="responsive"
                allowClear
              >
                <Option key="__ALL_FILES__" value="__ALL_FILES__">
                  <Space size={6}>
                    <FileTextOutlined style={{ color: '#1890ff', fontWeight: 'bold' }} />
                    <span style={{ fontWeight: 'bold', color: '#1890ff' }}>全部文件</span>
                  </Space>
                </Option>
                {fileOptions.map((name) => (
                  <Option key={name} value={name}>
                    <Space size={6}>
                      <FileTextOutlined />
                      <span>{name}</span>
                    </Space>
                  </Option>
                ))}
              </Select>
            </Space>
          </div>
        )}
      </Space>

      <Divider />

      {/* 数据范围 */}
      <Space direction="vertical" size={6} style={{ width: '100%' }}>
        <Space align="center" size={8}>
          <Text strong>数据范围</Text>
          <Text type="secondary" style={{ fontSize: 12 }}>
            选择统计范围（可按分公司限定）
          </Text>
        </Space>
        <Radio.Group value={scopeType} onChange={(e) => setScopeType(e.target.value)}>
          <Radio value="group">集团总数据</Radio>
          <Radio value="branches">指定分公司</Radio>
        </Radio.Group>
        {scopeType === 'branches' && (
          <Select
            mode="multiple"
            value={branches}
            onChange={setBranches}
            style={{ width: '100%' }}
            placeholder="请选择分公司 (可多选)"
            showSearch
            tagRender={tagRender}
            maxTagCount="responsive"
            allowClear
          >
            {branchList.map((b) => (
              <Option key={b} value={b}>
                {b}
              </Option>
            ))}
          </Select>
        )}
      </Space>

      <Divider />

      {/* 数据口径 */}
      <Space direction="vertical" size={6} style={{ width: '100%' }}>
        <Space align="center" size={8}>
          <Text strong>数据口径</Text>
          <Text type="secondary" style={{ fontSize: 12 }}>
            选择使用场景，以匹配管口或法口
          </Text>
        </Space>
        <Radio.Group value={caliber} onChange={(e) => setCaliber(e.target.value)}>
          <Radio value="internal">内部管理用（管口）</Radio>
          <Radio value="external">对外披露用（法口）</Radio>
        </Radio.Group>
      </Space>
    </Modal>
  );
};

export default QueryConfigModal;
