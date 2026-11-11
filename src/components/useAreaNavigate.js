import { useCallback } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

// Awalan area saat ini: Super Admin bekerja di /super-admin/*, Staf Akademik di /admin/*
export function useAreaBase() {
  const { pathname } = useLocation()
  return pathname.startsWith('/super-admin') ? '/super-admin' : '/admin'
}

// navigate() yang otomatis memetakan '/admin/xxx' ke area yang sedang aktif
export function useAreaNavigate() {
  const navigate = useNavigate()
  const base = useAreaBase()
  return useCallback(
    (to, options) => {
      if (typeof to === 'string' && to.startsWith('/admin/')) {
        return navigate(`${base}${to.slice('/admin'.length)}`, options)
      }
      return navigate(to, options)
    },
    [navigate, base]
  )
}
