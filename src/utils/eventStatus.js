/**
 * Compute event status dynamically based on event date vs today.
 * Returns "upcoming" if the event is today or in the future,
 * returns "past" if the event has already passed.
 */
export function getEventStatus(event) {
  if (!event) return "upcoming";
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  // Use endDate if available, otherwise fall back to date
  const dateStr = event.endDate || event.date;
  if (!dateStr) return "upcoming";
  const eventDate = new Date(dateStr + "T00:00:00");
  return eventDate < today ? "past" : "upcoming";
}

/**
 * Apakah event ini bisa menyewa fotografer?
 * Otomatis: hanya event yang akan datang yang bisa sewa fotografer.
 */
export function canSewaFotografer(event) {
  return getEventStatus(event) === "upcoming";
}

/**
 * Apakah event ini bisa membeli foto?
 * Otomatis: hanya event yang sudah lewat yang bisa beli foto.
 */
export function canBeliFoto(event) {
  return getEventStatus(event) === "past";
}
