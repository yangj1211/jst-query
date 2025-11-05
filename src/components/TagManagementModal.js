import React, { useState, useEffect } from 'react';
import './TagManagementModal.css';

const TagManagementModal = ({ visible, onClose, allTags, onTagsChange, checkTagInUse }) => {
  const [tags, setTags] = useState([]);
  const [editingTag, setEditingTag] = useState(null);
  const [editingName, setEditingName] = useState('');
  const [newTagName, setNewTagName] = useState('');
  const [oldTagsBeforeEdit, setOldTagsBeforeEdit] = useState([]);

  useEffect(() => {
    if (visible) {
      setTags([...allTags]);
      setEditingTag(null);
      setEditingName('');
      setNewTagName('');
      setOldTagsBeforeEdit([...allTags]);
    }
  }, [visible, allTags]);

  // 添加新标签
  const handleAddTag = () => {
    const trimmedName = newTagName.trim();
    if (!trimmedName) {
      alert('标签名称不能为空');
      return;
    }
    if (tags.includes(trimmedName)) {
      alert('标签已存在');
      return;
    }
    const newTags = [...tags, trimmedName];
    setTags(newTags);
    setNewTagName('');
    onTagsChange(newTags);
  };

  // 开始编辑标签
  const handleStartEdit = (tag) => {
    setEditingTag(tag);
    setEditingName(tag);
  };

  // 保存编辑
  const handleSaveEdit = () => {
    const trimmedName = editingName.trim();
    if (!trimmedName) {
      alert('标签名称不能为空');
      return;
    }
    if (trimmedName !== editingTag && tags.includes(trimmedName)) {
      alert('标签名称已存在');
      return;
    }
    const newTags = tags.map(t => t === editingTag ? trimmedName : t);
    setTags(newTags);
    setEditingTag(null);
    setEditingName('');
    
    // 通知父组件标签变更，并传递重命名信息
    onTagsChange(newTags, editingTag, trimmedName);
  };

  // 取消编辑
  const handleCancelEdit = () => {
    setEditingTag(null);
    setEditingName('');
  };

  // 删除标签
  const handleDeleteTag = (tag) => {
    // 检查标签是否被使用
    if (checkTagInUse && checkTagInUse(tag)) {
      alert(`无法删除标签"${tag}"，因为有数据项正在使用该标签。请先移除所有使用该标签的数据项的标签，然后再删除。`);
      return;
    }
    
    if (window.confirm(`确定要删除标签"${tag}"吗？`)) {
      const newTags = tags.filter(t => t !== tag);
      setTags(newTags);
      onTagsChange(newTags);
    }
  };

  // 按Enter键添加标签
  const handleNewTagKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleAddTag();
    }
  };

  // 按Enter键保存编辑
  const handleEditKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSaveEdit();
    } else if (e.key === 'Escape') {
      handleCancelEdit();
    }
  };

  if (!visible) return null;

  return (
    <div className="tag-management-modal-overlay" onClick={onClose}>
      <div className="tag-management-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="tag-management-modal-header">
          <h3>标签管理</h3>
          <button className="tag-management-modal-close-btn" onClick={onClose}>
            ✕
          </button>
        </div>
        <div className="tag-management-modal-body">
          {/* 添加新标签 */}
          <div className="tag-management-add-section">
            <input
              type="text"
              className="tag-management-input"
              placeholder="输入新标签名称"
              value={newTagName}
              onChange={(e) => setNewTagName(e.target.value)}
              onKeyPress={handleNewTagKeyPress}
            />
            <button className="tag-management-add-btn" onClick={handleAddTag}>
              添加标签
            </button>
          </div>

          {/* 标签列表 */}
          <div className="tag-management-list">
            {tags.length === 0 ? (
              <div className="tag-management-empty">暂无标签</div>
            ) : (
              tags.map((tag) => (
                <div key={tag} className="tag-management-item">
                  {editingTag === tag ? (
                    <div className="tag-management-edit-form">
                      <input
                        type="text"
                        className="tag-management-input"
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        onKeyDown={handleEditKeyPress}
                        autoFocus
                      />
                      <button className="tag-management-save-btn" onClick={handleSaveEdit}>
                        保存
                      </button>
                      <button className="tag-management-cancel-btn" onClick={handleCancelEdit}>
                        取消
                      </button>
                    </div>
                  ) : (
                    <>
                      <span className="tag-management-tag-badge">{tag}</span>
                      <div className="tag-management-actions">
                        <button
                          className="tag-management-edit-btn"
                          onClick={() => handleStartEdit(tag)}
                          title="编辑"
                        >
                          <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
                            <path d="M11.013 1.427a1.75 1.75 0 0 1 2.474 0l1.086 1.086a1.75 1.75 0 0 1 0 2.474l-8.61 8.61c-.21.21-.47.364-.756.445l-3.251.93a.75.75 0 0 1-.927-.928l.929-3.25c.08-.286.235-.547.445-.758l8.61-8.61Zm1.414 1.06a.25.25 0 0 0-.354 0L10.811 3.75l1.439 1.44 1.263-1.263a.25.25 0 0 0 0-.354L11.427 2.487ZM11.19 6.25L9.75 4.81l-6.286 6.287a.25.25 0 0 0-.064.108l-.558 1.953 1.953-.558a.25.25 0 0 0 .108-.064l6.286-6.286Z"/>
                          </svg>
                        </button>
                        <button
                          className={`tag-management-delete-btn ${checkTagInUse && checkTagInUse(tag) ? 'disabled' : ''}`}
                          onClick={() => handleDeleteTag(tag)}
                          title={checkTagInUse && checkTagInUse(tag) ? '该标签正在使用中，无法删除' : '删除'}
                          disabled={checkTagInUse && checkTagInUse(tag)}
                        >
                          <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
                            <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"/>
                            <path fillRule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4L4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"/>
                          </svg>
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
        <div className="tag-management-modal-footer">
          <button className="tag-management-close-btn" onClick={onClose}>
            关闭
          </button>
        </div>
      </div>
    </div>
  );
};

export default TagManagementModal;

