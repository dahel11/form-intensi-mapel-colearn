'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

type StudentData = { studentname: string; next_grade: number; };
type Subject = { id: string; label: string; pricePerMonth: number; sessionsPerWeek: number; };

const BASE_SUBJECTS: Subject[] = [
  { id: 'mtk_1x', label: 'Matematika', pricePerMonth: 90000,  sessionsPerWeek: 1 },
  { id: 'mtk_2x', label: 'Matematika', pricePerMonth: 170000, sessionsPerWeek: 2 },
  { id: 'ipa',    label: 'IPA',        pricePerMonth: 80000,  sessionsPerWeek: 1 },
];

const SUBJECTS_BY_GRADE: Record<number, Subject[]> = {
  5: BASE_SUBJECTS, 6: BASE_SUBJECTS, 7: BASE_SUBJECTS,
  8: BASE_SUBJECTS, 9: BASE_SUBJECTS, 10: BASE_SUBJECTS,
  11: [
    { id: 'mtk_1x', label: 'Matematika', pricePerMonth: 90000,  sessionsPerWeek: 1 },
    { id: 'mtk_2x', label: 'Matematika', pricePerMonth: 170000, sessionsPerWeek: 2 },
    { id: 'fisika', label: 'Fisika',     pricePerMonth: 80000,  sessionsPerWeek: 1 },
    { id: 'kimia',  label: 'Kimia',      pricePerMonth: 80000,  sessionsPerWeek: 1 },
  ],
};

function getFreqLabel(id: string): string {
  if (id === 'mtk_1x') return '1× seminggu';
  if (id === 'mtk_2x') return '2× seminggu';
  return '1× seminggu';
}

function formatRupiah(n: number) {
  return 'Rp' + new Intl.NumberFormat('id-ID').format(n);
}

function firstNameOnly(fullname: string) {
  return fullname.split(' ')[0];
}

type PageState = 'loading' | 'not_found' | 'already_submitted' | 'form' | 'success' | 'error';

