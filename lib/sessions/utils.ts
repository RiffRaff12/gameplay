import { SportType, SPORT_TEMPLATES } from '@/config/sport-templates'

/**
 * Returns the next upcoming date that matches one of the sport's defaultDays.
 * If today is a match day but the session start time has already passed,
 * skip to the next occurrence.
 */
export function getNextSlot(sportType: SportType): Date {
  const template = SPORT_TEMPLATES[sportType]
  const { defaultDays, startTime } = template

  const now = new Date()
  const [startHour, startMinute] = startTime.split(':').map(Number)

  // Try from today onwards
  const candidate = new Date(now)
  candidate.setHours(0, 0, 0, 0)

  for (let offset = 0; offset < 14; offset++) {
    const testDate = new Date(candidate)
    testDate.setDate(candidate.getDate() + offset)
    const dayOfWeek = testDate.getDay()

    if (defaultDays.includes(dayOfWeek)) {
      // If it's today, check if start time has already passed
      if (offset === 0) {
        const sessionStart = new Date(testDate)
        sessionStart.setHours(startHour, startMinute, 0, 0)
        if (now >= sessionStart) {
          // Start time has passed today — skip to next occurrence
          continue
        }
      }
      return testDate
    }
  }

  // Fallback: find the next match day within 7 more days
  for (let offset = 14; offset < 21; offset++) {
    const testDate = new Date(candidate)
    testDate.setDate(candidate.getDate() + offset)
    const dayOfWeek = testDate.getDay()
    if (defaultDays.includes(dayOfWeek)) {
      return testDate
    }
  }

  // Should never reach here if defaultDays is non-empty
  return new Date()
}
