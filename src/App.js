import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './components/MainLayout';
import QuestionAssistant from './pages/QuestionAssistant';
import DataCenter from './pages/DataCenter';
import PermissionConfig from './pages/PermissionConfig';
import UserManagement from './pages/UserManagement';
import RolePermission from './pages/RolePermission';
import DataPermissionConfig from './pages/DataPermissionConfig';
import CreateRole from './pages/CreateRole';
import DocumentSearch from './pages/DocumentSearch';
import DataImport from './pages/DataImport';
import BackupFiles from './pages/BackupFiles';
import Dashboard from './pages/Dashboard';
import WorkOrderMySubmitted from './pages/WorkOrderMySubmitted';
import WorkOrderMyHandled from './pages/WorkOrderMyHandled';
import WorkOrderConfig from './pages/WorkOrderConfig';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Navigate to="/question" />} />
          <Route path="question" element={<QuestionAssistant />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="document" element={<DocumentSearch />} />
          <Route path="data/view" element={<DataCenter />} />
          <Route path="data/import" element={<DataImport />} />
          <Route path="data/backup" element={<BackupFiles />} />
          <Route path="work-order/submitted" element={<WorkOrderMySubmitted />} />
          <Route path="work-order/handled" element={<WorkOrderMyHandled />} />
          <Route path="work-order/config" element={<WorkOrderConfig />} />
          <Route path="permission" element={<PermissionConfig />} />
          <Route path="permission/user-management" element={<UserManagement />} />
          <Route path="permission/role-permission" element={<RolePermission />} />
          <Route path="permission/create-role" element={<CreateRole />} />
          <Route path="permission/data-permission" element={<DataPermissionConfig />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;

