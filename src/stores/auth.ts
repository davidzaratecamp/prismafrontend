import { create } from 'zustand'
import { api, TOKEN_KEY } from '@/lib/api'
import { queryClient } from '@/lib/queryClient'
import type { User } from '@/lib/types'

interface AuthState {
  user: User | null
  status: 'loading' | 'authenticated' | 'unauthenticated'
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  bootstrap: () => Promise<void>
  setUser: (u: User) => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  status: 'loading',
  login: async (email, password) => {
    // Por si quedó caché de una sesión anterior en el mismo navegador (otro
    // usuario, otro alcance de campaña): nunca debe sobrevivir a un login.
    queryClient.clear()
    const { data } = await api.post('/auth/login', { email, password })
    localStorage.setItem(TOKEN_KEY, data.token)
    set({ user: data.user, status: 'authenticated' })
  },
  logout: () => {
    queryClient.clear()
    localStorage.removeItem(TOKEN_KEY)
    set({ user: null, status: 'unauthenticated' })
  },
  bootstrap: async () => {
    const token = localStorage.getItem(TOKEN_KEY)
    if (!token) {
      set({ status: 'unauthenticated' })
      return
    }
    try {
      const { data } = await api.get('/auth/me')
      set({ user: data.user, status: 'authenticated' })
    } catch {
      queryClient.clear()
      localStorage.removeItem(TOKEN_KEY)
      set({ user: null, status: 'unauthenticated' })
    }
  },
  setUser: (user) => set({ user }),
}))

/** Developer, o admin sin `admin_no_create` (ver UserForm) — crear/editar/eliminar
 *  en Proyectos, Tablero y Roadmap. Un admin de alcance limitado (caso: David
 *  Acero, TyT) queda de solo lectura ahí, igual que el backend (canWrite +
 *  blockRestrictedWrite en projects/tasks/milestones .routes.js). */
export const useCanWrite = () => {
  const user = useAuthStore((s) => s.user)
  if (!user) return false
  if (user.role === 'developer') return true
  return user.role === 'admin' && !user.admin_no_create
}
export const useIsAdmin = () => useAuthStore((s) => s.user?.role === 'admin')
export const useIsAnalyst = () => useAuthStore((s) => s.user?.role === 'analista')

/** Admin sin `admin_no_create` — crear/editar/eliminar en Usuarios/Áreas (admin-only). */
export const useCanCreateAdminResource = () =>
  useAuthStore((s) => s.user?.role === 'admin' && !s.user?.admin_no_create)
