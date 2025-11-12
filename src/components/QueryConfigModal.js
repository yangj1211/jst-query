import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Modal,
  Radio,
  Space,
  Button,
  Table,
  Tag,
  Tabs,
  Input,
  Tree,
} from 'antd';
import {
  DatabaseOutlined,
  FileTextOutlined,
  CheckOutlined,
  FilterFilled,
} from '@ant-design/icons';

const tableOptions = [
  { name: '测试表1', tags: ['财务', '数据'], source: 'SAP' },
  { name: '测试表2', tags: ['销售'], source: 'SAP' },
  { name: '库存快照', tags: ['库存'], source: 'BPC' },
  { name: '订单明细', tags: ['订单', '明细'], source: '本地上传' },
  { name: '库存对账表', tags: ['库存', '对账'], source: 'SAP' },
  { name: '客户主数据', tags: ['客户', '基础'], source: 'SAP' },
  { name: '供应商清单', tags: ['供应商', '基础'], source: 'SAP' },
  { name: '合同审批记录', tags: ['合同', '审批'], source: 'BPC' },
  { name: '发票台账', tags: ['财务', '票据'], source: 'SAP' },
  { name: '项目进度表', tags: ['项目', '进度'], source: '本地上传' },
  { name: '成本分摊表', tags: ['成本', '核算'], source: 'SAP' },
  { name: '预算执行表', tags: ['预算', '执行'], source: 'BPC' },
  { name: '资金计划表', tags: ['资金', '计划'], source: 'SAP' },
  { name: '出货明细', tags: ['销售', '出货'], source: 'SAP' },
  { name: '采购订单表', tags: ['采购', '订单'], source: 'SAP' },
  { name: '招投标项目表', tags: ['招投标', '项目'], source: '本地上传' },
  { name: '固定资产台账', tags: ['资产', '台账'], source: 'SAP' },
  { name: '员工人力成本表', tags: ['人力', '成本'], source: 'SAP' },
  { name: '绩效考核表', tags: ['人力', '考核'], source: 'BPC' },
  { name: '渠道商列表', tags: ['渠道', '伙伴'], source: 'SAP' },
  { name: '售后维修记录', tags: ['售后', '维修'], source: '本地上传' },
  { name: '库存预警表', tags: ['库存', '预警'], source: 'SAP' },
  { name: '发货跟踪表', tags: ['物流', '跟踪'], source: 'SAP' },
  { name: '质量检测记录', tags: ['质量', '检测'], source: 'BPC' },
  { name: '研发项目费用表', tags: ['研发', '费用'], source: 'SAP' },
  { name: '海外项目清单', tags: ['海外', '项目'], source: '本地上传' },
  { name: '售前需求登记表', tags: ['售前', '需求'], source: 'SAP' },
  { name: '服务合同明细', tags: ['服务', '合同'], source: 'SAP' },
  { name: '报价单台账', tags: ['报价', '台账'], source: 'SAP' },
  { name: '税务申报表', tags: ['税务', '申报'], source: 'BPC' },
  { name: '收款确认表', tags: ['财务', '收款'], source: 'SAP' },
  { name: '贷项通知单', tags: ['财务', '贷项'], source: 'SAP' },
  { name: '客户满意度调研', tags: ['客户', '调研'], source: '本地上传' },
  { name: '生产排程表', tags: ['生产', '排程'], source: 'SAP' },
  { name: '物料需求计划', tags: ['生产', '物料'], source: 'SAP' },
  { name: '制造费用表', tags: ['生产', '成本'], source: 'SAP' },
  { name: '能耗统计表', tags: ['能源', '统计'], source: 'BPC' },
  { name: '碳排放台账', tags: ['能源', '碳排'], source: '本地上传' },
  { name: '海外物流费用表', tags: ['物流', '费用'], source: 'SAP' },
  { name: '供应链预警表', tags: ['供应链', '预警'], source: 'SAP' },
  { name: '关键零部件库存', tags: ['库存', '零部件'], source: 'SAP' },
  { name: '设备运维记录', tags: ['设备', '运维'], source: 'BPC' },
  { name: '客户信用评级表', tags: ['客户', '信用'], source: 'SAP' },
  { name: '海外客户档案', tags: ['客户', '海外'], source: '本地上传' },
  { name: '项目结算表', tags: ['项目', '结算'], source: 'SAP' },
  { name: 'AR Aging Report', tags: ['应收', '账龄'], source: 'SAP' },
  { name: 'AP Aging Report', tags: ['应付', '账龄'], source: 'SAP' },
  { name: '现金流预测表', tags: ['资金', '预测'], source: 'BPC' },
  { name: '资金集中余额表', tags: ['资金', '集中'], source: 'SAP' },
  { name: '融资合同台账', tags: ['资金', '融资'], source: 'SAP' },
  { name: '政府补贴项目表', tags: ['政府', '补贴'], source: '本地上传' },
  { name: '行业对标数据', tags: ['行业', '对标'], source: '本地上传' },
  { name: '市场竞品分析', tags: ['市场', '竞品'], source: '本地上传' },
  { name: '渠道销售预测', tags: ['渠道', '预测'], source: 'SAP' },
  { name: '国内订单台账', tags: ['订单', '国内'], source: 'SAP' },
  { name: '海外订单台账', tags: ['订单', '海外'], source: 'SAP' },
  { name: '售后服务满意度', tags: ['售后', '满意度'], source: '本地上传' },
  { name: '安全生产记录', tags: ['安全', '生产'], source: 'BPC' },
  { name: '合规审计记录', tags: ['审计', '合规'], source: '本地上传' },
  { name: '风险事件台账', tags: ['风险', '事件'], source: 'SAP' },
  { name: '海外汇率表', tags: ['资金', '汇率'], source: 'SAP' },
  { name: '供应商评分表', tags: ['供应商', '评分'], source: 'SAP' },
  { name: '合作伙伴协议', tags: ['伙伴', '协议'], source: '本地上传' },
  { name: '物料BOM清单', tags: ['物料', 'BOM'], source: 'SAP' },
  { name: '装配工艺表', tags: ['生产', '工艺'], source: 'SAP' },
  { name: '仓储损耗记录', tags: ['仓储', '损耗'], source: 'SAP' },
  { name: '售前方案库', tags: ['售前', '方案'], source: '本地上传' },
  { name: '项目投标记录', tags: ['项目', '投标'], source: '本地上传' },
  { name: '信息安全台账', tags: ['安全', '信息'], source: 'BPC' },
  { name: '应急预案表', tags: ['安全', '应急'], source: '本地上传' },
  { name: '售后配件库存', tags: ['售后', '库存'], source: 'SAP' },
  { name: '渠道返利台账', tags: ['渠道', '返利'], source: 'SAP' },
  { name: '进口清关记录', tags: ['物流', '清关'], source: '本地上传' },
  { name: '出口报关记录', tags: ['物流', '报关'], source: '本地上传' },
  { name: '设备维护计划', tags: ['设备', '计划'], source: 'SAP' },
  { name: '质量投诉记录', tags: ['质量', '投诉'], source: 'SAP' },
  { name: '工程验收记录', tags: ['工程', '验收'], source: '本地上传' },
  { name: '客户拜访记录', tags: ['客户', '拜访'], source: 'SAP' },
  { name: '销售折扣记录', tags: ['销售', '折扣'], source: 'SAP' },
  { name: '库存批次台账', tags: ['库存', '批次'], source: 'SAP' },
  { name: '运输费用表', tags: ['物流', '运输'], source: 'SAP' },
  { name: '仓库盘点记录', tags: ['仓库', '盘点'], source: 'SAP' },
  { name: '项目进度里程碑', tags: ['项目', '里程碑'], source: 'SAP' },
  { name: '行业资讯汇总', tags: ['行业', '资讯'], source: '本地上传' },
  { name: '竞争对手价格表', tags: ['竞品', '价格'], source: '本地上传' },
  { name: '采购预算表', tags: ['采购', '预算'], source: 'SAP' },
  { name: '分销商库存表', tags: ['渠道', '库存'], source: 'SAP' },
  { name: '服务响应记录', tags: ['售后', '响应'], source: '本地上传' },
  { name: '备件损耗记录', tags: ['售后', '损耗'], source: 'SAP' },
  { name: '培训活动表', tags: ['人力', '培训'], source: '本地上传' },
  { name: '员工离职记录', tags: ['人力', '离职'], source: 'SAP' },
  { name: '招聘需求表', tags: ['人力', '招聘'], source: 'SAP' },
  { name: '薪酬结构表', tags: ['人力', '薪酬'], source: 'SAP' },
  { name: '福利发放表', tags: ['人力', '福利'], source: 'SAP' },
  { name: '股权激励名单', tags: ['人力', '激励'], source: '本地上传' },
  { name: '知识产权台账', tags: ['法务', '知识产权'], source: '本地上传' },
  { name: '合同履约监控', tags: ['法务', '履约'], source: 'SAP' },
  { name: '诉讼案件记录', tags: ['法务', '诉讼'], source: '本地上传' },
  { name: '合规政策库', tags: ['法务', '政策'], source: '本地上传' },
  { name: '安全培训记录', tags: ['安全', '培训'], source: 'BPC' },
  { name: '消防检查记录', tags: ['安全', '消防'], source: '本地上传' },
  { name: '环保排放记录', tags: ['环保', '排放'], source: 'BPC' },
  { name: '能源利用效率', tags: ['能源', '效率'], source: 'BPC' },
  { name: '绿色供应链表', tags: ['环境', '供应链'], source: '本地上传' },
  { name: '客户积分台账', tags: ['客户', '积分'], source: 'SAP' },
  { name: '渠道促销预算', tags: ['渠道', '促销'], source: 'SAP' },
  { name: '市场活动记录', tags: ['市场', '活动'], source: '本地上传' },
  { name: '招标保证金台账', tags: ['招投标', '保证金'], source: 'SAP' },
  { name: '供应商合同台账', tags: ['供应商', '合同'], source: 'SAP' },
  { name: '项目风险评估', tags: ['项目', '风险'], source: '本地上传' },
  { name: '海外项目财务报表', tags: ['海外', '财务'], source: 'SAP' },
  { name: '企业文化活动', tags: ['企业', '文化'], source: '本地上传' },
];

