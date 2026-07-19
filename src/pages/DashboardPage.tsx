import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { C, LOGO } from "../data";
import { GoldDivider } from "../components/PortalComponents";
import { DashboardSkeleton } from "../components/Skeleton";
import { BottomNav } from "../components/BottomNav";
import { isOverdue } from "../lib/deadlines";
import {
  flattenFiles,
  fetchAllCompletions,
  type CompletionResult,
  type FileMeta,
} from "../lib/googleData";

const STATUS_COLOR: Record<string, string> = {
  Belum: "#9AA294",
  "Sedang Berjalan": "#C79A3B",
  Telat: "#B3271C",
  Lengkap: "#1C4A33",
};

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [results, setResults] = useState<Map<string, CompletionResult>>(new Map());
  const files = useMemo(() => flattenFiles(), []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchAllCompletions(files).then((res) => {
      if (!cancelled) {
        setResults(res);
        setLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [files]);

  const bySection = useMemo(() => {
    const map = new Map<string, { name: string; files: FileMeta[] }>();
    for (const f of files) {
      if (!map.has(f.sectionNo)) map.set(f.sectionNo, { name: f.sectionName, files: [] });
      map.get(f.sectionNo)!.files.push(f);
    }
    return Array.from(map.entries()).sort((a, b) => a[0].localeCompare(b[0]));
  }, [files]);

  function sectionStats(sectionFiles: FileMeta[]) {
    let lengkap = 0,
      berjalan = 0,
      belum = 0,
      telat = 0,
      error = 0;
    for (const f of sectionFiles) {
      const r = results.get(f.id);
      if (!r) continue;
      if (r.error) {
        error++;
      } else if (r.status === "Lengkap") {
        lengkap++;
      } else if (isOverdue(f.sectionNo)) {
        telat++;
      } else if (r.status === "Sedang Berjalan") {
        berjalan++;
      } else {
        belum++;
      }
    }
    return { lengkap, berjalan, belum, telat, error, total: sectionFiles.length };
  }

  const overall = sectionStats(files);

  return (
    <div className="min-h-screen" style={{ background: C.mist, color: C.ink }}>
      <div className="h-1.5" style={{ background: `linear-gradient(90deg, ${C.green}, ${C.gold}, ${C.green})` }} />

      <div className="max-w-3xl mx-auto px-4 py-7 sm:py-10 pb-24">

        <header className="text-center">
          <img src={LOGO} alt="Logo Kuttab Budi Ashari" className="mx-auto w-44 sm:w-52 h-auto" style={{ mixBlendMode: "multiply" }} />
          <div className="max-w-md mx-auto mt-3">
            <GoldDivider />
          </div>
          <h1
            className="text-xl sm:text-2xl font-semibold mt-3"
            style={{ color: C.green, fontFamily: "Georgia, 'Times New Roman', serif" }}
          >
            Dashboard Overview
          </h1>
          <p className="text-sm mt-2 max-w-md mx-auto" style={{ color: C.muted }}>
            Kelengkapan pengisian evaluasi kurikulum, diambil langsung dari Google Sheets & Drive.
          </p>
        </header>

        {loading && <DashboardSkeleton />}

        {!loading && (
          <>
            {/* Ringkasan total */}
            <div
              className="mt-6 rounded-2xl p-4 sm:p-5"
              style={{ background: "#FFF", border: `1px solid ${C.line}` }}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-semibold" style={{ color: C.green }}>
                  Ringkasan Keseluruhan
                </span>
                <span className="text-xs" style={{ color: C.muted }}>{overall.total} dokumen</span>
              </div>
              <StatusBar stats={overall} />
              <Legend stats={overall} />
            </div>

            {/* Per section */}
            <div className="mt-4 space-y-4">
              {bySection.map(([no, s]) => {
                const stats = sectionStats(s.files);
                return (
                  <div
                    key={no}
                    className="rounded-2xl p-4 sm:p-5"
                    style={{ background: "#FFF", border: `1px solid ${C.line}` }}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-semibold" style={{ color: C.green }}>
                        {no}. {s.name}
                      </span>
                      <span className="text-xs" style={{ color: C.muted }}>{stats.total} dokumen</span>
                    </div>
                    <StatusBar stats={stats} />
                    <Legend stats={stats} />
                  </div>
                );
              })}
            </div>

            <p className="text-center text-xs mt-6" style={{ color: C.muted }}>
              Status dihitung otomatis berdasarkan rasio sel terisi & jadwal per section — perkiraan, bukan penilaian isi.
              "Telat" berarti lewat jadwal dan belum lengkap saat ini, bukan bukti belum di-update pada periode tersebut.
              Untuk detail, buka{" "}
              <Link to="/sheet" className="underline" style={{ color: C.green }}>
                halaman Detail Sheet
              </Link>
              .
            </p>
          </>
        )}
      </div>

      <BottomNav />
    </div>
  );
}

function StatusBar({ stats }: { stats: { lengkap: number; berjalan: number; belum: number; telat: number; error: number; total: number } }) {
  const { lengkap, berjalan, belum, telat, error, total } = stats;
  const denom = total || 1;
  return (
    <div className="w-full h-2.5 rounded-full overflow-hidden flex" style={{ background: C.leaf }}>
      <div style={{ width: `${(lengkap / denom) * 100}%`, background: STATUS_COLOR["Lengkap"] }} />
      <div style={{ width: `${(telat / denom) * 100}%`, background: STATUS_COLOR["Telat"] }} />
      <div style={{ width: `${(berjalan / denom) * 100}%`, background: STATUS_COLOR["Sedang Berjalan"] }} />
      <div style={{ width: `${(belum / denom) * 100}%`, background: STATUS_COLOR["Belum"] }} />
      <div style={{ width: `${(error / denom) * 100}%`, background: "#999" }} />
    </div>
  );
}

function Legend({ stats }: { stats: { lengkap: number; berjalan: number; belum: number; telat: number; error: number } }) {
  const items = [
    { label: "Lengkap", value: stats.lengkap, color: STATUS_COLOR["Lengkap"] },
    { label: "Telat", value: stats.telat, color: STATUS_COLOR["Telat"] },
    { label: "Sedang Berjalan", value: stats.berjalan, color: STATUS_COLOR["Sedang Berjalan"] },
    { label: "Belum", value: stats.belum, color: STATUS_COLOR["Belum"] },
    ...(stats.error ? [{ label: "Gagal dimuat", value: stats.error, color: "#999" }] : []),
  ];
  return (
    <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2.5 text-xs" style={{ color: C.muted }}>
      {items.map((it) => (
        <span key={it.label} className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full" style={{ background: it.color }} />
          {it.label}: {it.value}
        </span>
      ))}
    </div>
  );
}
