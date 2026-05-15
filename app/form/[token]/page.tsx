'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

type StudentData = { studentname: string; next_grade: number; };
type Subject = { id: string; label: string; pricePerMonth: number; sessionsPerWeek: number; };

const BASE_SUBJECTS: Subject[] = [
  { id: 'mtk_1x', label: 'Matematika 1×/minggu', pricePerMonth: 90000,  sessionsPerWeek: 1 },
  { id: 'mtk_2x', label: 'Matematika 2×/minggu', pricePerMonth: 170000, sessionsPerWeek: 2 },
  { id: 'ipa',    label: 'IPA',                  pricePerMonth: 80000,  sessionsPerWeek: 1 },
];

const SUBJECTS_BY_GRADE: Record<number, Subject[]> = {
  5: BASE_SUBJECTS, 6: BASE_SUBJECTS, 7: BASE_SUBJECTS,
  8: BASE_SUBJECTS, 9: BASE_SUBJECTS, 10: BASE_SUBJECTS,
  11: [
    { id: 'mtk_1x', label: 'Matematika 1×/minggu', pricePerMonth: 90000,  sessionsPerWeek: 1 },
    { id: 'mtk_2x', label: 'Matematika 2×/minggu', pricePerMonth: 170000, sessionsPerWeek: 2 },
    { id: 'fisika', label: 'Fisika',               pricePerMonth: 80000,  sessionsPerWeek: 1 },
    { id: 'kimia',  label: 'Kimia',                pricePerMonth: 80000,  sessionsPerWeek: 1 },
  ],
};

function formatRupiah(n: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n);
}

type PageState = 'loading' | 'not_found' | 'already_submitted' | 'form' | 'success' | 'error';

type AlreadySubmittedData = {
  studentname: string;
  next_grade: number;
  selected_subjects: string[];
  submitted_at: string;
};

function CoLearnLogo({ size = 30 }: { size?: number }) {
  return (
    <svg viewBox="0 0 430 90" xmlns="http://www.w3.org/2000/svg" height={size} style={{ display: 'block' }} aria-label="CoLearn">
      <text x="2" y="76" fontFamily="'Overpass', sans-serif" fontWeight="900" fontSize="82" fill="#2B5CE6">co</text>
      <polygon points="170,16 170,66 202,41" fill="#F5C518" />
      <text x="212" y="76" fontFamily="'Overpass', sans-serif" fontWeight="900" fontSize="82" fill="#2B5CE6">learn</text>
    </svg>
  );
}

function SectionHeader({ label }: { label: string }) {
  return (
    <div className="cl-section-header">
      <span className="cl-section-bar" />
      <span className="cl-section-label">{label}</span>
    </div>
  );
}

