import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './components/MainLayout';
import QuestionAssistant from './pages/QuestionAssistant';
import DataCenter from './pages/DataCenter';
import PermissionConfig from './pages/PermissionConfig';
import UserManagement from './pages/UserManagement';
import RolePermission from './pages/RolePermission';
import DocumentSearch from './pages/DocumentSearch';
import SalesDocumentSearch from './pages/SalesDocumentSearch';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Navigate to="/question" />} />
          <Route path="question" element={<QuestionAssistant />} />
          <Route path="document" element={<DocumentSearch />} />
          <Route path="data" element={<DataCenter />} />
          <Route path="permission" element={<PermissionConfig />} />
          <Route path="permission/user-management" element={<UserManagement />} />
          <Route path="permission/role-permission" element={<RolePermission />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;

