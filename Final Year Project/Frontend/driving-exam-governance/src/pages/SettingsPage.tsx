import type { User } from '../types'
import { cardClass, itemMetaClass, itemTitleClass, listCardClass, listItemClass, panelClass, sectionHeaderTextClass, sectionHeaderTitleClass } from '../constants/ui'

const SettingsPage = ({ user }: { user: User }) => {
  return (
    <section className={`${panelClass} grid gap-5.5`}>
      <div>
        <h2 className={sectionHeaderTitleClass}>Settings</h2>
        <p className={sectionHeaderTextClass}>System and account preferences.</p>
      </div>
      <div className={cardClass}>
        <h3 className="m-0 text-[#1F2937]">Account</h3>
        <div className={listCardClass}>
          <div className={listItemClass}>
            <div>
              <p className={itemTitleClass}>{user.name}</p>
              <p className={itemMetaClass}>{user.email}</p>
            </div>
          </div>
        </div>
      </div>
      <div className={cardClass}>
        <h3 className="m-0 text-[#1F2937]">System</h3>
        <p className={itemMetaClass}>ExamGov — Driving Exam Governance Platform</p>
        <p className={itemMetaClass}>Payment split: 20,000 RWF to exam site · 30,000 RWF to driving company</p>
      </div>
    </section>
  )
}

export default SettingsPage
