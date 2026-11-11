import { Routes, Route } from 'react-router-dom'

import ProtectedRoute from '../components/ProtectedRoute'

import LoginPage from '../pages/auth/LoginPage'
import AuthCallback from '../pages/auth/AuthCallback'

import StudentDashboard from '../pages/dashboard/StudentDashboard'
import ProfilePage from '../pages/profile/ProfilePage'

import FormPengajuanPage from '../pages/yudisium/FormPengajuanPage'

import PanduanDokumenPage from '../pages/panduan/PanduanDokumenPage'
import TrackingPengajuanPage from '../pages/yudisium/TrackingPengajuanPage'
import FormEditPengajuanPage from '../pages/yudisium/FormEditPengajuanPage'
import BeritaAcaraPage from '../pages/yudisium/BeritaAcaraPage'


import AdminDashboard from '../pages/admin/AdminDashboard'
import AdminPengajuanYudisium from '../pages/admin/AdminPengajuanYudisium'
import BeritaAcara from '../pages/admin/BeritaAcara'
import AdminPanduan from '../pages/admin/AdminPanduan'

import ManagementRole from '../pages/super-admin/ManagementRole'
import FormManagement from '../pages/super-admin/FormManagement'
import TemplateBeritaAcara from '../pages/super-admin/TemplateBeritaAcara'

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />
      <Route path="/auth/callback" element={<AuthCallback />} />

      <Route path="/dashboard" element={<StudentDashboard />} />
      <Route path="/profile" element={<ProfilePage />} />
      <Route path="/pengajuan-yudisium" element={<FormPengajuanPage />} />
      <Route path="/panduan" element={<PanduanDokumenPage />} />
      <Route path="/pelacakan-yudisium" element={<TrackingPengajuanPage />} />
      <Route path="/pengajuan-yudisium/edit" element={<FormEditPengajuanPage />} />
      <Route path="/berita-acara" element={<BeritaAcaraPage />} />

      <Route element={<ProtectedRoute allowedRole="staf" />}>
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/pengajuan-yudisium" element={<AdminPengajuanYudisium />} />
        <Route path="/admin/berita-acara" element={<BeritaAcara />} />
        <Route path="/admin/panduan" element={<AdminPanduan />} />
      </Route>

      <Route element={<ProtectedRoute allowedRole="super_admin" />}>
        <Route path="/super-admin/dashboard" element={<AdminDashboard />} />
        <Route path="/super-admin/pengajuan-yudisium" element={<AdminPengajuanYudisium />} />
        <Route path="/super-admin/berita-acara" element={<BeritaAcara />} />
        <Route path="/super-admin/panduan" element={<AdminPanduan />} />
        <Route path="/super-admin/management-role" element={<ManagementRole />} />
        <Route path="/super-admin/form-management" element={<FormManagement />} />
        <Route path="/super-admin/template-berita-acara" element={<TemplateBeritaAcara />} />
      </Route>
    </Routes>
  )
}

export default AppRoutes