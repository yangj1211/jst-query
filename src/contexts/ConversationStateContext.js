import React, { createContext, useContext, useState, useMemo, useCallback } from 'react';

const ConversationStateContext = createContext();

export const useConversationState = () => {
  const context = useContext(ConversationStateContext);
  if (!context) {
    throw new Error('useConversationState must be used within ConversationStateProvider');
  }
  return context;
};

// 格式化时间的辅助函数（用于初始化）
const formatDateTimeHelper = (date) => {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes}`;
};

export const ConversationStateProvider = ({ children }) => {
  // 格式化时间 - 使用 useCallback 稳定函数引用
  const formatDateTime = useCallback((date) => {
    return formatDateTimeHelper(date);
  }, []);

  // 对话相关状态
  const [conversations, setConversations] = useState(() => [
    // 今天的对话 (4个)
    { id: 1, title: '今年销售额最高的三个行业是什么？为什么？', time: formatDateTimeHelper(new Date()), messages: [], pinned: true },
    { id: 2, title: '我们1-6月不同产品收入是多少', time: formatDateTimeHelper(new Date(Date.now() - 2 * 3600000)), messages: [] },
    { id: 3, title: '分析一下本月销售情况', time: formatDateTimeHelper(new Date(Date.now() - 4 * 3600000)), messages: [] },
    { id: 4, title: '华南区域客户分布情况', time: formatDateTimeHelper(new Date(Date.now() - 6 * 3600000)), messages: [] },
    
    // 昨天的对话 (3个)
    { id: 5, title: '我们前十大客户是什么？金额是什么？占比多少', time: formatDateTimeHelper(new Date(Date.now() - 24 * 3600000)), messages: [] },
    { id: 6, title: '今年A产品收入增长多少？', time: formatDateTimeHelper(new Date(Date.now() - 26 * 3600000)), messages: [], pinned: true },
    { id: 7, title: '各产品线毛利率对比', time: formatDateTimeHelper(new Date(Date.now() - 30 * 3600000)), messages: [] },
    
    // 2天前的对话 (3个)
    { id: 8, title: '最近三年不同产品和地区的销售额', time: formatDateTimeHelper(new Date(Date.now() - 2 * 24 * 3600000)), messages: [] },
    { id: 9, title: '新能源汽车行业销售趋势', time: formatDateTimeHelper(new Date(Date.now() - 2 * 24 * 3600000 + 2 * 3600000)), messages: [] },
    { id: 10, title: 'Top 5客户贡献度分析', time: formatDateTimeHelper(new Date(Date.now() - 2 * 24 * 3600000 + 4 * 3600000)), messages: [] },
    
    // 3天前的对话 (2个)
    { id: 11, title: '对比今年和去年的销售数据', time: formatDateTimeHelper(new Date(Date.now() - 3 * 24 * 3600000)), messages: [] },
    { id: 12, title: '库存周转率计算', time: formatDateTimeHelper(new Date(Date.now() - 3 * 24 * 3600000 + 3 * 3600000)), messages: [] },
    
    // 5天前的对话 (2个)
    { id: 13, title: '华东区域销售情况分析', time: formatDateTimeHelper(new Date(Date.now() - 5 * 24 * 3600000)), messages: [] },
    { id: 14, title: '市场占有率变化趋势', time: formatDateTimeHelper(new Date(Date.now() - 5 * 24 * 3600000 + 5 * 3600000)), messages: [] },
    
    // 1周前的对话 (2个)
    { id: 15, title: '第一季度产品线收入对比', time: formatDateTimeHelper(new Date(Date.now() - 7 * 24 * 3600000)), messages: [] },
    { id: 16, title: '人工智能产品销售预测', time: formatDateTimeHelper(new Date(Date.now() - 7 * 24 * 3600000 + 2 * 3600000)), messages: [] },
    
    // 2周前的对话 (1个)
    { id: 17, title: '客户流失率分析', time: formatDateTimeHelper(new Date(Date.now() - 14 * 24 * 3600000)), messages: [] },
    
    // 3周前的对话 (2个)
    { id: 18, title: '各分公司业绩排名', time: formatDateTimeHelper(new Date(Date.now() - 20 * 24 * 3600000)), messages: [] },
    { id: 19, title: '销售渠道效能分析', time: formatDateTimeHelper(new Date(Date.now() - 21 * 24 * 3600000)), messages: [] },
    
    // 1个月前的对话 (2个)
    { id: 20, title: '2024年全年销售总结', time: formatDateTimeHelper(new Date(Date.now() - 32 * 24 * 3600000)), messages: [] },
    { id: 21, title: '上半年利润率分析', time: formatDateTimeHelper(new Date(Date.now() - 35 * 24 * 3600000)), messages: [] },
    
    // 2个月前的对话 (1个)
    { id: 22, title: '新产品市场反馈调研', time: formatDateTimeHelper(new Date(Date.now() - 60 * 24 * 3600000)), messages: [] }
  ]);
  
  const [activeConversationId, setActiveConversationId] = useState(null);

  // 更新对话 - 使用 useCallback 稳定函数引用
  const updateConversation = useCallback((id, updates) => {
    setConversations(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
  }, []);

  // 删除对话 - 使用 useCallback 稳定函数引用
  const deleteConversation = useCallback((id) => {
    setConversations(prev => {
      const filtered = prev.filter(c => c.id !== id);
      if (activeConversationId === id) {
        setActiveConversationId(filtered.length > 0 ? filtered[0].id : null);
      }
      return filtered;
    });
  }, [activeConversationId]);

  // 重命名对话 - 使用 useCallback 稳定函数引用
  const renameConversation = useCallback((id, newTitle) => {
    updateConversation(id, { title: newTitle });
  }, [updateConversation]);

  // 置顶/取消置顶对话 - 使用 useCallback 稳定函数引用
  const togglePinConversation = useCallback((id) => {
    setConversations(prev => {
      const conversation = prev.find(c => c.id === id);
      if (conversation) {
        return prev.map(c => c.id === id ? { ...c, pinned: !c.pinned } : c);
      }
      return prev;
    });
  }, []);

  // 新建对话 - 使用 useCallback 稳定函数引用
  const createNewConversation = useCallback(() => {
    const newId = Date.now();
    const newConversation = {
      id: newId,
      title: '新对话',
      time: formatDateTime(new Date()),
      messages: [],
      pinned: false
    };
    setConversations(prev => [newConversation, ...prev]);
    setActiveConversationId(newId);
    return newId;
  }, [formatDateTime]);

  // 使用 useMemo 稳定 value 对象，避免无限重新渲染
  const value = useMemo(() => ({
    conversations,
    setConversations,
    activeConversationId,
    setActiveConversationId,
    updateConversation,
    deleteConversation,
    renameConversation,
    togglePinConversation,
    createNewConversation,
    formatDateTime
  }), [
    conversations,
    activeConversationId,
    updateConversation,
    deleteConversation,
    renameConversation,
    togglePinConversation,
    createNewConversation,
    formatDateTime
  ]);

  return (
    <ConversationStateContext.Provider value={value}>
      {children}
    </ConversationStateContext.Provider>
  );
};

