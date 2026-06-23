'use client';

export default function FormClosedPage() {
  return (
    <div style={{
      minHeight: '100vh',
      background: '#ffffff',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      display: 'flex',
      flexDirection: 'column',
    }}>
      {/* Top bar */}
      <header style={{
        display: 'flex',
        alignItems: 'center',
        padding: '12px 20px',
        borderBottom: '0.5px solid #e5e7eb',
      }}>
        <img src="/CoLearn Logo Blue.svg" height={28} alt="CoLearn" style={{ display: 'block' }} />
      </header>
      {/* Body */}
      <main style={{
        maxWidth: 480,
        margin: '0 auto',
        padding: '60px 20px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        width: '100%',
      }}>
        {/* Icon */}
        <div style={{
          width: 64,
          height: 64,
          borderRadius: '50%',
          background: '#fffbeb',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 20,
        }}>
          <i className="ti ti-calendar-off" style={{ fontSize: 28, color: '#d97706' }} aria-hidden="true" />
        </div>
        {/* Title */}
        <h1 style={{
          fontSize: 17,
          fontWeight: 600,
          color: '#111827',
          marginBottom: 10,
          lineHeight: 1.3,
        }}>
          Form pendaftaran minat sudah ditutup
        </h1>
        {/* Subtitle */}
        <p style={{
          fontSize: 14,
          color: '#6b7280',
          lineHeight: 1.6,
          marginBottom: 32,
          maxWidth: 300,
        }}>
          Hubungi Kakak Siaga CoLearn untuk bertanya terkait pendaftaran semester depan.
        </p>
        {/* WA Button - disabled */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            width: '100%',
            maxWidth: 300,
            padding: '13px 20px',
            background: '#e5e7eb',
            borderRadius: 10,
            color: '#9ca3af',
            fontSize: 15,
            fontWeight: 500,
          }}
        >
          <i className="ti ti-brand-whatsapp" style={{ fontSize: 20 }} aria-hidden="true" />
          Silakan hubungi Kakak Siaga
        </div>
        <p style={{ fontSize: 12, color: '#9ca3af', marginTop: 32 }}>
          CoLearn — 2026
        </p>
      </main>
    </div>
  );
}
