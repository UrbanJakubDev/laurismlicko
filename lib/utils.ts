export function formatOutputTime(time: Date) {
  const date = new Date(time);
  if (isNaN(date.getTime())) {
    return "-";
  }
  // The stored value is a UTC instant; toLocaleTimeString renders it
  // in the device's local timezone without any manual offset math.
  return date.toLocaleTimeString("cs-CZ", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

// Format a duration in milliseconds as HH:mm (e.g. average pause between feeds)
export function formatDuration(durationMs: number) {
  if (!Number.isFinite(durationMs) || durationMs < 0) {
    return "-";
  }
  const totalMinutes = Math.floor(durationMs / 60000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

// Get device timezone from browser as string
export function getDeviceTimeZone() {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
}
