import { Link } from "react-router-dom";

const AffiliateProgram = () => {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto px-4 py-16 space-y-8">
        <div className="space-y-3">
          <p className="text-sm font-semibold text-primary">Kemitraan</p>
          <h1 className="text-3xl font-bold">Affiliate Program</h1>
          <p className="max-w-3xl text-muted-foreground">
            Dukung komunitas fixie sambil mendapatkan komisi. Bagikan tautan produk favorit Anda dan nikmati bonus dari
            setiap transaksi yang berhasil.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {["Daftar & verifikasi", "Bagikan link produk", "Pantau performa", "Tarik komisi"]
            .map((step, index) => (
              <div key={step} className="rounded-lg border bg-card p-5 shadow-sm">
                <p className="text-sm font-semibold text-primary">Langkah {index + 1}</p>
                <h3 className="text-lg font-semibold">{step}</h3>
                <p className="text-sm text-muted-foreground">
                  Mulai program afiliasi hanya dalam beberapa menit dan akses dashboard khusus mitra.
                </p>
              </div>
            ))}
        </div>

        <div className="rounded-lg border bg-muted/40 p-6 text-sm text-muted-foreground">
          <p>
            Daftar melalui akun yang sama dengan pembelian Anda. Buka <Link to="/admin/dashboard" className="font-semibold text-primary">Dashboard Admin</Link> untuk mengelola kupon, atau hubungi tim kami via <Link to="/contact" className="font-semibold text-primary">Kontak</Link>.
          </p>
        </div>
      </div>
    </main>
  );
};

export default AffiliateProgram;
