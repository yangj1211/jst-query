export const VOUCHER_ATTACHMENT_TYPES = {
  BANK_RECEIPT: '银行回单',
  ACCEPTANCE_BILL: '承兑汇票收付回单',
  APPROVAL_FILE: '审批文件',
  BOOKING_SUPPORT: '凭证支持类附件',
  CONTRACT: '凭证支持类合同',
};

export const voucherAttachmentTypes = Object.values(VOUCHER_ATTACHMENT_TYPES);

const sumLineAmount = (lines = []) => lines.reduce((sum, line) => sum + Number(line.amount || line.tsl || 0), 0);

const buildVoucherHeaderId = (voucher = {}) => (
  [voucher.belnr, voucher.bukrs, voucher.gjahr].filter(Boolean).join('-')
);

const getDefaultExpenseReimbursementNote = (main) => {
  const scenario = main.header_text || '凭证事项';
  if (main.blart === 'KZ') {
    return `本次费用报销说明：${scenario}，已依据供应商付款申请、发票信息和银行付款凭据完成复核。报销内容与采购或项目结算事项一致，付款金额、收款方户名、银行账号及过账期间已核对，相关支持材料已按凭证附件归档。`;
  }
  if (main.blart === 'KR') {
    return `本次费用报销说明：${scenario}，对应采购入库、供应商发票和应付暂估入账事项。费用归属部门、供应商信息、税额及金额口径已按审批资料核验，后续付款或冲销时需继续关联本凭证及附件。`;
  }
  return `本次费用报销说明：${scenario}，用于补充说明凭证入账背景、费用归属和附件依据。经核对，业务事由、公司主体、过账期间及金额口径与明细表一致，相关审批文件、合同或回单材料已纳入凭证支持附件。`;
};

const enrichVoucherMain = (main) => ({
  ...main,
  voucher_header_id: main.voucher_header_id || buildVoucherHeaderId(main),
  ai_summary: main.ai_summary || main.header_text || '凭证入账及附件归档',
  related_apply_doc_no: main.related_apply_doc_no || `AP-${main.gjahr}-${main.bukrs}-${main.belnr.slice(-4)}`,
  related_other_doc_no: main.related_other_doc_no || `REL-${main.bukrs}-${main.poper}-${main.belnr.slice(-4)}`,
  payee_name: main.payee_name || main.company_name,
  payee_code: main.payee_code || `PAYEE-${main.bukrs}`,
  reimburser_name: main.reimburser_name || '财务共享中心',
  xblnr: main.xblnr || `XBL-${main.gjahr}-${main.belnr}`,
  xref2_hd: main.xref2_hd || `XREF-${main.gjahr}-${main.belnr}`,
  expense_reimbursement_note: main.expense_reimbursement_note || getDefaultExpenseReimbursementNote(main),
});

const enrichVoucherLine = (line, main, index, direction) => ({
  prctr: `PC-${main.bukrs}`,
  profit_center_name: `${main.company_name}利润中心`,
  rfarea: 'F001',
  rcntr: `CC-${main.bukrs}-${main.poper}`,
  cost_center_name: `${main.company_name}成本中心`,
  department_name: '财务共享中心',
  department_code: `FIN-${main.bukrs}`,
  bldat: main.bldat,
  budat: main.budat,
  bktxt: main.header_text,
  txz01: line.text || main.header_text,
  xref1_hd: `REF-${main.belnr}`,
  xblnr: `XBL-${main.gjahr}-${main.belnr}`,
  rstgr: 'R01',
  aufnr: `IO-${main.bukrs}-${main.belnr.slice(-6)}`,
  internal_order_desc: main.header_text,
  ps_posid: `WBS-${main.bukrs}-${main.poper}`,
  wbs_desc: main.header_text,
  after_sales_case_no: `AS-${main.gjahr}-${main.belnr.slice(-4)}`,
  apply_reason: main.header_text,
  kunnr: `CUST-${main.bukrs}`,
  customer_name: main.company_name,
  kdauf: `SO-${main.gjahr}-${main.belnr.slice(-4)}`,
  matnr: `MAT-${main.bukrs}-${String(index + 1).padStart(3, '0')}`,
  maktx: line.text || main.header_text,
  ebeln: `PO-${main.gjahr}-${main.belnr.slice(-4)}`,
  ebelp: String((index + 1) * 10).padStart(4, '0'),
  lifnr: `SUP-${main.bukrs}`,
  supplier_name: main.company_name,
  xreversal: '否',
  rassc: `TP-${main.bukrs}`,
  budget_subject: direction === 'S' ? '项目收入/资产' : '应收应付/资金结算',
  ...line,
});

