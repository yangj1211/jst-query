import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Button, Checkbox, Tag, Input, List, Tooltip, Pagination, Drawer, Table, Select, message } from 'antd';
import {
  SyncOutlined,
  RightOutlined,
  PlusOutlined,
  EyeOutlined,
  InfoCircleOutlined,
  DownloadOutlined,
  HistoryOutlined,
  UpOutlined,
  DownOutlined,
  LoadingOutlined,
  CheckCircleOutlined,
  LikeOutlined,
  DislikeOutlined,
  FilePdfOutlined,
  FileWordOutlined,
  FileImageOutlined,
  FileOutlined,
  DoubleLeftOutlined,
  DoubleRightOutlined,
  TableOutlined,
  BarChartOutlined,
  DatabaseOutlined,
} from '@ant-design/icons';
import { useDocumentConversation } from '../contexts/DocumentConversationContext';
import CombinedThinking from '../components/CombinedThinking';
import OrderRelationsPanel from '../components/OrderRelationsPanel';
import orderTable from '../data/orderTable';
import documentTable from '../data/documentTable';
import { parseQuery } from '../utils/queryParser';
import { executeSearch } from '../utils/searchService';
import './QuestionAssistant.css';
import './SalesDocumentSearch.css';
import '../components/QueryResult.css';

const { TextArea } = Input;
const { Option, OptGroup } = Select;

// 有权限的文件类型列表
const authorizedDocumentTypes = ['合同', '发票', '通电验收单'];

// 初始结果集：全量订单（含关联文件）
const initialResults = executeSearch(
  { conditions: [], queryType: 'list', aggregation: null, description: '' },
  orderTable,
  documentTable
);

