export const panelClass =
  'rounded-[18px] border border-[#e6e8f0] border-t-8 border-t-brand-navy bg-white p-6 shadow-[0_18px_44px_rgba(20,34,102,0.06)]'
export const subpanelClass = 'flex flex-col gap-4.5'
export const cardClass = 'flex flex-col gap-3 rounded-2xl border border-[#e8ebf4] border-t-8 border-t-brand-navy bg-[#fbfcff] p-3.5'
export const chartCardClass = 'flex flex-col gap-3 rounded-2xl border border-[#e0e8f2] border-t-8 border-t-brand-navy bg-white p-3.5'
export const tableWrapClass = 'overflow-x-auto rounded-2xl border border-[#e6e8f0] border-t-8 border-t-brand-navy'
export const listCardClass = 'grid gap-3.5'
export const listItemClass =
  'flex flex-wrap items-center justify-between gap-4.5 rounded-2xl border border-[#eceef4] bg-white px-4.5 py-4 shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition-shadow hover:border-[#dde1ee] hover:shadow-[0_10px_24px_rgba(15,23,42,0.07)]'
export const itemTitleClass = 'm-0 mb-1.5 font-semibold text-[#161a35]'
export const itemMetaClass = 'm-0 flex flex-wrap items-center gap-x-3 gap-y-1 text-[0.9rem] text-[#6c6f93]'
export const iconBadgeClass = 'grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-brand-orange-tint text-brand-orange-strong'
export const primaryButtonClass =
  'w-fit cursor-pointer rounded-2xl border-none bg-brand-orange-strong px-4.5 py-3 text-white hover:bg-[#92400e] disabled:cursor-not-allowed disabled:bg-[#aeb3cc]'
export const smallButtonClass = 'cursor-pointer rounded-xl border-none bg-brand-orange-strong px-3.5 py-2.5 text-white hover:bg-[#92400e]'
export const pillBaseClass = 'inline-flex items-center justify-center rounded-full px-3 py-2 text-[0.85rem] font-semibold'
export const pillApprovedClass = `${pillBaseClass} bg-[#4f5cff]/14 text-[#2c38b0]`
export const pillPendingClass = `${pillBaseClass} bg-brand-orange/16 text-brand-orange-strong`
export const pillNeutralClass = `${pillBaseClass} bg-[#eef1f8] text-[#5a6178]`
export const inputClass = 'min-h-11 w-full rounded-2xl border border-[#d7d8e5] bg-white px-3.5 py-3 text-[#23263b] outline-none focus:border-brand-orange'
export const labelClass = 'grid gap-2 text-[0.95rem] text-[#3d415f]'
export const formGridClass = 'grid gap-4'
export const sectionHeaderTitleClass = 'm-0 text-[1.8rem] text-[#141a39]'
export const sectionHeaderTextClass = 'mt-2 mb-0 text-[#4b507a]'
export const fileInputClass =
  'flex min-h-11 w-full cursor-pointer items-center gap-2 rounded-2xl border border-dashed border-[#d7d8e5] bg-white px-3.5 py-3 text-[#6c6f93] file:mr-2 file:cursor-pointer file:rounded-lg file:border-none file:bg-[#f6f7ff] file:px-3 file:py-1.5 file:text-[#3d415f]'
export const th = 'border-b border-[#e6e8f0] bg-[#f6f7ff] px-4 py-3 text-left text-[0.85rem] font-bold text-[#3d415f]'
export const td = 'border-b border-[#f0f1f8] px-4 py-3 align-top text-[0.92rem] text-[#2c2f4a]'

export const paymentSplit = {
  site: 20000,
  school: 30000,
}

export const formatCurrency = (value: number) =>
  new Intl.NumberFormat('en-RW', {
    style: 'currency',
    currency: 'RWF',
    maximumFractionDigits: 0,
  }).format(value)

export const todayIso = () => new Date().toISOString().slice(0, 10)

export const formatDate = (value: string) =>
  new Date(value).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
