'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

// ─── Types ───────────────────────────────────────────────────────────────────

type StudentData = { studentname: string; next_grade: number; };

type Subject = {
  id: string;
  label: string;
  freq: string;
  pricePerMonth: number;
  sessionsPerWeek: number;
  isWajib: boolean;
};

type PaymentMode = 'bulanan' | 'semesteran';

type PageState = 'loading' | 'not_found' | 'already_submitted' | 'form' | 'success' | 'error';

type AlreadySubmittedData = {
  studentname: string;
  next_grade: number;
  selected_subjects: string[];
  submitted_at: string;
  payment_mode: PaymentMode;
};

// ─── Data ────────────────────────────────────────────────────────────────────

const WAJIB: Subject[] = [
  { id: 'mtk_1x', label: 'Matematika', freq: '1× seminggu', pricePerMonth: 90000,  sessionsPerWeek: 1, isWajib: true },
  { id: 'mtk_2x', label: 'Matematika', freq: '2× seminggu', pricePerMonth: 170000, sessionsPerWeek: 2, isWajib: true },
];

const TAMBAHAN_BASE: Subject[] = [
  { id: 'ipa',    label: 'IPA',   freq: '1× seminggu', pricePerMonth: 80000, sessionsPerWeek: 1, isWajib: false },
];

const TAMBAHAN_11: Subject[] = [
  { id: 'fisika', label: 'Fisika', freq: '1× seminggu', pricePerMonth: 80000, sessionsPerWeek: 1, isWajib: false },
  { id: 'kimia',  label: 'Kimia',  freq: '1× seminggu', pricePerMonth: 80000, sessionsPerWeek: 1, isWajib: false },
];

function getTambahan(grade: number): Subject[] {
  return grade === 11 ? TAMBAHAN_11 : TAMBAHAN_BASE;
}

function getAllSubjects(grade: number): Subject[] {
  return [...WAJIB, ...getTambahan(grade)];
}

// Pricing lookup by combination key
const MONTHLY: Record<string, number> = {
  'mtk_1x': 90000,
  'mtk_2x': 170000,
  'mtk_1x:ipa': 170000,
  'mtk_2x:ipa': 250000,
  'mtk_1x:fisika': 170000,
  'mtk_1x:kimia': 170000,
  'mtk_1x:fisika:kimia': 250000,
  'mtk_2x:fisika': 250000,
  'mtk_2x:kimia': 250000,
  'mtk_2x:fisika:kimia': 330000,
};

const SEMESTERLY_BEFORE: Record<string, number> = {
  'mtk_1x': 473226,
  'mtk_2x': 893871,
  'mtk_1x:ipa': 893871,
  'mtk_2x:ipa': 1314516,
  'mtk_1x:fisika': 893871,
  'mtk_1x:kimia': 893871,
  'mtk_1x:fisika:kimia': 1314516,
  'mtk_2x:fisika': 1314516,
  'mtk_2x:kimia': 1314516,
  'mtk_2x:fisika:kimia': 1735161,
};

const SEMESTERLY_AFTER: Record<string, number> = {
  'mtk_1x': 425903,
  'mtk_2x': 804484,
  'mtk_1x:ipa': 804484,
  'mtk_2x:ipa': 1183064,
  'mtk_1x:fisika': 804484,
  'mtk_1x:kimia': 804484,
  'mtk_1x:fisika:kimia': 1183064,
  'mtk_2x:fisika': 1183064,
  'mtk_2x:kimia': 1183064,
  'mtk_2x:fisika:kimia': 1561645,
};

