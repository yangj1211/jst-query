# Requirements Document

## Introduction

单据检索功能允许用户通过自然语言对话的方式，基于订单字段的任意组合条件检索销售单据。系统解析用户问题后，从订单表和文件表中查询匹配数据，在左侧对话区展示 AI 回答（包含自然语言摘要、可选的聚合表格、以及带分页的订单列表表格），同时联动更新右侧订单列表面板。用户可通过历史消息中的入口切换右侧面板数据。

## Glossary

- **Search_Engine**: 单据检索核心引擎，负责解析用户自然语言问题、构建查询条件、执行检索并返回结果
- **Order_Table**: 订单主表，存储订单基础信息、发票信息、付款信息等所有详情字段，以订单号（orderNo）为主键
- **Document_Table**: 文件表，存储订单关联的文件信息（合同、发票、运行证明等），通过订单号（orderNo）与 Order_Table 关联
- **Chat_Panel**: 左侧对话面板，用户输入问题并展示 AI 回答（摘要 + 聚合表格 + 订单列表表格）
- **Results_Panel**: 右侧订单列表面板，展示当前查询命中的订单卡片及其关联文件
- **Query_Condition**: 从用户自然语言中解析出的结构化查询条件，包含字段名、运算符、值的组合
- **Result_Set**: 一次查询返回的订单列表、统计摘要、动态列定义等信息
- **Order_List_Table**: 左侧对话中嵌入的订单列表表格，列由查询返回的字段动态决定，支持分页浏览
- **History_Entry**: 历史消息中的"查看订单"入口按钮，点击后将该历史查询的订单数据更新到右侧面板

## Requirements

### Requirement 1: 数据模型分离

**User Story:** As a 开发者, I want 订单详情字段和文件信息分别存储在独立的数据结构中, so that 数据职责清晰且便于独立查询和维护。

#### Acceptance Criteria

1. THE Order_Table SHALL 包含订单的所有详情字段，包括但不限于：销售凭证、凭证日期、售达方、客户名称、销售代表处描述、销售地区描述、合同总金额、货币、分销渠道描述、控股方、用户行业描述、税率、VAT发票号、VAT发票时间、VAT发票金额、回款时间、回款金额、欠款金额、付款条件备注
2. THE Document_Table SHALL 包含文件的元信息字段：文件ID、关联订单号（orderNo）、文件类型（type）、文件名称（name）、文件标签（tag）、标签颜色（tagColor）、文件路径（path）
3. THE Document_Table SHALL 通过订单号（orderNo）字段与 Order_Table 建立一对多关联关系
4. WHEN 查询订单详情时, THE Search_Engine SHALL 从 Order_Table 获取订单字段，并从 Document_Table 获取该订单关联的所有文件

### Requirement 2: 自然语言多条件组合查询

**User Story:** As a 业务用户, I want 通过自然语言描述任意字段组合条件来检索订单, so that 无需了解数据库结构即可灵活查询。

#### Acceptance Criteria

1. WHEN 用户输入包含单个字段条件的问题（如"请提供2018000740订单号的发票"）, THE Search_Engine SHALL 解析出对应的字段名和匹配值并执行查询
2. WHEN 用户输入包含多个字段组合条件的问题（如"查询2025年之后金额大于200万且有运输单的订单"）, THE Search_Engine SHALL 解析出所有条件并以 AND 逻辑组合执行查询
3. WHEN 用户输入涉及文件类型筛选的问题（如"查询有中标通知书的订单"）, THE Search_Engine SHALL 联合 Document_Table 进行关联查询，返回拥有指定类型文件的订单
4. WHEN 用户输入涉及聚合统计的问题（如"我们的十大客户是什么"）, THE Search_Engine SHALL 执行聚合查询并返回统计结果
5. IF 用户输入的问题无法解析出有效查询条件, THEN THE Search_Engine SHALL 返回友好提示，引导用户重新描述问题

### Requirement 3: 查询条件解析

**User Story:** As a 系统, I want 将自然语言问题转换为结构化查询条件, so that 能够准确地在数据表中执行检索。

#### Acceptance Criteria

1. WHEN 接收到用户问题时, THE Search_Engine SHALL 将自然语言解析为包含以下结构的 Query_Condition：字段名（fieldName）、运算符（operator: eq/gt/lt/gte/lte/contains/in）、值（value）
2. WHEN 解析出多个条件时, THE Search_Engine SHALL 将多个 Query_Condition 组合为条件数组，默认使用 AND 逻辑连接
3. WHEN 问题涉及文件类型条件时, THE Search_Engine SHALL 生成针对 Document_Table 的 tag 字段的查询条件，并标记为跨表关联查询
4. WHEN 问题涉及时间范围条件时, THE Search_Engine SHALL 将自然语言时间表达（如"2025年之后"）转换为具体的日期比较条件
5. WHEN 问题涉及金额条件时, THE Search_Engine SHALL 将自然语言金额表达（如"大于200万"）转换为具体的数值比较条件

