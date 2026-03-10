import React, { useMemo } from 'react';
import { Tabs, Table, Tag } from 'antd';
import orderRelations from '../data/orderRelations';
import './OrderRelationsPanel.css';

const OrderRelationsPanel = ({ orderNo }) => {
  const relations = useMemo(() => {
    return orderRelations[orderNo] || {
      deliveryNotes: [],
      batchNumbers: [],
      returnOrders: [],
      deliveryBatchMap: {},
      deliveryCustomsMap: {},
    };
  }, [orderNo]);

  const deliveryData = useMemo(() => {
    return relations.deliveryNotes.map((dn, idx) => ({
      key: idx,
      deliveryNo: dn,
      batches: relations.deliveryBatchMap[dn] || [],
      customs: relations.deliveryCustomsMap[dn] || [],
    }));
  }, [relations]);

  const batchData = useMemo(() => {
    const batchToDelivery = {};
    Object.entries(relations.deliveryBatchMap).forEach(([dn, batches]) => {
      batches.forEach((bn) => {
        if (!batchToDelivery[bn]) batchToDelivery[bn] = [];
        batchToDelivery[bn].push(dn);
      });
    });
    return relations.batchNumbers.map((bn, idx) => ({
      key: idx,
      batchNo: bn,
      deliveries: batchToDelivery[bn] || [],
    }));
  }, [relations]);

  const returnData = useMemo(() => {
    return relations.returnOrders.map((ro, idx) => ({
      key: idx,
      returnNo: ro,
    }));
  }, [relations]);

  // 收集所有报关单号并反向映射到交货单
  const customsData = useMemo(() => {
    const customsToDelivery = {};
    Object.entries(relations.deliveryCustomsMap || {}).forEach(([dn, customs]) => {
      customs.forEach((cn) => {
        if (!customsToDelivery[cn]) customsToDelivery[cn] = [];
        customsToDelivery[cn].push(dn);
      });
    });
    const allCustoms = Object.keys(customsToDelivery);
    return allCustoms.map((cn, idx) => ({
      key: idx,
      customsNo: cn,
      deliveries: customsToDelivery[cn] || [],
    }));
  }, [relations]);

  const tabItems = [
    {
      key: 'delivery',
      label: `交货单号（${relations.deliveryNotes.length}）`,
      children: (
        <Table
          columns={[
            { title: '交货单号', dataIndex: 'deliveryNo', key: 'deliveryNo' },
            { title: '关联批次号', dataIndex: 'batches', key: 'batches', render: (batches) => batches.length > 0 ? batches.map(b => <Tag key={b} color="green">{b}</Tag>) : '-' },
            { title: '关联报关单号', dataIndex: 'customs', key: 'customs', render: (customs) => customs.length > 0 ? customs.map(c => <Tag key={c} color="orange">{c}</Tag>) : '-' },
          ]}
          dataSource={deliveryData}
          pagination={deliveryData.length > 10 ? { pageSize: 10, size: 'small' } : false}
          size="small"
          bordered
          locale={{ emptyText: '暂无交货单' }}
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
            { title: '关联交货单号', dataIndex: 'deliveries', key: 'deliveries', render: (deliveries) => deliveries.length > 0 ? deliveries.map(d => <Tag key={d} color="blue">{d}</Tag>) : '-' },
          ]}
          dataSource={batchData}
          pagination={batchData.length > 10 ? { pageSize: 10, size: 'small' } : false}
          size="small"
          bordered
          locale={{ emptyText: '暂无批次号' }}
        />
      ),
    },
    {
      key: 'return',
      label: `退货单号（${relations.returnOrders.length}）`,
      children: (
        <Table
          columns={[
            { title: '退货单号', dataIndex: 'returnNo', key: 'returnNo' },
          ]}
          dataSource={returnData}
          pagination={returnData.length > 10 ? { pageSize: 10, size: 'small' } : false}
          size="small"
          bordered
          locale={{ emptyText: '暂无退货单' }}
        />
      ),
    },
    {
      key: 'customs',
      label: `报关单号（${customsData.length}）`,
      children: (
        <Table
          columns={[
            { title: '报关单号', dataIndex: 'customsNo', key: 'customsNo' },
            { title: '关联交货单号', dataIndex: 'deliveries', key: 'deliveries', render: (deliveries) => deliveries.length > 0 ? deliveries.map(d => <Tag key={d} color="blue">{d}</Tag>) : '-' },
          ]}
          dataSource={customsData}
          pagination={customsData.length > 10 ? { pageSize: 10, size: 'small' } : false}
          size="small"
          bordered
          locale={{ emptyText: '暂无报关单' }}
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

export default OrderRelationsPanel;
