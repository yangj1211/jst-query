function chineseToNumber(str) {
  const map = { '一': 1, '二': 2, '两': 2, '三': 3, '四': 4, '五': 5, '六': 6, '七': 7, '八': 8, '九': 9, '十': 10 };
  if (!str) return null;
  if (map[str] !== undefined) return map[str];
  if (str.startsWith('十') && str.length === 2 && map[str[1]] !== undefined) return 10 + map[str[1]];
  if (str.length === 2 && map[str[0]] !== undefined && str[1] === '十') return map[str[0]] * 10;
  if (str.length === 3 && map[str[0]] !== undefined && str[1] === '十' && map[str[2]] !== undefined) return map[str[0]] * 10 + map[str[2]];
  return null;
}

const cnNum = '[一二两三四五六七八九十]+';
const topNRegex = new RegExp(`(?:(?:前|top\\s*)(\\d+|${cnNum})大?|(\\d+|${cnNum})大|十大)\\s*(客户|项目|订单)`, 'i');

const tests = [
  '前三大客户的发票',
  '前十大客户的合同',
  '前5大客户',
  '前五客户',
  '十大客户',
  'top 10 客户',
  '3大客户',
  '三大客户',
  '前二十客户',
];

tests.forEach(q => {
  const m = q.match(topNRegex);
  if (m) {
    const raw = m[1] || m[2];
    let limit;
    if (!raw) limit = 10;
    else if (/^\d+$/.test(raw)) limit = parseInt(raw, 10);
    else limit = chineseToNumber(raw) || 10;
    console.log(`"${q}" => matched, limit: ${limit}, target: ${m[3]}`);
  } else {
    console.log(`"${q}" => NO MATCH`);
  }
});
