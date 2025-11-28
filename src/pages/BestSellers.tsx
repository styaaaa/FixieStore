import { Link } from "react-router-dom";

const BestSellers = () => {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto px-4 py-16 space-y-8">
        <div className="space-y-3">
          <p className="text-sm font-semibold text-primary">Favorit Pelanggan</p>
          <h1 className="text-3xl font-bold">Best Sellers</h1>
          <p className="max-w-3xl text-muted-foreground">
            Produk dengan ulasan terbaik dan penjualan tertinggi di FixieStore. Dirangkai dari pengalaman komunitas
            penggemar fixie di Indonesia.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {["Frame Cromoly", "Pedal CNC", "Sadel Comfort", "Strap Kulit", "Crankset 48T", "Handlebar Pursuit"].map(
            (item) => (
              <div key={item} className="rounded-lg border bg-card p-5 shadow-sm">
                <h3 className="font-semibold">{item}</h3>
                <p className="text-sm text-muted-foreground">Dipilih karena rating tinggi dari pengguna.</p>
              </div>
            )
          )}
        </div>

        <div className="rounded-lg border bg-muted/40 p-6 text-sm text-muted-foreground">
          <p>
            Lihat detail penilaian dan stok terkini di halaman <Link to="/" className="font-semibold text-primary">Beranda</Link> atau cek ulasan Anda di <Link to="/dashboard/reviews" className="font-semibold text-primary">Dashboard</Link>.
          </p>
        </div>
      </div>
    </main>
  );
};

export default BestSellers;
