'use client'

import { useEffect } from 'react'
import { useAppStore } from '@/store/useAppStore'
import Navbar from '@/components/shared/Navbar'
import Footer from '@/components/shared/Footer'
import HomePage from '@/components/landing/HomePage'
import RidesPage from '@/components/landing/RidesPage'
import AuthPage from '@/components/landing/AuthPage'
import BookingPage from '@/components/visitor/BookingPage'
import MyTicketsPage from '@/components/visitor/MyTicketsPage'
import OrderHistoryPage from '@/components/visitor/OrderHistoryPage'
import ProfilePage from '@/components/visitor/ProfilePage'
import AdminDashboard from '@/components/admin/AdminDashboard'
import AdminRides from '@/components/admin/AdminRides'
import AdminOrders from '@/components/admin/AdminOrders'
import AdminValidate from '@/components/admin/AdminValidate'
import AdminAttendance from '@/components/admin/AdminAttendance'
import AdminReports from '@/components/admin/AdminReports'
import EmployeeDashboard from '@/components/employee/EmployeeDashboard'
import EmployeeAttendance from '@/components/employee/EmployeeAttendance'
import EmployeeSchedule from '@/components/employee/EmployeeSchedule'
import ChatBot from '@/components/chatbot/ChatBot'

const isAdminView = (view: string) => view.startsWith('admin-')
const isEmployeeView = (view: string) => view.startsWith('employee-')

export default function Home() {
  const { currentView } = useAppStore()

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [currentView])

  const renderPage = () => {
    switch (currentView) {
      case 'home':
        return <HomePage />
      case 'rides':
        return <RidesPage />
      case 'auth':
        return <AuthPage />
      case 'booking':
        return <BookingPage />
      case 'my-tickets':
        return <MyTicketsPage />
      case 'order-history':
        return <OrderHistoryPage />
      case 'profile':
        return <ProfilePage />
      case 'admin-dashboard':
        return <AdminDashboard />
      case 'admin-rides':
        return <AdminRides />
      case 'admin-orders':
        return <AdminOrders />
      case 'admin-validate':
        return <AdminValidate />
      case 'admin-attendance':
        return <AdminAttendance />
      case 'admin-reports':
        return <AdminReports />
      case 'employee-dashboard':
        return <EmployeeDashboard />
      case 'employee-attendance':
        return <EmployeeAttendance />
      case 'employee-schedule':
        return <EmployeeSchedule />
      default:
        return <HomePage />
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        {renderPage()}
      </main>
      {!isAdminView(currentView) && !isEmployeeView(currentView) && <Footer />}
      <ChatBot />
    </div>
  )
}
