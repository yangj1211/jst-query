/**
 * 独立单据表（Standalone_Document_Table）
 * 严格按照 PDF 文档第四章 4.2.2 中 27 类单据的字段定义
 * structuredFields 不含文件名（卡片标题展示）
 */
const standaloneDocumentTable = [
  // ========== 1. 诉讼文件 ==========
  {
    id: 'sdoc1',
    fileName: '金石特电气与华能集团合同纠纷案诉讼材料.pdf',
    docCategory: '诉讼文件',
    fileFormat: 'pdf',
    kassPath: '/kass/财务档案/法务文件/诉讼/金石特电气与华能集团合同纠纷案诉讼材料.pdf',
    structuredFields: { date: '2022-03-15', companyCode: '1000' },
  },
  {
    id: 'sdoc2',
    fileName: '金石特电气与中铁建设质量争议诉讼文件.pdf',
    docCategory: '诉讼文件',
    fileFormat: 'pdf',
    kassPath: '/kass/财务档案/法务文件/诉讼/金石特电气与中铁建设质量争议诉讼文件.pdf',
    structuredFields: { date: '2023-06-20', companyCode: '1000' },
  },
  {
    id: 'sdoc3',
    fileName: '金石特电气与深圳地铁集团货款追偿案.pdf',
    docCategory: '诉讼文件',
    fileFormat: 'pdf',
    kassPath: '/kass/财务档案/法务文件/诉讼/金石特电气与深圳地铁集团货款追偿案.pdf',
    structuredFields: { date: '2024-01-10', companyCode: '3000' },
  },

  // ========== 2. 报价单 ==========
  {
    id: 'sdoc4',
    fileName: '南京地铁7号线整流变压器报价单.pdf',
    docCategory: '报价单',
    fileFormat: 'pdf',
    kassPath: '/kass/财务档案/销售文件/报价单/南京地铁7号线整流变压器报价单.pdf',
    structuredFields: { date: '2023-01-20', companyCode: '1000', projectName: '南京地铁7号线整流变压器项目' },
  },
  {
    id: 'sdoc5',
    fileName: '广州地铁13号线牵引整流机组报价单.pdf',
    docCategory: '报价单',
    fileFormat: 'pdf',
    kassPath: '/kass/财务档案/销售文件/报价单/广州地铁13号线牵引整流机组报价单.pdf',
    structuredFields: { date: '2023-05-08', companyCode: '1000', projectName: '广州地铁13号线牵引整流机组项目' },
  },
  {
    id: 'sdoc6',
    fileName: '济南轨道交通4号线整流变压器报价单.xlsx',
    docCategory: '报价单',
    fileFormat: 'xlsx',
    kassPath: '/kass/财务档案/销售文件/报价单/济南轨道交通4号线整流变压器报价单.xlsx',
    structuredFields: { date: '2024-03-12', companyCode: '1000', projectName: '济南轨道交通4号线整流变压器项目' },
  },

  // ========== 3. 综合财务分析指标 ==========
  {
    id: 'sdoc7',
    fileName: '金石特电气2022年度综合财务分析指标报告.pdf',
    docCategory: '综合财务分析指标',
    fileFormat: 'pdf',
    kassPath: '/kass/财务档案/财务报表/分析指标/金石特电气2022年度综合财务分析指标报告.pdf',
    structuredFields: { date: '2022-12-31' },
  },
  {
    id: 'sdoc8',
    fileName: '金石特电气2023年度综合财务分析指标报告.pdf',
    docCategory: '综合财务分析指标',
    fileFormat: 'pdf',
    kassPath: '/kass/财务档案/财务报表/分析指标/金石特电气2023年度综合财务分析指标报告.pdf',
    structuredFields: { date: '2023-12-31' },
  },

  // ========== 4. 财务报表主表（盖章） ==========
  {
    id: 'sdoc9',
    fileName: '金石特电气2022年度财务报表主表（盖章版）.pdf',
    docCategory: '财务报表主表（盖章）',
    fileFormat: 'pdf',
    kassPath: '/kass/财务档案/财务报表/主表/金石特电气2022年度财务报表主表（盖章版）.pdf',
    structuredFields: { date: '2023-03-15', companyCode: '1000' },
  },
  {
    id: 'sdoc10',
    fileName: '金石特电气2023年度财务报表主表（盖章版）.pdf',
    docCategory: '财务报表主表（盖章）',
    fileFormat: 'pdf',
    kassPath: '/kass/财务档案/财务报表/主表/金石特电气2023年度财务报表主表（盖章版）.pdf',
    structuredFields: { date: '2024-03-20', companyCode: '1000' },
  },

  // ========== 5. 年度审计报告 ==========
  {
    id: 'sdoc11',
    fileName: '金石特电气2022年度审计报告-信永中和.pdf',
    docCategory: '年度审计报告',
    fileFormat: 'pdf',
    kassPath: '/kass/财务档案/审计报告/年度审计/金石特电气2022年度审计报告-信永中和.pdf',
    structuredFields: { year: '2022', companyCode: '1000' },
  },
  {
    id: 'sdoc12',
    fileName: '金石特电气2023年度审计报告-信永中和.pdf',
    docCategory: '年度审计报告',
    fileFormat: 'pdf',
    kassPath: '/kass/财务档案/审计报告/年度审计/金石特电气2023年度审计报告-信永中和.pdf',
    structuredFields: { year: '2023', companyCode: '1000' },
  },
  {
    id: 'sdoc13',
    fileName: '金石特电气2021年度审计报告-立信.pdf',
    docCategory: '年度审计报告',
    fileFormat: 'pdf',
    kassPath: '/kass/财务档案/审计报告/年度审计/金石特电气2021年度审计报告-立信.pdf',
    structuredFields: { year: '2021', companyCode: '1000' },
  },

  // ========== 6. IT审计报告 ==========
  {
    id: 'sdoc14',
    fileName: '金石特电气2023年度IT审计报告.pdf',
    docCategory: 'IT审计报告',
    fileFormat: 'pdf',
    kassPath: '/kass/财务档案/审计报告/IT审计/金石特电气2023年度IT审计报告.pdf',
    structuredFields: { year: '2023', companyCode: '1000' },
  },
  {
    id: 'sdoc15',
    fileName: '金石特电气2022年度IT审计报告.pdf',
    docCategory: 'IT审计报告',
    fileFormat: 'pdf',
    kassPath: '/kass/财务档案/审计报告/IT审计/金石特电气2022年度IT审计报告.pdf',
    structuredFields: { year: '2022', companyCode: '1000' },
  },

  // ========== 7. 验资报告 ==========
  {
    id: 'sdoc16',
    fileName: '金石特电气增资验资报告-2022.pdf',
    docCategory: '验资报告',
    fileFormat: 'pdf',
    kassPath: '/kass/财务档案/审计报告/验资/金石特电气增资验资报告-2022.pdf',
    structuredFields: { year: '2022' },
  },
  {
    id: 'sdoc17',
    fileName: '金石特电气设立验资报告-2018.pdf',
    docCategory: '验资报告',
    fileFormat: 'pdf',
    kassPath: '/kass/财务档案/审计报告/验资/金石特电气设立验资报告-2018.pdf',
    structuredFields: { year: '2018' },
  },

  // ========== 8. 政府补助文件/政府项目专项审计报告 ==========
  {
    id: 'sdoc18',
    fileName: '2023年度省级技术改造专项资金补助审计报告.pdf',
    docCategory: '政府补助文件/政府项目专项审计报告',
    fileFormat: 'pdf',
    kassPath: '/kass/财务档案/政府项目/补助审计/2023年度省级技术改造专项资金补助审计报告.pdf',
    structuredFields: { date: '2023-08-15', companyCode: '1000', projectName: '智能变压器生产线技术改造', processRemark: '资金使用合规' },
  },
  {
    id: 'sdoc19',
    fileName: '2022年度国家重点研发计划专项审计报告.pdf',
    docCategory: '政府补助文件/政府项目专项审计报告',
    fileFormat: 'pdf',
    kassPath: '/kass/财务档案/政府项目/补助审计/2022年度国家重点研发计划专项审计报告.pdf',
    structuredFields: { date: '2022-05-20', companyCode: '1000', projectName: '高效节能型干式变压器研发', processRemark: '资金使用合规' },
  },

  // ========== 9. 信用评级 ==========
  {
    id: 'sdoc20',
    fileName: '金石特电气2023年度主体信用评级报告.pdf',
    docCategory: '信用评级',
    fileFormat: 'pdf',
    kassPath: '/kass/财务档案/信用管理/评级报告/金石特电气2023年度主体信用评级报告.pdf',
    structuredFields: { year: '2023', companyCode: '1000' },
  },
  {
    id: 'sdoc21',
    fileName: '金石特电气2022年度主体信用评级报告.pdf',
    docCategory: '信用评级',
    fileFormat: 'pdf',
    kassPath: '/kass/财务档案/信用管理/评级报告/金石特电气2022年度主体信用评级报告.pdf',
    structuredFields: { year: '2022', companyCode: '1000' },
  },

  // ========== 10. 资产评估报告 ==========
  {
    id: 'sdoc22',
    fileName: '金石特电气固定资产评估报告-2023.pdf',
    docCategory: '资产评估报告',
    fileFormat: 'pdf',
    kassPath: '/kass/财务档案/资产管理/评估报告/金石特电气固定资产评估报告-2023.pdf',
    structuredFields: { assetNo: 'A-FX-2023-001', time: '2023-09-30' },
  },
  {
    id: 'sdoc23',
    fileName: '金石特电气无形资产评估报告-2022.pdf',
    docCategory: '资产评估报告',
    fileFormat: 'pdf',
    kassPath: '/kass/财务档案/资产管理/评估报告/金石特电气无形资产评估报告-2022.pdf',
    structuredFields: { assetNo: 'A-WX-2022-001', time: '2022-12-15' },
  },

  // ========== 11. 纳税申报表 ==========
  {
    id: 'sdoc24',
    fileName: '金石特电气2023年度企业所得税纳税申报表.pdf',
    docCategory: '纳税申报表',
    fileFormat: 'pdf',
    kassPath: '/kass/财务档案/税务文件/申报表/金石特电气2023年度企业所得税纳税申报表.pdf',
    structuredFields: { taxPeriod: '2023年度', companyCode: '1000', taxName: '企业所得税', collectionPeriod: '2024-01至2024-05' },
  },
  {
    id: 'sdoc25',
    fileName: '金石特电气2023年12月增值税纳税申报表.pdf',
    docCategory: '纳税申报表',
    fileFormat: 'pdf',
    kassPath: '/kass/财务档案/税务文件/申报表/金石特电气2023年12月增值税纳税申报表.pdf',
    structuredFields: { taxPeriod: '2023年12月', companyCode: '1000', taxName: '增值税', collectionPeriod: '2024-01-01至2024-01-15' },
  },
  {
    id: 'sdoc26',
    fileName: '金石特电气2022年度企业所得税纳税申报表.pdf',
    docCategory: '纳税申报表',
    fileFormat: 'pdf',
    kassPath: '/kass/财务档案/税务文件/申报表/金石特电气2022年度企业所得税纳税申报表.pdf',
    structuredFields: { taxPeriod: '2022年度', companyCode: '1000', taxName: '企业所得税', collectionPeriod: '2023-01至2023-05' },
  },

  // ========== 12. 完税凭证 ==========
  {
    id: 'sdoc27',
    fileName: '金石特电气2023年度企业所得税完税凭证.pdf',
    docCategory: '完税凭证',
    fileFormat: 'pdf',
    kassPath: '/kass/财务档案/税务文件/完税凭证/金石特电气2023年度企业所得税完税凭证.pdf',
    structuredFields: { taxPeriod: '2023年度', companyCode: '1000', taxName: '企业所得税', collectionPeriod: '2024-05-30' },
  },
  {
    id: 'sdoc28',
    fileName: '金石特电气2023年12月增值税完税凭证.pdf',
    docCategory: '完税凭证',
    fileFormat: 'pdf',
    kassPath: '/kass/财务档案/税务文件/完税凭证/金石特电气2023年12月增值税完税凭证.pdf',
    structuredFields: { taxPeriod: '2023年12月', companyCode: '1000', taxName: '增值税', collectionPeriod: '2024-01-15' },
  },

  // ========== 13. 纳税信用等级证明 ==========
  {
    id: 'sdoc29',
    fileName: '金石特电气2023年度纳税信用等级证明.pdf',
    docCategory: '纳税信用等级证明',
    fileFormat: 'pdf',
    kassPath: '/kass/财务档案/税务文件/信用等级/金石特电气2023年度纳税信用等级证明.pdf',
    structuredFields: { year: '2023', companyCode: '1000' },
  },
  {
    id: 'sdoc30',
    fileName: '金石特电气2022年度纳税信用等级证明.pdf',
    docCategory: '纳税信用等级证明',
    fileFormat: 'pdf',
    kassPath: '/kass/财务档案/税务文件/信用等级/金石特电气2022年度纳税信用等级证明.pdf',
    structuredFields: { year: '2022', companyCode: '1000' },
  },

  // ========== 14. 无欠税证明 ==========
  {
    id: 'sdoc31',
    fileName: '金石特电气2024年度无欠税证明.pdf',
    docCategory: '无欠税证明',
    fileFormat: 'pdf',
    kassPath: '/kass/财务档案/税务文件/无欠税证明/金石特电气2024年度无欠税证明.pdf',
    structuredFields: { date: '2024-03-01', companyCode: '1000' },
  },
  {
    id: 'sdoc32',
    fileName: '金石特电气2023年度无欠税证明.pdf',
    docCategory: '无欠税证明',
    fileFormat: 'pdf',
    kassPath: '/kass/财务档案/税务文件/无欠税证明/金石特电气2023年度无欠税证明.pdf',
    structuredFields: { date: '2023-03-10', companyCode: '1000' },
  },

  // ========== 15. 研发加计扣除报告 ==========
  {
    id: 'sdoc33',
    fileName: '金石特电气2023年度研发费用加计扣除鉴证报告.pdf',
    docCategory: '研发加计扣除报告',
    fileFormat: 'pdf',
    kassPath: '/kass/财务档案/税务文件/研发加计/金石特电气2023年度研发费用加计扣除鉴证报告.pdf',
    structuredFields: { year: '2023', companyCode: '1000', other: '研发费用总额3200万' },
  },
  {
    id: 'sdoc34',
    fileName: '金石特电气2022年度研发费用加计扣除鉴证报告.pdf',
    docCategory: '研发加计扣除报告',
    fileFormat: 'pdf',
    kassPath: '/kass/财务档案/税务文件/研发加计/金石特电气2022年度研发费用加计扣除鉴证报告.pdf',
    structuredFields: { year: '2022', companyCode: '1000', other: '研发费用总额2800万' },
  },

  // ========== 16. 同期资料鉴定报告 ==========
  {
    id: 'sdoc35',
    fileName: '金石特电气2023年度关联交易同期资料鉴定报告.pdf',
    docCategory: '同期资料鉴定报告',
    fileFormat: 'pdf',
    kassPath: '/kass/财务档案/税务文件/同期资料/金石特电气2023年度关联交易同期资料鉴定报告.pdf',
    structuredFields: { year: '2023', companyCode: '1000', other: '关联交易金额4500万' },
  },
  {
    id: 'sdoc36',
    fileName: '金石特电气2022年度关联交易同期资料鉴定报告.pdf',
    docCategory: '同期资料鉴定报告',
    fileFormat: 'pdf',
    kassPath: '/kass/财务档案/税务文件/同期资料/金石特电气2022年度关联交易同期资料鉴定报告.pdf',
    structuredFields: { year: '2022', companyCode: '1000', other: '关联交易金额3800万' },
  },

  // ========== 17. 高新审计报告 ==========
  {
    id: 'sdoc37',
    fileName: '金石特电气高新技术企业认定专项审计报告-2023.pdf',
    docCategory: '高新审计报告',
    fileFormat: 'pdf',
    kassPath: '/kass/财务档案/审计报告/高新审计/金石特电气高新技术企业认定专项审计报告-2023.pdf',
    structuredFields: { year: '2023', companyCode: '1000', subject: '研发费用及高新技术收入' },
  },
  {
    id: 'sdoc38',
    fileName: '金石特电气高新技术企业认定专项审计报告-2020.pdf',
    docCategory: '高新审计报告',
    fileFormat: 'pdf',
    kassPath: '/kass/财务档案/审计报告/高新审计/金石特电气高新技术企业认定专项审计报告-2020.pdf',
    structuredFields: { year: '2020', companyCode: '1000', subject: '研发费用及高新技术收入' },
  },

  // ========== 18. 担保协议 ==========
  {
    id: 'sdoc39',
    fileName: '金石特电气与工商银行担保协议-2023.pdf',
    docCategory: '担保协议',
    fileFormat: 'pdf',
    kassPath: '/kass/财务档案/金融协议/担保/金石特电气与工商银行担保协议-2023.pdf',
    structuredFields: { startDate: '2023-06-01', endDate: '2024-05-31', bank: '中国工商银行', companyCode: '1000', amount: '50,000,000.00' },
  },
  {
    id: 'sdoc40',
    fileName: '金石特电气与建设银行担保协议-2024.pdf',
    docCategory: '担保协议',
    fileFormat: 'pdf',
    kassPath: '/kass/财务档案/金融协议/担保/金石特电气与建设银行担保协议-2024.pdf',
    structuredFields: { startDate: '2024-01-15', endDate: '2025-01-14', bank: '中国建设银行', companyCode: '1000', amount: '30,000,000.00' },
  },
  {
    id: 'sdoc41',
    fileName: '金石特电气与中国银行担保协议-2022.pdf',
    docCategory: '担保协议',
    fileFormat: 'pdf',
    kassPath: '/kass/财务档案/金融协议/担保/金石特电气与中国银行担保协议-2022.pdf',
    structuredFields: { startDate: '2022-03-01', endDate: '2023-02-28', bank: '中国银行', companyCode: '1000', amount: '40,000,000.00' },
  },

  // ========== 19. 授信协议 ==========
  {
    id: 'sdoc42',
    fileName: '金石特电气与工商银行综合授信协议-2024.pdf',
    docCategory: '授信协议',
    fileFormat: 'pdf',
    kassPath: '/kass/财务档案/金融协议/授信/金石特电气与工商银行综合授信协议-2024.pdf',
    structuredFields: { startDate: '2024-01-01', endDate: '2024-12-31', bank: '中国工商银行济南分行', companyCode: '1000', amount: '100,000,000.00' },
  },
  {
    id: 'sdoc43',
    fileName: '金石特电气与建设银行综合授信协议-2023.pdf',
    docCategory: '授信协议',
    fileFormat: 'pdf',
    kassPath: '/kass/财务档案/金融协议/授信/金石特电气与建设银行综合授信协议-2023.pdf',
    structuredFields: { startDate: '2023-04-01', endDate: '2024-03-31', bank: '中国建设银行济南分行', companyCode: '1000', amount: '80,000,000.00' },
  },

  // ========== 20. 借款协议 ==========
  {
    id: 'sdoc44',
    fileName: '金石特电气与工商银行流动资金借款合同-2024.pdf',
    docCategory: '借款协议',
    fileFormat: 'pdf',
    kassPath: '/kass/财务档案/金融协议/借款/金石特电气与工商银行流动资金借款合同-2024.pdf',
    structuredFields: { interestStartDate: '2024-03-15', interestEndDate: '2025-03-15', bank: '中国工商银行济南分行', companyCode: '1000', amount: '30,000,000.00' },
  },
  {
    id: 'sdoc45',
    fileName: '金石特电气与农业银行项目贷款合同-2023.pdf',
    docCategory: '借款协议',
    fileFormat: 'pdf',
    kassPath: '/kass/财务档案/金融协议/借款/金石特电气与农业银行项目贷款合同-2023.pdf',
    structuredFields: { interestStartDate: '2023-06-30', interestEndDate: '2026-06-30', bank: '中国农业银行济南分行', companyCode: '1000', amount: '50,000,000.00' },
  },

  // ========== 21. 凭证入账支持文件 ==========
  {
    id: 'sdoc46',
    fileName: '2024年3月固定资产折旧计提凭证支持文件.pdf',
    docCategory: '凭证入账支持文件',
    fileFormat: 'pdf',
    kassPath: '/kass/财务档案/会计凭证/入账支持/2024年3月固定资产折旧计提凭证支持文件.pdf',
    structuredFields: { companyCode: '1000', voucherNo: 'PZ-2024-03-0156' },
  },
  {
    id: 'sdoc47',
    fileName: '2024年1月工资计提凭证支持文件.pdf',
    docCategory: '凭证入账支持文件',
    fileFormat: 'pdf',
    kassPath: '/kass/财务档案/会计凭证/入账支持/2024年1月工资计提凭证支持文件.pdf',
    structuredFields: { companyCode: '1000', voucherNo: 'PZ-2024-01-0089' },
  },
  {
    id: 'sdoc48',
    fileName: '2023年12月存货跌价准备凭证支持文件.pdf',
    docCategory: '凭证入账支持文件',
    fileFormat: 'pdf',
    kassPath: '/kass/财务档案/会计凭证/入账支持/2023年12月存货跌价准备凭证支持文件.pdf',
    structuredFields: { companyCode: '1000', voucherNo: 'PZ-2023-12-0234' },
  },

  // ========== 22. 银行回单 ==========
  {
    id: 'sdoc49',
    fileName: '工商银行电子回单-济南轨道交通货款收入.pdf',
    docCategory: '银行回单',
    fileFormat: 'pdf',
    kassPath: '/kass/财务档案/银行单据/回单/工商银行电子回单-济南轨道交通货款收入.pdf',
    structuredFields: { companyCode: '1000', voucherNo: 'BELNR-2024-0315', receiptNo: 'ICBC-2024-03150001', issueDate: '2024-03-15', amount: '2,580,000.00' },
  },
  {
    id: 'sdoc50',
    fileName: '建设银行电子回单-供应商付款.pdf',
    docCategory: '银行回单',
    fileFormat: 'pdf',
    kassPath: '/kass/财务档案/银行单据/回单/建设银行电子回单-供应商付款.pdf',
    structuredFields: { companyCode: '1000', voucherNo: 'BELNR-2024-0228', receiptNo: 'CCB-2024-02280003', issueDate: '2024-02-28', amount: '1,560,000.00' },
  },
  {
    id: 'sdoc51',
    fileName: '农业银行电子回单-广州地铁货款收入.pdf',
    docCategory: '银行回单',
    fileFormat: 'pdf',
    kassPath: '/kass/财务档案/银行单据/回单/农业银行电子回单-广州地铁货款收入.pdf',
    structuredFields: { companyCode: '1000', voucherNo: 'BELNR-2023-1220', receiptNo: 'ABC-2023-12200005', issueDate: '2023-12-20', amount: '3,150,000.00' },
  },

  // ========== 23. 承兑汇票收付回单 ==========
  {
    id: 'sdoc52',
    fileName: '银行承兑汇票收款回单-南京地铁.pdf',
    docCategory: '承兑汇票收付回单',
    fileFormat: 'pdf',
    kassPath: '/kass/财务档案/银行单据/汇票回单/银行承兑汇票收款回单-南京地铁.pdf',
    structuredFields: { companyCode: '1000', voucherNo: 'BELNR-2024-0110', receiptNo: 'BA-2024-NJ-00123', issueDate: '2024-01-10', amount: '2,600,000.00' },
  },
  {
    id: 'sdoc53',
    fileName: '商业承兑汇票付款回单-特变电工.pdf',
    docCategory: '承兑汇票收付回单',
    fileFormat: 'pdf',
    kassPath: '/kass/财务档案/银行单据/汇票回单/商业承兑汇票付款回单-特变电工.pdf',
    structuredFields: { companyCode: '1000', voucherNo: 'BELNR-2023-0915', receiptNo: 'CA-2023-TB-00089', issueDate: '2023-09-15', amount: '1,800,000.00' },
  },
  {
    id: 'sdoc54',
    fileName: '银行承兑汇票收款回单-深圳地铁.pdf',
    docCategory: '承兑汇票收付回单',
    fileFormat: 'pdf',
    kassPath: '/kass/财务档案/银行单据/汇票回单/银行承兑汇票收款回单-深圳地铁.pdf',
    structuredFields: { companyCode: '1000', voucherNo: 'BELNR-2023-0620', receiptNo: 'BA-2023-SZ-00067', issueDate: '2023-06-20', amount: '4,500,000.00' },
  },

  // ========== 24. 报销发票 ==========
  {
    id: 'sdoc55',
    fileName: '差旅费报销发票-南京项目出差.jpg',
    docCategory: '报销发票',
    fileFormat: 'jpg',
    kassPath: '/kass/财务档案/费用报销/发票/差旅费报销发票-南京项目出差.jpg',
    structuredFields: { companyCode: '1000', voucherNo: 'BELNR-2024-0305', receiptNo: 'BX-2024-0156', issueDate: '2024-03-05', amount: '3,560.00' },
  },
  {
    id: 'sdoc56',
    fileName: '办公用品采购报销发票-2024Q1.jpg',
    docCategory: '报销发票',
    fileFormat: 'jpg',
    kassPath: '/kass/财务档案/费用报销/发票/办公用品采购报销发票-2024Q1.jpg',
    structuredFields: { companyCode: '1000', voucherNo: 'BELNR-2024-0120', receiptNo: 'BX-2024-0089', issueDate: '2024-01-20', amount: '12,800.00' },
  },
  {
    id: 'sdoc57',
    fileName: '业务招待费报销发票-广州客户接待.jpg',
    docCategory: '报销发票',
    fileFormat: 'jpg',
    kassPath: '/kass/财务档案/费用报销/发票/业务招待费报销发票-广州客户接待.jpg',
    structuredFields: { companyCode: '1000', voucherNo: 'BELNR-2023-1112', receiptNo: 'BX-2023-0678', issueDate: '2023-11-12', amount: '5,680.00' },
  },

  // ========== 25. 应付账款函证相关单据-对账单 ==========
  {
    id: 'sdoc58',
    fileName: '应付账款对账单-上海电气集团-2023Q4.pdf',
    docCategory: '应付账款函证相关单据-对账单',
    fileFormat: 'pdf',
    kassPath: '/kass/财务档案/应付管理/对账单/应付账款对账单-上海电气集团-2023Q4.pdf',
    structuredFields: { date: '2023-12-31', supplierCode: '100234' },
  },
  {
    id: 'sdoc59',
    fileName: '应付账款对账单-特变电工-2023Q4.pdf',
    docCategory: '应付账款函证相关单据-对账单',
    fileFormat: 'pdf',
    kassPath: '/kass/财务档案/应付管理/对账单/应付账款对账单-特变电工-2023Q4.pdf',
    structuredFields: { date: '2023-12-31', supplierCode: '100789' },
  },

  // ========== 26. 应付账款函证相关单据-应收询证函 ==========
  {
    id: 'sdoc60',
    fileName: '应收账款询证函-济南轨道交通-2023年末.pdf',
    docCategory: '应付账款函证相关单据-应收询证函',
    fileFormat: 'pdf',
    kassPath: '/kass/财务档案/应付管理/询证函/应收账款询证函-济南轨道交通-2023年末.pdf',
    structuredFields: { date: '2023-12-31', supplierCode: '200100' },
  },
  {
    id: 'sdoc61',
    fileName: '应收账款询证函-广州地铁集团-2023年末.pdf',
    docCategory: '应付账款函证相关单据-应收询证函',
    fileFormat: 'pdf',
    kassPath: '/kass/财务档案/应付管理/询证函/应收账款询证函-广州地铁集团-2023年末.pdf',
    structuredFields: { date: '2023-12-31', supplierCode: '200200' },
  },
  {
    id: 'sdoc62',
    fileName: '应收账款询证函-深圳地铁集团-2023年末.pdf',
    docCategory: '应付账款函证相关单据-应收询证函',
    fileFormat: 'pdf',
    kassPath: '/kass/财务档案/应付管理/询证函/应收账款询证函-深圳地铁集团-2023年末.pdf',
    structuredFields: { date: '2023-12-31', supplierCode: '200300' },
  },

  // ========== 27. 协议文件 ==========
  {
    id: 'sdoc63',
    fileName: '金石特电气与上海电气年度采购框架协议-2024.pdf',
    docCategory: '采购协议',
    fileFormat: 'pdf',
    kassPath: '/kass/财务档案/采购文档/协议/金石特电气与上海电气年度采购框架协议-2024.pdf',
    structuredFields: { agreementNo: 'KJ-2024-SH-001', agreementObject: '上海电气集团股份有限公司', agreementStartDate: '2024-01-01', agreementEndDate: '2024-12-31' },
  },
  {
    id: 'sdoc64',
    fileName: '金石特电气与特变电工质量协议-2023.pdf',
    docCategory: '采购协议',
    fileFormat: 'pdf',
    kassPath: '/kass/财务档案/采购文档/协议/金石特电气与特变电工质量协议-2023.pdf',
    structuredFields: { agreementNo: 'ZL-2023-TB-001', agreementObject: '特变电工股份有限公司', agreementStartDate: '2023-06-01', agreementEndDate: '2024-05-31' },
  },
  {
    id: 'sdoc65',
    fileName: '金石特电气与西电集团采购框架协议-2024.pdf',
    docCategory: '采购协议',
    fileFormat: 'pdf',
    kassPath: '/kass/财务档案/采购文档/协议/金石特电气与西电集团采购框架协议-2024.pdf',
    structuredFields: { agreementNo: 'KJ-2024-XD-001', agreementObject: '中国西电电气股份有限公司', agreementStartDate: '2024-03-01', agreementEndDate: '2025-02-28' },
  },
];

export default standaloneDocumentTable;
