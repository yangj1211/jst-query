import React, { useState, useEffect } from 'react';
import { Select, Radio, Button, Tag } from 'antd';
import './ParameterForm.css';

const { Option } = Select;

/**
 * 参数确认卡片组件 - 简化版本，只识别和展示时间段文字
 */
const ParameterForm = ({ onSubmit, initialParams = {} }) => {
  const [scopeType, setScopeType] = useState(initialParams.scopeType || 'group'); // group | branches
  const [selectedBranches, setSelectedBranches] = useState(initialParams.selectedBranches || []);
  const [caliber, setCaliber] = useState(initialParams.caliber || 'internal');

  // 模拟分公司列表
  const branchList = [
    { id: 'branch_a', name: '分公司 A' },
    { id: 'branch_b', name: '分公司 B' },
    { id: 'branch_c', name: '分公司 C' },
  ];

  const handleSubmit = () => {
    const timeRange = initialParams.timeRangeText || initialParams.timeRange || initialParams.timeRange;
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