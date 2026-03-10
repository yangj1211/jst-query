# 需求文档

## 简介

在订单详情页中展示销售订单与交货单、批次号、退货单之间的关联关系。通过标签页分类展示各类关联单号列表，帮助用户快速了解一个销售订单下关联了哪些单据。

## 术语表

- **Order_Detail_Page**：订单详情页，展示单个销售订单完整信息的页面
- **Sales_Order**：销售订单，系统中的核心订单实体，以销售订单号（orderNo）为唯一标识
- **Delivery_Note**：交货单，记录货物交付信息的单据，一个销售订单可对应多个交货单
- **Batch_Number**：批次号（生产批次号），标识生产批次的编号，与交货单和销售订单均存在关联
- **Return_Order**：退货单，记录退货信息的单据，一个销售订单可对应多个退货单
- **Relations_Panel**：关联单据面板，订单详情页中用于展示所有关联单号的区域
- **Relation_Tab**：关联标签页，Relations_Panel 中按单据类型分类的标签页（交货单、批次号、退货单）

## 需求

### 需求 1：关联单据面板展示

**用户故事：** 作为销售人员，我想在订单详情页中看到该订单关联的所有单号，以便快速了解订单关联了哪些单据。

#### 验收标准

1. WHEN 用户打开 Order_Detail_Page，THE Relations_Panel SHALL 在订单基础信息下方展示一个包含"交货单"、"批次号"、"退货单"三个 Relation_Tab 的标签页组件
2. THE Relations_Panel SHALL 在每个 Relation_Tab 的标签文字旁展示该类型关联单号的数量徽标
3. WHEN 用户首次打开 Order_Detail_Page，THE Relations_Panel SHALL 默认激活"交货单"Relation_Tab
4. IF 某个 Relation_Tab 下无关联单号数据，THEN THE Relations_Panel SHALL 在该标签页内容区展示"暂无数据"的空状态提示

### 需求 2：交货单号列表展示

**用户故事：** 作为销售人员，我想查看销售订单下所有交货单号，以便知道该订单有哪些交货单。

#### 验收标准

1. WHEN 用户激活"交货单"Relation_Tab，THE Relations_Panel SHALL 以列表形式展示当前 Sales_Order 关联的所有 Delivery_Note 单号
2. THE Relations_Panel SHALL 为每条 Delivery_Note 仅展示交货单号一列
3. WHEN Delivery_Note 列表超过 10 条记录，THE Relations_Panel SHALL 启用分页功能，每页展示 10 条记录

### 需求 3：批次号列表展示

**用户故事：** 作为销售人员，我想查看销售订单下所有批次号，以便追溯生产批次情况。

#### 验收标准

1. WHEN 用户激活"批次号"Relation_Tab，THE Relations_Panel SHALL 以列表形式展示当前 Sales_Order 关联的所有 Batch_Number
2. THE Relations_Panel SHALL 为每条 Batch_Number 仅展示批次号一列
3. WHEN Batch_Number 列表超过 10 条记录，THE Relations_Panel SHALL 启用分页功能，每页展示 10 条记录

### 需求 4：退货单号列表展示

**用户故事：** 作为销售人员，我想查看销售订单下所有退货单号，以便了解退货情况。

#### 验收标准

1. WHEN 用户激活"退货单"Relation_Tab，THE Relations_Panel SHALL 以列表形式展示当前 Sales_Order 关联的所有 Return_Order 单号
2. THE Relations_Panel SHALL 为每条 Return_Order 仅展示退货单号一列
3. WHEN Return_Order 列表超过 10 条记录，THE Relations_Panel SHALL 启用分页功能，每页展示 10 条记录

### 需求 5：关联关系概览

**用户故事：** 作为销售人员，我想直观地看到销售订单关联的各类单据数量，以便快速了解订单的整体状况。

#### 验收标准

1. THE Relations_Panel SHALL 在标签页上方展示一个概览区域，以统计卡片形式展示交货单总数、批次号总数、退货单总数
2. WHEN 用户点击概览区域中的某个统计卡片，THE Relations_Panel SHALL 切换到对应的 Relation_Tab
3. THE Relations_Panel SHALL 在概览区域中用不同颜色区分交货单（蓝色）、批次号（绿色）、退货单（红色）三种单据类型

### 需求 6：关联单据数据加载

**用户故事：** 作为销售人员，我想在查看关联单号时获得流畅的体验，不因数据加载而感到等待。

#### 验收标准

1. WHEN Relations_Panel 正在加载关联单号数据时，THE Relations_Panel SHALL 在对应的 Relation_Tab 内容区展示加载骨架屏
2. IF 关联单号数据加载失败，THEN THE Relations_Panel SHALL 展示错误提示信息和"重新加载"按钮
3. WHEN 用户点击"重新加载"按钮，THE Relations_Panel SHALL 重新请求该 Relation_Tab 的关联单号数据
