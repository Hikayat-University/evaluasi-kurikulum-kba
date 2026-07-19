import { supabase } from "./supabaseClient";

export type ChecklistSection = "rpb" | "refleksi";

/** Peta status checklist milik satu guru: key `${section}:${fileId}` -> checked */
export async function getMyChecklist(userId: string): Promise<Map<string, boolean>> {
  const { data, error } = await supabase
    .from("fill_checklist")
    .select("file_id, section, checked")
    .eq("user_id", userId);
  if (error) throw error;

  const map = new Map<string, boolean>();
  for (const row of data || []) map.set(`${row.section}:${row.file_id}`, row.checked);
  return map;
}

export async function setChecked(
  userId: string,
  fileId: string,
  section: ChecklistSection,
  checked: boolean
): Promise<void> {
  const { error } = await supabase.from("fill_checklist").upsert(
    {
      user_id: userId,
      file_id: fileId,
      section,
      checked,
      checked_at: checked ? new Date().toISOString() : null,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id,file_id" }
  );
  if (error) throw error;
}

export interface GuruChecklistRow {
  userId: string;
  fullName: string;
  entries: Map<string, boolean>; // key `${section}:${fileId}`
}

/** Rekap checklist semua guru — hanya bisa dipanggil oleh akun management (dijaga RLS). */
export async function getAllChecklist(): Promise<GuruChecklistRow[]> {
  const { data: guruList, error: guruErr } = await supabase
    .from("profiles")
    .select("id, full_name")
    .eq("role", "guru");
  if (guruErr) throw guruErr;

  const { data: rows, error: rowsErr } = await supabase
    .from("fill_checklist")
    .select("user_id, file_id, section, checked");
  if (rowsErr) throw rowsErr;

  return (guruList || []).map((g) => {
    const entries = new Map<string, boolean>();
    for (const row of rows || []) {
      if (row.user_id === g.id) entries.set(`${row.section}:${row.file_id}`, row.checked);
    }
    return { userId: g.id, fullName: g.full_name || "(belum ada nama)", entries };
  });
}
