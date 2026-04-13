import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface AppUser {
  id: string;
  email: string;
  name: string;
  role: string;
  phone?: string;
  avatar?: string;
  createdAt?: string;
}

interface ChatMessage {
  role: string;
  content: string;
}

interface AppState {
  // Navigation
  currentView: string;
  previousView: string;
  navigate: (view: string) => void;
  goBack: () => void;

  // Auth
  user: AppUser | null;
  isAuthenticated: boolean;
  setUser: (user: AppUser | null) => void;
  logout: () => void;

  // Booking
  bookingStep: number;
  selectedTicketType: Record<string, unknown> | null;
  bookingQuantity: number;
  bookingDate: string;
  setBookingStep: (step: number) => void;
  setSelectedTicketType: (ticket: Record<string, unknown> | null) => void;
  setBookingQuantity: (qty: number) => void;
  setBookingDate: (date: string) => void;
  resetBooking: () => void;

  // Chatbot
  isChatOpen: boolean;
  toggleChat: () => void;
  chatMessages: ChatMessage[];
  addChatMessage: (role: string, content: string) => void;
  clearChatMessages: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Navigation
      currentView: 'home',
      previousView: 'home',
      navigate: (view: string) => {
        set((state) => ({
          previousView: state.currentView,
          currentView: view,
        }));
        window.scrollTo({ top: 0, behavior: 'smooth' });
      },
      goBack: () => {
        const { previousView } = get();
        set((state) => ({
          currentView: state.previousView,
          previousView: 'home',
        }));
      },

      // Auth
      user: null,
      isAuthenticated: false,
      setUser: (user: AppUser | null) => {
        set({
          user,
          isAuthenticated: !!user,
        });
      },
      logout: () => {
        set({
          user: null,
          isAuthenticated: false,
          currentView: 'home',
        });
      },

      // Booking
      bookingStep: 1,
      selectedTicketType: null,
      bookingQuantity: 1,
      bookingDate: '',
      setBookingStep: (step: number) => set({ bookingStep: step }),
      setSelectedTicketType: (ticket: Record<string, unknown> | null) =>
        set({ selectedTicketType: ticket }),
      setBookingQuantity: (qty: number) => set({ bookingQuantity: qty }),
      setBookingDate: (date: string) => set({ bookingDate: date }),
      resetBooking: () =>
        set({
          bookingStep: 1,
          selectedTicketType: null,
          bookingQuantity: 1,
          bookingDate: '',
        }),

      // Chatbot
      isChatOpen: false,
      toggleChat: () => set((state) => ({ isChatOpen: !state.isChatOpen })),
      chatMessages: [],
      addChatMessage: (role: string, content: string) =>
        set((state) => ({
          chatMessages: [...state.chatMessages, { role, content }],
        })),
      clearChatMessages: () => set({ chatMessages: [] }),
    }),
    {
      name: 'niceplayland-storage',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