const enrichVoucherInvoice = (invoice, main, index, fallbackAmount) => {
  const amount = Number(invoice.amount || invoice.invoice_amount || fallbackAmount || 0);
  const taxRate = invoice.tax_rate || '13%';
  return {
    invoice_no: invoice.invoice_no || `INV-${main.gjahr}-${main.belnr}-${index + 1}`,
    invoice_type: invoice.invoice_type || (main.blart === 'KR' || main.blart === 'KZ' ? '采购增值税专用发票' : '销售增值税专用发票'),
    invoice_amount: invoice.invoice_amount || amount,
    tax_rate: taxRate,
    tax_amount: invoice.tax_amount || (taxRate === '0%' ? 0 : Math.round((amount / 1.13) * 0.13 * 100) / 100),
    invoice_date: invoice.invoice_date || main.bldat,
    ...invoice,
  };
};

const enrichVoucherPayment = (payment, main, index, fallbackAmount) => ({
  payment_no: payment.payment_no || payment.bill_no || `PAY-${main.gjahr}-${main.belnr}-${index + 1}`,
  payment_date: payment.payment_date || main.budat,
  bank_account: payment.bank_account || '财务共享中心结算账户',
  receipt_no: payment.receipt_no || payment.receiptNo || payment.payment_no || payment.bill_no || `RCPT-${main.gjahr}-${main.belnr}-${index + 1}`,
  payment_type: payment.payment_type || payment.paymentType || (payment.bill_no ? '承兑汇票' : '银行转账'),
  amount: payment.amount || fallbackAmount || 0,
  currency: payment.currency || main.waers || 'CNY',
  ...payment,
  account_code: payment.account_code || payment.racct || (payment.bill_no ? '112101' : '100201'),
  account_name: payment.account_name || payment.account_desc || (payment.bill_no ? '应收票据' : '银行存款'),
});

export const voucherList = [
  {
    voucher_key: '1000-2024-1000001234',
    belnr: '1000001234',
    gjahr: '2024',
    bukrs: '1000',
    company_name: '金石特电气有限公司',
    blart: 'SA',
    poper: '03',
  },
  {
    voucher_key: '1000-2024-1000001235',
    belnr: '1000001235',
    gjahr: '2024',
    bukrs: '1000',
    company_name: '金石特电气有限公司',
    blart: 'KR',
    poper: '04',
  },
  {
    voucher_key: '2000-2024-1000001234',
    belnr: '1000001234',
    gjahr: '2024',
    bukrs: '2000',
    company_name: '金石特智能装备有限公司',
    blart: 'DZ',
    poper: '03',
  },
  {
    voucher_key: '1000-2023-1000001234',
    belnr: '1000001234',
    gjahr: '2023',
    bukrs: '1000',
    company_name: '金石特电气有限公司',
    blart: 'SA',
    poper: '12',
  },
  {
    voucher_key: '3000-2024-1000002233',
    belnr: '1000002233',
    gjahr: '2024',
    bukrs: '3000',
    company_name: '金石特轨道交通设备有限公司',
    blart: 'KZ',
    poper: '05',
  },
];

voucherList.forEach((voucher) => {
  voucher.voucher_header_id = voucher.voucher_header_id || buildVoucherHeaderId(voucher);
});

