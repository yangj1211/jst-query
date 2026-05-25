import React, { useMemo } from 'react';
import { Tabs, Table } from 'antd';
import purchaseOrderRelations from '../data/purchaseOrderRelations';
import './OrderRelationsPanel.css';

/**
 * 采购订单关联单号面板
 * 页签固定按：销售单号、交货单号、送货单号、会计凭证号、物料凭证号。
 */
const PurchaseRelationsPanel = ({ purchaseOrderNo }) => {
  const relations = useMemo(() => {
    return purchaseOrderRelations[purchaseOrderNo] || {
      salesOrders: [],
      shipmentNotes: [],
      deliveryNotes: [],
      accountingDocs: [],
      materialDocs: [],
    };
  }, [purchaseOrderNo]);

  // 销售单号（标准字段 sales_order_no）
  const salesData = useMemo(() => {
    return relations.salesOrders.map((so, idx) => ({ key: idx, salesOrderNo: so }));
  }, [relations]);

  // 交货单号（标准字段 delivery_order_no）
  const shipmentData = useMemo(() => {
    return relations.shipmentNotes.map((sn, idx) => ({
      key: idx,
      shipmentNo: sn,
    }));
  }, [relations]);

  // 送货单号（标准字段 shipping_note_no）
  const deliveryData = useMemo(() => {
    return relations.deliveryNotes.map((dn, idx) => ({ key: idx, deliveryNo: dn }));
  }, [relations]);

  // 会计凭证号（标准字段 accounting_doc_no）
  const accountingData = useMemo(() => {
    return (relations.accountingDocs || []).map((docNo, idx) => ({ key: idx, accountingDocNo: docNo }));
  }, [relations]);

  // 物料凭证号（标准字段 material_doc_no）
  const materialData = useMemo(() => {
    return (relations.materialDocs || []).map((docNo, idx) => ({ key: idx, materialDocNo: docNo }));
  }, [relations]);

  const tabItems = [
    {
      key: 'sales',
      label: `销售单号（${relations.salesOrders.length}）`,
      children: (
        <Table
          columns={[
            { title: '销售单号', dataIndex: 'salesOrderNo', key: 'salesOrderNo' },
          ]}
          dataSource={salesData}
          pagination={salesData.length > 10 ? { pageSize: 10, size: 'small' } : false}
          size="small" bordered locale={{ emptyText: '暂无关联销售单' }}
        />
      ),
    },
    {
      key: 'shipment',
      label: `交货单号（${relations.shipmentNotes.length}）`,
      children: (
        <Table
          columns={[
            { title: '交货单号', dataIndex: 'shipmentNo', key: 'shipmentNo' },
          ]}
          dataSource={shipmentData}
          pagination={shipmentData.length > 10 ? { pageSize: 10, size: 'small' } : false}
          size="small" bordered locale={{ emptyText: '暂无交货单' }}
        />
      ),
    },
    {
      key: 'delivery',
      label: `送货单号（${relations.deliveryNotes.length}）`,
      children: (
        <Table
          columns={[
            { title: '送货单号', dataIndex: 'deliveryNo', key: 'deliveryNo' },
          ]}
          dataSource={deliveryData}
          pagination={deliveryData.length > 10 ? { pageSize: 10, size: 'small' } : false}
          size="small" bordered locale={{ emptyText: '暂无送货单' }}
        />
      ),
    },
    {
      key: 'accounting',
      label: `会计凭证号（${accountingData.length}）`,
      children: (
        <Table
          columns={[
            { title: '会计凭证号', dataIndex: 'accountingDocNo', key: 'accountingDocNo' },
          ]}
          dataSource={accountingData}
          pagination={accountingData.length > 10 ? { pageSize: 10, size: 'small' } : false}
          size="small" bordered locale={{ emptyText: '暂无会计凭证号' }}
        />
      ),
    },
    {
      key: 'material',
      label: `物料凭证号（${materialData.length}）`,
      children: (
        <Table
          columns={[
            { title: '物料凭证号', dataIndex: 'materialDocNo', key: 'materialDocNo' },
          ]}
          dataSource={materialData}
          pagination={materialData.length > 10 ? { pageSize: 10, size: 'small' } : false}
          size="small" bordered locale={{ emptyText: '暂无物料凭证号' }}
        />
      ),
    },
  ];

  return (
    <div className="order-relations-panel">
      <Tabs items={tabItems} size="small" />
    </div>
  );
};

export default PurchaseRelationsPanel;
