/**
 * 采购订单明细子表数据（PDF 3.3.2 ~ 3.3.6）
 * 包含：订单明细、入库收货、发票明细、付款明细
 * 欠款数据由主表和付款/发票数据计算得出，不单独存储
 */

// ===== 订单明细表 (3.3.2) =====
const purchaseOrderDetails = {
  'PO2018-0001': [
    { key: '1', lineNo: '10', materialCode: 'ZL-REC-001', materialDesc: '整流机组主体', quantity: '2', unit: 'SET', netPrice: '2,200,000.00', priceUnit: '1', lineAmountExclTax: '4,400,000.00', taxRate: '13%', openDeliveryQty: '0', materialGroup: 'E001', materialGroupName: '整流设备', openInvoiceAmount: '0.00', itemText: '整流机组主体-R3线', assetNo: 'A-10001', glAccount: '5010100', internalOrder: 'IO-2018-001', profitCenter: '1617', salesOrder: '2018000740', salesOrderItem: '10' },
    { key: '2', lineNo: '20', materialCode: 'ZL-REC-002', materialDesc: '整流变压器', quantity: '2', unit: 'SET', netPrice: '850,000.00', priceUnit: '1', lineAmountExclTax: '1,700,000.00', taxRate: '13%', openDeliveryQty: '0', materialGroup: 'E001', materialGroupName: '整流设备', openInvoiceAmount: '0.00', itemText: '整流变压器-R3线', assetNo: 'A-10002', glAccount: '5010100', internalOrder: 'IO-2018-001', profitCenter: '1617', salesOrder: '2018000740', salesOrderItem: '20' },
  ],
  'PO2018-0002': [
    { key: '1', lineNo: '10', materialCode: 'ZL-INS-001', materialDesc: '绝缘组件套装', quantity: '50', unit: 'SET', netPrice: '32,000.00', priceUnit: '1', lineAmountExclTax: '1,600,000.00', taxRate: '13%', openDeliveryQty: '0', materialGroup: 'P001', materialGroupName: '绝缘材料', openInvoiceAmount: '0.00', itemText: '绝缘组件-R3线', assetNo: '', glAccount: '5010200', internalOrder: 'IO-2018-002', profitCenter: '1618', salesOrder: '2018000740', salesOrderItem: '30' },
    { key: '2', lineNo: '20', materialCode: 'ZL-SWG-001', materialDesc: '高压开关柜', quantity: '4', unit: 'EA', netPrice: '280,000.00', priceUnit: '1', lineAmountExclTax: '1,120,000.00', taxRate: '13%', openDeliveryQty: '0', materialGroup: 'E002', materialGroupName: '开关设备', openInvoiceAmount: '0.00', itemText: '开关柜-R3线', assetNo: 'A-10003', glAccount: '5010100', internalOrder: 'IO-2018-002', profitCenter: '1618', salesOrder: '2018000740', salesOrderItem: '40' },
  ],
  'PO2019-0003': [
    { key: '1', lineNo: '10', materialCode: 'RM-SIL-001', materialDesc: '硅钢片 B27R090', quantity: '8000', unit: 'KG', netPrice: '45.00', priceUnit: '1', lineAmountExclTax: '360,000.00', taxRate: '13%', openDeliveryQty: '0', materialGroup: 'M001', materialGroupName: '硅钢材料', openInvoiceAmount: '0.00', itemText: '硅钢片-5号线', assetNo: '', glAccount: '5020100', internalOrder: 'IO-2019-003', profitCenter: '2101', salesOrder: '2019001001', salesOrderItem: '10' },
    { key: '2', lineNo: '20', materialCode: 'RM-COP-001', materialDesc: '铜导线 TU2', quantity: '5000', unit: 'KG', netPrice: '72.00', priceUnit: '1', lineAmountExclTax: '360,000.00', taxRate: '13%', openDeliveryQty: '0', materialGroup: 'M002', materialGroupName: '铜材', openInvoiceAmount: '0.00', itemText: '铜导线-5号线', assetNo: '', glAccount: '5020100', internalOrder: 'IO-2019-003', profitCenter: '2101', salesOrder: '2019001001', salesOrderItem: '20' },
  ],
  'PO2023-0009': [
    { key: '1', lineNo: '10', materialCode: 'ZL-TRF-009', materialDesc: '整流变压器 ZSFP-5600/35', quantity: '3', unit: 'SET', netPrice: '1,200,000.00', priceUnit: '1', lineAmountExclTax: '3,600,000.00', taxRate: '13%', openDeliveryQty: '1', materialGroup: 'E001', materialGroupName: '整流设备', openInvoiceAmount: '1,200,000.00', itemText: '整流变压器-7号线', assetNo: 'A-20001', glAccount: '5010100', internalOrder: 'IO-2023-009', profitCenter: '6101', salesOrder: '2023001009', salesOrderItem: '10' },
    { key: '2', lineNo: '20', materialCode: 'ZL-DST-009', materialDesc: '配电设备组件', quantity: '6', unit: 'SET', netPrice: '180,000.00', priceUnit: '1', lineAmountExclTax: '1,080,000.00', taxRate: '13%', openDeliveryQty: '2', materialGroup: 'E002', materialGroupName: '配电设备', openInvoiceAmount: '360,000.00', itemText: '配电组件-7号线', assetNo: '', glAccount: '5010200', internalOrder: 'IO-2023-009', profitCenter: '6101', salesOrder: '2023001009', salesOrderItem: '20' },
  ],
};