function getPriceKey(selectedIds: string[]): string | null {
  const mtk = selectedIds.find(id => id === 'mtk_1x' || id === 'mtk_2x');
  if (!mtk) return null;
  const tambahan = selectedIds.filter(id => id !== 'mtk_1x' && id !== 'mtk_2x').sort();
  return tambahan.length ? `${mtk}:${tambahan.join(':')}` : mtk;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function fmt(n: number) {
  return 'Rp' + new Intl.NumberFormat('id-ID').format(Math.round(n));
}

// ─── Components ──────────────────────────────────────────────────────────────

function CoLearnLogo() {
  return (
    <img src="/CoLearn Logo Blue.svg" height={28} alt="CoLearn" style={{ display: 'block' }} />
  );
}

function ConfirmationView({
  studentname,
  grade,
  selectedIds,
  paymentMode,
  isRevisit,
}: {
  studentname: string;
  grade: number;
  selectedIds: string[];
  paymentMode: PaymentMode;
  isRevisit: boolean;
}) {
  const allSubjects = getAllSubjects(grade);
  const chosen = allSubjects.filter(s => selectedIds.includes(s.id));
  const totalSessions = chosen.reduce((a, s) => a + s.sessionsPerWeek, 0);
  const key = getPriceKey(selectedIds);
  const monthly = key ? MONTHLY[key] : null;
  const semBefore = key ? SEMESTERLY_BEFORE[key] : null;
  const semAfter  = key ? SEMESTERLY_AFTER[key]  : null;
  const isSem = paymentMode === 'semesteran';

  return (
    <div className="page-root">
      <header className="top-bar"><CoLearnLogo /></header>
      <main className="body">
        <div className="badge confirm-badge">✓ Pilihan Tercatat</div>
        <h1 className="form-title" style={{ marginBottom: 4 }}>Terima kasih, {studentname}!</h1>
        <p className="form-subtitle" style={{ marginBottom: 16 }}>
          {isRevisit
            ? 'Kamu sudah mengisi form ini sebelumnya. Berikut pilihan yang kami terima.'
            : 'Pilihan mata pelajaran semester depan sudah kami terima.'}
        </p>

        <div className="divider" />

        <p className="section-label">Ringkasan</p>
        <div className="summary-box">
          {chosen.map(s => (
            <div className="summary-item" key={s.id}>
              <span className="summary-item-name">
                {s.label}{(s.id === 'mtk_1x' || s.id === 'mtk_2x') ? ` · ${s.freq}` : ''}
              </span>
              <span className="summary-item-price">{fmt(s.pricePerMonth)}/bln</span>
            </div>
          ))}
          <div className="summary-total-row">
            <span className="summary-total-label">{isSem ? 'Total semesteran' : 'Total per bulan'}</span>
            <div className="summary-total-right">
              {isSem && semBefore && <span className="summary-strike">{fmt(semBefore)}</span>}
              <span className="summary-total-amt">{isSem ? (semAfter ? fmt(semAfter) : '—') : (monthly ? fmt(monthly) : '—')}</span>
            </div>
          </div>
          <div className="summary-meta-row">
            <span className="summary-meta-label">Total kelas per minggu</span>
            <span className="summary-meta-val">{totalSessions}× seminggu</span>
          </div>
          {isSem && (
            <div className="summary-meta-row" style={{ marginTop: 3 }}>
              <span className="summary-meta-label">Periode belajar</span>
              <span className="summary-meta-val">6 Jul – 14 Des 2026</span>
            </div>
          )}
        </div>

        <div className="notes-stack">
          <div className="note-item">
            <span className="note-icon">🕐</span>
            <span>Link pembayaran dikirim mulai <strong>22 Juni 2026</strong> sesuai mata pelajaran yang dipilih.</span>
          </div>
          {isRevisit && (
            <div className="note-item note-item--green">
              <span className="note-icon">✓</span>
              <span>Form sudah diisi — jika ada perubahan, hubungi WA Kakak Siaga.</span>
            </div>
          )}
        </div>
      </main>
      <style>{css}</style>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function FormPage() {
  const params = useParams();
  const token = params?.token as string;

  const [pageState, setPageState]   = useState<PageState>('loading');
  const [student, setStudent]       = useState<StudentData | null>(null);
  const [selectedMtk, setSelectedMtk] = useState<string | null>(null);
  const [selectedTambahan, setSelectedTambahan] = useState<string[]>([]);
  const [paymentMode, setPaymentMode] = useState<PaymentMode>('bulanan');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg]     = useState('');
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
            payment_mode: data.payment_mode ?? 'bulanan',
          });
          setPageState('already_submitted');
        } else {
          setStudent(data);
          setPageState('form');
        }
      })
      .catch(() => setPageState('error'));
  }, [token]);

  const grade = student?.next_grade ?? 0;
  const tambahan = getTambahan(grade);
  const selectedIds = selectedMtk
    ? [selectedMtk, ...selectedTambahan]
    : selectedTambahan;
  const key = getPriceKey(selectedIds);
  const monthly   = key ? MONTHLY[key]           : null;
  const semBefore = key ? SEMESTERLY_BEFORE[key]  : null;
  const semAfter  = key ? SEMESTERLY_AFTER[key]   : null;
  const isSem     = paymentMode === 'semesteran';
  const allChosen = getAllSubjects(grade).filter(s => selectedIds.includes(s.id));
  const totalSessions = allChosen.reduce((a, s) => a + s.sessionsPerWeek, 0);
  const canSubmit = !!selectedMtk;

  function toggleTambahan(id: string) {
    setSelectedTambahan(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  }

  async function handleSubmit() {
    if (!canSubmit) return;
    setSubmitting(true); setErrorMsg('');
    try {
      const res = await fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          selected_subjects: selectedIds,
          payment_mode: paymentMode,
        }),
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

  if (pageState === 'already_submitted' && alreadySubmittedData) {
    return (
      <ConfirmationView
        studentname={alreadySubmittedData.studentname}
        grade={alreadySubmittedData.next_grade}
        selectedIds={alreadySubmittedData.selected_subjects}
        paymentMode={alreadySubmittedData.payment_mode}
        isRevisit={true}
      />
    );
  }

  if (pageState === 'success' && student) {
    return (
      <ConfirmationView
        studentname={student.studentname}
        grade={grade}
        selectedIds={selectedIds}
        paymentMode={paymentMode}
        isRevisit={false}
      />
    );
  }

  return (
    <div className="page-root">
      <header className="top-bar"><CoLearnLogo /></header>

      <main className="body">

        {pageState === 'loading' && (
          <div className="status-wrap">
            <div className="spinner" />
            <p className="status-desc">Memuat data…</p>
          </div>
        )}

        {pageState === 'not_found' && (
          <div className="status-wrap">
            <div className="status-icon status-icon--danger">✕</div>
            <h1 className="status-title">Link Tidak Valid</h1>
            <p className="status-desc">Link yang kamu gunakan tidak ditemukan atau sudah kadaluarsa. Hubungi kami untuk mendapatkan link yang benar.</p>
          </div>
        )}

        {pageState === 'error' && (
          <div className="status-wrap">
            <div className="status-icon status-icon--danger">!</div>
            <h1 className="status-title">Terjadi Kesalahan</h1>
            <p className="status-desc">Tidak dapat memuat data. Periksa koneksi internet dan muat ulang halaman.</p>
          </div>
        )}

        {pageState === 'form' && student && (
          <>
            {/* ── Header ── */}
            <p className="form-title">Pendaftaran Minat Semester Depan</p>
            <p className="form-subtitle">Kelas mulai 6 Juli 2026</p>
            <div className="student-info">
              <div className="student-info-row">
                <span className="info-label">Nama</span>
                <span className="info-value">{student.studentname}</span>
              </div>
              <div className="student-info-row">
                <span className="info-label">Kelas</span>
                <span className="info-value">Kelas {student.next_grade}</span>
              </div>
            </div>
            <p className="form-desc">
              Isi form ini agar kami dapat mengirimkan link pembayaran yang sesuai dengan pilihan. Form ini hanyalah pendataan, bukan pembayaran.
            </p>

            <div className="divider" />

            {/* ── Mata Pelajaran ── */}
            <p className="section-label">Mata Pelajaran</p>

            <p className="subsection-label">Mata Pelajaran Wajib</p>
            <p className="subsection-hint">Pilih salah satu</p>
            <div className="subject-list">
              {WAJIB.map(s => (
                <button
                  key={s.id}
                  type="button"
                  className={`radio-item${selectedMtk === s.id ? ' selected' : ''}`}
                  onClick={() => setSelectedMtk(s.id)}
                  aria-pressed={selectedMtk === s.id}
                >
                  <div className="radio-circle"><div className="radio-dot" /></div>
                  <div className="subject-text">
                    <span className="subject-name">{s.label}</span>
                    <span className="subject-freq">{s.freq}</span>
                  </div>
                </button>
              ))}
            </div>

            <div className="group-divider" />

            <p className="subsection-label">Mata Pelajaran Tambahan</p>
            <p className="subsection-hint">Opsional, boleh pilih lebih dari satu</p>
            <div className="subject-list">
              {tambahan.map(s => {
                const checked = selectedTambahan.includes(s.id);
                return (
                  <button
                    key={s.id}
                    type="button"
                    className={`check-item${checked ? ' checked' : ''}`}
                    onClick={() => toggleTambahan(s.id)}
                    aria-pressed={checked}
                  >
                    <div className="check-box">
                      {checked && <span className="check-mark">✓</span>}
                    </div>
                    <div className="subject-text">
                      <span className="subject-name">{s.label}</span>
                      <span className="subject-freq">{s.freq}</span>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="divider" />

            {/* ── Pilihan Pembayaran ── */}
            <p className="section-label">Pilihan Pembayaran</p>
            <div className="subject-list">
              <button
                type="button"
                className={`radio-item${paymentMode === 'bulanan' ? ' selected' : ''}`}
                onClick={() => setPaymentMode('bulanan')}
              >
                <div className="radio-circle"><div className="radio-dot" /></div>
                <div className="subject-text">
                  <span className="subject-name">Bulanan</span>
                </div>
              </button>
              <button
                type="button"
                className={`radio-item${paymentMode === 'semesteran' ? ' selected' : ''}`}
                onClick={() => setPaymentMode('semesteran')}
              >
                <div className="radio-circle"><div className="radio-dot" /></div>
                <div className="subject-text">
                  <span className="subject-name">
                    Semesteran <span className="early-badge">Diskon 10%</span>
                  </span>
                  <span className="subject-freq">Berlaku hingga 6 Jul 2026</span>
                </div>
              </button>
            </div>

            <div className="divider" />

            {/* ── Ringkasan ── */}
            <p className="section-label">Ringkasan</p>
            <div className="summary-box">
              {!selectedMtk ? (
                <p className="summary-empty">Belum ada mata pelajaran yang dipilih.</p>
              ) : (
                <>
                  {allChosen.map(s => (
                    <div className="summary-item" key={s.id}>
                      <span className="summary-item-name">
                        {s.label}{(s.id === 'mtk_1x' || s.id === 'mtk_2x') ? ` · ${s.freq}` : ''}
                      </span>
                      <span className="summary-item-price">{fmt(s.pricePerMonth)}/bln</span>
                    </div>
                  ))}
                  <div className="summary-total-row">
                    <span className="summary-total-label">
                      {isSem ? 'Total semesteran' : 'Total per bulan'}
                    </span>
                    <div className="summary-total-right">
                      {isSem && semBefore && (
                        <span className="summary-strike">{fmt(semBefore)}</span>
                      )}
                      <span className="summary-total-amt">
                        {isSem ? (semAfter ? fmt(semAfter) : '—') : (monthly ? fmt(monthly) : '—')}
                      </span>
                    </div>
                  </div>
                  <div className="summary-meta-row">
                    <span className="summary-meta-label">Total kelas per minggu</span>
                    <span className="summary-meta-val">{totalSessions}× seminggu</span>
                  </div>
                  {isSem && (
                    <div className="summary-meta-row" style={{ marginTop: 3 }}>
                      <span className="summary-meta-label">Periode belajar</span>
                      <span className="summary-meta-val">6 Jul – 14 Des 2026</span>
                    </div>
                  )}
                </>
              )}
            </div>

            <div className="notes-stack">
              <div className="note-item">
                <span className="note-icon">🕐</span>
                <span>Link pembayaran dikirim mulai <strong>22 Juni 2026</strong> sesuai mata pelajaran yang dipilih.</span>
              </div>
            </div>

            {errorMsg && <p className="error-msg">{errorMsg}</p>}

            <button
              type="button"
              className={`btn-submit${!canSubmit || submitting ? ' btn-submit--disabled' : ''}`}
              disabled={!canSubmit || submitting}
              onClick={handleSubmit}
            >
              {submitting ? 'Mengirim…' : 'Kirim Pilihan'}
            </button>
          </>
        )}
      </main>
      <style>{css}</style>
    </div>
  );
}

// ─── CSS ─────────────────────────────────────────────────────────────────────

const css = `
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  .page-root {
    min-height: 100vh; background: #ffffff;
    font-family: system-ui, -apple-system, sans-serif; color: #1a1a1a;
  }

  .top-bar {
    display: flex; align-items: center;
    padding: 12px 20px; border-bottom: 0.5px solid #e5e7eb;
  }

  .body {
    max-width: 480px; margin: 0 auto;
    padding: 20px 20px 80px; display: flex; flex-direction: column;
  }

  /* Header */
  .form-title { font-size: 17px; font-weight: 600; color: #111827; line-height: 1.3; }
  .form-subtitle { font-size: 12px; color: #9ca3af; margin-top: 4px; margin-bottom: 16px; }
  .student-info {
    background: #f9fafb; border-radius: 10px;
    padding: 12px 14px; margin-bottom: 14px;
    display: flex; flex-direction: column; gap: 6px;
  }
  .student-info-row { display: flex; gap: 6px; align-items: baseline; }
  .info-label { font-size: 11px; color: #9ca3af; width: 44px; flex-shrink: 0; }
  .info-value { font-size: 13px; color: #111827; font-weight: 500; }
  .form-desc {
    font-size: 12px; color: #6b7280; line-height: 1.6;
    padding: 10px 12px; background: #f0f5ff;
    border-left: 3px solid #2B5CE6; border-radius: 0 8px 8px 0;
  }

  .divider { height: 0.5px; background: #e5e7eb; margin: 18px 0; }

  .section-label {
    font-size: 11px; font-weight: 500; color: #9ca3af;
    letter-spacing: 0.07em; text-transform: uppercase; margin-bottom: 10px;
  }
  .subsection-label { font-size: 12px; font-weight: 600; color: #374151; margin-bottom: 6px; }
  .subsection-hint { font-size: 11px; color: #9ca3af; margin-bottom: 10px; }
  .group-divider { height: 0.5px; background: #e5e7eb; margin: 14px 0; }

  /* Subject list */
  .subject-list { display: flex; flex-direction: column; }

  /* Radio items */
  .radio-item {
    display: flex; align-items: center; gap: 12px;
    padding: 12px 0; border: none; border-bottom: 0.5px solid #f3f4f6;
    background: transparent; cursor: pointer; text-align: left; width: 100%;
  }
  .radio-item:last-of-type { border-bottom: none; }
  .radio-circle {
    width: 20px; height: 20px; border-radius: 50%;
    border: 1.5px solid #d1d5db; display: flex; align-items: center;
    justify-content: center; flex-shrink: 0; background: #fff;
  }
  .radio-item.selected .radio-circle { border-color: #2B5CE6; }
  .radio-dot {
    width: 10px; height: 10px; border-radius: 50%;
    background: #2B5CE6; display: none;
  }
  .radio-item.selected .radio-dot { display: block; }

  /* Checkbox items */
  .check-item {
    display: flex; align-items: center; gap: 12px;
    padding: 12px 0; border: none; border-bottom: 0.5px solid #f3f4f6;
    background: transparent; cursor: pointer; text-align: left; width: 100%;
  }
  .check-item:last-of-type { border-bottom: none; }
  .check-box {
    width: 20px; height: 20px; border-radius: 5px;
    border: 1.5px solid #d1d5db; display: flex; align-items: center;
    justify-content: center; flex-shrink: 0; background: #fff;
  }
  .check-item.checked .check-box { background: #2B5CE6; border-color: #2B5CE6; }
  .check-mark { color: #fff; font-size: 11px; font-weight: 700; line-height: 1; }

  .subject-text { display: flex; flex-direction: column; gap: 2px; }
  .subject-name { font-size: 14px; color: #111827; }
  .subject-freq { font-size: 12px; color: #9ca3af; }

  .early-badge {
    display: inline-block; font-size: 10px; font-weight: 500;
    color: #b45309; background: #fef3c7; border-radius: 4px;
    padding: 2px 6px; margin-left: 6px; vertical-align: middle;
  }

  /* Summary */
  .summary-box {
    background: #f9fafb; border-radius: 12px;
    padding: 14px 16px; min-height: 52px;
  }
  .summary-empty { font-size: 13px; color: #9ca3af; }
  .summary-item {
    display: flex; justify-content: space-between; align-items: baseline;
    margin-bottom: 3px;
  }
  .summary-item:last-of-type { margin-bottom: 0; }
  .summary-item-name { font-size: 12px; color: #9ca3af; }
  .summary-item-price { font-size: 12px; color: #9ca3af; }

  .summary-total-row {
    display: flex; justify-content: space-between; align-items: flex-end;
    padding-top: 10px; margin-top: 10px; border-top: 0.5px solid #e5e7eb;
  }
  .summary-total-label { font-size: 12px; color: #6b7280; }
  .summary-total-right { display: flex; flex-direction: column; align-items: flex-end; gap: 2px; }
  .summary-strike { font-size: 11px; color: #d1d5db; text-decoration: line-through; }
  .summary-total-amt { font-size: 18px; font-weight: 500; color: #111827; }

  .summary-meta-row {
    display: flex; justify-content: space-between; margin-top: 5px;
  }
  .summary-meta-label { font-size: 11px; color: #9ca3af; }
  .summary-meta-val { font-size: 11px; color: #9ca3af; }

  /* Notes */
  .notes-stack { margin-top: 12px; display: flex; flex-direction: column; gap: 8px; }
  .note-item {
    display: flex; gap: 8px; align-items: flex-start;
    font-size: 12px; color: #6b7280; line-height: 1.6;
  }
  .note-item--green { color: #15803d; }
  .note-icon { font-size: 13px; margin-top: 1px; flex-shrink: 0; }

  /* Button */
  .btn-submit {
    width: 100%; padding: 14px; background: #2B5CE6; color: #fff;
    border: none; border-radius: 10px; font-size: 15px; font-weight: 500;
    cursor: pointer; margin-top: 20px; transition: background 0.15s;
  }
  .btn-submit:hover:not(.btn-submit--disabled) { background: #1E4BD4; }
  .btn-submit--disabled { background: #e5e7eb; color: #9ca3af; cursor: not-allowed; }

  .error-msg {
    font-size: 13px; color: #dc2626; background: #fef2f2;
    border-radius: 8px; padding: 10px 14px; margin-top: 12px;
  }

  /* Confirmation badge */
  .confirm-badge {
    color: #15803d; background: #f0fdf4; margin-bottom: 12px;
  }

  /* Status pages */
  .status-wrap {
    display: flex; flex-direction: column; align-items: center;
    text-align: center; padding: 80px 24px; gap: 16px;
  }
  .spinner {
    width: 36px; height: 36px;
    border: 2.5px solid #e5e7eb; border-top-color: #2B5CE6;
    border-radius: 50%; animation: spin 0.8s linear infinite;
  }
  @keyframes spin { to { transform: rotate(360deg); } }
  .status-icon {
    width: 56px; height: 56px; border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    font-size: 22px; font-weight: 700;
  }
  .status-icon--danger { background: #fee2e2; color: #dc2626; }
  .status-title { font-size: 22px; font-weight: 500; color: #111827; }
  .status-desc { font-size: 14px; color: #6b7280; max-width: 320px; line-height: 1.65; }
`;