### Requirement 4: 查询结果在左侧对话中的展示

**User Story:** As a 业务用户, I want 在左侧对话区看到完整的查询回答，包括摘要、可选的聚合表格和带分页的订单列表, so that 能在对话流中直接浏览查询结果。

#### Acceptance Criteria

1. WHEN 查询完成后, THE Chat_Panel SHALL 先展示自然语言摘要回答，包含命中订单总数和查询条件描述
2. WHEN 查询涉及聚合统计时, THE Chat_Panel SHALL 在摘要下方展示聚合结果表格（如十大客户排名表）
3. WHEN 查询返回订单列表时, THE Chat_Panel SHALL 在回答区域底部展示 Order_List_Table，以表格形式呈现订单数据
4. THE Order_List_Table 的列定义 SHALL 由查询返回的 usedFields 动态决定，展示与问题相关的字段列
5. WHEN Order_List_Table 的订单条数超过单页显示量时, THE Chat_Panel SHALL 提供分页控件，支持翻页浏览
6. WHEN 查询结果为空时, THE Chat_Panel SHALL 展示"未找到符合条件的订单"提示，并建议用户调整查询条件
7. THE Chat_Panel SHALL 保留完整的对话历史，每次新查询追加到对话流中

### Requirement 5: 右侧订单列表联动更新

**User Story:** As a 业务用户, I want 右侧订单列表根据每次查询结果自动更新, so that 能直接浏览和操作符合条件的订单。

#### Acceptance Criteria

1. WHEN 查询返回订单列表时, THE Results_Panel SHALL 用查询结果替换当前展示的订单列表
2. WHEN 订单列表更新后, THE Results_Panel SHALL 重置分页到第一页，并更新总条数显示
3. WHEN 订单列表更新后, THE Results_Panel SHALL 清空之前的选中状态和文件类型筛选
4. THE Results_Panel SHALL 对更新后的订单列表支持分页浏览、文件类型筛选、批量选择和下载等现有功能
5. WHEN 用户展开某个订单的文件列表时, THE Results_Panel SHALL 展示该订单在 Document_Table 中关联的所有文件

### Requirement 6: 查询过程展示

**User Story:** As a 业务用户, I want 在等待查询结果时看到处理进度, so that 了解系统正在工作且知道当前处于哪个阶段。

#### Acceptance Criteria

1. WHEN 用户发送查询问题后, THE Chat_Panel SHALL 立即展示思考过程组件，包含"理解问题"和"检索文档"两个步骤
2. WHILE 查询正在执行时, THE Chat_Panel SHALL 以加载动画展示当前正在执行的步骤
3. WHEN 每个步骤完成时, THE Chat_Panel SHALL 将该步骤状态更新为已完成并展示下一步骤
4. WHEN 所有步骤完成后, THE Chat_Panel SHALL 展示查询结果摘要

### Requirement 7: 查询结果数据结构

**User Story:** As a 开发者, I want 查询结果遵循统一的数据结构, so that 左侧摘要和右侧列表能从同一数据源渲染。

#### Acceptance Criteria

1. THE Search_Engine SHALL 返回包含以下结构的 Result_Set：订单列表（orders）、总条数（total）、摘要文本（summary）、使用字段列表（usedFields）、查询条件描述（conditionDesc）、订单列表表格列定义（orderColumns）
2. WHEN 查询涉及聚合统计时, THE Result_Set SHALL 额外包含聚合数据（aggregation）字段，包含表格列定义和数据行
3. THE Result_Set 中的每个订单对象 SHALL 包含 Order_Table 的字段以及从 Document_Table 关联查询得到的文件列表
4. THE Result_Set 中的 orderColumns SHALL 根据查询使用的字段动态生成表格列定义，至少包含订单号列

### Requirement 8: 左侧订单列表与右侧面板联动

**User Story:** As a 业务用户, I want 左侧对话中的订单列表和右侧面板保持数据联动, so that 能在两个视图间无缝切换浏览。

#### Acceptance Criteria

1. WHEN 新查询完成后, THE Chat_Panel 中最新的 Order_List_Table 数据 SHALL 与 Results_Panel 展示的数据保持一致
2. THE Chat_Panel 中每条历史查询结果 SHALL 提供一个 History_Entry 按钮（如"查看订单"）
3. WHEN 用户点击历史消息中的 History_Entry 按钮时, THE Results_Panel SHALL 用该历史查询的订单数据替换当前展示内容
4. WHEN 用户点击 History_Entry 按钮后, THE Results_Panel SHALL 重置分页到第一页，清空选中状态和文件类型筛选
