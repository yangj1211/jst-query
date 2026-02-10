import React, { useRef, useMemo, useEffect, useState } from 'react';
import ReactQuill from 'react-quill';
import {
  FilePdfOutlined,
  FileExcelOutlined,
  FileWordOutlined,
  FileImageOutlined,
  FilePptOutlined,
  FileZipOutlined,
  FileTextOutlined,
  FileOutlined,
} from '@ant-design/icons';
import 'react-quill/dist/quill.snow.css';
import './CommentRichEditor.css';
import '../formats/AttachmentBlot'; // 注册附件 Blot（仅用于展示历史回复中的内联附件）

/** 根据文件名后缀返回对应文件类型图标（用于附件芯片） */
function getFileTypeIcon(filename) {
  if (!filename || typeof filename !== 'string') return <FileOutlined className="comment-rich-editor-file-icon" />;
  const lower = filename.toLowerCase();
  if (lower.endsWith('.pdf')) return <FilePdfOutlined className="comment-rich-editor-file-icon comment-rich-editor-file-icon-pdf" />;
  if (/\.(xlsx|xls)$/.test(lower)) return <FileExcelOutlined className="comment-rich-editor-file-icon comment-rich-editor-file-icon-excel" />;
  if (/\.(docx|doc)$/.test(lower)) return <FileWordOutlined className="comment-rich-editor-file-icon comment-rich-editor-file-icon-word" />;
  if (/\.(pptx?|ppt)$/.test(lower)) return <FilePptOutlined className="comment-rich-editor-file-icon comment-rich-editor-file-icon-ppt" />;
  if (/\.(jpg|jpeg|png|gif|bmp|webp|svg)$/.test(lower)) return <FileImageOutlined className="comment-rich-editor-file-icon comment-rich-editor-file-icon-image" />;
  if (/\.(zip|rar|7z|tar|gz)$/.test(lower)) return <FileZipOutlined className="comment-rich-editor-file-icon comment-rich-editor-file-icon-zip" />;
  if (/\.(txt|md|json|xml|csv|log)$/.test(lower)) return <FileTextOutlined className="comment-rich-editor-file-icon comment-rich-editor-file-icon-text" />;
  return <FileOutlined className="comment-rich-editor-file-icon" />;
}

/**
 * 评论用简易富文本编辑器（基于 Quill）
 * 支持：1. 复制粘贴贴图  2. 上传图片  3. 上传附件（附件挂在回复框外，与 renderActions 同一行展示）
 * @param {Object} props
 * @param {string} [props.value=''] - 当前内容（HTML）
 * @param {(html: string) => void} [props.onChange] - 内容变化回调
 * @param {Array<{ id: string, filename: string, href: string }>} [props.attachments] - 受控附件列表（与 onAttachmentsChange 一起使用）
 * @param {(list: Array<{ id: string, filename: string, href: string }>) => void} [props.onAttachmentsChange] - 附件列表变化回调
 * @param {string} [props.placeholder] - 占位提示
 * @param {string} [props.className] - 外层 class
 * @param {React.CSSProperties} [props.style] - 外层样式
 * @param {React.ReactNode} [props.renderActions] - 底部右侧操作区（如「关闭工单」「答复」按钮），与附件区同一行
 */
