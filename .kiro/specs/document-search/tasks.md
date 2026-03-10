# Implementation Plan: 单据检索

## Overview

基于设计文档，将现有 `SalesDocumentSearch` 组件从硬编码 mock 数据重构为数据分离 + 查询引擎驱动的架构。实现顺序：数据层 → 解析器 → 检索服务 → UI 集成。

## Tasks

- [x] 1. 拆分数据源：创建 Order_Table 和 Document_Table
  - [x] 1.1 创建 `src/data/orderTable.js`，将 `mockResults` 中的订单字段和 `getDetailData` 中的详情字段合并为完整的订单记录数组
    - 每条记录包含设计文档中 Order 数据模型的所有字段
    - 以 `orderNo` 为主键
    - _Requirements: 1.1_
  - [x] 1.2 创建 `src/data/documentTable.js`，将 `mockResults` 中每个订单的 `documents` 数组提取为独立的文件记录数组
    - 每条记录包含 `id, orderNo, type, name, tag, tagColor, path`
    - `orderNo` 作为外键关联到 Order_Table
    - _Requirements: 1.2, 1.3_
  - [ ]* 1.3 编写属性测试验证引用完整性
    - **Property 14: 引用完整性**
    - **Validates: Requirements 1.3**

- [x] 2. 实现 QueryParser 查询条件解析器
  - [x] 2.1 创建 `src/utils/queryParser.js`，实现 `parseQuery(question)` 函数
    - 基于关键词和正则匹配解析自然语言
    - 支持订单号匹配（`/订单号?\s*[:：]?\s*(\w+)/`）
    - 支持文件类型匹配（匹配已知 tag 列表：合同、发票、中标通知书、运行证明、运输单等）
    - 支持时间条件（"YYYY年之后/之前"、"YYYY年到YYYY年"）
    - 支持金额条件（"大于/小于/超过 N万/亿"）
    - 支持聚合查询识别（"十大客户"、"TOP N"）
    - 返回 `ParseResult` 结构
    - _Requirements: 2.1, 2.2, 3.1, 3.3, 3.4, 3.5_
  - [ ]* 2.2 编写属性测试验证解析器输出结构
    - **Property 5: 解析器输出结构有效性**
    - **Validates: Requirements 3.1**
  - [ ]* 2.3 编写属性测试验证文件类型条件定向
    - **Property 6: 文件类型条件定向正确性**
    - **Validates: Requirements 3.3**
  - [ ]* 2.4 编写属性测试验证字段值规范化
    - **Property 7: 字段值规范化正确性**
    - **Validates: Requirements 3.4, 3.5**

- [x] 3. 实现 SearchService 检索服务
  - [x] 3.1 创建 `src/utils/searchService.js`，实现 `executeSearch(parseResult, orderTable, documentTable)` 函数
    - 分离 order 条件和 document 条件
    - 对 order 条件逐条过滤 orderTable
    - 对 document 条件过滤 documentTable，取匹配的 orderNo 集合与 order 结果取交集
    - 为每个命中订单关联其文件列表
    - 支持聚合查询（groupBy + orderBy + limit）
    - 生成 summary 摘要文本
    - 返回 `ResultSet` 结构
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 4.1, 7.1, 7.2, 7.3_
  - [ ]* 3.2 编写属性测试验证 Order-Document 关联
    - **Property 1: Order-Document 关联正确性**
    - **Validates: Requirements 1.4, 5.5, 7.3**
  - [ ]* 3.3 编写属性测试验证 AND 逻辑查询
    - **Property 2: AND 逻辑查询正确性**
    - **Validates: Requirements 2.2**
  - [ ]* 3.4 编写属性测试验证文件类型跨表查询
    - **Property 3: 文件类型跨表查询正确性**
    - **Validates: Requirements 2.3**
  - [ ]* 3.5 编写属性测试验证聚合查询
    - **Property 4: 聚合查询正确性**
    - **Validates: Requirements 2.4**
  - [ ]* 3.6 编写属性测试验证 ResultSet 结构完整性
    - **Property 12: ResultSet 结构完整性**
    - **Validates: Requirements 7.1**
  - [ ]* 3.7 编写属性测试验证聚合结果结构
    - **Property 13: 聚合结果结构**
    - **Validates: Requirements 7.2**
  - [ ]* 3.8 编写属性测试验证摘要信息完整性
    - **Property 8: 摘要信息完整性**
    - **Validates: Requirements 4.1**

