export function formatOutputTime(time: Date) {
  const date = new Date(time);
  if (isNaN(date.getTime())) {
    return "-";
  }
  // Convert the date to Prague timezone
  const pragueDate = new Date(
    date.getTime() + date.getTimezoneOffset() * 60000
  );
  return pragueDate.toLocaleTimeString("cs-CZ", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

// Get device timezone from browser as string
export function getDeviceTimeZone() {
  return "Europe/Prague";
}
