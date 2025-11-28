import { Link } from "react-router-dom";

const Contact = () => {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto px-4 py-16 space-y-10">
        <div className="space-y-3">
          <p className="text-sm font-semibold text-primary">Bantuan Pelanggan</p>
          <h1 className="text-3xl font-bold">Hubungi Tim FixieStore</h1>
          <p className="max-w-2xl text-muted-foreground">
            Kami siap membantu Anda menemukan fixie terbaik, menjawab pertanyaan pesanan, dan
            memberi dukungan purna jual. Silakan pilih cara terbaik untuk terhubung dengan kami.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <div className="rounded-lg border bg-card p-6 shadow-sm">
            <h2 className="text-lg font-semibold">WhatsApp & Telepon</h2>
            <p className="mt-2 text-muted-foreground">Setiap hari, 09.00 - 21.00 WIB</p>
            <p className="mt-4 text-2xl font-bold text-primary">+62 812-3456-7890</p>
          </div>

          <div className="rounded-lg border bg-card p-6 shadow-sm">
            <h2 className="text-lg font-semibold">Email Support</h2>
            <p className="mt-2 text-muted-foreground">Balasan maksimal 1x24 jam kerja</p>
            <a href="mailto:support@fixiestore.com" className="mt-4 inline-block font-semibold text-primary">
              support@fixiestore.com
            </a>
          </div>

          <div className="rounded-lg border bg-card p-6 shadow-sm">
            <h2 className="text-lg font-semibold">Showroom</h2>
            <p className="mt-2 text-muted-foreground">Senin - Sabtu, 10.00 - 19.00 WIB</p>
            <p className="mt-4 text-primary">Jl. Cikini Raya No. 45, Jakarta Pusat</p>
          </div>
        </div>

        <div className="rounded-lg border bg-card p-6 shadow-sm space-y-4">
          <h2 className="text-lg font-semibold">Pesan singkat</h2>
          <p className="text-muted-foreground">Tinggalkan pesan Anda, tim kami akan merespons secepatnya.</p>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="space-y-2">
              <span className="text-sm font-medium">Nama</span>
              <input className="w-full rounded-md border bg-background px-3 py-2" placeholder="Nama lengkap" />
            </label>
            <label className="space-y-2">
              <span className="text-sm font-medium">Email</span>
              <input className="w-full rounded-md border bg-background px-3 py-2" placeholder="you@example.com" />
            </label>
          </div>
          <label className="space-y-2">
            <span className="text-sm font-medium">Pesan</span>
            <textarea className="min-h-[140px] w-full rounded-md border bg-background px-3 py-2" placeholder="Ceritakan kebutuhan Anda" />
          </label>
          <button className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow hover:bg-primary/90">
            Kirim Pesan
          </button>
        </div>

        <div className="rounded-lg border bg-muted/40 p-6 text-sm text-muted-foreground">
          <p>
            Butuh bantuan mendesak tentang status pesanan? Kunjungi halaman <Link to="/dashboard" className="font-semibold text-primary">Dashboard</Link> untuk melihat pengiriman, atau gunakan <Link to="/order-success" className="font-semibold text-primary">pelacakan</Link>
            jika Anda baru saja menyelesaikan pembayaran.
          </p>
        </div>
      </div>
    </main>
  );
};

export default Contact;
