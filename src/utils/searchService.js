/**
 * SearchService - 根据解析后的查询条件执行检索
 *
 * @typedef {Object} ResultSet
 * @property {Object[]} orders - 命中订单（含 documents 数组）
 * @property {number} total
 * @property {string} summary
 * @property {string[]} usedFields
 * @property {string} conditionDesc
 * @property {Object|null} aggregation
 */

/** 字段中文标签映射 */
const FIELD_LABELS = {
  orderNo: '订单号',
  customer: '客户名称',
  title: '项目名称',
  poDate: '凭证日期',
  amount: '合同金额',
  currency: '货币',
  salesRegionDesc: '销售地区',
  salesRepDesc: '销售代表',
  salesOfficeDesc: '销售代表处',
  industryDesc: '用户行业',
  channelDesc: '分销渠道',
  holdingCompany: '控股方',
  tag: '文件类型',
};

/** 默认订单列表表格列（订单号 + 常用字段） */
const DEFAULT_ORDER_COLUMNS = [
  { title: '订单号', dataIndex: 'orderNo', key: 'orderNo', width: 130 },
  { title: '项目名称', dataIndex: 'title', key: 'title', ellipsis: true },
  { title: '客户名称', dataIndex: 'customer', key: 'customer', ellipsis: true },
  { title: '凭证日期', dataIndex: 'poDate', key: 'poDate', width: 110 },
  { title: '合同金额', dataIndex: 'amount', key: 'amount', width: 120 },
  { title: '货币', dataIndex: 'currency', key: 'currency', width: 70 },
];

/** 所有可用的订单列定义 */
const ALL_ORDER_COLUMN_DEFS = {
  orderNo: { title: '订单号', dataIndex: 'orderNo', key: 'orderNo', width: 130 },
  customer: { title: '客户名称', dataIndex: 'customer', key: 'customer', ellipsis: true },
  title: { title: '项目名称', dataIndex: 'title', key: 'title', ellipsis: true },
  poDate: { title: '凭证日期', dataIndex: 'poDate', key: 'poDate', width: 110 },
  amount: { title: '合同金额', dataIndex: 'amount', key: 'amount', width: 120 },
  currency: { title: '货币', dataIndex: 'currency', key: 'currency', width: 70 },
  salesRegionDesc: { title: '销售地区', dataIndex: 'salesRegionDesc', key: 'salesRegionDesc', width: 120 },
  salesRepDesc: { title: '销售代表', dataIndex: 'salesRepDesc', key: 'salesRepDesc', width: 120 },
  salesOfficeDesc: { title: '销售代表处', dataIndex: 'salesOfficeDesc', key: 'salesOfficeDesc', width: 140 },
  industryDesc: { title: '用户行业', dataIndex: 'industryDesc', key: 'industryDesc', ellipsis: true },
  channelDesc: { title: '分销渠道', dataIndex: 'channelDesc', key: 'channelDesc', width: 120 },
  holdingCompany: { title: '控股方', dataIndex: 'holdingCompany', key: 'holdingCompany', ellipsis: true },
  soldTo: { title: '售达方', dataIndex: 'soldTo', key: 'soldTo', width: 120 },
  vatInvoiceNo: { title: 'VAT发票号', dataIndex: 'vatInvoiceNo', key: 'vatInvoiceNo', width: 130 },
  vatInvoiceDate: { title: 'VAT发票时间', dataIndex: 'vatInvoiceDate', key: 'vatInvoiceDate', width: 120 },
  vatInvoiceAmount: { title: 'VAT发票金额', dataIndex: 'vatInvoiceAmount', key: 'vatInvoiceAmount', width: 120 },
  paymentDate: { title: '回款时间', dataIndex: 'paymentDate', key: 'paymentDate', width: 110 },
  paymentAmount: { title: '回款金额', dataIndex: 'paymentAmount', key: 'paymentAmount', width: 110 },
  outstandingAmount: { title: '欠款金额', dataIndex: 'outstandingAmount', key: 'outstandingAmount', width: 110 },
  taxRate: { title: '税率', dataIndex: 'taxRate', key: 'taxRate', width: 80 },
};

/**
 * 根据查询条件中使用的字段动态生成订单列表表格列定义
 * 始终包含订单号列，再追加查询涉及的字段列，最后补充常用字段
 */
