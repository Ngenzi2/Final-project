export type Role = 'AUTHORITY' | 'COMPANY' | 'TEACHER' | 'STUDENT'

export type Page =
  | 'overview'
  | 'companies'
  | 'directory'
  | 'examSites'
  | 'verifyQr'
  | 'companyOverview'
  | 'companyTeachers'
  | 'companyStudents'
  | 'teacherStudents'
  | 'teacherTimetable'
  | 'teacherExams'
  | 'studentPayment'
  | 'studentQrTicket'
  | 'studentTimetable'

export type WeekDay = 'MON' | 'TUE' | 'WED' | 'THU' | 'FRI' | 'SAT'
export type ExamType = 'CAR' | 'MOTORCYCLE' | 'TRUCK'
export type TrainingStatus = 'IN_TRAINING' | 'READY_FOR_EXAM'
export type RegistrationStatus = 'BOOKED' | 'CANCELLED'
export type ApprovalStatus = 'PENDING' | 'APPROVED' | 'REJECTED'

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
  registrationDate: string
  approvalDate: string | null
}

export type Teacher = {
  id: number
  name: string
  email: string
  companyId: number
  registeredAt: string
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
}

export type QrVerifyResult = {
  registration: ExamRegistration
  trainingStatus: TrainingStatus
  eligible: boolean
}
