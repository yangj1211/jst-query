import React, { useState, useMemo, useCallback } from 'react';
import { Card, Form, Select, Table, Button, Input, Tag, Space } from 'antd';
import { ReloadOutlined } from '@ant-design/icons';
import { tableOptions } from '../components/QueryConfigModal';
import './PageStyle.css';
import './WorkOrderConfig.css';

/** 可选用户列表（与工单列表、用户管理保持一致） */
const USER_OPTIONS = [
  { label: '张三', value: '张三' },
  { label: '李四', value: '李四' },
  { label: '王五', value: '王五' },
  { label: '张伟', value: '张伟' },
  { label: '李娜', value: '李娜' },
  { label: '王芳', value: '王芳' },
  { label: '刘强', value: '刘强' },
  { label: '陈静', value: '陈静' },
  { label: '杨明', value: '杨明' },
  { label: '赵丽', value: '赵丽' },
];

/**
 * 表选项展示：表名英文 + 描述中文；无 nameEn 时用 name
 * @param {Object} t - 表选项
 * @returns {string}
 */
function getTableOptionLabel(t) {
  if (t.nameEn != null && t.description != null) return `${t.nameEn} ${t.description}`;
  if (t.nameEn != null) return `${t.nameEn} ${t.name || ''}`;
  return t.name || '';
}

/** 工单配置本地存储 key */
const STORAGE_KEY = 'work_order_config';

/**
 * 从本地读取工单配置（仅前端演示用）
 * 兼容旧格式：adminUser/fileTypeHandler 单值、tableHandlers 值为字符串
 * @returns {{ adminUsers?: string[], fileTypeHandlers?: string[], tableHandlers?: Record<string, string[]> }}
 */
function loadConfig() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const data = JSON.parse(raw);
    const out = {};
    if (Array.isArray(data.adminUsers)) out.adminUsers = data.adminUsers;
    else if (data.adminUser) out.adminUsers = [data.adminUser];
    if (Array.isArray(data.fileTypeHandlers)) out.fileTypeHandlers = data.fileTypeHandlers;
    else if (data.fileTypeHandler != null) out.fileTypeHandlers = [data.fileTypeHandler];
    if (data.tableHandlers && typeof data.tableHandlers === 'object') {
      out.tableHandlers = {};
      Object.keys(data.tableHandlers).forEach((k) => {
        const v = data.tableHandlers[k];
        out.tableHandlers[k] = Array.isArray(v) ? v : v ? [v] : [];
      });
    }
    return out;
  } catch (_) {}
  return {};
}

/**
 * 保存工单配置到本地（仅前端演示用）
 * @param {Object} config
 */
function saveConfig(config) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  } catch (_) {}
}

/**
 * 工单配置页：设置负责人、文件类型处理人、各表处理人
 * @returns {JSX.Element}
 */
