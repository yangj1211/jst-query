import React, { useMemo } from 'react';
import { Tabs, Table, Tag } from 'antd';
import purchaseOrderRelations from '../data/purchaseOrderRelations';
import './OrderRelationsPanel.css';

/**
 * 采购订单关联单号面板
 * 5个tab：送货单号(srm)、销售单号(EKKN.vbeln)、交货单号(ZTMM0008K.vbeln)、
 *         报关单号(ZTMM0008K.bg_number)、批次号(MSEG.charg)
 * 交货单号与报关单号、批次号存在关联关系
 */
const PurchaseRelationsPanel = ({ purchaseOrderNo }) => {
  const relations = useMemo(() => {
    return purchaseOrderRelations[purchaseOrderNo] || {
      deliveryNotes: [], salesOrders: [], shipmentNotes: [],
      customsNumbers: [], batchNumbers: [],
      shipmentCustomsMap: {}, shipmentBatchMap: {},
    };
  }, [purchaseOrderNo]);

  // 送货单号（来自srm）
  const deliveryData = useMemo(() => {
    return relations.deliveryNotes.map((dn, idx) => ({ key: idx, deliveryNo: dn }));
  }, [relations]);

  // 销售单号（来自EKKN.vbeln）
  const salesData = useMemo(() => {
    return relations.salesOrders.map((so, idx) => ({ key: idx, salesOrderNo: so }));
  }, [relations]);

  // 交货单号（来自ZTMM0008K.vbeln），关联报关单号和批次号
  const shipmentData = useMemo(() => {
    return relations.shipmentNotes.map((sn, idx) => ({
      key: idx,
      shipmentNo: sn,
      customs: relations.shipmentCustomsMap[sn] || [],
      batches: relations.shipmentBatchMap[sn] || [],
    }));
  }, [relations]);

  // 报关单号（来自ZTMM0008K.bg_number），反向关联交货单号
  const customsData = useMemo(() => {
    const customsToShipment = {};
    Object.entries(relations.shipmentCustomsMap).forEach(([sn, customs]) => {
      customs.forEach((cn) => {
        if (!customsToShipment[cn]) customsToShipment[cn] = [];
        customsToShipment[cn].push(sn);
      });
    });
    return relations.customsNumbers.map((cn, idx) => ({
      key: idx, customsNo: cn, shipments: customsToShipment[cn] || [],
    }));
  }, [relations]);

  // 批次号（来自MSEG.charg），反向关联交货单号
  const batchData = useMemo(() => {
    const batchToShipment = {};
    Object.entries(relations.shipmentBatchMap).forEach(([sn, batches]) => {
      batches.forEach((bn) => {
        if (!batchToShipment[bn]) batchToShipment[bn] = [];
        batchToShipment[bn].push(sn);
      });
    });
    return relations.batchNumbers.map((bn, idx) => ({
      key: idx, batchNo: bn, shipments: batchToShipment[bn] || [],
    }));
  }, [relations]);

  const tabItems = [
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
            { title: '关联报关单号', dataIndex: 'customs', key: 'customs', render: (customs) => customs.length > 0 ? customs.map(c => <Tag key={c} color="orange">{c}</Tag>) : '-' },
            { title: '关联批次号', dataIndex: 'batches', key: 'batches', render: (batches) => batches.length > 0 ? batches.map(b => <Tag key={b} color="green">{b}</Tag>) : '-' },
          ]}
          dataSource={shipmentData}
          pagination={shipmentData.length > 10 ? { pageSize: 10, size: 'small' } : false}
          size="small" bordered locale={{ emptyText: '暂无交货单' }}
        />
      ),
    },
    {
      key: 'customs',
      label: `报关单号（${relations.customsNumbers.length}）`,
      children: (
        <Table
          columns={[
            { title: '报关单号', dataIndex: 'customsNo', key: 'customsNo' },
            { title: '关联交货单号', dataIndex: 'shipments', key: 'shipments', render: (shipments) => shipments.length > 0 ? shipments.map(s => <Tag key={s} color="blue">{s}</Tag>) : '-' },
          ]}
          dataSource={customsData}
          pagination={customsData.length > 10 ? { pageSize: 10, size: 'small' } : false}
          size="small" bordered locale={{ emptyText: '暂无报关单' }}
        />
      ),
    },
    {
      key: 'batch',
      label: `批次号（${relations.batchNumbers.length}）`,
      children: (
        <Table
          columns={[
            { title: '批次号', dataIndex: 'batchNo', key: 'batchNo' },
            { title: '关联交货单号', dataIndex: 'shipments', key: 'shipments', render: (shipments) => shipments.length > 0 ? shipments.map(s => <Tag key={s} color="blue">{s}</Tag>) : '-' },
          ]}
          dataSource={batchData}
          pagination={batchData.length > 10 ? { pageSize: 10, size: 'small' } : false}
          size="small" bordered locale={{ emptyText: '暂无批次号' }}
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
