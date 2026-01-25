export interface SchedulingData {
  promisedDate: string | null
  promisedTime: string | null
  actualStartDate: string | null
  actualCompletionDate: string | null
  bayAssigned: string | null
}

export interface TimeSlot {
  time: string
  displayTime: string
  available: boolean
  reason?: 'booked' | 'unavailable' | 'blocked'
}

export interface Employee {
  id: string
  firstName: string
  lastName: string
  initials: string
  email: string
  phoneNumber: string
  role: string
  specialization: string
  isActive: boolean
}