export const voucherDetails = {
  '1000-2024-1000001234': {
    voucher_main: {
      voucher_key: '1000-2024-1000001234',
      belnr: '1000001234',
      gjahr: '2024',
      bukrs: '1000',
      company_name: '金石特电气有限公司',
      blart: 'SA',
      poper: '03',
      budat: '2024-03-28',
      bldat: '2024-03-26',
      waers: 'CNY',
      header_text: '南京地铁7号线项目回款入账',
    },
    debit_lines: [
      { line_no: '001', account_code: '100201', account_name: '银行存款-工行', amount: 1860000, currency: 'CNY', text: '收到南京地铁项目款' },
    ],
    credit_lines: [
      { line_no: '002', account_code: '112201', account_name: '应收账款-南京地铁集团', amount: 1860000, currency: 'CNY', text: '冲销应收账款' },
    ],
    invoice_details: [
      { invoice_no: 'VAT20240326001', invoice_date: '2024-03-26', amount: 1860000, tax_rate: '13%', customer_name: '南京地铁集团有限公司' },
    ],
    payment_details: [
      { payment_no: 'PAY20240328001', payment_date: '2024-03-28', bank_account: '工行南京分行 6222****9910', amount: 1860000 },
    ],
    voucher_attachments: [
      { attachment_id: 'vatt-001', attachment_type: VOUCHER_ATTACHMENT_TYPES.BANK_RECEIPT, file_name: '南京地铁7号线回款银行回单.pdf', file_format: 'pdf', status: 'normal', kass_path: '/kass/财务档案/凭证附件/2024/1000/1000001234/南京地铁7号线回款银行回单.pdf' },
      { attachment_id: 'vatt-002', attachment_type: VOUCHER_ATTACHMENT_TYPES.BOOKING_SUPPORT, file_name: '南京地铁7号线凭证支持类附件.pdf', file_format: 'pdf', status: 'normal', kass_path: '/kass/财务档案/凭证附件/2024/1000/1000001234/南京地铁7号线凭证支持类附件.pdf' },
      { attachment_id: 'vatt-003', attachment_type: VOUCHER_ATTACHMENT_TYPES.CONTRACT, file_name: '南京地铁7号线凭证支持类合同.pdf', file_format: 'pdf', status: 'normal', kass_path: '/kass/财务档案/凭证附件/2024/1000/1000001234/南京地铁7号线凭证支持类合同.pdf' },
    ],
  },
  '1000-2024-1000001235': {
    voucher_main: {
      voucher_key: '1000-2024-1000001235',
      belnr: '1000001235',
      gjahr: '2024',
      bukrs: '1000',
      company_name: '金石特电气有限公司',
      blart: 'KR',
      poper: '04',
      budat: '2024-04-12',
      bldat: '2024-04-10',
      waers: 'CNY',
      header_text: '上海电气原材料采购暂估',
    },
    debit_lines: [
      { line_no: '001', account_code: '140301', account_name: '原材料', amount: 420000, currency: 'CNY', text: '硅钢片采购入库' },
      { line_no: '002', account_code: '222101', account_name: '应交税费-进项税', amount: 54600, currency: 'CNY', text: '进项税额' },
    ],
    credit_lines: [
      { line_no: '003', account_code: '220201', account_name: '应付账款-上海电气', amount: 474600, currency: 'CNY', text: '供应商应付款' },
    ],
    invoice_details: [
      { invoice_no: 'PINV2024041008', invoice_date: '2024-04-10', amount: 474600, tax_rate: '13%', supplier_name: '上海电气集团股份有限公司' },
    ],
    payment_details: [],
    voucher_attachments: [],
  },
  '2000-2024-1000001234': {
    voucher_main: {
      voucher_key: '2000-2024-1000001234',
      belnr: '1000001234',
      gjahr: '2024',
      bukrs: '2000',
      company_name: '金石特智能装备有限公司',
      blart: 'DZ',
      poper: '03',
      budat: '2024-03-30',
      bldat: '2024-03-29',
      waers: 'CNY',
      header_text: '承兑汇票收款入账',
    },
    debit_lines: [
      { line_no: '001', account_code: '112101', account_name: '应收票据', amount: 980000, currency: 'CNY', text: '收到商业承兑汇票' },
    ],
    credit_lines: [
      { line_no: '002', account_code: '112201', account_name: '应收账款-深圳地铁集团', amount: 980000, currency: 'CNY', text: '冲销应收账款' },
    ],
    invoice_details: [
      { invoice_no: 'VAT20240329018', invoice_date: '2024-03-29', amount: 980000, tax_rate: '13%', customer_name: '深圳地铁集团有限公司' },
    ],
    payment_details: [
      { payment_no: 'BILL20240330002', payment_date: '2024-03-30', bill_no: 'ACPT-2024-0329-0088', amount: 980000 },
    ],
    voucher_attachments: [
      { attachment_id: 'vatt-004', attachment_type: VOUCHER_ATTACHMENT_TYPES.ACCEPTANCE_BILL, file_name: '深圳地铁商业承兑汇票.pdf', file_format: 'pdf', status: 'normal', kass_path: '/kass/财务档案/凭证附件/2024/2000/1000001234/深圳地铁商业承兑汇票.pdf' },
      { attachment_id: 'vatt-005', attachment_type: VOUCHER_ATTACHMENT_TYPES.APPROVAL_FILE, file_name: '承兑汇票收款审批文件.pdf', file_format: 'pdf', status: 'normal', kass_path: '/kass/财务档案/凭证附件/2024/2000/1000001234/承兑汇票收款审批文件.pdf' },
    ],
  },
  '1000-2023-1000001234': {
    voucher_main: {
      voucher_key: '1000-2023-1000001234',
      belnr: '1000001234',
      gjahr: '2023',
      bukrs: '1000',
      company_name: '金石特电气有限公司',
      blart: 'SA',
      poper: '12',
      budat: '2023-12-31',
      bldat: '2023-12-31',
      waers: 'CNY',
      header_text: '年末费用重分类调整',
    },
    debit_lines: [
      { line_no: '001', account_code: '660201', account_name: '管理费用', amount: 128000, currency: 'CNY', text: '费用重分类' },
    ],
    credit_lines: [
      { line_no: '002', account_code: '660101', account_name: '销售费用', amount: 128000, currency: 'CNY', text: '费用重分类转出' },
    ],
    invoice_details: [],
    payment_details: [],
    voucher_attachments: [
      { attachment_id: 'vatt-006', attachment_type: VOUCHER_ATTACHMENT_TYPES.BOOKING_SUPPORT, file_name: '年末费用重分类凭证支持类附件.pdf', file_format: 'pdf', status: 'failed', error_message: 'KASS文件同步失败，等待重新抓取', kass_path: '/kass/财务档案/凭证附件/2023/1000/1000001234/年末费用重分类凭证支持类附件.pdf' },
    ],
  },
  '3000-2024-1000002233': {
    voucher_main: {
      voucher_key: '3000-2024-1000002233',
      belnr: '1000002233',
      gjahr: '2024',
      bukrs: '3000',
      company_name: '金石特轨道交通设备有限公司',
      blart: 'KZ',
      poper: '05',
      budat: '2024-05-08',
      bldat: '2024-05-07',
      waers: 'CNY',
      header_text: '供应商货款支付',
    },
    debit_lines: [
      { line_no: '001', account_code: '220201', account_name: '应付账款-西电集团', amount: 756000, currency: 'CNY', text: '支付供应商货款' },
    ],
    credit_lines: [
      { line_no: '002', account_code: '100201', account_name: '银行存款-建行', amount: 756000, currency: 'CNY', text: '银行付款' },
    ],
    invoice_details: [
      { invoice_no: 'PINV2024050703', invoice_date: '2024-05-07', amount: 756000, tax_rate: '13%', supplier_name: '中国西电电气股份有限公司' },
    ],
    payment_details: [
      { payment_no: 'PAY20240508009', payment_date: '2024-05-08', bank_account: '建行西安分行 6227****1024', amount: 756000 },
    ],
    voucher_attachments: [
      { attachment_id: 'vatt-007', attachment_type: VOUCHER_ATTACHMENT_TYPES.BANK_RECEIPT, file_name: '西电集团付款银行回单.pdf', file_format: 'pdf', status: 'normal', kass_path: '/kass/财务档案/凭证附件/2024/3000/1000002233/西电集团付款银行回单.pdf' },
      { attachment_id: 'vatt-008', attachment_type: VOUCHER_ATTACHMENT_TYPES.APPROVAL_FILE, file_name: '供应商付款审批文件.pdf', file_format: 'pdf', status: 'normal', kass_path: '/kass/财务档案/凭证附件/2024/3000/1000002233/供应商付款审批文件.pdf' },
    ],
  },
};