const fileOptions = [
  { name: '2024年财务报告.pdf', tags: ['财务', '报告', '2024'], source: '上市公司公告' },
  { name: '2023年对外披露数据.pdf', tags: ['披露'], source: '上市公司公告' },
  { name: '市场跟踪.xlsx', tags: ['市场', '月度'], source: '上市公司公告' },
];

const governmentDefaultTables = ['测试表1', '订单明细'];

const mapTreeDisabled = (nodes, disabled) =>
  nodes.map((node) => ({
    ...node,
    disabled: disabled || node.disabled,
    disableCheckbox: disabled || node.disableCheckbox,
    children: node.children ? mapTreeDisabled(node.children, disabled) : undefined,
  }));

const getPaginationConfig = (total) => {
  const basePageSize = 10;
  if (total <= basePageSize) return false;
  return {
    pageSize: basePageSize,
    showSizeChanger: true,
    pageSizeOptions: ['10', '20', '50'],
    showLessItems: true,
    showTotal: (tot, range) => `第 ${range[0]}-${range[1]} 项 / 共 ${tot} 项`,
  };
};

const sectionStyle = {
  padding: 20,
  borderRadius: 14,
  border: '1px solid #e5e7eb',
  background: '#ffffff',
  boxShadow: '0 4px 12px rgba(15, 23, 42, 0.06)',
};