- [x] 4. Checkpoint - 确保数据层和查询引擎测试通过
  - 确保所有测试通过，如有问题请向用户确认。

- [x] 5. 集成到 SalesDocumentSearch 组件
  - [x] 5.1 重构 `SalesDocumentSearch.js`：引入数据源和查询引擎
    - 导入 `orderTable`、`documentTable`、`parseQuery`、`executeSearch`
    - 新增 `searchResults` 状态（类型为 `ResultSet`），初始值包含全量订单
    - 右侧面板数据源从 `mockResults` 改为 `searchResults.orders`
    - 分页的 `total` 从硬编码改为 `searchResults.total`
    - 移除 `mockResults` 常量
    - JSX 中 `item.id` 全部替换为 `item.orderNo`
    - _Requirements: 1.4, 5.1, 5.4_
  - [x] 5.2 重构 `handleDocSendMessage`：接入真实查询流程
    - 在思考过程动画完成后，调用 `parseQuery(question)` 获取 `ParseResult`
    - 调用 `executeSearch(parseResult, orderTable, documentTable)` 获取 `ResultSet`
    - 用 `ResultSet` 构建 `QueryResult` 组件的 data 结构（summary、resultBlocks）
    - 聚合查询时在 resultBlocks 中添加聚合表格
    - 空结果时显示提示信息
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 4.1, 4.2, 4.3, 4.4_
  - [x] 5.3 实现右侧面板联动更新
    - 查询完成后更新 `searchResults` 状态
    - 重置 `currentPage` 为 1
    - 清空 `selectedItems` 和重置 `selectedDocumentTypes` 为 `['__ALL__']`
    - 重置 `expandedItems`
    - _Requirements: 5.1, 5.2, 5.3_
  - [x] 5.4 更新详情抽屉数据源
    - `getDetailData` 改为直接从订单对象读取字段，而非硬编码
    - _Requirements: 1.1, 1.4_
  - [ ]* 5.5 编写属性测试验证搜索重置 UI 状态
    - **Property 11: 搜索重置 UI 状态**
    - **Validates: Requirements 5.2, 5.3**

- [x] 6. Final checkpoint - 确保所有测试通过
  - webpack 编译成功，无诊断错误。

- [x] 7. 左侧对话中嵌入带分页的订单列表表格
  - [x] 7.1 扩展 `searchService.js`：在 ResultSet 中新增 `orderColumns` 字段，根据查询使用的字段动态生成表格列定义（至少包含订单号列）
    - _Requirements: 7.1, 7.4_
  - [x] 7.2 重构左侧结果展示：将原来的订单摘要卡片替换为 Ant Design Table 组件，使用 `orderColumns` 作为列定义，`orders` 作为数据源
    - 表格展示在摘要文本和聚合表格（如有）之后
    - _Requirements: 4.3, 4.4_
  - [x] 7.3 为左侧订单列表表格添加分页控件，支持翻页浏览（独立于右侧面板的分页）
    - _Requirements: 4.5_

- [x] 8. 实现历史消息"查看订单"入口与右侧面板联动
  - [x] 8.1 在每条历史查询结果消息中添加"查看订单"按钮（History_Entry）
    - _Requirements: 8.2_
  - [x] 8.2 实现点击"查看订单"按钮时，将该历史消息对应的订单数据更新到右侧 Results_Panel，并重置分页、选中状态和文件类型筛选
    - _Requirements: 8.3, 8.4_

- [x] 9. Final checkpoint - 确保新功能集成完毕
  - 确保 webpack 编译成功，无诊断错误。

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties
- Unit tests validate specific examples and edge cases
