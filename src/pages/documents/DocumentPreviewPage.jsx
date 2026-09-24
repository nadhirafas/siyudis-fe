import { Link, useLocation, useNavigate } from 'react-router-dom'
import { ArrowLeft, FileText } from 'lucide-react'

function DocumentPreviewPage() {
  const location = useLocation()
  const navigate = useNavigate()

  const { fileUrl, fileName, fileType } = location.state || {}

  if (!fileUrl) {
    return (
      <div className="min-h-screen bg-[#f1f4f9] p-6">
        <div className="mx-auto max-w-4xl rounded-2xl bg-white p-8 text-center shadow-sm">
          <FileText className="mx-auto mb-4 text-slate-400" size={48} />

          <h1 className="text-xl font-bold text-slate-900">
            Dokumen tidak ditemukan
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Silakan kembali ke halaman Pengajuan Yudisium.
          </p>

          <button
            type="button"
            onClick={() => navigate('/pengajuan-yudisium')}
            className="mt-6 rounded-xl bg-[#193967] px-5 py-3 text-sm font-bold text-white"
          >
            Kembali ke Pengajuan
          </button>
        </div>
      </div>
    )
  }

  const isImage = fileType?.startsWith('image/')
  const isPdf = fileType === 'application/pdf'

  return (
    <div className="min-h-screen bg-[#f1f4f9]">
      <header className="flex items-center justify-between bg-white px-6 py-5 shadow-sm lg:px-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-950">
            Lihat Dokumen
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Preview dokumen yang telah diunggah
          </p>
        </div>

        <Link
          to="/pengajuan-yudisium"
          className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
        >
          <ArrowLeft size={17} />
          Kembali
        </Link>
      </header>

      <main className="p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-6xl overflow-hidden rounded-2xl bg-white shadow-sm">
          <div className="border-b border-slate-200 px-6 py-4">
            <p className="text-sm font-bold text-slate-900">
              {fileName}
            </p>
          </div>

          <div className="min-h-[75vh] bg-slate-100 p-4">
            {isPdf && (
              <iframe
                src={fileUrl}
                title={fileName}
                className="h-[75vh] w-full rounded-xl border border-slate-200 bg-white"
              />
            )}

            {isImage && (
              <div className="flex min-h-[75vh] items-center justify-center">
                <img
                  src={fileUrl}
                  alt={fileName}
                  className="max-h-[75vh] max-w-full rounded-xl object-contain shadow-sm"
                />
              </div>
            )}

            {!isPdf && !isImage && (
              <div className="flex min-h-[75vh] items-center justify-center">
                <div className="text-center">
                  <FileText
                    size={48}
                    className="mx-auto text-slate-400"
                  />

                  <p className="mt-4 text-sm text-slate-600">
                    Preview untuk format ini belum tersedia.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

export default DocumentPreviewPage