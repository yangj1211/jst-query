import React, { useState } from 'react';
import { Button, Checkbox, Tag, Avatar, Input, List, Tooltip, Pagination } from 'antd';
import { 
  SyncOutlined, 
  LeftOutlined, 
  RightOutlined, 
  PlusOutlined, 
  PaperClipOutlined, 
  EyeOutlined, 
  InfoCircleOutlined, 
  DownloadOutlined, 
  HistoryOutlined,
  UpOutlined,
  DownOutlined
} from '@ant-design/icons';
import './SalesDocumentSearch.css';

const { TextArea } = Input;

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

  const toggleExpand = (id) => {
    setExpandedItems(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const renderDocumentItem = (doc) => (
    <div key={doc.id} className="document-item">
      <div className="document-info">
        <PaperClipOutlined className="doc-icon" />
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
          <span>找到 41 个结果</span>
          <Button icon={<SyncOutlined />}>重置</Button>
        </div>
        <div className="results-list">
          <List
            dataSource={mockResults}
            renderItem={item => (
              <div className="result-item-wrapper">
                <div className="result-item-header">
                  <div className="result-item-title-group">
                    <Checkbox />
                    <span className="result-item-title">{item.title}</span>
                  </div>
                  <div className="result-item-actions">
                    <Tooltip title="下载全部文件">
                      <Button type="text" icon={<DownloadOutlined />} />
                    </Tooltip>
                    <Tooltip title="查看详情">
                      <Button type="text" icon={<EyeOutlined />} />
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
                    {item.documents.map(doc => renderDocumentItem(doc))}
                  </div>
                )}
              </div>
            )}
          />
        </div>
        <div className="results-pagination">
          <Pagination defaultCurrent={1} total={57640} showSizeChanger={false} />
        </div>
      </div>
    </div>
  );
};

export default SalesDocumentSearch;
