// src/routes/AppRoutes.jsx
import React from 'react'
import { Routes, Route } from 'react-router-dom'

import LoginPage from '../pages/auth/LoginPage'
import StudentDashboard from '../pages/dashboard/StudentDashboard'
import ProfilePage from '../pages/dashboard/ProfilePage'
import FormPengajuanPage from '../pages/yudisium/FormPengajuanPage'
import PanduanDokumenPage from '../pages/panduan/PanduanDokumenPage'

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />
      <Route path="/dashboard" element={<StudentDashboard />} />
      <Route path="/profile" element={<ProfilePage />} />

      <Route path="/pengajuan-yudisium" element={<FormPengajuanPage />} />
      <Route path="/panduan" element={<PanduanDokumenPage />} />

    </Routes>
  )
}

export default AppRoutes