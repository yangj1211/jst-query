import React, { useState, useRef, useEffect } from 'react';
import './PageStyle.css';
import './QuestionAssistant.css';
import ParameterForm from '../components/ParameterForm';
import dayjs from 'dayjs';
import QueryResult from '../components/QueryResult';
import ThinkingProcess from '../components/ThinkingProcess';

/**
 * 数据问答页面组件
 */
const DataQA = () => {
  // 格式化时间
  const formatDateTime = (date) => {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}`;
  };

  // 对话相关状态
  const [conversations, setConversations] = useState([
    { id: 1, title: '关于销售额的查询', time: formatDateTime(new Date()), messages: [] },
    { id: 2, title: '用户数据分析', time: formatDateTime(new Date(Date.now() - 3600000)), messages: [] }
  ]);
  const [activeConversationId, setActiveConversationId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [openMenuId, setOpenMenuId] = useState(null);
  const [editingConversationId, setEditingConversationId] = useState(null);
  const [editingTitle, setEditingTitle] = useState('');
  const [isClarifying, setIsClarifying] = useState(false);
  const [pendingQuestion, setPendingQuestion] = useState('');
  const messagesEndRef = useRef(null);

  // 滚动到底部
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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

  // 选择对话
  const handleSelectConversation = (id) => {
    setActiveConversationId(id);
    const conversation = conversations.find(c => c.id === id);
    setMessages(conversation.messages || []);
  };

  // 创建新对话
  const handleNewConversation = () => {
    const newId = Math.max(...conversations.map(c => c.id), 0) + 1;
    const newConversation = {
      id: newId,
      title: '新对话',
      time: formatDateTime(new Date()),
      messages: []
    };
    setConversations([newConversation, ...conversations]);
    setActiveConversationId(newId);
    setMessages([]);
  };

  // 发送消息
  const handleSendMessage = () => {
    if (!inputValue.trim()) return;

    const userMessage = {
      id: Date.now(),
      sender: 'user',
      text: inputValue,
      time: formatDateTime(new Date())
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    const question = inputValue;
    setInputValue('');

    // 更新对话列表中的消息
    setConversations(conversations.map(c => 
      c.id === activeConversationId 
        ? { ...c, messages: newMessages, title: question.substring(0, 20) }
        : c
    ));

    // 意图识别与参数预解析
    const { clarified, params } = preParseQuestion(question);
    
    if (!clarified) {
      setIsClarifying(true);
      setPendingQuestion(question);
      // 将预解析的参数传递给表单
      // 注意：这里需要一个机制来传递params
      return; 
    }

    // 模拟AI回复
    setTimeout(() => {
      const aiMessage = {
        id: Date.now() + 1,
        type: 'ai',
        content: '这是一个模拟回复。实际使用时将调用AI接口获取真实回答。',
        time: formatDateTime(new Date())
      };
      setMessages([...newMessages, aiMessage]);
      
      // 更新对话列表
      setConversations(conversations.map(c => 
        c.id === activeConversationId 
          ? { ...c, messages: [...newMessages, aiMessage] }
          : c
      ));
    }, 500);
  };

  // 前端模拟的意图预解析函数（保持原有逻辑）
  const preParseQuestion = (question) => {
    let params = {};
    let clarified = true;

    // 检查时间意图
    if (question.includes('本月')) {
      params.mainRelativePreset = 'this_month';
    } else if (question.includes('最近三年')) {
      params.mainRelativePreset = 'last_n';
      params.mainRelativeLastN = 3;
      params.mainRelativeUnit = 'year';
      params.lockedUnit = 'year';
      params.periodMode = 'recent';
    } else if (question.includes('过去三年')) {
      params.mainRelativePreset = 'last_n';
      params.mainRelativeLastN = 3;
      params.mainRelativeUnit = 'year';
      params.lockedUnit = 'year';
      params.periodMode = 'past';
    } else if (question.includes('今年第一季度')) {
      params.mainRelativePreset = 'this_quarter';
    }

    // 检查是否需要对比
    if (question.includes('对比') || question.includes('vs')) {
      params.addComparison = true;
      if (question.includes('去年同期')) {
        params.comparisonType = 'same_period_last_year';
      } else {
        params.comparisonType = 'previous_period';
      }
    }

    // 检查范围和口径是否明确
    if (!question.includes('集团') && !question.includes('分公司')) {
      clarified = false;
    }
    if (!question.includes('管口') && !question.includes('法口')) {
      clarified = false;
    }
    
    if (Object.keys(params).length > 0 && !clarified) {
        clarified = false;
    }

    return { clarified, params };
  };

  // 根据问题和参数生成模拟结果
  const generateMockResult = (question, params) => {
    if (question.includes('销售额')) {
      const years = params && params.timeRange ? params.timeRange.split(',').map(y => y.trim()) : [];
      const isMultiYear = years.length > 1 && years.every(y => /^\d{4}$/.test(y));

      if (isMultiYear) {
        return {
          summary: `根据您的查询，${params.timeRange}的销售数据显示，整体呈稳定增长趋势。`,
          tableData: {
            columns: [
              { title: '年份', dataIndex: 'year', key: 'year' },
              { title: '总销售额 (万元)', dataIndex: 'totalSales', key: 'totalSales', align: 'right' },
              { title: '同比增长', dataIndex: 'yoyGrowth', key: 'yoyGrowth', align: 'right' },
            ],
            dataSource: years.map((year, index) => ({
              key: index.toString(),
              year: year,
              totalSales: 12000 + index * 1500 + Math.floor(Math.random() * 2000),
              yoyGrowth: index === 0 ? '-' : `${(Math.random() * 8 + 4).toFixed(1)}%`,
            })),
          }
        };
      }
      
      return {
        summary: '根据您的查询，本月的销售数据显示，整体趋势向好，A产品线增长尤为显著。',
        tableData: {
          columns: [
            { title: '产品线', dataIndex: 'productLine', key: 'productLine' },
            { title: '销售额 (万元)', dataIndex: 'sales', key: 'sales', align: 'right' },
            { title: '环比增长', dataIndex: 'growth', key: 'growth', align: 'right' },
          ],
          dataSource: [
            { key: '1', productLine: 'A产品线', sales: 1200, growth: '15%' },
            { key: '2', productLine: 'B产品线', sales: 850, growth: '8%' },
            { key: '3', productLine: 'C产品线', sales: 950, growth: '-2%' },
          ],
        }
      };
    } else if (question.includes('用户数据')) {
       return {
        summary: '本月用户数据显示，新注册用户主要来源于华东地区，用户活跃度较上月持平。',
        tableData: {
          columns: [
            { title: '地区', dataIndex: 'region', key: 'region' },
            { title: '新增用户数', dataIndex: 'newUsers', key: 'newUsers', align: 'right' },
            { title: '活跃用户数', dataIndex: 'activeUsers', key: 'activeUsers', align: 'right' },
          ],
          dataSource: [
            { key: '1', region: '华东', newUsers: 5200, activeUsers: 89000 },
            { key: '2', region: '华南', newUsers: 3100, activeUsers: 65000 },
            { key: '3', region: '华北', newUsers: 2500, activeUsers: 58000 },
          ],
        }
      };
    } else {
      return {
        summary: '已为您完成查询，数据详情如下。',
        tableData: {
           columns: [{ title: '查询项', dataIndex: 'item' }, { title: '结果', dataIndex: 'value' }],
           dataSource: [{ key: '1', item: '默认数据', value: '12345' }]
        }
      };
    }
  };

  // 处理参数确认
  const handleParameterConfirm = (params) => {
    setIsClarifying(false);
    
    const thinkingId = Date.now();
    const thinkingMessage = {
      id: thinkingId,
      sender: 'ai',
      type: 'thinking',
      data: params,
      time: formatDateTime(new Date())
    };

    const currentQuestion = pendingQuestion;

    setMessages(prev => [...prev, thinkingMessage]);
    
    // 模拟AI回复
    setTimeout(() => {
      const resultData = generateMockResult(currentQuestion, params);
      const aiResponseMessage = {
        id: Date.now() + 1,
        sender: 'ai',
        type: 'result',
        data: {
          params: params,
          summary: resultData.summary,
          tableData: resultData.tableData,
        },
        time: formatDateTime(new Date())
      };
      setMessages(prev => prev.map(msg => msg.id === thinkingId ? aiResponseMessage : msg));
    }, 1500);

    setPendingQuestion('');
  };

  // 回车发送
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // 快速提问
  const handleQuickQuestion = (question) => {
    setInputValue(question);
  };

  // 常用问题列表
  const quickQuestions = [
    '查询本月销售额',
    '分析用户增长趋势',
    '最近的订单数据',
    '产品销售排名'
  ];

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
      setConversations(conversations.map(c => 
        c.id === conversationId ? { ...c, title: editingTitle.trim() } : c
      ));
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
    const conversation = conversations.find(c => c.id === conversationId);
    const otherConversations = conversations.filter(c => c.id !== conversationId);
    setConversations([conversation, ...otherConversations]);
    setOpenMenuId(null);
  };

  return (
    <div className="chat-container">
      {/* 左侧历史对话列表 */}
      <div className="conversation-list">
        <div className="conversation-header">
          <button className="new-conversation-btn" onClick={handleNewConversation}>
            <span className="icon">+</span>
            新建对话
          </button>
        </div>
        <div className="conversation-items">
          {conversations.map(conversation => (
            <div
              key={conversation.id}
              className={`conversation-item ${activeConversationId === conversation.id ? 'active' : ''}`}
              onClick={() => handleSelectConversation(conversation.id)}
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
                    <div className="conversation-title">{conversation.title}</div>
                    <div className="conversation-time">{conversation.time}</div>
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
                          置顶
                        </button>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 右侧对话区域 */}
      <div className="chat-area">
        {activeConversationId ? (
          <>
            {/* 消息列表 */}
            <div className="messages-container">
              {messages.length === 0 ? (
                <div className="welcome-message">
                  <div className="welcome-text">您好！我是问数智能助手，有什么可以帮您的吗？</div>
                  <div className="quick-questions">
                    {quickQuestions.map((question, index) => (
                      <button
                        key={index}
                        className="quick-question-btn"
                        onClick={() => handleQuickQuestion(question)}
                      >
                        {question}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                messages.map(message => (
                  <div key={message.id} className={`message ${message.sender === 'user' ? 'user-message' : 'ai-message'}`}>
                    <div className="message-content">
                      {message.type === 'thinking' ? (
                        <ThinkingProcess params={message.data} />
                      ) : message.type === 'result' ? (
                        <QueryResult data={message.data} />
                      ) : (
                        <p>{message.text}</p>
                      )}
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
              {isClarifying && <ParameterForm onSubmit={handleParameterConfirm} initialParams={preParseQuestion(pendingQuestion).params} />}
            </div>

            {/* 输入区域 */}
            <div className="input-area">
              <div className="input-wrapper">
                <textarea
                  className="message-input"
                  placeholder="给问数智能体发送消息"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  rows={3}
                />
                <div className="input-actions">
                  <button className="action-chip">
                    <span className="action-icon">⚙️</span>
                    <span>问数配置</span>
                  </button>
                  <button className="send-button-round" onClick={handleSendMessage}>
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path
                        d="M12 19V5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M5 12l7-7 7 7"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="chat-placeholder">
            <div className="placeholder-icon">💬</div>
            <div className="placeholder-text">
              新对话</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DataQA;

