import React, { useState, useEffect } from 'react';
import { DatePicker, Select, Radio, Button, Checkbox, InputNumber, Tag } from 'antd';
import './ParameterForm.css';
import dayjs from 'dayjs';

const { RangePicker } = DatePicker;
const { Option } = Select;

/**
 * 参数确认卡片组件 - 支持智能预填
 */
const ParameterForm = ({ onSubmit, initialParams = {} }) => {
  // --- 主时间段状态 ---
  const [mainPeriodType, setMainPeriodType] = useState(initialParams.mainPeriodType || 'relative');
  const [mainRelativePreset, setMainRelativePreset] = useState(initialParams.mainRelativePreset || 'this_month');
  const [mainRelativeLastN, setMainRelativeLastN] = useState(initialParams.mainRelativeLastN || 1);
  const [mainRelativeUnit, setMainRelativeUnit] = useState(initialParams.mainRelativeUnit || 'month');
  const [mainAbsoluteRange, setMainAbsoluteRange] = useState(initialParams.mainAbsoluteRange || [dayjs().subtract(1, 'month'), dayjs()]);
  const [lockedUnit, setLockedUnit] = useState(initialParams.lockedUnit || null);
  const [periodMode, setPeriodMode] = useState(initialParams.periodMode || 'recent'); // recent | past
  // 默认不进入编辑模式，除非没有锁定单位
  const [isEditingTime, setIsEditingTime] = useState(!initialParams.lockedUnit);

  // --- 对比时间段状态 ---
  const [addComparison, setAddComparison] = useState(initialParams.addComparison || false);
  const [comparisonType, setComparisonType] = useState(initialParams.comparisonType || 'previous_period');

  // --- 其他参数状态 ---
  const [scopeType, setScopeType] = useState(initialParams.scopeType || 'group'); // group | branches
  const [selectedBranches, setSelectedBranches] = useState(initialParams.selectedBranches || []);
  const [caliber, setCaliber] = useState(initialParams.caliber || 'internal');

  useEffect(() => {
    // 当预设参数传来时，更新组件内部状态
    setMainPeriodType(initialParams.mainPeriodType || 'relative');
    setMainRelativePreset(initialParams.mainRelativePreset || 'this_month');
    setMainRelativeLastN(initialParams.mainRelativeLastN || 1);
    setMainRelativeUnit(initialParams.mainRelativeUnit || 'month');
    setAddComparison(initialParams.addComparison || false);
    setComparisonType(initialParams.comparisonType || 'previous_period');
    setLockedUnit(initialParams.lockedUnit || null);
    setPeriodMode(initialParams.periodMode || 'recent');
    // 如果意图解析锁定了单位，则默认不进入编辑模式
    setIsEditingTime(!initialParams.lockedUnit);
  }, [initialParams]);

  // 模拟分公司列表
  const branchList = [
    { id: 'branch_a', name: '分公司 A' },
    { id: 'branch_b', name: '分公司 B' },
    { id: 'branch_c', name: '分公司 C' },
  ];

  // 计算年份的辅助函数
  const calculateYears = () => {
    const years = [];
    const now = dayjs();
    const currentYear = now.year();
    const startYear = periodMode === 'past' ? currentYear - 1 : currentYear;
    for (let i = 0; i < mainRelativeLastN; i++) {
      years.push(startYear - i);
    }
    return years.reverse();
  };

  // 生成提交给AI的最终确认文本
  const generatePeriodText = () => {
    let mainText = '';
    if (mainPeriodType === 'relative') {
      switch (mainRelativePreset) {
        case 'this_month': return '本月';
        case 'this_quarter': return '本季度';
        case 'this_year': return '本年';
        case 'last_n': {
          const unitTextMap = { day: '天', month: '个月', quarter: '个季度', year: '年' };
          const unitText = unitTextMap[mainRelativeUnit];

          if (mainRelativeUnit === 'year') {
            const years = calculateYears();
            return years.join(', '); // 直接返回年份数字，用逗号分隔
          }
          
          // 对于其他单位，暂时保持原样或按需扩展
          return `过去 ${mainRelativeLastN} ${unitText}`;
        }
        default: return '未知相对时间';
      }
    } else {
      if (mainAbsoluteRange && mainAbsoluteRange.length === 2) {
        mainText = `${dayjs(mainAbsoluteRange[0]).format('YYYY-MM-DD')} 到 ${dayjs(mainAbsoluteRange[1]).format('YYYY-MM-DD')}`;
      }
    }

    let comparisonText = '';
    if (addComparison) {
      comparisonText = comparisonType === 'previous_period' ? '，并与上一期对比' : '，并与去年同期对比';
    }

    return mainText + comparisonText;
  };

  const handleSubmit = () => {
    const timeRange = generatePeriodText();
    const scope = scopeType === 'group' ? '集团总数据' : `指定分公司: ${selectedBranches.join(', ')}`;
    const caliberText = caliber === 'internal' ? '内部管理用 (管口)' : '对外披露用 (法口)';
    onSubmit({ timeRange, scope, caliber: caliberText });
  };
  
  return (
    <div className="parameter-form-container">
      <div className="parameter-form-header">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="#4A90E2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M14 2V8H20" stroke="#4A90E2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M16 13H8" stroke="#4A90E2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M16 17H8" stroke="#4A90E2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M10 9H8" stroke="#4A90E2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        为了给您更精确的答复，请确认以下信息：
      </div>
      <div className="parameter-form-body">
        {/* --- 数据时间段 --- */}
        <div className="form-item">
          <label className="form-label">数据时间段</label>
          
          {lockedUnit && !isEditingTime ? (
            // 简洁视图：只显示标签和修改按钮
            <div className="simple-time-display">
              <div className="year-tags">
                {calculateYears().map(year => (
                  <Tag key={year}>{year}</Tag>
                ))}
              </div>
              <Button 
                type="link" 
                size="small"
                className="modify-time-btn"
                onClick={() => setIsEditingTime(true)}
              >
                修改
              </Button>
            </div>
          ) : (
            // 完整视图：显示所有控件
            <div className="full-time-selector">
              <Radio.Group onChange={(e) => setMainPeriodType(e.target.value)} value={mainPeriodType} size="small" className="period-type-switch">
                <Radio.Button value="relative">相对时间</Radio.Button>
                <Radio.Button value="absolute">绝对时间</Radio.Button>
              </Radio.Group>
              
              {mainPeriodType === 'relative' ? (
                <div className="relative-time-selector">
                  <Select value={mainRelativePreset} onChange={setMainRelativePreset} className="relative-preset-select">
                    <Option value="this_month">本月</Option>
                    <Option value="this_quarter">本季度</Option>
                    <Option value="this_year">本年</Option>
                    <Option value="last_n">过去 N...</Option>
                  </Select>
                  {mainRelativePreset === 'last_n' && (
                    <div className="last-n-picker">
                      <InputNumber min={1} value={mainRelativeLastN} onChange={setMainRelativeLastN} />
                      <Select value={mainRelativeUnit} onChange={setMainRelativeUnit} disabled={!!lockedUnit}>
                        <Option value="day">天</Option>
                        <Option value="month">月</Option>
                        <Option value="quarter">季度</Option>
                        <Option value="year">年</Option>
                      </Select>
                    </div>
                  )}
                </div>
              ) : (
                <RangePicker
                  className="form-input"
                  value={mainAbsoluteRange}
                  onChange={setMainAbsoluteRange}
                  allowClear={false}
                />
              )}
              
              <Checkbox checked={addComparison} onChange={(e) => setAddComparison(e.target.checked)}>添加对比</Checkbox>
              {addComparison && (
                 <Radio.Group onChange={(e) => setComparisonType(e.target.value)} value={comparisonType} className="comparison-options">
                   <Radio value="previous_period">较上一期</Radio>
                   <Radio value="same_period_last_year">较去年同期</Radio>
                 </Radio.Group>
              )}
            </div>
          )}
        </div>

        {/* --- 数据范围选择 --- */}
        <div className="form-item">
          <label className="form-label">数据范围</label>
          <Radio.Group onChange={(e) => setScopeType(e.target.value)} value={scopeType} className="scope-radio-group">
            <Radio value="group">集团总数据</Radio>
            <Radio value="branches">指定分公司</Radio>
          </Radio.Group>
          {scopeType === 'branches' && (
            <Select mode="multiple" allowClear className="form-input branch-select" placeholder="请选择分公司 (可多选)" value={selectedBranches} onChange={setSelectedBranches}>
              {branchList.map(branch => <Option key={branch.id} value={branch.name}>{branch.name}</Option>)}
            </Select>
          )}
        </div>

        {/* --- 数据用途选择 --- */}
        <div className="form-item">
          <label className="form-label">数据用途 (口径)</label>
          <Radio.Group onChange={(e) => setCaliber(e.target.value)} value={caliber}>
            <Radio value="internal">内部管理用 (管口)</Radio>
            <Radio value="external">对外披露用 (法口)</Radio>
          </Radio.Group>
        </div>
      </div>
      <div className="parameter-form-footer">
        <Button type="primary" onClick={handleSubmit} className="submit-button">确认并重新运行提问</Button>
      </div>
    </div>
  );
};

export default ParameterForm;
