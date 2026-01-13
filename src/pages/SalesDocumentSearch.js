import React, { useState, useMemo } from 'react';
import { Button, Checkbox, Tag, Input, List, Tooltip, Pagination, Modal, Table, Select, message } from 'antd';
import { 
  SyncOutlined, 
  RightOutlined, 
  PlusOutlined, 
  EyeOutlined, 
  InfoCircleOutlined, 
  DownloadOutlined, 
  HistoryOutlined,
  UpOutlined,
  DownOutlined
} from '@ant-design/icons';
import './SalesDocumentSearch.css';

const { TextArea } = Input;
const { Option } = Select;

// 有权限的文件类型列表
const authorizedDocumentTypes = ['合同', '发票', '通电验收单'];

// 模拟数据
const mockResults = [
  {
    id: 1,
    title: '济南市轨道交通R3线工程供电系统设备牵引整流机组及配电变压器',
    customer: '济南轨道交通集团有限公司',
    poDate: '2018.04.26',
    amount: '20716532',
    currency: 'RMB',
    documents: [
      { id: 'doc1', type: 'pdf', name: '2018000740济南地铁...', tag: '中标通知书', tagColor: 'blue', path: '/user/kass/公司文档/营销/销售/01国内干变/合同/2018年合同/...' },
      { id: 'doc2', type: 'pdf', name: '2078000740济南地铁R3号线一期工...', tag: '合同', tagColor: 'green', path: '/user/kass/公司文档/营销/销售/01国内干变/合同/2018年合同/...' },
      { id: 'doc3', type: 'pdf', name: '2018000740济南地铁R3线---中航通...', tag: '合同', tagColor: 'green', path: '/user/kass/公司文档/营销/销售/01国内干变/合同/2018年合同/...' },
      { id: 'doc4', type: 'image', name: '1742917077466_0221760146001931...', tag: '发票', tagColor: 'purple', path: '/user/kass/财务文档/发票/2018/...' },
      { id: 'doc5', type: 'image', name: '00738896.jpg', tag: '发票', tagColor: 'purple', path: '/user/kass/财务文档/发票/2018/...' },
      { id: 'doc6', type: 'pdf', name: '(运行证明) 2018000740济南市轨道...', tag: '运行证明', tagColor: 'orange', path: '/user/kass/项目文档/证明文件/...' },
      { id: 'doc7', type: 'pdf', name: '年度合作协议-2018.pdf', tag: '年度合作协议', tagColor: 'cyan', path: '/user/kass/公司文档/合作协议/...' },
      { id: 'doc8', type: 'pdf', name: '框架协议-济南轨道交通.pdf', tag: '框架协议', tagColor: 'geekblue', path: '/user/kass/公司文档/合作协议/...' },
      { id: 'doc9', type: 'pdf', name: '报价单-R3线变压器.pdf', tag: '报价单', tagColor: 'magenta', path: '/user/kass/项目文档/报价单/...' },
      { id: 'doc10', type: 'pdf', name: '到货签收单-001.pdf', tag: '到货签收单', tagColor: 'volcano', path: '/user/kass/物流文档/签收单/...' },
      { id: 'doc11', type: 'pdf', name: '竣工决算单-R3.pdf', tag: '竣工决算单', tagColor: 'gold', path: '/user/kass/财务文档/决算/...' },
      { id: 'doc12', type: 'pdf', name: '运输单-201805.pdf', tag: '运输单', tagColor: 'lime', path: '/user/kass/物流文档/运输单/...' },
    ]
  },
  {
    id: 2,
    title: '郑州市轨道交通2号线一期工程供电系统04标I整流变压器、整流器及配电',
    customer: '郑州地铁集团有限公司',
    poDate: '2014.06.24',
    amount: '15977222',
    currency: 'RMB',
    documents: []
  },
  {
    id: 3,
    title: '郑州市南四环至郑州南站城郊铁路工程（续建高速站至机场站）及郑州市机',
    customer: '郑州地铁集团有限公司',
    poDate: '2016.01.05',
    amount: '9160000',
    currency: 'RMB',
    documents: []
  },
  {
    id: 4,
    title: '北京地铁14号线工程牵引整流机组及配电变压器采购项目',
    customer: '北京京港地铁有限公司',
    poDate: '2012-03-31',
    amount: '5600840',
    currency: 'CNY',
    documents: []
  },
  {
    id: 5,
    title: '新疆甘泉堡神信物流公司翻车机及配套系统',
    customer: '大连华锐重工集团股份有限公司',
    poDate: '2014-07-23',
    amount: '336000',
    currency: 'CNY',
    documents: []
  },
  {
    id: 6,
    title: '临城、唐县并网光伏电站变',
    customer: '国投集团建设有限公司',
    poDate: '2014-09-17',
    amount: '1117500',
    currency: 'CNY',
    documents: []
  },
];

