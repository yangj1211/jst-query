/**
 * @typedef {Object} RawTreeNode
 * @property {string} id 节点 ID
 * @property {string} name 节点名称
 * @property {number} [count] 子级数量
 * @property {RawTreeNode[]} [children] 子节点列表
 */

/**
 * @typedef {Object} TreeNode
 * @property {string} title 展示文案
 * @property {string} key 唯一 key
 * @property {TreeNode[]} [children] 子节点
 */

/**
 * 将 company/department JSON 节点转换为 antd Tree 支持的节点
 * @param {RawTreeNode} node JSON 节点
 * @returns {TreeNode|null} Tree 节点
 */
export const convertNodeToTree = (node) => {
  if (!node) return null;

  const { id, name, count, children } = node;
  const baseTitle = [id, name].filter(Boolean).join(' - ');
  const title = count !== undefined ? `${baseTitle} (${count})` : baseTitle;
  const key = (id ? String(id) : baseTitle).toLowerCase();

  const treeNode = {
    title,
    key,
  };

  if (Array.isArray(children) && children.length > 0) {
    const childNodes = children
      .map((child) => convertNodeToTree(child))
      .filter(Boolean);
    if (childNodes.length > 0) {
      treeNode.children = childNodes;
    }
  }

  return treeNode;
};

/**
 * 构建完整的树数据（antd Tree 期望数组格式）
 * @param {RawTreeNode} root 根节点
 * @returns {TreeNode[]} 树数据列表
 */
export const buildTreeDataFromJson = (root) => {
  const treeNode = convertNodeToTree(root);
  return treeNode ? [treeNode] : [];
};


