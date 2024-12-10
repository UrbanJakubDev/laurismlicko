export function formatOutputTime(time: Date) {
   return new Date(time).toLocaleTimeString('cs-CZ', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
      timeZone: 'UTC'
   })
}