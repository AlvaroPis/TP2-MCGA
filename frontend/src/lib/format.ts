// Las fechas de publicacion son "dias de calendario": se guardan a las 00:00 UTC y se muestran en UTC
// para que no se corran un dia por la zona horaria de Argentina (UTC-3).
export const formatDate = (iso: string): string =>
  new Date(iso).toLocaleDateString("es-AR", { timeZone: "UTC" });
