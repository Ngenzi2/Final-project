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
import ExamSlotsPage from './pages/ExamSlotsPage'
import VerifyQrPage from './pages/VerifyQrPage'
import CompanyOverviewPage from './pages/CompanyOverviewPage'
import CompanyTeachersPage from './pages/CompanyTeachersPage'
import CompanyStudentsPage from './pages/CompanyStudentsPage'
import TeacherPortalPage from './pages/TeacherPortalPage'
import StudentPaymentPage from './pages/StudentPaymentPage'
import StudentQrTicketPage from './pages/StudentQrTicketPage'
import StudentTimetablePage from './pages/StudentTimetablePage'

const App = () => {
  const [user, setUser] = useState<User | null>(null)
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
        return <OverviewPage />
      case 'companies':
        return <CompaniesPage />
      case 'examSites':
        return <ExamSlotsPage />
      case 'verifyQr':
        return <VerifyQrPage />
      case 'companyOverview':
        return <CompanyOverviewPage user={user} />
      case 'companyTeachers':
        return <CompanyTeachersPage />
      case 'companyStudents':
        return <CompanyStudentsPage />
      case 'teacher':
        return <TeacherPortalPage user={user} />
      case 'studentPayment':
        return <StudentPaymentPage user={user} />
      case 'studentQrTicket':
        return <StudentQrTicketPage user={user} />
      case 'studentTimetable':
        return <StudentTimetablePage />
      default:
        return null
    }
  }

  return (
    <div
      className={`grid h-screen w-full overflow-hidden bg-[#f6f9fd] transition-[grid-template-columns] duration-300 ease-in-out max-[940px]:h-auto max-[940px]:grid-cols-1 max-[940px]:grid-rows-[auto_minmax(0,1fr)] ${
        sidebarExpanded ? 'grid-cols-[260px_minmax(0,1fr)]' : 'grid-cols-[84px_minmax(0,1fr)]'
      }`}
    >
      <header
        onMouseEnter={() => setSidebarHovered(true)}
        onMouseLeave={() => setSidebarHovered(false)}
        className="flex h-full flex-col gap-7 overflow-y-auto overflow-x-hidden bg-brand-navy px-4 py-6 text-white max-[940px]:h-auto max-[940px]:flex-row max-[940px]:flex-wrap max-[940px]:items-center max-[940px]:justify-between max-[940px]:overflow-visible max-[940px]:border-b max-[940px]:border-white/14 max-[940px]:px-5.5 max-[940px]:py-4"
      >
        <div className="flex items-center gap-3 px-1.5">
          <span className="grid h-10.5 w-10.5 shrink-0 place-items-center overflow-hidden rounded-xl bg-[#e6f6ff]">
            <img src={innesLogo} alt="INNES Driving School" className="h-full w-full object-cover object-left" />
          </span>
          <div className={`flex flex-1 items-center justify-between gap-2 ${sidebarExpanded ? 'whitespace-nowrap' : 'whitespace-nowrap min-[941px]:hidden'}`}>
            <div>
              <p className="m-0 font-extrabold text-white">ExamGov</p>
              <p className="m-0 text-[0.86rem] text-[#a7c5dc]">QR verification</p>
            </div>
            <button
              type="button"
              onClick={toggleSidebarPin}
              title={sidebarPinned ? 'Unpin sidebar' : 'Pin sidebar open'}
              className={`grid h-7 w-7 shrink-0 place-items-center rounded-lg text-[#a7c5dc] hover:bg-white/16 hover:text-white max-[940px]:hidden ${
                sidebarPinned ? 'bg-white/16 text-white' : ''
              }`}
            >
              {sidebarPinned ? <PinOff size={15} strokeWidth={2} /> : <Pin size={15} strokeWidth={2} />}
            </button>
          </div>
        </div>

        <nav className="flex flex-col gap-1.5 max-[940px]:flex-row max-[940px]:flex-wrap" aria-label="Dashboard navigation">
          {visiblePages.map((page) => {
            const Icon = pageIcons[page]
            const active = page === activePage
            return (
              <button
                key={page}
                type="button"
                onClick={() => setActivePage(page)}
                className={`group flex min-h-11.5 w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left hover:bg-[#e6f6ff] hover:text-brand-navy max-[940px]:w-auto ${
                  active ? 'bg-[#e6f6ff] text-brand-navy shadow-[inset_3px_0_0_var(--color-brand-orange)]' : 'bg-transparent text-[#d8e8f7]'
                }`}
              >
                <span
                  className={`grid h-6.5 w-6.5 shrink-0 place-items-center rounded-lg font-extrabold group-hover:bg-brand-navy group-hover:text-white ${
                    active ? 'bg-brand-navy text-white' : 'bg-white/16'
                  }`}
                >
                  <Icon size={18} strokeWidth={2} />
                </span>
                <span className={`whitespace-nowrap ${sidebarExpanded ? '' : 'min-[941px]:hidden'}`}>{pageLabels[page]}</span>
              </button>
            )
          })}
        </nav>

        <div className="mt-auto flex flex-col gap-2.5 border-t border-white/14 pt-4 max-[940px]:mt-0 max-[940px]:flex-row max-[940px]:items-center max-[940px]:border-t-0 max-[940px]:pt-0">
          <p
            className={`m-0 truncate px-3 text-[0.82rem] text-[#a7c5dc] max-[940px]:hidden ${
              sidebarExpanded ? '' : 'min-[941px]:hidden'
            }`}
          >
            {user.name} · {user.email}
          </p>
          <button
            type="button"
            onClick={handleLogout}
            className="group flex min-h-11.5 w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-[#d8e8f7] hover:bg-[#e6f6ff] hover:text-brand-navy max-[940px]:w-auto"
          >
            <span className="grid h-6.5 w-6.5 shrink-0 place-items-center rounded-lg bg-white/16 font-extrabold group-hover:bg-brand-navy group-hover:text-white">
              <LogOut size={18} strokeWidth={2} />
            </span>
            <span className={`whitespace-nowrap ${sidebarExpanded ? '' : 'min-[941px]:hidden'}`}>Log out</span>
          </button>
        </div>
      </header>

      <main className="flex h-full flex-col gap-5.5 overflow-y-auto px-10 py-6 max-[940px]:h-auto max-[940px]:overflow-visible max-[640px]:px-4.5 max-[640px]:py-4.5">
        <header className="flex items-center justify-between gap-4.5 max-[640px]:flex-col max-[640px]:items-start">
          <div>
            <p className="m-0 mb-2 text-[0.8rem] font-extrabold tracking-[0.12em] text-[#587187] uppercase">Driving Exam Governance</p>
            <h1 className="m-0 text-[2rem] leading-[1.1] text-[#14243a]">{pageLabels[activePage]}</h1>
          </div>
          <div className="inline-flex items-center gap-2.5 rounded-full border border-[#dbe5f1] bg-white px-3.5 py-2.5 font-bold text-[#476173]">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 shadow-[0_0_0_5px_rgba(16,185,129,0.12)]" />
            <span>Live system</span>
          </div>
        </header>

        {renderPage()}
      </main>
    </div>
  )
}

export default App
