// Validated with the dataviz skill's palette validator against a white chart surface.
// Single-hue magnitude charts (bar/line/area) always use chartPrimary — color there
// encodes nothing but "this app", so one hue is correct, not a missed opportunity.
// Status hues are for identity/state (paid vs pending, present vs absent) and must
// always be paired with a visible label/legend, never used as color-only signal.
export const chartPrimary = '#0B3B6E'
export const chartPrimaryMuted = '#5b84a8'

export const statusGood = '#22C55E'
export const statusWarning = '#F59E0B'
export const statusCritical = '#EF4444'
export const statusNeutral = '#94a3b8'

export const chartGridColor = '#E5EAF2'
export const chartAxisColor = '#6B7280'
export const chartTextColor = '#6B7280'
