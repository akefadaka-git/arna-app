export interface AppointmentWorkspaceLabels {
  readonly pageTitle: string;
  readonly pageDescription: string;
  readonly requestAppointment: string;
  readonly calendar: string;
  readonly scope: string;
  readonly personal: string;
  readonly corporate: string;
  readonly hostUserId: string;
  readonly attendees: string;
  readonly title: string;
  readonly description: string;
  readonly date: string;
  readonly year: string;
  readonly month: string;
  readonly day: string;
  readonly startsAt: string;
  readonly endsAt: string;
  readonly checkAvailability: string;
  readonly available: string;
  readonly unavailable: string;
  readonly book: string;
  readonly save: string;
  readonly cancel: string;
  readonly confirm: string;
  readonly decline: string;
  readonly status: string;
  readonly appointments: string;
  readonly emptyTitle: string;
  readonly emptyDescription: string;
  readonly loading: string;
  readonly noCalendars: string;
  readonly hostHint: string;
  readonly attendeesHint: string;
  readonly requested: string;
  readonly confirmed: string;
  readonly declined: string;
  readonly cancelled: string;
  readonly personalLabel: string;
  readonly corporateLabel: string;
  readonly timezone: string;
  readonly successBooked: string;
  readonly successUpdated: string;
  readonly reschedule: string;
  readonly proposeTime: string;
  readonly proposalReason: string;
  readonly acceptProposal: string;
  readonly declineProposal: string;
  readonly withdrawProposal: string;
  readonly proposalStatus: string;
  readonly proposed: string;
  readonly accepted: string;
  readonly withdrawn: string;
  readonly rescheduleProposed: string;
}

export const appointmentWorkspaceLabels: AppointmentWorkspaceLabels = {
  pageTitle: 'የቀጠሮ ማስያዣ',
  pageDescription: 'ለግል እና ለድርጅት ቀጠሮዎች ተገኝነትን ይፈትሹ፣ ይመዝግቡ እና ያረጋግጡ።',
  requestAppointment: 'ቀጠሮ ይጠይቁ',
  calendar: 'የቀን መቁጠሪያ',
  scope: 'የቀጠሮ ወሰን',
  personal: 'የግል',
  corporate: 'የድርጅት',
  hostUserId: 'የአስተናጋጅ ተጠቃሚ መለያ',
  attendees: 'ተጨማሪ ተሳታፊዎች (መለያዎች በኮማ ይለዩ)',
  title: 'የቀጠሮ ርዕስ',
  description: 'መግለጫ',
  date: 'ቀን (ዓ.ም.)',
  year: 'ዓመት',
  month: 'ወር',
  day: 'ቀን',
  startsAt: 'የመጀመሪያ ሰዓት',
  endsAt: 'የመጨረሻ ሰዓት',
  checkAvailability: 'ተገኝነት ይፈትሹ',
  available: 'ይህ ጊዜ ይገኛል።',
  unavailable: 'በዚህ ጊዜ ግጭት ተገኝቷል።',
  book: 'ቀጠሮውን ያስይዙ',
  save: 'አስቀምጥ',
  cancel: 'ሰርዝ',
  confirm: 'አረጋግጥ',
  decline: 'እምቢ በል',
  status: 'ሁኔታ',
  appointments: 'የተመዘገቡ ቀጠሮዎች',
  emptyTitle: 'ቀጠሮ የለም',
  emptyDescription: 'አዲስ ቀጠሮ ይጠይቁ።',
  loading: 'በመጫን ላይ…',
  noCalendars: 'ሊጠቀሙበት የሚችሉት የቀን መቁጠሪያ የለም።',
  hostHint: 'አስተናጋጁ በአሁኑ ተቋም ውስጥ ንቁ አባል መሆን አለበት።',
  attendeesHint: 'ሁሉም ተሳታፊዎች በአሁኑ ተቋም ውስጥ ንቁ አባላት መሆን አለባቸው።',
  requested: 'ተጠይቋል',
  confirmed: 'ተረጋግጧል',
  declined: 'ውድቅ ተደርጓል',
  cancelled: 'ተሰርዟል',
  personalLabel: 'የግል ቀጠሮ',
  corporateLabel: 'የድርጅት ቀጠሮ',
  timezone: 'የሰዓት ክልል',
  successBooked: 'የቀጠሮ ጥያቄ ተልኳል።',
  successUpdated: 'የቀጠሮ ሁኔታ ተዘምኗል።',
  reschedule: 'ቀጠሮውን ያስተካክሉ',
  proposeTime: 'አዲስ ሰዓት ያቅርቡ',
  proposalReason: 'የለውጡ ምክንያት (አማራጭ)',
  acceptProposal: 'አዲሱን ሰዓት ተቀበል',
  declineProposal: 'ውድቅ አድርግ',
  withdrawProposal: 'ጥያቄውን መልስ',
  proposalStatus: 'የለውጥ ጥያቄ',
  proposed: 'ቀርቧል',
  accepted: 'ተቀብሏል',
  withdrawn: 'ተመልሷል',
  rescheduleProposed: 'የቀጠሮ አዲስ ሰዓት ቀርቧል።',
};

export const appointmentWorkspaceEnglishLabels: AppointmentWorkspaceLabels = {
  pageTitle: 'Appointments',
  pageDescription: 'Check availability, request and confirm shared personal and corporate appointments.',
  requestAppointment: 'Request appointment',
  calendar: 'Calendar',
  scope: 'Appointment scope',
  personal: 'Personal',
  corporate: 'Corporate',
  hostUserId: 'Host user ID',
  attendees: 'Additional attendees (comma-separated user IDs)',
  title: 'Appointment title',
  description: 'Description',
  date: 'Date (E.C.)',
  year: 'Year',
  month: 'Month',
  day: 'Day',
  startsAt: 'Starts at',
  endsAt: 'Ends at',
  checkAvailability: 'Check availability',
  available: 'This slot is available.',
  unavailable: 'A scheduling conflict was found.',
  book: 'Request booking',
  save: 'Save',
  cancel: 'Cancel',
  confirm: 'Confirm',
  decline: 'Decline',
  status: 'Status',
  appointments: 'Your appointments',
  emptyTitle: 'No appointments',
  emptyDescription: 'Request a new appointment to get started.',
  loading: 'Loading…',
  noCalendars: 'No calendars are available to you.',
  hostHint: 'The host must be an active member of the current tenant.',
  attendeesHint: 'All attendees must be active members of the current tenant.',
  requested: 'Requested',
  confirmed: 'Confirmed',
  declined: 'Declined',
  cancelled: 'Cancelled',
  personalLabel: 'Personal appointment',
  corporateLabel: 'Corporate appointment',
  timezone: 'Time zone',
  successBooked: 'Appointment request sent.',
  successUpdated: 'Appointment status updated.',
  reschedule: 'Reschedule',
  proposeTime: 'Propose new time',
  proposalReason: 'Reason for change (optional)',
  acceptProposal: 'Accept new time',
  declineProposal: 'Decline',
  withdrawProposal: 'Withdraw proposal',
  proposalStatus: 'Reschedule proposal',
  proposed: 'Pending',
  accepted: 'Accepted',
  withdrawn: 'Withdrawn',
  rescheduleProposed: 'New appointment time proposed.',
};
