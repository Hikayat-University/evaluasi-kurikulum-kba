import { Link } from "react-router-dom";
import { C, LOGO } from "../data";
import { GoldDivider } from "../components/PortalComponents";
import { useAuth } from "../contexts/AuthContext";

export default function HomePage() {
  const { role, signOut, session } = useAuth();
  const isManagement = role === "management";
  const displayName = session?.user?.email?.split("@")[0] || "";

  return (
    <div className="min-h-screen" style={{ background: C.mist, color: C.ink }}>
      <div className="h-1.5" style={{ background: `linear-gradient(90deg, ${C.green}, ${C.gold}, ${C.green})` }} />

      <div className="max-w-3xl mx-auto px-4 py-7 sm:py-10">
        <div className="flex items-center justify-end gap-3 text-xs mb-2" style={{ color: C.muted }}>
          <button onClick={() => signOut()} className="underline">
            Keluar
          </button>
        </div>

        {/* Hero */}
        <header className="text-center">
          <img src={LOGO} alt="Logo Kuttab Budi Ashari" className="mx-auto w-48 sm:w-56 h-auto" style={{ mixBlendMode: "multiply" }} />
          <div className="max-w-md mx-auto mt-4">
            <GoldDivider />
          </div>
          <h1
            className="text-xl sm:text-2xl font-semibold mt-3"
            style={{ color: C.green, fontFamily: "Georgia, 'Times New Roman', serif" }}
          >
            Selamat datang{displayName ? `, ${displayName}` : ""}
          </h1>
          <p className="text-sm mt-2 max-w-md mx-auto" style={{ color: C.muted }}>
            Portal Evaluasi Kurikulum — Kuttab Budi Ashari. Pilih menu di bawah untuk melanjutkan.
          </p>
        </header>

        {/* 2 Card */}
        <main className="mt-8 grid sm:grid-cols-2 gap-4">
          {/* Card: Dashboard Overview */}
          {isManagement ? (
            <Link
              to="/dashboard"
              className="group rounded-2xl p-5 flex flex-col gap-2 transition-shadow hover:shadow-md"
              style={{ background: "#FFF", border: `1px solid ${C.line}` }}
            >
              <CardIcon />
              <span className="font-semibold" style={{ color: C.green }}>Dashboard Overview</span>
              <span className="text-sm" style={{ color: C.muted }}>
                Lihat kelengkapan pengisian evaluasi seluruh kelas secara ringkas.
              </span>
              <span className="text-xs font-semibold mt-1" style={{ color: C.gold }}>Buka →</span>
            </Link>
          ) : (
            <div
              className="relative rounded-2xl p-5 flex flex-col gap-2 cursor-not-allowed select-none"
              style={{ background: "#F4F3EE", border: `1px solid ${C.line}`, opacity: 0.7 }}
              aria-disabled="true"
              title="Khusus untuk akun Management"
            >
              <div className="absolute top-4 right-4">
                <LockIcon />
              </div>
              <CardIcon muted />
              <span className="font-semibold" style={{ color: C.muted }}>Dashboard Overview</span>
              <span className="text-sm" style={{ color: C.muted }}>
                Khusus untuk akun Management.
              </span>
            </div>
          )}

          {/* Card: Detail Sheet */}
          <Link
            to="/sheet"
            className="group rounded-2xl p-5 flex flex-col gap-2 transition-shadow hover:shadow-md"
            style={{ background: "#FFF", border: `1px solid ${C.line}` }}
          >
            <CardIcon />
            <span className="font-semibold" style={{ color: C.green }}>Detail Sheet Evaluasi</span>
            <span className="text-sm" style={{ color: C.muted }}>
              Buka & isi dokumen evaluasi kurikulum per kelas langsung di Google Drive.
            </span>
            <span className="text-xs font-semibold mt-1" style={{ color: C.gold }}>Buka →</span>
          </Link>
        </main>

        <footer className="mt-10 text-center text-xs" style={{ color: C.muted }}>
          <div className="max-w-md mx-auto mb-2">
            <GoldDivider />
          </div>
          <p className="font-semibold" style={{ color: C.green }}>Kuttab Budi Ashari</p>
        </footer>
      </div>
    </div>
  );
}

function CardIcon({ muted }: { muted?: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24">
      <rect x="3" y="3" width="7" height="7" rx="1.5" fill="none" stroke={muted ? "#9AA294" : C.gold} strokeWidth="1.6" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" fill="none" stroke={muted ? "#9AA294" : C.gold} strokeWidth="1.6" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" fill="none" stroke={muted ? "#9AA294" : C.gold} strokeWidth="1.6" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" fill="none" stroke={muted ? "#9AA294" : C.gold} strokeWidth="1.6" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24">
      <rect x="5" y="11" width="14" height="9" rx="2" fill="none" stroke={C.muted} strokeWidth="1.8" />
      <path d="M8 11V7a4 4 0 0 1 8 0v4" fill="none" stroke={C.muted} strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}