// ===== 入库收货数据表 (3.3.3) =====
const purchaseReceiptData = {
  'PO2018-0001': [
    { key: '1', receiptDate: '2018-08-15', deliveryQty: '2', amountLocal: '4,968,000.00', materialDoc: 'MBLNR-2018-00101' },
    { key: '2', receiptDate: '2018-09-20', deliveryQty: '2', amountLocal: '1,921,000.00', materialDoc: 'MBLNR-2018-00102' },
  ],
  'PO2018-0002': [
    { key: '1', receiptDate: '2018-09-10', deliveryQty: '50', amountLocal: '1,808,000.00', materialDoc: 'MBLNR-2018-00201' },
    { key: '2', receiptDate: '2018-10-05', deliveryQty: '4', amountLocal: '1,265,600.00', materialDoc: 'MBLNR-2018-00202' },
  ],
  'PO2019-0003': [
    { key: '1', receiptDate: '2019-07-12', deliveryQty: '8000', amountLocal: '406,800.00', materialDoc: 'MBLNR-2019-00301' },
    { key: '2', receiptDate: '2019-08-05', deliveryQty: '5000', amountLocal: '406,800.00', materialDoc: 'MBLNR-2019-00302' },
  ],
  'PO2023-0009': [
    { key: '1', receiptDate: '2023-09-28', deliveryQty: '2', amountLocal: '2,712,000.00', materialDoc: 'MBLNR-2023-00901' },
  ],
};

// ===== 发票明细数据表 (3.3.4) =====
const purchaseInvoiceData = {
  'PO2018-0001': [
    { key: '1', systemSource: 'SAP', accountingDoc: '5100000101', verifyOrigDoc: '6000000101', fiscalYear: '2018', postingDate: '2018-10-15', invoiceAmount: '3,425,000.00', docNo: 'DN-2018-0001-01', invoiceDate: '2018-10-10', invoiceType: '增值税专用发票', invoiceNo: 'FP-2018-10001', taxRate: '13%', taxAmount: '394,026.55' },
    { key: '2', systemSource: 'SAP', accountingDoc: '5100000102', verifyOrigDoc: '6000000102', fiscalYear: '2018', postingDate: '2018-12-20', invoiceAmount: '3,425,000.00', docNo: 'DN-2018-0001-02', invoiceDate: '2018-12-15', invoiceType: '增值税专用发票', invoiceNo: 'FP-2018-10002', taxRate: '13%', taxAmount: '394,026.55' },
  ],
  'PO2018-0002': [
    { key: '1', systemSource: 'SAP', accountingDoc: '5100000201', verifyOrigDoc: '6000000201', fiscalYear: '2018', postingDate: '2018-11-20', invoiceAmount: '3,200,000.00', docNo: 'DN-2018-0002-01', invoiceDate: '2018-11-15', invoiceType: '增值税专用发票', invoiceNo: 'FP-2018-20001', taxRate: '13%', taxAmount: '368,141.59' },
  ],
  'PO2019-0003': [
    { key: '1', systemSource: 'SAP', accountingDoc: '5100000301', verifyOrigDoc: '6000000301', fiscalYear: '2019', postingDate: '2019-09-10', invoiceAmount: '2,800,000.00', docNo: 'DN-2019-0003-01', invoiceDate: '2019-09-05', invoiceType: '增值税专用发票', invoiceNo: 'FP-2019-30001', taxRate: '13%', taxAmount: '322,123.89' },
    { key: '2', systemSource: 'SAP', accountingDoc: '5100000302', verifyOrigDoc: '6000000302', fiscalYear: '2019', postingDate: '2019-11-25', invoiceAmount: '2,800,000.00', docNo: 'DN-2019-0003-02', invoiceDate: '2019-11-20', invoiceType: '增值税专用发票', invoiceNo: 'FP-2019-30002', taxRate: '13%', taxAmount: '322,123.89' },
  ],
  'PO2023-0009': [
    { key: '1', systemSource: 'SAP', accountingDoc: '5100000901', verifyOrigDoc: '6000000901', fiscalYear: '2023', postingDate: '2023-11-15', invoiceAmount: '3,120,000.00', docNo: 'DN-2023-0009-01', invoiceDate: '2023-11-10', invoiceType: '增值税专用发票', invoiceNo: 'FP-2023-90001', taxRate: '13%', taxAmount: '358,938.05' },
  ],
};

