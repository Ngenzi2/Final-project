import { useCompanies } from '../hooks/useCompanies'
import { useTeachers } from '../hooks/useTeachers'
import { useStudents } from '../hooks/useStudents'
import { LoadingState } from '../components/LoadingState'
import { ErrorState } from '../components/ErrorState'
import type { User } from '../types'
import {
  cardClass,
  itemMetaClass,
  itemTitleClass,
  listCardClass,
  listItemClass,
  panelClass,
  pillApprovedClass,
  pillPendingClass,
  sectionHeaderTextClass,
  sectionHeaderTitleClass,
} from '../constants/ui'

const CompanyOverviewPage = ({ user }: { user: User }) => {
  const { companies, loading: companiesLoading, error: companiesError } = useCompanies()
  const { teachers, loading: teachersLoading, error: teachersError } = useTeachers()
  const { students, loading: studentsLoading, error: studentsError } = useStudents()

  const loading = companiesLoading || teachersLoading || studentsLoading
  const error = companiesError || teachersError || studentsError
  const company = companies.find((c) => c.id === user.companyId)
  const readyCount = students.filter((student) => student.trainingStatus === 'READY_FOR_EXAM').length

  if (loading) return <LoadingState />
  if (error) return <ErrorState message={error} />

  return (
    <div className={panelClass}>
      <div className="mb-5.5">
        <h2 className={sectionHeaderTitleClass}>Company overview</h2>
        <p className={sectionHeaderTextClass}>
          Snapshot of <strong>{company?.name ?? 'your company'}</strong>'s registration status, teachers, and students.
        </p>
      </div>
      <div className="grid grid-cols-2 gap-6 max-[940px]:grid-cols-1">
        <div className={cardClass}>
          <h3 className="m-0 text-[#141a39]">Company profile</h3>
          {company ? (
            <div className={listCardClass}>
              <div className={listItemClass}>
                <div>
                  <p className={itemTitleClass}>{company.name}</p>
                  <p className={itemMetaClass}>
                    <span>{company.district || 'No district set'}</span>
                    <span>{company.email}</span>
                  </p>
                </div>
                <span className={company.approved ? pillApprovedClass : pillPendingClass}>
                  {company.approved ? 'Approved' : 'Pending approval'}
                </span>
              </div>
              <div className={listItemClass}>
                <div>
                  <p className={itemTitleClass}>Administrator</p>
                  <p className={itemMetaClass}>
                    <span>{company.admin.fullName || 'Not set'}</span>
                    <span>{company.admin.position || 'No position'}</span>
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <p>No company profile found for this account.</p>
          )}
        </div>
        <div className={cardClass}>
          <h3 className="m-0 text-[#141a39]">At a glance</h3>
          <div className={listCardClass}>
            <div className={listItemClass}>
              <p className={itemTitleClass}>Teachers</p>
              <strong className="text-[#141a39]">{teachers.length}</strong>
            </div>
            <div className={listItemClass}>
              <p className={itemTitleClass}>Students</p>
              <strong className="text-[#141a39]">{students.length}</strong>
            </div>
            <div className={listItemClass}>
              <p className={itemTitleClass}>Ready for exam</p>
              <strong className="text-[#141a39]">{readyCount}</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CompanyOverviewPage
