import { Link } from "react-router-dom";

const BestSellers = () => {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto px-4 py-16 space-y-10">
        <div className="overflow-hidden rounded-2xl border bg-card shadow-xl">
          <div className="relative">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_12%_18%,rgba(34,197,94,0.2),transparent_35%),radial-gradient(circle_at_85%_15%,rgba(236,72,153,0.18),transparent_40%),radial-gradient(circle_at_40%_80%,rgba(59,130,246,0.16),transparent_38%)]" />
            <div className="relative space-y-4 p-8 md:p-12">
              <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                <span>Favorit Pelanggan</span>
                <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                <span>Terjual ratusan</span>
              </div>
              <h1 className="text-3xl font-bold md:text-4xl">Best Sellers</h1>
              <p className="max-w-3xl text-lg text-muted-foreground">
                Pilihan gear paling dipercaya komunitas. Rating tinggi, performa jempolan, dan tampilan yang bikin pede.
              </p>
              <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                {["Top reviewed", "Stok cepat habis", "Kompatibel harian", "Dipakai rider pro"].map((chip) => (
                  <span key={chip} className="rounded-full border border-primary/40 bg-primary/10 px-3 py-1 text-primary">
                    {chip}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {["Frame Cromoly", "Pedal CNC", "Sadel Comfort", "Strap Kulit", "Crankset 48T", "Handlebar Pursuit"].map((item) => (
            <div
              key={item}
              className="relative overflow-hidden rounded-xl border bg-card p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-emerald-500/10" />
              <div className="relative space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-primary">Best pick</p>
                <h3 className="text-lg font-semibold">{item}</h3>
                <p className="text-sm text-muted-foreground">Dipilih karena rating tinggi dari pengguna.</p>
              </div>
            </div>
          ))}
        </div>

        <div className="rounded-2xl border bg-muted/40 p-6 text-sm text-muted-foreground">
          <p>
            Lihat detail penilaian dan stok terkini di halaman <Link to="/" className="font-semibold text-primary">Beranda</Link> atau cek ulasan Anda di <Link to="/dashboard/reviews" className="font-semibold text-primary">Dashboard</Link>.
          </p>
        </div>
      </div>
    </main>
  );
};

export default BestSellers;
