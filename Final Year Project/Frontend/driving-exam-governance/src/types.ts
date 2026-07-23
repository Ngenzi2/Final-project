export type Role = 'AUTHORITY' | 'COMPANY' | 'TEACHER' | 'STUDENT' | 'EXAM_OFFICER'

export type Page =
  | 'overview'
  | 'companies'
  | 'userManagement'
  | 'directory'
  | 'examSites'
  | 'teacherMonitoring'
  | 'studentMonitoring'
  | 'paymentManagement'
  | 'qrLogs'
  | 'reportsAnalytics'
  | 'settings'
  | 'companyOverview'
  | 'companyTeachers'
  | 'companyStudents'
  | 'companyStudentManagement'
  | 'companyPayments'
  | 'companyExamSchedule'
  | 'companyReports'
  | 'teacherStudents'
  | 'teacherTimetable'
  | 'teacherExams'
  | 'teacherPayments'
  | 'studentDashboard'
  | 'studentPayment'
  | 'studentQrTicket'
  | 'studentTimetable'
  | 'studentExamDetails'
  | 'studentNotifications'
  | 'officerDashboard'
  | 'officerQrScanner'
  | 'officerVerification'
  | 'officerAttendance'
  | 'officerReports'
  | 'profile'

export type WeekDay = 'MON' | 'TUE' | 'WED' | 'THU' | 'FRI' | 'SAT'
export type ExamType = 'CAR' | 'MOTORCYCLE' | 'TRUCK'
export type TrainingStatus = 'IN_TRAINING' | 'READY_FOR_EXAM'
export type RegistrationStatus = 'BOOKED' | 'CANCELLED'
export type ApprovalStatus = 'PENDING' | 'APPROVED' | 'REJECTED'
export type ExamResult = 'PENDING' | 'PASSED' | 'FAILED'

export type User = {
  id: number
  email: string
  role: Role
  name: string
  companyId: number | null
  teacherId: number | null
  studentId: number | null
}

export type TimetableSlot = {
  id: number
  day: WeekDay
  startTime: string
  endTime: string
  activity: string
}

export type Company = {
  id: number
  name: string
  registrationNumber: string
  tin: string
  email: string
  phone: string
  address: string
  district: string
  documents: {
    registrationCertificateUrl: string | null
    drivingSchoolLicenseUrl: string | null
    taxCertificateUrl: string | null
    logoUrl: string | null
  }
  admin: {
    fullName: string
    nationalId: string
    phone: string
    email: string
    position: string
  }
  approved: boolean
  suspended: boolean
  registrationDate: string
  approvalDate: string | null
  suspensionDate: string | null
}

export type Teacher = {
  id: number
  name: string
  email: string
  licenseNumber: string | null
  companyId: number
  registeredAt: string
  active: boolean
  timetable: TimetableSlot[]
}

export type Student = {
  id: number
  name: string
  nationalId: string
  email: string
  examType: ExamType
  companyId: number
  teacherId: number
  trainingStatus: TrainingStatus
  registeredAt: string
  photoUrl: string | null
  approvalStatus: ApprovalStatus
  emailVerified: boolean
}

export type ExamSlot = {
  id: number
  name: string
  location: string
  examDate: string
  startTime: string
  capacity: number
  bookedCount: number
  cancelled: boolean
}

export type ExamRegistration = {
  id: number
  studentId: number
  studentName: string
  studentExamType: ExamType
  companyId: number
  companyName: string
  teacherId: number
  teacherName: string
  examSlotId: number
  examSlotName: string
  examSlotLocation: string
  examSlotDate: string
  examSlotStartTime: string
  registeredAt: string
  paid: boolean
  paymentDate: string | null
  qrCode: string
  status: RegistrationStatus
  result: ExamResult
}

export type QrVerifyResult = {
  registration: ExamRegistration
  trainingStatus: TrainingStatus
  eligible: boolean
}

export type QrScanLog = {
  id: number
  qrCode: string
  studentId: number | null
  studentName: string | null
  companyName: string | null
  examSlotName: string | null
  scannedByName: string
  scannedByDeleted: boolean
  scannedAt: string
  eligible: boolean
  reason: string | null
}

export type PaymentStatus = 'PENDING' | 'PAID' | 'FAILED' | 'CANCELLED'

export type Payment = {
  id: number
  examRegistrationId: number
  studentId: number
  studentName: string
  companyId: number
  companyName: string
  amount: number
  siteShare: number
  companyShare: number
  paymentReference: string
  transactionId: string
  externalTransactionId: string | null
  status: PaymentStatus
  paymentMethod: string | null
  payerPhoneNumber: string | null
  paymentDate: string | null
  failureReason: string | null
  createdAt: string
  updatedAt: string
}

export type PaymentConfig = {
  totalAmount: number
  siteShare: number
  companyShare: number
  testMode: boolean
}
