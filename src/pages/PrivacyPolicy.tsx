const PrivacyPolicy = () => {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto px-4 py-16 space-y-8">
        <div className="space-y-3">
          <p className="text-sm font-semibold text-primary">Privasi</p>
          <h1 className="text-3xl font-bold">Kebijakan Privasi FixieStore</h1>
          <p className="max-w-3xl text-muted-foreground">
            Kami berkomitmen melindungi data pribadi Anda. Informasi berikut menjelaskan bagaimana kami mengumpulkan,
            menggunakan, dan menyimpan data pelanggan untuk memberikan pengalaman terbaik.
          </p>
        </div>

        <div className="space-y-6 rounded-lg border bg-card p-6 shadow-sm">
          <section className="space-y-2">
            <h2 className="text-lg font-semibold">Data yang kami kumpulkan</h2>
            <p className="text-muted-foreground">
              Kami mengumpulkan nama, email, nomor telepon, alamat pengiriman, serta riwayat pesanan untuk memproses
              transaksi dan layanan purna jual. Data pembayaran diproses oleh penyedia pembayaran tepercaya tanpa
              disimpan di sistem kami.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold">Cara penggunaan data</h2>
            <p className="text-muted-foreground">
              Data digunakan untuk memproses pesanan, personalisasi rekomendasi produk, mengirim pembaruan pesanan,
              serta komunikasi promo jika Anda mengizinkan. Anda dapat berhenti berlangganan kapan pun.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold">Keamanan & hak pengguna</h2>
            <p className="text-muted-foreground">
              Kami menerapkan enkripsi dan pembatasan akses internal. Anda berhak meminta salinan data, memperbarui, atau
              menghapusnya sesuai kebijakan yang berlaku. Hubungi support kami untuk permintaan terkait privasi.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
};

export default PrivacyPolicy;
