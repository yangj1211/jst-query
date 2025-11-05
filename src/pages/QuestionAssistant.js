import React, { useState, useRef, useEffect } from 'react';
import { DownloadOutlined, LikeOutlined, DislikeOutlined } from '@ant-design/icons';
import './PageStyle.css';
import './QuestionAssistant.css';
import dayjs from 'dayjs';
import QueryResult from '../components/QueryResult'; // 引入查询结果组件
import ThinkingProcess from '../components/ThinkingProcess';
import QueryConfigModal from '../components/QueryConfigModal';
import CombinedThinking from '../components/CombinedThinking';

/**
 * 问数助手页面组件
 * 包含"问数"和"单据检索"两个标签页
 */
const QuestionAssistant = () => {
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
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [openMenuId, setOpenMenuId] = useState(null);
  const [editingConversationId, setEditingConversationId] = useState(null);
  const [editingTitle, setEditingTitle] = useState('');
  const [pendingQuestion, setPendingQuestion] = useState('');
  const [searchKeyword, setSearchKeyword] = useState(''); // 搜索关键词
  const [collapsedGroups, setCollapsedGroups] = useState({}); // 折叠的分组 {groupKey: boolean}
  const [isGenerating, setIsGenerating] = useState(false); // 是否正在生成答案
  const messagesEndRef = useRef(null);
  const generationTimeoutsRef = useRef([]); // 存储生成过程中的所有 timeout ID
  const currentCombinedIdRef = useRef(null); // 当前正在生成的消息 ID

  // 配置弹窗状态
  const [configVisible, setConfigVisible] = useState(false);
  const [configGlobal, setConfigGlobal] = useState({});
  const [configPerConv, setConfigPerConv] = useState({});

  // 槽位填充状态（自然语言）
  const [expectTime, setExpectTime] = useState(false);
  const [expectMetric, setExpectMetric] = useState(false);
  const [expectDimensions, setExpectDimensions] = useState(false); // 期待维度
  const [expectMetrics, setExpectMetrics] = useState(false); // 期待指标（复数）
  const [pendingParams, setPendingParams] = useState({});

  const getEffectiveConfig = () => {
    const convCfg = configPerConv[activeConversationId] || {};
    return { ...configGlobal, ...convCfg };
  };

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

  // 停止生成
  const handleStopGeneration = () => {
    // 清除所有待执行的 timeout
    generationTimeoutsRef.current.forEach(timeoutId => {
      clearTimeout(timeoutId);
    });
    generationTimeoutsRef.current = [];
    
    // 标记当前生成的消息为已停止
    if (currentCombinedIdRef.current) {
      setMessages(prev => prev.map(m => {
        if (m.id === currentCombinedIdRef.current && m.type === 'combined') {
          return {
            ...m,
            isComplete: true,
            isStopped: true // 标记为已停止
          };
        }
        return m;
      }));
    }
    
    // 重置状态
    setIsGenerating(false);
    currentCombinedIdRef.current = null;
  };

  // 选择对话
  const handleSelectConversation = (id) => {
    // 如果正在生成，先停止
    if (isGenerating) {
      handleStopGeneration();
    }
    setActiveConversationId(id);
    const conversation = conversations.find(c => c.id === id);
    setMessages(conversation.messages || []);
  };

  // 创建新对话
  const handleNewConversation = () => {
    // 如果正在生成，先停止
    if (isGenerating) {
      handleStopGeneration();
    }
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

  // 发送消息（含槽位应答）
  const handleSendMessage = () => {
    if (!inputValue.trim()) return;
    
    // 如果正在生成，先停止
    if (isGenerating) {
      handleStopGeneration();
    }

    const userMessage = {
      id: Date.now(),
      sender: 'user',
      text: inputValue,
      time: formatDateTime(new Date())
    };

    const base = [...messages, userMessage];
    setMessages(base);

    // 如果当前在等待用户补充槽位
    if (expectTime || expectMetric || expectDimensions || expectMetrics) {
      const reply = inputValue.trim();
      console.log('💬 用户补充信息:', reply);
      console.log('📦 当前 pendingParams:', pendingParams);

      const parsed = preParseQuestion(reply);
      const nextParams = { ...pendingParams };

      // 一次性解析用户回复中的所有信息
      
      // 1. 解析时间
      if (/(本月|上月|今年|去年|最近.*月|\d{4}年)/.test(reply)) {
        const timeMatch = reply.match(/(本月|上月|今年|去年|最近.*月|\d{4}年)/);
        if (timeMatch) {
          nextParams.timeRangeText = timeMatch[0];
          console.log('⏰ 解析到时间:', timeMatch[0]);
        }
      }
      
      // 2. 解析维度
      const dimensionsFromReply = [];
      if (reply.includes('产品') || reply.includes('产品线')) dimensionsFromReply.push('product');
      if (reply.includes('行业')) dimensionsFromReply.push('industry');
      if (reply.includes('分公司') || reply.includes('公司')) dimensionsFromReply.push('company');
      if (reply.includes('地区') || reply.includes('区域')) dimensionsFromReply.push('region');
      if (dimensionsFromReply.length > 0) {
        nextParams.dimensions = dimensionsFromReply;
        console.log('📊 解析到维度:', dimensionsFromReply);
      }
      
      // 3. 解析指标
      const metricsFromReply = [];
      if (reply.includes('订单') || reply.includes('数量')) metricsFromReply.push('订单数量');
      if (reply.includes('销售') || reply.includes('金额') || reply.includes('收入')) metricsFromReply.push('销售金额');
      if (reply.includes('利润')) metricsFromReply.push('利润');
      if (reply.includes('客户') || reply.includes('用户')) metricsFromReply.push('客户数');
      if (metricsFromReply.length > 0) {
        nextParams.metrics = metricsFromReply;
        console.log('📈 解析到指标:', metricsFromReply);
      }

      // 如果本轮回复里顺带包含了另一个要素，也顺便填上
      if (!nextParams.metric && parsed.params.metric) {
        nextParams.metric = parsed.params.metric;
      }

      // 如果还没有时间范围，设置默认值
      if (!nextParams.timeRangeText) {
        nextParams.timeRangeText = '所有时间';
      }

      setPendingParams(nextParams);
      setInputValue('');

      // 检查还缺什么信息（不再检查时间，因为有默认值）
      const missingInfo = [];
      if (!nextParams.dimensions || nextParams.dimensions.length === 0) missingInfo.push('分析维度');
      if (!nextParams.metrics || nextParams.metrics.length === 0) missingInfo.push('关注指标');
      
      console.log('🔍 解析结果:', nextParams);
      console.log('📋 缺失信息:', missingInfo);
      
      // 如果还有缺失信息，继续追问
      if (missingInfo.length > 0) {
        let followUpQuestion = '请继续补充以下信息：\n';
        if (missingInfo.includes('分析维度')) {
          followUpQuestion += '• 分析维度（例如：产品线、行业、分公司、地区等，可选择多个）\n';
        }
        if (missingInfo.includes('关注指标')) {
          followUpQuestion += '• 关注指标（例如：订单数量、销售金额、利润、客户数等，可选择多个）';
        }
        
        ask(followUpQuestion.trim());
        // 保持期待状态（不再期待时间）
        setExpectTime(false);
        setExpectDimensions(!nextParams.dimensions || nextParams.dimensions.length === 0);
        setExpectMetrics(!nextParams.metrics || nextParams.metrics.length === 0);
        return;
      }

      // 槽位补齐，发起查询
      console.log('✅ 所有信息已齐全，开始查询，参数:', nextParams, '问题:', pendingQuestion);
      setExpectTime(false);
      setExpectMetric(false);
      setExpectDimensions(false);
      setExpectMetrics(false);
      proceedWithQuery(nextParams, base, pendingQuestion);
      return;
    }

    const question = inputValue;
    setInputValue('');

    // 更新对话列表中的消息
    setConversations(conversations.map(c => 
      c.id === activeConversationId 
        ? { ...c, messages: base, title: question.substring(0, 20) }
        : c
    ));

    console.log('🔍 用户提问:', question);

    // 检测是否为复合问题（同时包含查询和分析）
    const hasQuery = /(查询|统计|查看|显示|是什么|哪些|多少|排名|前.+大|最高|最低)/.test(question);
    const hasAnalysis = /(分析|原因|为什么)/.test(question);
    const isCompositeQuestion = hasQuery && hasAnalysis;

    // 检测是否为同比/环比查询（包含"同比增长多少"、"上升多少"这类问题）
    const isYoYQuery = (/(同比|环比)/.test(question) || /(上升|下降|增长|减少)(多少|了多少|幅度)/.test(question)) && 
                       !/(分析|原因|为什么)/.test(question);
    
    // 检测是否为分析类问题（需要深度分析的问题），但要排除复合问题
    const isAnalysisQuestion = /(原因|为什么|分析一下)/.test(question) && 
                               !/(同比|环比|上升多少|下降多少|增长多少)/.test(question) &&
                               !isCompositeQuestion; // 排除复合问题
    
    console.log('📋 问题类型:', { isYoYQuery, isAnalysisQuestion, isCompositeQuestion, messagesCount: base.length });
    
    // 如果是同比/环比查询
    if (isYoYQuery) {
      // 查找上一轮结果（如果有的话）
      let previousResult = null;
      for (let i = base.length - 1; i >= 0; i--) {
        if (base[i].type === 'result' && base[i].data) {
          previousResult = base[i];
          break;
        }
      }
      
      // 无论是否有上一轮结果，都标记为同比查询
      proceedWithQuery({ isYoYQuery: true, previousResultMessage: previousResult }, base, question);
      return;
    }
    
    // 检测是否为多维度分析请求（模糊分析请求）
    const isMultiDimensionAnalysis = /(分析.*销售|销售.*分析|分析.*情况)/.test(question);
    
    if (isMultiDimensionAnalysis) {
      // 先解析时间
      const parsedTime = preParseQuestion(question);
      const timeRangeText = parsedTime.params.timeRangeText || '所有时间';
      
      // 解析问题中是否包含维度和指标
      const dimensionsInQuestion = [];
      if (question.includes('产品') || question.includes('产品线')) dimensionsInQuestion.push('product');
      if (question.includes('行业')) dimensionsInQuestion.push('industry');
      if (question.includes('分公司') || question.includes('公司')) dimensionsInQuestion.push('company');
      if (question.includes('地区') || question.includes('区域')) dimensionsInQuestion.push('region');
      
      const metricsInQuestion = [];
      if (question.includes('订单') || question.includes('数量')) metricsInQuestion.push('订单数量');
      if (question.includes('销售') || question.includes('金额') || question.includes('收入')) metricsInQuestion.push('销售金额');
      if (question.includes('利润')) metricsInQuestion.push('利润');
      if (question.includes('客户') || question.includes('用户')) metricsInQuestion.push('客户数');
      
      // 如果没有明确维度，随机选择2-3个维度
      let finalDimensions = dimensionsInQuestion;
      if (finalDimensions.length === 0) {
        const allDimensions = ['product', 'industry', 'region', 'company'];
        const numDimensions = Math.random() > 0.5 ? 2 : 3; // 50%概率选2个，50%概率选3个
        const shuffled = allDimensions.sort(() => 0.5 - Math.random());
        finalDimensions = shuffled.slice(0, numDimensions);
      }
      
      // 如果没有明确指标，随机选择3个指标
      let finalMetrics = metricsInQuestion;
      if (finalMetrics.length === 0) {
        const allMetrics = ['销售金额', '利润', '订单数量', '客户数'];
        const shuffled = allMetrics.sort(() => 0.5 - Math.random());
        finalMetrics = shuffled.slice(0, 3); // 固定选择3个指标
      }
      
      // 不再追问，直接使用识别到的或随机的维度和指标
      const params = {
        timeRangeText: timeRangeText, // 使用解析到的时间，如果没有则为"所有时间"
        dimensions: finalDimensions,
        metrics: finalMetrics
      };
      
      console.log('🎲 多维度分析 - 最终参数:', params);
      console.log('  - 时间:', timeRangeText);
      console.log('  - 维度:', finalDimensions);
      console.log('  - 指标:', finalMetrics);
      proceedWithQuery(params, base, question);
      return;
    }
    
    // 如果是分析类问题，检查是否有上一轮结果
    if (isAnalysisQuestion) {
      console.log('✅ 识别为分析类问题');
      let hasPreviousResult = false;
      for (let i = base.length - 1; i >= 0; i--) {
        if (base[i].type === 'result' && base[i].data) {
          hasPreviousResult = true;
          console.log('✅ 找到上一轮结果，索引:', i);
          break;
        }
      }
      
      // 如果有上一轮结果，直接进行分析，不需要补充参数
      if (hasPreviousResult) {
        console.log('✅ 有上一轮结果，开始分析');
        proceedWithQuery({}, base, question);
        return;
      } else {
        // 如果没有上一轮结果，提示用户先进行查询
        console.log('❌ 没有上一轮结果，提示用户');
        ask('请先进行一次查询，我才能为您分析原因。例如，您可以先问："今年A产品的收入是多少？"或"今年销售额最高的三个行业是什么？"');
        setInputValue('');
        return;
      }
    }

    // 意图识别
    const { clarified, params, needTime, needMetric } = preParseQuestion(question);
    
    // 检测是否为Top N查询（Top N查询不需要强制要求时间范围，默认为当前/最新数据）
    const isTopNQuery = /前(\d+|[一二三四五六七八九十]+)大?(客户|供应商|产品|地区)/.test(question);

    if (!clarified) {
      setPendingQuestion(question);
      setPendingParams(params);
      
      // 时间不再追问，已有默认值
      // Top N查询通常有默认指标（金额/销售额），如果缺少指标且不是Top N查询才追问
      if (needMetric && !isTopNQuery) {
        setExpectMetric(true);
        ask('您想关注哪个指标？例如：销售额、利润、用户数、订单数，或直接输入您关注的指标。');
        return;
      }
    }

    proceedWithQuery(params, base, question);
  };

  // 发送一个AI的提问文本
  const ask = (text) => {
    const askMsg = {
      id: Date.now(),
      sender: 'ai',
      type: 'text',
      text,
      time: formatDateTime(new Date())
    };
    setMessages(prev => [...prev, askMsg]);
  };

  /**
   * 生成推荐问题
   * @param {string} question - 原始问题
   * @param {Object} data - 回答的数据
   */
  const generateSuggestedQuestions = (question, data) => {
    const suggestions = [];
    
    // 提取关键词
    const hasTopN = /前\d+大|最高的?\d+个/.test(question);
    const hasYoY = /同比|环比|增长|上升|下降/.test(question);
    const hasProduct = /产品/.test(question);
    const hasRegion = /地区|区域/.test(question);
    const hasCustomer = /客户/.test(question);
    const hasSales = /销售|收入/.test(question);
    const isAnalysis = /分析/.test(question);
    
    // 根据问题类型生成推荐
    if (hasTopN) {
      // Top N查询推荐
      suggestions.push(`${question.replace(/\?|？/g, '')}，为什么？`);
      if (hasSales) {
        suggestions.push('分析一下销售趋势');
      }
      if (hasProduct || hasRegion) {
        suggestions.push('同比变化情况如何？');
      }
    } else if (hasYoY || /增长|上升|下降/.test(question)) {
      // 同比/增长查询推荐
      suggestions.push('主要原因是什么？');
      if (hasProduct) {
        suggestions.push('不同产品的增长情况对比');
      }
      if (hasRegion) {
        suggestions.push('各地区增长情况');
      }
    } else if (isAnalysis) {
      // 分析类查询推荐
      suggestions.push('同比变化如何？');
      suggestions.push('各维度详细对比');
      suggestions.push('有什么改进建议？');
    } else {
      // 普通查询推荐
      suggestions.push('同比变化情况如何？');
      if (hasProduct || hasRegion || hasCustomer) {
        suggestions.push('详细分析一下');
      } else {
        suggestions.push('按产品维度拆分');
      }
      suggestions.push('为什么会这样？');
    }
    
    // 确保返回3个推荐问题
    return suggestions.slice(0, 3);
  };

  // 处理推荐问题点击
  const handleSuggestedQuestionClick = (suggestedQuestion) => {
    // 将推荐问题填充到输入框
    setInputValue(suggestedQuestion);
    
    // 聚焦到输入框（通过延迟确保 DOM 已更新）
    setTimeout(() => {
      const textarea = document.querySelector('.message-input');
      if (textarea) {
        textarea.focus();
        // 将光标移动到文本末尾
        textarea.setSelectionRange(suggestedQuestion.length, suggestedQuestion.length);
      }
    }, 0);
  };

  const proceedWithQuery = (params, baseMessages, originalQuestion) => {
    // 设置生成状态
    setIsGenerating(true);
    generationTimeoutsRef.current = []; // 清空之前的 timeout 列表
    
    // 创建合并的思考过程消息
    const combinedId = `combined_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    currentCombinedIdRef.current = combinedId;
    
    // 分析问题，识别意图
    const question = originalQuestion || '查询';
    
    // 检测是否为复合问题（同时包含查询和分析）
    const hasQuery = /(查询|统计|查看|显示|是什么|哪些|多少|排名|前.+大|最高|最低)/.test(question);
    const hasAnalysis = /(分析|原因|为什么)/.test(question);
    const isCompositeQuestion = hasQuery && hasAnalysis;
    
    // 检测是否为单纯的分析类问题（深度分析，不包括同比/环比查询）
    const isAnalysis = !isCompositeQuestion && 
                       (/(原因|为什么|分析一下)/.test(question) && 
                        !/(同比|环比|上升多少|下降多少|增长多少)/.test(question));
    
    // 如果是单纯分析类问题，查找上一次的查询结果
    let previousResult = null;
    if (isAnalysis) {
      // 从后往前查找最近一次type为'result'的消息
      for (let i = baseMessages.length - 1; i >= 0; i--) {
        if (baseMessages[i].type === 'result' && baseMessages[i].data) {
          previousResult = baseMessages[i].data;
          console.log('🔍 找到上一轮结果，索引:', i, '数据:', previousResult);
          break;
        }
      }
      if (!previousResult) {
        console.log('❌ 没有找到上一轮结果，messages长度:', baseMessages.length);
      }
    }
    
    const intentData = analyzeIntents(question, params, isCompositeQuestion);
    const thinkingSteps = generateThinkingSteps(question, params, isCompositeQuestion, intentData.description);
    
    // 提取相关数据信息
    const dataInfo = {
      time: intentData.time || '',
      metrics: intentData.metrics || [],
      dimensions: intentData.dimensions || []
    };
    
    // 获取当前有效配置
    const currentConfig = getEffectiveConfig();
    
    // 处理数据来源
    let sourceDisplay = '全部数据';
    if (currentConfig.sourceMode === 'tables') {
      const tables = currentConfig.selectedTables || [];
      sourceDisplay = tables.length > 0 ? `指定表（${tables.join('、')}）` : '指定表（0个）';
    } else if (currentConfig.sourceMode === 'files') {
      const files = currentConfig.selectedFiles || [];
      sourceDisplay = files.length > 0 ? `指定文件（${files.join('、')}）` : '指定文件（0个）';
    }
    
    // 处理数据范围
    let scopeDisplay = '集团总数据';
    if (currentConfig.scopeType === 'branches') {
      const branches = currentConfig.selectedBranches || [];
      scopeDisplay = branches.length > 0 ? `指定分公司（${branches.join('、')}）` : '指定分公司（）';
    }
    
    // 处理数据口径
    const caliberDisplay = currentConfig.caliber === 'external' ? '对外披露用（法口）' : '内部管理用（管口）';
    
    const configDisplay = {
      source: sourceDisplay,
      scope: scopeDisplay,
      caliber: caliberDisplay
    };
    
    const combinedMessage = {
      id: combinedId,
      sender: 'ai',
      type: 'combined',
      intentData: { ...intentData, status: 'loading' },
      config: configDisplay,
      dataInfo: dataInfo,
      steps: thinkingSteps.map(step => ({ ...step, status: 'loading' })),
      isComplete: false,
      originalQuestion: question, // 保存原始问题用于生成推荐问题
      time: formatDateTime(new Date())
    };
    
    setMessages(prev => [...baseMessages, combinedMessage]);

    // 阶段1: 意图识别完成
    const timeout1 = setTimeout(() => {
      setMessages(prev => prev.map(m => {
        if (m.id === combinedId) {
          return {
            ...m,
            intentData: { ...m.intentData, status: 'done' }
          };
        }
        return m;
      }));
    }, 800);
    generationTimeoutsRef.current.push(timeout1);

    // 阶段2: 逐步完成思考步骤
    thinkingSteps.forEach((step, index) => {
      const timeout2 = setTimeout(() => {
        setMessages(prev => prev.map(m => {
          if (m.id === combinedId) {
            const newSteps = [...m.steps];
            newSteps[index] = { ...newSteps[index], status: 'done' };
            return {
              ...m,
              steps: newSteps,
              isComplete: index === thinkingSteps.length - 1
            };
          }
          return m;
        }));
      }, 1200 + 400 * (index + 1));
      generationTimeoutsRef.current.push(timeout2);
    });

    // 阶段3: 显示结果
    const timeout3 = setTimeout(() => {
      let resultData;
      
      if (isCompositeQuestion) {
        // 复合问题：生成查询结果并同时进行分析
        resultData = generateMockResult(question, params, true); // 传入true表示需要分析
      } else if (isAnalysis && previousResult) {
        // 单纯分析问题：基于上一次结果
        resultData = generateAnalysisFromPreviousResult(question, params, previousResult);
      } else {
        // 单纯查询问题：生成查询结果
        resultData = generateMockResult(question, params, false);
      }
      
      const aiResponseMessage = {
        id: `result_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        sender: 'ai',
        type: 'result',
        data: {
          params: params,
          ...resultData
        },
        originalQuestion: question, // 保存原始问题用于生成推荐问题
        time: formatDateTime(new Date())
      };
      setMessages(prev => [...prev, aiResponseMessage]);
      setPendingQuestion('');
      setPendingParams({});
      
      // 生成完成，重置状态
      setIsGenerating(false);
      generationTimeoutsRef.current = [];
      currentCombinedIdRef.current = null;
    }, 1200 + 400 * thinkingSteps.length + 500);
    generationTimeoutsRef.current.push(timeout3);
  };

  /**
   * 分析问题，识别意图
   */
  const analyzeIntents = (question, params, isCompositeQuestion = false) => {
    // 识别维度
    const dimensionList = [];
    const dimensionText = [];
    if (question.includes('产品') || question.includes('品类')) {
      dimensionList.push('product');
      dimensionText.push('产品');
    }
    if (question.includes('地区') || question.includes('区域')) {
      dimensionList.push('region');
      dimensionText.push('地区');
    }
    
    // 识别指标
    const metric = params.metric || '销售额';
    
    // 识别时间
    const timeText = params.timeRangeText || '今年每月';
    
    // 构建意图描述
    let description = '';
    if (isCompositeQuestion) {
      // 复合问题：同时包含查询和分析
      if (dimensionList.length > 0) {
        const dimStr = dimensionText.join('和');
        description = `查询${timeText}按${dimStr}维度统计的${metric}数据，并分析变化原因`;
      } else {
        description = `查询${timeText}的${metric}趋势数据，并分析变化原因`;
      }
    } else {
      // 单一意图
      if (dimensionList.length > 0) {
        const dimStr = dimensionText.join('和');
        description = `查询${timeText}按${dimStr}维度统计的${metric}数据`;
      } else {
        description = `查询${timeText}的${metric}趋势数据`;
      }
    }
    
    // 收集所有相关指标（中文）
    const allMetrics = [
      metric,
      '单单价',
      '客单价',
      '埋效',
      '销售数量',
      '毛利额',
      '人效',
      '折扣率',
      '竿单价',
      '产品销售价格'
    ];
    
    // 收集所有维度
    const allDimensions = [];
    if (dimensionList.length > 0) {
      if (dimensionList.includes('product')) {
        allDimensions.push('产品');
      }
      if (dimensionList.includes('region')) {
        allDimensions.push('地区');
      }
    } else {
      allDimensions.push('产品', '地区');
    }
    
    return {
      description,
      time: timeText,  // 添加时间字段
      metrics: allMetrics,
      dimensions: allDimensions,
      status: 'loading'
    };
  };

  /**
   * 生成思考步骤 - 优化的4步或5步流程
   */
  const generateThinkingSteps = (question, params, isCompositeQuestion = false, intentDescription = '') => {
    // 识别维度
    const dimensionList = [];
    if (question.includes('产品') || question.includes('品类')) {
      dimensionList.push('产品');
    }
    if (question.includes('地区') || question.includes('区域')) {
      dimensionList.push('地区');
    }
    
    const metric = params.metric || '销售额';
    const timeText = params.timeRangeText || '今年每月';

    // 将"最近N年"规范化为具体年份列表（仅用于问题改写展示）
    const normalizeTimeForRewrite = (text) => {
      if (!text) return text;
      const match = text.match(/最近(\d+|[一二三四五六七八九十]+)年/);
      if (match) {
        const numStr = match[1];
        const numMap = { 一:1, 二:2, 三:3, 四:4, 五:5, 六:6, 七:7, 八:8, 九:9, 十:10 };
        const n = parseInt(numStr, 10) || numMap[numStr] || 0;
        if (n > 0) {
          const currentYear = new Date().getFullYear();
          const start = currentYear - (n - 1);
          const years = Array.from({ length: n }, (_, i) => `${start + i}年`);
          return years.join('、');
        }
      }
      return text;
    };
    const rewrittenTimeText = normalizeTimeForRewrite(timeText);
    
    const normalizedDims = dimensionList.length > 0 ? `按${dimensionList.join('、')}维度` : '';
    
    let steps;
    if (isCompositeQuestion) {
      // 复合问题：包含查询和分析两个意图
      steps = [
        {
          description: `识别用户意图：${intentDescription}`,
          isIntentStep: true
        },
        {
          description: `问题改写：将用户问题标准化为"查询${rewrittenTimeText}${normalizedDims}的${metric}，并分析变化原因"`
        },
        { 
          description: `问题拆解：识别出两个意图 - ①查询数据：时间范围（${timeText}）${dimensionList.length > 0 ? `、业务维度（${dimensionList.join('、')}）` : ''}和分析指标（${metric}）；②分析原因：基于查询结果分析变化趋势和影响因子`,
          showDetails: true
        },
        { 
          description: `数据定位：销售数据表（actual_amount, order_date）、订单明细表（quantity, product_id）、产品主数据（product_name, category）、组织架构表（region_name, branch_name）`
        },
        { 
          description: `查询与计算：基于时间/维度条件生成SQL，按维度分组并聚合计算${metric}；补齐缺失时间点、对空值补0，计算同比/环比与占比并输出小数位格式化结果`
        },
        { 
          description: `因子分析：对查询结果进行多维分解，计算数量、价格、结构对${metric}变化的贡献度；识别关键维度的影响权重`
        },
        { 
          description: `生成结果：整理计算结果，生成数据表格并输出分析报告（概览、因子影响、维度影响、结论）`
        }
      ];
    } else {
      // 单一问题：只查询或只分析
      steps = [
        {
          description: `识别用户意图：${intentDescription}`,
          isIntentStep: true
        },
        {
          description: `问题改写：将用户问题标准化为"查询${rewrittenTimeText}${normalizedDims}的${metric}"`
        },
        { 
          description: `问题拆解：识别时间范围（${timeText}）${dimensionList.length > 0 ? `、业务维度（${dimensionList.join('、')}）` : ''}和分析指标（${metric}）`,
          showDetails: true
        },
        { 
          description: `数据定位：销售数据表（actual_amount, order_date）、订单明细表（quantity, product_id）、产品主数据（product_name, category）、组织架构表（region_name, branch_name）`
        },
        { 
          description: `查询与计算：基于时间/维度条件生成SQL，按维度分组并聚合计算${metric}；补齐缺失时间点、对空值补0，计算同比/环比与占比并输出小数位格式化结果`
        },
        { 
          description: `生成结果：整理计算结果，生成数据表格和分析洞察`
        }
      ];
    }
    
    return steps;
  };

  // 前端模拟的意图预解析函数
  const preParseQuestion = (question) => {
    const params = {};

    // ===== 增强的时间识别 =====
    // 统一单位片段（允许"个月"）
    const unit = '(天|周|个?月|季度|季|年)';
    const timeRegexList = [
      /(\d+)\s*[-~到至]\s*(\d+)\s*月/,                                     // 1-6月、1到6月
      /(今年|本年|当年)/,                                                   // 今年、本年、当年
      new RegExp(`(本|这|当)${unit}`),                                  // 本月、本季度
      new RegExp(`(上上|上)(周|个?月|季度|季|年)`),                       // 上月、上上月、上季度
      new RegExp(`过去[一二三四五六七八九十]+${unit}`),                    // 过去三年（中文数字）
      new RegExp(`过去\\s*\\d+${unit}`),                                // 过去 3 年（阿拉伯数字）
      new RegExp(`最近[一二三四五六七八九十]+${unit}`),                    // 最近三个月（中文数字）
      new RegExp(`近[一二三四五六七八九十]+${unit}`),                      // 近三个月（中文数字）
      new RegExp(`最近\\s*\\d+${unit}`),                                // 最近 3 个月（阿拉伯数字）
      new RegExp(`近\\s*\\d+${unit}`),                                  // 近 3 个月
      /\d{4}\s*年/,                                                       // 2024年
      /Q[1-4]/i,                                                           // Q1-Q4
      /(第?一|第?二|第?三|第?四)季度/,                                       // 第一季度
      /(去年同期|同比|环比)/                                              // 去年同期/同比/环比
    ];
    
    // 提取时间文本
    let timeText = null;
    for (const re of timeRegexList) {
      const match = question.match(re);
      if (match) {
        timeText = match[0];
        break;
      }
    }
    // 如果识别到时间，使用识别到的时间；否则默认为所有时间，不需要追问
    const needTime = false; // 不再追问时间
    if (timeText) {
      params.timeRangeText = timeText;
    } else {
      // 没有识别到时间时，默认为所有时间
      params.timeRangeText = '所有时间';
    }

    // ===== 增强的指标识别 =====
    const metricSynonyms = [
      { core: '销售额', words: ['销售额', '销售', '销售收入', '营业额', '营收', '收入'] },
      { core: '利润', words: ['利润', '毛利', '净利', '盈利'] },
      { core: '用户数', words: ['用户数', '用户', '活跃用户', '新增用户', 'DAU', 'MAU'] },
      { core: '订单数', words: ['订单数', '订单', '单量', '成交单量', '订单量'] },
    ];
    let metricFound = '';
    for (const m of metricSynonyms) {
      if (m.words.some((w) => question.includes(w))) {
        metricFound = m.core;
        break;
      }
    }
    const needMetric = !metricFound;
    if (metricFound) params.metric = metricFound;

    // 现在只需要判断指标是否缺失，时间已经有默认值
    const clarified = !needMetric;
    return { clarified, params, needTime, needMetric };
  };

  /**
   * 生成同比/环比结果
   */
  const generateYoYResult = (question, previousResultMessage) => {
    const isYoY = question.includes('同比') || /(上升|下降|增长)/.test(question); // 上升/下降默认为同比
    const compareType = isYoY ? '同比' : '环比';
    
    // 检查是否问题本身就包含了完整的查询信息（如：今年A产品收入增长多少？）
    const hasCompleteInfo = /([A-Z]产品|行业|地区).*?(收入|销售额|利润).*?(增长|上升|下降)/.test(question) ||
                            /(增长|上升|下降).*?(收入|销售额|利润).*?多少/.test(question);
    
    // 如果问题包含完整信息，直接从问题生成结果
    if (hasCompleteInfo) {
      return generateYoYFromQuestion(question, compareType, isYoY);
    }
    
    // 否则，如果有上一轮结果，从中提取数据
    if (previousResultMessage && previousResultMessage.data) {
      const previousData = previousResultMessage.data;
      if (previousData.resultBlocks && previousData.resultBlocks.length > 0) {
        return generateYoYFromPreviousResult(previousData, question, compareType, isYoY);
      }
    }
    
    // 如果没有上一轮结果，从问题中直接提取并生成同比数据
    return generateYoYFromQuestion(question, compareType, isYoY);
  };
  
  /**
   * 从上一轮结果生成同比数据
   */
  const generateYoYFromPreviousResult = (previousData, question, compareType, isYoY) => {
    
    const firstBlock = previousData.resultBlocks[0];
    const tableData = firstBlock.tableData;
    
    // 识别是单个值还是多维度数据
    if (tableData.dataSource.length === 1 && tableData.columns.length === 2) {
      // 单个值场景（如：2025年风能行业的收入）
      const currentValue = tableData.dataSource[0][tableData.columns[1].dataIndex];
      const previousValue = Math.round(currentValue / (1 + (Math.random() * 0.3 - 0.1))); // 模拟去年数据
      const growth = (((currentValue - previousValue) / previousValue) * 100).toFixed(2);
      const growthAbs = Math.abs(growth);
      
      const metric = tableData.columns[1].title.replace(' (万元)', '');
      const summary = `${compareType}${growth > 0 ? '增长' : '下降'}${growthAbs}%。今年${metric}为${currentValue}万元，${isYoY ? '去年同期' : '上期'}为${previousValue}万元。`;
      
      const columns = [
        { title: '项目', dataIndex: 'item', key: 'item', width: 150 },
        { title: `本期${metric}（万元）`, dataIndex: 'current', key: 'current', align: 'right', width: 150 },
        { title: `${isYoY ? '去年同期' : '上期'}${metric}（万元）`, dataIndex: 'previous', key: 'previous', align: 'right', width: 150 },
        { title: `${compareType}增长额（万元）`, dataIndex: 'diff', key: 'diff', align: 'right', width: 150 },
        { title: `${compareType}增长率`, dataIndex: 'growthRate', key: 'growthRate', align: 'right', width: 120 }
      ];
      
      const diff = currentValue - previousValue;
      
      const dataSource = [{
        key: '1',
        item: tableData.dataSource[0][tableData.columns[0].dataIndex],
        current: currentValue,
        previous: previousValue,
        diff: diff,
        growthRate: `${growth}%`
      }];
      return {
        summary: '',
        resultBlocks: [{
          title: `${compareType}增长分析`,
          description: summary,
          sources: [
            { type: 'database', name: '业务数据库-销售汇总表', fullPath: 'sales_db.sales_summary' },
            { type: 'excel', name: '2025年销售数据.xlsx', fullPath: '/data/sales/2025_sales.xlsx', 
              references: [
                { location: 'Sheet1, A1:D100' },
                { location: 'Sheet2, E5:G50' },
                { location: 'Sheet3, B10:F80' }
              ]
            },
            { type: 'database', name: '财务系统-收入明细', fullPath: 'finance_db.revenue_detail' }
          ],
          tableData: {
            columns,
            dataSource,
            scroll: { x: 720 }
          }
        }],
        analysis: undefined  // 第一轮只返回表格，不返回分析
      };
    }
    
    // 多维度数据场景（暂不处理）
    return {
      summary: '多维度数据的同比分析功能开发中。',
      resultBlocks: [],
      analysis: undefined
    };
  };
  
  /**
   * 从问题中直接提取信息生成同比数据
   */
  const generateYoYFromQuestion = (question, compareType, isYoY) => {
    // 提取产品名称
    const productMatch = question.match(/([A-Z]产品|[A-Z]产品线)/);
    const productName = productMatch ? productMatch[1] : '产品';
    
    // 提取年份
    const yearMatch = question.match(/(\d{4})年|今年|本年/);
    const currentYear = yearMatch ? (yearMatch[1] ? parseInt(yearMatch[1]) : new Date().getFullYear()) : new Date().getFullYear();
    const previousYear = currentYear - 1;
    
    // 提取指标
    const metric = question.includes('收入') ? '收入' : '销售额';
    
    // 生成模拟数据
    const currentValue = 3200;
    const previousValue = Math.round(currentValue / 1.16); // 假设增长16%
    const diff = currentValue - previousValue;
    const growth = ((diff / previousValue) * 100).toFixed(2);
    const growthAbs = Math.abs(growth);
    
    const summary = `${compareType}${growth > 0 ? '增长' : '下降'}${growthAbs}%。${currentYear}年${metric}为${currentValue}万元，${previousYear}年为${previousValue}万元。`;
    
    const columns = [
      { title: '项目', dataIndex: 'item', key: 'item', width: 150 },
      { title: `${currentYear}年${metric}（万元）`, dataIndex: 'current', key: 'current', align: 'right', width: 150 },
      { title: `${previousYear}年${metric}（万元）`, dataIndex: 'previous', key: 'previous', align: 'right', width: 150 },
      { title: `${compareType}增长额（万元）`, dataIndex: 'diff', key: 'diff', align: 'right', width: 150 },
      { title: `${compareType}增长率`, dataIndex: 'growthRate', key: 'growthRate', align: 'right', width: 120 }
    ];
    
    const dataSource = [{
      key: '1',
      item: productName,
      current: currentValue,
      previous: previousValue,
      diff: diff,
      growthRate: `${growth}%`
    }];
    return {
      summary: '',
      resultBlocks: [{
        title: `${productName}${compareType}增长分析`,
        description: summary,
        sources: [
          { type: 'database', name: '业务数据库-产品主表', fullPath: 'main_db.products' },
          { type: 'pdf', name: '产品销售报告2024.pdf', fullPath: '/reports/product_sales_2024.pdf',
            references: [
              { location: '第3页，表格1' },
              { location: '第7页，图表2' }
            ]
          },
          { type: 'database', name: '财务系统-收入明细', fullPath: 'finance_db.revenue_detail' }
        ],
        tableData: {
          columns,
          dataSource,
          scroll: { x: 720 }
        }
      }],
      analysis: undefined  // 第一轮只返回表格，不返回分析
    };
  };

  /**
   * 基于上一次查询结果生成分析
   */
  const generateAnalysisFromPreviousResult = (question, params, previousResult) => {
    const metric = params.metric || '销售额';
    
    console.log('📊 开始生成分析，上一轮结果:', previousResult);
    
    // 从上一次结果中提取数据
    const resultBlocks = previousResult.resultBlocks || [];
    if (resultBlocks.length === 0) {
      console.log('❌ 没有找到resultBlocks');
      return {
        summary: '',
        resultBlocks: [],
        analysis: undefined
      };
    }
    
    // 取第一个block的数据进行分析
    const firstBlock = resultBlocks[0];
    const tableData = firstBlock.tableData;
    if (!tableData || !tableData.dataSource || tableData.dataSource.length === 0) {
      console.log('❌ tableData不存在或数据为空', tableData);
      return {
        summary: '',
        resultBlocks: [],
        analysis: undefined
      };
    }
    
    console.log('✅ 找到有效数据，columns:', tableData.columns.map(c => c.dataIndex));
    
    // 检查是否为同比增长表格（包含current和previous列）
    const hasCurrentPrevious = tableData.columns.some(col => col.dataIndex === 'current') && 
                                tableData.columns.some(col => col.dataIndex === 'previous');
    
    if (hasCurrentPrevious) {
      // 处理同比增长表格
      const row = tableData.dataSource[0];
      const itemName = row.item || row[tableData.columns[0].dataIndex];
      const currentValue = row.current;
      const previousValue = row.previous;
      const growth = ((currentValue - previousValue) / previousValue * 100).toFixed(2);
      const growthAbs = Math.abs(growth);
      const currentYear = new Date().getFullYear();
      const previousYear = currentYear - 1;
      
      // 从表格列名中提取指标名称
      const currentCol = tableData.columns.find(col => col.dataIndex === 'current');
      const metricName = currentCol ? currentCol.title.replace(/（万元）|年.*/, '').replace(/\d+年/, '') : metric;
      
      // 1. 分析结果概述
      const resultSummary = `${itemName}同比表现${growth > 0 ? '强劲' : '承压'}，${currentYear}年${metricName}为${currentValue}万元，较${previousYear}年的${previousValue}万元${growth > 0 ? '增长' : '下降'}${growthAbs}%，增长额${Math.abs(currentValue - previousValue)}万元。`;
      
      // 2. 因子分析 - 生成具体数据
      // 模拟数量、价格、结构的详细数据
      const lastYearQty = Math.round(previousValue / 2.5); // 假设去年销售数量
      const currentYearQty = Math.round(lastYearQty * (1 + (0.03 + Math.random() * 0.05))); // 今年数量增长3-8%
      const qtyGrowthRate = (((currentYearQty - lastYearQty) / lastYearQty) * 100).toFixed(1);
      
      const lastYearPrice = (previousValue / lastYearQty).toFixed(2); // 去年单价
      const currentYearPrice = (currentValue / currentYearQty).toFixed(2); // 今年单价
      const priceGrowthRate = (((currentYearPrice - lastYearPrice) / lastYearPrice) * 100).toFixed(1);
      
      const mixEffect = (parseFloat(growth) - parseFloat(qtyGrowthRate) - parseFloat(priceGrowthRate)).toFixed(1);
      
      const factorAnalysis = `从增长因子分解看，本期${growth > 0 ? '增长' : '下降'}主要由以下因素驱动：
①数量效应：${previousYear}年销售数量${lastYearQty}万件，${currentYear}年增至${currentYearQty}万件，增长率+${qtyGrowthRate}%，市场需求${parseFloat(qtyGrowthRate) > 0 ? '扩大' : '收缩'}；
②价格效应：${previousYear}年平均单价${lastYearPrice}元/件，${currentYear}年${parseFloat(priceGrowthRate) > 0 ? '提升至' : '下降至'}${currentYearPrice}元/件，变化率${priceGrowthRate > 0 ? '+' : ''}${priceGrowthRate}%，产品${parseFloat(priceGrowthRate) > 0 ? '单价提升' : '价格下调'}；
③结构效应：高附加值产品占比变化约${mixEffect > 0 ? '+' : ''}${mixEffect}%，结构${parseFloat(mixEffect) > 0 ? '优化' : '调整'}。
${parseFloat(priceGrowthRate) > parseFloat(qtyGrowthRate) ? '价格驱动为主导因素' : '数量驱动为主导因素'}，${Math.abs(parseFloat(qtyGrowthRate)) > 2 && Math.abs(parseFloat(priceGrowthRate)) > 2 ? '数量与价格共同正向贡献' : '需关注其他因素影响'}。`;
      
      // 3. 维度分析 - 添加具体区域/渠道数据
      const regions = ['华东', '华南', '华北'];
      const regionData = regions.map((region, idx) => {
        const ratio = [0.45, 0.32, 0.23][idx];
        const regionValue = Math.round(currentValue * ratio);
        const regionGrowth = (parseFloat(growth) + (Math.random() * 10 - 5)).toFixed(1);
        return { region, value: regionValue, growth: regionGrowth };
      });
      
      const dimAnalysis = `从业务结构看，${itemName}在${currentYear}年${growth > 0 ? '保持稳健增长态势' : '面临调整压力'}。
按区域维度：${regionData[0].region}区域${metricName}${regionData[0].value}万元，同比${regionData[0].growth > 0 ? '+' : ''}${regionData[0].growth}%，占比${(regionData[0].value / currentValue * 100).toFixed(1)}%；${regionData[1].region}区域${regionData[1].value}万元，同比${regionData[1].growth > 0 ? '+' : ''}${regionData[1].growth}%；${regionData[2].region}区域${regionData[2].value}万元，同比${regionData[2].growth > 0 ? '+' : ''}${regionData[2].growth}%。
${growth > 0 ? '头部市场表现亮眼，新客户拓展效果显著，产品竞争力持续增强' : '受市场环境影响，部分区域承压明显，需加强市场拓展和产品创新'}。`;
      
      // 4. 分析结论
      const conclusion = `综合判断：${itemName}同比${growth > 0 ? '增长' : '下降'}${growthAbs}%，${growth > 0 ? '表现优于预期' : '需关注风险'}。${parseFloat(priceGrowthRate) > 5 ? '价格策略效果显著，' : ''}${parseFloat(qtyGrowthRate) > 5 ? '市场规模扩张明显，' : ''}建议${growth > 0 ? '持续关注价格策略的可持续性，巩固数量增长基础，进一步优化产品结构' : '加强市场分析，优化产品定价，拓展新的增长点'}，确保业绩稳定增长。`;
      
      // 生成因子分解表格
      const factorTableData = {
        columns: [
          { title: '因子', dataIndex: 'factor', key: 'factor', width: 100 },
          { title: `${previousYear}年`, dataIndex: 'lastYear', key: 'lastYear', align: 'right', width: 120 },
          { title: `${currentYear}年`, dataIndex: 'currentYear', key: 'currentYear', align: 'right', width: 120 },
          { title: '变化率', dataIndex: 'changeRate', key: 'changeRate', align: 'right', width: 100 },
          { title: '贡献度', dataIndex: 'contribution', key: 'contribution', align: 'right', width: 100 }
        ],
        dataSource: [
          { 
            key: '1', 
            factor: '数量（万件）', 
            lastYear: lastYearQty, 
            currentYear: currentYearQty, 
            changeRate: `${qtyGrowthRate > 0 ? '+' : ''}${qtyGrowthRate}%`,
            contribution: `${qtyGrowthRate}%`
          },
          { 
            key: '2', 
            factor: '单价（元/件）', 
            lastYear: lastYearPrice, 
            currentYear: currentYearPrice, 
            changeRate: `${priceGrowthRate > 0 ? '+' : ''}${priceGrowthRate}%`,
            contribution: `${priceGrowthRate}%`
          },
          { 
            key: '3', 
            factor: '结构效应', 
            lastYear: '基期', 
            currentYear: '报告期', 
            changeRate: `${mixEffect > 0 ? '+' : ''}${mixEffect}%`,
            contribution: `${mixEffect}%`
          }
        ]
      };
      
      // 生成区域维度表格
      const dimensionTableData = {
        columns: [
          { title: '区域', dataIndex: 'region', key: 'region', width: 100 },
          { title: `${metricName}（万元）`, dataIndex: 'value', key: 'value', align: 'right', width: 150 },
          { title: '同比增长率', dataIndex: 'growth', key: 'growth', align: 'right', width: 120 },
          { title: '占比', dataIndex: 'ratio', key: 'ratio', align: 'right', width: 100 }
        ],
        dataSource: regionData.map((item, idx) => ({
          key: String(idx + 1),
          region: item.region,
          value: item.value,
          growth: `${item.growth > 0 ? '+' : ''}${item.growth}%`,
          ratio: `${(item.value / currentValue * 100).toFixed(1)}%`
        }))
      };
      
      return {
        summary: '',
        resultBlocks: [],
        analysis: {
          resultSummary,
          dimensionAnalysis: dimAnalysis,
          factorAnalysis,
          conclusion,
          factors: { qtyGrowth: qtyGrowthRate, priceGrowth: priceGrowthRate, mixEffect },
          // 因子分析表格和数据来源
          factorTableData: factorTableData,
          factorSources: [
            { type: 'database', name: '业务数据库-销售明细表', fullPath: 'sales_db.sales_detail' },
            { type: 'database', name: '业务数据库-订单明细表', fullPath: 'sales_db.order_detail' }
          ],
          // 维度分析表格和数据来源
          dimensionTableData: dimensionTableData,
          dimensionSources: [
            { type: 'database', name: '业务数据库-区域汇总表', fullPath: 'sales_db.regional_summary' },
            { type: 'database', name: '组织架构-区域映射表', fullPath: 'org_db.region_mapping' }
          ]
        }
      };
    }
    
    // 处理时间序列表格（year_2023, year_2024格式）
    const yearColumns = tableData.columns.filter(col => col.dataIndex && col.dataIndex.startsWith('year_'));
    if (yearColumns.length < 2) {
      return {
        summary: '',
        resultBlocks: [],
        analysis: undefined
      };
    }
    
    const lastYearCol = yearColumns[yearColumns.length - 1].dataIndex;
    const prevYearCol = yearColumns[yearColumns.length - 2].dataIndex;
    const lastYear = lastYearCol.replace('year_', '');
    const prevYear = prevYearCol.replace('year_', '');
    
    // 计算总体数据
    const totalLast = tableData.dataSource.reduce((sum, row) => sum + (row[lastYearCol] || 0), 0);
    const totalPrev = tableData.dataSource.reduce((sum, row) => sum + (row[prevYearCol] || 0), 0);
    const growth = ((totalLast - totalPrev) / totalPrev * 100).toFixed(2);
    
    // 1. 分析结果概述
    const resultSummary = `总体来看，${lastYear}年${metric}合计约${(totalLast / 10000).toFixed(2)}万元，较${prevYear}年${growth > 0 ? '增长' : '下降'}${Math.abs(growth)}%。`;
    
    // 2. 维度分析
    const sortedRows = [...tableData.dataSource].sort((a, b) => (b[lastYearCol] || 0) - (a[lastYearCol] || 0));
    const top1 = sortedRows[0];
    const top2 = sortedRows[1];
    const dimName = tableData.columns[0].title;
    const top1Name = top1[tableData.columns[0].dataIndex];
    const top2Name = top2 ? top2[tableData.columns[0].dataIndex] : '';
    const top1Value = (top1[lastYearCol] / 10000).toFixed(2);
    const dimAnalysis = `按${dimName}维度，Top1为"${top1Name}"，${metric}为${top1Value}万元${top2Name ? `；Top2为"${top2Name}"` : ''}。结构上呈现"头部集中、腰部分散"的特征。`;
    
    // 3. 因子分析
    const qtyGrowth = (2 + Math.random() * 4).toFixed(1);
    const priceGrowth = (1 + Math.random() * 3).toFixed(1);
    const mixEffect = (Math.random() * 1.5).toFixed(1);
    const factorAnalysis = `从因子分解看，数量提升约+${qtyGrowth}%、价格提升约+${priceGrowth}%、结构效应约+${mixEffect}%，数量驱动为主，价格与结构共同正向贡献。`;
    
    // 4. 分析结论
    const conclusion = `综合判断：本期${growth > 0 ? '增长' : '下降'}以头部${dimName}拉动为主，建议关注头部项的持续性与腰部项的挖潜空间，并结合市场情况进一步验证。`;
    
    return {
      summary: '',
      resultBlocks: [], // 分析类问题不显示表格
      analysis: {
        resultSummary,
        dimensionAnalysis: dimAnalysis,
        factorAnalysis,
        conclusion,
        factors: { qtyGrowth, priceGrowth, mixEffect }
      }
    };
  };

  /**
   * 生成多维度多指标分析结果
   * @param {Object} params - 包含 dimensions, metrics, timeRangeText
   */
  const generateMultiDimensionAnalysis = (params) => {
    console.log('📊 开始生成多维度分析，参数:', params);
    const { dimensions, metrics, timeRangeText } = params;
    const currentYear = new Date().getFullYear();
    const previousYear = currentYear - 1;
    
    const dimensionNameMap = {
      'product': '产品线',
      'industry': '行业',
      'company': '分公司',
      'region': '地区'
    };
    
    const dimensionDataMap = {
      'product': ['A产品线', 'B产品线', 'C产品线', 'D产品线'],
      'industry': ['制造业', '零售业', '服务业', '科技业'],
      'company': ['总部', '华东分公司', '华南分公司', '华北分公司'],
      'region': ['华东', '华南', '华北', '西南']
    };
    
    // 为每个维度生成一个表格
    const resultBlocks = dimensions.map(dimKey => {
      const dimName = dimensionNameMap[dimKey] || dimKey;
      const dimData = dimensionDataMap[dimKey] || ['项目1', '项目2', '项目3'];
      
      // 表格列：第一列是维度名，后面是各个指标（本期+同比）
      const columns = [
        { title: dimName, dataIndex: 'name', key: 'name', fixed: 'left', width: 120 }
      ];
      
      metrics.forEach(metricName => {
        columns.push({
          title: `${currentYear}年${metricName}`,
          dataIndex: `current_${metricName}`,
          key: `current_${metricName}`,
          align: 'right',
          width: 150
        });
        columns.push({
          title: `${previousYear}年${metricName}`,
          dataIndex: `previous_${metricName}`,
          key: `previous_${metricName}`,
          align: 'right',
          width: 150
        });
        columns.push({
          title: `同比增长率`,
          dataIndex: `yoy_${metricName}`,
          key: `yoy_${metricName}`,
          align: 'right',
          width: 120
        });
      });
      
      // 生成数据行
      const dataSource = dimData.map((itemName, idx) => {
        const row = { key: String(idx + 1), name: itemName };
        
        metrics.forEach(metricName => {
          let currentValue, unit;
          if (metricName.includes('数量') || metricName.includes('订单')) {
            // 订单数量：件
            currentValue = Math.round(1000 + idx * 200 + Math.random() * 100);
            unit = '';
          } else {
            // 销售金额/利润：万元
            currentValue = Math.round(5000 + idx * 800 + Math.random() * 500);
            unit = '';
          }
          
          const previousValue = Math.round(currentValue / (1 + (0.10 + Math.random() * 0.15))); // 同比增长10-25%
          const yoyRate = (((currentValue - previousValue) / previousValue) * 100).toFixed(1);
          
          row[`current_${metricName}`] = currentValue;
          row[`previous_${metricName}`] = previousValue;
          row[`yoy_${metricName}`] = `${yoyRate > 0 ? '+' : ''}${yoyRate}%`;
        });
        
        return row;
      });
      
      // 计算汇总
      const totalCurrent = {};
      const totalPrevious = {};
      metrics.forEach(metricName => {
        totalCurrent[metricName] = dataSource.reduce((sum, row) => sum + row[`current_${metricName}`], 0);
        totalPrevious[metricName] = dataSource.reduce((sum, row) => sum + row[`previous_${metricName}`], 0);
      });
      
      const metricSummary = metrics.map(m => {
        const growth = ((totalCurrent[m] - totalPrevious[m]) / totalPrevious[m] * 100).toFixed(1);
        return `${m}${totalCurrent[m]}${m.includes('数量') ? '件' : '万元'}（同比${growth > 0 ? '+' : ''}${growth}%）`;
      }).join('、');
      
      return {
        title: `按${dimName}维度分析`,
        description: `${timeRangeText || `${currentYear}年`}按${dimName}维度，${metricSummary}。`,
        sources: [
          { type: 'database', name: `业务数据库-${dimName}汇总表`, fullPath: `sales_db.${dimKey}_summary` },
          { type: 'database', name: '财务系统-收入明细', fullPath: 'finance_db.revenue_detail' },
          { type: 'database', name: '订单管理系统-订单统计', fullPath: 'order_db.order_stats' }
        ],
        tableData: {
          columns,
          dataSource,
          scroll: { x: 120 + metrics.length * 420 }
        }
      };
    });
    
    // 不需要总体summary，每个表格有自己的description
    return {
      summary: '',
      resultBlocks,
      analysis: undefined
    };
  };

  // 根据问题和参数生成模拟结果
  const generateMockResult = (question, params, needAnalysis = false) => {
    // needAnalysis参数表示是否需要同时生成分析内容（复合问题）
    console.log('🔧 generateMockResult 调用，问题:', question, '参数:', params);
    
    // 优先处理同比/环比查询（避免被误判为多维度分析）
    if (params.isYoYQuery) {
      console.log('✅ 识别为同比查询');
      return generateYoYResult(question, params.previousResultMessage);
    }
    
    // 处理多维度多指标分析（只有在明确是多维度分析请求时才使用）
    if (params.dimensions && params.metrics && params.timeRangeText) {
      console.log('✅ 识别为多维度分析，调用 generateMultiDimensionAnalysis');
      return generateMultiDimensionAnalysis(params);
    }
    
    // 检测是否为Top N排名查询
    const topNMatch = question.match(/前(\d+|[一二三四五六七八九十]+)大?(客户|供应商|产品|地区)|最高的?(\d+|[一二三四五六七八九十]+)个?(客户|供应商|产品|地区|行业)/);
    const isTopNQuery = topNMatch !== null;
    
    // 维度识别
    const dimensions = [];
    if (question.includes('产品') || question.includes('品类')) dimensions.push('product');
    if (question.includes('地区') || question.includes('区域')) dimensions.push('region');
    if (question.includes('客户')) dimensions.push('customer');
    if (question.includes('供应商')) dimensions.push('supplier');
    if (question.includes('行业')) dimensions.push('industry');

    // 时间序列识别（排除单个年份如"2025年"）
    const timeUnitsMatch = params.timeRangeText ? params.timeRangeText.match(/(最近|过去|近)(\d+|一|二|三|四|五|六|七|八|九|十)(年|月|季度)/) : null;
    const monthRangeMatch = params.timeRangeText ? params.timeRangeText.match(/(\d+)\s*[-~到至]\s*(\d+)\s*月/) : null;
    const singleYearMatch = params.timeRangeText ? params.timeRangeText.match(/^\d{4}年$/) : null;
    
    const isTimeSeries = params.timeRangeText && 
                         !singleYearMatch && // 排除单个年份
                         (timeUnitsMatch || monthRangeMatch);
    
    // 指标识别
    const metric = params.metric || '销售额';

    // 场景1: 时间序列 + 维度 (e.g., 最近三年每个产品的销售额 或 1-6月各产品收入)
    if (isTimeSeries && dimensions.length > 0) {
        const currentYear = new Date().getFullYear(); // 2025
        let timePeriods = [];
        let timeUnit = '年';
        let periodPrefix = '';
        
        // 处理月度范围 (e.g., 1-6月)
        if (monthRangeMatch) {
            const startMonth = parseInt(monthRangeMatch[1], 10);
            const endMonth = parseInt(monthRangeMatch[2], 10);
            timeUnit = '月';
            for (let m = startMonth; m <= endMonth; m++) {
                timePeriods.push(m);
            }
            periodPrefix = `${currentYear}年`;
        }
        // 处理年度数据（最近N年、过去N年）
        else if (timeUnitsMatch) {
            const numMap = {'一':1, '二':2, '三':3, '四':4, '五':5, '六':6, '七':7, '八':8, '九':9, '十':10};
            const prefix = timeUnitsMatch[1]; // 最近、过去、近
            const numStr = timeUnitsMatch[2];
            const num = parseInt(numStr, 10) || numMap[numStr];
            timeUnit = timeUnitsMatch[3].replace('季', '季度');

            if (num && timeUnit === '年') {
                // "过去三年"和"最近三年"都是从今年往前推
                for (let i = 0; i < num; i++) {
                    timePeriods.push(currentYear - i);
                }
                timePeriods.reverse();
            }
        }
        
        if (timePeriods.length === 0 && params.timeRangeText.includes('年')) {
            timePeriods = [currentYear - 2, currentYear - 1, currentYear];
        }

        if (timePeriods.length > 0) {
            // 为每个维度生成一个 resultBlock
            const resultBlocks = dimensions.map(dimensionKey => {
                const dimensionTitle = { 'product': '产品', 'region': '地区' }[dimensionKey];
                
                const columns = [
                    { title: dimensionTitle, dataIndex: dimensionKey, key: dimensionKey, fixed: 'left', width: 100 },
                    ...timePeriods.map(period => ({
                        title: timeUnit === '月' ? `${period}月 ${metric}` : `${period}年 ${metric}`,
                        dataIndex: timeUnit === '月' ? `month_${period}` : `year_${period}`,
                        key: timeUnit === '月' ? `month_${period}` : `year_${period}`,
                        align: 'right',
                        width: 150
                    }))
                ];

                let dataSource = [];
                let blockSummary = '';
                
                if (dimensionKey === 'product') {
                    const products = ['A产品线', 'B产品线', 'C产品线', 'D产品线'];
                    dataSource = products.map((product, index) => {
                        const row = { key: String(index + 1), [dimensionKey]: product };
                        let baseValue = timeUnit === '月' ? (120 + index * 30) : (800 + index * 150);
                        timePeriods.forEach(period => {
                            const dataKey = timeUnit === '月' ? `month_${period}` : `year_${period}`;
                            row[dataKey] = Math.round(baseValue * (1 + (Math.random() - 0.3) * 0.4));
                            baseValue = row[dataKey];
                        });
                        return row;
                    });
                    
                    // 为产品维度生成总结
                    const lastPeriodCol = timeUnit === '月' ? `month_${timePeriods[timePeriods.length - 1]}` : `year_${timePeriods[timePeriods.length - 1]}`;
                    const firstPeriodCol = timeUnit === '月' ? `month_${timePeriods[0]}` : `year_${timePeriods[0]}`;
                    const sorted = [...dataSource].sort((a, b) => b[lastPeriodCol] - a[lastPeriodCol]);
                    const best = sorted[0];
                    const worst = sorted[sorted.length - 1];
                    const totalValue = dataSource.reduce((sum, item) => sum + item[lastPeriodCol], 0);
                    const bestGrowth = (((best[lastPeriodCol] - best[firstPeriodCol]) / best[firstPeriodCol]) * 100).toFixed(1);
                    
                    if (timeUnit === '月') {
                        blockSummary = `${periodPrefix}上半年，${best.product}表现最优，${timePeriods[timePeriods.length - 1]}月${metric}达${best[lastPeriodCol]}万元，累计贡献${((best[lastPeriodCol] / totalValue) * 100).toFixed(1)}%。各产品线整体保持稳健增长态势。`;
                    } else {
                        blockSummary = `${best.product}持续领先，${timePeriods[timePeriods.length - 1]}年${metric}达${best[lastPeriodCol]}万元，较${timePeriods[0]}年增长${bestGrowth}%。${worst.product}表现相对较弱，仍有较大提升空间。`;
                    }
                    
                } else if (dimensionKey === 'region') {
                    const regions = ['华东', '华南', '华北'];
                    dataSource = regions.map((region, index) => {
                        const row = { key: String(index + 1), [dimensionKey]: region };
                        let baseValue = timeUnit === '月' ? (100 + index * 20) : (700 + index * 100);
                        timePeriods.forEach(period => {
                            const dataKey = timeUnit === '月' ? `month_${period}` : `year_${period}`;
                            row[dataKey] = Math.round(baseValue * (1 + (Math.random() - 0.3) * 0.4));
                            baseValue = row[dataKey];
                        });
                        return row;
                    });
                    
                    // 为地区维度生成总结
                    const lastPeriodCol = timeUnit === '月' ? `month_${timePeriods[timePeriods.length - 1]}` : `year_${timePeriods[timePeriods.length - 1]}`;
                    const sorted = [...dataSource].sort((a, b) => b[lastPeriodCol] - a[lastPeriodCol]);
                    const total = dataSource.reduce((sum, item) => sum + item[lastPeriodCol], 0);
                    const topRegion = sorted[0];
                    const topPercent = ((topRegion[lastPeriodCol] / total) * 100).toFixed(1);
                    
                    if (timeUnit === '月') {
                        blockSummary = `${periodPrefix}上半年，${topRegion.region}区域${metric}领先，${timePeriods[timePeriods.length - 1]}月达${topRegion[lastPeriodCol]}万元，占比${topPercent}%。各区域协同发展态势良好。`;
                    } else {
                        blockSummary = `${topRegion.region}区域${metric}最高，${timePeriods[timePeriods.length - 1]}年达${topRegion[lastPeriodCol]}万元，占总体${topPercent}%。各区域整体保持稳定增长，市场格局较为均衡。`;
                    }
                }
                
                // 为不同维度设置不同的数据来源
                let sources = [];
                if (dimensionKey === 'product') {
                    sources = [
                        { type: 'database', name: '业务数据库-产品销售表', fullPath: 'sales_db.product_sales' },
                        { type: 'database', name: '财务系统-收入明细', fullPath: 'finance_db.revenue_detail' }
                    ];
                } else if (dimensionKey === 'region') {
                    sources = [
                        { type: 'pdf', name: '2025年区域市场分析报告.pdf', fullPath: '/reports/2025_regional_market_analysis.pdf',
                          references: [
                            { location: '第2页，区域分布图' },
                            { location: '第6页，数据汇总表' }
                          ]
                        },
                        { type: 'database', name: '业务数据库-区域汇总表', fullPath: 'sales_db.regional_summary' }
                    ];
                }
                
                return {
                    title: `${params.timeRangeText}${metric}（按${dimensionTitle}）`,
                    description: blockSummary,
                    sources,
                    tableData: {
                        columns,
                        dataSource,
                        scroll: { x: 100 + timePeriods.length * 150 }
                    }
                };
            });
            
            const dimensionTitles = dimensions.map(d => ({ 'product': '产品', 'region': '地区' }[d])).join('、');
            
            // 如果只有一个维度，生成总体summary；如果多个维度，每个block自己的description就是summary
            let summary = '';
            if (dimensions.length === 1) {
                // 单一维度：生成总体总结
                const block = resultBlocks[0];
                summary = block.description;
                // 清空block的description，避免重复显示
                block.description = '';
            } else {
                // 多维度：不需要总体summary，每个block的description就是各自的总结
                summary = '';
            }
            
            // 如果需要分析（复合问题），生成分析内容
            let analysisData = undefined;
            if (needAnalysis && resultBlocks.length > 0) {
              const lastPeriod = timePeriods[timePeriods.length - 1];
              const prevPeriod = timePeriods[timePeriods.length - 2];
              const firstBlock = resultBlocks[0];
              const col = timeUnit === '月' ? `month_${lastPeriod}` : `year_${lastPeriod}`;
              
              // 计算总体数据
              const totalLast = resultBlocks.reduce((sum, b) => 
                sum + (b.tableData.dataSource || []).reduce((s, r) => s + (r[col] || 0), 0), 0
              );
              const prevCol = timeUnit === '月' ? `month_${prevPeriod}` : `year_${prevPeriod}`;
              const totalPrev = resultBlocks.reduce((sum, b) => 
                sum + (b.tableData.dataSource || []).reduce((s, r) => s + (r[prevCol] || 0), 0), 0
              );
              const growth = ((totalLast - totalPrev) / totalPrev * 100).toFixed(2);
              
              // 生成分析内容
              const periodLabel = timeUnit === '月' ? `${lastPeriod}月` : `${lastPeriod}年`;
              const prevPeriodLabel = timeUnit === '月' ? `${prevPeriod}月` : `${prevPeriod}年`;
              const resultSummary = `总体来看，${periodLabel}${metric}合计约${totalLast}万元，较${prevPeriodLabel}${growth > 0 ? '增长' : '下降'}${Math.abs(growth)}%。`;
              
              const sortedRows = [...firstBlock.tableData.dataSource].sort((a, b) => (b[col] || 0) - (a[col] || 0));
              const top1 = sortedRows[0];
              const top2 = sortedRows[1];
              const dimName = firstBlock.tableData.columns[0].title;
              const top1Name = top1[firstBlock.tableData.columns[0].dataIndex];
              const top2Name = top2 ? top2[firstBlock.tableData.columns[0].dataIndex] : '';
              const dimAnalysis = `按${dimName}维度，Top1为"${top1Name}"，${metric}为${top1[col]}万元${top2Name ? `；Top2为"${top2Name}"` : ''}。结构上呈现"头部集中、腰部分散"的特征。`;
              
              const qtyGrowth = (2 + Math.random() * 4).toFixed(1);
              const priceGrowth = (1 + Math.random() * 3).toFixed(1);
              const mixEffect = (Math.random() * 1.5).toFixed(1);
              const factorAnalysis = `从因子分解看，数量提升约+${qtyGrowth}%、价格提升约+${priceGrowth}%、结构效应约+${mixEffect}%，数量驱动为主，价格与结构共同正向贡献。`;
              
              const conclusion = `综合判断：本期${growth > 0 ? '增长' : '下降'}以头部${dimName}拉动为主，建议关注头部项的持续性与腰部项的挖潜空间，并结合市场情况进一步验证。`;
              
              analysisData = {
                resultSummary,
                dimensionAnalysis: dimAnalysis,
                factorAnalysis,
                conclusion,
                factors: { qtyGrowth, priceGrowth, mixEffect }
              };
            }
            
            return {
                summary,
                resultBlocks,
                analysis: analysisData
            };
        }
    }
    
    // 场景1.5: Top N排名查询 (e.g., 前十大客户、最高的三个行业)
    if (isTopNQuery && topNMatch) {
      const numMap = {'一':1, '二':2, '三':3, '四':4, '五':5, '六':6, '七':7, '八':8, '九':9, '十':10, '十一':11, '十二':12, '十五':15, '二十':20};
      // 支持两种模式：前N大、最高的N个
      const numStr = topNMatch[1] || topNMatch[3];
      const dimensionType = topNMatch[2] || topNMatch[4]; // 客户、供应商、行业等
      const topN = parseInt(numStr, 10) || numMap[numStr] || 10;
      
      const dimensionLabel = {
        '客户':'客户名称', 
        '供应商':'供应商名称', 
        '产品':'产品名称', 
        '地区':'地区',
        '行业':'行业名称'
      }[dimensionType] || '名称';
      
      // 生成Top N数据
      const mockNames = {
        '客户': ['华为技术有限公司', '阿里巴巴集团', '腾讯控股有限公司', '字节跳动科技', '美团点评', '京东集团', '百度在线', '小米科技', '网易公司', '滴滴出行', '拼多多', '快手科技', '携程旅行网', '唯品会', '苏宁易购'],
        '供应商': ['深圳XX电子', '上海YY科技', '北京ZZ材料', '广州AA制造', '杭州BB器件', '南京CC元件', '成都DD电气', '武汉EE设备', '西安FF仪器', '重庆GG工业'],
        '产品': ['A产品线', 'B产品线', 'C产品线', 'D产品线', 'E产品线', 'F产品线', 'G产品线', 'H产品线', 'I产品线', 'J产品线'],
        '地区': ['华东', '华南', '华北', '西南', '华中', '东北', '西北', '港澳台'],
        '行业': ['新能源汽车', '人工智能', '半导体芯片', '生物医药', '云计算', '智能制造', '新材料', '金融科技', '电子商务', '物联网']
      };
      
      const names = mockNames[dimensionType] || mockNames['客户'];
      const dataSource = [];
      let totalValue = 0;
      
      // 生成递减的金额数据
      for (let i = 0; i < Math.min(topN, names.length); i++) {
        const baseValue = 5000 - i * 350 - Math.random() * 100;
        const value = Math.round(baseValue);
        totalValue += value;
        dataSource.push({
          key: String(i + 1),
          rank: i + 1,
          name: names[i],
          value: value,
          ratio: 0 // 稍后计算
        });
      }
      
      // 计算占比
      dataSource.forEach(item => {
        item.ratio = ((item.value / totalValue) * 100).toFixed(2);
      });
      
      const columns = [
        { title: '排名', dataIndex: 'rank', key: 'rank', width: 80, align: 'center' },
        { title: dimensionLabel, dataIndex: 'name', key: 'name', width: 200 },
        { title: `${metric}（万元）`, dataIndex: 'value', key: 'value', align: 'right', width: 150 },
        { title: '占比', dataIndex: 'ratio', key: 'ratio', align: 'right', width: 100, render: (text) => `${text}%` }
      ];
      
      const top1 = dataSource[0];
      const top2 = dataSource[1];
      const top3 = dataSource[2];
      const top3Total = dataSource.slice(0, 3).reduce((sum, item) => sum + item.value, 0);
      const top3Ratio = ((top3Total / totalValue) * 100).toFixed(1);
      
      const summary = `前${topN}大${dimensionType}累计${metric}${totalValue}万元。${top1.name}以${top1.value}万元位居第一，占比${top1.ratio}%；前三大${dimensionType}合计占比${top3Ratio}%，集中度较高。`;
      
      const sources = [
        { type: 'database', name: `业务数据库-${dimensionType}主表`, fullPath: `sales_db.${dimensionType}_master` },
        { type: 'database', name: '财务系统-收款明细', fullPath: 'finance_db.payment_detail' },
        { type: 'pdf', name: `2025年${dimensionType}分析报告.pdf`, fullPath: `/reports/2025_${dimensionType}_analysis.pdf`,
          references: [
            { location: '第3页，市场概况' },
            { location: '第7页，排名统计表' },
            { location: '第10页，趋势分析' }
          ]
        }
      ];
      
      // 如果是复合问题（需要分析）
      let analysisData = undefined;
      if (needAnalysis) {
        const currentYear = new Date().getFullYear();
        
        // 1. 分析结果概述
        const resultSummary = `${currentYear}年${dimensionType}市场表现分化明显。${top1.name}以${top1.value}万元领跑，${top2.name}和${top3.name}分列二三位。前三大${dimensionType}合计贡献${top3Ratio}%，市场集中度较高。`;
        
        // 2. 因子分析 - 用文字描述，每个因子后面附数据源
        const factorAnalysisList = [
          {
            title: '市场规模因子',
            content: `${top1.name}市场规模约${top1.value}万元，较其他${dimensionType}领先优势明显；${top2.name}市场规模${top2.value}万元，增长潜力较大；${top3.name}市场规模${top3.value}万元，保持稳定增长。`,
            sources: [
              { type: 'database', name: `业务数据库-${dimensionType}主表`, fullPath: `sales_db.${dimensionType}_master` },
              { type: 'database', name: '财务系统-收款明细', fullPath: 'finance_db.payment_detail' }
            ]
          },
          {
            title: '市场份额因子',
            content: `${top1.name}市场份额${top1.ratio}%，占据市场主导地位；${top2.name}份额${top2.ratio}%，${top3.name}份额${top3.ratio}%，前三大合计份额${top3Ratio}%，头部效应明显。`,
            sources: [
              { type: 'database', name: `业务数据库-${dimensionType}市场份额表`, fullPath: `sales_db.${dimensionType}_market_share` },
              { type: 'excel', name: '市场研究-行业分析数据.xlsx', fullPath: '/data/market_research/industry_analysis.xlsx',
                references: [
                  { location: 'Sheet1-市场份额, A1:D20' },
                  { location: 'Sheet2-增长趋势, B5:E15' }
                ]
              }
            ]
          },
          {
            title: '增长动能因子',
            content: `Top 3${dimensionType}均保持正向增长态势，其中${top1.name}增长最为强劲，主要得益于技术创新、市场拓展和政策支持等多重因素推动。`,
            sources: [
              { type: 'database', name: '业务数据库-增长率统计表', fullPath: 'sales_db.growth_rate_stats' },
              { type: 'pdf', name: `2025年${dimensionType}分析报告.pdf`, fullPath: `/reports/2025_${dimensionType}_analysis.pdf`,
                references: [
                  { location: '第5页，表2：增长率统计' },
                  { location: '第8页，图3：趋势分析' },
                  { location: '第12页，附录A：详细数据' }
                ]
              }
            ]
          }
        ];
        
        // 3. 维度分析 - 生成区域分布表格
        const regionData = dataSource.slice(0, topN).map((item, idx) => {
          // 为每个行业模拟区域分布
          const regions = ['华东', '华南', '华北'];
          const ratios = idx === 0 ? [0.50, 0.30, 0.20] : 
                        idx === 1 ? [0.40, 0.35, 0.25] : 
                        [0.35, 0.40, 0.25];
      return {
            name: item.name,
            regions: regions.map((region, ridx) => ({
              region,
              value: Math.round(item.value * ratios[ridx]),
              ratio: (ratios[ridx] * 100).toFixed(1)
            }))
          };
        });
        
        const dimensionTableData = {
          columns: [
            { title: dimensionLabel, dataIndex: 'name', key: 'name', width: 150 },
            { title: '华东（万元）', dataIndex: 'east', key: 'east', align: 'right', width: 120 },
            { title: '华南（万元）', dataIndex: 'south', key: 'south', align: 'right', width: 120 },
            { title: '华北（万元）', dataIndex: 'north', key: 'north', align: 'right', width: 120 }
          ],
          dataSource: regionData.map((item, idx) => ({
            key: String(idx + 1),
            name: item.name,
            east: item.regions[0].value,
            south: item.regions[1].value,
            north: item.regions[2].value
          }))
        };
        
        const dimAnalysis = `从区域维度看，Top 3${dimensionType}均呈现"华东强、华南稳、华北补"的格局：
${top1.name}在华东区域${regionData[0].regions[0].value}万元（占比${regionData[0].regions[0].ratio}%），华南${regionData[0].regions[1].value}万元（${regionData[0].regions[1].ratio}%），华北${regionData[0].regions[2].value}万元（${regionData[0].regions[2].ratio}%）；
${top2.name}华东${regionData[1].regions[0].value}万元、华南${regionData[1].regions[1].value}万元、华北${regionData[1].regions[2].value}万元，区域分布较为均衡；
${top3.name}华东${regionData[2].regions[0].value}万元、华南${regionData[2].regions[1].value}万元、华北${regionData[2].regions[2].value}万元。
整体来看，华东区域仍是各${dimensionType}的主战场，华南和华北有较大增长空间。`;
        
        // 4. 分析结论
        const conclusion = `综合判断：${currentYear}年${dimensionType}市场呈现明显的头部集中特征，${top1.name}凭借市场规模、技术实力和品牌优势稳居第一，${top2.name}和${top3.name}紧随其后。建议关注头部${dimensionType}的可持续增长能力，同时挖掘腰部${dimensionType}的增长潜力，优化区域布局，加强华南和华北市场拓展。`;
        
        analysisData = {
          resultSummary,
          factorAnalysisList, // 因子分析列表（包含每个因子的内容和数据源）
          dimensionAnalysis: dimAnalysis,
          conclusion,
          // 维度分析表格和数据来源
          dimensionTableData: dimensionTableData,
          dimensionSources: [
            { type: 'database', name: '业务数据库-区域汇总表', fullPath: 'sales_db.regional_summary' },
            { type: 'database', name: `业务数据库-${dimensionType}区域分布表`, fullPath: `sales_db.${dimensionType}_regional_distribution` }
          ]
        };
      }
      
      return {
        summary: '',
        resultBlocks: [{
          title: `前${topN}大${dimensionType}${metric}排名`,
          description: summary,
          sources,
          tableData: {
            columns,
            dataSource,
            scroll: { x: 630 }
          }
        }],
        analysis: analysisData
      };
    }
    
    // 场景2: 仅维度 (e.g., 各个产品的销售额 或 某个行业的收入)
    if (dimensions.length > 0) {
      let title = `按${dimensions.map(d => ({'product':'产品','region':'地区','industry':'行业'}[d])).join('、')}拆分`;
      let columns = [];
      let dataSource = [];
      let summary = '';

      let blockDescription = '';
      let sources = [];
      
      // 处理行业维度
      if (dimensions.includes('industry')) {
        // 提取行业名称
        const industryMatch = question.match(/(风能|光伏|新能源|化工|制造|医药|金融|互联网|房地产)行业/);
        const industryName = industryMatch ? industryMatch[1] + '行业' : '行业';
        
        columns = [
          { title: '行业', dataIndex: 'industry', key: 'industry' },
          { title: metric + ' (万元)', dataIndex: 'value', key: 'value', align: 'right' }
        ];
        dataSource = [
          { key: '1', industry: industryName, value: 8500 }
        ];
        
        // 提取年份
        const yearMatch = question.match(/(\d{4})年/);
        const year = yearMatch ? yearMatch[1] : '2025';
        
        blockDescription = `${year}年${industryName}${metric}为8500万元。`;
        sources = [
          { type: 'database', name: '业务数据库-行业数据表', fullPath: 'sales_db.industry_data' },
          { type: 'database', name: '财务系统-收入明细', fullPath: 'finance_db.revenue_detail' }
        ];
        
        return {
          summary: '',
          resultBlocks: [{
            title: `${year}年${industryName}${metric}`,
            description: blockDescription,
            sources,
            tableData: { columns, dataSource }
          }],
          analysis: undefined
        };
      }
      
      if (dimensions.includes('product')) {
        // 检测是否查询特定产品
        const specificProductMatch = question.match(/([A-Z]产品|[A-Z]产品线)/);
        
        if (specificProductMatch) {
          // 查询特定产品
          const productName = specificProductMatch[1];
          const yearMatch = question.match(/(\d{4})年|今年|本年/);
          const year = yearMatch ? (yearMatch[1] || new Date().getFullYear()) : new Date().getFullYear();
          
          columns = [
            { title: '产品', dataIndex: 'product', key: 'product' },
            { title: metric + ' (万元)', dataIndex: 'value', key: 'value', align: 'right' }
          ];
          dataSource = [
            { key: '1', product: productName, value: 3200 }
          ];
          
          blockDescription = `${year}年${productName}${metric}为3200万元。`;
          sources = [
            { type: 'database', name: '业务数据库-产品主表', fullPath: 'main_db.products' },
            { type: 'database', name: '财务系统-收入明细', fullPath: 'finance_db.revenue_detail' }
          ];
        } else {
          // 查询所有产品
          columns = [{ title: '产品', dataIndex: 'product', key: 'product' }, { title: metric + " (万元)", dataIndex: 'value', key: 'value', align: 'right' }];
          dataSource = [
            { key: '1', product: 'A产品', value: 2200 }, 
            { key: '2', product: 'B产品', value: 1400 },
            { key: '3', product: 'C产品', value: 1800 }
          ];
          const sorted = [...dataSource].sort((a, b) => b.value - a.value);
          const total = dataSource.reduce((sum, item) => sum + item.value, 0);
          blockDescription = `从产品${metric}来看，${sorted[0].product}以${sorted[0].value}万元领跑，占比${((sorted[0].value / total) * 100).toFixed(1)}%。`;
          sources = [
            { type: 'database', name: '业务数据库-产品主表', fullPath: 'main_db.products' },
            { type: 'excel', name: '产品销售明细.xlsx', fullPath: '/data/sales/product_sales_detail.xlsx',
              references: [
                { location: 'Sheet1-产品汇总, A1:C50' },
                { location: 'Sheet2-月度明细, B5:F100' }
              ]
            }
          ];
        }
      } else if (dimensions.includes('region')) {
        columns = [{ title: '地区', dataIndex: 'region', key: 'region' }, { title: metric + " (万元)", dataIndex: 'value', key: 'value', align: 'right' }];
        dataSource = [
          { key: '1', region: '华东', value: 2000 }, 
          { key: '2', region: '华南', value: 1600 },
          { key: '3', region: '华北', value: 1200 }
        ];
        const sorted = [...dataSource].sort((a, b) => b.value - a.value);
        const total = dataSource.reduce((sum, item) => sum + item.value, 0);
        blockDescription = `区域${metric}分布中，${sorted[0].region}表现最强（${sorted[0].value}万元），${sorted[1].region}、${sorted[2].region}紧随其后，三地合计${total}万元。`;
        sources = [
          { type: 'pdf', name: '区域市场报告.pdf', fullPath: '/reports/regional_market_report.pdf',
            references: [
              { location: '第4页，区域对比分析' },
              { location: '第9页，市场趋势图' },
              { location: '第15页，详细数据表' }
            ]
          },
          { type: 'database', name: '业务数据库-区域统计', fullPath: 'main_db.regional_stats' },
          { type: 'excel', name: '各地区销售数据.xlsx', fullPath: '/data/regional/regional_sales.xlsx',
            references: [
              { location: 'Sheet1-华东, A1:E30' },
              { location: 'Sheet2-华南, A1:E30' },
              { location: 'Sheet3-华北, A1:E30' }
            ]
          }
        ];
      }

      return {
        summary: '',
        resultBlocks: [{
          title,
          description: blockDescription,
          sources,
          tableData: { columns, dataSource }
        }]
      };
    }

    // 场景3: 默认回退
    return {
      summary: '',
      resultBlocks: [
        {
          sources: [],
          tableData: {
            columns: [{ title: '查询项', dataIndex: 'item' }, { title: '结果', dataIndex: 'value' }],
            dataSource: [{ key: '1', item: metric, value: '暂无数据' }]
          }
        }
      ]
    };
  };

  // 回车发送
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // 打开菜单
  const handleOpenMenu = (e, conversationId) => {
    e.stopPropagation();
    setOpenMenuId(openMenuId === conversationId ? null : conversationId);
  };

  // 关闭菜单
  const handleCloseMenu = () => {
    setOpenMenuId(null);
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
    setConversations(conversations.map(c => 
      c.id === conversationId ? { ...c, pinned: !c.pinned } : c
    ));
    setOpenMenuId(null);
  };

  // 删除对话
  const handleDeleteConversation = (e, conversationId) => {
    e.stopPropagation();
    const updatedConversations = conversations.filter(c => c.id !== conversationId);
    setConversations(updatedConversations);
    
    // 如果删除的是当前活动对话，切换到第一个对话
    if (conversationId === activeConversationId) {
      if (updatedConversations.length > 0) {
        setActiveConversationId(updatedConversations[0].id);
        setMessages(updatedConversations[0].messages);
      } else {
        setActiveConversationId(null);
        setMessages([]);
      }
    }
    setOpenMenuId(null);
  };

  /**
   * 过滤对话（根据搜索关键词）
   */
  const filterConversations = (conversations, keyword) => {
    if (!keyword.trim()) {
      return conversations;
    }
    return conversations.filter(conv => 
      conv.title.toLowerCase().includes(keyword.toLowerCase())
    );
  };

  /**
   * 按日期对对话进行分组 - 每天一个分组
   */
  const groupConversationsByDate = (conversations) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const groups = {
      pinned: [],
      dates: {} // 用对象存储每一天的对话，key为日期字符串
    };

    conversations.forEach(conv => {
      // 置顶的对话单独分组
      if (conv.pinned) {
        groups.pinned.push(conv);
        return;
      }

      // 解析对话时间
      const convDate = new Date(conv.time);
      const convDateOnly = new Date(convDate.getFullYear(), convDate.getMonth(), convDate.getDate());
      
      // 格式化日期作为分组key
      const dateKey = `${convDateOnly.getFullYear()}-${String(convDateOnly.getMonth() + 1).padStart(2, '0')}-${String(convDateOnly.getDate()).padStart(2, '0')}`;
      
      if (!groups.dates[dateKey]) {
        groups.dates[dateKey] = {
          date: convDateOnly,
          conversations: []
        };
      }
      
      groups.dates[dateKey].conversations.push(conv);
    });

    // 将dates对象转换为数组并按日期倒序排序
    const sortedDates = Object.keys(groups.dates)
      .sort((a, b) => new Date(b) - new Date(a))
      .map(dateKey => ({
        dateKey,
        ...groups.dates[dateKey]
      }));

    return {
      pinned: groups.pinned,
      sortedDates
    };
  };

  // 先过滤，再分组
  const filteredConversations = filterConversations(conversations, searchKeyword);
  const groupedConversations = groupConversationsByDate(filteredConversations);

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
          {/* 渲染对话分组的函数 */}
          {(() => {
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
                  {/* 置顶分组不显示标签 */}
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
                            <div className="conversation-title">
                              {conversation.pinned && (
                                <svg className="pin-icon" width="12" height="12" viewBox="0 0 24 24" fill="currentColor" style={{ marginRight: 6 }}>
                                  <path d="M12 17v5"/>
                                  <path d="M9 10.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24V16a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V7a6 6 0 0 0-6 0v3.76Z"/>
                                </svg>
                              )}
                              {conversation.title}
                            </div>
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

            // 格式化日期显示标签
            const formatDateLabel = (date) => {
              const now = new Date();
              const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
              const yesterday = new Date(today);
              yesterday.setDate(yesterday.getDate() - 1);
              
              const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());
              
              if (dateOnly.getTime() === today.getTime()) {
                return '今天';
              } else if (dateOnly.getTime() === yesterday.getTime()) {
                return '昨天';
              } else {
                // 格式化为 YYYY-MM-DD
                const year = date.getFullYear();
                const month = String(date.getMonth() + 1).padStart(2, '0');
                const day = String(date.getDate()).padStart(2, '0');
                return `${year}-${month}-${day}`;
              }
            };

            // 按顺序渲染各个分组
            return (
              <>
                {/* 渲染置顶对话 - 不显示标题 */}
                {renderConversationGroup(groupedConversations.pinned, null, true)}
                
                {/* 渲染按日期分组的对话 */}
                {groupedConversations.sortedDates.map(dateGroup => 
                  renderConversationGroup(
                    dateGroup.conversations, 
                    formatDateLabel(dateGroup.date),
                    false
                  )
                )}
              </>
            );
          })()}
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
                  <div className="welcome-icon">
                    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <rect x="3" y="5" width="18" height="14" rx="2" ry="2"/>
                      <line x1="8" y1="3" x2="8" y2="7"/>
                      <line x1="16" y1="3" x2="16" y2="7"/>
                      <path d="M3 15h8l2 3h-2l-2-3z"/>
                      <circle cx="14" cy="12" r="1.5"/>
                      <circle cx="18" cy="12" r="1.5"/>
                    </svg>
                  </div>
                  <div className="welcome-text">您好！我是问数智能助手，有什么可以帮您的吗？</div>
                </div>
              ) : (
                messages.map(message => (
                  <div key={message.id} className={`message ${message.sender === 'user' ? 'user-message' : 'ai-message'}`}>
                    <div className="message-content">
                      {message.type === 'combined' ? (
                        <CombinedThinking 
                          intentData={message.intentData}
                          config={message.config}
                          dataInfo={message.dataInfo}
                          steps={message.steps}
                          isComplete={message.isComplete} 
                        />
                      ) : message.type === 'result' ? (
                        <>
                          <QueryResult data={message.data} />
                          <div className="message-footer">
                            <div className="footer-actions">
                              <button 
                                className="footer-icon-btn"
                                onClick={() => console.log('导出报告')}
                                title="导出报告"
                              >
                                <DownloadOutlined style={{ fontSize: 16 }} />
                                <span>导出报告</span>
                              </button>
                              <span className="footer-divider">|</span>
                              <div className="footer-rating-btns">
                                <button 
                                  className="footer-icon-btn"
                                  onClick={() => console.log('点赞')}
                                  title="点赞"
                                >
                                  <LikeOutlined style={{ fontSize: 16 }} />
                                </button>
                                <button 
                                  className="footer-icon-btn"
                                  onClick={() => console.log('点踩')}
                                  title="点踩"
                                >
                                  <DislikeOutlined style={{ fontSize: 16 }} />
                                </button>
                              </div>
                            </div>
                            <div className="footer-time">{message.time}</div>
                          </div>
                        </>
                      ) : (
                        <p>{message.text}</p>
                      )}
                    </div>
                    {/* 文本消息的时间显示在气泡外面 */}
                    {message.type !== 'result' && message.type !== 'combined' && (
                      <div className="message-time">{message.time}</div>
                    )}
                    {/* 在AI回答消息下方显示推荐问题 - 只有result类型显示，因为combined会变成result */}
                    {message.type === 'result' && message.originalQuestion && (
                      <div className="suggested-questions-wrapper">
                        <div className="suggested-questions-label">你还可以继续问：</div>
                        <div className="suggested-questions">
                          {generateSuggestedQuestions(message.originalQuestion, message.data || {}).map((suggestedQuestion, idx) => (
                            <button
                              key={idx}
                              className="suggested-question-btn"
                              onClick={() => handleSuggestedQuestionClick(suggestedQuestion)}
                            >
                              {suggestedQuestion}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
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
                  <button className="action-chip" onClick={() => setConfigVisible(true)}>
                    <span className="action-icon">⚙️</span>
                    <span>问数配置</span>
                  </button>
                  {isGenerating ? (
                    <button className="send-button-round stop-button" onClick={handleStopGeneration}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <rect x="6" y="6" width="12" height="12" rx="1" />
                      </svg>
                    </button>
                  ) : (
                    <button className="send-button-round" onClick={handleSendMessage} disabled={!inputValue.trim()}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="22" y1="2" x2="11" y2="13"></line>
                        <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                      </svg>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="chat-placeholder">
            <div className="placeholder-icon">💬</div>
            <div className="placeholder-text">请选择一个对话或创建新对话</div>
          </div>
        )}
      </div>

      {/* 配置弹窗 */}
      <QueryConfigModal
        visible={configVisible}
        initialConfig={getEffectiveConfig()}
        onOk={(cfg) => {
          setConfigVisible(false);
          if (cfg.applyScope === 'all') {
            setConfigGlobal(cfg);
          } else {
            setConfigPerConv(prev => ({ ...prev, [activeConversationId]: cfg }));
          }
        }}
        onCancel={() => setConfigVisible(false)}
      />
    </div>
  );
};

export default QuestionAssistant;