const sectionHeaderStyle = {
  display: 'flex',
  alignItems: 'baseline',
  gap: 8,
  marginBottom: 12,
};

const sectionTitleStyle = {
  fontWeight: 600,
  fontSize: 16,
  color: '#111827',
};

const sectionDescStyle = {
  color: '#64748b',
  fontSize: 13,
};

const radioGroupInlineStyle = {
  display: 'flex',
  gap: 24,
  flexWrap: 'wrap',
  alignItems: 'center',
};

const radioOptionTextStyle = {
  fontSize: 14,
  color: '#1f2937',
  fontWeight: 500,
};

const toggleButtonStyle = {
  minWidth: 120,
  textAlign: 'center',
};

const treeWrapperStyle = {
  minHeight: 260,
  maxHeight: 320,
  overflow: 'auto',
  border: '1px solid #e5eaf3',
  borderRadius: 10,
  padding: 12,
  background: '#f9fafc',
};

const companyTreeData = [
  {
    title: 'EO_1000 - 金盘科技大合并 (84)',
    key: 'eo_1000_root',
    selectable: false,
    children: [
      { title: '1100 - 海南金盘电气研究院有限公司', key: 'eo_1100' },
      { title: '1200 - 海南金盘电气有限公司', key: 'eo_1200' },
      { title: '1600 - 海南金盘科技储能技术有限公司', key: 'eo_1600' },
      { title: '2300 - 武汉金盘智能科技有限公司', key: 'eo_2300' },
      { title: '3000 - 金盘电气集团（上海）有限公司', key: 'eo_3000' },
      { title: '1900 - 武汉金拓电气有限公司', key: 'eo_1900' },
      { title: '3500 - 海南金盘智能科技研究总院有限公司', key: 'eo_3500' },
      { title: '2800 - 浙江金盘实业有限公司', key: 'eo_2800' },
      { title: '2900 - 海南金盘数字建设工程有限公司', key: 'eo_2900' },
      { title: '3900 - 金盘科技新能源智能装备（湖南）有限公司', key: 'eo_3900' },
      { title: '4100 - 海南迈字数字智能技术有限公司', key: 'eo_4100' },
      { title: '7013 - 武汉金能源科技有限公司', key: 'eo_7013' },
    ],
  },
  {
    title: 'E_1000 - 海南金盘科技小合并（合并组） (4)',
    key: 'e_1000',
    selectable: false,
    children: [
      { title: 'E_1300 - 桐乡同亨数字科技有限公司 (6)', key: 'e_1300' },
      { title: 'E_1400 - 海南金盘科技新能源小合并 (4)', key: 'e_1400' },
      { title: 'E_1800 - 金盘（扬州）新能源装备 (1)', key: 'e_1800' },
      { title: 'E_2000 - 金盘中国小合并 (2)', key: 'e_2000' },
      { title: 'E_2400 - 武汉智能科技研究院小合并 (6)', key: 'e_2400' },
      { title: 'E_4000 - 桂林君泰福电气有限公司小合并 (4)', key: 'e_4000' },
      { title: 'E_4300 - 金盘智能机器人(海南)小合并 (2)', key: 'e_4300' },
      { title: 'E_5000 - JST Powr HK小合并 (12)', key: 'e_5000' },
      { title: 'E_6601 - JST Global Energy Group小合并 (9)', key: 'e_6601' },
      { title: 'E_7000 - 海南金盘科技新能源投资小合并 (1)', key: 'e_7000' },
      { title: 'E_7019 - 海口琼山金盘新能源小合并 (2)', key: 'e_7019' },
    ],
  },
];

