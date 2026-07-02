# Plan Penyempurnaan Assessment ACGS

## Summary

Penyempurnaan halaman `/assessment-acgs` dilakukan bertahap agar form input data cepat, aman, dan akurat. Fokus utama:

- Menghilangkan error `column acgs_assessments.division_id does not exist`.
- Menjadikan Assessment ACGS sebagai data global per tahun sesuai schema remote saat ini.
- Membuat input teks lebih responsif.
- Membuat evidence upload aman dan langsung terlihat setelah upload.
- Menegakkan aturan status: `YES` dan `NA` bernilai 1, `NO` bernilai 0.
- Menonaktifkan dan mengosongkan Rekomendasi saat status `YES` atau `NA`.
- Mengganti export PDF menjadi export DOCX.

## Tahap 1 - Business Logic Inti

Status: selesai.

Perubahan:

- Menghapus query/filter `division_id` dari flow ACGS karena `public.acgs_assessments` remote tidak memiliki kolom tersebut.
- Menjaga pembatasan akses lewat session dan RBAC aplikasi.
- Mengubah scoring menjadi:
  - `YES = 1`
  - `NA = 1`
  - `NO = 0`
  - kosong/unanswered = `0`
- Menghapus syarat evidence untuk nilai `YES`.
- Menjadikan summary score table realtime dari state lokal.
- Menghapus refresh/invalidate setelah setiap save agar input terasa lebih cepat.
- Menambahkan autosave debounce ringan untuk textarea.
- Mengosongkan dan men-disable Rekomendasi saat status `YES` atau `NA`.
- Menolak penyimpanan rekomendasi non-empty di server jika status bukan `NO`.

Validasi:

- `bun run check` sukses.

## Tahap 2 - Evidence Aman dan Terlihat Setelah Upload

Status: selesai.

Perubahan:

- Upload evidence sekarang menghasilkan `path`, `name`, dan `downloadUrl`.
- Setelah upload sukses, marker `[FILE:path|namaFile]` langsung disimpan ke field evidence.
- Badge/link evidence langsung muncul di UI tanpa refresh halaman.
- Jika penyimpanan marker gagal setelah upload, file otomatis dihapus dari storage.
- Validasi client-side:
  - file tidak boleh kosong
  - maksimal 15 MB
  - hanya PDF, PNG, JPG/JPEG, WEBP
  - MIME harus cocok dengan ekstensi
- Validasi server-side pasca-upload:
  - server membaca file dari private bucket
  - magic bytes dicek dengan `file-type`
  - file dihapus jika tidak sesuai allowlist
- Download dan delete tetap lewat endpoint server, bukan public bucket URL.

Validasi:

- `bun run check` sukses.

## Tahap 3 - Export DOCX

Status: selesai.

Perubahan:

- Menambahkan dependency `docx`.
- Mengubah tombol `Export PDF` menjadi `Export DOCX`.
- Menambahkan endpoint `GET /assessment-acgs/api/export-docx?year=YYYY`.
- DOCX berisi:
  - halaman pertama summary score table dengan judul `Tabel Skor Capaian Assessment ACGS PT PLN (Persero), Tahun Buku YYYY`
  - page break
  - tabel assessment lengkap untuk seluruh pertanyaan tahun aktif
- Evidence file di DOCX ditampilkan sebagai link download melalui endpoint aplikasi.

Validasi:

- `bun run check` sukses.

## Tahap 4 - Finalisasi dan Quality Gate

Status: tahap final.

Checklist:

- Simpan plan ini ke direktori `docs`.
- Jalankan `bun run check`.
- Jalankan `bun run build`.
- Catat blocker build bila terkait environment Windows/Vercel symlink.

## Acceptance Criteria

- Halaman `/assessment-acgs` tidak lagi memunculkan error `acgs_assessments.division_id does not exist`.
- Input Implementasi, Evidence, dan Rekomendasi terasa cepat serta tetap tersimpan.
- Status `YES` dan `NA` langsung menaikkan nilai menjadi 1.
- Status `NO` bernilai 0 dan membuka field Rekomendasi.
- Status `YES` atau `NA` mengosongkan dan men-disable Rekomendasi.
- File evidence valid dapat diupload, langsung muncul sebagai badge/link, dan dapat dibuka.
- File evidence invalid ditolak dan tidak dibiarkan tersimpan di storage.
- Export DOCX menghasilkan summary dan tabel assessment lengkap.