type AlreadySubmittedData = {
  studentname: string;
  next_grade: number;
  selected_subjects: string[];
  submitted_at: string;
};

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
    <div className="page-root">
      <header className="top-bar">
        <span className="brand-dot" />
        <span className="brand-name">CoLearn</span>
      </header>
      <main className="body">
        <div className="badge">✓ Pilihan Tercatat</div>
        <h1 className="greeting">
          Terima kasih, {firstNameOnly(studentname)}!
        </h1>
        <p className="subtext">
          {isRevisit
            ? 'Kamu sudah mengisi form ini sebelumnya. Berikut pilihan yang kami terima.'
            : 'Pilihan mata pelajaran semester depan sudah kami terima.'}
        </p>

        <div className="divider" />

        <p className="section-label">Ringkasan</p>
        <div className="summary-box">
          {chosen.map(s => (
            <div className="summary-row" key={s.id}>
              <span className="summary-mapel">
                {s.label}
                {(s.id === 'mtk_1x' || s.id === 'mtk_2x') && (
                  <span className="summary-freq-small"> · {getFreqLabel(s.id)}</span>
                )}
              </span>
              <span className="summary-price">{formatRupiah(s.pricePerMonth)}</span>
            </div>
          ))}
          <div className="summary-total-row">
            <span className="summary-total-label">Total per bulan</span>
            <span className="summary-total-amt">{formatRupiah(total)}</span>
          </div>
          <div className="summary-sessions-row">
            <span className="summary-sessions-label">Total kelas per minggu</span>
            <span className="summary-sessions-amt">{totalSessions}× seminggu</span>
          </div>
        </div>

        <div className="notes-stack">
          <div className="note-item">
            <span className="note-icon">🕐</span>
            <span>Link pembayaran dikirim mulai <strong>22 Juni 2026</strong> sesuai mata pelajaran yang dipilih.</span>
          </div>
          <div className="note-item">
            <span className="note-icon">ℹ️</span>
            <span>Pembayaran harga semester akan diinformasikan menyusul.</span>
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

  const hasScienceOnly =
    selected.some(id => ['ipa', 'fisika', 'kimia'].includes(id)) &&
    !selected.some(id => ['mtk_1x', 'mtk_2x'].includes(id));

  const canSubmit = selected.length > 0 && !hasScienceOnly;

  const chosenSubjects = subjects.filter(s => selected.includes(s.id));
  const total = chosenSubjects.reduce((a, s) => a + s.pricePerMonth, 0);
  const totalSessions = chosenSubjects.reduce((a, s) => a + s.sessionsPerWeek, 0);

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

  if (pageState === 'already_submitted' && alreadySubmittedData) {
    return (
      <ConfirmationView
        studentname={alreadySubmittedData.studentname}
        subjects={SUBJECTS_BY_GRADE[alreadySubmittedData.next_grade] ?? BASE_SUBJECTS}
        selectedIds={alreadySubmittedData.selected_subjects}
        isRevisit={true}
      />
    );
  }

  if (pageState === 'success' && student) {
    return (
      <ConfirmationView
        studentname={student.studentname}
        subjects={subjects}
        selectedIds={selected}
        isRevisit={false}
      />
    );
  }

  return (
    <div className="page-root">
      <header className="top-bar">
        <span className="brand-dot" />
        <span className="brand-name">CoLearn</span>
      </header>

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
            <div className="badge">Survei Minat</div>
            <h1 className="greeting">
              Halo, {firstNameOnly(student.studentname)} 👋<br />
              Pilih paket untuk kelas {student.next_grade}
            </h1>
            <p className="subtext">
              Isi form ini untuk memberi tahu kami mata pelajaran yang diminati — bukan pembayaran.
            </p>

            <div className="divider" />

            <p className="section-label">Mata pelajaran</p>
            <div className="subject-list">
              {subjects.map(s => {
                const checked = selected.includes(s.id);
                return (
                  <button
                    key={s.id}
                    type="button"
                    className={`subject-item${checked ? ' subject-item--checked' : ''}`}
                    onClick={() => toggle(s.id)}
                    aria-pressed={checked}
                  >
                    <div className={`subject-check${checked ? ' subject-check--checked' : ''}`}>
                      {checked && <span className="check-icon">✓</span>}
                    </div>
                    <div className="subject-text">
                      <span className="subject-name">{s.label}</span>
                      <span className="subject-freq">{getFreqLabel(s.id)}</span>
                    </div>
                  </button>
                );
              })}
            </div>

            {hasScienceOnly && (
              <p className="error-msg">IPA/Fisika/Kimia wajib diambil bersama Matematika.</p>
            )}

            <p className="section-label" style={{ marginTop: '24px' }}>Ringkasan</p>
            <div className="summary-box">
              {chosenSubjects.length === 0 ? (
                <p className="summary-empty">Belum ada mata pelajaran yang dipilih.</p>
              ) : (
                <>
                  {chosenSubjects.map(s => (
                    <div className="summary-row" key={s.id}>
                      <span className="summary-mapel">
                        {s.label}
                        {(s.id === 'mtk_1x' || s.id === 'mtk_2x') && (
                          <span className="summary-freq-small"> · {getFreqLabel(s.id)}</span>
                        )}
                      </span>
                      <span className="summary-price">{formatRupiah(s.pricePerMonth)}</span>
                    </div>
                  ))}
                  <div className="summary-total-row">
                    <span className="summary-total-label">Total per bulan</span>
                    <span className="summary-total-amt">{formatRupiah(total)}</span>
                  </div>
                  <div className="summary-sessions-row">
                    <span className="summary-sessions-label">Total kelas per minggu</span>
                    <span className="summary-sessions-amt">{totalSessions}× seminggu</span>
                  </div>
                </>
              )}
            </div>

            <div className="notes-stack">
              <div className="note-item">
                <span className="note-icon">🕐</span>
                <span>Link pembayaran dikirim mulai <strong>22 Juni 2026</strong> sesuai mata pelajaran yang dipilih.</span>
              </div>
              <div className="note-item">
                <span className="note-icon">ℹ️</span>
                <span>Pembayaran harga semester akan diinformasikan menyusul.</span>
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

const css = `
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  .page-root {
    min-height: 100vh;
    background: #ffffff;
    font-family: system-ui, -apple-system, sans-serif;
    color: #1a1a1a;
  }

  .top-bar {
    display: flex; align-items: center; gap: 8px;
    padding: 14px 20px;
    border-bottom: 0.5px solid #e5e7eb;
  }
  .brand-dot {
    display: block; width: 8px; height: 8px;
    border-radius: 50%; background: #4A6CF7; flex-shrink: 0;
  }
  .brand-name { font-size: 13px; font-weight: 500; color: #6b7280; }

  .body {
    max-width: 480px; margin: 0 auto;
    padding: 28px 20px 80px;
    display: flex; flex-direction: column;
  }

  .badge {
    display: inline-block; align-self: flex-start;
    font-size: 11px; font-weight: 500;
    color: #4A6CF7; background: #eef1fe;
    border-radius: 20px; padding: 4px 10px;
    margin-bottom: 12px; letter-spacing: 0.02em;
  }

  .greeting {
    font-size: 22px; font-weight: 500;
    line-height: 1.35; color: #111827; margin-bottom: 8px;
  }

  .subtext { font-size: 14px; color: #6b7280; line-height: 1.6; }

  .divider { height: 0.5px; background: #e5e7eb; margin: 24px 0; }

  .section-label {
    font-size: 11px; font-weight: 500; color: #9ca3af;
    letter-spacing: 0.07em; text-transform: uppercase; margin-bottom: 12px;
  }

  .subject-list { display: flex; flex-direction: column; }

  .subject-item {
    display: flex; align-items: center; gap: 12px;
    padding: 14px 0;
    border: none; border-bottom: 0.5px solid #f3f4f6;
    background: transparent; cursor: pointer;
    text-align: left; width: 100%;
  }
  .subject-item:last-of-type { border-bottom: none; }

  .subject-check {
    width: 20px; height: 20px; border-radius: 5px;
    border: 1.5px solid #d1d5db;
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0; background: #fff; transition: all 0.12s;
  }
  .subject-check--checked { background: #4A6CF7; border-color: #4A6CF7; }

  .check-icon { color: #fff; font-size: 11px; font-weight: 700; line-height: 1; }

  .subject-text { display: flex; flex-direction: column; gap: 2px; }
  .subject-name { font-size: 14px; color: #111827; }
  .subject-freq { font-size: 12px; color: #9ca3af; }

  .summary-box {
    background: #f9fafb; border-radius: 12px;
    padding: 14px 16px; min-height: 52px;
  }
  .summary-empty { font-size: 13px; color: #9ca3af; }

  .summary-row {
    display: flex; justify-content: space-between; align-items: baseline;
    margin-bottom: 6px;
  }
  .summary-row:last-of-type { margin-bottom: 0; }
  .summary-mapel { font-size: 13px; color: #374151; }
  .summary-freq-small { font-size: 12px; color: #9ca3af; }
  .summary-price { font-size: 13px; color: #111827; font-weight: 500; }

  .summary-total-row {
    display: flex; justify-content: space-between; align-items: baseline;
    padding-top: 10px; margin-top: 8px;
    border-top: 0.5px solid #e5e7eb;
  }
  .summary-total-label { font-size: 12px; color: #6b7280; }
  .summary-total-amt { font-size: 18px; font-weight: 500; color: #111827; }

  .summary-sessions-row {
    display: flex; justify-content: space-between; align-items: baseline;
    margin-top: 6px;
  }
  .summary-sessions-label { font-size: 11px; color: #9ca3af; }
  .summary-sessions-amt { font-size: 12px; color: #9ca3af; font-weight: 500; }

  .notes-stack { margin-top: 12px; display: flex; flex-direction: column; gap: 8px; }
  .note-item {
    display: flex; gap: 8px; align-items: flex-start;
    font-size: 12px; color: #6b7280; line-height: 1.6;
  }
  .note-item--green { color: #15803d; }
  .note-icon { font-size: 13px; margin-top: 1px; flex-shrink: 0; }

  .btn-submit {
    width: 100%; padding: 14px;
    background: #4A6CF7; color: #fff;
    border: none; border-radius: 10px;
    font-size: 15px; font-weight: 500; cursor: pointer;
    margin-top: 20px; transition: background 0.15s;
  }
  .btn-submit:hover:not(.btn-submit--disabled) { background: #3b5de6; }
  .btn-submit--disabled { background: #e5e7eb; color: #9ca3af; cursor: not-allowed; }

  .error-msg {
    font-size: 13px; color: #dc2626;
    background: #fef2f2; border-radius: 8px;
    padding: 10px 14px; margin-top: 12px;
  }

  .status-wrap {
    display: flex; flex-direction: column; align-items: center;
    text-align: center; padding: 80px 24px; gap: 16px;
  }
  .spinner {
    width: 36px; height: 36px;
    border: 2.5px solid #e5e7eb; border-top-color: #4A6CF7;
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
