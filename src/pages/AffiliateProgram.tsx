import { Link } from "react-router-dom";

const AffiliateProgram = () => {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto px-4 py-16 space-y-10">
        <div className="overflow-hidden rounded-2xl border bg-card shadow-xl">
          <div className="relative">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(16,185,129,0.18),transparent_35%),radial-gradient(circle_at_80%_10%,rgba(236,72,153,0.18),transparent_42%),radial-gradient(circle_at_60%_80%,rgba(59,130,246,0.16),transparent_38%)]" />
            <div className="relative space-y-4 p-8 md:p-12">
              <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                <span>Kemitraan</span>
                <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                <span>Bagi vibe, dapat komisi</span>
              </div>
              <h1 className="text-3xl font-bold md:text-4xl">Affiliate Program</h1>
              <p className="max-w-3xl text-lg text-muted-foreground">
                Dukung komunitas fixie sambil mendapatkan komisi. Bagikan gear favorit, pantau performa, dan cairkan bonus
                dengan dashboard yang simple.
              </p>
              <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                {["Pembayaran transparan", "Kode unik", "Asset promo", "Tim support standby"].map((chip) => (
                  <span key={chip} className="rounded-full border border-primary/40 bg-primary/10 px-3 py-1 text-primary">
                    {chip}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

         <div className="grid gap-6 md:grid-cols-4">
          {["Daftar & verifikasi", "Bagikan link produk", "Pantau performa", "Tarik komisi"].map((step, index) => (
            <div
              key={step}
              className="relative overflow-hidden rounded-xl border bg-card p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-emerald-500/10" />
              <div className="relative space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-primary">Langkah {index + 1}</p>
                <h3 className="text-lg font-semibold">{step}</h3>
                <p className="text-sm text-muted-foreground">Mulai program afiliasi hanya dalam beberapa menit.</p>
              </div>
            </div>
          ))}
        </div>

        <div className="rounded-2xl border bg-muted/40 p-6 text-sm text-muted-foreground">
          Daftar dengan akun pembelian Anda. Kelola kupon di <Link to="/admin/dashboard" className="font-semibold text-primary">Dashboard Admin</Link>, atau chat tim kami via <Link to="/contact" className="font-semibold text-primary">Kontak</Link>.
        </div>
      </div>
    </main>
  );
};
// Mama
export default AffiliateProgram;