function buildOrderColumns(conditions) {
  if (!conditions || conditions.length === 0) {
    return DEFAULT_ORDER_COLUMNS;
  }

  const seen = new Set();
  const columns = [];

  // 始终包含订单号
  columns.push(ALL_ORDER_COLUMN_DEFS.orderNo);
  seen.add('orderNo');

  // 追加查询涉及的 order 字段
  conditions.forEach(c => {
    if (c.table === 'order' && !seen.has(c.field) && ALL_ORDER_COLUMN_DEFS[c.field]) {
      columns.push(ALL_ORDER_COLUMN_DEFS[c.field]);
      seen.add(c.field);
    }
  });

  // 补充常用字段（项目名称、客户名称、凭证日期、合同金额、货币）
  ['title', 'customer', 'poDate', 'amount', 'currency'].forEach(f => {
    if (!seen.has(f)) {
      columns.push(ALL_ORDER_COLUMN_DEFS[f]);
      seen.add(f);
    }
  });

  return columns;
}

/**
 * 执行检索
 * @param {import('./queryParser').ParseResult} parseResult
 * @param {Object[]} orders - Order_Table
 * @param {Object[]} documents - Document_Table
 * @returns {ResultSet}
 */
export function executeSearch(parseResult, orders, documents) {
  const { conditions, queryType, aggregation: aggConfig, queryFocus } = parseResult;

  // 为每个订单关联文件
  const attachDocuments = (orderList) =>
    orderList.map(order => ({
      ...order,
      documents: documents.filter(doc => doc.orderNo === order.orderNo),
    }));

  // 聚合查询
  if (queryType === 'aggregation' && aggConfig) {
    return executeAggregation(aggConfig, orders, documents, parseResult);
  }

  // 无条件 → 返回全量
  if (!conditions || conditions.length === 0) {
    const allOrders = attachDocuments(orders);
    return {
      orders: allOrders,
      total: allOrders.length,
      summary: `当前系统共有 ${allOrders.length} 条销售订单记录。您可以通过输入客户名称、时间范围、金额条件等进行精确检索，也可以使用"按客户统计"等指令进行聚合分析。`,
      usedFields: [],
      conditionDesc: '全部订单',
      aggregation: null,
      orderColumns: DEFAULT_ORDER_COLUMNS,
      queryFocus: null,
    };
  }

  // 分离 order 条件和 document 条件
  const orderConditions = conditions.filter(c => c.table === 'order');
  const docConditions = conditions.filter(c => c.table === 'document');

  // 用 order 条件过滤
  let filteredOrders = orders;
  if (orderConditions.length > 0) {
    filteredOrders = orders.filter(order =>
      orderConditions.every(cond => matchCondition(order, cond))
    );
  }

  // 用 document 条件过滤（取匹配的 orderNo 集合，与 order 结果取交集）
  if (docConditions.length > 0) {
    const matchingOrderNos = new Set();
    documents.forEach(doc => {
      if (docConditions.every(cond => matchCondition(doc, cond))) {
        matchingOrderNos.add(doc.orderNo);
      }
    });
    filteredOrders = filteredOrders.filter(order => matchingOrderNos.has(order.orderNo));
  }

  const resultOrders = attachDocuments(filteredOrders);
  const usedFields = [...new Set(conditions.map(c => FIELD_LABELS[c.field] || c.field))];
  const orderColumns = buildOrderColumns(conditions);

  if (resultOrders.length === 0) {
    return {
      orders: [],
      total: 0,
      summary: `根据您的查询条件（${parseResult.description || ''}），未找到匹配的订单记录。建议您检查条件是否正确，或尝试放宽查询范围。`,
      usedFields,
      conditionDesc: parseResult.description || '',
      aggregation: null,
      orderColumns,
      queryFocus: queryFocus || null,
    };
  }

  return {
    orders: resultOrders,
    total: resultOrders.length,
    summary: buildListSummary(resultOrders, conditions, parseResult.description, queryFocus),
    usedFields,
    conditionDesc: parseResult.description || '',
    aggregation: null,
    orderColumns,
    queryFocus: queryFocus || null,
  };
}

/**
 * 单条件匹配
 */
function matchCondition(record, condition) {
  const { field, operator, value } = condition;
  const recordValue = record[field];

  if (recordValue === undefined || recordValue === null) return false;

  switch (operator) {
    case 'eq':
      return String(recordValue) === String(value);
    case 'contains':
      return String(recordValue).includes(String(value));
    case 'gt':
      return toNumber(recordValue) > toNumber(value);
    case 'gte':
      return compareValues(recordValue, value) >= 0;
    case 'lt':
      return toNumber(recordValue) < toNumber(value);
    case 'lte':
      return compareValues(recordValue, value) <= 0;
    case 'in':
      if (Array.isArray(value)) {
        return value.some(v => String(recordValue).includes(String(v)));
      }
      return String(recordValue).includes(String(value));
    default:
      return false;
  }
}

