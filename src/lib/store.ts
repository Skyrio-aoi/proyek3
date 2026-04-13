import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface User {
  id: string
  email: string
  name: string
  phone?: string | null
  role: string
  avatar?: string | null
  createdAt: string
  updatedAt: string
}

export interface TicketType {
  id: string
  name: string
  description?: string | null
  price: number
  isActive: boolean
  createdAt: string
  updatedAt: string
  features?: string[]
}

export type PageName =
  | 'home'
  | 'booking'
  | 'my-tickets'
  | 'order-history'
  | 'profile'
  | 'login'

interface AppState {
  // Navigation
  currentPage: PageName
  navigate: (page: PageName) => void

  // Auth
  user: User | null
  isAuthenticated: boolean
  login: (user: User) => void
  logout: () => void
  updateUser: (data: Partial<User>) => void

  // Booking
  bookingStep: number
  selectedTicketType: TicketType | null
  bookingQuantity: number
  bookingDate: Date | undefined
  setBookingStep: (step: number) => void
  setSelectedTicketType: (ticket: TicketType | null) => void
  setBookingQuantity: (qty: number) => void
  setBookingDate: (date: Date | undefined) => void
  resetBooking: () => void
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      // Navigation
      currentPage: 'home',
      navigate: (page) => set({ currentPage: page }),

      // Auth
      user: null,
      isAuthenticated: false,
      login: (user) => set({ user, isAuthenticated: true }),
      logout: () => {
        set({
          user: null,
          isAuthenticated: false,
          currentPage: 'home',
        })
        localStorage.removeItem('app-storage')
      },
      updateUser: (data) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...data } : null,
        })),

      // Booking
      bookingStep: 1,
      selectedTicketType: null,
      bookingQuantity: 1,
      bookingDate: undefined,
      setBookingStep: (step) => set({ bookingStep: step }),
      setSelectedTicketType: (ticket) =>
        set({ selectedTicketType: ticket }),
      setBookingQuantity: (qty) => set({ bookingQuantity: qty }),
      setBookingDate: (date) => set({ bookingDate: date }),
      resetBooking: () =>
        set({
          bookingStep: 1,
          selectedTicketType: null,
          bookingQuantity: 1,
          bookingDate: undefined,
        }),
    }),
    {
      name: 'app-storage',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        currentPage: state.currentPage,
      }),
    }
  )
)
