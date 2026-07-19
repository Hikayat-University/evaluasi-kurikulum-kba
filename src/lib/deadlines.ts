/**
 * Jadwal pengisian per section (dari operasional Kuttab Budi Ashari):
 * - Section 1, Rencana Belajar (RPB): diisi tanggal 1-5 tiap bulan
 * - Section 2, Capaian Ilmu: diisi tiap tanggal 30
 * - Section 3, Capaian Al-Qur'an: diisi tiap hari Jum'at
 * - Section 4, Refleksi Rencana Belajar: diisi tanggal 1
 *
 * Catatan: untuk section 2 & 3 (sheet berkelanjutan, bukan file per-periode),
 * "Telat" berarti "lewat jadwal dan belum lengkap saat ini" — bukan bukti
 * bahwa belum di-update pada periode tersebut, karena tidak ada histori
 * yang disimpan.
 */
export function isOverdue(sectionNo: string, now: Date = new Date()): boolean {
  const day = now.getDate();
  const weekday = now.getDay(); // 0 = Minggu ... 5 = Jumat, 6 = Sabtu

  switch (sectionNo) {
    case "1": // RPB — batas tanggal 5
      return day > 5;
    case "2": // Capaian Ilmu — batas tanggal 30
      return day > 30;
    case "3": // Capaian Al-Qur'an — batas tiap Jumat (telat kalau sudah lewat, Sabtu/Minggu)
      return weekday === 6 || weekday === 0;
    case "4": // Refleksi — batas tanggal 1
      return day > 1;
    default:
      return false;
  }
}
