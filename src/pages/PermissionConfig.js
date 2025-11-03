import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './PageStyle.css';

const PermissionConfig = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // 自动重定向到角色权限页面
    navigate('/permission/role-permission', { replace: true });
  }, [navigate]);

  return (
    <div className="page-container">
      <div className="page-header">
        <h2>权限配置</h2>
      </div>
      <div className="page-content" style={{ padding: '24px', textAlign: 'center' }}>
        正在跳转到角色权限页面...
      </div>
    </div>
  );
};

export default PermissionConfig;

