'use client'

import { create } from 'zustand'

export interface Alert {
  id: string
  title: string
  description: string
  severity: 'critical' | 'high' | 'medium' | 'low'
  dashboard: string
  icon: string
  dismissed: boolean
}

interface AlertStore {
  alerts: Alert[]
  isOpen: boolean
  setAlerts: (alerts: Alert[]) => void
  dismissAlert: (id: string) => void
  togglePanel: () => void
  setOpen: (open: boolean) => void
}

export const useAlertStore = create<AlertStore>()((set) => ({
  alerts: [],
  isOpen: false,
  setAlerts: (alerts) => set({ alerts }),
  dismissAlert: (id) =>
    set((state) => ({
      alerts: state.alerts.map((a) => (a.id === id ? { ...a, dismissed: true } : a)),
    })),
  togglePanel: () => set((state) => ({ isOpen: !state.isOpen })),
  setOpen: (open) => set({ isOpen: open }),
}))
