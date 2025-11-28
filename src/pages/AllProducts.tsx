import { Link } from "react-router-dom";

const AllProducts = () => {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto px-4 py-16 space-y-10">
        <div className="overflow-hidden rounded-2xl border bg-card shadow-xl">
          <div className="relative">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_10%_20%,rgba(99,102,241,0.2),transparent_35%),radial-gradient(circle_at_80%_10%,rgba(236,72,153,0.18),transparent_40%),radial-gradient(circle_at_40%_80%,rgba(16,185,129,0.18),transparent_40%)]" />
            <div className="relative space-y-4 p-8 md:p-12">
              <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                <span>Katalog Lengkap</span>
                <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                <span>Ready to ride</span>
              </div>
              <h1 className="text-3xl font-bold md:text-4xl">Semua Produk FixieStore</h1>
              <p className="max-w-3xl text-lg text-muted-foreground">
                Jelajahi fixie, komponen, dan apparel favorit komunitas. Filter cepat, pilihan warna berani, dan stok real-time siap diburu.
              </p>
              <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                {["Free style guidance", "Kurasi mingguan", "Garansi asli", "Support komunitas"].map((chip) => (
                  <span key={chip} className="rounded-full border border-primary/40 bg-primary/10 px-3 py-1 text-primary">
                    {chip}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

       <div className="rounded-2xl border bg-muted/40 p-6 shadow-sm">
          <h2 className="text-lg font-semibold">Cara paling cepat buat checkout</h2>
          <ol className="mt-3 list-decimal space-y-3 pl-5 text-muted-foreground">
            <li>Mulai dari <Link to="/" className="font-semibold text-primary">Beranda</Link> dan pilih vibe yang cocok.</li>
            <li>Gunakan pencarian atau filter harga untuk nemu gear terbaik.</li>
            <li>Tambahkan ke keranjang, pilih ekspedisi favorit, dan selesaikan pembayaran.</li>
          </ol>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          {["Frame & Fork", "Wheelset", "Apparel", "Aksesori", "Parts Performance", "Special Edition"].map((item) => (
            <div
              key={item}
              className="relative overflow-hidden rounded-xl border bg-card p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-indigo-500/5" />
              <div className="relative space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-primary">Hot pick</p>
                <h3 className="text-lg font-semibold">{item}</h3>
                <p className="text-sm text-muted-foreground">Lihat koleksi terbaru, warna keren, dan stok ready.</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
};

export default AllProducts;
