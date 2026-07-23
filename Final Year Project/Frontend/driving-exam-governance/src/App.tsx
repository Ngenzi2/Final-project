import { useEffect, useState } from 'react'
import { LogOut, Pin, PinOff } from 'lucide-react'
import LoginPage from './LoginPage'
import * as authApi from './api/auth'
import { getToken, clearToken } from './api/client'
import type { Page, User } from './types'
import { pageAccess, pageLabels, pageIcons } from './constants/pages'
import { LoadingState } from './components/LoadingState'
import innesLogo from './assets/innes-logo.png'

import OverviewPage from './pages/OverviewPage'
import CompaniesPage from './pages/CompaniesPage'
import UserManagementPage from './pages/UserManagementPage'
import DirectoryPage from './pages/DirectoryPage'
import ExamSlotsPage from './pages/ExamSlotsPage'
import { NotificationBell } from './components/NotificationBell'
import TeacherMonitoringPage from './pages/TeacherMonitoringPage'
import StudentMonitoringPage from './pages/StudentMonitoringPage'
import PaymentManagementPage from './pages/PaymentManagementPage'
import QrVerificationLogsPage from './pages/QrVerificationLogsPage'
import SettingsPage from './pages/SettingsPage'
import CompanyOverviewPage from './pages/CompanyOverviewPage'
import CompanyTeachersPage from './pages/CompanyTeachersPage'
import CompanyStudentsPage from './pages/CompanyStudentsPage'
import CompanyStudentManagementPage from './pages/CompanyStudentManagementPage'
import CompanyPaymentsPage from './pages/CompanyPaymentsPage'
import CompanyExamSchedulePage from './pages/CompanyExamSchedulePage'
import CompanyReportsPage from './pages/CompanyReportsPage'
import TeacherStudentsPage from './pages/TeacherStudentsPage'
import TeacherTimetablePage from './pages/TeacherTimetablePage'
import TeacherExamsPage from './pages/TeacherExamsPage'
import TeacherPaymentsPage from './pages/TeacherPaymentsPage'
import StudentDashboardPage from './pages/StudentDashboardPage'
import StudentPaymentPage from './pages/StudentPaymentPage'
import StudentQrTicketPage from './pages/StudentQrTicketPage'
import StudentTimetablePage from './pages/StudentTimetablePage'
import StudentExamDetailsPage from './pages/StudentExamDetailsPage'
import StudentNotificationsPage from './pages/StudentNotificationsPage'
import StudentVerifyPage from './pages/StudentVerifyPage'
import ReportsPage from './pages/shared/ReportsPage'
import ProfilePage from './pages/shared/ProfilePage'

import OfficerDashboardPage from './pages/OfficerDashboardPage'
import QrScannerPage from './pages/QrScannerPage'
import StudentVerificationPage from './pages/StudentVerificationPage'
import OfficerAttendancePage from './pages/OfficerAttendancePage'

const getVerifyTokenFromUrl = () => new URLSearchParams(window.location.search).get('verifyToken')

