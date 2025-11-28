import { Link } from "react-router-dom";

const NewArrivals = () => {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto px-4 py-16 space-y-10">
        <div className="overflow-hidden rounded-2xl border bg-card shadow-xl">
          <div className="relative">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_15%,rgba(236,72,153,0.22),transparent_36%),radial-gradient(circle_at_80%_20%,rgba(99,102,241,0.2),transparent_40%),radial-gradient(circle_at_50%_80%,rgba(34,197,94,0.16),transparent_38%)]" />
            <div className="relative space-y-4 p-8 md:p-12">
              <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                <span>Koleksi Terbaru</span>
                <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                <span>Fresh drop weekly</span>
              </div>
              <h1 className="text-3xl font-bold md:text-4xl">New Arrivals</h1>
              <p className="max-w-3xl text-lg text-muted-foreground">
                Rilisan limited dengan warna-warna bold yang langsung nge-boost gaya riding kamu. Semua diracik buat
                anak kota yang gercep.
              </p>
              <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                {["Edisi terbatas", "Launching tiap minggu", "Pilihan warna unik", "Bonus sticker pack"].map((chip) => (
                  <span key={chip} className="rounded-full border border-primary/40 bg-primary/10 px-3 py-1 text-primary">
                    {chip}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {["Frame Titanium", "Wheelset Aero", "Helm Urban", "Footstrap", "Handlebar Bullhorn", "Lighting"].map((item) => (
            <div
              key={item}
              className="relative overflow-hidden rounded-xl border bg-card p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-pink-500/10" />
              <div className="relative space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-primary">Baru mendarat</p>
                <h3 className="text-lg font-semibold">{item}</h3>
                <p className="text-sm text-muted-foreground">Stok terbatas, cocok buat upgrade cepat.</p>
                <p className="text-sm text-muted-foreground">Tersedia dalam stok terbatas, segera amankan.</p>
              </div>
            </div>
          ))}
        </div>

        <div className="rounded-2xl border bg-muted/40 p-6 text-sm text-muted-foreground">
          <p>
             Ingin mencoba langsung? Kunjungi showroom atau pesan online via <Link to="/" className="font-semibold text-primary">Beranda</Link> untuk cek stok real-time.
          </p>
        </div>
      </div>
    </main>
  );
};

export default NewArrivals;