// ===== 付款明细数据表 (3.3.5) =====
const purchasePaymentData = {
  'PO2018-0001': [
    { key: '1', paymentType: '电汇', docDate: '2018-09-01', postingDate: '2018-09-01', amount: '2,055,000.00', tradeCurrencyAmount: '2,055,000.00', tradeCurrency: 'RMB', voucherNo: 'BELNR-2018-0001-P1', docNo: 'PAY-2018-0001-01', receiptNo: 'RC-2018-0001-01' },
    { key: '2', paymentType: '承兑汇票', docDate: '2018-11-15', postingDate: '2018-11-15', amount: '2,740,000.00', tradeCurrencyAmount: '2,740,000.00', tradeCurrency: 'RMB', voucherNo: 'BELNR-2018-0001-P2', docNo: 'PAY-2018-0001-02', receiptNo: 'RC-2018-0001-02' },
    { key: '3', paymentType: '电汇', docDate: '2019-01-20', postingDate: '2019-01-20', amount: '2,055,000.00', tradeCurrencyAmount: '2,055,000.00', tradeCurrency: 'RMB', voucherNo: 'BELNR-2018-0001-P3', docNo: 'PAY-2018-0001-03', receiptNo: 'RC-2018-0001-03' },
  ],
  'PO2018-0002': [
    { key: '1', paymentType: '电汇', docDate: '2018-10-01', postingDate: '2018-10-01', amount: '960,000.00', tradeCurrencyAmount: '960,000.00', tradeCurrency: 'RMB', voucherNo: 'BELNR-2018-0002-P1', docNo: 'PAY-2018-0002-01', receiptNo: 'RC-2018-0002-01' },
    { key: '2', paymentType: '电汇', docDate: '2019-01-10', postingDate: '2019-01-10', amount: '2,240,000.00', tradeCurrencyAmount: '2,240,000.00', tradeCurrency: 'RMB', voucherNo: 'BELNR-2018-0002-P2', docNo: 'PAY-2018-0002-02', receiptNo: 'RC-2018-0002-02' },
  ],
  'PO2019-0003': [
    { key: '1', paymentType: '承兑汇票', docDate: '2019-08-15', postingDate: '2019-08-15', amount: '1,680,000.00', tradeCurrencyAmount: '1,680,000.00', tradeCurrency: 'RMB', voucherNo: 'BELNR-2019-0003-P1', docNo: 'PAY-2019-0003-01', receiptNo: 'RC-2019-0003-01' },
    { key: '2', paymentType: '电汇', docDate: '2019-12-20', postingDate: '2019-12-20', amount: '3,920,000.00', tradeCurrencyAmount: '3,920,000.00', tradeCurrency: 'RMB', voucherNo: 'BELNR-2019-0003-P2', docNo: 'PAY-2019-0003-02', receiptNo: 'RC-2019-0003-02' },
  ],
  'PO2023-0009': [
    { key: '1', paymentType: '电汇', docDate: '2023-10-20', postingDate: '2023-10-20', amount: '1,560,000.00', tradeCurrencyAmount: '1,560,000.00', tradeCurrency: 'RMB', voucherNo: 'BELNR-2023-0009-P1', docNo: 'PAY-2023-0009-01', receiptNo: 'RC-2023-0009-01' },
  ],
};

export { purchaseOrderDetails, purchaseReceiptData, purchaseInvoiceData, purchasePaymentData };
