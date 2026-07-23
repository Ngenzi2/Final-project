import { useState } from 'react'
import { toast } from 'sonner'
import { useStudents } from '../hooks/useStudents'
import { useExamRegistrations } from '../hooks/useExamRegistrations'
import { ApiError } from '../api/client'
import { LoadingState } from '../components/LoadingState'
import { ErrorState } from '../components/ErrorState'
import {
  itemMetaClass,
  itemTitleClass,
  listCardClass,
  listItemClass,
  panelClass,
  pillApprovedClass,
  pillNeutralClass,
  pillPendingClass,
  sectionHeaderTextClass,
  sectionHeaderTitleClass,
  smallButtonClass,
} from '../constants/ui'

const CompanyStudentsPage = () => {
  const { students, loading: studentsLoading, error: studentsError, approve, reject } = useStudents()
  const { registrations, loading: registrationsLoading, error: registrationsError } = useExamRegistrations()
  const [actionError, setActionError] = useState('')

  const loading = studentsLoading || registrationsLoading
  const error = studentsError || registrationsError

  if (loading) return <LoadingState />
  if (error) return <ErrorState message={error} />

  const handleApprove = async (studentId: number) => {
    setActionError('')
    const promise = approve(studentId)
    toast.promise(promise, {
      loading: 'Approving student...',
      success: 'Student approved successfully.',
      error: 'Failed to approve student.'
    })
    try {
      await promise
    } catch (err) {
      setActionError(err instanceof ApiError ? err.message : 'Failed to approve this student.')
    }
  }

  const handleReject = async (studentId: number) => {
    setActionError('')
    const promise = reject(studentId)
    toast.promise(promise, {
      loading: 'Rejecting student...',
      success: 'Student rejected successfully.',
      error: 'Failed to reject student.'
    })
    try {
      await promise
    } catch (err) {
      setActionError(err instanceof ApiError ? err.message : 'Failed to reject this student.')
    }
  }

  return (
    <div className={panelClass}>
      <div className="mb-5.5">
        <h2 className={sectionHeaderTitleClass}>Students</h2>
        <p className={sectionHeaderTextClass}>
          Approve new student registrations from your teachers, then track exam eligibility.
        </p>
      </div>
      {actionError && <ErrorState message={actionError} />}
      <div className={listCardClass}>
        {students.length === 0 ? (
          <p>No students registered under your teachers yet.</p>
        ) : (
          students.map((student) => {
            const studentRegistrations = registrations.filter((r) => r.studentId === student.id)
            const hasPaidBooking = studentRegistrations.some((r) => r.paid)
            const eligible = student.approvalStatus === 'APPROVED' && hasPaidBooking && student.trainingStatus === 'READY_FOR_EXAM'
            return (
              <div key={student.id} className={listItemClass}>
                <div>
                  <p className={itemTitleClass}>{student.name}</p>
                  <p className={itemMetaClass}>
                    {student.examType} · {studentRegistrations.length === 0 ? 'Not booked' : hasPaidBooking ? 'Paid' : 'Payment pending'} ·{' '}
                    {student.trainingStatus === 'READY_FOR_EXAM' ? 'Ready for exam' : 'In training'}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2.5">
                  {student.approvalStatus === 'PENDING' && (
                    <span className={pillPendingClass}>Awaiting your approval</span>
                  )}
                  {student.approvalStatus === 'APPROVED' && (
                    <span className={pillApprovedClass}>{student.emailVerified ? 'Approved · Email verified' : 'Approved · Awaiting email verification'}</span>
                  )}
                  {student.approvalStatus === 'REJECTED' && <span className={pillNeutralClass}>Rejected</span>}
                  {student.approvalStatus === 'PENDING' ? (
                    <>
                      <button type="button" onClick={() => handleApprove(student.id)} className={smallButtonClass}>
                        Approve
                      </button>
                      <button
                        type="button"
                        onClick={() => handleReject(student.id)}
                        className="cursor-pointer rounded-xl border border-[#E5EAF2] bg-white px-3.5 py-2.5 text-[0.82rem] font-semibold text-[#6B7280] hover:border-red-200 hover:text-red-600"
                      >
                        Reject
                      </button>
                    </>
                  ) : (
                    <span className={eligible ? pillApprovedClass : pillPendingClass}>{eligible ? 'Eligible' : 'Not yet eligible'}</span>
                  )}
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}

export default CompanyStudentsPage