/** 比较值（支持日期字符串和数字） */
function compareValues(a, b) {
  // 尝试日期比较
  if (typeof a === 'string' && typeof b === 'string' && a.match(/^\d{4}[-./]/) && b.match(/^\d{4}[-./]/)) {
    const dateA = normalizeDate(a);
    const dateB = normalizeDate(b);
    return dateA.localeCompare(dateB);
  }
  // 数字比较
  return toNumber(a) - toNumber(b);
}

/** 标准化日期格式为 YYYY-MM-DD */
function normalizeDate(dateStr) {
  return String(dateStr).replace(/[./]/g, '-');
}

/** 转数字 */
function toNumber(val) {
  if (typeof val === 'number') return val;
  const num = parseFloat(String(val).replace(/[,，]/g, ''));
  return isNaN(num) ? 0 : num;
}

/**
 * 生成条件检索的自然语言回答（根据查询焦点定制文案）
 */
function buildListSummary(resultOrders, conditions, description, queryFocus) {
  const count = resultOrders.length;
  if (count === 0) return '';

  // 提取客户条件
  const customerCond = conditions.find(c => c.field === 'customer');
  const customerName = customerCond ? customerCond.value : null;

  // 如果查询焦点是文件类型（如发票、合同等）
  if (queryFocus && queryFocus.length > 0) {
    const focusLabel = queryFocus.join('、');

    // 统计匹配的文件数量
    let totalDocs = 0;
    const docDetails = [];
    resultOrders.forEach(order => {
      if (order.documents) {
        const matchedDocs = order.documents.filter(doc => queryFocus.includes(doc.tag));
        totalDocs += matchedDocs.length;
        if (matchedDocs.length > 0) {
          docDetails.push({ orderNo: order.orderNo, title: order.title, docCount: matchedDocs.length });
        }
      }
    });

    const parts = [];
    if (customerName) {
      if (totalDocs > 0) {
        parts.push(`为您找到「${customerName}」相关的 ${totalDocs} 份${focusLabel}文件，涉及 ${docDetails.length} 个订单。`);
      } else {
        parts.push(`未找到「${customerName}」相关的${focusLabel}文件。该客户共有 ${count} 个订单，但暂无${focusLabel}记录。`);
      }
    } else {
      if (totalDocs > 0) {
        parts.push(`共检索到 ${totalDocs} 份${focusLabel}文件，涉及 ${count} 个订单。`);
      } else {
        parts.push(`共检索到 ${count} 个相关订单，但暂无${focusLabel}文件记录。`);
      }
    }

    return parts.join('');
  }

  // 通用订单检索回答
  const totalAmount = resultOrders.reduce((sum, o) => sum + toNumber(o.amount), 0);
  const amountStr = totalAmount >= 100000000
    ? `${(totalAmount / 100000000).toFixed(2)} 亿元`
    : totalAmount >= 10000
      ? `${(totalAmount / 10000).toFixed(2)} 万元`
      : `${totalAmount.toLocaleString()} 元`;

  const dates = resultOrders.map(o => o.poDate).filter(Boolean).sort();
  const dateRange = dates.length > 0 ? `时间跨度从 ${dates[0]} 到 ${dates[dates.length - 1]}` : '';

  const customerSet = new Set(resultOrders.map(o => o.customer).filter(Boolean));
  const customerCount = customerSet.size;

  const parts = [];
  parts.push(`根据您的查询条件，共检索到 ${count} 条相关订单，合同总金额合计 ${amountStr}。`);

  if (customerCount > 0 && customerCount <= 5) {
    parts.push(`涉及客户：${Array.from(customerSet).join('、')}。`);
  } else if (customerCount > 5) {
    parts.push(`涉及 ${customerCount} 个客户。`);
  }

  if (dateRange) {
    parts.push(dateRange + '。');
  }

  return parts.join('');
}

/**
 * 生成聚合查询的自然语言回答
 */
