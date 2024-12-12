export function formatOutputTime(time: Date) {
   const date = new Date(time)
   if (isNaN(date.getTime())) {
      return '-'
   }
   return date.toLocaleTimeString('cs-CZ', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
      timeZone: 'UTC'
   })
}