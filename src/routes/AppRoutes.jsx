import { Routes, Route } from 'react-router'

import LoginPage from '../pages/auth/LoginPage'
import StudentDashboard from '../pages/dashboard/StudentDashboard'
import ProfilePage from '../pages/dashboard/ProfilePage'

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />
      <Route path="/dashboard" element={<StudentDashboard />} />
      <Route path="/profile" element={<ProfilePage />} />
    </Routes>
  )
}

export default AppRoutes