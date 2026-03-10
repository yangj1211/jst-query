/**
 * 文件表（Document_Table）
 * 通过 orderNo 与 Order_Table 建立一对多关联
 */
const documentTable = [
  // 订单 2018000740 的文件
  { id: 'doc1', orderNo: '2018000740', type: 'pdf', name: '2018000740济南地铁...', tag: '中标通知书', tagColor: 'blue', path: '/user/kass/公司文档/营销/销售/01国内干变/合同/2018年合同/...' },
  { id: 'doc2', orderNo: '2018000740', type: 'pdf', name: '2078000740济南地铁R3号线一期工...', tag: '合同', tagColor: 'green', path: '/user/kass/公司文档/营销/销售/01国内干变/合同/2018年合同/...' },
  { id: 'doc3', orderNo: '2018000740', type: 'pdf', name: '2018000740济南地铁R3线---中航通...', tag: '合同', tagColor: 'green', path: '/user/kass/公司文档/营销/销售/01国内干变/合同/2018年合同/...' },
  { id: 'doc4', orderNo: '2018000740', type: 'image', name: '1742917077466_0221760146001931...', tag: '发票', tagColor: 'purple', path: '/user/kass/财务文档/发票/2018/...' },
  { id: 'doc5', orderNo: '2018000740', type: 'image', name: '00738896.jpg', tag: '发票', tagColor: 'purple', path: '/user/kass/财务文档/发票/2018/...' },
  { id: 'doc6', orderNo: '2018000740', type: 'pdf', name: '(运行证明) 2018000740济南市轨道...', tag: '运行证明', tagColor: 'orange', path: '/user/kass/项目文档/证明文件/...' },
  { id: 'doc7', orderNo: '2018000740', type: 'pdf', name: '年度合作协议-2018.pdf', tag: '年度合作协议', tagColor: 'cyan', path: '/user/kass/公司文档/合作协议/...' },
  { id: 'doc8', orderNo: '2018000740', type: 'pdf', name: '框架协议-济南轨道交通.pdf', tag: '框架协议', tagColor: 'geekblue', path: '/user/kass/公司文档/合作协议/...' },
  { id: 'doc9', orderNo: '2018000740', type: 'pdf', name: '报价单-R3线变压器.pdf', tag: '报价单', tagColor: 'magenta', path: '/user/kass/项目文档/报价单/...' },
  { id: 'doc10', orderNo: '2018000740', type: 'pdf', name: '到货签收单-001.pdf', tag: '到货签收单', tagColor: 'volcano', path: '/user/kass/物流文档/签收单/...' },
  { id: 'doc11', orderNo: '2018000740', type: 'pdf', name: '竣工决算单-R3.pdf', tag: '竣工决算单', tagColor: 'gold', path: '/user/kass/财务文档/决算/...' },
  { id: 'doc12', orderNo: '2018000740', type: 'pdf', name: '运输单-201805.pdf', tag: '运输单', tagColor: 'lime', path: '/user/kass/物流文档/运输单/...' },

  // 订单 2014001586 的文件
  { id: 'doc13', orderNo: '2014001586', type: 'pdf', name: '2014001586郑州地铁2号线合同.pdf', tag: '合同', tagColor: 'green', path: '/user/kass/公司文档/营销/销售/01国内干变/合同/2014年合同/...' },
  { id: 'doc14', orderNo: '2014001586', type: 'image', name: '发票-2014001586-001.jpg', tag: '发票', tagColor: 'purple', path: '/user/kass/财务文档/发票/2014/...' },

  // 订单 2014002143 的文件
  { id: 'doc15', orderNo: '2014002143', type: 'pdf', name: '2014002143郑州城郊铁路合同.pdf', tag: '合同', tagColor: 'green', path: '/user/kass/公司文档/营销/销售/01国内干变/合同/2014年合同/...' },

  // 订单 2012000553 的文件
  { id: 'doc16', orderNo: '2012000553', type: 'pdf', name: '北京地铁14号线中标通知书.pdf', tag: '中标通知书', tagColor: 'blue', path: '/user/kass/公司文档/营销/销售/中标通知/...' },
  { id: 'doc17', orderNo: '2012000553', type: 'pdf', name: '2012000553北京地铁14号线合同.pdf', tag: '合同', tagColor: 'green', path: '/user/kass/公司文档/营销/销售/01国内干变/合同/2012年合同/...' },
  { id: 'doc18', orderNo: '2012000553', type: 'pdf', name: '运输单-201209.pdf', tag: '运输单', tagColor: 'lime', path: '/user/kass/物流文档/运输单/...' },

  // 订单 2014002345 的文件
  { id: 'doc19', orderNo: '2014002345', type: 'pdf', name: '新疆甘泉堡翻车机合同.pdf', tag: '合同', tagColor: 'green', path: '/user/kass/公司文档/营销/销售/合同/2014年合同/...' },

  // 订单 2014002678 的文件
  { id: 'doc20', orderNo: '2014002678', type: 'pdf', name: '临城唐县光伏电站合同.pdf', tag: '合同', tagColor: 'green', path: '/user/kass/公司文档/营销/销售/合同/2014年合同/...' },
  { id: 'doc21', orderNo: '2014002678', type: 'pdf', name: '通电验收单-临城唐县.pdf', tag: '通电验收单', tagColor: 'red', path: '/user/kass/项目文档/验收单/...' },

  // ========== 新增订单的文件 ==========

  // 订单 2019001001 成都地铁5号线
  { id: 'doc22', orderNo: '2019001001', type: 'pdf', name: '成都地铁5号线中标通知书.pdf', tag: '中标通知书', tagColor: 'blue', path: '/user/kass/公司文档/营销/销售/中标通知/2019/...' },
  { id: 'doc23', orderNo: '2019001001', type: 'pdf', name: '2019001001成都地铁5号线合同.pdf', tag: '合同', tagColor: 'green', path: '/user/kass/公司文档/营销/销售/合同/2019年合同/...' },
  { id: 'doc24', orderNo: '2019001001', type: 'image', name: '发票-2019001001-001.jpg', tag: '发票', tagColor: 'purple', path: '/user/kass/财务文档/发票/2019/...' },
  { id: 'doc25', orderNo: '2019001001', type: 'image', name: '发票-2019001001-002.jpg', tag: '发票', tagColor: 'purple', path: '/user/kass/财务文档/发票/2019/...' },
  { id: 'doc26', orderNo: '2019001001', type: 'pdf', name: '运输单-201906.pdf', tag: '运输单', tagColor: 'lime', path: '/user/kass/物流文档/运输单/...' },

  // 订单 2019001002 成都地铁18号线
  { id: 'doc27', orderNo: '2019001002', type: 'pdf', name: '2019001002成都地铁18号线合同.pdf', tag: '合同', tagColor: 'green', path: '/user/kass/公司文档/营销/销售/合同/2019年合同/...' },
  { id: 'doc28', orderNo: '2019001002', type: 'image', name: '发票-2019001002-001.jpg', tag: '发票', tagColor: 'purple', path: '/user/kass/财务文档/发票/2019/...' },
  { id: 'doc29', orderNo: '2019001002', type: 'pdf', name: '到货签收单-成都18号线.pdf', tag: '到货签收单', tagColor: 'volcano', path: '/user/kass/物流文档/签收单/...' },

  // 订单 2020001003 深圳地铁12号线
  { id: 'doc30', orderNo: '2020001003', type: 'pdf', name: '深圳地铁12号线中标通知书.pdf', tag: '中标通知书', tagColor: 'blue', path: '/user/kass/公司文档/营销/销售/中标通知/2020/...' },
  { id: 'doc31', orderNo: '2020001003', type: 'pdf', name: '2020001003深圳地铁12号线合同.pdf', tag: '合同', tagColor: 'green', path: '/user/kass/公司文档/营销/销售/合同/2020年合同/...' },
  { id: 'doc32', orderNo: '2020001003', type: 'image', name: '发票-2020001003-001.jpg', tag: '发票', tagColor: 'purple', path: '/user/kass/财务文档/发票/2020/...' },
  { id: 'doc33', orderNo: '2020001003', type: 'image', name: '发票-2020001003-002.jpg', tag: '发票', tagColor: 'purple', path: '/user/kass/财务文档/发票/2020/...' },
  { id: 'doc34', orderNo: '2020001003', type: 'pdf', name: '运行证明-深圳12号线.pdf', tag: '运行证明', tagColor: 'orange', path: '/user/kass/项目文档/证明文件/...' },

  // 订单 2020001004 深圳地铁14号线
  { id: 'doc35', orderNo: '2020001004', type: 'pdf', name: '2020001004深圳地铁14号线合同.pdf', tag: '合同', tagColor: 'green', path: '/user/kass/公司文档/营销/销售/合同/2020年合同/...' },
  { id: 'doc36', orderNo: '2020001004', type: 'image', name: '发票-2020001004-001.jpg', tag: '发票', tagColor: 'purple', path: '/user/kass/财务文档/发票/2020/...' },
  { id: 'doc37', orderNo: '2020001004', type: 'pdf', name: '通电验收单-深圳14号线.pdf', tag: '通电验收单', tagColor: 'red', path: '/user/kass/项目文档/验收单/...' },

  // 订单 2021001005 武汉地铁11号线
  { id: 'doc38', orderNo: '2021001005', type: 'pdf', name: '武汉地铁11号线中标通知书.pdf', tag: '中标通知书', tagColor: 'blue', path: '/user/kass/公司文档/营销/销售/中标通知/2021/...' },
  { id: 'doc39', orderNo: '2021001005', type: 'pdf', name: '2021001005武汉地铁11号线合同.pdf', tag: '合同', tagColor: 'green', path: '/user/kass/公司文档/营销/销售/合同/2021年合同/...' },
  { id: 'doc40', orderNo: '2021001005', type: 'image', name: '发票-2021001005-001.jpg', tag: '发票', tagColor: 'purple', path: '/user/kass/财务文档/发票/2021/...' },
  { id: 'doc41', orderNo: '2021001005', type: 'pdf', name: '运输单-202104.pdf', tag: '运输单', tagColor: 'lime', path: '/user/kass/物流文档/运输单/...' },

  // 订单 2021001006 西安地铁8号线
  { id: 'doc42', orderNo: '2021001006', type: 'pdf', name: '2021001006西安地铁8号线合同.pdf', tag: '合同', tagColor: 'green', path: '/user/kass/公司文档/营销/销售/合同/2021年合同/...' },
  { id: 'doc43', orderNo: '2021001006', type: 'image', name: '发票-2021001006-001.jpg', tag: '发票', tagColor: 'purple', path: '/user/kass/财务文档/发票/2021/...' },
  { id: 'doc44', orderNo: '2021001006', type: 'image', name: '发票-2021001006-002.jpg', tag: '发票', tagColor: 'purple', path: '/user/kass/财务文档/发票/2021/...' },
  { id: 'doc45', orderNo: '2021001006', type: 'pdf', name: '到货签收单-西安8号线.pdf', tag: '到货签收单', tagColor: 'volcano', path: '/user/kass/物流文档/签收单/...' },

  // 订单 2022001007 青海格尔木光伏
  { id: 'doc46', orderNo: '2022001007', type: 'pdf', name: '青海格尔木光伏电站合同.pdf', tag: '合同', tagColor: 'green', path: '/user/kass/公司文档/营销/销售/合同/2022年合同/...' },
  { id: 'doc47', orderNo: '2022001007', type: 'image', name: '发票-2022001007-001.jpg', tag: '发票', tagColor: 'purple', path: '/user/kass/财务文档/发票/2022/...' },
  { id: 'doc48', orderNo: '2022001007', type: 'pdf', name: '通电验收单-格尔木光伏.pdf', tag: '通电验收单', tagColor: 'red', path: '/user/kass/项目文档/验收单/...' },

  // 订单 2022001008 内蒙古风电
  { id: 'doc49', orderNo: '2022001008', type: 'pdf', name: '内蒙古乌兰察布风电场合同.pdf', tag: '合同', tagColor: 'green', path: '/user/kass/公司文档/营销/销售/合同/2022年合同/...' },
  { id: 'doc50', orderNo: '2022001008', type: 'image', name: '发票-2022001008-001.jpg', tag: '发票', tagColor: 'purple', path: '/user/kass/财务文档/发票/2022/...' },
  { id: 'doc51', orderNo: '2022001008', type: 'pdf', name: '运输单-202209.pdf', tag: '运输单', tagColor: 'lime', path: '/user/kass/物流文档/运输单/...' },

  // 订单 2023001009 南京地铁7号线
  { id: 'doc52', orderNo: '2023001009', type: 'pdf', name: '南京地铁7号线中标通知书.pdf', tag: '中标通知书', tagColor: 'blue', path: '/user/kass/公司文档/营销/销售/中标通知/2023/...' },
  { id: 'doc53', orderNo: '2023001009', type: 'pdf', name: '2023001009南京地铁7号线合同.pdf', tag: '合同', tagColor: 'green', path: '/user/kass/公司文档/营销/销售/合同/2023年合同/...' },
  { id: 'doc54', orderNo: '2023001009', type: 'image', name: '发票-2023001009-001.jpg', tag: '发票', tagColor: 'purple', path: '/user/kass/财务文档/发票/2023/...' },
  { id: 'doc55', orderNo: '2023001009', type: 'pdf', name: '到货签收单-南京7号线.pdf', tag: '到货签收单', tagColor: 'volcano', path: '/user/kass/物流文档/签收单/...' },

  // 订单 2023001010 广州地铁13号线
  { id: 'doc56', orderNo: '2023001010', type: 'pdf', name: '广州地铁13号线中标通知书.pdf', tag: '中标通知书', tagColor: 'blue', path: '/user/kass/公司文档/营销/销售/中标通知/2023/...' },
  { id: 'doc57', orderNo: '2023001010', type: 'pdf', name: '2023001010广州地铁13号线合同.pdf', tag: '合同', tagColor: 'green', path: '/user/kass/公司文档/营销/销售/合同/2023年合同/...' },
  { id: 'doc58', orderNo: '2023001010', type: 'image', name: '发票-2023001010-001.jpg', tag: '发票', tagColor: 'purple', path: '/user/kass/财务文档/发票/2023/...' },
  { id: 'doc59', orderNo: '2023001010', type: 'image', name: '发票-2023001010-002.jpg', tag: '发票', tagColor: 'purple', path: '/user/kass/财务文档/发票/2023/...' },
  { id: 'doc60', orderNo: '2023001010', type: 'pdf', name: '运行证明-广州13号线.pdf', tag: '运行证明', tagColor: 'orange', path: '/user/kass/项目文档/证明文件/...' },

  // 订单 2023001011 宝钢湛江
  { id: 'doc61', orderNo: '2023001011', type: 'pdf', name: '宝钢湛江冶金变压器合同.pdf', tag: '合同', tagColor: 'green', path: '/user/kass/公司文档/营销/销售/合同/2023年合同/...' },
  { id: 'doc62', orderNo: '2023001011', type: 'image', name: '发票-2023001011-001.jpg', tag: '发票', tagColor: 'purple', path: '/user/kass/财务文档/发票/2023/...' },
  { id: 'doc63', orderNo: '2023001011', type: 'pdf', name: '到货签收单-宝钢湛江.pdf', tag: '到货签收单', tagColor: 'volcano', path: '/user/kass/物流文档/签收单/...' },

  // 订单 2024001012 中石化镇海
  { id: 'doc64', orderNo: '2024001012', type: 'pdf', name: '中石化镇海炼化合同.pdf', tag: '合同', tagColor: 'green', path: '/user/kass/公司文档/营销/销售/合同/2024年合同/...' },
  { id: 'doc65', orderNo: '2024001012', type: 'image', name: '发票-2024001012-001.jpg', tag: '发票', tagColor: 'purple', path: '/user/kass/财务文档/发票/2024/...' },
  { id: 'doc66', orderNo: '2024001012', type: 'pdf', name: '运输单-202403.pdf', tag: '运输单', tagColor: 'lime', path: '/user/kass/物流文档/运输单/...' },

  // 订单 2024001013 甘肃酒泉风电
  { id: 'doc67', orderNo: '2024001013', type: 'pdf', name: '甘肃酒泉风电场合同.pdf', tag: '合同', tagColor: 'green', path: '/user/kass/公司文档/营销/销售/合同/2024年合同/...' },
  { id: 'doc68', orderNo: '2024001013', type: 'image', name: '发票-2024001013-001.jpg', tag: '发票', tagColor: 'purple', path: '/user/kass/财务文档/发票/2024/...' },

  // 订单 2024001014 济南轨道交通4号线
  { id: 'doc69', orderNo: '2024001014', type: 'pdf', name: '济南轨道交通4号线中标通知书.pdf', tag: '中标通知书', tagColor: 'blue', path: '/user/kass/公司文档/营销/销售/中标通知/2024/...' },
  { id: 'doc70', orderNo: '2024001014', type: 'pdf', name: '2024001014济南轨道交通4号线合同.pdf', tag: '合同', tagColor: 'green', path: '/user/kass/公司文档/营销/销售/合同/2024年合同/...' },
  { id: 'doc71', orderNo: '2024001014', type: 'image', name: '发票-2024001014-001.jpg', tag: '发票', tagColor: 'purple', path: '/user/kass/财务文档/发票/2024/...' },
  { id: 'doc72', orderNo: '2024001014', type: 'image', name: '发票-2024001014-002.jpg', tag: '发票', tagColor: 'purple', path: '/user/kass/财务文档/发票/2024/...' },

  // 订单 2025001015 长沙地铁6号线
  { id: 'doc73', orderNo: '2025001015', type: 'pdf', name: '长沙地铁6号线中标通知书.pdf', tag: '中标通知书', tagColor: 'blue', path: '/user/kass/公司文档/营销/销售/中标通知/2025/...' },
  { id: 'doc74', orderNo: '2025001015', type: 'pdf', name: '2025001015长沙地铁6号线合同.pdf', tag: '合同', tagColor: 'green', path: '/user/kass/公司文档/营销/销售/合同/2025年合同/...' },

  // 订单 2025001016 宁夏中卫光伏
  { id: 'doc75', orderNo: '2025001016', type: 'pdf', name: '宁夏中卫光伏电站合同.pdf', tag: '合同', tagColor: 'green', path: '/user/kass/公司文档/营销/销售/合同/2025年合同/...' },
];

export default documentTable;
