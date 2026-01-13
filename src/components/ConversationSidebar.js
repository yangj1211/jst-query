import React, { useState, useEffect } from 'react';
import { Modal } from 'antd';
import './ConversationSidebar.css';

/**
 * 对话列表侧边栏组件
 * 从 QuestionAssistant 中提取的对话列表功能
 */
const ConversationSidebar = ({ 
  conversations = [],
  activeConversationId = null,
  onSelectConversation = () => {},
  onNewConversation = () => {},
  onRename = () => {},
  onPin = () => {},
  onDelete = () => {},
  formatDateTime = (date) => {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}`;
  }
}) => {
  const [openMenuId, setOpenMenuId] = useState(null);
  const [editingConversationId, setEditingConversationId] = useState(null);
  const [editingTitle, setEditingTitle] = useState('');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [collapsedGroups, setCollapsedGroups] = useState({});

  // 点击外部关闭菜单
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (openMenuId && !event.target.closest('.conversation-menu-wrapper')) {
        setOpenMenuId(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [openMenuId]);

  // 打开菜单
  const handleOpenMenu = (e, conversationId) => {
    e.stopPropagation();
    setOpenMenuId(openMenuId === conversationId ? null : conversationId);
  };

  // 重命名对话
  const handleRename = (e, conversationId, currentTitle) => {
    e.stopPropagation();
    setEditingConversationId(conversationId);
    setEditingTitle(currentTitle);
    setOpenMenuId(null);
  };

  // 保存重命名
  const handleSaveRename = (conversationId) => {
    if (editingTitle.trim()) {
      onRename(conversationId, editingTitle.trim());
    }
    setEditingConversationId(null);
    setEditingTitle('');
  };

  // 取消重命名
  const handleCancelRename = () => {
    setEditingConversationId(null);
    setEditingTitle('');
  };

  // 置顶对话
  const handlePinConversation = (e, conversationId) => {
    e.stopPropagation();
    onPin(conversationId);
    setOpenMenuId(null);
  };

  // 删除对话
  const handleDeleteConversation = (e, conversationId) => {
    e.stopPropagation();
    setOpenMenuId(null);
    
    // 获取对话标题用于确认提示
    const conversation = conversations.find(c => c.id === conversationId);
    const conversationTitle = conversation?.title || '这个对话';
    
    Modal.confirm({
      title: '确认删除',
      content: `确定要删除"${conversationTitle}"吗？删除后无法恢复。`,
      okText: '确定',
      cancelText: '取消',
      okType: 'danger',
      onOk: () => {
        onDelete(conversationId);
      }
    });
  };

  // 过滤对话
  const filterConversations = (conversations, keyword) => {
    if (!keyword.trim()) {
      return conversations;
    }
    return conversations.filter(conv => 
      conv.title.toLowerCase().includes(keyword.toLowerCase())
    );
  };

  // 按日期对对话进行分组（今天按日期，其他按月份）
  const groupConversationsByDate = (conversations) => {
    const groups = {
      pinned: [],
      dates: {}
    };

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    conversations.forEach(conv => {
      if (conv.pinned) {
        groups.pinned.push(conv);
        return;
      }

      const convDate = new Date(conv.time);
      const convDateOnly = new Date(convDate.getFullYear(), convDate.getMonth(), convDate.getDate());
      
      // 判断是否是今天
      const isToday = convDateOnly.getTime() === today.getTime();
      
      let dateKey;
      if (isToday) {
        // 今天的对话按日期分组
        dateKey = `${convDateOnly.getFullYear()}-${String(convDateOnly.getMonth() + 1).padStart(2, '0')}-${String(convDateOnly.getDate()).padStart(2, '0')}`;
      } else {
        // 其他对话按月份分组
        dateKey = `${convDateOnly.getFullYear()}-${String(convDateOnly.getMonth() + 1).padStart(2, '0')}`;
      }
      
      if (!groups.dates[dateKey]) {
        groups.dates[dateKey] = {
          date: isToday ? convDateOnly : new Date(convDateOnly.getFullYear(), convDateOnly.getMonth(), 1),
          isMonth: !isToday,
          conversations: []
        };
      }
      
      groups.dates[dateKey].conversations.push(conv);
    });

    const sortedDates = Object.keys(groups.dates)
      .sort((a, b) => {
        // 如果是月份格式（只有年-月），先创建日期再比较
        const dateA = groups.dates[a].isMonth 
          ? new Date(a + '-01')
          : new Date(a);
        const dateB = groups.dates[b].isMonth 
          ? new Date(b + '-01')
          : new Date(b);
        return dateB - dateA;
      })
      .map(dateKey => ({
        dateKey,
        ...groups.dates[dateKey]
      }));

    return {
      pinned: groups.pinned,
      sortedDates
    };
  };

  // 格式化日期显示标签
  const formatDateLabel = (dateGroup) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const dateOnly = new Date(dateGroup.date.getFullYear(), dateGroup.date.getMonth(), dateGroup.date.getDate());
    
    if (dateOnly.getTime() === today.getTime()) {
      return '今天';
    } else {
      // 其他按月份显示
      const year = dateGroup.date.getFullYear();
      const month = String(dateGroup.date.getMonth() + 1).padStart(2, '0');
      return `${year}年${month}月`;
    }
  };

  const filteredConversations = filterConversations(conversations, searchKeyword);
  const groupedConversations = groupConversationsByDate(filteredConversations);

  // 渲染对话分组的函数
  const renderConversationGroup = (conversations, groupLabel, isPinned = false) => {
    if (conversations.length === 0) return null;
    
    const groupKey = groupLabel || 'pinned';
    const isCollapsed = collapsedGroups[groupKey];
    
    const toggleCollapse = (e) => {
      e.stopPropagation();
      setCollapsedGroups(prev => ({
        ...prev,
        [groupKey]: !prev[groupKey]
      }));
    };
    
    return (
      <div key={groupLabel} className="conversation-group">
        {!isPinned && groupLabel && (
          <div className="conversation-group-label" onClick={toggleCollapse}>
            <span>{groupLabel}</span>
            <svg 
              className={`collapse-icon ${isCollapsed ? 'collapsed' : ''}`}
              width="16" 
              height="16" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2"
            >
              <polyline points="6 9 12 15 18 9"/>
            </svg>
          </div>
        )}
        {!isCollapsed && conversations.map(conversation => (
          <div
            key={conversation.id}
            className={`conversation-item ${activeConversationId === conversation.id ? 'active' : ''} ${conversation.pinned ? 'pinned' : ''}`}
            onClick={() => onSelectConversation(conversation.id)}
          >
            {editingConversationId === conversation.id ? (
              <div className="conversation-edit">
                <input
                  type="text"
                  className="conversation-edit-input"
                  value={editingTitle}
                  onChange={(e) => setEditingTitle(e.target.value)}
                  onBlur={() => handleSaveRename(conversation.id)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleSaveRename(conversation.id);
                    } else if (e.key === 'Escape') {
                      handleCancelRename();
                    }
                  }}
                  autoFocus
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
            ) : (
              <>
                <div className="conversation-content">
                  <div className="conversation-title">
                    {conversation.pinned && (
                      <svg className="pin-icon" width="12" height="12" viewBox="0 0 24 24" fill="currentColor" style={{ marginRight: 6 }}>
                        <path d="M12 17v5"/>
                        <path d="M9 10.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24V16a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V7a6 6 0 0 0-6 0v3.76Z"/>
                      </svg>
                    )}
                    {conversation.title}
                  </div>
                </div>
                <div className="conversation-menu-wrapper">
                  <button
                    className="conversation-menu-btn"
                    onClick={(e) => handleOpenMenu(e, conversation.id)}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="5" r="1"/>
                      <circle cx="12" cy="12" r="1"/>
                      <circle cx="12" cy="19" r="1"/>
                    </svg>
                  </button>
                  {openMenuId === conversation.id && (
                    <div className="conversation-menu">
                      <button 
                        className="menu-item"
                        onClick={(e) => handleRename(e, conversation.id, conversation.title)}
                      >
                        <svg className="menu-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                        </svg>
                        重命名
                      </button>
                      <button 
                        className="menu-item"
                        onClick={(e) => handlePinConversation(e, conversation.id)}
                      >
                        <svg className="menu-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M12 17v5"/>
                          <path d="M9 10.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24V16a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V7a6 6 0 0 0-6 0v3.76Z"/>
                        </svg>
                        {conversation.pinned ? '取消置顶' : '置顶'}
                      </button>
                      <button 
                        className="menu-item delete"
                        onClick={(e) => handleDeleteConversation(e, conversation.id)}
                      >
                        <svg className="menu-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="3 6 5 6 21 6"/>
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                          <line x1="10" y1="11" x2="10" y2="17"/>
                          <line x1="14" y1="11" x2="14" y2="17"/>
                        </svg>
                        删除
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="conversation-sidebar">
      {/* 搜索框 */}
      <div className="conversation-search">
        <input
          type="text"
          className="conversation-search-input"
          placeholder="搜索对话..."
          value={searchKeyword}
          onChange={(e) => setSearchKeyword(e.target.value)}
        />
        {searchKeyword && (
          <button 
            className="search-clear-btn"
            onClick={() => setSearchKeyword('')}
          >
            ×
          </button>
        )}
      </div>
      
      <div className="conversation-items">
        {/* 渲染置顶对话 */}
        {renderConversationGroup(groupedConversations.pinned, null, true)}
        
        {/* 渲染按日期分组的对话 */}
        {groupedConversations.sortedDates.map(dateGroup => 
          renderConversationGroup(
            dateGroup.conversations, 
            formatDateLabel(dateGroup),
            false
          )
        )}
      </div>
    </div>
  );
};

export default ConversationSidebar;
