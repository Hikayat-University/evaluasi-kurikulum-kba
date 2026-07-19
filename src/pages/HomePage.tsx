import { useMemo } from "react";
import { Link } from "react-router-dom";
import { C, LOGO, DATA } from "../data";
import { GoldDivider } from "../components/PortalComponents";
import { useAuth } from "../contexts/AuthContext";

export default function HomePage() {
  const { role, signOut, session } = useAuth();
  const isManagement = role === "management";
  const displayName = session?.user?.email?.split("@")[0] || "";

  const stats = useMemo(() => {
    let totalFiles = 0;
    let totalKelas = 0;
    for (const section of DATA as any[]) {
      totalFiles += section.files?.length || 0;
      if (section.groups) {
        const kelasInSection = section.groups.reduce((n: number, g: any) => n + g.files.length, 0);
        totalFiles += kelasInSection;
        totalKelas = Math.max(totalKelas, kelasInSection);
      }
    }
    return { totalFiles, totalKelas, totalSection: (DATA as any[]).length };
  }, []);

  return (
    <div className="min-h-screen" style={{ background: C.mist, color: C.ink }}>
      <div className="h-1.5" style={{ background: `linear-gradient(90deg, ${C.green}, ${C.gold}, ${C.green})` }} />

      {/* Hero foto — full width, parallax di layar besar (md ke atas), scroll biasa di mobile */}
      <div className="relative h-[26rem] sm:h-[30rem] md:h-[34rem] overflow-hidden">
        <div
          className="absolute inset-0 bg-center bg-cover bg-scroll md:bg-fixed"
          style={{ backgroundImage: "url(/images/hero-banner.jpg)" }}
          aria-hidden="true"
        />
        <div className="absolute inset-0" style={{ background: "rgba(20, 40, 30, 0.58)" }} aria-hidden="true" />

        <div className="absolute top-4 right-4 sm:top-5 sm:right-6 text-xs z-10">
          <button onClick={() => signOut()} className="underline text-white/90 hover:text-white">
            Keluar
          </button>
        </div>

        <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-5 sm:px-8">
          <div className="w-16 sm:w-20 h-16 sm:h-20 rounded-full flex items-center justify-center mb-4" style={{ background: "rgba(255,255,255,0.95)" }}>
            <img src={LOGO} alt="Logo Kuttab Budi Ashari" className="w-11 sm:w-14 h-auto" style={{ mixBlendMode: "multiply" }} />
          </div>
          <h1
            className="text-2xl sm:text-3xl md:text-4xl font-semibold text-white max-w-xl"
            style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
          >
            Portal Kurikulum
            <span className="block text-lg sm:text-xl md:text-2xl mt-1" style={{ color: C.gold }}>
              Kuttab Budi Ashari
            </span>
          </h1>

          <div className="flex items-center justify-center gap-2 my-4 sm:my-5" aria-hidden="true">
            <span className="w-10 h-px" style={{ background: C.gold, opacity: 0.7 }} />
            <svg width="8" height="8" viewBox="0 0 10 10">
              <rect x="2" y="2" width="6" height="6" transform="rotate(45 5 5)" fill={C.gold} />
            </svg>
            <span className="w-10 h-px" style={{ background: C.gold, opacity: 0.7 }} />
          </div>

          <p className="text-sm sm:text-base italic max-w-md text-white/90 leading-relaxed">
            "Perjalanan panjang peradaban tidak pernah terlepas dari peran penting pendidikan.
            Dan Islam telah mencontohkan tentang arah yang senantiasa harus dipetakan."
          </p>

          <p className="text-xs sm:text-sm mt-5 max-w-sm leading-relaxed" style={{ color: C.gold }}>
            Selamat berkarya wahai Guru, semoga jejak yang abadi di sini senantiasa Allah ridhai.
          </p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-7 sm:py-10">
        <p className="text-sm text-center max-w-md mx-auto" style={{ color: C.muted }}>
          Selamat datang{displayName ? `, ${displayName}` : ""}. Pilih menu di bawah untuk melanjutkan.
        </p>

        {/* Ringkasan angka */}
        <div className="flex justify-center gap-8 sm:gap-12 mt-6">
          <StatItem value={stats.totalSection} label="Tahapan Evaluasi" />
          <StatItem value={stats.totalKelas} label="Kelas" />
          <StatItem value={stats.totalFiles} label="Dokumen" />
        </div>

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

function StatItem({ value, label }: { value: number; label: string }) {
  return (
    <div className="text-center">
      <div className="text-2xl sm:text-3xl font-bold" style={{ color: C.green, fontFamily: "Georgia, serif" }}>
        {value}
      </div>
      <div className="text-[11px] uppercase tracking-wide mt-0.5" style={{ color: C.muted }}>
        {label}
      </div>
    </div>
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
