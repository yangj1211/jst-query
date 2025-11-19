import React, { createContext, useContext, useState } from 'react';

const ConversationContext = createContext();

export const useConversation = () => {
  const context = useContext(ConversationContext);
  if (!context) {
    throw new Error('useConversation must be used within ConversationProvider');
  }
  return context;
};

export const ConversationProvider = ({ children, formatDateTime }) => {
  // 对话相关状态
  const [conversations, setConversations] = useState([
    // 今天的对话 (4个)
    { id: 1, title: '今年销售额最高的三个行业是什么？为什么？', time: formatDateTime(new Date()), messages: [], pinned: true },
    { id: 2, title: '我们1-6月不同产品收入是多少', time: formatDateTime(new Date(Date.now() - 2 * 3600000)), messages: [] },
    { id: 3, title: '分析一下本月销售情况', time: formatDateTime(new Date(Date.now() - 4 * 3600000)), messages: [] },
    { id: 4, title: '华南区域客户分布情况', time: formatDateTime(new Date(Date.now() - 6 * 3600000)), messages: [] },
    
    // 昨天的对话 (3个)
    { id: 5, title: '我们前十大客户是什么？金额是什么？占比多少', time: formatDateTime(new Date(Date.now() - 24 * 3600000)), messages: [] },
    { id: 6, title: '今年A产品收入增长多少？', time: formatDateTime(new Date(Date.now() - 26 * 3600000)), messages: [], pinned: true },
    { id: 7, title: '各产品线毛利率对比', time: formatDateTime(new Date(Date.now() - 30 * 3600000)), messages: [] },
    
    // 2天前的对话 (3个)
    { id: 8, title: '最近三年不同产品和地区的销售额', time: formatDateTime(new Date(Date.now() - 2 * 24 * 3600000)), messages: [] },
    { id: 9, title: '新能源汽车行业销售趋势', time: formatDateTime(new Date(Date.now() - 2 * 24 * 3600000 + 2 * 3600000)), messages: [] },
    { id: 10, title: 'Top 5客户贡献度分析', time: formatDateTime(new Date(Date.now() - 2 * 24 * 3600000 + 4 * 3600000)), messages: [] },
    
    // 3天前的对话 (2个)
    { id: 11, title: '对比今年和去年的销售数据', time: formatDateTime(new Date(Date.now() - 3 * 24 * 3600000)), messages: [] },
    { id: 12, title: '库存周转率计算', time: formatDateTime(new Date(Date.now() - 3 * 24 * 3600000 + 3 * 3600000)), messages: [] },
    
    // 5天前的对话 (2个)
    { id: 13, title: '华东区域销售情况分析', time: formatDateTime(new Date(Date.now() - 5 * 24 * 3600000)), messages: [] },
    { id: 14, title: '市场占有率变化趋势', time: formatDateTime(new Date(Date.now() - 5 * 24 * 3600000 + 5 * 3600000)), messages: [] },
    
    // 1周前的对话 (2个)
    { id: 15, title: '第一季度产品线收入对比', time: formatDateTime(new Date(Date.now() - 7 * 24 * 3600000)), messages: [] },
    { id: 16, title: '人工智能产品销售预测', time: formatDateTime(new Date(Date.now() - 7 * 24 * 3600000 + 2 * 3600000)), messages: [] },
    
    // 2周前的对话 (1个)
    { id: 17, title: '客户流失率分析', time: formatDateTime(new Date(Date.now() - 14 * 24 * 3600000)), messages: [] },
    
    // 3周前的对话 (2个)
    { id: 18, title: '各分公司业绩排名', time: formatDateTime(new Date(Date.now() - 20 * 24 * 3600000)), messages: [] },
    { id: 19, title: '销售渠道效能分析', time: formatDateTime(new Date(Date.now() - 21 * 24 * 3600000)), messages: [] },
    
    // 1个月前的对话 (2个)
    { id: 20, title: '2024年全年销售总结', time: formatDateTime(new Date(Date.now() - 32 * 24 * 3600000)), messages: [] },
    { id: 21, title: '上半年利润率分析', time: formatDateTime(new Date(Date.now() - 35 * 24 * 3600000)), messages: [] },
    
    // 2个月前的对话 (1个)
    { id: 22, title: '新产品市场反馈调研', time: formatDateTime(new Date(Date.now() - 60 * 24 * 3600000)), messages: [] }
  ]);
  const [activeConversationId, setActiveConversationId] = useState(null);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [editingConversationId, setEditingConversationId] = useState(null);
  const [editingTitle, setEditingTitle] = useState('');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [collapsedGroups, setCollapsedGroups] = useState({});

  return (
    <ConversationContext.Provider
      value={{
        conversations,
        setConversations,
        activeConversationId,
        setActiveConversationId,
        openMenuId,
        setOpenMenuId,
        editingConversationId,
        setEditingConversationId,
        editingTitle,
        setEditingTitle,
        searchKeyword,
        setSearchKeyword,
        collapsedGroups,
        setCollapsedGroups,
      }}
    >
      {children}
    </ConversationContext.Provider>
  );
};