Object.values(voucherDetails).forEach((detail) => {
  detail.voucher_main = enrichVoucherMain(detail.voucher_main || {});
  const main = detail.voucher_main;
  detail.debit_lines = (detail.debit_lines || []).map((line, index) => enrichVoucherLine(line, main, index, 'S'));
  detail.credit_lines = (detail.credit_lines || []).map((line, index) => enrichVoucherLine(line, main, index, 'H'));

  const fallbackAmount = sumLineAmount(detail.debit_lines) || sumLineAmount(detail.credit_lines);
  const invoices = detail.invoice_details && detail.invoice_details.length > 0
    ? detail.invoice_details
    : [{ invoice_no: `INV-${main.gjahr}-${main.belnr}-01`, invoice_date: main.bldat, amount: fallbackAmount, tax_rate: main.blart === 'SA' ? '0%' : '13%', customer_name: main.company_name }];
  const payments = detail.payment_details && detail.payment_details.length > 0
    ? detail.payment_details
    : [{ payment_no: `PAY-${main.gjahr}-${main.belnr}-01`, payment_date: main.budat, bank_account: '财务共享中心结算账户', amount: fallbackAmount }];

  detail.invoice_details = invoices.map((invoice, index) => enrichVoucherInvoice(invoice, main, index, fallbackAmount));
  detail.payment_details = payments.map((payment, index) => enrichVoucherPayment(payment, main, index, fallbackAmount));
});

voucherList.details = voucherDetails;
voucherList.voucherDetails = voucherDetails;

const voucherData = {
  vouchers: voucherList,
  details: voucherDetails,
  attachmentTypes: VOUCHER_ATTACHMENT_TYPES,
  voucherAttachmentTypes,
};

export default voucherData;
