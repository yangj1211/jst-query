/**
 * 采购订单关联单号数据
 * 字段来源：
 * - 送货单号：以采购订单号为维度，查询srm下的送货单号
 * - 销售单号：以ebeln为维度，查询EKKN.vbeln
 * - 交货单号：以ebeln为维度，查询ZTMM0008K.vbeln
 * - 报关单号：以ebeln为维度，查询ZTMM0008K.bg_number（与交货单号关联）
 * - 批次号：以ebeln为维度，查询MSEG.charg（与交货单号关联）
 */
const purchaseOrderRelations = {
  'PO2018-0001': {
    deliveryNotes: ['SRM-DN-2018-0001-01', 'SRM-DN-2018-0001-02'],
    salesOrders: ['2018000740'],
    shipmentNotes: ['SHIP-2018-0001-01', 'SHIP-2018-0001-02'],
    customsNumbers: ['BG-2018-JN-00156', 'BG-2018-JN-00157'],
    batchNumbers: ['CHARG-2018-0001-A', 'CHARG-2018-0001-B'],
    shipmentCustomsMap: {
      'SHIP-2018-0001-01': ['BG-2018-JN-00156'],
      'SHIP-2018-0001-02': ['BG-2018-JN-00157'],
    },
    shipmentBatchMap: {
      'SHIP-2018-0001-01': ['CHARG-2018-0001-A'],
      'SHIP-2018-0001-02': ['CHARG-2018-0001-B'],
    },
  },
  'PO2018-0002': {
    deliveryNotes: ['SRM-DN-2018-0002-01'],
    salesOrders: ['2018000740'],
    shipmentNotes: ['SHIP-2018-0002-01'],
    customsNumbers: ['BG-2018-JN-00201'],
    batchNumbers: ['CHARG-2018-0002-A'],
    shipmentCustomsMap: {
      'SHIP-2018-0002-01': ['BG-2018-JN-00201'],
    },
    shipmentBatchMap: {
      'SHIP-2018-0002-01': ['CHARG-2018-0002-A'],
    },
  },
  'PO2019-0003': {
    deliveryNotes: ['SRM-DN-2019-0003-01', 'SRM-DN-2019-0003-02', 'SRM-DN-2019-0003-03'],
    salesOrders: ['2019001001'],
    shipmentNotes: ['SHIP-2019-0003-01', 'SHIP-2019-0003-02'],
    customsNumbers: ['BG-2019-CD-00089', 'BG-2019-CD-00090'],
    batchNumbers: ['CHARG-2019-0003-A', 'CHARG-2019-0003-B', 'CHARG-2019-0003-C'],
    shipmentCustomsMap: {
      'SHIP-2019-0003-01': ['BG-2019-CD-00089'],
      'SHIP-2019-0003-02': ['BG-2019-CD-00090'],
    },
    shipmentBatchMap: {
      'SHIP-2019-0003-01': ['CHARG-2019-0003-A', 'CHARG-2019-0003-B'],
      'SHIP-2019-0003-02': ['CHARG-2019-0003-C'],
    },
  },
  'PO2019-0004': {
    deliveryNotes: ['SRM-DN-2019-0004-01'],
    salesOrders: ['2019001002'],
    shipmentNotes: ['SHIP-2019-0004-01'],
    customsNumbers: ['BG-2019-CD-00123'],
    batchNumbers: ['CHARG-2019-0004-A'],
    shipmentCustomsMap: {
      'SHIP-2019-0004-01': ['BG-2019-CD-00123'],
    },
    shipmentBatchMap: {
      'SHIP-2019-0004-01': ['CHARG-2019-0004-A'],
    },
  },
  'PO2020-0005': {
    deliveryNotes: ['SRM-DN-2020-0005-01', 'SRM-DN-2020-0005-02'],
    salesOrders: ['2020001003'],
    shipmentNotes: ['SHIP-2020-0005-01', 'SHIP-2020-0005-02'],
    customsNumbers: ['BG-2020-SZ-00045', 'BG-2020-SZ-00046'],
    batchNumbers: ['CHARG-2020-0005-A', 'CHARG-2020-0005-B'],
    shipmentCustomsMap: {
      'SHIP-2020-0005-01': ['BG-2020-SZ-00045'],
      'SHIP-2020-0005-02': ['BG-2020-SZ-00046'],
    },
    shipmentBatchMap: {
      'SHIP-2020-0005-01': ['CHARG-2020-0005-A'],
      'SHIP-2020-0005-02': ['CHARG-2020-0005-B'],
    },
  },
  'PO2020-0006': {
    deliveryNotes: ['SRM-DN-2020-0006-01'],
    salesOrders: ['2020001004'],
    shipmentNotes: ['SHIP-2020-0006-01'],
    customsNumbers: ['BG-2020-SZ-00078'],
    batchNumbers: ['CHARG-2020-0006-A'],
    shipmentCustomsMap: {
      'SHIP-2020-0006-01': ['BG-2020-SZ-00078'],
    },
    shipmentBatchMap: {
      'SHIP-2020-0006-01': ['CHARG-2020-0006-A'],
    },
  },
  'PO2021-0007': {
    deliveryNotes: ['SRM-DN-2021-0007-01', 'SRM-DN-2021-0007-02'],
    salesOrders: ['2021001005'],
    shipmentNotes: ['SHIP-2021-0007-01', 'SHIP-2021-0007-02'],
    customsNumbers: ['BG-2021-WH-00034', 'BG-2021-WH-00035'],
    batchNumbers: ['CHARG-2021-0007-A', 'CHARG-2021-0007-B'],
    shipmentCustomsMap: {
      'SHIP-2021-0007-01': ['BG-2021-WH-00034'],
      'SHIP-2021-0007-02': ['BG-2021-WH-00035'],
    },
    shipmentBatchMap: {
      'SHIP-2021-0007-01': ['CHARG-2021-0007-A'],
      'SHIP-2021-0007-02': ['CHARG-2021-0007-B'],
    },
  },
  'PO2022-0008': {
    deliveryNotes: ['SRM-DN-2022-0008-01'],
    salesOrders: ['2022001007'],
    shipmentNotes: ['SHIP-2022-0008-01'],
    customsNumbers: ['BG-2022-QH-00012'],
    batchNumbers: ['CHARG-2022-0008-A'],
    shipmentCustomsMap: {
      'SHIP-2022-0008-01': ['BG-2022-QH-00012'],
    },
    shipmentBatchMap: {
      'SHIP-2022-0008-01': ['CHARG-2022-0008-A'],
    },
  },
  'PO2023-0009': {
    deliveryNotes: ['SRM-DN-2023-0009-01'],
    salesOrders: ['2023001009'],
    shipmentNotes: ['SHIP-2023-0009-01'],
    customsNumbers: ['BG-2023-NJ-00067'],
    batchNumbers: ['CHARG-2023-0009-A'],
    shipmentCustomsMap: {
      'SHIP-2023-0009-01': ['BG-2023-NJ-00067'],
    },
    shipmentBatchMap: {
      'SHIP-2023-0009-01': ['CHARG-2023-0009-A'],
    },
  },
  'PO2023-0010': {
    deliveryNotes: ['SRM-DN-2023-0010-01', 'SRM-DN-2023-0010-02'],
    salesOrders: ['2023001010'],
    shipmentNotes: ['SHIP-2023-0010-01'],
    customsNumbers: ['BG-2023-GZ-00089'],
    batchNumbers: ['CHARG-2023-0010-A', 'CHARG-2023-0010-B'],
    shipmentCustomsMap: {
      'SHIP-2023-0010-01': ['BG-2023-GZ-00089'],
    },
    shipmentBatchMap: {
      'SHIP-2023-0010-01': ['CHARG-2023-0010-A', 'CHARG-2023-0010-B'],
    },
  },
  'PO2024-0011': {
    deliveryNotes: ['SRM-DN-2024-0011-01'],
    salesOrders: ['2024001012'],
    shipmentNotes: ['SHIP-2024-0011-01'],
    customsNumbers: ['BG-2024-ZH-00023'],
    batchNumbers: ['CHARG-2024-0011-A'],
    shipmentCustomsMap: {
      'SHIP-2024-0011-01': ['BG-2024-ZH-00023'],
    },
    shipmentBatchMap: {
      'SHIP-2024-0011-01': ['CHARG-2024-0011-A'],
    },
  },
  'PO2024-0012': {
    deliveryNotes: [],
    salesOrders: ['2024001014'],
    shipmentNotes: [],
    customsNumbers: [],
    batchNumbers: [],
    shipmentCustomsMap: {},
    shipmentBatchMap: {},
  },
};

export default purchaseOrderRelations;
