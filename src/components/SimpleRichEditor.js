import React, { useRef, useEffect, useCallback, useState } from 'react';
import { Modal } from 'antd';
import './SimpleRichEditor.css';

/**
 * 在光标处插入图片节点
 * @param {HTMLDivElement} container - contentEditable 容器
 * @param {string} dataUrl - 图片 base64 地址
 */
function insertImageAtCursor(container, dataUrl) {
  const sel = window.getSelection();
  if (!sel.rangeCount) return;
  const range = sel.getRangeAt(0);
  const img = document.createElement('img');
  img.src = dataUrl;
  img.className = 'simple-rich-editor-pasted-img';
  img.alt = '粘贴的图片';
  range.insertNode(img);
  range.setStartAfter(img);
  range.setEndAfter(img);
  sel.removeAllRanges();
  sel.addRange(range);
}

/**
 * 简易富文本编辑器：支持输入文字、粘贴图片（Ctrl+V / 右键粘贴）
 * 值以 HTML 字符串形式通过 onChange 回传。
 * @param {Object} props
 * @param {string} [props.value=''] - 当前内容（HTML）
 * @param {(html: string) => void} [props.onChange] - 内容变化回调
 * @param {string} [props.placeholder] - 占位提示
 * @param {string} [props.className] - 外层 class
 * @param {React.CSSProperties} [props.style] - 外层样式（如 minHeight）
 * @param {boolean} [props.readOnly=false] - 是否只读（不可编辑）
 */
const SimpleRichEditor = ({ value = '', onChange, placeholder = '可输入文字，支持 Ctrl+V 粘贴图片', className = '', style = {}, readOnly = false }) => {
  const elRef = useRef(null);
  const isPasteRef = useRef(false);
  const [previewSrc, setPreviewSrc] = useState(null);

  /** 挂载时用 value 初始化内容（配合父组件 key 切换时重挂载） */
  useEffect(() => {
    const el = elRef.current;
    if (!el) return;
    if (el.innerHTML !== value) {
      el.innerHTML = value || '';
    }
  }, [value]);

  /** 点击图片查看大图（只读/编辑模式均支持，事件委托） */
  useEffect(() => {
    const el = elRef.current;
    if (!el) return;
    const onContainerClick = (e) => {
      if (e.target && e.target.tagName === 'IMG' && e.target.getAttribute('src')) {
        e.preventDefault();
        e.stopPropagation();
        setPreviewSrc(e.target.getAttribute('src'));
      }
    };
    el.addEventListener('click', onContainerClick);
    return () => el.removeEventListener('click', onContainerClick);
  }, [value]);

  /** 输入或粘贴后同步到父组件 */
  const syncContent = useCallback(() => {
    if (readOnly) return;
    const el = elRef.current;
    if (!el || !onChange) return;
    onChange(el.innerHTML || '');
  }, [onChange, readOnly]);

  /** 粘贴：若剪贴板为图片则插入到光标处 */
  const handlePaste = useCallback(
    (e) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      const item = Array.from(items).find((i) => i.type.indexOf('image') !== -1);
      if (!item) return;
      e.preventDefault();
      const file = item.getAsFile();
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        const el = elRef.current;
        if (!el) return;
        isPasteRef.current = true;
        insertImageAtCursor(el, reader.result);
        syncContent();
      };
      reader.readAsDataURL(file);
    },
    [syncContent]
  );

  return (
    <>
      <div
        ref={elRef}
        className={`simple-rich-editor ${readOnly ? 'simple-rich-editor-readonly' : ''} ${className}`}
        contentEditable={!readOnly}
        suppressContentEditableWarning
        data-placeholder={placeholder}
        style={style}
        onInput={syncContent}
        onPaste={readOnly ? undefined : handlePaste}
      />
      <Modal
        open={!!previewSrc}
        onCancel={() => setPreviewSrc(null)}
        footer={null}
        width="auto"
        styles={{ body: { padding: 0, textAlign: 'center' } }}
        getContainer={document.body}
      >
        {previewSrc && (
          <img
            src={previewSrc}
            alt="预览"
            style={{ maxWidth: '90vw', maxHeight: '85vh', display: 'block', margin: '0 auto' }}
          />
        )}
      </Modal>
    </>
  );
};

export default SimpleRichEditor;