const App = () => {
  const [user, setUser] = useState<User | null>(null)
  const [verifyToken, setVerifyToken] = useState<string | null>(() => getVerifyTokenFromUrl())
  const [activePage, setActivePage] = useState<Page>('overview')
  const [bootstrapping, setBootstrapping] = useState(() => Boolean(getToken()))
  const [sidebarHovered, setSidebarHovered] = useState(false)
  const [sidebarPinned, setSidebarPinned] = useState(() => localStorage.getItem('examgov-sidebar-pinned') === 'true')
  const sidebarExpanded = sidebarPinned || sidebarHovered

  const toggleSidebarPin = () => {
    setSidebarPinned((prev) => {
      const next = !prev
      localStorage.setItem('examgov-sidebar-pinned', String(next))
      return next
    })
  }

  useEffect(() => {
    const token = getToken()
    if (!token) {
      return
    }
    authApi
      .fetchMe()
      .then((loadedUser) => {
        setUser(loadedUser)
        setActivePage(pageAccess[loadedUser.role][0])
      })
      .catch(() => {
        clearToken()
      })
      .finally(() => setBootstrapping(false))
  }, [])

  const handleLogin = (loggedInUser: User) => {
    setUser(loggedInUser)
    setActivePage(pageAccess[loggedInUser.role][0])
  }

  const handleLogout = () => {
    clearToken()
    setUser(null)
    setActivePage('overview')
  }

  if (verifyToken) {
    return (
      <StudentVerifyPage
        token={verifyToken}
        onContinue={() => {
          window.history.replaceState(null, '', window.location.pathname)
          setVerifyToken(null)
        }}
      />
    )
  }

  if (bootstrapping) {
    return (
      <div className="grid h-screen w-full place-items-center bg-white">
        <LoadingState label="Loading ExamGov..." />
      </div>
    )
  }

  if (!user) {
    return <LoginPage onLogin={handleLogin} />
  }

  const visiblePages = pageAccess[user.role]

  const renderPage = () => {
    switch (activePage) {
      case 'overview':
        return <OverviewPage user={user} />
      case 'companies':
        return <CompaniesPage />
      case 'userManagement':
        return <UserManagementPage />
      case 'directory':
        return <DirectoryPage />
      case 'examSites':
        return <ExamSlotsPage />
      case 'teacherMonitoring':
        return <TeacherMonitoringPage />
      case 'studentMonitoring':
        return <StudentMonitoringPage />
      case 'paymentManagement':
        return <PaymentManagementPage />
      case 'qrLogs':
        return <QrVerificationLogsPage />
      case 'reportsAnalytics':
        return <ReportsPage scope="AUTHORITY" />
      case 'settings':
        return <SettingsPage user={user} />
      case 'profile':
        return <ProfilePage user={user} />
      case 'companyOverview':
        return <CompanyOverviewPage user={user} />
      case 'companyTeachers':
        return <CompanyTeachersPage />
      case 'companyStudents':
        return <CompanyStudentsPage />
      case 'companyStudentManagement':
        return <CompanyStudentManagementPage />
      case 'companyPayments':
        return <CompanyPaymentsPage />
      case 'companyExamSchedule':
        return <CompanyExamSchedulePage />
      case 'companyReports':
        return <CompanyReportsPage />
      case 'teacherStudents':
        return <TeacherStudentsPage />
      case 'teacherTimetable':
        return <TeacherTimetablePage user={user} />
      case 'teacherExams':
        return <TeacherExamsPage user={user} />
      case 'teacherPayments':
        return <TeacherPaymentsPage />
      case 'studentDashboard':
        return <StudentDashboardPage user={user} />
      case 'studentPayment':
        return <StudentPaymentPage user={user} />
      case 'studentQrTicket':
        return <StudentQrTicketPage user={user} />
      case 'studentTimetable':
        return <StudentTimetablePage />
      case 'officerDashboard':
        return <OfficerDashboardPage />
      case 'officerQrScanner':
        return <QrScannerPage />
      case 'officerVerification':
        return <StudentVerificationPage />
      case 'officerAttendance':
        return <OfficerAttendancePage />
      case 'officerReports':
        return <ReportsPage scope="EXAM_OFFICER" />
      case 'studentExamDetails':
        return <StudentExamDetailsPage user={user} />
      case 'studentNotifications':
        return <StudentNotificationsPage user={user} />
      default:
        return null
    }
  }

  return (
    <>
      <div
        className={`grid h-screen w-full overflow-hidden bg-[#F6F8FC] transition-[grid-template-columns] duration-300 ease-in-out max-[940px]:h-auto max-[940px]:grid-cols-1 max-[940px]:grid-rows-[auto_minmax(0,1fr)] ${sidebarExpanded ? 'grid-cols-[260px_minmax(0,1fr)]' : 'grid-cols-[84px_minmax(0,1fr)]'
          }`}
      >
        <header
          onMouseEnter={() => setSidebarHovered(true)}
          onMouseLeave={() => setSidebarHovered(false)}
          className="flex h-full flex-col gap-6 overflow-y-auto overflow-x-hidden bg-gradient-to-b from-brand-navy to-[#0a2540] px-4 py-6 text-white max-[940px]:h-auto max-[940px]:flex-row max-[940px]:flex-wrap max-[940px]:items-center max-[940px]:justify-between max-[940px]:overflow-visible max-[940px]:border-b max-[940px]:border-white/14 max-[940px]:px-5.5 max-[940px]:py-4"
        >
          <div className="flex items-center gap-3 px-1.5">
            <span className="grid h-9 w-9 shrink-0 place-items-center overflow-hidden rounded-xl bg-[#e6f6ff]">
              <img src={innesLogo} alt="INNES Driving School" className="h-full w-full object-cover object-left" />
            </span>
            <div className={`flex flex-1 items-center justify-between gap-2 ${sidebarExpanded ? 'whitespace-nowrap' : 'whitespace-nowrap min-[941px]:hidden'}`}>
              <p className="m-0 text-[0.9rem] font-extrabold tracking-tight text-white">ExamGov</p>
              <button
                type="button"
                onClick={toggleSidebarPin}
                title={sidebarPinned ? 'Unpin sidebar' : 'Pin sidebar open'}
                className={`grid h-7 w-7 shrink-0 place-items-center rounded-lg text-[#a7c5dc] hover:bg-white/16 hover:text-white max-[940px]:hidden ${sidebarPinned ? 'bg-white/16 text-white' : ''
                  }`}
              >
                {sidebarPinned ? <PinOff size={15} strokeWidth={2} /> : <Pin size={15} strokeWidth={2} />}
              </button>
            </div>
          </div>

          {/* Profile block */}
          <div className="flex flex-col items-center gap-3 rounded-2xl bg-white/6 py-5 max-[940px]:hidden">
            <span className="grid h-16 w-16 shrink-0 place-items-center rounded-full bg-gradient-to-br from-brand-orange to-brand-orange-strong text-xl font-extrabold text-white shadow-[0_6px_18px_rgba(0,0,0,0.25)] ring-4 ring-white/10">
              {user.name.charAt(0).toUpperCase()}
            </span>
            <div className={`flex flex-col items-center gap-0.5 text-center ${sidebarExpanded ? '' : 'min-[941px]:hidden'}`}>
              <p className="m-0 truncate max-w-45 text-[0.92rem] font-bold text-white">{user.name}</p>
              <p className="m-0 truncate max-w-45 text-[0.76rem] text-[#a7c5dc]">{user.email}</p>
            </div>
          </div>

          <nav className="flex flex-col gap-1 max-[940px]:flex-row max-[940px]:flex-wrap" aria-label="Dashboard navigation">
            {visiblePages.map((page) => {
              const Icon = pageIcons[page]
              const active = page === activePage
              return (
                <button
                  key={page}
                  type="button"
                  onClick={() => setActivePage(page)}
                  className={`group relative flex min-h-11 w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors duration-150 hover:bg-white/8 hover:text-white max-[940px]:w-auto ${active ? 'bg-white/10 text-white' : 'bg-transparent text-[#a7c5dc]'
                    }`}
                >
                  {active && <span className="absolute left-0 top-1/2 h-5.5 w-1 -translate-y-1/2 rounded-r-full bg-brand-orange" />}
                  <Icon size={19} strokeWidth={2} className={active ? 'text-brand-orange' : ''} />
                  <span className={`whitespace-nowrap text-[0.92rem] ${active ? 'font-semibold' : ''} ${sidebarExpanded ? '' : 'min-[941px]:hidden'}`}>{pageLabels[page]}</span>
                </button>
              )
            })}
          </nav>

          <div className="mt-auto border-t border-white/10 pt-3 max-[940px]:mt-0 max-[940px]:border-t-0 max-[940px]:pt-0">
            <button
              type="button"
              onClick={handleLogout}
              className="group flex min-h-11 w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-[#a7c5dc] transition-colors duration-150 hover:bg-white/8 hover:text-white max-[940px]:w-auto"
            >
              <LogOut size={19} strokeWidth={2} />
              <span className={`whitespace-nowrap text-[0.92rem] ${sidebarExpanded ? '' : 'min-[941px]:hidden'}`}>Log out</span>
            </button>
          </div>
        </header>

        <main className="flex h-full flex-col gap-5.5 overflow-y-auto px-10 py-6 max-[940px]:h-auto max-[940px]:overflow-visible max-[640px]:px-4.5 max-[640px]:py-4.5">
          <header className="flex items-center justify-between gap-4.5 max-[640px]:flex-col max-[640px]:items-start">
            <div>
              <p className="m-0 mb-2 text-[0.8rem] font-extrabold tracking-[0.12em] text-[#6B7280] uppercase">Driving Exam Governance</p>
              <h1 className="m-0 text-[2rem] leading-[1.1] text-[#1F2937]">{pageLabels[activePage]}</h1>
            </div>
            <div className="flex items-center gap-4">
              <NotificationBell />
              <div className="inline-flex items-center gap-2.5 rounded-full border border-[#E5EAF2] bg-white px-3.5 py-2.5 font-bold text-[#6B7280]">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 shadow-[0_0_0_5px_rgba(16,185,129,0.12)]" />
                <span>Live system</span>
              </div>
            </div>
          </header>

          {renderPage()}
        </main>
      </div>
    </>
  )
}

export default App
