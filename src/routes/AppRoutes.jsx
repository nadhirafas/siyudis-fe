import { Routes, Route } from 'react-router'

import LoginPage from '../pages/auth/LoginPage'
import StudentDashboard from '../pages/dashboard/StudentDashboard'
import ProfilePage from '../pages/dashboard/ProfilePage'
import FormPengajuanPage from '../pages/yudisium/FormPengajuanPage'
import { DocumentPreviewPage } from '../pages/yudisium/FormPengajuanPage'

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />
      <Route path="/dashboard" element={<StudentDashboard />} />
      <Route path="/profile" element={<ProfilePage />} />
      <Route
        path="/pengajuan-yudisium"
        element={<FormPengajuanPage />}
      />

      <Route
        path="/dokumen/:id"
        element={<DocumentPreviewPage />}
      />
    </Routes>
  )
}

export default AppRoutes