const CommentRichEditor = ({
  value = '',
  onChange,
  attachments: controlledAttachments,
  onAttachmentsChange,
  placeholder = '输入回复内容…',
  className = '',
  style = {},
  renderActions,
}) => {
  const quillRef = useRef(null);
  const wrapperRef = useRef(null);
  const fileInputRef = useRef(null);
  const [internalAttachments, setInternalAttachments] = useState([]);
  const isControlled = controlledAttachments != null && typeof onAttachmentsChange === 'function';
  const attachments = isControlled ? controlledAttachments : internalAttachments;
  const setAttachments = (next) => {
    if (isControlled) onAttachmentsChange(next);
    else setInternalAttachments(next);
  };
  const idRef = useRef(0);
  const nextId = () => `att-${++idRef.current}`;

  const modules = useMemo(
    () => ({
      toolbar: {
        container: [
          ['bold', 'italic'],
          [{ list: 'bullet' }, { list: 'ordered' }],
          ['link', 'image'],
        ],
        handlers: {
          /** 上传图片：本地选图转 base64 插入 */
          image: function imageHandler() {
            const quill = quillRef.current?.getEditor?.();
            if (!quill) return;
            const input = document.createElement('input');
            input.setAttribute('type', 'file');
            input.setAttribute('accept', 'image/*');
            input.click();
            input.onchange = () => {
              const file = input.files?.[0];
              if (!file) return;
              const reader = new FileReader();
              reader.onload = () => {
                const range = quill.getSelection(true) || { index: quill.getLength() };
                quill.insertEmbed(range.index, 'image', reader.result);
              };
              reader.readAsDataURL(file);
            };
          },
        },
      },
    }),
    []
  );

  const attachmentsRef = useRef(attachments);
  attachmentsRef.current = attachments;

  /** 将文件列表加入附件列表（挂在回复框外，不写入编辑器） */
  const addAttachments = React.useCallback(
    (files) => {
      if (!files?.length) return;
      const newItems = [];
      let done = 0;
      const total = files.length;
      const tryCommit = () => {
        done += 1;
        if (done === total) {
          const prev = attachmentsRef.current;
          if (isControlled) onAttachmentsChange([...prev, ...newItems]);
          else setInternalAttachments([...prev, ...newItems]);
        }
      };
      Array.from(files).forEach((file) => {
        const reader = new FileReader();
        reader.onload = () => {
          newItems.push({
            id: nextId(),
            filename: file.name,
            href: reader.result,
          });
          tryCommit();
        };
        reader.readAsDataURL(file);
      });
    },
    [isControlled, onAttachmentsChange]
  );

  /** 移除单个附件 */
  const removeAttachment = React.useCallback(
    (id) => {
      setAttachments((prev) => prev.filter((a) => a.id !== id));
    },
    [setAttachments]
  );

  /** 点击附件芯片：下载 */
  const handleAttachmentChipClick = React.useCallback((e, att) => {
    const href = att.href;
    if (!href) return;
    e.preventDefault();
    e.stopPropagation();
    try {
      const a = document.createElement('a');
      a.download = att.filename || '下载';
      a.rel = 'noopener noreferrer';
      if (href.startsWith('data:')) {
        const m = href.match(/^data:([^;]+);base64,(.+)$/);
        if (m) {
          const type = m[1];
          const b64 = m[2];
          const bin = atob(b64);
          const arr = new Uint8Array(bin.length);
          for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
          const blob = new Blob([arr], { type });
          a.href = URL.createObjectURL(blob);
          a.click();
          URL.revokeObjectURL(a.href);
          return;
        }
      }
      a.href = href;
      a.click();
    } catch (err) {
      const w = window.open(href, '_blank', 'noopener');
      if (w) w.document.title = att.filename || '附件';
    }
  }, []);

  const formats = ['bold', 'italic', 'list', 'bullet', 'link', 'image'];

  const handleChange = (content, delta, source, editor) => {
    const html = editor?.root?.innerHTML ?? content ?? '';
    if (typeof onChange === 'function') onChange(html);
  };

  /** 粘贴图片：在编辑器根上监听 paste，任意图片类型均转 base64 插入（避免依赖 uploader 模块配置） */
  useEffect(() => {
    const quill = quillRef.current?.getEditor?.();
    if (!quill?.root) return;
    const onPaste = (e) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      const item = Array.from(items).find((i) => i.type.indexOf('image') !== -1);
      if (!item) return;
      e.preventDefault();
      e.stopPropagation();
      const file = item.getAsFile();
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        const range = quill.getSelection(true) || { index: quill.getLength() };
        quill.insertEmbed(range.index, 'image', reader.result);
      };
      reader.readAsDataURL(file);
    };
    quill.root.addEventListener('paste', onPaste, true);
    return () => quill.root.removeEventListener('paste', onPaste, true);
  }, []);

  /** 点击附件时触发下载（事件委托，捕获阶段优先于 Quill 处理） */
  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;
    const onContainerClick = (e) => {
      const target = e.target?.nodeType === Node.TEXT_NODE ? e.target.parentElement : e.target;
      const el = target?.closest?.('.comment-attachment');
      if (!el) return;
      const filename = el.getAttribute('data-filename') || '下载';
      const href = el.getAttribute('data-href');
      if (!href) return;
      e.preventDefault();
      e.stopPropagation();
      try {
        const a = document.createElement('a');
        a.download = filename;
        a.rel = 'noopener noreferrer';
        if (href.startsWith('data:')) {
          const m = href.match(/^data:([^;]+);base64,(.+)$/);
          if (m) {
            const type = m[1];
            const b64 = m[2];
            const bin = atob(b64);
            const arr = new Uint8Array(bin.length);
            for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
            const blob = new Blob([arr], { type });
            a.href = URL.createObjectURL(blob);
            a.click();
            URL.revokeObjectURL(a.href);
            return;
          }
        }
        a.href = href;
        a.click();
      } catch (err) {
        const w = window.open(href, '_blank', 'noopener');
        if (w) w.document.title = filename;
      }
    };
    wrapper.addEventListener('click', onContainerClick, true);
    return () => wrapper.removeEventListener('click', onContainerClick, true);
  }, []);

  /** 下方附件区：点击打开选择、粘贴、拖放添加文件 */
  const onAttachmentZoneClick = () => fileInputRef.current?.click();
  const onAttachmentZonePaste = (e) => {
    const files = e.clipboardData?.files;
    if (files?.length) {
      e.preventDefault();
      addAttachments(files);
    }
  };
  const onAttachmentZoneDrop = (e) => {
    const files = e.dataTransfer?.files;
    if (files?.length) {
      e.preventDefault();
      e.stopPropagation();
      addAttachments(files);
    }
  };
  const onAttachmentZoneDragOver = (e) => {
    if (e.dataTransfer?.types?.includes('Files')) e.preventDefault();
  };
  const onFileInputChange = (e) => {
    const files = e.target.files;
    if (files?.length) addAttachments(files);
    e.target.value = '';
  };

  return (
    <div ref={wrapperRef} className={`comment-rich-editor ${className}`} style={style}>
      <div className="comment-rich-editor-input-wrap">
        <ReactQuill
          ref={quillRef}
          theme="snow"
          value={value}
          onChange={handleChange}
          modules={modules}
          formats={formats}
          placeholder={placeholder}
          className="comment-rich-editor-quill"
        />
      </div>
      <div className="comment-rich-editor-footer">
        <div className="comment-rich-editor-footer-left">
          <div
            className="comment-rich-editor-attachment-zone"
            role="button"
            tabIndex={0}
            onClick={onAttachmentZoneClick}
            onPaste={onAttachmentZonePaste}
            onDrop={onAttachmentZoneDrop}
            onDragOver={onAttachmentZoneDragOver}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onAttachmentZoneClick(); }}
            aria-label="添加附件"
          >
            <span className="comment-rich-editor-attachment-zone-icon" aria-hidden>📎</span>
            <span className="comment-rich-editor-attachment-zone-text">点击添加文件</span>
          </div>
          {attachments.length > 0 && (
            <ul className="comment-rich-editor-attachment-list" aria-label="已选附件">
              {attachments.map((att) => (
                <li key={att.id} className="comment-rich-editor-attachment-chip">
                  <span
                    role="button"
                    tabIndex={0}
                    className="comment-rich-editor-attachment-chip-name"
                    onClick={(e) => handleAttachmentChipClick(e, att)}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleAttachmentChipClick(e, att); }}
                    title={`下载: ${att.filename}`}
                  >
                    <span className="comment-rich-editor-attachment-chip-icon">{getFileTypeIcon(att.filename)}</span>
                    {att.filename}
                  </span>
                  <button
                    type="button"
                    className="comment-rich-editor-attachment-chip-remove"
                    onClick={(e) => { e.stopPropagation(); removeAttachment(att.id); }}
                    aria-label={`移除 ${att.filename}`}
                  >
                    ×
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
        {renderActions != null && <div className="comment-rich-editor-actions">{renderActions}</div>}
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept="*/*"
        multiple
        onChange={onFileInputChange}
        className="comment-rich-editor-file-input"
        aria-hidden
      />
    </div>
  );
};

export default CommentRichEditor;