const WorkOrderConfig = () => {
  const [form] = Form.useForm();
  const [adminUsers, setAdminUsers] = useState(() => loadConfig().adminUsers ?? []);
  const [fileTypeHandlers, setFileTypeHandlers] = useState(() => loadConfig().fileTypeHandlers ?? []);
  /** 表名 -> 处理人列表（多选） */
  const [tableHandlers, setTableHandlers] = useState(() => loadConfig().tableHandlers ?? {});
  /** 表名搜索关键词 */
  const [tableNameKeyword, setTableNameKeyword] = useState('');
  /** 描述搜索关键词 */
  const [descriptionKeyword, setDescriptionKeyword] = useState('');
  /** 标签筛选（多选） */
  const [tagFilterValues, setTagFilterValues] = useState([]);
  /** 处理人筛选（多选，空数组表示不筛选即全部，'' 表示未指定） */
  const [handlerFilterValues, setHandlerFilterValues] = useState([]);

  /** 表配置数据源：每行 表名、标签、描述、处理人（数组） */
  const tableDataSource = useMemo(() => {
    return tableOptions.map((t) => {
      const raw = tableHandlers[t.name];
      const handlers = Array.isArray(raw) ? raw : raw ? [raw] : [];
      return {
        key: t.name,
        tableName: t.name,
        nameDisplay: t.nameEn || t.name,
        tags: Array.isArray(t.tags) ? t.tags : [],
        description: t.description ?? t.name ?? '',
        handlers,
      };
    });
  }, [tableHandlers]);

  /** 所有标签选项（用于筛选下拉） */
  const allTagOptions = useMemo(() => {
    const set = new Set();
    tableOptions.forEach((t) => (t.tags || []).forEach((tag) => set.add(tag)));
    return Array.from(set).sort().map((tag) => ({ label: tag, value: tag }));
  }, []);

  /** 根据搜索与筛选后的表格数据 */
  const filteredTableData = useMemo(() => {
    let data = tableDataSource;
    const nameKw = (tableNameKeyword || '').trim().toLowerCase();
    if (nameKw) {
      data = data.filter(
        (row) =>
          (row.nameDisplay && row.nameDisplay.toLowerCase().includes(nameKw)) ||
          (row.tableName && row.tableName.toLowerCase().includes(nameKw))
      );
    }
    const descKw = (descriptionKeyword || '').trim().toLowerCase();
    if (descKw) {
      data = data.filter(
        (row) => row.description && row.description.toLowerCase().includes(descKw)
      );
    }
    if (tagFilterValues && tagFilterValues.length > 0) {
      data = data.filter((row) =>
        (row.tags || []).some((tag) => tagFilterValues.includes(tag))
      );
    }
    if (handlerFilterValues && handlerFilterValues.length > 0) {
      data = data.filter((row) => {
        const handlers = row.handlers || [];
        const hasHandler = handlers.length > 0;
        if (handlerFilterValues.includes('')) {
          if (!hasHandler) return true;
        }
        if (handlers.some((h) => handlerFilterValues.includes(h))) return true;
        return false;
      });
    }
    return data;
  }, [tableDataSource, tableNameKeyword, descriptionKeyword, tagFilterValues, handlerFilterValues]);

  /** 单表处理人变更（多选，value 为 string[]） */
  const handleTableHandlerChange = useCallback((tableName, value) => {
    setTableHandlers((prev) => {
      const next = { ...prev };
      const list = Array.isArray(value) && value.length > 0 ? value : null;
      if (list) next[tableName] = list;
      else delete next[tableName];
      return next;
    });
  }, []);

  /** 重置搜索与筛选 */
  const handleResetFilter = useCallback(() => {
    setTableNameKeyword('');
    setDescriptionKeyword('');
    setTagFilterValues([]);
    setHandlerFilterValues([]);
  }, []);

  const tableColumns = [
    {
      title: '表名',
      dataIndex: 'nameDisplay',
      key: 'nameDisplay',
      width: 200,
      ellipsis: true,
      render: (text, record) => (
        <span title={record.tableName}>{text || record.tableName}</span>
      ),
    },
    {
      title: '标签',
      dataIndex: 'tags',
      key: 'tags',
      width: 220,
      render: (tags = []) => (
        <Space size={6} wrap>
          {tags.map((tag) => (
            <Tag key={tag} style={{ padding: '2px 8px', fontSize: 12 }}>
              {tag}
            </Tag>
          ))}
          {tags.length === 0 && <span className="work-order-config-empty-tag">-</span>}
        </Space>
      ),
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
      width: 180,
      ellipsis: true,
      render: (text) => text || '-',
    },
    {
      title: '处理人',
      dataIndex: 'handlers',
      key: 'handlers',
      width: 240,
      render: (_, record) => (
        <Select
          mode="multiple"
          allowClear
          placeholder="请选择处理人"
          options={USER_OPTIONS}
          value={record.handlers || []}
          onChange={(value) => handleTableHandlerChange(record.tableName, value)}
          style={{ width: '100%' }}
          maxTagCount="responsive"
          getPopupContainer={(n) => n?.parentElement || document.body}
        />
      ),
    },
  ];

  /** 处理人筛选项（未指定、各用户；不选即全部） */
  const handlerFilterOptions = useMemo(
    () => [{ label: '未指定', value: '' }, ...USER_OPTIONS],
    []
  );

  return (
    <div className="page-container work-order-config">
      <div className="page-header">
        <h2>工单配置</h2>
      </div>
      <div className="page-content work-order-config-content">
        <Card title="基本配置" className="work-order-config-card work-order-config-basic">
          <Form
            form={form}
            layout="vertical"
            initialValues={{
              adminUsers: loadConfig().adminUsers ?? [],
              fileTypeHandlers: loadConfig().fileTypeHandlers ?? [],
            }}
          >
            <div className="work-order-config-form-row">
              <Form.Item
                name="adminUsers"
                label="工单负责人"
                extra="处理人不明确时默认指派给工单负责人，负责人可根据实际情况指派处理人"
              >
                <Select
                  mode="multiple"
                  allowClear
                  placeholder="请选择工单负责人"
                  options={USER_OPTIONS}
                  value={adminUsers}
                  onChange={setAdminUsers}
                  maxTagCount="responsive"
                  getPopupContainer={(n) => n?.parentElement || document.body}
                />
              </Form.Item>
              <Form.Item
                name="fileTypeHandlers"
                label="文件类型的处理人"
                extra="当工单数据来源为「文件」时，默认分配给该用户处理"
              >
                <Select
                  mode="multiple"
                  allowClear
                  placeholder="请选择文件类型处理人"
                  options={USER_OPTIONS}
                  value={fileTypeHandlers}
                  onChange={setFileTypeHandlers}
                  maxTagCount="responsive"
                  getPopupContainer={(n) => n?.parentElement || document.body}
                />
              </Form.Item>
            </div>
          </Form>
        </Card>

        <Card
          title="各表处理人"
          className="work-order-config-card"
          extra="为每个数据表指定默认处理人，工单涉及该表时将优先分配给对应处理人"
        >
          <div className="work-order-toolbar">
            <div className="work-order-toolbar-row work-order-config-toolbar-row">
              <Input
                allowClear
                placeholder="表名"
                value={tableNameKeyword}
                onChange={(e) => setTableNameKeyword(e.target.value)}
                className="work-order-search-input"
              />
              <Input
                allowClear
                placeholder="描述"
                value={descriptionKeyword}
                onChange={(e) => setDescriptionKeyword(e.target.value)}
                className="work-order-search-input"
              />
              <Select
                mode="multiple"
                allowClear
                placeholder="标签"
                options={allTagOptions}
                value={tagFilterValues}
                onChange={setTagFilterValues}
                className="work-order-filter-select"
                maxTagCount={1}
                getPopupContainer={(n) => n?.parentElement || document.body}
              />
              <Select
                mode="multiple"
                allowClear
                placeholder="处理人"
                options={handlerFilterOptions}
                value={handlerFilterValues}
                onChange={setHandlerFilterValues}
                className="work-order-filter-select"
                maxTagCount="responsive"
                getPopupContainer={(n) => n?.parentElement || document.body}
              />
              <Button type="default" icon={<ReloadOutlined />} onClick={handleResetFilter} className="work-order-reset-btn">
                重置
              </Button>
            </div>
          </div>
          <Table
            dataSource={filteredTableData}
            columns={tableColumns}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              pageSizeOptions: ['10', '20', '50'],
              showTotal: (total) => `共 ${total} 条`,
              size: 'default',
              showQuickJumper: { goButton: true },
            }}
            scroll={{ x: 820 }}
            size="small"
            className="work-order-config-table"
          />
        </Card>
      </div>
    </div>
  );
};

export default WorkOrderConfig;
