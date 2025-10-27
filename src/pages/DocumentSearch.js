import React, { useState } from 'react';
import './DocumentSearch.css';
import SalesDocumentSearch from './SalesDocumentSearch';

/**
 * 单据检索组件
 */
const DocumentSearch = () => {
  const [activeDocumentTab, setActiveDocumentTab] = useState('sales');

  return (
    <div className="document-search-container">
      <div className="document-tabs">
        <button
          className={`document-tab-button ${activeDocumentTab === 'sales' ? 'active' : ''}`}
          onClick={() => setActiveDocumentTab('sales')}
        >
          销售单据
        </button>
        <button
          className={`document-tab-button ${activeDocumentTab === 'purchase' ? 'active' : ''}`}
          onClick={() => setActiveDocumentTab('purchase')}
        >
          采购单据
        </button>
        <button
          className={`document-tab-button ${activeDocumentTab === 'finance' ? 'active' : ''}`}
          onClick={() => setActiveDocumentTab('finance')}
        >
          财务单据
        </button>
      </div>
      <div className="document-content">
        {activeDocumentTab === 'sales' && (
          <SalesDocumentSearch />
        )}
        {activeDocumentTab === 'purchase' && (
          <div className="empty-state">
            <div className="empty-icon">📦</div>
            <div>采购单据检索功能待实现</div>
          </div>
        )}
        {activeDocumentTab === 'finance' && (
          <div className="empty-state">
            <div className="empty-icon">💰</div>
            <div>财务单据检索功能待实现</div>
          </div>
        )}
      </div>
    </div>
  );
}

export default DocumentSearch;
