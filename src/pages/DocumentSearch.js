import React from 'react';
import './DocumentSearch.css';
import SalesDocumentSearch from './SalesDocumentSearch';

/**
 * 单据检索组件（去掉顶部 Tab，只保留销售单据检索）
 */
const DocumentSearch = () => {
  return (
    <div className="document-search-container">
      <div className="document-content">
        <SalesDocumentSearch />
      </div>
    </div>
  );
};

export default DocumentSearch;
