import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { C, LOGO, RPB_FILES, REFLEKSI_FILES, fileUrl } from "../data";
import { GoldDivider } from "../components/PortalComponents";
import { BottomNav } from "../components/BottomNav";
import { PageLoadingSkeleton } from "../components/Skeleton";
import { useAuth } from "../contexts/AuthContext";
import { getMyChecklist, setChecked, getAllChecklist, type GuruChecklistRow } from "../lib/checklist";

export default function RpbPage() {
  const { role } = useAuth();

  return (
    <div className="min-h-screen" style={{ background: C.mist, color: C.ink }}>
      <div className="h-1.5" style={{ background: `linear-gradient(90deg, ${C.green}, ${C.gold}, ${C.green})` }} />

      <div className="max-w-3xl mx-auto px-4 py-7 sm:py-10 pb-24">
        <div className="mb-2">
          <Link to="/home" className="text-xs underline" style={{ color: C.green }}>
            ← Home
          </Link>
        </div>

        <header className="text-center">
          <img src={LOGO} alt="Logo Kuttab Budi Ashari" className="mx-auto w-40 sm:w-48 h-auto" style={{ mixBlendMode: "multiply" }} />
          <div className="max-w-md mx-auto mt-3">
            <GoldDivider />
          </div>
          <h1
            className="text-xl sm:text-2xl font-semibold mt-3"
            style={{ color: C.green, fontFamily: "Georgia, 'Times New Roman', serif" }}
          >
            Rencana Pembelajaran Guru
          </h1>
          <p className="text-sm mt-2 max-w-md mx-auto" style={{ color: C.muted }}>
            {role === "management"
              ? "Rekap checklist pengisian RPB & Refleksi seluruh guru."
              : "Isi RPB bulanan & refleksi di sheet-nya, lalu centang kalau sudah selesai."}
          </p>
        </header>

        <main className="mt-6">
          {role === "management" ? <ManagementView /> : <GuruView />}
        </main>
      </div>

      <BottomNav />
    </div>
  );
}

/* ————————————————————— Tampilan Guru ————————————————————— */

function GuruView() {
  const { session } = useAuth();
  const userId = session?.user?.id;
  const [checklist, setChecklist] = useState<Map<string, boolean> | null>(null);
  const [saving, setSaving] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) return;
    getMyChecklist(userId).then(setChecklist);
  }, [userId]);

  async function toggle(fileId: string, section: "rpb" | "refleksi", current: boolean) {
    if (!userId) return;
    const key = `${section}:${fileId}`;
    setSaving(key);
    try {
      await setChecked(userId, fileId, section, !current);
      setChecklist((prev) => {
        const next = new Map(prev);
        next.set(key, !current);
        return next;
      });
    } finally {
      setSaving(null);
    }
  }

  if (!checklist) return <PageLoadingSkeleton />;

  return (
    <div className="space-y-6">
      <ChecklistGroup
        title="Rencana Pembelajaran Bulanan (RPB)"
        files={RPB_FILES}
        section="rpb"
        checklist={checklist}
        saving={saving}
        onToggle={toggle}
      />
      <ChecklistGroup
        title="Refleksi Rencana Belajar"
        files={REFLEKSI_FILES}
        section="refleksi"
        checklist={checklist}
        saving={saving}
        onToggle={toggle}
      />
    </div>
  );
}

function ChecklistGroup({
  title,
  files,
  section,
  checklist,
  saving,
  onToggle,
}: {
  title: string;
  files: { id: string; name: string }[];
  section: "rpb" | "refleksi";
  checklist: Map<string, boolean>;
  saving: string | null;
  onToggle: (fileId: string, section: "rpb" | "refleksi", current: boolean) => void;
}) {
  return (
    <div>
      <h2 className="text-sm font-bold uppercase tracking-[0.14em] mb-2.5 px-1" style={{ color: C.green }}>
        {title}
      </h2>
      <div className="space-y-2">
        {files.map((f) => {
          const key = `${section}:${f.id}`;
          const checked = checklist.get(key) || false;
          const isSaving = saving === key;
          return (
            <div
              key={f.id}
              className="flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-xl"
              style={{ background: "#FFF", border: `1px solid ${C.line}` }}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <button
                  onClick={() => onToggle(f.id, section, checked)}
                  disabled={isSaving}
                  className="w-5 h-5 rounded-md flex items-center justify-center shrink-0"
                  style={{
                    background: checked ? C.green : "#FFF",
                    border: `1.5px solid ${checked ? C.green : C.line}`,
                  }}
                  aria-label={checked ? "Tandai belum selesai" : "Tandai sudah selesai"}
                >
                  {checked && (
                    <svg width="12" height="12" viewBox="0 0 24 24">
                      <path d="M5 12l5 5 9-9" fill="none" stroke="#FFF" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </button>
                <span className="text-sm truncate" style={{ color: C.ink }}>{f.name}</span>
              </div>
              <a
                href={fileUrl(f.id)}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-semibold px-3.5 py-1.5 rounded-full whitespace-nowrap"
                style={{ background: C.green, color: "#FFF" }}
              >
                Buka & isi
              </a>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ————————————————————— Tampilan Management ————————————————————— */

function ManagementView() {
  const [rows, setRows] = useState<GuruChecklistRow[] | null>(null);

  useEffect(() => {
    getAllChecklist().then(setRows);
  }, []);

  if (!rows) return <PageLoadingSkeleton />;

  if (rows.length === 0) {
    return (
      <p className="text-sm text-center" style={{ color: C.muted }}>
        Belum ada akun guru yang terdaftar.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {rows.map((g) => (
        <div key={g.userId} className="rounded-2xl p-4 sm:p-5" style={{ background: "#FFF", border: `1px solid ${C.line}` }}>
          <div className="font-semibold mb-3" style={{ color: C.green }}>{g.fullName}</div>
          <MiniChecklistRow label="RPB" section="rpb" files={RPB_FILES} entries={g.entries} />
          <MiniChecklistRow label="Refleksi" section="refleksi" files={REFLEKSI_FILES} entries={g.entries} />
        </div>
      ))}
      <p className="text-xs px-1" style={{ color: C.muted }}>
        Checklist ini diisi manual oleh masing-masing guru saat mereka menandai sudah selesai —
        bukan deteksi otomatis dari isi sheet.
      </p>
    </div>
  );
}

function MiniChecklistRow({
  label,
  section,
  files,
  entries,
}: {
  label: string;
  section: "rpb" | "refleksi";
  files: { id: string; name: string }[];
  entries: Map<string, boolean>;
}) {
  return (
    <div className="flex items-center gap-2 flex-wrap mb-1.5 last:mb-0">
      <span className="text-xs font-semibold w-16 shrink-0" style={{ color: C.muted }}>{label}</span>
      <div className="flex gap-1.5 flex-wrap">
        {files.map((f) => {
          const checked = entries.get(`${section}:${f.id}`) || false;
          return (
            <span
              key={f.id}
              title={f.name}
              className="w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-bold"
              style={{
                background: checked ? C.green : C.leaf,
                color: checked ? "#FFF" : C.muted,
              }}
            >
              {f.name.slice(0, 1)}
            </span>
          );
        })}
      </div>
    </div>
  );
}
