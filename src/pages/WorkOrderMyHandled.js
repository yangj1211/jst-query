import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { Card, Table, Button, Space, Modal, message, Tooltip, Input, Select, DatePicker, Drawer, Tag, Image } from 'antd';
import { ReloadOutlined, EyeOutlined, CloseOutlined, CheckCircleOutlined, EditOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { tableOptions, fileOptions } from '../components/QueryConfigModal';
import { getAttachmentIconSvgHtml } from '../utils/fileTypeIcon';
import CombinedThinking from '../components/CombinedThinking';
import QueryResult from '../components/QueryResult';
import SimpleRichEditor from '../components/SimpleRichEditor';
import CommentRichEditor from '../components/CommentRichEditor';
import './PageStyle.css';
import './WorkOrderMyHandled.css';

const { RangePicker } = DatePicker;

/** 当前登录用户（评论回复人显示为真实操作人，对接时可从登录态获取） */
const CURRENT_USER = '张三';

/** HTML 文本转义（用于插入正文，防 XSS） */
function escapeHtml(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

/** 格式化为 年-月-日 时:分:秒 */
function formatDateTime(date) {
  const d = new Date(date);
  const Y = d.getFullYear();
  const M = String(d.getMonth() + 1).padStart(2, '0');
  const D = String(d.getDate()).padStart(2, '0');
  const h = String(d.getHours()).padStart(2, '0');
  const m = String(d.getMinutes()).padStart(2, '0');
  const s = String(d.getSeconds()).padStart(2, '0');
  return `${Y}-${M}-${D} ${h}:${m}:${s}`;
}

/**
 * 归一化正确答案回复为富文本 HTML 字符串（供 SimpleRichEditor 使用）
 * 支持：历史纯字符串、{ text, images } 结构、已是 HTML 的字符串
 * @param {string|{ text?: string, images?: string[] }|null|undefined} v
 * @returns {string}
 */
function normalizeCorrectReplyToHtml(v) {
  if (v == null) return '';
  if (typeof v === 'string') {
    if (v.trim().startsWith('<')) return v;
    return v ? `<p>${escapeHtml(v)}</p>` : '';
  }
  const text = v.text ?? '';
  const images = Array.isArray(v.images) ? v.images : [];
  const parts = [];
  if (text.trim()) parts.push(`<p>${escapeHtml(text)}</p>`);
  images.forEach((src) => {
    parts.push(`<img src="${escapeHtml(src)}" alt="图片" class="simple-rich-editor-pasted-img" />`);
  });
  return parts.join('');
}

/**
 * 判断富文本 HTML 是否为空（无文字且无图片）
 * @param {string} html
 * @returns {boolean}
 */
function isRichContentEmpty(html) {
  if (!html || typeof html !== 'string') return true;
  const stripped = html.replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').trim();
  if (stripped.length > 0) return false;
  return !/<img\s/i.test(html);
}

/**
 * 将附件列表转为回复段内的 HTML 块（与评论区 .comment-attachment 样式一致，可点击下载；图标按文件类型显示）
 * @param {Array<{ filename: string, href: string }>} list
 * @returns {string}
 */
function attachmentsToSegmentHtml(list) {
  if (!list?.length) return '';
  const escapeAttr = (s) => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const escapeText = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const spans = list
    .map(
      (att) =>
        `<span class="comment-attachment" data-filename="${escapeAttr(att.filename)}" data-href="${escapeAttr(att.href)}" contenteditable="false">${getAttachmentIconSvgHtml(att.filename)} ${escapeText(att.filename)}</span>`
    )
    .join('');
  return `<div class="work-order-reply-attachments">${spans}</div>`;
}

/**
 * 表选项展示名：英文名 + 中文描述（用于数据来源指定具体表时）
 * @param {string} tableName - 表名（与 tableOptions[].name 对应）
 * @returns {string}
 */
function getTableSourceDisplayName(tableName) {
  const opt = tableOptions.find((t) => t.name === tableName);
  if (!opt) return tableName;
  const en = opt.nameEn || '';
  const desc = opt.description || opt.name;
  return en ? `${en} ${desc}`.trim() : desc;
}

/**
 * 数据来源展示文案
 * 全部来源/全部表/全部文件：按原样；指定表时显示「英文名+中文描述」，指定文件时显示「文件名+后缀」
 * @param {Object} config - 工单中的 configInfo
 * @returns {string}
 */
function getDataSourceDisplayText(config) {
  if (!config) return '-';
  if (config.sourceText != null && config.sourceText !== '') return config.sourceText;
  if (config.sourceMode !== 'custom') return '全部来源';
  const tableSelectMode = config.tableSelectMode || 'all';
  const fileSelectMode = config.fileSelectMode || 'all';
  const tables = config.tables || [];
  const files = config.files || [];
  const parts = [];
  if (tableSelectMode === 'all') parts.push('全部表');
  else if (tableSelectMode === 'custom' && tables.length > 0) {
    const labels = tables.map(getTableSourceDisplayName);
    if (labels.length === 2) parts.push(`${labels[0]}、${labels[1]}`);
    else if (labels.length > 2) parts.push(`${labels[0]}等${labels.length}项`);
    else parts.push(labels[0]);
  }
  if (fileSelectMode === 'all') parts.push('全部文件');
  else if (fileSelectMode === 'custom' && files.length > 0) {
    if (files.length === 2) parts.push(`${files[0]}、${files[1]}`);
    else if (files.length > 2) parts.push(`${files[0]}等${files.length}项`);
    else parts.push(files[0]);
  }
  if (parts.length > 0) return parts.join('、');
  return '未选择来源';
}

/**
 * 数据来源完整信息（表 + 文件两行）
 * 全部/未选择：显示「全部表」「全部文件」等；指定具体项时：表显示英文名+中文描述，文件显示文件名+后缀（均无「表：」「文件：」前缀）
 * @param {Object} config - 工单中的 configInfo
 * @returns {React.ReactNode}
 */
function getDataSourceFullContent(config) {
  if (!config) return '-';
  const hasTableFileDetail = config.sourceMode === 'custom' || config.tableSelectMode != null || (Array.isArray(config.tables) && config.tables.length > 0) || (Array.isArray(config.files) && config.files.length > 0);
  if (!hasTableFileDetail) {
    return config.sourceText || '全部数据';
  }
  const tableSelectMode = config.tableSelectMode || 'all';
  const fileSelectMode = config.fileSelectMode || 'all';
  const tables = config.tables || [];
  const files = config.files || [];
  let tableDisplay = '';
  if (tableSelectMode === 'none') tableDisplay = '不使用';
  else if (tableSelectMode === 'all') tableDisplay = '全部表';
  else if (tableSelectMode === 'custom' && tables.length > 0) tableDisplay = null;
  else tableDisplay = '未选择';
  let fileDisplay = '';
  if (fileSelectMode === 'none') fileDisplay = '不使用';
  else if (fileSelectMode === 'all') fileDisplay = '全部文件';
  else if (fileSelectMode === 'custom' && files.length > 0) fileDisplay = files.join('、');
  else fileDisplay = '未选择';
  return (
    <div className="work-order-datasource-full">
      {tableDisplay !== null ? (
        <div>{tableDisplay}</div>
      ) : (
        tables.map((t) => (
          <div key={t}>{getTableSourceDisplayName(t)}</div>
        ))
      )}
      <div>{fileDisplay}</div>
    </div>
  );
}

/**
 * 数据来源完整信息纯文本（用于 Tooltip 等）
 * @param {Object} config - 工单中的 configInfo
 * @returns {string}
 */
function getDataSourceFullText(config) {
  if (!config) return '-';
  const hasTableFileDetail = config.sourceMode === 'custom' || config.tableSelectMode != null || (Array.isArray(config.tables) && config.tables.length > 0) || (Array.isArray(config.files) && config.files.length > 0);
  if (!hasTableFileDetail) return config.sourceText || '全部数据';
  const tableSelectMode = config.tableSelectMode || 'all';
  const fileSelectMode = config.fileSelectMode || 'all';
  const tables = config.tables || [];
  const files = config.files || [];
  let tableDisplay = '';
  if (tableSelectMode === 'none') tableDisplay = '不使用';
  else if (tableSelectMode === 'all') tableDisplay = '全部表';
  else if (tableSelectMode === 'custom' && tables.length > 0) tableDisplay = tables.map(getTableSourceDisplayName).join('\n');
  else tableDisplay = '未选择';
  let fileDisplay = '';
  if (fileSelectMode === 'none') fileDisplay = '不使用';
  else if (fileSelectMode === 'all') fileDisplay = '全部文件';
  else if (fileSelectMode === 'custom' && files.length > 0) fileDisplay = files.join('、');
  else fileDisplay = '未选择';
  return `${tableDisplay}\n${fileDisplay}`;
}

/**
 * 从工单 configInfo 生成与智能问数对话框一致的问数配置标签（只读展示）
 * @param {Object} configInfo - 工单提交时的问数配置
 * @returns {Array<{ key: string, value: string, tooltipContent?: React.ReactNode }>}
 */
function getDetailConfigTags(configInfo) {
  if (!configInfo) return [];
  const tags = [];
  const dataObjectDisplayMap = {
    custom: '默认对象',
    audit: '审计 / 券商 / 招投标 / 银行',
    government: '政府相关',
  };
  tags.push({
    key: 'dataObject',
    value: dataObjectDisplayMap[configInfo.dataObject] || '默认对象',
  });
  tags.push({
    key: 'caliber',
    value: configInfo.caliber === 'external' ? '法口数据' : '管口数据',
  });
  tags.push({
    key: 'filter',
    value: configInfo.filterOption === 'excludeInternal' ? '不含内部关联交易数据' : '全部交易数据',
  });
  const sourceText =
    configInfo.sourceText != null && configInfo.sourceText !== ''
      ? configInfo.sourceText
      : getDataSourceDisplayText(configInfo);
  tags.push({
    key: 'source',
    value: sourceText,
    tooltipContent: (
      <div style={{ fontSize: 13, lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
        {getDataSourceFullText(configInfo)}
      </div>
    ),
  });
  tags.push({
    key: 'scope',
    value: configInfo.scopeText != null && configInfo.scopeText !== '' ? configInfo.scopeText : '不指定范围',
  });
  return tags;
}

/**
 * 工单处理人：支持单值或数组，统一返回数组
 * @param {Object} record - 工单记录
 * @returns {string[]}
 */
function getHandlers(record) {
  const h = record?.handler;
  return Array.isArray(h) ? [...h] : h ? [h] : [];
}

/** 工单状态枚举（胶囊样式类名，与列表一致） */
const STATUS_MAP = {
  pending: { text: '待处理', className: 'status-pending' },
  in_progress: { text: '处理中', className: 'status-in-progress' },
  replied: { text: '已答复', className: 'status-replied' },
  closed: { text: '已关闭', className: 'status-closed' },
};

/** 表选项展示：表名英文 + 描述中文；无 nameEn 时用 name */
function getTableOptionLabel(t) {
  if (t.nameEn != null && t.description != null) return `${t.nameEn} ${t.description}`;
  if (t.nameEn != null) return `${t.nameEn} ${t.name || ''}`;
  return t.name || '';
}

/** 数据来源筛选项：全部来源、全部文件、全部表、指定文件、各表（表名+描述），无多余选项 */
const DATA_SOURCE_FILTER_OPTIONS = [
  { label: '全部来源', value: 'all_sources' },
  { label: '全部文件', value: 'all_files' },
  { label: '全部表', value: 'all_tables' },
  { label: '指定文件', value: 'specified_file' },
  ...tableOptions.map((t) => ({ label: getTableOptionLabel(t), value: `table:${t.name}` })),
];

/** 状态筛选项 */
const STATUS_FILTER_OPTIONS = [
  { label: '待处理', value: 'pending' },
  { label: '处理中', value: 'in_progress' },
  { label: '已答复', value: 'replied' },
  { label: '已关闭', value: 'closed' },
];

/**
 * 从 configInfo 拼出数据来源文案（与数据来源字段展示一致：全部表/全部文件 或 表英文+中文、文件名+后缀，无「表：」「文件：」前缀）
 * @param {Object} cfg - configInfo
 * @returns {string}
 */
function getSourceDisplayForThinking(cfg) {
  if (!cfg) return '全部表\n全部文件';
  if (cfg.sourceText != null && cfg.sourceText !== '') return cfg.sourceText;
  const tableMode = cfg.tableSelectMode || 'all';
  const fileMode = cfg.fileSelectMode || 'all';
  const tables = cfg.tables || [];
  const files = cfg.files || [];
  let tableDisplay = '全部表';
  if (tableMode === 'none') tableDisplay = '不使用';
  else if (tableMode === 'custom' && tables.length > 0) tableDisplay = tables.map(getTableSourceDisplayName).join('\n');
  let fileDisplay = '全部文件';
  if (fileMode === 'none') fileDisplay = '不使用';
  else if (fileMode === 'custom' && files.length > 0) fileDisplay = files.join('、');
  return `${tableDisplay}\n${fileDisplay}`;
}

/**
 * 构建与智能问数一致的思考消息结构（供 CombinedThinking 展示）
 * @param {Object} cfg - configInfo
 * @param {string} intentDesc - 意图描述
 * @param {Array<{description: string, status: string}>} steps - 思考步骤
 */
function buildThinkingMessage(cfg, intentDesc, steps) {
  const source = getSourceDisplayForThinking(cfg);
  const scope = cfg?.scopeText != null ? cfg.scopeText : '不指定范围';
  return {
    intentData: { status: 'done', description: intentDesc },
    config: {
      dataObject: cfg?.dataObject === 'custom' ? '自定义' : (cfg?.dataObject === 'audit' ? '审计对象' : '自定义'),
      source,
      scope,
      filter: cfg?.filterOption === 'all' ? '全部数据' : (cfg?.filterOption === 'excludeInternal' ? '排除内部' : '全部数据'),
      caliber: cfg?.caliber === 'internal' ? '内部管理用（管口）' : (cfg?.caliber === 'external' ? '对外披露' : '内部管理用（管口）'),
    },
    dataInfo: { time: '', metrics: [], dimensions: [] },
    steps: steps.map((s) => ({ ...s, status: 'done' })),
    isComplete: true,
    isStopped: false,
  };
}

/**
 * 构建与智能问数一致的结果消息结构（供 QueryResult 展示）
 * @param {string} summary - 摘要
 * @param {Array} resultBlocks - 结果块
 */
function buildResultMessage(summary, resultBlocks) {
  return {
    data: { summary: summary || '', resultBlocks: resultBlocks || [] },
    resultStatus: 'completed',
  };
}

/** 模拟工单列表数据（含与智能问数一致的 thinkingMessage / resultMessage，详情左侧原样复用展示） */
const MOCK_LIST = [
  {
    id: '20250201',
    submitter: '张三',
    handler: '李四',
    question: '今年销售额最高的三个行业是什么？为什么？',
    thinkingMessage: null,
    resultMessage: null,
    configInfo: {
      dataObject: 'custom',
      caliber: 'internal',
      filterOption: 'all',
      sourceText: '全部表、全部文件',
      scopeText: '不指定范围',
    },
    dataUsage: '用于月度经营分析汇报',
    dataRecipient: '经营分析组',
    remark: '需要包含同比数据。参考图表如下：<img src="https://picsum.photos/300/200" alt="备注示例图" class="work-order-detail-remark-img" />',
    status: 'pending',
    createdAt: '2025-02-04 10:30:00',
    updatedAt: '2025-02-04 10:30:00',
    correctReply: '',
    feedback: '',
  },
  {
    id: '20250202',
    submitter: '王五',
    handler: '李四',
    question: '我们前十大客户是什么？金额是什么？占比多少？',
    thinkingMessage: null,
    resultMessage: null,
    configInfo: {
      dataObject: 'audit',
      caliber: 'external',
      filterOption: 'excludeInternal',
      scopeText: '华南区',
      sourceMode: 'custom',
      tableSelectMode: 'custom',
      fileSelectMode: 'custom',
      tables: ['订单明细', '客户主数据'],
      files: ['2024年财务报告.pdf'],
    },
    dataUsage: '对外披露材料',
    dataRecipient: '证券部',
    remark: '',
    status: 'in_progress',
    createdAt: '2025-02-03 14:20:00',
    updatedAt: '2025-02-04 09:15:00',
    correctReply: '',
    feedback: '',
  },
  {
    id: '20250203',
    submitter: '赵六',
    handler: '李四',
    question: '1-6月不同产品收入是多少？',
    thinkingMessage: null,
    resultMessage: null,
    configInfo: {
      dataObject: 'custom',
      caliber: 'internal',
      filterOption: 'all',
      sourceText: '全部来源',
      scopeText: '不指定范围',
    },
    dataUsage: '产品线复盘',
    dataRecipient: '产品部',
    remark: '按事业部汇总',
    status: 'closed',
    createdAt: '2025-02-02 11:00:00',
    updatedAt: '2025-02-03 16:00:00',
    correctReply: '',
    feedback: '',
  },
];

/* 为每条工单注入与智能问数同结构的 thinkingMessage / resultMessage（展示用） */
(function injectThinkingAndResult() {
  const thinking1 = buildThinkingMessage(
    MOCK_LIST[0].configInfo,
    '用户询问销售额最高的三个行业及原因，属于多维度对比与归因分析。',
    [
      { description: '解析用户意图：识别为多维度对比与归因查询', status: 'done' },
      { description: '确定数据范围：全部表、全部文件', status: 'done' },
      { description: '生成并执行查询，按行业汇总销售额', status: 'done' },
    ]
  );
  MOCK_LIST[0].thinkingMessage = thinking1;
  MOCK_LIST[0].resultMessage = buildResultMessage(
    '根据当前数据，销售额最高的三个行业为：制造业、批发和零售业、信息技术服务业。主要原因包括产业结构、需求规模及政策支持等。',
    [
      {
        title: '行业销售额排名',
        tableData: {
          columns: [
            { title: '行业', dataIndex: 'industry', key: 'industry' },
            { title: '销售额(万元)', dataIndex: 'amount', key: 'amount' },
            { title: '占比', dataIndex: 'ratio', key: 'ratio' },
          ],
          dataSource: [
            { key: '1', industry: '制造业', amount: '125,600', ratio: '42.1%' },
            { key: '2', industry: '批发和零售业', amount: '89,200', ratio: '29.9%' },
            { key: '3', industry: '信息技术服务业', amount: '52,300', ratio: '17.5%' },
          ],
        },
        sources: [],
      },
    ]
  );

  const thinking2 = buildThinkingMessage(
    MOCK_LIST[1].configInfo,
    '用户询问前十大客户及金额、占比，属于排名类查询。',
    [
      { description: '意图识别：排名类查询（Top N 客户）', status: 'done' },
      { description: '数据来源：订单明细、客户主数据', status: 'done' },
      { description: '执行聚合与排序，计算金额与占比', status: 'done' },
    ]
  );
  MOCK_LIST[1].thinkingMessage = thinking2;
  MOCK_LIST[1].resultMessage = buildResultMessage(
    '前十大客户及金额、占比如下表所示。',
    [
      {
        title: '前十大客户',
        tableData: {
          columns: [
            { title: '客户名称', dataIndex: 'name', key: 'name' },
            { title: '金额(万元)', dataIndex: 'amount', key: 'amount' },
            { title: '占比', dataIndex: 'ratio', key: 'ratio' },
          ],
          dataSource: [
            { key: '1', name: '客户A', amount: '1,200', ratio: '12.5%' },
            { key: '2', name: '客户B', amount: '980', ratio: '10.2%' },
            { key: '3', name: '客户C', amount: '850', ratio: '8.9%' },
          ],
        },
        sources: [],
      },
    ]
  );

  const thinking3 = buildThinkingMessage(
    MOCK_LIST[2].configInfo,
    '用户询问1-6月不同产品收入，属于时间范围与维度拆分查询。',
    [
      { description: '识别时间范围与指标：1-6月、收入', status: 'done' },
      { description: '按产品维度聚合', status: 'done' },
    ]
  );
  MOCK_LIST[2].thinkingMessage = thinking3;
  MOCK_LIST[2].resultMessage = buildResultMessage(
    '1-6月各产品收入汇总如下。',
    [
      {
        title: '1-6月产品收入',
        tableData: {
          columns: [
            { title: '产品', dataIndex: 'product', key: 'product' },
            { title: '收入(万元)', dataIndex: 'revenue', key: 'revenue' },
          ],
          dataSource: [
            { key: '1', product: '产品线A', revenue: '56,000' },
            { key: '2', product: '产品线B', revenue: '48,200' },
            { key: '3', product: '产品线C', revenue: '32,100' },
          ],
        },
        sources: [],
      },
    ]
  );
})();

/**
 * 工单管理 - 我处理的
 * @returns {JSX.Element}
 */
const WorkOrderMyHandled = () => {
  const [list, setList] = useState(MOCK_LIST);
  const [detailVisible, setDetailVisible] = useState(false);
  const [detailRecord, setDetailRecord] = useState(null);
  /** 详情页右侧：评论区（富文本 HTML，支持粘贴图片与追加） */
  const [detailCorrectReply, setDetailCorrectReply] = useState('');
  /** 详情页评论区：当前要发表的新回复内容 */
  const [detailCorrectReplyAppend, setDetailCorrectReplyAppend] = useState('');
  /** 详情页评论区：当前回复的附件列表（挂在回复框外，提交时写入回复段） */
  const [detailReplyAttachments, setDetailReplyAttachments] = useState([]);
  const detailReplyHistoryRef = useRef(null);
  /** 详情页处理人：是否处于更换编辑态、待确认的选中值（多选为 string[]） */
  const [detailHandlerEditing, setDetailHandlerEditing] = useState(false);
  const [detailHandlerPendingValue, setDetailHandlerPendingValue] = useState([]);
  /** 详情页状态：是否处于更换编辑态、待确认的选中值（string） */
  const [detailStatusEditing, setDetailStatusEditing] = useState(false);
  const [detailStatusPendingValue, setDetailStatusPendingValue] = useState('');
  const [remarkPreviewSrc, setRemarkPreviewSrc] = useState(null);
  const [remarkPreviewVisible, setRemarkPreviewVisible] = useState(false);
  const [searchValues, setSearchValues] = useState({
    id: '',
    question: '',
    dataUsage: '',
    dataRecipient: '',
  });
  const [filterSubmitter, setFilterSubmitter] = useState([]);
  const [filterHandler, setFilterHandler] = useState([]);
  const [filterDataSource, setFilterDataSource] = useState([]);
  const [filterStatus, setFilterStatus] = useState([]);
  const [filterCreatedRange, setFilterCreatedRange] = useState(null);
  const [filterUpdatedRange, setFilterUpdatedRange] = useState(null);
  /** 列表页多选：选中的工单 id 列表 */
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  /** 列表页处理人：正在编辑的行 id、待确认的选中值 */
  const [listHandlerEditingId, setListHandlerEditingId] = useState(null);
  const [listHandlerPendingValue, setListHandlerPendingValue] = useState([]);

  /** 提交人 / 处理人筛选项（从列表去重） */
  const submitterOptions = useMemo(() => {
    const set = new Set();
    list.forEach((r) => { if (r.submitter) set.add(r.submitter); });
    return Array.from(set).sort().map((v) => ({ label: v, value: v }));
  }, [list]);
  const handlerOptions = useMemo(() => {
    const set = new Set();
    list.forEach((r) => getHandlers(r).forEach((h) => set.add(h)));
    return Array.from(set).sort().map((v) => ({ label: v, value: v }));
  }, [list]);

  /** 列表内可选的处理人：当前出现过的处理人 + 提交人，便于分配 */
  const handlerSelectOptions = useMemo(() => {
    const set = new Set();
    list.forEach((r) => {
      getHandlers(r).forEach((h) => set.add(h));
      if (r.submitter) set.add(r.submitter);
    });
    return Array.from(set).sort().map((v) => ({ label: v, value: v }));
  }, [list]);

  const updateSearch = useCallback((field, value) => {
    setSearchValues((prev) => ({ ...prev, [field]: value }));
  }, []);

  const handleResetFilters = useCallback(() => {
    setSearchValues({ id: '', question: '', dataUsage: '', dataRecipient: '' });
    setFilterSubmitter([]);
    setFilterHandler([]);
    setFilterDataSource([]);
    setFilterStatus([]);
    setFilterCreatedRange(null);
    setFilterUpdatedRange(null);
  }, []);

  /** 工单是否匹配数据来源筛选项（匹配任一即通过） */
  const orderMatchesDataSource = useCallback((record, values) => {
    if (!values || values.length === 0) return true;
    const cfg = record.configInfo || {};
    const tables = cfg.tables || [];
    const files = cfg.files || [];
    const tableMode = cfg.tableSelectMode || 'all';
    const fileMode = cfg.fileSelectMode || 'all';
    const sourceText = String(cfg.sourceText || '');
    const fullText = [sourceText, tables.join(' '), files.join(' ')].filter(Boolean).join(' ');
    return values.some((v) => {
      if (v === 'all_sources') return (tableMode === 'all' && fileMode === 'all') || /全部来源/.test(sourceText) || (/全部表/.test(sourceText) && /全部文件/.test(sourceText));
      if (v === 'all_files') return fileMode === 'all' || /全部文件/.test(sourceText);
      if (v === 'all_tables') return tableMode === 'all' || /全部表/.test(sourceText);
      if (v === 'specified_file') return fileMode === 'custom' && files.length > 0;
      if (v.startsWith('table:')) {
        const name = v.slice(6);
        return tables.includes(name) || (fullText && fullText.includes(name));
      }
      return false;
    });
  }, []);

  const filteredList = useMemo(() => {
    return list.filter((record) => {
      const fields = ['id', 'question', 'dataUsage', 'dataRecipient'];
      for (const field of fields) {
        const kw = (searchValues[field] || '').trim().toLowerCase();
        if (kw && !String(record[field] || '').toLowerCase().includes(kw)) return false;
      }
      if (filterSubmitter.length > 0 && !filterSubmitter.includes(record.submitter)) return false;
      if (filterHandler.length > 0 && !getHandlers(record).some((h) => filterHandler.includes(h))) return false;
      if (filterStatus.length > 0 && !filterStatus.includes(record.status)) return false;
      if (filterDataSource.length > 0 && !orderMatchesDataSource(record, filterDataSource)) return false;
      if (filterCreatedRange && filterCreatedRange[0] && filterCreatedRange[1]) {
        const created = dayjs(record.createdAt);
        if (!created.isValid() || created.isBefore(filterCreatedRange[0].startOf('day')) || created.isAfter(filterCreatedRange[1].endOf('day'))) return false;
      }
      if (filterUpdatedRange && filterUpdatedRange[0] && filterUpdatedRange[1]) {
        const updated = dayjs(record.updatedAt);
        if (!updated.isValid() || updated.isBefore(filterUpdatedRange[0].startOf('day')) || updated.isAfter(filterUpdatedRange[1].endOf('day'))) return false;
      }
      return true;
    });
  }, [list, searchValues, filterSubmitter, filterHandler, filterStatus, filterDataSource, filterCreatedRange, filterUpdatedRange, orderMatchesDataSource]);

  const handleViewDetail = useCallback((record) => {
    setDetailRecord(record);
    setDetailCorrectReply(normalizeCorrectReplyToHtml(record.correctReply));
    setDetailHandlerEditing(false);
    setDetailHandlerPendingValue([]);
    setDetailVisible(true);
  }, []);

  const handleCloseDetail = useCallback(() => {
    setDetailVisible(false);
    setDetailRecord(null);
    setDetailCorrectReply('');
    setDetailCorrectReplyAppend('');
    setDetailReplyAttachments([]);
    setDetailHandlerEditing(false);
    setDetailHandlerPendingValue('');
  }, []);

  /** 将当前输入合并到评论区（发表一条回复，含附件） */
  const appendToCorrectReply = useCallback(() => {
    const hasContent = !isRichContentEmpty(detailCorrectReplyAppend);
    const hasAttachments = detailReplyAttachments?.length > 0;
    if (!hasContent && !hasAttachments) return;
    const time = formatDateTime(new Date());
    const replier = CURRENT_USER;
    const attachmentBlock = attachmentsToSegmentHtml(detailReplyAttachments);
    const segmentHtml = `<div class="work-order-reply-segment"><div class="work-order-reply-segment-meta"><span class="work-order-reply-segment-replier">${escapeHtml(replier)}</span> <span class="work-order-reply-segment-time">${escapeHtml(time)}</span></div>${detailCorrectReplyAppend || ''}${attachmentBlock}</div>`;
    setDetailCorrectReply((prev) => (prev ? prev + segmentHtml : segmentHtml));
    setDetailCorrectReplyAppend('');
    setDetailReplyAttachments([]);
  }, [detailCorrectReplyAppend, detailReplyAttachments]);

  /** 确认答复：保存评论区内容，设为已答复并关闭工单抽屉 */
  const confirmReply = useCallback(() => {
    if (!detailRecord) return;
    if (isRichContentEmpty(detailCorrectReply)) {
      message.warning('请至少发表一条回复');
      return;
    }
    setList((prev) =>
      prev.map((item) =>
        item.id === detailRecord.id
          ? { ...item, correctReply: detailCorrectReply, status: 'in_progress', updatedAt: formatDateTime(new Date()) }
          : item
      )
    );
    message.success('已答复');
    handleCloseDetail();
  }, [detailRecord, detailCorrectReply, handleCloseDetail]);

  /** 关闭工单：若有未发表的输入或附件则一并并入后保存并关闭 */
  const replyAndClose = useCallback(() => {
    if (!detailRecord) return;
    const time = formatDateTime(new Date());
    const replier = CURRENT_USER;
    const hasAppendContent = !isRichContentEmpty(detailCorrectReplyAppend);
    const hasAppendAttachments = detailReplyAttachments?.length > 0;
    const attachmentBlock = attachmentsToSegmentHtml(detailReplyAttachments);
    const appendSegment =
      hasAppendContent || hasAppendAttachments
        ? `<div class="work-order-reply-segment"><div class="work-order-reply-segment-meta"><span class="work-order-reply-segment-replier">${escapeHtml(replier)}</span> <span class="work-order-reply-segment-time">${escapeHtml(time)}</span></div>${detailCorrectReplyAppend || ''}${attachmentBlock}</div>`
        : '';
    const finalReply = (detailCorrectReply || '') + appendSegment;
    if (isRichContentEmpty(finalReply)) {
      message.warning('请至少发表一条回复');
      return;
    }
    setList((prev) =>
      prev.map((item) =>
        item.id === detailRecord.id
          ? { ...item, correctReply: finalReply, status: 'closed', updatedAt: time }
          : item
      )
    );
    message.success('已答复并关闭工单');
    setDetailReplyAttachments([]);
    handleCloseDetail();
  }, [detailRecord, detailCorrectReply, detailCorrectReplyAppend, detailReplyAttachments, handleCloseDetail]);

  /** 详情评论区已发表回复中的附件点击下载（事件委托） */
  useEffect(() => {
    const container = detailReplyHistoryRef.current;
    if (!container) return;
    const onReplyHistoryClick = (e) => {
      const target = e.target?.nodeType === Node.TEXT_NODE ? e.target.parentElement : e.target;
      const el = target?.closest?.('.comment-attachment');
      if (!el) return;
      const filename = el.getAttribute('data-filename') || '下载';
      const href = el.getAttribute('data-href');
      if (!href) return;
      e.preventDefault();
      e.stopPropagation();
      try {
        const a = document.createElement('a');
        a.download = filename;
        a.rel = 'noopener noreferrer';
        if (href.startsWith('data:')) {
          const m = href.match(/^data:([^;]+);base64,(.+)$/);
          if (m) {
            const type = m[1];
            const b64 = m[2];
            const bin = atob(b64);
            const arr = new Uint8Array(bin.length);
            for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
            const blob = new Blob([arr], { type });
            a.href = URL.createObjectURL(blob);
            a.click();
            URL.revokeObjectURL(a.href);
            return;
          }
        }
        a.href = href;
        a.click();
      } catch (err) {
        const w = window.open(href, '_blank', 'noopener');
        if (w) w.document.title = filename;
      }
    };
    container.addEventListener('click', onReplyHistoryClick, true);
    return () => container.removeEventListener('click', onReplyHistoryClick, true);
  }, [detailVisible]);

  /** 重新打开：将已关闭工单改为待处理，并刷新当前详情展示 */
  const handleReopen = useCallback(() => {
    if (!detailRecord || detailRecord.status !== 'closed') return;
    const updated = {
      ...detailRecord,
      correctReply: detailCorrectReply,
      status: 'pending',
      updatedAt: formatDateTime(new Date()),
    };
    setList((prev) =>
      prev.map((item) => (item.id === detailRecord.id ? updated : item))
    );
    setDetailRecord(updated);
    message.success('已重新打开');
  }, [detailRecord, detailCorrectReply]);

  /**
   * 关闭工单（仅待处理、已答复可关闭）
   * @param {Object} record
   */
  /**
   * 在列表中更改处理人（多选，newHandlers 为 string[]）
   * @param {Object} record - 工单记录
   * @param {string[]} newHandlers - 新处理人列表
   */
  const handleChangeHandler = useCallback((record, newHandlers) => {
    const normalized = Array.isArray(newHandlers) ? newHandlers : [];
    setList((prev) =>
      prev.map((item) =>
        item.id === record.id
          ? { ...item, handler: normalized, updatedAt: formatDateTime(new Date()) }
          : item
      )
    );
    message.success('处理人已更新');
  }, []);

  /** 详情页：点击【更换】进入处理人编辑态 */
  const startEditDetailHandler = useCallback(() => {
    setDetailHandlerPendingValue(getHandlers(detailRecord));
    setDetailHandlerEditing(true);
  }, [detailRecord]);

  /** 详情页：确认更换处理人 */
  const confirmDetailHandlerChange = useCallback(() => {
    if (!detailRecord) return;
    const val = Array.isArray(detailHandlerPendingValue) ? detailHandlerPendingValue : [];
    handleChangeHandler(detailRecord, val);
    setDetailRecord((prev) =>
      prev && prev.id === detailRecord.id ? { ...prev, handler: val } : prev
    );
    setDetailHandlerEditing(false);
  }, [detailRecord, detailHandlerPendingValue, handleChangeHandler]);

  /** 详情页：取消更换处理人 */
  const cancelDetailHandlerEdit = useCallback(() => {
    setDetailHandlerEditing(false);
  }, []);

  /** 详情页：点击状态进入编辑态 */
  const startEditDetailStatus = useCallback(() => {
    setDetailStatusPendingValue(detailRecord?.status || 'pending');
    setDetailStatusEditing(true);
  }, [detailRecord]);

  /** 详情页：确认更换状态 */
  const confirmDetailStatusChange = useCallback(() => {
    if (!detailRecord || !detailStatusPendingValue) return;
    const newStatus = detailStatusPendingValue;
    setList((prev) =>
      prev.map((item) =>
        item.id === detailRecord.id ? { ...item, status: newStatus, updatedAt: formatDateTime(new Date()) } : item
      )
    );
    setDetailRecord((prev) => (prev && prev.id === detailRecord.id ? { ...prev, status: newStatus } : prev));
    setDetailStatusEditing(false);
    message.success('状态已更新');
  }, [detailRecord, detailStatusPendingValue]);

  /** 详情页：取消更换状态 */
  const cancelDetailStatusEdit = useCallback(() => {
    setDetailStatusEditing(false);
  }, []);

  /** 列表页：开始更换处理人 */
  const startListHandlerEdit = useCallback((record) => {
    setListHandlerEditingId(record.id);
    setListHandlerPendingValue(getHandlers(record));
  }, []);

  /** 列表页：确认更换处理人 */
  const confirmListHandlerChange = useCallback((record) => {
    handleChangeHandler(record, listHandlerPendingValue);
    setListHandlerEditingId(null);
  }, [listHandlerPendingValue, handleChangeHandler]);

  /** 列表页：取消更换处理人 */
  const cancelListHandlerEdit = useCallback(() => {
    setListHandlerEditingId(null);
  }, []);

  const handleCloseWorkOrder = useCallback((record) => {
    if (record.status === 'closed') {
      message.info('该工单已关闭');
      return;
    }
    Modal.confirm({
      title: '确认关闭工单',
      content: `确定要关闭工单 ${record.id} 吗？关闭后不可再操作。`,
      okText: '确定关闭',
      cancelText: '取消',
      onOk: () => {
        setList((prev) =>
          prev.map((item) =>
            item.id === record.id ? { ...item, status: 'closed', updatedAt: formatDateTime(new Date()) } : item
          )
        );
        message.success('工单已关闭');
      },
    });
  }, []);

  /** 批量关闭：仅关闭选中且未关闭的工单 */
  const handleBatchClose = useCallback(() => {
    const ids = selectedRowKeys;
    if (!ids.length) return;
    const toClose = list.filter((item) => ids.includes(item.id) && item.status !== 'closed');
    if (toClose.length === 0) {
      message.info('所选工单均已关闭');
      setSelectedRowKeys([]);
      return;
    }
    Modal.confirm({
      title: '批量关闭工单',
      content: `确定要关闭选中的 ${toClose.length} 个工单吗？关闭后不可再操作。`,
      okText: '确定关闭',
      cancelText: '取消',
      onOk: () => {
        const time = formatDateTime(new Date());
        setList((prev) =>
          prev.map((item) =>
            ids.includes(item.id) && item.status !== 'closed'
              ? { ...item, status: 'closed', updatedAt: time }
              : item
          )
        );
        setSelectedRowKeys([]);
        message.success(`已关闭 ${toClose.length} 个工单`);
      },
    });
  }, [selectedRowKeys, list]);

  const columns = useMemo(
    () => [
      {
        title: '工单编号',
        dataIndex: 'id',
        key: 'id',
        width: 120,
        ellipsis: true,
        render: (text) => (
          <Tooltip title={text || '-'} placement="topLeft">
            <span>{text || '-'}</span>
          </Tooltip>
        ),
      },
      { title: '提交人', dataIndex: 'submitter', key: 'submitter', width: 90 },
      {
        title: '处理人',
        dataIndex: 'handler',
        key: 'handler',
        width: 180,
        render: (_, record) => {
          const isEditing = listHandlerEditingId === record.id;
          const handlers = getHandlers(record);
          if (record.status === 'closed') {
            return (
              <span className="work-order-list-handler-tags">
                {handlers.length > 0
                  ? handlers.map((h) => <Tag key={h} className="work-order-list-handler-tag">{h}</Tag>)
                  : <span className="work-order-list-handler-text">-</span>}
              </span>
            );
          }
          if (isEditing) {
            return (
              <span className="work-order-list-handler-edit">
                <Select
                  mode="multiple"
                  value={listHandlerPendingValue}
                  placeholder="请选择"
                  options={handlerSelectOptions}
                  onChange={(value) => setListHandlerPendingValue(Array.isArray(value) ? value : [])}
                  getPopupContainer={(n) => n?.parentElement || document.body}
                  className="work-order-handler-select"
                  allowClear
                  size="small"
                  maxTagCount="responsive"
                  style={{ minWidth: 80 }}
                />
                <span className="work-order-list-handler-action" onClick={() => confirmListHandlerChange(record)}>确认</span>
                <span className="work-order-list-handler-action" onClick={cancelListHandlerEdit}>取消</span>
              </span>
            );
          }
          return (
            <span className="work-order-list-handler-display">
              <span className="work-order-list-handler-tags">
                {handlers.length > 0
                  ? handlers.map((h) => <Tag key={h} className="work-order-list-handler-tag">{h}</Tag>)
                  : <span className="work-order-list-handler-text">-</span>}
              </span>
              <Tooltip title="更换" placement="top">
                <span className="work-order-list-handler-change" onClick={() => startListHandlerEdit(record)} aria-label="更换">
                  <EditOutlined />
                </span>
              </Tooltip>
            </span>
          );
        },
      },
      {
        title: '问题',
        dataIndex: 'question',
        key: 'question',
        width: 280,
        className: 'work-order-question-cell',
        render: (text) => (
          <Tooltip title={text || '-'} placement="topLeft">
            <span className="work-order-question-text">{text || '-'}</span>
          </Tooltip>
        ),
      },
      {
        title: '数据来源',
        key: 'dataSource',
        width: 240,
        className: 'work-order-datasource-cell',
        render: (_, record) => (
          <Tooltip
            title={<span style={{ whiteSpace: 'pre-wrap' }}>{getDataSourceFullText(record.configInfo)}</span>}
            placement="topLeft"
          >
            <span className="work-order-datasource-tooltip-wrap">{getDataSourceFullContent(record.configInfo)}</span>
          </Tooltip>
        ),
      },
      {
        title: '状态',
        dataIndex: 'status',
        key: 'status',
        width: 100,
        render: (status) => {
          const { text, className } = STATUS_MAP[status] || { text: status, className: 'status-closed' };
          return <span className={`work-order-status-tag ${className}`}>{text}</span>;
        },
      },
      {
        title: '数据用途',
        dataIndex: 'dataUsage',
        key: 'dataUsage',
        width: 180,
        className: 'work-order-cell-two-lines',
        render: (text) => (
          <Tooltip title={text || '-'} placement="topLeft">
            <span className="work-order-cell-two-lines-text">{text || '-'}</span>
          </Tooltip>
        ),
      },
      {
        title: '数据提供对象',
        dataIndex: 'dataRecipient',
        key: 'dataRecipient',
        width: 160,
        className: 'work-order-cell-two-lines',
        render: (text) => (
          <Tooltip title={text || '-'} placement="topLeft">
            <span className="work-order-cell-two-lines-text">{text || '-'}</span>
          </Tooltip>
        ),
      },
      { title: '提交时间', dataIndex: 'createdAt', key: 'createdAt', width: 168, align: 'right' },
      { title: '更新时间', dataIndex: 'updatedAt', key: 'updatedAt', width: 168, align: 'right' },
      {
        title: '操作',
        key: 'action',
        width: 100,
        fixed: 'right',
        render: (_, record) => (
          <Space size={0} className="work-order-action-btns">
            <Tooltip title="详情" placement="top">
              <Button type="text" size="small" icon={<EyeOutlined />} className="work-order-action-icon-btn" onClick={() => handleViewDetail(record)} />
            </Tooltip>
            {record.status !== 'closed' && (
              <Tooltip title="关闭" placement="top">
                <Button type="text" size="small" danger icon={<CloseOutlined />} className="work-order-action-icon-btn work-order-action-icon-btn-close" onClick={() => handleCloseWorkOrder(record)} />
              </Tooltip>
            )}
          </Space>
        ),
      },
    ],
    [handleViewDetail, handleCloseWorkOrder, handleChangeHandler, handlerSelectOptions, listHandlerEditingId, listHandlerPendingValue, startListHandlerEdit, confirmListHandlerChange, cancelListHandlerEdit]
  );

  /** 详情页用：若工单上未带思考/结果数据则用默认结构兜底，保证左侧一定有展示 */
  const getThinkingAndResultForDetail = useCallback((record) => {
    let thinking = record?.thinkingMessage;
    let result = record?.resultMessage;
    if (!thinking && record?.configInfo) {
      thinking = buildThinkingMessage(
        record.configInfo,
        '意图识别完成。',
        [{ description: '解析问题并确定数据范围', status: 'done' }, { description: '生成并执行查询', status: 'done' }]
      );
    }
    if (!result || !result.data) {
      const summary = record?.question ? `针对「${record.question}」的查询结果。` : '（暂无结果内容）';
      result = buildResultMessage(summary, []);
    }
    return { thinking, result };
  }, []);

  /** 详情内容（左侧对话 + 右侧信息），供右侧抽屉使用 */
  const renderDetailContent = () => {
    if (!detailRecord) return null;
    const { thinking, result } = getThinkingAndResultForDetail(detailRecord);
    return (
      <div className="work-order-detail-drawer-content">
        {/* 顶部：基本信息 | 问题与数据 左右两栏 */}
        <div className="work-order-detail-top-info">
          <div className="work-order-detail-info work-order-detail-top-info-left">
            <div className="work-order-detail-info-section">
              <div className="work-order-detail-info-row work-order-detail-info-row-inline">
                <div className="work-order-detail-info-item">
                  <span className="label">工单编号</span>
                  <span className="value value-id">{detailRecord.id}</span>
                </div>
                <div className="work-order-detail-info-item">
                  <span className="label">状态</span>
                  <span className="work-order-detail-handler-value">
                    {detailStatusEditing ? (
                      <span className="work-order-detail-handler-edit">
                        <Select
                          value={detailStatusPendingValue || undefined}
                          placeholder="请选择状态"
                          options={STATUS_FILTER_OPTIONS}
                          onChange={(v) => setDetailStatusPendingValue(v)}
                          getPopupContainer={(n) => n?.parentElement || document.body}
                          className="work-order-handler-select"
                          size="small"
                          style={{ minWidth: 100 }}
                        />
                        <span className="work-order-detail-handler-action" onClick={confirmDetailStatusChange}>确认</span>
                        <span className="work-order-detail-handler-action" onClick={cancelDetailStatusEdit}>取消</span>
                      </span>
                    ) : (
                      <span className="work-order-detail-handler-display">
                        <span
                          className={`work-order-status-tag ${(STATUS_MAP[detailRecord.status] || {}).className || 'status-closed'}`}
                        >
                          {STATUS_MAP[detailRecord.status]?.text || detailRecord.status}
                        </span>
                        <Tooltip title="更换" placement="top">
                          <span className="work-order-detail-handler-change" onClick={startEditDetailStatus} aria-label="更换状态">
                            <EditOutlined />
                          </span>
                        </Tooltip>
                      </span>
                    )}
                  </span>
                </div>
              </div>
              <div className="work-order-detail-info-row work-order-detail-info-row-inline">
                <div className="work-order-detail-info-item">
                  <span className="label">提交人</span>
                  <span className="value">{detailRecord.submitter}</span>
                </div>
                <div className="work-order-detail-info-item">
                  <span className="label">处理人</span>
                  <span className="value work-order-detail-handler-value">
                    {detailRecord.status === 'closed' ? (
                      <span className="work-order-detail-handler-tags">
                        {getHandlers(detailRecord).length > 0
                          ? getHandlers(detailRecord).map((h) => <Tag key={h} className="work-order-detail-handler-tag">{h}</Tag>)
                          : <span className="work-order-detail-handler-empty">-</span>}
                      </span>
                    ) : detailHandlerEditing ? (
                      <span className="work-order-detail-handler-edit">
                        <Select
                          mode="multiple"
                          value={detailHandlerPendingValue || []}
                          placeholder="请选择"
                          options={handlerSelectOptions}
                          onChange={(value) => setDetailHandlerPendingValue(Array.isArray(value) ? value : [])}
                          getPopupContainer={(n) => n?.parentElement || document.body}
                          className="work-order-handler-select"
                          allowClear
                          size="small"
                          style={{ minWidth: 140 }}
                          maxTagCount="responsive"
                        />
                        <span className="work-order-detail-handler-action" onClick={confirmDetailHandlerChange}>确认</span>
                        <span className="work-order-detail-handler-action" onClick={cancelDetailHandlerEdit}>取消</span>
                      </span>
                    ) : (
                      <span className="work-order-detail-handler-display">
                        <span className="work-order-detail-handler-tags">
                          {getHandlers(detailRecord).length > 0
                            ? getHandlers(detailRecord).map((h) => <Tag key={h} className="work-order-detail-handler-tag">{h}</Tag>)
                            : <span className="work-order-detail-handler-empty">-</span>}
                        </span>
                        <Tooltip title="更换" placement="top">
                          <span className="work-order-detail-handler-change" onClick={startEditDetailHandler} aria-label="更换">
                            <EditOutlined />
                          </span>
                        </Tooltip>
                      </span>
                    )}
                  </span>
                </div>
              </div>
              <div className="work-order-detail-info-row work-order-detail-info-row-inline">
                <div className="work-order-detail-info-item">
                  <span className="label">提交时间</span>
                  <span className="value">{detailRecord.createdAt}</span>
                </div>
                <div className="work-order-detail-info-item">
                  <span className="label">更新时间</span>
                  <span className="value">{detailRecord.updatedAt}</span>
                </div>
              </div>
            </div>
          </div>
          <div className="work-order-detail-info work-order-detail-top-info-right">
            <div className="work-order-detail-top-info-right-inner">
              <div className="work-order-detail-info-section work-order-detail-info-section-problem-data">
                <div className="work-order-detail-info-row">
                  <span className="label">问题</span>
                  <span className="value value-block">{detailRecord.question}</span>
                </div>
                <div className="work-order-detail-info-row">
                  <span className="label">数据用途</span>
                  <span className="value value-block">{detailRecord.dataUsage || '-'}</span>
                </div>
                <div className="work-order-detail-info-row">
                  <span className="label">数据提供对象</span>
                  <span className="value value-block">{detailRecord.dataRecipient || '-'}</span>
                </div>
              </div>
              <div className="work-order-detail-info-section work-order-detail-info-section-remark">
                <div className="work-order-detail-info-row">
                  <span className="label">备注</span>
                  {detailRecord.remark && /<img/i.test(detailRecord.remark) ? (
                    <div
                      className="value value-block work-order-detail-remark-value"
                      dangerouslySetInnerHTML={{ __html: detailRecord.remark }}
                      onClick={(e) => {
                        if (e.target && e.target.tagName === 'IMG' && e.target.getAttribute('src')) {
                          e.preventDefault();
                          setRemarkPreviewSrc(e.target.getAttribute('src'));
                          setRemarkPreviewVisible(true);
                        }
                      }}
                      role="presentation"
                    />
                  ) : (
                    <span className="value value-block">{detailRecord.remark || '-'}</span>
                  )}
                </div>
              </div>
            </div>
          </div>
          {remarkPreviewSrc && (
            <Image
              src={remarkPreviewSrc}
              style={{ display: 'none' }}
              preview={{
                visible: remarkPreviewVisible,
                onVisibleChange: (v) => setRemarkPreviewVisible(v),
              }}
            />
          )}
        </div>
        <div className="work-order-detail-body">
          {/* 左侧：与智能问数一致——问数配置标签 + 问题、思考过程(默认收起)、答案(QueryResult) */}
          <div className="work-order-detail-left messages-container">
            {/* 顶部：与智能问数对话框一致的问数配置信息（只读） */}
            {detailRecord.configInfo && (
              <div className="work-order-detail-config-tags-wrap">
                <div className="config-tags-container">
                  {getDetailConfigTags(detailRecord.configInfo).map((tag) => {
                    const tagEl = (
                      <Tag className="config-tag" key={tag.key}>
                        <span>{tag.value}</span>
                      </Tag>
                    );
                    return tag.tooltipContent ? (
                      <Tooltip
                        key={tag.key}
                        title={tag.tooltipContent}
                        overlayStyle={{ maxWidth: 400 }}
                        overlayInnerStyle={{
                          color: '#333',
                          backgroundColor: '#fff',
                          border: '1px solid #e8e8e8',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                        }}
                        color="#fff"
                        placement="top"
                      >
                        {tagEl}
                      </Tooltip>
                    ) : (
                      <React.Fragment key={tag.key}>{tagEl}</React.Fragment>
                    );
                  })}
                </div>
              </div>
            )}
            {/* 1. 用户问题（与问数对话一致，右下角显示提交时间） */}
            <div className="message user-message">
              <div className="message-content">
                <p>{detailRecord.question}</p>
              </div>
              <div className="work-order-detail-message-time-wrap">
                <span className="message-time">{detailRecord.createdAt}</span>
              </div>
            </div>
            {/* 2. 思考过程（CombinedThinking，默认收起） */}
            {thinking && (
              <div className="message ai-message">
                <div className="message-content">
                  <CombinedThinking
                    intentData={thinking.intentData}
                    config={thinking.config}
                    dataInfo={thinking.dataInfo}
                    steps={thinking.steps}
                    isComplete={thinking.isComplete}
                    isStopped={thinking.isStopped}
                    defaultExpanded={false}
                  />
                </div>
              </div>
            )}
            {/* 3. 结果答案（与问数一致：结果状态 + QueryResult） */}
            {result && result.data && (
              <div className="message ai-message">
                <div className="message-content">
                  {result.resultStatus && (
                    <div className="result-status-header">
                      <div className="result-status-content">
                        {result.resultStatus === 'completed' && (
                          <>
                            <CheckCircleOutlined style={{ color: '#52c41a', fontSize: 16, marginRight: 8 }} />
                            <span className="result-status-text">输出完成</span>
                          </>
                        )}
                      </div>
                    </div>
                  )}
                  {(() => {
                    const data = result.data || {};
                    const hasSummary = typeof data.summary === 'string' && data.summary.trim().length > 0;
                    const hasBlocks = Array.isArray(data.resultBlocks) && data.resultBlocks.some((block) => {
                      if (!block) return false;
                      const hasTable = block.tableData && Array.isArray(block.tableData.dataSource) && block.tableData.dataSource.length > 0;
                      const hasDescription = typeof block.description === 'string' && block.description.trim().length > 0;
                      return hasTable || hasDescription;
                    });
                    const hasTableData = data.tableData && Array.isArray(data.tableData?.dataSource) && data.tableData.dataSource.length > 0;
                    if (hasSummary || hasBlocks || hasTableData) {
                      return <QueryResult data={data} hideChartAndExport />;
                    }
                    return <p>{data.summary || '（暂无结果内容）'}</p>;
                  })()}
                  <div className="work-order-detail-answer-footer">
                    <span className="message-time">{detailRecord.updatedAt}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
          {/* 右侧：整块展示评论，评论框与发表按钮固定在底部 */}
          <div className="work-order-detail-right">
            <div className="work-order-detail-right-body">
            <div className="work-order-detail-edit">
              <div ref={detailReplyHistoryRef} className="work-order-detail-reply-history">
                {detailCorrectReply ? (
                  <SimpleRichEditor
                    key={`reply-${detailRecord?.id}`}
                    value={detailCorrectReply}
                    readOnly
                    className="work-order-detail-richtext work-order-detail-reply-readonly work-order-detail-reply-segments"
                    style={{ minHeight: 60 }}
                  />
                ) : (
                  <div className="work-order-detail-reply-empty">暂无回复</div>
                )}
              </div>
              {detailRecord.status === 'closed' && (
                <div className="work-order-detail-edit-actions">
                  <Button type="primary" onClick={handleReopen}>
                    重新打开
                  </Button>
                </div>
              )}
            </div>
            </div>
            {detailRecord.status !== 'closed' && (
              <div className="work-order-detail-comment-bar">
                <CommentRichEditor
                  key={`append-${detailRecord?.id}`}
                  value={detailCorrectReplyAppend}
                  onChange={setDetailCorrectReplyAppend}
                  attachments={detailReplyAttachments}
                  onAttachmentsChange={setDetailReplyAttachments}
                  placeholder="输入回复内容，支持粘贴/上传图片、上传附件"
                  className="work-order-detail-comment-bar-input"
                  style={{ minHeight: 100 }}
                  renderActions={
                    <div className="work-order-detail-comment-bar-actions">
                      <Button type="default" onClick={replyAndClose}>
                        关闭工单
                      </Button>
                      <Button
                        type="primary"
                        onClick={appendToCorrectReply}
                        disabled={isRichContentEmpty(detailCorrectReplyAppend) && !(detailReplyAttachments?.length > 0)}
                      >
                        评论
                      </Button>
                    </div>
                  }
                />
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="page-container work-order-handled">
      <div className="page-header">
            <h2 className="page-title">我处理的</h2>
          </div>
          <Card>
            <div className="work-order-toolbar">
              <div className="work-order-toolbar-row work-order-toolbar-row-1">
                <Input
                  className="work-order-search-input"
                  placeholder="工单编号"
                  allowClear
                  value={searchValues.id}
                  onChange={(e) => updateSearch('id', e.target.value)}
                />
                <Select
                  className="work-order-filter-select"
                  placeholder="提交人"
                  mode="multiple"
                  allowClear
                  value={filterSubmitter}
                  onChange={setFilterSubmitter}
                  options={submitterOptions}
                  maxTagCount="responsive"
                  getPopupContainer={(n) => n?.parentElement || document.body}
                />
                <Select
                  className="work-order-filter-select"
                  placeholder="处理人"
                  mode="multiple"
                  allowClear
                  value={filterHandler}
                  onChange={setFilterHandler}
                  options={handlerOptions}
                  maxTagCount="responsive"
                  getPopupContainer={(n) => n?.parentElement || document.body}
                />
                <Input
                  className="work-order-search-input"
                  placeholder="问题"
                  allowClear
                  value={searchValues.question}
                  onChange={(e) => updateSearch('question', e.target.value)}
                />
                <Input
                  className="work-order-search-input"
                  placeholder="数据用途"
                  allowClear
                  value={searchValues.dataUsage}
                  onChange={(e) => updateSearch('dataUsage', e.target.value)}
                />
                <Input
                  className="work-order-search-input"
                  placeholder="数据提供对象"
                  allowClear
                  value={searchValues.dataRecipient}
                  onChange={(e) => updateSearch('dataRecipient', e.target.value)}
                />
              </div>
              <div className="work-order-toolbar-row work-order-toolbar-row-2">
                <Select
                  className="work-order-filter-select work-order-datasource-select"
                  placeholder="筛选数据来源"
                  mode="multiple"
                  allowClear
                  maxTagCount="responsive"
                  value={filterDataSource}
                  onChange={setFilterDataSource}
                  options={DATA_SOURCE_FILTER_OPTIONS}
                  optionFilterProp="label"
                  getPopupContainer={(n) => n?.parentElement || document.body}
                  dropdownStyle={{ minWidth: 380 }}
                  dropdownClassName="work-order-datasource-dropdown"
                />
                <Select
                  className="work-order-filter-select"
                  placeholder="筛选状态"
                  mode="multiple"
                  allowClear
                  value={filterStatus}
                  onChange={setFilterStatus}
                  options={STATUS_FILTER_OPTIONS}
                  getPopupContainer={(n) => n?.parentElement || document.body}
                />
                <RangePicker
                  className="work-order-range-picker"
                  value={filterCreatedRange}
                  onChange={setFilterCreatedRange}
                  allowClear
                  format="YYYY-MM-DD"
                  placeholder={['提交开始时间', '提交结束时间']}
                />
                <RangePicker
                  className="work-order-range-picker"
                  value={filterUpdatedRange}
                  onChange={setFilterUpdatedRange}
                  allowClear
                  format="YYYY-MM-DD"
                  placeholder={['更新开始时间', '更新结束时间']}
                />
                <Button type="default" icon={<ReloadOutlined />} onClick={handleResetFilters} className="work-order-reset-btn">
                  重置
                </Button>
              </div>
            </div>
            <div className="work-order-batch-bar">
              {selectedRowKeys.length > 0 && (
                <span className="work-order-batch-info">已选 {selectedRowKeys.length} 条</span>
              )}
              <Button
                type="primary"
                size="small"
                disabled={selectedRowKeys.length === 0}
                onClick={handleBatchClose}
                className="work-order-batch-close-btn"
              >
                批量关闭
              </Button>
            </div>
            <div className="work-order-table-wrap">
              <Table
                rowKey="id"
                rowSelection={{
                  selectedRowKeys,
                  onChange: (keys) => setSelectedRowKeys(keys),
                  getCheckboxProps: (record) => ({ disabled: record.status === 'closed' }),
                }}
                columns={columns}
                dataSource={filteredList}
                pagination={{
                  pageSize: 10,
                  showSizeChanger: true,
                  pageSizeOptions: ['10', '20', '50'],
                  showTotal: (total) => `共 ${total} 条`,
                  size: 'default',
                  showQuickJumper: { goButton: true },
                }}
                scroll={{ x: 1600 }}
              />
            </div>
          </Card>

      <Drawer
        title="工单详情"
        placement="right"
        width="90%"
        open={detailVisible}
        onClose={handleCloseDetail}
        className="work-order-detail-drawer"
        footer={null}
      >
        {detailVisible && renderDetailContent()}
      </Drawer>
    </div>
  );
};

export default WorkOrderMyHandled;