const SalesDocumentSearch = () => {
  const [expandedItems, setExpandedItems] = useState([1]); // 默认展开第一项
  const [detailVisible, setDetailVisible] = useState(false);
  const [detailItem, setDetailItem] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10); // 默认每页10条
  const [selectedItems, setSelectedItems] = useState([]); // 选中的项目ID列表
  const [selectedDocumentTypes, setSelectedDocumentTypes] = useState(['__ALL__']); // 选中的文件类型（默认全部）
  
  // 提取所有唯一的文件类型
  const allDocumentTypes = useMemo(() => {
    const typesSet = new Set();
    mockResults.forEach(item => {
      if (item.documents && item.documents.length > 0) {
        item.documents.forEach(doc => {
          typesSet.add(doc.tag);
        });
      }
    });
    return Array.from(typesSet).sort();
  }, []);
  
  // 计算分页后的数据
  const paginatedResults = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    const end = start + pageSize;
    return mockResults.slice(start, end);
  }, [currentPage, pageSize]);
  
  // 当前页是否全选
  const isAllSelected = useMemo(() => {
    if (paginatedResults.length === 0) return false;
    return paginatedResults.every(item => selectedItems.includes(item.id));
  }, [paginatedResults, selectedItems]);
  
  // 部分选中（用于全选checkbox的indeterminate状态）
  const isIndeterminate = useMemo(() => {
    const selectedInPage = paginatedResults.filter(item => selectedItems.includes(item.id)).length;
    return selectedInPage > 0 && selectedInPage < paginatedResults.length;
  }, [paginatedResults, selectedItems]);
  
  // 处理单个项目的选中/取消选中
  const handleItemSelect = (itemId, checked) => {
    if (checked) {
      setSelectedItems(prev => [...prev, itemId]);
    } else {
      setSelectedItems(prev => prev.filter(id => id !== itemId));
    }
  };
  
  // 处理全选/取消全选
  const handleSelectAll = (checked) => {
    if (checked) {
      const currentPageIds = paginatedResults.map(item => item.id);
      setSelectedItems(prev => {
        const newSelected = [...prev];
        currentPageIds.forEach(id => {
          if (!newSelected.includes(id)) {
            newSelected.push(id);
          }
        });
        return newSelected;
      });
    } else {
      const currentPageIds = paginatedResults.map(item => item.id);
      setSelectedItems(prev => prev.filter(id => !currentPageIds.includes(id)));
    }
  };
  
  // 处理批量下载
  const handleBatchDownload = () => {
    if (selectedItems.length === 0) {
      message.warning('请先选择要下载的订单');
      return;
    }
    const selectedProjects = mockResults.filter(item => selectedItems.includes(item.id));
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

  const renderDocumentItem = (doc) => (
    <div key={doc.id} className="document-item">
      <div className="document-info">
        <span className="doc-name">{doc.name}</span>
        <Tag color={doc.tagColor}>{doc.tag}</Tag>
      </div>
      <div className="document-actions">
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

  // 详情数据（示例，来自截图）
  const getDetailData = (item) => {
    return {
      baseInfo: [
        // 按用户提供的字段顺序完整展示
        { label: '销售订单', value: '2012000553' },
        { label: '最终用户行业', value: '高端装备-轨道交通' },
        { label: '最终用户行业描述', value: '交通运输-轨道交通' },
        { label: '2012000553', value: '' }, // 占位（原文中重复编号）
        { label: '18', value: '' },
        { label: '交通运输-轨道交通', value: '' },
        { label: '凭证日期', value: '2012-03-31' },
        { label: '凭证类型', value: 'ZOR1' },
        { label: '采购订单日期', value: '2012-03-31' },
        { label: '客户合同编号', value: '' },
        { label: '售达方', value: '0001000518' },
        { label: '客户名称', value: '北京京港地铁有限公司' },
        { label: '工程项目名称', value: '北京地铁14号线工程牵引整流机组及配电变压器采购项目' },
        { label: '合同总金额（订单货币）', value: '5600840.00' },
        { label: '合同总金额(CNY)', value: '5600840.00' },
        { label: '货币', value: 'CNY' },
        { label: '销售代表处', value: '1618' },
        { label: '销售代表处描述', value: '雄安营销中心' },
        { label: '销售代表', value: '162' },
        { label: '销售代表描述', value: '雄安-刘福松' },
        { label: '销售地区', value: 'CN0002' },
        { label: '销售地区描述', value: '华北地区' },
        { label: '分销渠道', value: '40' },
        { label: '分销渠道描述', value: '国内销售' },
        { label: '订单联系人', value: '' },
        { label: '客户业务联系人', value: '' },
        { label: '客户财务联系人', value: '' },
        { label: '交货城市', value: '北京市' },
        { label: '交货省份', value: '北京' },
        { label: '交货联系人1', value: '刘亚军（13241401248/18811533630）' },
        { label: '交货联系人2', value: '王凯13717821362' },
        { label: '实际出口国家', value: '中国' },
        { label: '质保期备注', value: '' },
        { label: '是否投标', value: '是' },
        { label: '是否收到合同原件', value: '是' },
        { label: '控股方', value: '北京首都创业集团有限公司' },
        { label: '用户行业(披露口径)', value: '25' },
        { label: '用户行业(披露口径)描述', value: '高端装备-轨道交通' },
        { label: '合同是否有约定保密条款', value: '否' },
        { label: '最终用户行业二类', value: '高端装备-轨道交通' },
        { label: '月份', value: '3' },
        { label: '客户所在国家', value: '中国' },
        { label: '项目交付国家', value: '中国' },
        { label: '周', value: '201213' },
        { label: '销售方式描述', value: '直销' },
        { label: '销售渠道', value: '内销' },
        { label: '报价单编号', value: '' },
        { label: '设计图号', value: '' },
        { label: '客户所在省份', value: '北京' },
        { label: '凭证类型描述', value: 'JST 标准订单' },
        { label: '订单金额合计(订单货币)', value: '5600840.00' },
        { label: '订单金额合计(CNY)', value: '5600840.00' },
        { label: '订单不含税金额合计', value: '4956495.60' },
        { label: '订单不含税金额合计(CNY)', value: '4956495.60' },
        { label: '最终用户行业三类', value: '高端装备-轨道交通' },
        { label: '最终用户行业一类', value: '高端装备' },
        { label: 'VAT发票号', value: '' },
        { label: 'VAT发票时间', value: '' },
        { label: 'VAT发票税率', value: '' },
        { label: 'VAT发票金额', value: '33387921.00' },
        { label: '合同差额', value: '0.00' },
        { label: '发票差额', value: '34806327.00' },
        { label: 'VAT发票种类', value: '' },
        { label: 'VAT发票代码', value: '' },
        { label: '销售折扣%', value: '55.92' },
        { label: '安装通电验收单状态', value: '' },
        { label: '付款条件备注', value: '17.4 付款以人民币进行支付。卖方应在合同签订后十（10）天内提交履约担保，由此卖方引发的银行费用由卖方承担。买方应向卖方提供支付保证。17.5 支付进度……（示例）' },
        { label: '不合理请求', value: '' },
        { label: '订单原因', value: '' },
        { label: '合同确认书编号', value: '' },
      ],
      items: [
        { key: '1', no: 35, line: 590, model: '-', spec: '0.00', materialNo: '914010000001', desc: '技术服务及设计联络费', capacity: '-', firstDate: '2026-12-01', price: '198080.00' },
        { key: '2', no: 5, line: 980, model: 'SCBH15-1250/10.5', spec: '1250.00', materialNo: '310117865001', desc: '干变 SCBH15-1250/10.5 ZB.011786.5001', capacity: '2500', firstDate: '2020-12-28', price: '174270.00' },
        { key: '3', no: 17, line: 990, model: '-', spec: '0.00', materialNo: '590500001203', desc: '钢外壳 散装 2WK.024.29524', capacity: '-', firstDate: '2021-06-03', price: '0.00' },
        { key: '4', no: 27, line: 1000, model: '0', spec: '0.00', materialNo: '120301001513', desc: '温控120301001513 20-GT-32669', capacity: '-', firstDate: '2020-12-28', price: '0.00' },
        { key: '5', no: 6, line: 1020, model: 'SCBH15-1250/10.5', spec: '1250.00', materialNo: '310117865002', desc: '干变 SCBH15-1250/10.5 ZB.011786.5002', capacity: '2500', firstDate: '2021-04-10', price: '174270.00' },
      ],
    };
  };

  const itemColumns = [
    { title: 'NO.', dataIndex: 'no', key: 'no', width: 80 },
    { title: '行项目', dataIndex: 'line', key: 'line', width: 100 },
    { title: '型号', dataIndex: 'model', key: 'model', width: 160 },
    { title: '规格', dataIndex: 'spec', key: 'spec', width: 100, align: 'right' },
    { title: '物料号', dataIndex: 'materialNo', key: 'materialNo', width: 160 },
    { title: '物料描述', dataIndex: 'desc', key: 'desc' },
    { title: '装机容量', dataIndex: 'capacity', key: 'capacity', width: 120, align: 'right' },
    { title: '首个请求交货日', dataIndex: 'firstDate', key: 'firstDate', width: 160 },
    { title: '合同单价', dataIndex: 'price', key: 'price', width: 140, align: 'right' },
  ];

  return (
    <div className="sales-search-page">
      {/* Left Panel */}
      <div className="search-chat-panel">
        <div className="chat-panel-header">
          <div className="header-actions">
            <Button type="text" icon={<HistoryOutlined />}>历史记录</Button>
            <Button type="text" icon={<PlusOutlined />} />
          </div>
        </div>
        <div className="chat-panel-body">
          <div className="chat-message user">
            轨道交通行业有中标通知书的项目
          </div>
          <div className="chat-message ai">
            共为您找到 41 条相关结果。
            <br/>
            本次查询使用了 <Tag>最终用户行业描述</Tag>, <Tag>文档类别</Tag> 字段。
            <br/>
            请问您还想通过哪些字段查找呢？
          </div>
        </div>
        <div className="chat-panel-footer">
          <TextArea placeholder="输入..." autoSize={{ minRows: 1, maxRows: 4 }} />
          <Button type="primary" shape="circle" icon={<RightOutlined />} />
        </div>
      </div>

      {/* Right Panel */}
      <div className="search-results-panel">
        <div className="results-header">
          <div className="results-header-left">
            <Checkbox
              checked={isAllSelected}
              indeterminate={isIndeterminate}
              onChange={(e) => handleSelectAll(e.target.checked)}
            >
              全选
            </Checkbox>
            <span>找到 41 个结果</span>
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
              {allDocumentTypes.map(type => {
                const isAuthorized = authorizedDocumentTypes.includes(type);
                return (
                  <Option key={type} value={type} className={isAuthorized ? 'authorized-option' : ''}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                      <span>{type}</span>
                      {isAuthorized && (
                        <Tag color="success" style={{ margin: 0, fontSize: '11px', lineHeight: '16px', padding: '0 6px' }}>
                          有权限
                        </Tag>
                      )}
                    </div>
                  </Option>
                );
              })}
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
              <div className="result-item-wrapper">
                <div className="result-item-header">
                  <div className="result-item-title-group">
                    <Checkbox
                      checked={selectedItems.includes(item.id)}
                      onChange={(e) => handleItemSelect(item.id, e.target.checked)}
                    />
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
                      <Button type="text" icon={expandedItems.includes(item.id) ? <UpOutlined /> : <DownOutlined />} onClick={() => toggleExpand(item.id)} />
                    </Tooltip>
                  </div>
                </div>
                <div className="result-item-meta">
                  <span className="meta-field">客户名称: <span className="meta-value">{item.customer}</span></span>
                  <span className="meta-field">采购订单日期: <span className="meta-value">{item.poDate}</span></span>
                  <span className="meta-field">合同总金额 (订单货币): <span className="meta-value">{item.amount}</span></span>
                  <span className="meta-field">货币单位: <span className="meta-value">{item.currency}</span></span>
                </div>
                {expandedItems.includes(item.id) && (
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
            total={57640}
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
      {/* 详情弹窗 */}
      <Modal
        open={detailVisible}
        title={detailItem ? detailItem.title : '详情'}
        width={1000}
        onCancel={() => setDetailVisible(false)}
        footer={null}
        bodyStyle={{ maxHeight: '70vh', overflowY: 'auto', padding: 0 }}
     >
        {detailItem && (
          <div className="detail-modal">
            <div className="detail-section">
              <div className="detail-section-title">销售订单详情</div>
              <div className="detail-grid">
                {getDetailData(detailItem).baseInfo.map((it, idx) => (
                  <div className="detail-item" key={idx}>
                    <div className="detail-label">{it.label}：</div>
                    <div className="detail-value">{it.value}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="detail-section">
              <div className="detail-section-title">物料清单</div>
              <Table
                columns={itemColumns}
                dataSource={getDetailData(detailItem).items}
                pagination={false}
                size="small"
                scroll={{ x: true }}
              />
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default SalesDocumentSearch;
