/**
 * 单据类型元数据配置（docCategoryMeta）
 * 严格按照 PDF 文档第四章 4.2.2 中 27 类单据的字段定义
 * 字段排列逻辑：主体标识(公司/供应商) → 时间/期间 → 业务内容/金额
 * 文件名和单据类型在卡片标题展示，此处只定义卡片内的结构化字段
 */
const docCategoryMeta = {
  // 1. 诉讼文件：公司代码 → 日期
  '诉讼文件': {
    fields: [
      { key: 'companyCode', label: '公司代码', type: 'string' },
      { key: 'date', label: '日期', type: 'date' },
    ],
  },
  // 2. 报价单：公司代码 → 日期 → 项目名
  '报价单': {
    fields: [
      { key: 'companyCode', label: '公司代码', type: 'string' },
      { key: 'date', label: '日期', type: 'date' },
      { key: 'projectName', label: '项目名', type: 'string' },
    ],
  },
  // 3. 综合财务分析指标：只有日期
  '综合财务分析指标': {
    fields: [
      { key: 'date', label: '日期', type: 'date' },
    ],
  },
  // 4. 财务报表主表（盖章）：公司代码 → 日期
  '财务报表主表（盖章）': {
    fields: [
      { key: 'companyCode', label: '公司代码', type: 'string' },
      { key: 'date', label: '日期', type: 'date' },
    ],
  },
  // 5. 年度审计报告：公司代码 → 年份
  '年度审计报告': {
    fields: [
      { key: 'companyCode', label: '公司代码', type: 'string' },
      { key: 'year', label: '年份', type: 'string' },
    ],
  },
  // 6. IT审计报告：公司代码 → 年份
  'IT审计报告': {
    fields: [
      { key: 'companyCode', label: '公司代码', type: 'string' },
      { key: 'year', label: '年份', type: 'string' },
    ],
  },
  // 7. 验资报告：只有年份
  '验资报告': {
    fields: [
      { key: 'year', label: '年份', type: 'string' },
    ],
  },
  // 8. 政府补助文件/政府项目专项审计报告：公司代码 → 日期 → 项目名称 → 过程备注
  '政府补助文件/政府项目专项审计报告': {
    fields: [
      { key: 'companyCode', label: '公司代码', type: 'string' },
      { key: 'date', label: '日期', type: 'date' },
      { key: 'projectName', label: '项目名称', type: 'string' },
      { key: 'processRemark', label: '过程备注', type: 'string' },
    ],
  },
  // 9. 信用评级：公司代码 → 年份
  '信用评级': {
    fields: [
      { key: 'companyCode', label: '公司代码', type: 'string' },
      { key: 'year', label: '年份', type: 'string' },
    ],
  },
  // 10. 资产评估报告：资产编号 → 时间
  '资产评估报告': {
    fields: [
      { key: 'assetNo', label: '资产编号', type: 'string' },
      { key: 'time', label: '时间', type: 'string' },
    ],
  },
  // 11. 纳税申报表：公司代码 → 属期年月 → 税种名 → 征期时间
  '纳税申报表': {
    fields: [
      { key: 'companyCode', label: '公司代码', type: 'string' },
      { key: 'taxPeriod', label: '属期年月', type: 'string' },
      { key: 'taxName', label: '税种名', type: 'string' },
      { key: 'collectionPeriod', label: '征期时间', type: 'string' },
    ],
  },
  // 12. 完税凭证：公司代码 → 属期年月 → 征期时间
  '完税凭证': {
    fields: [
      { key: 'companyCode', label: '公司代码', type: 'string' },
      { key: 'taxPeriod', label: '属期年月', type: 'string' },
      { key: 'collectionPeriod', label: '征期时间', type: 'string' },
    ],
  },
  // 13. 纳税信用等级证明：公司代码 → 年份
  '纳税信用等级证明': {
    fields: [
      { key: 'companyCode', label: '公司代码', type: 'string' },
      { key: 'year', label: '年份', type: 'string' },
    ],
  },
  // 14. 无违规证明：公司代码 → 日期
  '无违规证明': {
    fields: [
      { key: 'companyCode', label: '公司代码', type: 'string' },
      { key: 'date', label: '日期', type: 'date' },
    ],
  },
  // 21. 凭证入账支持文件：公司代码 → 凭证号
  '凭证入账支持文件': {
    fields: [
      { key: 'companyCode', label: '公司代码', type: 'string' },
      { key: 'voucherNo', label: '凭证号', type: 'string' },
    ],
  },
  // 22. 银行回单：公司代码 → 凭证号 → 回单编号 → 开票日期 → 金额
  '银行回单': {
    fields: [
      { key: 'companyCode', label: '公司代码', type: 'string' },
      { key: 'voucherNo', label: '凭证号', type: 'string' },
      { key: 'receiptNo', label: '回单编号', type: 'string' },
      { key: 'issueDate', label: '开票日期', type: 'date' },
      { key: 'amount', label: '金额', type: 'number' },
    ],
  },
  // 23. 承兑汇票收付回单：公司代码 → 凭证号 → 回单编号 → 开票日期 → 金额
  '承兑汇票收付回单': {
    fields: [
      { key: 'companyCode', label: '公司代码', type: 'string' },
      { key: 'voucherNo', label: '凭证号', type: 'string' },
      { key: 'receiptNo', label: '回单编号', type: 'string' },
      { key: 'issueDate', label: '开票日期', type: 'date' },
      { key: 'amount', label: '金额', type: 'number' },
    ],
  },
  // 24. 报销发票：公司代码 → 凭证号 → 回单编号 → 开票日期 → 金额
  '报销发票': {
    fields: [
      { key: 'companyCode', label: '公司代码', type: 'string' },
      { key: 'voucherNo', label: '凭证号', type: 'string' },
      { key: 'receiptNo', label: '回单编号', type: 'string' },
      { key: 'issueDate', label: '开票日期', type: 'date' },
      { key: 'amount', label: '金额', type: 'number' },
    ],
  },
  // 25. 应付账款函证相关单据：供应商代码 → 日期
  '应付账款函证相关单据': {
    fields: [
      { key: 'supplierCode', label: '供应商代码', type: 'string' },
      { key: 'date', label: '日期', type: 'date' },
    ],
  },
  // 27. 协议文件：协议编号 → 协议对象 → 协议起始日期 → 协议终止日期
  '采购协议': {
    fields: [
      { key: 'agreementNo', label: '协议编号', type: 'string' },
      { key: 'agreementObject', label: '协议对象', type: 'string' },
      { key: 'agreementStartDate', label: '协议起始日期', type: 'date' },
      { key: 'agreementEndDate', label: '协议终止日期', type: 'date' },
    ],
  },
};

export default docCategoryMeta;
