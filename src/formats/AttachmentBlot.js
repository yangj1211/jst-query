/**
 * Quill 自定义 Blot：评论区附件（内联展示为可下载链接，图标按文件类型显示）
 * 存储 filename + base64，便于随 HTML 一起提交
 */
import Quill from 'quill';
import { getAttachmentIconSvgHtml } from '../utils/fileTypeIcon';

const Embed = Quill.import('blots/embed');

function escapeHtml(s) {
  const t = String(s ?? '');
  return t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

class AttachmentBlot extends Embed {
  static blotName = 'attachment';
  static tagName = 'SPAN';
  static className = 'comment-attachment';

  /**
   * @param {{ filename: string, href: string }} value - href 为 data URL (base64)
   */
  static create(value) {
    const node = super.create(value);
    if (value && typeof value === 'object') {
      const { filename, href } = value;
      const name = filename || '附件';
      node.setAttribute('data-filename', name);
      node.setAttribute('data-href', href || '');
      node.setAttribute('contenteditable', 'false');
      node.innerHTML = getAttachmentIconSvgHtml(name) + ' ' + escapeHtml(name);
      node.setAttribute('title', `下载: ${name}`);
    }
    return node;
  }

  static value(node) {
    return {
      filename: node.getAttribute('data-filename') || '',
      href: node.getAttribute('data-href') || '',
    };
  }
}

Quill.register({ 'formats/attachment': AttachmentBlot });

export default AttachmentBlot;
