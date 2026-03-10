import React, { createContext, useContext, useState, useMemo, useCallback } from 'react';

const DocumentConversationContext = createContext();

/**
 * 单据检索页面对话状态 Hook
 * @returns {Object} 对话列表、当前对话 ID、更新/新建/删除等操作
 */
export const useDocumentConversation = () => {
  const context = useContext(DocumentConversationContext);
  if (!context) {
    throw new Error('useDocumentConversation must be used within DocumentConversationProvider');
  }
  return context;
};

const formatDateTimeHelper = (date) => {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes}`;
};

/**
 * 单据检索页面对话状态 Provider
 * 与智能问数对话历史互不影响
 */
export const DocumentConversationProvider = ({ children }) => {
  const formatDateTime = useCallback((date) => formatDateTimeHelper(date), []);

  const [conversations, setConversations] = useState([]);
  const [activeConversationId, setActiveConversationId] = useState(null);

  const updateConversation = useCallback((id, updates) => {
    setConversations((prev) => prev.map((c) => (c.id === id ? { ...c, ...updates } : c)));
  }, []);

  const deleteConversation = useCallback((id) => {
    setConversations((prev) => {
      const filtered = prev.filter((c) => c.id !== id);
      if (activeConversationId === id) {
        setActiveConversationId(filtered.length > 0 ? filtered[0].id : null);
      }
      return filtered;
    });
  }, [activeConversationId]);

  const renameConversation = useCallback((id, newTitle) => {
    updateConversation(id, { title: newTitle });
  }, [updateConversation]);

  const togglePinConversation = useCallback((id) => {
    setConversations((prev) => {
      const conversation = prev.find((c) => c.id === id);
      if (conversation) {
        return prev.map((c) => (c.id === id ? { ...c, pinned: !c.pinned } : c));
      }
      return prev;
    });
  }, []);

  const createNewConversation = useCallback(() => {
    const newId = Date.now();
    const newConversation = {
      id: newId,
      title: '新对话',
      time: formatDateTime(new Date()),
      messages: [],
      pinned: false,
    };
    setConversations((prev) => [newConversation, ...prev]);
    setActiveConversationId(newId);
    return newId;
  }, [formatDateTime]);

  const value = useMemo(
    () => ({
      conversations,
      setConversations,
      activeConversationId,
      setActiveConversationId,
      updateConversation,
      deleteConversation,
      renameConversation,
      togglePinConversation,
      createNewConversation,
      formatDateTime,
    }),
    [
      conversations,
      activeConversationId,
      updateConversation,
      deleteConversation,
      renameConversation,
      togglePinConversation,
      createNewConversation,
      formatDateTime,
    ]
  );

  return (
    <DocumentConversationContext.Provider value={value}>
      {children}
    </DocumentConversationContext.Provider>
  );
};
