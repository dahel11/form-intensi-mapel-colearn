const WA_URL =
  'https://wa.me/6281119954075?text=Aku%20mau%20registrasi%20untuk%20semester%20depan';

export default function FormClosedPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="bg-white border border-gray-200 rounded-2xl p-10 max-w-sm w-full text-center">

        <div className="w-16 h-16 rounded-full bg-amber-50 flex items-center justify-center mx-auto mb-5">
          <i className="ti ti-calendar-off text-amber-500 text-3xl" aria-hidden="true" />
        </div>

        <h1 className="text-lg font-medium text-gray-900 mb-3">
          Form pendaftaran minat sudah ditutup
        </h1>
        <p className="text-sm text-gray-500 leading-relaxed mb-8">
          Hubungi Kakak Siaga CoLearn untuk bertanya terkait pendaftaran semester depan.
        </p>

        
          href={WA_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 w-full py-3 px-4 bg-[#25D366] hover:bg-[#1fba59] transition-colors rounded-xl text-white text-sm font-medium"
        >
          <i className="ti ti-brand-whatsapp text-lg" aria-hidden="true" />
          Hubungi Kakak Siaga
        </a>

        <p className="text-xs text-gray-400 mt-5">CoLearn — 2026</p>
      </div>
    </div>
  );
}
