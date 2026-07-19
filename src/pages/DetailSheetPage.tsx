import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { C, LOGO, DATA, MAIN_FOLDER, SNAPSHOT_DATE, folderUrl } from "../data";
import { GoldDivider, Section } from "../components/PortalComponents";
import { useAuth } from "../contexts/AuthContext";

export default function DetailSheetPage() {
  const [query, setQuery] = useState("");
  const filter = query.trim().toLowerCase();
  const { role, signOut } = useAuth();

  const totalFiles = useMemo(
    () =>
      DATA.reduce(
        (n, s: any) => n + (s.files?.length || 0) + (s.groups?.reduce((m: number, g: any) => m + g.files.length, 0) || 0),
        0
      ),
    []
  );

  return (
    <div className="min-h-screen" style={{ background: C.mist, color: C.ink }}>
      <div className="h-1.5" style={{ background: `linear-gradient(90deg, ${C.green}, ${C.gold}, ${C.green})` }} />

      <div className="max-w-3xl mx-auto px-4 py-7 sm:py-10">
        {/* Header akun */}
        <div className="flex items-center justify-end gap-3 text-xs mb-2" style={{ color: C.muted }}>
          <Link to="/home" className="underline" style={{ color: C.green }}>
            ← Home
          </Link>
          {role === "management" && (
            <Link to="/dashboard" className="underline font-semibold" style={{ color: C.green }}>
              Dashboard Overview
            </Link>
          )}
          <button onClick={() => signOut()} className="underline">
            Keluar
          </button>
        </div>

        <header className="text-center">
          <img
            src={LOGO}
            alt="Logo Kuttab Budi Ashari"
            className="mx-auto w-56 sm:w-64 h-auto"
            style={{ mixBlendMode: "multiply" }}
          />
          <div className="max-w-md mx-auto mt-4">
            <GoldDivider />
          </div>
          <h1
            className="text-xl sm:text-2xl font-semibold mt-3"
            style={{ color: C.green, fontFamily: "Georgia, 'Times New Roman', serif", letterSpacing: "0.02em" }}
          >
            Portal Evaluasi Kurikulum
          </h1>
          <p className="text-sm mt-2 max-w-md mx-auto" style={{ color: C.muted }}>
            Pilih dokumen kelas Anda, tekan <strong style={{ color: C.green }}>Buka & isi</strong>, lalu
            lengkapi evaluasinya langsung di Google Drive. {totalFiles} dokumen tersedia.
          </p>
        </header>

        <div className="mt-6">
          <div className="relative">
            <svg width="16" height="16" viewBox="0 0 24 24" className="absolute left-3.5 top-1/2 -translate-y-1/2">
              <circle cx="11" cy="11" r="7" fill="none" stroke={C.muted} strokeWidth="2" />
              <path d="M20 20l-3.5-3.5" stroke={C.muted} strokeWidth="2" strokeLinecap="round" />
            </svg>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Cari kelas atau dokumen… (mis. Qonuni 3)"
              className="w-full pl-10 pr-4 py-3 rounded-full text-sm outline-none focus:ring-2"
              style={{ background: "#FFF", border: `1px solid ${C.line}`, "--tw-ring-color": C.gold } as any}
              aria-label="Cari dokumen"
            />
          </div>
        </div>

        <main className="mt-6 space-y-4">
          {DATA.map((s: any) => (
            <Section key={s.no} section={s} filter={filter} />
          ))}
        </main>

        <footer className="mt-9 text-center text-xs space-y-2" style={{ color: C.muted }}>
          <div className="max-w-md mx-auto">
            <GoldDivider />
          </div>
          <p className="pt-1">
            Daftar file per {SNAPSHOT_DATE}. File baru di Drive?{" "}
            <a href={folderUrl(MAIN_FOLDER)} target="_blank" rel="noopener noreferrer" className="underline">
              Buka folder utama «7. Evaluasi Kurikulum»
            </a>
          </p>
          <p>Jika dokumen tidak bisa dibuka, minta akses ke koordinator kurikulum.</p>
          <p className="pt-1 font-semibold" style={{ color: C.green }}>Kuttab Budi Ashari</p>
        </footer>
      </div>
    </div>
  );
}
