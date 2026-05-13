export type SportType = 'football' | 'futsal'

export type SportTemplate = {
  capacity: number
  pricePerPax: number
  defaultDays: number[]  // 0=Sun, 1=Mon, ..., 6=Sat
  startTime: string      // "HH:MM"
  endTime: string        // "HH:MM"
}

export const SPORT_TEMPLATES: Record<SportType, SportTemplate> = {
  futsal: { capacity: 20, pricePerPax: 15, defaultDays: [2, 5], startTime: "20:00", endTime: "22:00" },
  football: { capacity: 21, pricePerPax: 25, defaultDays: [0], startTime: "20:00", endTime: "21:30" },
}