const SalesDocumentSearch = () => {
  const {
    conversations: docConversations,
    activeConversationId: docActiveConversationId,
    updateConversation: docUpdateConversation,
    createNewConversation: docCreateNewConversation,
    formatDateTime: formatDocDateTime,
  } = useDocumentConversation();

  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const messagesEndRef = useRef(null);

  const activeConv = useMemo(
    () => docConversations.find((c) => c.id === docActiveConversationId),
    [docConversations, docActiveConversationId]
  );

  // 首次进入单据检索页时，如果没有任何对话，则自动创建一个新对话并设为当前对话
  useEffect(() => {
    if (!docActiveConversationId && (!docConversations || docConversations.length === 0)) {
      docCreateNewConversation();
    }
  }, [docActiveConversationId, docConversations, docCreateNewConversation]);

  useEffect(() => {
    if (isGenerating) return;
    if (activeConv && Array.isArray(activeConv.messages)) {
      setMessages(activeConv.messages);
    } else {
      setMessages([]);
    }
  }, [docActiveConversationId, activeConv?.id, activeConv?.messages, isGenerating]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const [expandedItems, setExpandedItems] = useState([]);
  const [detailVisible, setDetailVisible] = useState(false);
  const [detailItem, setDetailItem] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedItems, setSelectedItems] = useState([]);
  const [selectedDocumentTypes, setSelectedDocumentTypes] = useState(['__ALL__']);
  const [isResultsCollapsed, setIsResultsCollapsed] = useState(false);
  const [searchResults, setSearchResults] = useState(initialResults);
  const [activeViewMessageId, setActiveViewMessageId] = useState(null);
  
  // 提取所有唯一的文件类型，分为有权限和无权限
  const { allDocumentTypes, authorizedTypes, unauthorizedTypes } = useMemo(() => {
    const typesSet = new Set();
    searchResults.orders.forEach(item => {
      if (item.documents && item.documents.length > 0) {
        item.documents.forEach(doc => {
          typesSet.add(doc.tag);
        });
      }
    });
    const all = Array.from(typesSet).sort();
    const authorized = all.filter(t => authorizedDocumentTypes.includes(t));
    const unauthorized = all.filter(t => !authorizedDocumentTypes.includes(t));
    return { allDocumentTypes: all, authorizedTypes: authorized, unauthorizedTypes: unauthorized };
  }, [searchResults.orders]);
  
  // 计算分页后的数据
  const paginatedResults = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    const end = start + pageSize;
    return searchResults.orders.slice(start, end);
  }, [currentPage, pageSize, searchResults.orders]);
  
  // 当前页是否全选
  const isAllSelected = useMemo(() => {
    if (paginatedResults.length === 0) return false;
    return paginatedResults.every(item => selectedItems.includes(item.orderNo));
  }, [paginatedResults, selectedItems]);
  
  // 部分选中（用于全选checkbox的indeterminate状态）
  const isIndeterminate = useMemo(() => {
    const selectedInPage = paginatedResults.filter(item => selectedItems.includes(item.orderNo)).length;
    return selectedInPage > 0 && selectedInPage < paginatedResults.length;
  }, [paginatedResults, selectedItems]);
  
  // 处理单个项目的选中/取消选中
  const handleItemSelect = (orderNo, checked) => {
    if (checked) {
      setSelectedItems(prev => [...prev, orderNo]);
    } else {
      setSelectedItems(prev => prev.filter(no => no !== orderNo));
    }
  };
  
  // 处理全选/取消全选
  const handleSelectAll = (checked) => {
    if (checked) {
      const currentPageNos = paginatedResults.map(item => item.orderNo);
      setSelectedItems(prev => {
        const newSelected = [...prev];
        currentPageNos.forEach(no => {
          if (!newSelected.includes(no)) {
            newSelected.push(no);
          }
        });
        return newSelected;
      });
    } else {
      const currentPageNos = paginatedResults.map(item => item.orderNo);
      setSelectedItems(prev => prev.filter(no => !currentPageNos.includes(no)));
    }
  };
  
  // 处理批量下载
  const handleBatchDownload = () => {
    if (selectedItems.length === 0) {
      message.warning('请先选择要下载的订单');
      return;
    }
    const selectedProjects = searchResults.orders.filter(item => selectedItems.includes(item.orderNo));
    message.success(`开始下载 ${selectedItems.length} 个订单的文件`);
    console.log('批量下载选中的订单:', selectedProjects);
    // 这里可以调用实际的下载API
  };

  const toggleExpand = (id) => {
    setExpandedItems(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  // 处理文件类型选择变化
  const handleDocumentTypeChange = (values) => {
    const ALL_VALUE = '__ALL__';
    
    // 如果用户点击了"全部"
    if (values.includes(ALL_VALUE)) {
      // 如果之前没有选择"全部"，说明用户刚刚点击了"全部"，清空所有筛选
      if (!selectedDocumentTypes.includes(ALL_VALUE)) {
        setSelectedDocumentTypes([ALL_VALUE]);
      } else if (values.length > 1) {
        // 如果之前已经选择了"全部"，现在又选择了其他类型，移除"全部"，只保留具体类型
        const filteredValues = values.filter(val => val !== ALL_VALUE);
        setSelectedDocumentTypes(filteredValues);
      } else {
        // 只选择了"全部"
        setSelectedDocumentTypes([ALL_VALUE]);
      }
    } else if (values.length === 0) {
      // 如果清空所有选择，默认回到"全部"
      setSelectedDocumentTypes([ALL_VALUE]);
    } else {
      // 只选择了具体类型（没有"全部"）
      setSelectedDocumentTypes(values);
    }
  };

  // 根据选中的文件类型过滤文档
  const getFilteredDocuments = (documents) => {
    if (!documents || documents.length === 0) return [];
    const ALL_VALUE = '__ALL__';
    // 如果选择了"全部"或未选择任何类型，显示全部
    if (selectedDocumentTypes.length === 0 || selectedDocumentTypes.includes(ALL_VALUE)) {
      return documents;
    }
    return documents.filter(doc => selectedDocumentTypes.includes(doc.tag));
  };

  /**
   * 切换右侧订单列表区域的展开/收起状态
   * @returns {void}
   */
  const toggleResultsPanel = () => {
    setIsResultsCollapsed((prev) => !prev);
  };

  /**
   * 单据检索发送消息：解析问题 → 思考过程 → 执行查询 → 展示结果 → 更新右侧面板
   */
  const handleDocSendMessage = () => {
    if (!inputValue.trim() || !docActiveConversationId) return;
    const question = inputValue.trim();
    setInputValue('');
    setIsGenerating(true);

    const userMessage = {
      id: `user_${Date.now()}`,
      sender: 'user',
      text: question,
      time: formatDocDateTime(new Date()),
    };
    const base = [...messages, userMessage];
    setMessages(base);
    docUpdateConversation(docActiveConversationId, { title: question.substring(0, 20), messages: base });

    // 解析查询条件
    const parsed = parseQuery(question);

    const combinedId = `combined_${Date.now()}`;
    const intentDesc = parsed.queryType === 'aggregation'
      ? `用户希望进行统计分析：${parsed.description}`
      : parsed.conditions.length > 0
        ? `用户希望检索订单：${parsed.description}`
        : '用户希望进行销售单据检索';
    const intentData = { description: intentDesc, status: 'loading' };
    const steps = [
      { title: '理解问题', description: `识别查询意图：${parsed.description || '全量检索'}`, status: 'loading' },
      { title: '检索文档', description: '在销售单据中执行检索', status: 'loading' },
    ];
    const combinedMessage = {
      id: combinedId,
      sender: 'ai',
      type: 'combined',
      intentData: { ...intentData, status: 'loading' },
      config: { source: '销售单据', scope: '全部', caliber: '管口数据', filter: '全部数据' },
      dataInfo: { time: '', metrics: [], dimensions: [] },
      steps: steps.map((s) => ({ ...s, status: 'loading' })),
      isComplete: false,
      isStopped: false,
      time: formatDocDateTime(new Date()),
    };
    const withCombined = [...base, combinedMessage];
    setMessages(withCombined);

    setTimeout(() => {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === combinedId ? { ...m, intentData: { ...m.intentData, status: 'done' } } : m
        )
      );
    }, 600);
    setTimeout(() => {
      setMessages((prev) =>
        prev.map((m) => {
          if (m.id !== combinedId) return m;
          const newSteps = [...m.steps];
          newSteps[0] = { ...newSteps[0], status: 'done' };
          return { ...m, steps: newSteps };
        })
      );
    }, 1000);
    setTimeout(() => {
      setMessages((prev) =>
        prev.map((m) => {
          if (m.id !== combinedId) return m;
          const newSteps = [...m.steps];
          newSteps[1] = { ...newSteps[1], status: 'done' };
          return { ...m, steps: newSteps, isComplete: true };
        })
      );

      const resultId = `result_${Date.now()}`;
      const resultMessage = {
        id: resultId,
        sender: 'ai',
        type: 'result',
        resultStatus: 'generating',
        originalQuestion: question,
        data: {},
        time: formatDocDateTime(new Date()),
        liked: false,
        disliked: false,
      };
      setMessages((prev) => [...prev, resultMessage]);
    }, 1600);
    setTimeout(() => {
      // 执行真实查询
      const result = executeSearch(parsed, orderTable, documentTable);

      setMessages((prev) => {
        const next = prev.map((m) => {
          if (m.type !== 'result' || m.resultStatus !== 'generating') return m;
          return {
            ...m,
            resultStatus: 'completed',
            data: {
              summary: result.summary,
              orders: result.orders,
              totalCount: result.total,
              aggregation: result.aggregation || null,
              orderColumns: result.orderColumns || [],
              queryFocus: result.queryFocus || null,
            },
          };
        });
        docUpdateConversation(docActiveConversationId, { messages: next });
        return next;
      });

      // 更新右侧面板（任务 5.3）
      setSearchResults(result);
      setCurrentPage(1);
      setSelectedItems([]);
      setSelectedDocumentTypes(['__ALL__']);
      setExpandedItems([]);

      setIsGenerating(false);
    }, 2400);
  };

  const handleDocKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleDocSendMessage();
    }
  };

  /** 根据文件类型或扩展名返回格式图标 */
  const getFileFormatIcon = (doc) => {
    const lower = (doc.name || '').toLowerCase();
    if (doc.type === 'pdf' || lower.endsWith('.pdf')) return <FilePdfOutlined className="doc-format-icon doc-format-pdf" />;
    if (/\.(docx|doc)$/.test(lower)) return <FileWordOutlined className="doc-format-icon doc-format-word" />;
    if (doc.type === 'image' || /\.(jpg|jpeg|png|gif|bmp|webp|svg)$/.test(lower)) return <FileImageOutlined className="doc-format-icon doc-format-image" />;
    return <FileOutlined className="doc-format-icon" />;
  };

  const renderDocumentItem = (doc) => (
    <div key={doc.id} className="document-item">
      <div className="document-info">
        {getFileFormatIcon(doc)}
        <span className="doc-name">{doc.name}</span>
      </div>
      <div className="document-actions">
        <Tag color={doc.tagColor} className={doc.tag ? `doc-tag doc-tag-${doc.tag}` : 'doc-tag'}>{doc.tag}</Tag>
        <Tooltip title="预览">
          <Button type="text" icon={<EyeOutlined />} />
        </Tooltip>
        <Tooltip title={doc.path}>
          <Button type="text" icon={<InfoCircleOutlined />} />
        </Tooltip>
        <Tooltip title="下载">
          <Button type="text" icon={<DownloadOutlined />} />
        </Tooltip>
      </div>
    </div>
  );

  /**
   * 详情数据：按图2的5组字段结构
   * 一.订单基础信息 | 二.发票相关信息 | 三.发货相关信息 | 四.付款相关信息 | 五.物料清单
   */
  const getDetailData = (item) => {
    return {
      groups: [
        {
          title: '订单基础信息',
          fields: [
            { label: '销售凭证', value: item.orderNo },
            { label: '凭证日期', value: item.poDate },
            { label: '售达方', value: item.soldTo },
            { label: '客户名称', value: item.customer },
            { label: '客户合同编号', value: item.customerContractNo },
            { label: '销售代表处描述', value: item.salesOfficeDesc },
            { label: '销售代表描述', value: item.salesRepDesc },
            { label: '销售地区描述', value: item.salesRegionDesc },
            { label: '订单不含税金额合计', value: item.amountExclTax },
            { label: '合同总金额(CNY)', value: item.totalAmountCNY },
            { label: '合同总金额(订单货币)', value: item.totalAmountOrder },
            { label: '货币', value: item.currency },
            { label: '分销渠道描述', value: item.channelDesc },
            { label: '控股方', value: item.holdingCompany },
            { label: '用户行业(披露口径)', value: item.industryCode },
            { label: '用户行业(披露口径)描述', value: item.industryDesc },
            { label: '税率', value: item.taxRate },
            { label: '报价单编号', value: item.quotationNo },
          ],
        },
        {
          title: '发票相关信息',
          fields: [
            { label: 'VAT发票号', value: item.vatInvoiceNo },
            { label: 'VAT发票时间', value: item.vatInvoiceDate },
            { label: 'VAT发票税率', value: item.vatInvoiceRate },
            { label: 'VAT发票金额', value: item.vatInvoiceAmount },
          ],
        },
        {
          title: '付款相关信息',
          fields: [
            { label: '回款时间', value: item.paymentDate },
            { label: '回款金额', value: item.paymentAmount },
            { label: '交易货币', value: item.paymentCurrency },
            { label: '欠款金额', value: item.outstandingAmount },
            { label: '合同欠款金额', value: item.contractDebt },
            { label: '付款条件备注', value: item.paymentTerms },
          ],
        },
      ],
      materialList: [
        { key: '1', productGroup: 'T01', productGroupDesc: '变压器', model: 'SCBH15-1250/10.5', spec: '1250.00', desc: '干变 SCBH15-1250/10.5 ZB.011786.5001', goodsIssueDate: '2020-12-28', profitCenter: '1617', profitCenterDesc: '干变事业部' },
        { key: '2', productGroup: 'T01', productGroupDesc: '变压器', model: 'SCBH15-1250/10.5', spec: '1250.00', desc: '干变 SCBH15-1250/10.5 ZB.011786.5002', goodsIssueDate: '2021-04-10', profitCenter: '1618', profitCenterDesc: '成套事业部' },
      ],
    };
  };

  const materialColumns = [
    { title: '产品组', dataIndex: 'productGroup', key: 'productGroup', width: 80 },
    { title: '产品组描述', dataIndex: 'productGroupDesc', key: 'productGroupDesc', width: 120 },
    { title: '型号', dataIndex: 'model', key: 'model', width: 160 },
    { title: '规格', dataIndex: 'spec', key: 'spec', width: 100 },
    { title: '物料描述', dataIndex: 'desc', key: 'desc' },
    { title: '发货过账日期', dataIndex: 'goodsIssueDate', key: 'goodsIssueDate', width: 120 },
    { title: '利润中心', dataIndex: 'profitCenter', key: 'profitCenter', width: 100 },
    { title: '利润中心描述', dataIndex: 'profitCenterDesc', key: 'profitCenterDesc', width: 120 },
  ];

  return (
    <div className="sales-search-page">
      {/* Left Panel：与智能问数一致的对话区（提问、思考过程、结果展示），无问数配置 */}
      <div className="search-chat-panel doc-chat-panel">
        <div className="chat-container" style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
          <div className="chat-area">
            {docActiveConversationId ? (
              <>
                <div className="messages-container">
                  {messages.length === 0 ? (
                    <div className="welcome-message">
                      <div className="welcome-text">向 AI 提问关于单据检索的任何问题</div>
                    </div>
                  ) : (
                    messages.map((message) => (
                      <div
                        key={message.id}
                        className={`message ${message.sender === 'user' ? 'user-message' : 'ai-message'}`}
                      >
                        <div className="message-content">
                          {message.type === 'combined' ? (
                            <CombinedThinking
                              intentData={message.intentData || {}}
                              config={message.config || {}}
                              dataInfo={message.dataInfo || {}}
                              steps={message.steps || []}
                              isComplete={message.isComplete}
                              isStopped={message.isStopped || false}
                            />
                          ) : message.type === 'result' ? (
                            <>
                              {message.resultStatus && (
                                <div className="result-status-header">
                                  <div className="result-status-content">
                                    {message.resultStatus === 'generating' ? (
                                      <>
                                        <LoadingOutlined style={{ fontSize: 16, color: '#f59e0b', marginRight: 8 }} spin />
                                        <span className="result-status-text">结果输出中</span>
                                      </>
                                    ) : message.resultStatus === 'completed' ? (
                                      <>
                                        <CheckCircleOutlined style={{ color: '#52c41a', fontSize: 16, marginRight: 8 }} />
                                        <span className="result-status-text">输出完成</span>
                                      </>
                                    ) : null}
                                  </div>
                                </div>
                              )}
                              {(() => {
                                const data = message.data || {};
                                const hasSummary = typeof data.summary === 'string' && data.summary.trim().length > 0;
                                const hasOrders = Array.isArray(data.orders) && data.orders.length > 0;
                                const hasAggregation = data.aggregation && Array.isArray(data.aggregation.dataSource);
                                const hasContent = hasSummary || hasOrders || hasAggregation;

                                // 跳转右侧订单列表的通用处理函数
                                const handleViewOrderList = () => {
                                  const msgData = message.data || {};
                                  if (msgData.orders && msgData.orders.length > 0) {
                                    setActiveViewMessageId(message.id);
                                    setSearchResults({
                                      orders: msgData.orders,
                                      total: msgData.totalCount || msgData.orders.length,
                                      summary: msgData.summary || '',
                                      usedFields: [],
                                      conditionDesc: '',
                                      aggregation: null,
                                      orderColumns: msgData.orderColumns || [],
                                    });
                                    setCurrentPage(1);
                                    setSelectedItems([]);
                                    setSelectedDocumentTypes(['__ALL__']);
                                    setExpandedItems([]);
                                    if (isResultsCollapsed) {
                                      setIsResultsCollapsed(false);
                                    }
                                  }
                                };

                                if (hasContent) {
                                  return (
                                    <div className="doc-search-result">
                                      {/* 自然语言回答：根据问题本身回答 */}
                                      {hasSummary && (
                                        <div className="doc-result-summary">{data.summary}</div>
                                      )}

                                      {/* 聚合统计表格：仅在聚合查询时展示 */}
                                      {hasAggregation && (
                                        <div className="result-block">
                                          <div className="block-header">
                                            <h4 className="block-title">统计结果</h4>
                                            <button className={`doc-view-orders-btn ${activeViewMessageId === message.id ? 'active' : ''}`} onClick={handleViewOrderList}>
                                              <EyeOutlined style={{ marginRight: 4 }} />
                                              查看订单列表
                                            </button>
                                          </div>
                                          <div className="table-wrapper">
                                            <Table
                                              rowKey="key"
                                              columns={data.aggregation.columns}
                                              dataSource={data.aggregation.dataSource}
                                              pagination={data.aggregation.dataSource.length > 10 ? {
                                                pageSize: 10,
                                                showTotal: (total) => `共 ${total} 条`,
                                                showSizeChanger: false,
                                                size: 'small',
                                              } : false}
                                              size="middle"
                                              bordered
                                              className="custom-result-table"
                                            />
                                          </div>
                                          <div className="data-sources">
                                            <div className="sources-label">数据来源:</div>
                                            <div className="sources-list">
                                              <Tooltip title="销售单据管理系统">
                                                <Button type="link" icon={<DatabaseOutlined />} size="small" className="source-link">
                                                  销售单据管理系统
                                                  <Tag size="small" color="blue">表</Tag>
                                                </Button>
                                              </Tooltip>
                                            </div>
                                          </div>
                                        </div>
                                      )}

                                      {/* 订单明细表格：根据查询焦点展示不同内容 */}
                                      {hasOrders && !hasAggregation && (() => {
                                        const focus = data.queryFocus;
                                        const hasFocus = Array.isArray(focus) && focus.length > 0;

                                        // 当查询焦点是文件类型时，展示文件列表表格
                                        if (hasFocus) {
                                          const focusLabel = focus.join('、');
                                          // 构建文件明细数据
                                          const docRows = [];
                                          (data.orders || []).forEach(order => {
                                            if (order.documents) {
                                              order.documents
                                                .filter(doc => focus.includes(doc.tag))
                                                .forEach(doc => {
                                                  docRows.push({
                                                    key: doc.id,
                                                    orderNo: order.orderNo,
                                                    title: order.title,
                                                    customer: order.customer,
                                                    docName: doc.name,
                                                    docTag: doc.tag,
                                                    docTagColor: doc.tagColor,
                                                  });
                                                });
                                            }
                                          });

                                          return (
                                            <div className="result-block">
                                              <div className="block-header">
                                                <h4 className="block-title">{focusLabel}明细（共 {docRows.length} 份）</h4>
                                                <button className={`doc-view-orders-btn ${activeViewMessageId === message.id ? 'active' : ''}`} onClick={handleViewOrderList}>
                                                  <EyeOutlined style={{ marginRight: 4 }} />
                                                  查看订单列表
                                                </button>
                                              </div>
                                              <div className="table-wrapper">
                                                <Table
                                                  rowKey="key"
                                                  columns={[
                                                    { title: '所属订单', dataIndex: 'orderNo', key: 'orderNo', width: 130 },
                                                    { title: '客户名称', dataIndex: 'customer', key: 'customer', ellipsis: true },
                                                    { title: '文件名称', dataIndex: 'docName', key: 'docName', ellipsis: true },
                                                    { title: '文件类型', dataIndex: 'docTag', key: 'docTag', width: 100 },
                                                  ]}
                                                  dataSource={docRows}
                                                  size="middle"
                                                  bordered
                                                  className="custom-result-table"
                                                  pagination={docRows.length > 10 ? {
                                                    pageSize: 10,
                                                    showTotal: (total) => `共 ${total} 条`,
                                                    showSizeChanger: false,
                                                    size: 'small',
                                                  } : false}
                                                />
                                              </div>
                                              <div className="data-sources">
                                                <div className="sources-label">数据来源:</div>
                                                <div className="sources-list">
                                                  <Tooltip title="销售单据管理系统">
                                                    <Button type="link" icon={<DatabaseOutlined />} size="small" className="source-link">
                                                      销售单据管理系统
                                                      <Tag size="small" color="blue">表</Tag>
                                                    </Button>
                                                  </Tooltip>
                                                </div>
                                              </div>
                                            </div>
                                          );
                                        }

                                        // 通用订单明细表格
                                        return (
                                          <div className="result-block">
                                            <div className="block-header">
                                              <h4 className="block-title">订单明细（共 {data.totalCount} 条）</h4>
                                              <button className={`doc-view-orders-btn ${activeViewMessageId === message.id ? 'active' : ''}`} onClick={handleViewOrderList}>
                                                <EyeOutlined style={{ marginRight: 4 }} />
                                                查看订单列表
                                              </button>
                                            </div>
                                            <div className="table-wrapper">
                                              <Table
                                                rowKey="orderNo"
                                                columns={[
                                                  { title: '销售凭证', dataIndex: 'orderNo', key: 'orderNo', width: 140 },
                                                  { title: '项目名称', dataIndex: 'title', key: 'title', ellipsis: true },
                                                  { title: '客户名称', dataIndex: 'customer', key: 'customer', ellipsis: true },
                                                ]}
                                                dataSource={data.orders}
                                                size="middle"
                                                bordered
                                                className="custom-result-table"
                                                pagination={{
                                                  pageSize: 10,
                                                  showTotal: (total) => `共 ${total} 条`,
                                                  showSizeChanger: false,
                                                  size: 'small',
                                                }}
                                              />
                                            </div>
                                            <div className="data-sources">
                                              <div className="sources-label">数据来源:</div>
                                              <div className="sources-list">
                                                <Tooltip title="销售单据管理系统">
                                                  <Button type="link" icon={<DatabaseOutlined />} size="small" className="source-link">
                                                    销售单据管理系统
                                                    <Tag size="small" color="blue">表</Tag>
                                                  </Button>
                                                </Tooltip>
                                              </div>
                                            </div>
                                          </div>
                                        );
                                      })()}

                                      {/* 无结果 */}
                                      {!hasOrders && !hasAggregation && (
                                        <div className="doc-result-empty">暂无匹配的订单</div>
                                      )}
                                    </div>
                                  );
                                }

                                if (message.resultStatus === 'stopped') {
                                  return (
                                    <div className="result-loading-placeholder">
                                      <span className="result-loading-text" style={{ color: '#999' }}>输出已停止</span>
                                    </div>
                                  );
                                }
                                return (
                                  <div className="result-loading-placeholder">
                                    <div className="result-loading-spinner" />
                                    <span className="result-loading-text">正在生成结果...</span>
                                  </div>
                                );
                              })()}
                              {message.resultStatus === 'completed' && (
                                <div className="message-footer">
                                  <div className="footer-actions">
                                    <div className="footer-rating-btns">
                                      <button
                                        className={`footer-icon-btn rating-btn ${message.liked ? 'active' : ''}`}
                                        onClick={() =>
                                          setMessages((prev) =>
                                            prev.map((m) =>
                                              m.id === message.id ? { ...m, liked: !m.liked, disliked: false } : m
                                            )
                                          )
                                        }
                                        title="点赞"
                                      >
                                        <LikeOutlined style={{ fontSize: 16, color: message.liked ? '#1890ff' : undefined }} />
                                      </button>
                                      <button
                                        className={`footer-icon-btn rating-btn ${message.disliked ? 'active' : ''}`}
                                        onClick={() =>
                                          setMessages((prev) =>
                                            prev.map((m) =>
                                              m.id === message.id ? { ...m, disliked: !m.disliked, liked: false } : m
                                            )
                                          )
                                        }
                                        title="点踩"
                                      >
                                        <DislikeOutlined style={{ fontSize: 16, color: message.disliked ? '#ff4d4f' : undefined }} />
                                      </button>
                                    </div>
                                  </div>
                                  <div className="footer-time">{message.time}</div>
                                </div>
                              )}
                            </>
                          ) : (
                            <p>{message.text}</p>
                          )}
                        </div>
                        {message.sender === 'user' && message.text && message.type !== 'result' && message.type !== 'combined' && (
                          <div className="message-time">{message.time}</div>
                        )}
                      </div>
                    ))
                  )}
                <div ref={messagesEndRef} />
                </div>

                <div className="input-area">
                  <div className="input-wrapper">
                    <textarea
                      className="message-input"
                      placeholder="向 AI 提问关于单据检索的任何问题"
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyPress={handleDocKeyPress}
                      rows={3}
                    />
                    <div className="input-actions">
                      {isGenerating ? (
                        <button className="send-button-round stop-button" type="button">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                            <rect x="6" y="6" width="12" height="12" rx="1" />
                          </svg>
                        </button>
                      ) : (
                        <button
                          className="send-button-round"
                          onClick={handleDocSendMessage}
                          disabled={!inputValue.trim()}
                          type="button"
                        >
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <path
                              d="M12 19V5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                            <path
                              d="M5 12l7-7 7 7"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="chat-placeholder">
                <div className="placeholder-icon">💬</div>
                <div className="placeholder-text">请选择或创建对话开始单据检索</div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 折叠/展开浮动按钮：位于左右面板交界处 */}
      <div
        className={`results-toggle-fab ${isResultsCollapsed ? 'collapsed' : ''}`}
        onClick={toggleResultsPanel}
      >
        {isResultsCollapsed ? <DoubleLeftOutlined /> : <DoubleRightOutlined />}
      </div>

      {/* Right Panel */}
      {!isResultsCollapsed && (
      <div className="search-results-panel">
        <div className="results-header">
          <div className="results-header-left">
            <Checkbox
              checked={isAllSelected}
              indeterminate={isIndeterminate}
              onChange={(e) => handleSelectAll(e.target.checked)}
            >
              全选当前页
            </Checkbox>
            {selectedItems.length > 0 && (
              <span className="selected-count">已选 {selectedItems.length} 个订单</span>
            )}
          </div>
          <div className="results-header-right">
            <Select
              mode="multiple"
              placeholder="文件类型"
              value={selectedDocumentTypes}
              onChange={handleDocumentTypeChange}
              style={{ width: 200, marginRight: 12 }}
              allowClear
              maxTagCount="responsive"
              dropdownClassName="document-type-select-dropdown"
              tagRender={(props) => {
                const { label, value, closable, onClose } = props;
                const isAuthorized = authorizedDocumentTypes.includes(value);
                return (
                  <span className={`ant-select-selection-item ${isAuthorized ? 'authorized-tag' : ''}`}>
                    <span className="ant-select-selection-item-content">
                      {label}
                      {isAuthorized && (
                        <Tag color="success" style={{ marginLeft: 4, fontSize: '10px', lineHeight: '14px', padding: '0 4px' }}>
                          有权限
                        </Tag>
                      )}
                    </span>
                    {closable && (
                      <span className="ant-select-selection-item-remove" onClick={onClose}>
                        ×
                      </span>
                    )}
                  </span>
                );
              }}
            >
              <Option key="__ALL__" value="__ALL__">全部</Option>
              {authorizedTypes.length > 0 && (
                <OptGroup label="有权限" key="authorized" className="doc-type-authorized">
                  {authorizedTypes.map(type => (
                    <Option key={type} value={type}>{type}</Option>
                  ))}
                </OptGroup>
              )}
              {unauthorizedTypes.length > 0 && (
                <OptGroup label="无权限" key="unauthorized" className="doc-type-unauthorized">
                  {unauthorizedTypes.map(type => (
                    <Option key={type} value={type}>{type}</Option>
                  ))}
                </OptGroup>
              )}
            </Select>
            <Button 
              type="primary" 
              icon={<DownloadOutlined />}
              onClick={handleBatchDownload}
              disabled={selectedItems.length === 0}
            >
              下载文件
            </Button>
            <Button 
              icon={<SyncOutlined />} 
              onClick={() => {
                setSelectedDocumentTypes(['__ALL__']);
                setSelectedItems([]);
                setCurrentPage(1);
              }}
            >
              重置
            </Button>
          </div>
        </div>
        <div className="results-list">
          <List
            dataSource={paginatedResults}
            renderItem={item => (
              <div className="result-item-card">
                <div className="result-item-header">
                  <div className="result-item-title-group">
                    <Checkbox
                      checked={selectedItems.includes(item.orderNo)}
                      onChange={(e) => handleItemSelect(item.orderNo, e.target.checked)}
                    />
                    {item.orderNo && (
                      <span className="result-order-no">{item.orderNo}</span>
                    )}
                    <span className="result-item-title">{item.title}</span>
                  </div>
                  <div className="result-item-actions">
                    <Tooltip title="查看详情">
                      <Button
                        type="text"
                        icon={<EyeOutlined />}
                        onClick={() => { setDetailItem(item); setDetailVisible(true); }}
                      />
                    </Tooltip>
                    <Tooltip title="相关文件">
                      <Button type="text" icon={expandedItems.includes(item.orderNo) ? <UpOutlined /> : <DownOutlined />} onClick={() => toggleExpand(item.orderNo)} />
                    </Tooltip>
                  </div>
                </div>
                <div className="result-item-meta result-item-meta-tags">
                  <Tooltip title="客户名称">
                    <Tag className="meta-tag">{item.customer}</Tag>
                  </Tooltip>
                  <Tooltip title="采购订单日期">
                    <Tag className="meta-tag">{item.poDate}</Tag>
                  </Tooltip>
                  <Tooltip title="合同总金额(订单货币) / 货币单位">
                    <Tag className="meta-tag">{item.amount} {item.currency}</Tag>
                  </Tooltip>
                </div>
                {expandedItems.includes(item.orderNo) && (
                  <div className="result-item-details">
                    {getFilteredDocuments(item.documents).map(doc => renderDocumentItem(doc))}
                    {getFilteredDocuments(item.documents).length === 0 && item.documents && item.documents.length > 0 && (
                      <div style={{ padding: '16px', textAlign: 'center', color: '#999' }}>
                        当前筛选条件下暂无文档
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          />
        </div>
        <div className="results-pagination">
          <Pagination 
            current={currentPage}
            total={searchResults.total}
            pageSize={pageSize}
            showSizeChanger={true}
            pageSizeOptions={['10', '20', '50', '100']}
            showTotal={(total, range) => `共 ${total} 条`}
            locale={{
              items_per_page: '条/页'
            }}
            onChange={(page) => {
              setCurrentPage(page);
            }}
            onShowSizeChange={(current, size) => {
              setPageSize(size);
              setCurrentPage(1); // 改变每页条数时，重置到第一页
            }}
          />
        </div>
      </div>
      )}
      {/* 详情抽屉：右侧滑出 */}
      <Drawer
        open={detailVisible}
        title={detailItem ? detailItem.title : '详情'}
        width="70%"
        placement="right"
        onClose={() => setDetailVisible(false)}
        bodyStyle={{ padding: 0, overflowY: 'auto', background: '#f7f8fa' }}
        headerStyle={{ borderBottom: '1px solid #f0f0f0', padding: '12px 16px' }}
        className="detail-drawer"
      >
        {detailItem && (
          <div className="detail-modal detail-drawer-content">
            {getDetailData(detailItem).groups.map((group, gIdx) => (
              <React.Fragment key={gIdx}>
                {gIdx === 2 && (
                  <div className="detail-block">
                    <div className="detail-block-title">发货相关信息</div>
                    <div className="detail-block-content detail-material-table">
                      <Table
                        columns={materialColumns}
                        dataSource={getDetailData(detailItem).materialList}
                        pagination={false}
                        size="small"
                        scroll={{ x: true }}
                      />
                    </div>
                  </div>
                )}
                <div className="detail-block">
                  <div className="detail-block-title">{group.title}</div>
                  <div className="detail-block-content">
                    {group.fields.map((f, idx) => (
                      <div className="detail-field-item" key={idx}>
                        <span className="detail-field-label">{f.label}</span>
                        <span className="detail-field-value">{f.value || '-'}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </React.Fragment>
            ))}
            <div className="detail-block">
              <div className="detail-block-title">关联单号</div>
              <div className="detail-block-content" style={{ display: 'block', padding: '16px' }}>
                <OrderRelationsPanel orderNo={detailItem.orderNo} />
              </div>
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
};

export default SalesDocumentSearch;
