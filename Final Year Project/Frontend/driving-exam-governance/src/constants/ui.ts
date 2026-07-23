export const panelClass =
  'rounded-[18px] border border-[#E5EAF2] border-t-8 border-t-brand-navy bg-white p-6 shadow-[0_18px_44px_rgba(20,34,102,0.06)]'
export const subpanelClass = 'flex flex-col gap-4.5'
export const cardClass = 'flex flex-col gap-3 rounded-2xl border border-[#E5EAF2] border-t-8 border-t-brand-navy bg-white p-3.5'
export const chartCardClass =
  'flex flex-col gap-3 rounded-2xl bg-white p-4 shadow-[0_2px_10px_rgba(15,23,42,0.04)] transition-shadow duration-300 hover:shadow-[0_10px_28px_rgba(15,23,42,0.08)]'
export const tableWrapClass = 'overflow-x-auto rounded-2xl border border-[#E5EAF2] border-t-8 border-t-brand-navy'

// Premium, depth-forward variants (opt-in) — soft diffused shadow instead of a hairline border.
export const glassPanelClass =
  'rounded-[18px] border-t-8 border-t-brand-navy bg-white/90 backdrop-blur-md p-6 shadow-[0_8px_30px_rgba(15,23,42,0.06),0_1px_2px_rgba(15,23,42,0.04)]'
export const glassCardClass =
  'flex flex-col gap-3 rounded-2xl border-t-8 border-t-brand-navy bg-white/95 p-3.5 shadow-[0_8px_30px_rgba(15,23,42,0.05)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_16px_40px_rgba(15,23,42,0.09)]'
export const tactileRowClass =
  'transition-all duration-200 ease-out hover:-translate-y-0.5 hover:shadow-[0_10px_24px_rgba(15,23,42,0.08)] active:scale-[0.98] active:duration-75'
export const listCardClass = 'grid gap-3.5'
export const listItemClass =
  'flex flex-wrap items-center justify-between gap-4.5 rounded-2xl border border-[#E5EAF2] bg-white px-4.5 py-4 shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition-shadow hover:border-[#D3DBE8] hover:shadow-[0_10px_24px_rgba(15,23,42,0.07)]'
export const itemTitleClass = 'm-0 mb-1.5 font-semibold text-[#1F2937]'
export const itemMetaClass = 'm-0 flex flex-wrap items-center gap-x-3 gap-y-1 text-[0.9rem] text-[#6B7280]'
export const iconBadgeClass = 'grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-brand-orange-tint text-brand-orange-strong'
export const primaryButtonClass =
  'w-fit cursor-pointer rounded-2xl border-none bg-brand-orange-strong px-4.5 py-3 text-white hover:bg-[#B8650C] disabled:cursor-not-allowed disabled:bg-[#aeb3cc]'
export const smallButtonClass = 'cursor-pointer rounded-xl border-none bg-brand-orange-strong px-3.5 py-2.5 text-white hover:bg-[#B8650C]'
export const pillBaseClass = 'inline-flex items-center justify-center rounded-full px-3 py-2 text-[0.85rem] font-semibold'
export const pillApprovedClass = `${pillBaseClass} bg-[#4f5cff]/14 text-[#2c38b0]`
export const pillPendingClass = `${pillBaseClass} bg-brand-orange/16 text-brand-orange-strong`
export const pillNeutralClass = `${pillBaseClass} bg-[#eef1f8] text-[#6B7280]`
export const pillDangerClass = `${pillBaseClass} bg-[#EF4444]/12 text-[#B91C1C]`
export const pillGoodClass = `${pillBaseClass} bg-[#22C55E]/12 text-[#15803D]`
export const inputClass = 'min-h-11 w-full rounded-2xl border border-[#E5EAF2] bg-white px-3.5 py-3 text-[#23263b] outline-none focus:border-brand-orange'
export const labelClass = 'grid gap-2 text-[0.95rem] text-[#6B7280]'
export const formGridClass = 'grid gap-4'
export const sectionHeaderTitleClass = 'm-0 text-[1.8rem] tracking-tight text-[#1F2937]'
export const sectionHeaderTextClass = 'mt-2 mb-0 text-[#6B7280]'
export const fileInputClass =
  'flex min-h-11 w-full cursor-pointer items-center gap-2 rounded-2xl border border-dashed border-[#E5EAF2] bg-white px-3.5 py-3 text-[#6B7280] file:mr-2 file:cursor-pointer file:rounded-lg file:border-none file:bg-[#f6f7ff] file:px-3 file:py-1.5 file:text-[#6B7280]'
export const th = 'border-b border-[#E5EAF2] bg-[#f6f7ff] px-4 py-3 text-left text-[0.85rem] font-bold text-[#6B7280]'
export const td = 'border-b border-[#f0f1f8] px-4 py-3 align-top text-[0.92rem] text-[#1F2937]'

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
