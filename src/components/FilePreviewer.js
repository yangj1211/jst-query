import React, { useState, useEffect } from 'react';
import { Button, Typography, Space, Tag, Spin, InputNumber } from 'antd';
import { 
  CloseOutlined, 
  FileTextOutlined, 
  FilePdfOutlined,
  FileExcelOutlined,
  FileWordOutlined,
  FileImageOutlined,
  LeftOutlined, 
  RightOutlined,
  ZoomInOutlined,
  ZoomOutOutlined,
  RotateLeftOutlined,
  RotateRightOutlined
} from '@ant-design/icons';
import './FilePreviewer.css';

const { Title, Text } = Typography;

/**
 * 文件预览器组件
 * @param {Object} props - 组件属性
 * @param {boolean} props.visible - 是否显示预览器
 * @param {Object} props.file - 文件信息 { name, type, path, content? }
 * @param {Function} props.onClose - 关闭回调
 */
const FilePreviewer = ({ visible, file, onClose }) => {
  // PDF 翻页状态
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  // 缩放状态
  const [zoomLevel, setZoomLevel] = useState(100);
  // 旋转角度
  const [rotation, setRotation] = useState(0);

  // 当文件改变时，重置页码和缩放
  useEffect(() => {
    if (file) {
      setCurrentPage(1);
      setZoomLevel(100);
      setRotation(0);
      // 这里可以根据实际文件获取总页数，暂时设为1
      // 如果文件有 totalPages 属性，使用它
      setTotalPages(file.totalPages || 1);
    }
  }, [file]);

  if (!visible || !file) {
    return null;
  }

  /**
   * 上一页
   */
  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  /**
   * 下一页
   */
  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  /**
   * 跳转到指定页
   */
  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  /**
   * 缩放控制
   */
  const handleZoomIn = () => {
    if (zoomLevel < 200) {
      setZoomLevel(Math.min(zoomLevel + 10, 200));
    }
  };

  const handleZoomOut = () => {
    if (zoomLevel > 50) {
      setZoomLevel(Math.max(zoomLevel - 10, 50));
    }
  };

  /**
   * 旋转控制
   */
  const handleRotateLeft = () => {
    setRotation((rotation - 90) % 360);
  };

  const handleRotateRight = () => {
    setRotation((rotation + 90) % 360);
  };

  /**
   * 根据文件类型渲染预览内容
   */
  const renderPreviewContent = () => {
    if (!file) {
      return (
        <div className="file-preview-empty">
          <Spin size="large" />
          <Text type="secondary">加载中...</Text>
        </div>
      );
    }

    const { name, type, path, content } = file;

    // 根据文件类型显示不同的预览内容
    if (type === 'excel' || name?.endsWith('.xlsx') || name?.endsWith('.xls')) {
      return (
        <div className="file-preview-content">
          <div className="file-preview-header">
            <Space>
              <FileTextOutlined style={{ fontSize: 24, color: '#1890ff' }} />
              <div>
                <Title level={4} style={{ margin: 0 }}>{name}</Title>
                <Text type="secondary" style={{ fontSize: 12 }}>{path}</Text>
              </div>
            </Space>
            <Tag color="green">Excel 文件</Tag>
          </div>
          <div className="file-preview-body">
            {content ? (
              <div className="excel-preview">
                {/* 这里可以集成 Excel 预览库，如 x-spreadsheet 等 */}
                <Text type="secondary">文件预览功能开发中...</Text>
                <div className="excel-placeholder">
                  <FileTextOutlined style={{ fontSize: 64, color: '#d9d9d9' }} />
                  <Text type="secondary">Excel 表格预览</Text>
                </div>
              </div>
            ) : (
              <div className="file-preview-placeholder">
                <FileTextOutlined style={{ fontSize: 64, color: '#d9d9d9' }} />
                <Text type="secondary">文件内容加载中...</Text>
              </div>
            )}
          </div>
        </div>
      );
    }

    if (type === 'pdf' || name?.endsWith('.pdf')) {
      return (
        <div className="file-preview-content">
          <div className="file-preview-body">
            {content ? (
              <div className="pdf-preview-container">
                <div 
                  className="pdf-preview"
                  style={{
                    transform: `rotate(${rotation}deg) scale(${zoomLevel / 100})`,
                    transformOrigin: 'center center',
                    transition: 'transform 0.3s ease'
                  }}
                >
                  {/* 这里可以集成 PDF 预览库，如 react-pdf 等 */}
                  <iframe
                    src={`${content}#page=${currentPage}&zoom=${zoomLevel}`}
                    style={{ width: '100%', height: '100%', border: 'none' }}
                    title="PDF Preview"
                  />
                </div>
              </div>
            ) : (
              <div className="file-preview-placeholder">
                <FileTextOutlined style={{ fontSize: 64, color: '#d9d9d9' }} />
                <Text type="secondary">PDF 预览加载中...</Text>
                <Text type="secondary" style={{ fontSize: 12, marginTop: 8 }}>
                  文件路径: {path}
                </Text>
              </div>
            )}
          </div>
        </div>
      );
    }

    // 默认文本文件预览
    return (
      <div className="file-preview-content">
        <div className="file-preview-header">
          <Space>
            <FileTextOutlined style={{ fontSize: 24, color: '#1890ff' }} />
            <div>
              <Title level={4} style={{ margin: 0 }}>{name}</Title>
              <Text type="secondary" style={{ fontSize: 12 }}>{path}</Text>
            </div>
          </Space>
          <Tag>文件</Tag>
        </div>
        <div className="file-preview-body">
          {content ? (
            <div className="text-preview">
              <pre className="text-content">{content}</pre>
            </div>
          ) : (
            <div className="file-preview-placeholder">
              <FileTextOutlined style={{ fontSize: 64, color: '#d9d9d9' }} />
              <Text type="secondary">文件内容加载中...</Text>
            </div>
          )}
        </div>
      </div>
    );
  };

  const { name, type } = file;
  const isPdf = type === 'pdf' || name?.endsWith('.pdf');

  /**
   * 根据文件类型获取图标
   */
  const getFileIcon = () => {
    const fileName = name || '';
    const fileType = type || '';
    
    if (fileType === 'pdf' || fileName.endsWith('.pdf')) {
      return <FilePdfOutlined style={{ fontSize: 20, color: '#ff4d4f' }} />;
    }
    if (fileType === 'excel' || fileName.endsWith('.xlsx') || fileName.endsWith('.xls')) {
      return <FileExcelOutlined style={{ fontSize: 20, color: '#52c41a' }} />;
    }
    if (fileType === 'word' || fileName.endsWith('.docx') || fileName.endsWith('.doc')) {
      return <FileWordOutlined style={{ fontSize: 20, color: '#1890ff' }} />;
    }
    if (fileType === 'image' || fileName.match(/\.(jpg|jpeg|png|gif|bmp|webp)$/i)) {
      return <FileImageOutlined style={{ fontSize: 20, color: '#722ed1' }} />;
    }
    // 默认文件图标
    return <FileTextOutlined style={{ fontSize: 20, color: '#1890ff' }} />;
  };

  return (
    <div className="file-previewer-panel">
      {/* 标题栏：显示文件名 */}
      <div className="file-previewer-title-bar">
        <Space className="file-title-content">
          {getFileIcon()}
          <span className="file-name">{name}</span>
        </Space>
        <Button type="text" size="small" icon={<CloseOutlined />} onClick={onClose} />
      </div>
      
      {/* 工具栏：翻页、缩放、旋转 */}
      {isPdf && (
        <div className="file-previewer-toolbar">
          {/* 翻页控制 */}
          <div className="toolbar-section">
            <Button 
              type="text"
              icon={<LeftOutlined />} 
              onClick={handlePrevPage}
              disabled={currentPage <= 1}
              size="small"
            />
            <Space size={4}>
              <InputNumber
                min={1}
                max={totalPages}
                value={currentPage}
                onChange={handlePageChange}
                size="small"
                style={{ width: 60 }}
                controls={false}
              />
              <Text type="secondary" style={{ fontSize: 12 }}>/</Text>
              <Text type="secondary" style={{ fontSize: 12 }}>{totalPages}</Text>
            </Space>
            <Button 
              type="text"
              icon={<RightOutlined />} 
              onClick={handleNextPage}
              disabled={currentPage >= totalPages}
              size="small"
            />
          </div>

          {/* 缩放控制 */}
          <div className="toolbar-section">
            <Button 
              type="text"
              icon={<ZoomOutOutlined />} 
              onClick={handleZoomOut}
              disabled={zoomLevel <= 50}
              size="small"
            />
            <Text style={{ fontSize: 12, margin: '0 8px', minWidth: 45, textAlign: 'center' }}>
              {zoomLevel}%
            </Text>
            <Button 
              type="text"
              icon={<ZoomInOutlined />} 
              onClick={handleZoomIn}
              disabled={zoomLevel >= 200}
              size="small"
            />
          </div>

          {/* 旋转控制 */}
          <div className="toolbar-section">
            <Button 
              type="text"
              icon={<RotateLeftOutlined />} 
              onClick={handleRotateLeft}
              size="small"
            />
            <Button 
              type="text"
              icon={<RotateRightOutlined />} 
              onClick={handleRotateRight}
              size="small"
            />
          </div>
        </div>
      )}
      
      {/* 预览内容 */}
      <div className="file-previewer-content">
        {renderPreviewContent()}
      </div>
    </div>
  );
};

export default FilePreviewer;