function ConfirmationView({
  studentname,
  subjects,
  selectedIds,
  isRevisit,
}: {
  studentname: string;
  subjects: Subject[];
  selectedIds: string[];
  isRevisit: boolean;
}) {
  const chosen = subjects.filter(s => selectedIds.includes(s.id));
  const total = chosen.reduce((a, s) => a + s.pricePerMonth, 0);
  const totalSessions = chosen.reduce((a, s) => a + s.sessionsPerWeek, 0);

  return (
    <div className="cl-form-wrap">
      <div className="cl-heading-block">
        <h1 className="cl-heading">Terima Kasih,<br />{studentname}!</h1>
        <p className="cl-heading-sub">
          {isRevisit
            ? 'Anda sudah mengisi form ini sebelumnya. Berikut pilihan yang tercatat.'
            : 'Pilihan mata pelajaran semester depan sudah kami terima.'}
        </p>
      </div>
      <div className="cl-card">
        <SectionHeader label="RINGKASAN PILIHAN" />
        {isRevisit && (
          <div className="cl-revisit-badge">
            ✓ Form sudah diisi — jika ada perubahan, hubungi WA Kakak Siaga
          </div>
        )}
        <table className="cl-summary-table">
          <tbody>
            {chosen.map(s => (
              <tr key={s.id}>
                <td className="cl-summary-name">{s.label}</td>
                <td className="cl-summary-price">{formatRupiah(s.pricePerMonth)}/bln</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="cl-summary-total">
              <td>Total per bulan</td>
              <td className="cl-summary-total-amt">{formatRupiah(total)}</td>
            </tr>
            <tr className="cl-summary-total">
              <td>Total kelas per minggu</td>
              <td className="cl-summary-total-amt">{totalSessions}×</td>
            </tr>
          </tfoot>
        </table>
        <div className="cl-disclaimer">
          <span className="cl-disc-icon">🔔</span>
          <p>Link pembayaran akan dikirimkan mulai <strong>22 Juni 2026</strong>.</p>
        </div>
      </div>
    </div>
  );
}

export default function FormPage() {
  const params = useParams();
  const token = params?.token as string;
  const [pageState, setPageState] = useState<PageState>('loading');
  const [student, setStudent] = useState<StudentData | null>(null);
  const [selected, setSelected] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [alreadySubmittedData, setAlreadySubmittedData] = useState<AlreadySubmittedData | null>(null);

  useEffect(() => {
    if (!token) return;
    fetch(`/api/student/${token}`)
      .then(r => r.json())
      .then(data => {
        if (data.error === 'not_found') {
          setPageState('not_found');
        } else if (data.error === 'already_submitted') {
          setAlreadySubmittedData({
            studentname: data.studentname,
            next_grade: data.next_grade,
            selected_subjects: data.selected_subjects ?? [],
            submitted_at: data.submitted_at,
          });
          setPageState('already_submitted');
        } else {
          setStudent(data);
          setPageState('form');
        }
      })
      .catch(() => setPageState('error'));
  }, [token]);

  const subjects = student
    ? (SUBJECTS_BY_GRADE[student.next_grade] ?? BASE_SUBJECTS)
    : [];
  const total = subjects.filter(s => selected.includes(s.id)).reduce((a, s) => a + s.pricePerMonth, 0);
  const totalSessions = subjects.filter(s => selected.includes(s.id)).reduce((a, s) => a + s.sessionsPerWeek, 0);

  // ✅ Validasi: IPA/Fisika/Kimia wajib dipasangkan dengan Matematika
  const hasScienceOnly =
    selected.some(id => ['ipa', 'fisika', 'kimia'].includes(id)) &&
    !selected.some(id => ['mtk_1x', 'mtk_2x'].includes(id));

  const canSubmit = selected.length > 0 && !hasScienceOnly;

  function toggle(id: string) {
    setSelected(prev => {
      if (id === 'mtk_1x') {
        const b = prev.filter(x => x !== 'mtk_2x');
        return b.includes('mtk_1x') ? b.filter(x => x !== 'mtk_1x') : [...b, 'mtk_1x'];
      }
      if (id === 'mtk_2x') {
        const b = prev.filter(x => x !== 'mtk_1x');
        return b.includes('mtk_2x') ? b.filter(x => x !== 'mtk_2x') : [...b, 'mtk_2x'];
      }
      return prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id];
    });
  }

  async function handleSubmit() {
    if (!canSubmit) return;
    setSubmitting(true); setErrorMsg('');
    try {
      const res = await fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, selected_subjects: selected }),
      });
      const data = await res.json();
      if (data.success) {
        setPageState('success');
      } else if (data.error === 'already_submitted') {
        setPageState('already_submitted');
      } else {
        setErrorMsg('Terjadi kesalahan. Silakan coba lagi.');
      }
    } catch {
      setErrorMsg('Gagal mengirim data. Periksa koneksi internet Anda.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="cl-root">
      <nav className="cl-nav">
        <CoLearnLogo size={28} />
        <span className="cl-nav-title">Formulir Intensi Belajar</span>
      </nav>

      <main className="cl-body">
        {pageState === 'loading' && (
          <div className="cl-status">
            <div className="cl-spinner" />
            <p className="cl-status-desc">Memuat data…</p>
          </div>
        )}
        {pageState === 'not_found' && (
          <div className="cl-status">
            <div className="cl-status-icon cl-status-icon--danger">✕</div>
            <h1 className="cl-status-title">Link Tidak Valid</h1>
            <p className="cl-status-desc">Link yang Anda gunakan tidak ditemukan atau sudah kadaluarsa. Hubungi kami untuk mendapatkan link yang benar.</p>
          </div>
        )}
        {pageState === 'error' && (
          <div className="cl-status">
            <div className="cl-status-icon cl-status-icon--danger">!</div>
            <h1 className="cl-status-title">Terjadi Kesalahan</h1>
            <p className="cl-status-desc">Tidak dapat memuat data. Periksa koneksi internet Anda dan muat ulang halaman.</p>
          </div>
        )}

        {pageState === 'already_submitted' && alreadySubmittedData && (
          <ConfirmationView
            studentname={alreadySubmittedData.studentname}
            subjects={SUBJECTS_BY_GRADE[alreadySubmittedData.next_grade] ?? BASE_SUBJECTS}
            selectedIds={alreadySubmittedData.selected_subjects}
            isRevisit={true}
          />
        )}

        {pageState === 'form' && student && (
          <div className="cl-form-wrap">
            <div className="cl-heading-block">
              <h1 className="cl-heading">Pilih Paket Belajar<br />Semester Depan</h1>
              <p className="cl-heading-sub">Pilihan akan digunakan sebagai dasar pengiriman link pembayaran. Pastikan sesuai kebutuhan.</p>
            </div>
            <div className="cl-card">
              <SectionHeader label="DATA MURID" />
              <div className="cl-field">
                <label className="cl-label">Nama Murid</label>
                <div className="cl-input-static">{student.studentname}</div>
              </div>
              <div className="cl-field">
                <label className="cl-label">Kelas Semester Depan</label>
                <div className="cl-input-static">Kelas {student.next_grade}</div>
              </div>
              <div className="cl-divider" />
              <SectionHeader label="PILIHAN MATA PELAJARAN" />
              <p className="cl-field-hint" style={{ marginBottom: '16px' }}>Anda dapat memilih lebih dari satu mata pelajaran.</p>
              <div className="cl-subject-list">
                {subjects.map(s => {
                  const checked = selected.includes(s.id);
                  return (
                    <button key={s.id} type="button"
                      className={`cl-subject-row${checked ? ' cl-subject-row--checked' : ''}`}
                      onClick={() => toggle(s.id)} aria-pressed={checked}>
                      <div className={`cl-checkbox${checked ? ' cl-checkbox--checked' : ''}`}>
                        {checked && <span className="cl-checkmark">✓</span>}
                      </div>
                      <span className="cl-subject-name">{s.label}</span>
                      <span className="cl-subject-price">
                        {formatRupiah(s.pricePerMonth)}<span className="cl-price-unit">/bulan</span>
                      </span>
                    </button>
                  );
                })}
              </div>
              <p className="cl-field-hint">* Matematika 1× dan 2×/minggu tidak bisa dipilih bersamaan</p>
              {/* ✅ Pesan warning science-only */}
              {hasScienceOnly && (
                <p className="cl-error">
                  IPA/Fisika/Kimia wajib diambil bersama Matematika.
                </p>
              )}
              {selected.length > 0 && (
                <div className="cl-total-row">
                  <span className="cl-total-label">Total per bulan</span>
                  <span className="cl-total-amt">{formatRupiah(total)}</span>
                </div>
              )}
              {selected.length > 0 && (
                <div className="cl-total-row">
                  <span className="cl-total-label">Total kelas per minggu</span>
                  <span className="cl-total-amt">{totalSessions}×</span>
                </div>
              )}
              <div className="cl-disclaimer">
                <span className="cl-disc-icon">🔔</span>
                <p>Link pembayaran akan dikirimkan mulai <strong>22 Juni 2026</strong> sesuai mata pelajaran yang dipilih.</p>
              </div>
              {errorMsg && <p className="cl-error">{errorMsg}</p>}
              {/* ✅ Tombol Kirim pakai canSubmit */}
              <button type="button"
                className={`cl-submit${!canSubmit || submitting ? ' cl-submit--disabled' : ''}`}
                disabled={!canSubmit || submitting} onClick={handleSubmit}>
                {submitting ? 'Mengirim…' : 'Kirim Pilihan'}
              </button>
            </div>
          </div>
        )}

        {pageState === 'success' && student && (
          <ConfirmationView
            studentname={student.studentname}
            subjects={subjects}
            selectedIds={selected}
            isRevisit={false}
          />
        )}
      </main>

      <style>{css}</style>
    </div>
  );
}

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Overpass:wght@400;600;700;800;900&family=Poppins:wght@400;500;600&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  .cl-root {
    min-height: 100vh;
    background: #ffffff;
    font-family: 'Poppins', system-ui, sans-serif;
    color: #1a1e2e;
  }

  .cl-nav {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 40px;
    height: 64px;
    border-bottom: 1px solid #E8ECF4;
    background: #ffffff;
    position: sticky;
    top: 0;
    z-index: 10;
  }

  .cl-nav-title {
    font-size: 14px;
    color: #9BA3B8;
    font-family: 'Poppins', sans-serif;
    font-weight: 400;
  }

  .cl-body {
    max-width: 780px;
    margin: 0 auto;
    padding: 48px 24px 80px;
  }

  .cl-status {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    padding: 80px 24px;
    gap: 16px;
  }

  .cl-spinner {
    width: 40px; height: 40px;
    border: 3px solid #E8ECF4;
    border-top-color: #2B5CE6;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }
  @keyframes spin { to { transform: rotate(360deg); } }

  .cl-status-icon {
    width: 60px; height: 60px;
    border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    font-size: 24px; font-weight: 700;
  }
  .cl-status-icon--ok     { background: #DCFCE7; color: #16A34A; }
  .cl-status-icon--danger { background: #FEE2E2; color: #DC2626; }

  .cl-status-title {
    font-family: 'Overpass', sans-serif;
    font-weight: 800; font-size: 26px; color: #0F172A;
  }
  .cl-status-desc {
    font-size: 15px; color: #6B7280;
    max-width: 360px; line-height: 1.65;
  }

  .cl-form-wrap { display: flex; flex-direction: column; gap: 32px; }

  .cl-heading-block { display: flex; flex-direction: column; gap: 10px; }

  .cl-heading {
    font-family: 'Overpass', sans-serif;
    font-weight: 900; font-size: 36px;
    line-height: 1.15; color: #0F172A;
    letter-spacing: -0.5px;
  }

  .cl-heading-sub {
    font-size: 15px; color: #6B7280;
    line-height: 1.6; max-width: 540px;
  }

  .cl-card {
    background: #ffffff;
    border: 1px solid #E2E8F0;
    border-radius: 16px;
    padding: 32px;
    display: flex; flex-direction: column; gap: 20px;
  }

  .cl-section-header {
    display: flex; align-items: center; gap: 10px;
  }

  .cl-section-bar {
    display: block; width: 4px; height: 18px;
    background: #2B5CE6; border-radius: 2px; flex-shrink: 0;
  }

  .cl-section-label {
    font-family: 'Overpass', sans-serif;
    font-weight: 800; font-size: 13px;
    letter-spacing: 0.8px; color: #374151;
  }

  .cl-field { display: flex; flex-direction: column; gap: 6px; }

  .cl-label {
    font-size: 14px; font-weight: 500;
    color: #374151; font-family: 'Poppins', sans-serif;
  }

  .cl-input-static {
    padding: 12px 16px;
    border: 1px solid #E2E8F0;
    border-radius: 10px;
    font-size: 15px; color: #1a1e2e;
    background: #F8FAFC;
    font-family: 'Poppins', sans-serif;
    font-weight: 500;
  }

  .cl-divider { height: 1px; background: #F1F5F9; }

  .cl-field-hint {
    font-size: 13px; color: #94A3B8;
    font-family: 'Poppins', sans-serif;
    line-height: 1.5; font-style: italic;
  }

  .cl-subject-list { display: flex; flex-direction: column; gap: 10px; }

  .cl-subject-row {
    display: flex; align-items: center; gap: 14px;
    padding: 14px 18px;
    border: 1.5px solid #E2E8F0;
    border-radius: 12px; background: #ffffff;
    cursor: pointer;
    transition: border-color 0.15s, background 0.15s;
    text-align: left; width: 100%;
  }
  .cl-subject-row:hover { border-color: #93B4F8; background: #F8FAFF; }
  .cl-subject-row--checked { border-color: #2B5CE6; background: #F0F5FF; }

  .cl-checkbox {
    width: 22px; height: 22px; border-radius: 6px;
    border: 2px solid #CBD5E1; background: #ffffff;
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0; transition: all 0.15s;
  }
  .cl-checkbox--checked { background: #2B5CE6; border-color: #2B5CE6; }

  .cl-checkmark { color: #ffffff; font-size: 13px; font-weight: 700; line-height: 1; }

  .cl-subject-name {
    flex: 1; font-size: 15px; font-weight: 500;
    color: #1a1e2e; font-family: 'Poppins', sans-serif;
  }

  .cl-subject-price {
    font-family: 'Overpass', sans-serif;
    font-weight: 700; font-size: 15px; color: #2B5CE6; white-space: nowrap;
  }

  .cl-price-unit {
    font-size: 12px; font-weight: 400;
    color: #94A3B8; font-family: 'Poppins', sans-serif;
  }

  .cl-total-row {
    display: flex; justify-content: space-between; align-items: center;
    background: #F0F5FF;
    border: 1.5px solid #C7D7FA;
    border-radius: 12px; padding: 16px 20px;
  }

  .cl-total-label {
    font-size: 14px; color: #374151;
    font-weight: 500; font-family: 'Poppins', sans-serif;
  }

  .cl-total-amt {
    font-family: 'Overpass', sans-serif;
    font-weight: 900; font-size: 22px;
    color: #2B5CE6; letter-spacing: -0.5px;
  }

  .cl-disclaimer {
    display: flex; align-items: flex-start; gap: 10px;
    background: #FFFBEB; border: 1px solid #FDE68A;
    border-radius: 10px; padding: 12px 16px;
  }
  .cl-disc-icon { font-size: 15px; flex-shrink: 0; margin-top: 1px; }
  .cl-disclaimer p {
    font-size: 13px; color: #92400E;
    line-height: 1.55; font-family: 'Poppins', sans-serif;
  }

  .cl-error {
    font-size: 13px; color: #DC2626;
    background: #FEF2F2; border-radius: 8px;
    padding: 10px 14px; font-family: 'Poppins', sans-serif;
  }

  .cl-submit {
    display: block; width: 100%;
    background: #2B5CE6; color: #ffffff;
    font-size: 16px; font-weight: 700;
    font-family: 'Overpass', sans-serif;
    letter-spacing: 0.1px; border: none;
    border-radius: 12px; padding: 16px;
    cursor: pointer;
    transition: background 0.15s, transform 0.1s;
  }
  .cl-submit:hover:not(.cl-submit--disabled) { background: #1E4BD4; transform: translateY(-1px); }
  .cl-submit:active:not(.cl-submit--disabled) { transform: translateY(0); }
  .cl-submit--disabled { background: #CBD5E1; cursor: not-allowed; }

  .cl-summary-table { width: 100%; border-collapse: collapse; font-family: 'Poppins', sans-serif; }
  .cl-summary-table tbody tr { border-bottom: 1px solid #F1F5F9; }
  .cl-summary-name { padding: 12px 0; font-size: 14px; color: #374151; }
  .cl-summary-price { padding: 12px 0; font-size: 14px; color: #2B5CE6; font-weight: 600; text-align: right; }
  .cl-summary-total { border-top: 2px solid #E2E8F0; }
  .cl-summary-total td { padding: 14px 0; font-size: 14px; font-weight: 600; color: #374151; }
  .cl-summary-total-amt {
    font-family: 'Overpass', sans-serif;
    font-weight: 900; font-size: 20px; color: #2B5CE6; text-align: right;
  }

  .cl-revisit-badge {
    background: #F0FDF4;
    border: 1px solid #BBF7D0;
    border-radius: 8px;
    padding: 10px 14px;
    font-size: 13px;
    color: #15803D;
    font-family: 'Poppins', sans-serif;
    font-weight: 500;
  }

  @media (max-width: 600px) {
    .cl-nav { padding: 0 20px; }
    .cl-body { padding: 32px 16px 60px; }
    .cl-card { padding: 24px 18px; }
    .cl-heading { font-size: 28px; }
    .cl-nav-title { display: none; }
  }
`;
