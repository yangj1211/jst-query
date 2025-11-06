import React, { createContext, useState, useContext } from 'react';

/**
 * 文件预览器 Context
 * 用于管理文件预览器的显示状态和文件信息，以及侧边栏折叠状态
 */
const FilePreviewContext = createContext();

/**
 * 文件预览器 Provider 组件
 * @param {Object} props - 组件属性
 * @param {React.ReactNode} props.children - 子组件
 * @param {Function} props.onSidebarCollapse - 侧边栏折叠回调函数
 */
export const FilePreviewProvider = ({ children, onSidebarCollapse }) => {
  const [previewFile, setPreviewFile] = useState(null); // { name, type, path, content? }
  const [isPreviewVisible, setIsPreviewVisible] = useState(false);

  /**
   * 打开文件预览器
   * @param {Object} file - 文件信息 { name, type, path, content? }
   */
  const openPreview = (file) => {
    setPreviewFile(file);
    setIsPreviewVisible(true);
    // 自动收起侧边栏
    if (onSidebarCollapse) {
      onSidebarCollapse(true);
    }
  };

  /**
   * 关闭文件预览器
   */
  const closePreview = () => {
    setIsPreviewVisible(false);
    setPreviewFile(null);
  };

  const value = {
    previewFile,
    isPreviewVisible,
    openPreview,
    closePreview,
  };

  return (
    <FilePreviewContext.Provider value={value}>
      {children}
    </FilePreviewContext.Provider>
  );
};

/**
 * 使用文件预览器 Context 的 Hook
 * @returns {Object} 文件预览器状态和方法
 */
export const useFilePreview = () => {
  const context = useContext(FilePreviewContext);
  if (!context) {
    throw new Error('useFilePreview must be used within a FilePreviewProvider');
  }
  return context;
};