const departmentTreeData = [
  {
    title: 'PC_11 - 考核合并组 (194)',
    key: 'pc_11',
    children: [
      {
        title: 'PC_1101 - 中国业务 (161)',
        key: 'pc_1101',
        children: [
          {
            title: 'PC_110101 - 事业部-中国 (126)',
            key: 'pc_110101',
            children: [
              { title: 'PC_11010101 - 干变事业部 (14)', key: 'pc_11010101' },
              { title: 'PC_11010102 - 成套电气事业部 (15)', key: 'pc_11010102' },
              { title: 'PC_11010103 - 电抗变频事业部 (18)', key: 'pc_11010103' },
              { title: 'PC_11010104 - 出口开关事业部 (13)', key: 'pc_11010104' },
              { title: 'PC_11010105 - 国内储能事业部 (2)', key: 'pc_11010105' },
              { title: 'PC_11010106 - 海南电力系统工程事业部 (3)', key: 'pc_11010106' },
            ],
          },
        ],
      },
    ],
  },
];

const QueryConfigModal = ({ visible, initialConfig = {}, onOk, onCancel }) => {
  const [sourceMode, setSourceMode] = useState(initialConfig.sourceMode || 'all');
  const [tables, setTables] = useState(initialConfig.tables || []);
  const [files, setFiles] = useState(initialConfig.files || []);
  const [scopeType, setScopeType] = useState(initialConfig.scopeType || 'group');
  const [branches, setBranches] = useState(initialConfig.branches || []);
  const [caliber, setCaliber] = useState(initialConfig.caliber || 'internal');
  const [tableSelectMode, setTableSelectMode] = useState('all');
  const [fileSelectMode, setFileSelectMode] = useState('all');
  const [tableSearch, setTableSearch] = useState('');
  const [fileSearch, setFileSearch] = useState('');
  const [scopeMode, setScopeMode] = useState('all');
  const [scopeTreeType, setScopeTreeType] = useState('company');
  const [selectedCompanyKeys, setSelectedCompanyKeys] = useState([]);
  const [selectedDepartmentKeys, setSelectedDepartmentKeys] = useState([]);
  const [filterOption, setFilterOption] = useState('all');
  const [dataObject, setDataObject] = useState(initialConfig.dataObject || 'custom');
  const [showSelectedTablesOnly, setShowSelectedTablesOnly] = useState(false);
  const [showSelectedFilesOnly, setShowSelectedFilesOnly] = useState(false);

  const allTableNames = useMemo(() => tableOptions.map((item) => item.name), []);
  const allFileNames = useMemo(() => fileOptions.map((item) => item.name), []);

  const controlsDisabled = dataObject !== 'custom';

  const customTablesRef = useRef([]);
  const customFilesRef = useRef([]);

  useEffect(() => {
    if (!visible) return;

      setSourceMode(initialConfig.sourceMode || 'all');
      
    const initialTables = Array.isArray(initialConfig.tables) ? initialConfig.tables : [];
    const sanitizedTables = initialTables.filter((name) => allTableNames.includes(name));
    const isAllTables = sanitizedTables.length === allTableNames.length &&
      allTableNames.every((name) => sanitizedTables.includes(name));
    if (isAllTables) {
      setTableSelectMode('all');
      setTables([...allTableNames]);
    } else if (sanitizedTables.length === 0) {
      setTableSelectMode('none');
      setTables([]);
    } else {
      setTableSelectMode('custom');
      setTables(sanitizedTables);
    }
    customTablesRef.current = (sanitizedTables.length > 0 && sanitizedTables.length < allTableNames.length)
      ? sanitizedTables
      : [];

    const initialFiles = Array.isArray(initialConfig.files) ? initialConfig.files : [];
    const sanitizedFiles = initialFiles.filter((name) => allFileNames.includes(name));
    const isAllFiles = sanitizedFiles.length === allFileNames.length &&
      allFileNames.every((name) => sanitizedFiles.includes(name));
    if (isAllFiles) {
      setFileSelectMode('all');
      setFiles([...allFileNames]);
    } else if (sanitizedFiles.length === 0) {
      setFileSelectMode('none');
      setFiles([]);
    } else {
      setFileSelectMode('custom');
      setFiles(sanitizedFiles);
    }
    customFilesRef.current = (sanitizedFiles.length > 0 && sanitizedFiles.length < allFileNames.length)
      ? sanitizedFiles
      : [];

    if (initialConfig.scopeMode === 'custom') {
      setScopeMode('custom');
      setScopeTreeType(initialConfig.scopeTreeType || 'company');
      setSelectedCompanyKeys(initialConfig.companyKeys || []);
      setSelectedDepartmentKeys(initialConfig.departmentKeys || []);
    } else {
      setScopeMode('all');
      setScopeTreeType('company');
      setSelectedCompanyKeys([]);
      setSelectedDepartmentKeys([]);
    }
      setScopeType(initialConfig.scopeType || 'group');
    setBranches(Array.isArray(initialConfig.branches) ? initialConfig.branches : []);
    setFilterOption(initialConfig.filterOption || 'all');
      setCaliber(initialConfig.caliber || 'internal');
    setDataObject(initialConfig.dataObject || 'custom');
    setTableSearch('');
    setFileSearch('');
    setShowSelectedTablesOnly(false);
    setShowSelectedFilesOnly(false);
  }, [visible, initialConfig, allTableNames, allFileNames]);

  const handleTableSelectModeChange = (mode) => {
    if (tableSelectMode === 'custom' && mode !== 'custom') {
      customTablesRef.current = tables.filter((name) => allTableNames.includes(name));
    }

    if (mode === 'all') {
      setTables([...allTableNames]);
    } else if (mode === 'custom') {
      const candidate = customTablesRef.current && customTablesRef.current.length
        ? customTablesRef.current
        : tables.filter((name) => allTableNames.includes(name));
      setTables(candidate);
    } else {
      setTables([]);
    }

    setTableSelectMode(mode);
  };

  const handleFileSelectModeChange = (mode) => {
    if (fileSelectMode === 'custom' && mode !== 'custom') {
      customFilesRef.current = files.filter((name) => allFileNames.includes(name));
    }

    if (mode === 'all') {
      setFiles([...allFileNames]);
    } else if (mode === 'custom') {
      const candidate = customFilesRef.current && customFilesRef.current.length
        ? customFilesRef.current
        : files.filter((name) => allFileNames.includes(name));
      setFiles(candidate);
    } else {
      setFiles([]);
    }

    setFileSelectMode(mode);
  };

  const tableRowSelection = useMemo(() => ({
    selectedRowKeys: tables,
    onChange: (selectedRowKeys) => {
      if (controlsDisabled) return;
      setTables(selectedRowKeys);
      customTablesRef.current = selectedRowKeys;
    },
    preserveSelectedRowKeys: true,
    getCheckboxProps: () => ({ disabled: controlsDisabled }),
  }), [tables, controlsDisabled]);

  const fileRowSelection = useMemo(() => ({
    selectedRowKeys: files,
    onChange: (selectedRowKeys) => {
      if (controlsDisabled) return;
      setFiles(selectedRowKeys);
      customFilesRef.current = selectedRowKeys;
    },
    preserveSelectedRowKeys: true,
    getCheckboxProps: () => ({ disabled: controlsDisabled }),
  }), [files, controlsDisabled]);

  const createFilterDropdown = (label, options) => ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => {
    const activeKeys = selectedKeys || [];

    const baseItemStyle = (active) => ({
      padding: '6px 12px',
      borderRadius: 8,
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      cursor: 'pointer',
      fontSize: 13,
      fontWeight: active ? 600 : 500,
      background: active ? '#eaf2ff' : 'transparent',
      color: active ? '#1677ff' : '#1f2937',
      transition: 'all 0.2s',
      marginBottom: 4,
    });

    const iconStyle = (active) => ({
      fontSize: 14,
      color: '#1677ff',
      visibility: active ? 'visible' : 'hidden',
    });

    const handleSelectAll = () => {
      clearFilters();
      confirm({ closeDropdown: false });
    };

    const handleToggle = (value) => {
      const exists = activeKeys.includes(value);
      const nextKeys = exists
        ? activeKeys.filter((key) => key !== value)
        : [...activeKeys, value];
      setSelectedKeys(nextKeys);
      confirm({ closeDropdown: false });
    };

    return (
      <div style={{ width: 200, padding: '10px 12px' }}>
        <div style={baseItemStyle(activeKeys.length === 0)} onClick={handleSelectAll}>
          <CheckOutlined style={iconStyle(activeKeys.length === 0)} />
          <span>全部{label}</span>
        </div>
        {options.map((option) => {
          const active = activeKeys.includes(option.value);
          return (
            <div
              key={option.value}
              style={baseItemStyle(active)}
              onClick={() => handleToggle(option.value)}
            >
              <CheckOutlined style={iconStyle(active)} />
              <span>{option.text}</span>
            </div>
          );
        })}
      </div>
    );
  };

  const renderColumns = (tagFilters, sourceFilters) => {
    return [
      {
        title: '名称',
        dataIndex: 'name',
        key: 'name',
        render: (text) => <span>{text}</span>,
      },
      {
        title: '标签',
        dataIndex: 'tags',
        key: 'tags',
        filters: tagFilters,
        filterMultiple: true,
        filterDropdown: createFilterDropdown('标签', tagFilters),
        filterIcon: ({ filtered }) => (
          <FilterFilled style={{ color: filtered ? '#1677ff' : '#cbd5f5' }} />
        ),
        onFilter: (value, record) => Array.isArray(record.tags) && record.tags.includes(value),
        render: (tags = []) => (
          <Space size={6} wrap>
            {tags.map((tag) => (
              <Tag key={tag} style={{ padding: '2px 8px', fontSize: 12 }}>{tag}</Tag>
            ))}
          </Space>
        ),
      },
      {
        title: '来源',
        dataIndex: 'source',
        key: 'source',
        width: 150,
        filters: sourceFilters,
        filterMultiple: true,
        filterDropdown: createFilterDropdown('来源', sourceFilters),
        filterIcon: ({ filtered }) => (
          <FilterFilled style={{ color: filtered ? '#1677ff' : '#cbd5f5' }} />
        ),
        onFilter: (value, record) => record.source === value,
        render: (text) => (
          <Tag color="blue" style={{ padding: '2px 10px', fontSize: 12, background: '#eef5ff', borderColor: '#d6e4ff' }}>{text}</Tag>
        ),
      },
    ];
  };

  const tableData = useMemo(() => tableOptions.map((item) => ({ key: item.name, ...item })), []);
  const fileData = useMemo(() => fileOptions.map((item) => ({ key: item.name, ...item })), []);

  const tableTagFilters = useMemo(() => {
    const set = new Set();
    tableOptions.forEach((item) => (item.tags || []).forEach((tag) => set.add(tag)));
    return Array.from(set).map((tag) => ({ text: tag, value: tag }));
  }, []);

  const fileTagFilters = useMemo(() => {
    const set = new Set();
    fileOptions.forEach((item) => (item.tags || []).forEach((tag) => set.add(tag)));
    return Array.from(set).map((tag) => ({ text: tag, value: tag }));
  }, []);

  const tableSourceFilters = useMemo(() => (
    ['SAP', 'BPC', '本地上传'].map((source) => ({ text: source, value: source }))
  ), []);

  const fileSourceFilters = useMemo(() => (
    ['上市公司公告'].map((source) => ({ text: source, value: source }))
  ), []);

  const filteredTableData = useMemo(() => {
    const keyword = tableSearch.trim().toLowerCase();
    const selectedSet = new Set(tables);
    let data = tableData;
    if (showSelectedTablesOnly) {
      data = data.filter((item) => selectedSet.has(item.name));
    }
    if (!keyword) return data;
    return data.filter((item) => item.name.toLowerCase().includes(keyword));
  }, [tableData, tableSearch, showSelectedTablesOnly, tables]);

  const filteredFileData = useMemo(() => {
    const keyword = fileSearch.trim().toLowerCase();
    const selectedSet = new Set(files);
    let data = fileData;
    if (showSelectedFilesOnly) {
      data = data.filter((item) => selectedSet.has(item.name));
    }
    if (!keyword) return data;
    return data.filter((item) => item.name.toLowerCase().includes(keyword));
  }, [fileData, fileSearch, showSelectedFilesOnly, files]);

  const handleSave = (applyScope) => {
    const collectTitles = (keys, treeData) => {
      const results = [];
      const traverse = (nodes) => {
        nodes.forEach((node) => {
          if (keys.includes(node.key)) {
            results.push(node.title);
          }
          if (node.children) traverse(node.children);
        });
      };
      traverse(treeData);
      return results;
    };

    const companyTitles = collectTitles(selectedCompanyKeys, companyTreeData);
    const departmentTitles = collectTitles(selectedDepartmentKeys, departmentTreeData);
    
    onOk && onOk({ 
      sourceMode, 
      tables,
      files,
      scopeMode,
      scopeTreeType,
      companyKeys: selectedCompanyKeys,
      departmentKeys: selectedDepartmentKeys,
      companyTitles,
      departmentTitles,
      scopeType, 
      branches, 
      filterOption,
      dataObject,
      caliber, 
      applyScope,
    });
  };

  const handleApplyDataObject = (value) => {
    setDataObject(value);

    if (value === 'audit') {
      setCaliber('external');
      setFilterOption('all');
      setSourceMode('all');
      setTableSelectMode('all');
      setTables([...allTableNames]);
      customTablesRef.current = [];
      setFileSelectMode('all');
      setFiles([...allFileNames]);
      customFilesRef.current = [];
      setScopeMode('all');
      setSelectedCompanyKeys([]);
      setSelectedDepartmentKeys([]);
      setShowSelectedTablesOnly(true);
      setShowSelectedFilesOnly(true);
    } else if (value === 'government') {
      setCaliber('external');
      setFilterOption('excludeInternal');
      setSourceMode('custom');
      const presetTables = tableOptions
        .map((option) => option.name)
        .filter((name) => governmentDefaultTables.includes(name));
      setTableSelectMode(presetTables.length === allTableNames.length ? 'all' : 'custom');
      setTables(presetTables);
      customTablesRef.current = presetTables;
      setFileSelectMode('none');
      setFiles([]);
      customFilesRef.current = [];
      setScopeMode('all');
      setSelectedCompanyKeys([]);
      setSelectedDepartmentKeys([]);
      setShowSelectedTablesOnly(true);
      setShowSelectedFilesOnly(true);
    }
    if (value === 'custom') {
      setShowSelectedTablesOnly(false);
      setShowSelectedFilesOnly(false);
    }
  };

  const TableTabContent = ({ disabled }) => (
    <Space direction="vertical" size={12} style={{ width: '100%' }}>
      <Radio.Group
        value={tableSelectMode}
        onChange={(e) => handleTableSelectModeChange(e.target.value)}
        style={radioGroupInlineStyle}
        disabled={disabled}
      >
        <Radio value="none"><span style={radioOptionTextStyle}>不使用表</span></Radio>
        <Radio value="all"><span style={radioOptionTextStyle}>全部表</span></Radio>
        <Radio value="custom"><span style={radioOptionTextStyle}>指定表</span></Radio>
      </Radio.Group>

      {tableSelectMode === 'all' ? (
        <div style={{ padding: '12px 14px', borderRadius: 10, background: '#f5f8ff', color: '#1f2937', fontSize: 13 }}>
          已选择全部数据库表，无需逐项勾选。
        </div>
      ) : tableSelectMode === 'none' ? (
        <div style={{ padding: '12px 14px', borderRadius: 10, background: '#f8fafc', color: '#64748b', fontSize: 13 }}>
          当前未选择任何数据库表。
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Input
              allowClear
              value={tableSearch}
              onChange={(e) => setTableSearch(e.target.value)}
              placeholder="搜索名称"
              style={{ flex: 1, minWidth: 220, maxWidth: 320 }}
              disabled={disabled}
            />
            <Button
              size="small"
              type={showSelectedTablesOnly ? 'primary' : 'default'}
              style={{ marginLeft: 'auto' }}
              onClick={() => setShowSelectedTablesOnly((prev) => !prev)}
              disabled={disabled}
            >
              {showSelectedTablesOnly ? '显示全部' : '只看已选'}
            </Button>
          </div>
          <Table
            rowSelection={tableRowSelection}
            columns={renderColumns(tableTagFilters, tableSourceFilters)}
            dataSource={filteredTableData}
            pagination={getPaginationConfig(filteredTableData.length)}
            size="middle"
            scroll={{ y: 220 }}
            style={{ borderRadius: 10, boxShadow: '0 2px 6px rgba(15,23,42,0.08)' }}
          />
        </div>
      )}
    </Space>
  );

  const FileTabContent = ({ disabled }) => (
    <Space direction="vertical" size={12} style={{ width: '100%' }}>
      <Radio.Group
        value={fileSelectMode}
        onChange={(e) => handleFileSelectModeChange(e.target.value)}
        style={radioGroupInlineStyle}
        disabled={disabled}
      >
        <Radio value="none"><span style={radioOptionTextStyle}>不使用文件</span></Radio>
        <Radio value="all"><span style={radioOptionTextStyle}>全部文件</span></Radio>
        <Radio value="custom"><span style={radioOptionTextStyle}>指定文件</span></Radio>
      </Radio.Group>

      {fileSelectMode === 'all' ? (
        <div style={{ padding: '12px 14px', borderRadius: 10, background: '#f5f8ff', color: '#1f2937', fontSize: 13 }}>
          已选择全部文件，无需逐项勾选。
        </div>
      ) : fileSelectMode === 'none' ? (
        <div style={{ padding: '12px 14px', borderRadius: 10, background: '#f8fafc', color: '#64748b', fontSize: 13 }}>
          当前未选择任何文件。
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Input
              allowClear
              value={fileSearch}
              onChange={(e) => setFileSearch(e.target.value)}
              placeholder="搜索名称"
              style={{ flex: 1, minWidth: 220, maxWidth: 320 }}
              disabled={disabled}
            />
            <Button
              size="small"
              type={showSelectedFilesOnly ? 'primary' : 'default'}
              style={{ marginLeft: 'auto' }}
              onClick={() => setShowSelectedFilesOnly((prev) => !prev)}
              disabled={disabled}
            >
              {showSelectedFilesOnly ? '显示全部' : '只看已选'}
            </Button>
          </div>
          <Table
            rowSelection={fileRowSelection}
            columns={renderColumns(fileTagFilters, fileSourceFilters)}
            dataSource={filteredFileData}
            pagination={getPaginationConfig(filteredFileData.length)}
            size="middle"
            scroll={{ y: 220 }}
            style={{ borderRadius: 10, boxShadow: '0 2px 6px rgba(15,23,42,0.08)' }}
          />
        </div>
      )}
    </Space>
  );

  const tabItems = [
    {
      key: 'tables',
      label: (
        <Space size={6}>
          <DatabaseOutlined />
          <span>数据库表</span>
        </Space>
      ),
      children: <TableTabContent disabled={controlsDisabled} />,
    },
    {
      key: 'files',
      label: (
        <Space size={6}>
          <FileTextOutlined />
          <span>文件</span>
        </Space>
      ),
      children: <FileTabContent disabled={controlsDisabled} />,
    },
  ];

  return (
    <Modal
      open={visible}
      title="问数配置"
      onCancel={onCancel}
      footer={[
        <Button key="cancel" onClick={onCancel}>取消</Button>,
        <Button 
          key="current" 
          onClick={() => handleSave('current')}
          style={{ borderColor: '#1890ff', color: '#1890ff' }}
        >
          应用到本对话
        </Button>,
        <Button key="all" type="primary" onClick={() => handleSave('all')}>
          应用到全部对话
        </Button>,
      ]}
      width={1280}
      destroyOnClose
    >
      <Space direction="vertical" size={4} style={{ width: '100%' }}>
        <div
          style={{
            ...sectionStyle,
            background: '#f1f5ff',
            border: '1px solid rgba(59,130,246,0.2)',
            boxShadow: '0 6px 16px rgba(37,99,235,0.08)',
          }}
        >
          <div style={sectionHeaderStyle}>
            <span style={{ ...sectionTitleStyle, color: '#1d4ed8' }}>数据对象</span>
            <span style={{ ...sectionDescStyle, color: '#3b82f6' }}>选择预设对象可快速应用推荐配置，如需自定义请选择默认对象</span>
          </div>
          <Radio.Group
            value={dataObject}
            onChange={(e) => handleApplyDataObject(e.target.value)}
            style={{ display: 'flex', gap: 32, flexWrap: 'wrap', alignItems: 'center' }}
          >
            <Radio value="custom"><span style={radioOptionTextStyle}>默认对象</span></Radio>
            <Radio value="audit"><span style={radioOptionTextStyle}>审计 / 券商 / 招投标 / 银行</span></Radio>
            <Radio value="government"><span style={radioOptionTextStyle}>政府相关</span></Radio>
          </Radio.Group>
          {controlsDisabled && (
            <div style={{ marginTop: 12, padding: '10px 14px', borderRadius: 8, background: '#e0ecff', color: '#1d4ed8', fontSize: 12 }}>
              当前使用数据对象预设，其他配置已锁定。如需调整，请切换回“默认对象”。
          </div>
        )}
        </div>
      </Space>

      <div style={{ opacity: controlsDisabled ? 0.6 : 1, marginTop: 8 }}>
        <Space direction="vertical" size={24} style={{ width: '100%' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: 24 }}>
            <div style={{ ...sectionStyle, display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={sectionHeaderStyle}>
                <span style={sectionTitleStyle}>数据口径</span>
                <span style={sectionDescStyle}>根据用途选择管口数据或法口数据</span>
              </div>
              <Radio.Group
                value={caliber}
                onChange={(e) => setCaliber(e.target.value)}
                disabled={controlsDisabled}
                style={{ display: 'flex', flexDirection: 'column', gap: 10 }}
              >
                <Radio value="internal">
                  <span style={{ ...radioOptionTextStyle, fontWeight: 600 }}>管口数据</span>
                  <span style={{ marginLeft: 8, color: '#64748b', fontSize: 12 }}>
                    适合内部管理使用，例如客户欠款，管口指客户收货即确认欠款。
                  </span>
                </Radio>
                <Radio value="external">
                  <span style={{ ...radioOptionTextStyle, fontWeight: 600 }}>法口数据</span>
                  <span style={{ marginLeft: 8, color: '#64748b', fontSize: 12 }}>
                    适合对外提供数据使用，例如招投标数据提供、对外报送相关数据等。
                  </span>
                </Radio>
              </Radio.Group>
            </div>

            <div style={{ ...sectionStyle, display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={sectionHeaderStyle}>
                <span style={sectionTitleStyle}>过滤条件</span>
                <span style={sectionDescStyle}>配置数据中过滤规则</span>
              </div>
              <Radio.Group
                value={filterOption}
                onChange={(e) => setFilterOption(e.target.value)}
                disabled={controlsDisabled}
                style={{ display: 'flex', flexDirection: 'column', gap: 10 }}
              >
                <Radio value="all"><span style={radioOptionTextStyle}>全部数据</span></Radio>
                <Radio value="excludeInternal"><span style={radioOptionTextStyle}>不含内部关联交易数据</span></Radio>
        </Radio.Group>
            </div>
          </div>

          <div style={sectionStyle}>
            <div style={sectionHeaderStyle}>
              <span style={sectionTitleStyle}>数据来源</span>
              <span style={sectionDescStyle}>选择数据来自哪里</span>
            </div>
            <Radio.Group
              value={sourceMode}
              onChange={(e) => setSourceMode(e.target.value)}
              disabled={controlsDisabled}
              style={radioGroupInlineStyle}
            >
              <Radio value="all"><span style={radioOptionTextStyle}>全部数据</span></Radio>
              <Radio value="custom"><span style={radioOptionTextStyle}>指定来源</span></Radio>
            </Radio.Group>
            {sourceMode === 'custom' && (
              <div style={{ marginTop: 16 }}>
                <Tabs defaultActiveKey="tables" items={tabItems} />
              </div>
            )}
          </div>

          <div style={sectionStyle}>
            <div style={sectionHeaderStyle}>
              <span style={sectionTitleStyle}>数据范围</span>
              <span style={sectionDescStyle}>选择统计范围（可按公司或事业部限定）</span>
            </div>
            <Radio.Group
              value={scopeMode}
              onChange={(e) => setScopeMode(e.target.value)}
              disabled={controlsDisabled}
              style={radioGroupInlineStyle}
            >
              <Radio value="all"><span style={radioOptionTextStyle}>所有数据</span></Radio>
              <Radio value="custom"><span style={radioOptionTextStyle}>指定范围</span></Radio>
            </Radio.Group>
            {scopeMode === 'custom' && (
              <div style={{ marginTop: 16 }}>
                <Radio.Group
                  value={scopeTreeType}
                  onChange={(e) => setScopeTreeType(e.target.value)}
                  style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}
                  disabled={controlsDisabled}
                >
                  <Radio.Button value="company" style={toggleButtonStyle}>按公司选择</Radio.Button>
                  <Radio.Button value="department" style={toggleButtonStyle}>按事业部选择</Radio.Button>
                </Radio.Group>
                <div style={{ marginTop: 16 }}>
                  <div style={treeWrapperStyle}>
                    <Tree
                      checkable
                      selectable={false}
                      showIcon={false}
                      treeData={scopeTreeType === 'company' ? (controlsDisabled ? mapTreeDisabled(companyTreeData, true) : companyTreeData) : (controlsDisabled ? mapTreeDisabled(departmentTreeData, true) : departmentTreeData)}
                      checkedKeys={scopeTreeType === 'company' ? selectedCompanyKeys : selectedDepartmentKeys}
                      onCheck={(checkedKeys) => {
                        if (scopeTreeType === 'company') {
                          setSelectedCompanyKeys(checkedKeys);
                        } else {
                          setSelectedDepartmentKeys(checkedKeys);
                        }
                      }}
                      defaultExpandAll
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </Space>
      </div>
    </Modal>
  );
};

export default QueryConfigModal;
