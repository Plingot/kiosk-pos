import { format } from 'date-fns'

export const formatDate = (
  date: string | Date | null,
  formatString = 'yyyy-MM-dd',
): string | null => {
  if (date) {
    try {
      return format(new Date(date), formatString)
    } catch (error) {
      console.error('Error formatting date:', error)
      return null
    }
  }
  return null
}
