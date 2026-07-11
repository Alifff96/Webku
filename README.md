# alifff96.com

Website promosi untuk platform UMKM bengkel, mekanik terdaftar, dan toko sparepart lokal.

## File

- `index.html`
- `styles.css`
- `script.js`

## Cara Menjalankan

1. Pastikan Node.js sudah terpasang.
2. Jalankan `npm install` untuk memasang dependensi.
3. Jalankan `npm start`.
4. Buka `http://localhost:8080` di browser.

## API Gratis dan Aktif

- `GET /api/status` — memeriksa status server.
- `POST /api/request` — kirim nama, kategori layanan, layanan, dan metode pembayaran untuk permintaan mekanik.
- `POST /api/request/assign` — tugaskan permintaan layanan ke mekanik (admin saja).
- `GET /api/mechanic/requests` — ambil permintaan yang ditugaskan ke mekanik saat ini.
- `GET /api/mechanic/profile` — ambil data profil mekanik yang login.
- `POST /api/mechanic/profile` — perbarui nomor telepon, keahlian, dan kata sandi mekanik.
- `GET /api/admin/status` — periksa apakah sesi admin masih aktif.
- `GET /api/mechanic/status` — periksa apakah sesi mekanik masih aktif.

## Fitur
- Penyimpanan data mekanik dan permintaan layanan menggunakan file JSON lokal.
- Admin dapat melihat ringkasan permintaan berdasarkan status dan kategori.
- Filter permintaan admin berdasarkan status dan kategori.
- Dashboard mekanik dengan filter permintaan dan pembaruan status.

## Data Persistence
- Data mekanik disimpan di `data/mechanics.json`
- Data permintaan layanan disimpan di `data/requests.json`

## Fitur

- Promo website alifff96.com untuk mekanik dan bengkel UMKM.
- Form kontak untuk permintaan layanan.
- Halaman daftar/login mekanik.
- Halaman login admin.
- Daftar mekanik terdaftar di dashboard admin.
- List permintaan layanan di admin.
- Update status permintaan layanan di admin.
- Logout admin.
- Validasi client-side lebih kuat.
- Ilustrasi marketplace sparepart.
- Server Node.js gratis dan berjalan.

## Halaman Tambahan

- `mechanic.html` — halaman daftar dan login mekanik di alifff96.com.
- `admin.html` — halaman login admin dan dashboard mekanik untuk alifff96.com.

## Admin Default

- Email: `admin@bengkel.com`
- Kata sandi: `admin123`
