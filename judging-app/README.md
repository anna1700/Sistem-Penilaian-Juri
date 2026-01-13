# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.


# 🏆 Sistem Penjurian Real-Time (SISFO FEST 2025)

Halo! 👋 Ini adalah proyek aplikasi web pertama yang saya buat untuk kebutuhan **Real Case** (kasus nyata), yaitu kompetisi UI/UX Design di acara SISFO FEST 2025.

Aplikasi ini dibuat agar Dewan Juri bisa memberikan nilai secara digital, dan panitia (Admin) bisa melihat rekapitulasi nilai secara **Real-time** tanpa perlu hitung manual pakai Excel lagi.

🔗 **Link Demo:** [Masukkan Link Netlify Kamu Di Sini]

## 🛠️ Teknologi yang Saya Pelajari & Pakai
Jujur, saya masih dalam tahap belajar coding, dan di proyek ini saya menantang diri sendiri untuk menggunakan teknologi modern:
* **React + Vite:** Untuk membuat tampilan web yang cepat.
* **Tailwind CSS:** Untuk styling (desain) yang rapi dan responsif.
* **Firebase Firestore:** Untuk database online yang real-time (ini bagian paling menantang!).
* **Netlify:** Untuk deploy aplikasi agar bisa diakses juri lewat HP.

## 🚀 Fitur Aplikasi
1.  **Multi-User:**
    * **Admin:** Punya password khusus, bisa tambah tim, hapus tim, dan lihat Ranking Juara.
    * **Juri (4 Orang):** Masuk menggunakan PIN rahasia. Hanya bisa menilai, tidak bisa melihat nilai juri lain.
2.  **Auto Calculation:** Sistem otomatis menghitung rata-rata bobot nilai (30%, 30%, 25%, 15%) dari 4 juri.
3.  **Real-time Update:** Saat Juri A menilai, Admin langsung melihat hasilnya detik itu juga.

## 📖 Cerita di Balik Layar (Learning Journey)
Sebagai pemula yang masih belajar coding, proyek ini mengajarkan saya banyak hal:
* **State Management:** Bagaimana mengatur data nilai agar tidak hilang saat pindah tab.
* **Logic:** Membuat rumus rata-rata otomatis yang adil untuk semua juri.
* **Deployment:** Perjuangan upload ke GitHub dan Netlify sampai akhirnya "Published" 🟢.

Meskipun kodenya mungkin belum sempurna (masih banyak yang bisa dioptimalkan), saya bangga aplikasi ini bisa berjalan dan membantu jalannya acara! 🚀

---
*Created with 💻 and ☕ by Anna.*