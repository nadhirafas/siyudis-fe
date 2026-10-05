import React from 'react'

import { Routes, Route } from 'react-router-dom'

import LoginPage from '../pages/auth/LoginPage'
import AuthCallback from '../pages/auth/AuthCallback'

import StudentDashboard from '../pages/dashboard/StudentDashboard'
import ProfilePage from '../pages/profile/ProfilePage'

import FormPengajuanPage from '../pages/yudisium/FormPengajuanPage'

import PanduanDokumenPage from '../pages/panduan/PanduanDokumenPage'

import AdminDashboard from '../pages/admin/AdminDashboard'
import AdminPengajuanYudisium from '../pages/admin/AdminPengajuanYudisium'
import BeritaAcara from '../pages/admin/BeritaAcara'
import AdminPanduan from '../pages/admin/AdminPanduan'
function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />
      <Route path="/auth/callback" element={<AuthCallback />} />

      <Route path="/dashboard" element={<StudentDashboard />} />
      <Route path="/profile" element={<ProfilePage />} />
      <Route path="/pengajuan-yudisium" element={<FormPengajuanPage />} />
      <Route path="/panduan" element={<PanduanDokumenPage />} />

      <Route path="/admin/dashboard" element={<AdminDashboard />} />
      <Route path="/admin/pengajuan-yudisium" element={<AdminPengajuanYudisium />}/>
      <Route path="/admin/berita-acara" element={<BeritaAcara />} />
      <Route path="/admin/panduan" element={<AdminPanduan />} />
    </Routes>
  )
}

export default AppRoutes