function buildAggregationSummary(sorted, groupLabel, totalGroups, limit, topOrders, queryFocus, allOrdersForRatio) {
  const totalAmountAll = (allOrdersForRatio || topOrders).reduce((sum, o) => sum + toNumber(o.amount), 0);
  const topAmount = sorted.reduce((sum, item) => sum + item.totalAmount, 0);
  const topOrderCount = sorted.reduce((sum, item) => sum + item.count, 0);
  const topAmountStr = topAmount >= 100000000
    ? `${(topAmount / 100000000).toFixed(2)} 亿元`
    : `${(topAmount / 10000).toFixed(2)} 万元`;
  const ratio = totalAmountAll > 0 ? ((topAmount / totalAmountAll) * 100).toFixed(1) : '0';

  // 有文件焦点时，用聚合方式直接回答
  const hasFocus = Array.isArray(queryFocus) && queryFocus.length > 0;
  if (hasFocus) {
    const focusLabel = queryFocus.join('、');
    const totalDocs = sorted.reduce((sum, item) => sum + (item.docCount || 0), 0);
    const customerNames = sorted.map(item => `「${item.key}」`).join('、');
    const parts = [];
    parts.push(`合同金额排名前 ${sorted.length} 的${groupLabel}为：${customerNames}。`);
    if (totalDocs > 0) {
      parts.push(`共检索到 ${totalDocs} 份${focusLabel}文件，涉及 ${topOrderCount} 个订单。`);
    } else {
      parts.push(`这 ${sorted.length} 个${groupLabel}共 ${topOrderCount} 笔订单，暂无${focusLabel}文件记录。`);
    }
    return parts.join('');
  }

  const parts = [];
  parts.push(`根据您的查询，系统按${groupLabel}维度进行了统计分析。`);
  parts.push(`共涉及 ${totalGroups} 个${groupLabel}，以下为合同金额排名前 ${sorted.length} 的${groupLabel}。`);
  parts.push(`前 ${sorted.length} 名合计金额 ${topAmountStr}，共 ${topOrderCount} 笔订单，占总金额的 ${ratio}%。`);

  if (sorted.length > 0) {
    parts.push(`其中「${sorted[0].key}」以 ${sorted[0].totalAmount.toLocaleString()} 元位居首位。`);
  }

  return parts.join('');
}
function executeAggregation(aggConfig, orders, documents, parseResult) {
  const { groupBy, orderBy, limit, direction = 'desc' } = aggConfig;
  const queryFocus = parseResult.queryFocus;
  const hasFocus = Array.isArray(queryFocus) && queryFocus.length > 0;

  // 按 groupBy 字段分组
  const groups = {};
  orders.forEach(order => {
    const key = order[groupBy] || '未知';
    if (!groups[key]) {
      groups[key] = { key, count: 0, totalAmount: 0, docCount: 0 };
    }
    groups[key].count += 1;
    groups[key].totalAmount += toNumber(order[orderBy] || order.amount);

    // 统计匹配文件类型的文件数
    if (hasFocus) {
      const matchedDocs = documents.filter(
        doc => doc.orderNo === order.orderNo && queryFocus.includes(doc.tag)
      );
      groups[key].docCount += matchedDocs.length;
    }
  });

  // 排序：始终按金额排序
  let sorted = Object.values(groups).sort((a, b) =>
    direction === 'desc' ? b.totalAmount - a.totalAmount : a.totalAmount - b.totalAmount
  );

  // 限制数量
  if (limit) {
    sorted = sorted.slice(0, limit);
  }

  const groupLabel = FIELD_LABELS[groupBy] || groupBy;
  const focusLabel = hasFocus ? queryFocus.join('、') : '';

  // 根据是否有文件焦点构建不同的表格列
  const columns = hasFocus
    ? [
        { title: '排名', dataIndex: 'rank', key: 'rank', width: 60 },
        { title: groupLabel, dataIndex: 'name', key: 'name' },
        { title: '订单数', dataIndex: 'count', key: 'count', width: 80 },
        { title: `${focusLabel}数量`, dataIndex: 'docCount', key: 'docCount', width: 100 },
        { title: '合同总金额', dataIndex: 'totalAmount', key: 'totalAmount', width: 140 },
      ]
    : [
        { title: '排名', dataIndex: 'rank', key: 'rank', width: 60 },
        { title: groupLabel, dataIndex: 'name', key: 'name' },
        { title: '订单数', dataIndex: 'count', key: 'count', width: 80 },
        { title: '合同总金额', dataIndex: 'totalAmount', key: 'totalAmount', width: 140 },
      ];

  const aggregation = {
    columns,
    dataSource: sorted.map((item, idx) => ({
      key: String(idx + 1),
      rank: idx + 1,
      name: item.key,
      count: item.count,
      docCount: item.docCount || 0,
      totalAmount: item.totalAmount.toLocaleString(),
    })),
  };

  // 只返回聚合结果中 top N 分组对应的订单
  const topKeys = new Set(sorted.map(item => item.key));
  const filteredOrders = orders
    .filter(order => topKeys.has(order[groupBy] || '未知'))
    .map(order => ({
      ...order,
      documents: documents.filter(doc => doc.orderNo === order.orderNo),
    }));

  return {
    orders: filteredOrders,
    total: filteredOrders.length,
    summary: buildAggregationSummary(sorted, groupLabel, Object.keys(groups).length, limit, filteredOrders, queryFocus, orders),
    usedFields: [groupLabel, '合同金额'],
    conditionDesc: parseResult.description || '',
    aggregation,
    orderColumns: DEFAULT_ORDER_COLUMNS,
    queryFocus: queryFocus || null,
  };
}

export default executeSearch;
