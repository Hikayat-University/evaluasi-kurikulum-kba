import * as XLSX from "xlsx";
import { DATA } from "../data";

export interface FileMeta {
  id: string;
  name: string;
  type: "g" | "x";
  sectionNo: string;
  sectionName: string;
  groupName?: string;
}

export type CompletionStatus = "Belum" | "Sedang Berjalan" | "Lengkap";

export interface CompletionResult {
  status: CompletionStatus;
  ratio: number; // 0..1, rasio isian di badan tabel (perkiraan, bukan presisi mutlak)
  headerFilled: boolean;
  error?: string;
}

const API_KEY = import.meta.env.VITE_GOOGLE_API_KEY as string | undefined;

/**
 * Ratakan DATA (termasuk section.groups) jadi list file datar,
 * masing-masing dilengkapi info section & group asalnya.
 */
export function flattenFiles(): FileMeta[] {
  const out: FileMeta[] = [];
  for (const section of DATA as any[]) {
    if (section.files) {
      for (const f of section.files) {
        out.push({ ...f, sectionNo: section.no, sectionName: section.name });
      }
    }
    if (section.groups) {
      for (const g of section.groups) {
        for (const f of g.files) {
          out.push({ ...f, sectionNo: section.no, sectionName: section.name, groupName: g.name });
        }
      }
    }
  }
  return out;
}

/**
 * Asumsi struktur template (konsisten di semua format yang sudah dicek):
 * - baris 3 (index 2), kolom C (index 2) = nilai "Nama Guru" -> penanda identitas terisi
 * - baris 9-10 (index 8-9) biasanya header tabel (bukan data)
 * - badan data mulai baris 11 (index 10), kolom C ke kanan (kolom A/B = nomor/label)
 *
 * PENTING: satu file/spreadsheet bisa punya BANYAK tab/sheet (mis. satu tab per kelas).
 * Tiap tab WAJIB dihitung terpisah pakai aturan skip-header di atas, baru totalnya
 * dijumlah — kalau digabung dulu baru dihitung, baris header tab ke-2 dst akan
 * ketuker dianggap "data" dan bikin hasil ngaco (label kolom kehitung sebagai isian).
 */
function computeStatusFromCells(sheets: string[][][]): CompletionResult {
  let headerFilled = false;
  let total = 0;
  let filled = 0;

  for (const cells of sheets) {
    if (Boolean(cells?.[2]?.[2]?.toString().trim())) headerFilled = true;

    const bodyRows = cells.slice(10);
    for (const row of bodyRows) {
      for (let c = 2; c < Math.max(row.length, 3); c++) {
        total++;
        const v = row[c];
        if (v !== undefined && v !== null && v.toString().trim() !== "") filled++;
      }
    }
  }

  const ratio = total > 0 ? filled / total : 0;

  let status: CompletionStatus;
  if (!headerFilled && ratio === 0) status = "Belum";
  else if (ratio >= 0.5) status = "Lengkap";
  else status = "Sedang Berjalan";

  return { status, ratio, headerFilled };
}

async function getGoogleSheetCells(spreadsheetId: string): Promise<string[][][]> {
  const fields = "sheets(data(rowData(values(formattedValue))))";
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}?key=${API_KEY}&includeGridData=true&fields=${encodeURIComponent(
    fields
  )}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Sheets API error ${res.status}`);
  const json = await res.json();

  const sheetsOut: string[][][] = [];
  for (const sheet of json.sheets || []) {
    const rows: string[][] = [];
    for (const block of sheet.data || []) {
      for (const rowData of block.rowData || []) {
        const row = (rowData.values || []).map((v: any) => v?.formattedValue ?? "");
        rows.push(row);
      }
    }
    sheetsOut.push(rows);
  }
  return sheetsOut;
}

async function getXlsxCells(fileId: string): Promise<string[][][]> {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  const proxyUrl = `${supabaseUrl}/functions/v1/drive-proxy?fileId=${fileId}`;

  const res = await fetch(proxyUrl, {
    headers: { Authorization: `Bearer ${supabaseAnonKey}` },
  });
  if (!res.ok) throw new Error(`Drive proxy error ${res.status}`);
  const buf = await res.arrayBuffer();
  const wb = XLSX.read(buf, { type: "array" });

  return wb.SheetNames.map((sheetName) => {
    const sheet = wb.Sheets[sheetName];
    const rows: string[][] = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: "" });
    return rows.map((r) => r.map((c) => (c === undefined || c === null ? "" : c.toString())));
  });
}

export async function fetchCompletion(file: FileMeta): Promise<CompletionResult> {
  if (!API_KEY) {
    return { status: "Belum", ratio: 0, headerFilled: false, error: "VITE_GOOGLE_API_KEY belum di-set" };
  }
  try {
    const cells = file.type === "g" ? await getGoogleSheetCells(file.id) : await getXlsxCells(file.id);
    return computeStatusFromCells(cells);
  } catch (e: any) {
    return { status: "Belum", ratio: 0, headerFilled: false, error: e?.message || "Gagal memuat" };
  }
}

/**
 * Ambil status kelengkapan semua file secara paralel (dengan batas concurrency
 * biar tidak sekaligus nembak puluhan request bersamaan).
 */
export async function fetchAllCompletions(
  files: FileMeta[],
  concurrency = 6
): Promise<Map<string, CompletionResult>> {
  const results = new Map<string, CompletionResult>();
  let idx = 0;

  async function worker() {
    while (idx < files.length) {
      const current = files[idx++];
      results.set(current.id, await fetchCompletion(current));
    }
  }

  await Promise.all(Array.from({ length: Math.min(concurrency, files.length) }, worker));
  return results;
}
