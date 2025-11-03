import React, { useState } from 'react';
import { Button, Space, Typography, Input } from 'antd';

const { Text } = Typography;

/**
 * ClarifyIntent - 多轮澄清意图
 * props:
 * - needTime: boolean
 * - needMetric: boolean
 * - onSubmit: (params: { timeRangeText?: string, metric?: string }) => void
 */
const ClarifyIntent = ({ needTime, needMetric, onSubmit }) => {
  const [timeRangeText, setTimeRangeText] = useState('');
  const [metric, setMetric] = useState('');
  const [metricCustom, setMetricCustom] = useState('');

  const timeOptions = ['本月', '上月', '最近三个月', '最近一年'];
  const metricOptions = ['销售额', '利润', '用户数', '订单数'];

  const canSubmit = (!needTime || !!timeRangeText) && (!needMetric || !!(metric || metricCustom));

  return (
    <div style={{ background: '#fff', border: '1px solid #e8e8e8', borderRadius: 8, padding: 16 }}>
      <div style={{ fontWeight: 500, marginBottom: 12 }}>为了给您更准确的答复，请补充以下信息：</div>
      {needTime && (
        <div style={{ marginBottom: 16 }}>
          <Text type="secondary">时间范围</Text>
          <div style={{ marginTop: 8 }}>
            <Space wrap>
              {timeOptions.map(opt => (
                <Button key={opt} type={timeRangeText === opt ? 'primary' : 'default'} onClick={() => setTimeRangeText(opt)}>{opt}</Button>
              ))}
            </Space>
          </div>
        </div>
      )}
      {needMetric && (
        <div style={{ marginBottom: 16 }}>
          <Text type="secondary">想要查询的指标</Text>
          <div style={{ marginTop: 8 }}>
            <Space wrap>
              {metricOptions.map(opt => (
                <Button key={opt} type={metric === opt ? 'primary' : 'default'} onClick={() => setMetric(opt)}>{opt}</Button>
              ))}
              <Input
                placeholder="其他指标（可输入）"
                style={{ width: 200 }}
                value={metricCustom}
                onChange={(e) => { setMetric(''); setMetricCustom(e.target.value); }}
              />
            </Space>
          </div>
        </div>
      )}
      <div style={{ textAlign: 'right' }}>
        <Button type="primary" disabled={!canSubmit} onClick={() => onSubmit({ timeRangeText, metric: metric || metricCustom })}>确定</Button>
      </div>
    </div>
  );
};

export default ClarifyIntent;
