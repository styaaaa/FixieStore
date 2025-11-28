import { Link } from "react-router-dom";

const Sale = () => {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto px-4 py-16 space-y-8">
        <div className="space-y-3">
          <p className="text-sm font-semibold text-primary">Promo Aktif</p>
          <h1 className="text-3xl font-bold">Sale</h1>
          <p className="max-w-3xl text-muted-foreground">
            Diskon khusus untuk upgrade fixie Anda. Promo terbatas, stok cepat berubah—pastikan menebus sebelum habis.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {["Frame Bundle", "Starter Kit", "Wheelset Discount", "Apparel Pack", "Light Set", "Maintenance"].map(
            (item) => (
              <div key={item} className="rounded-lg border bg-card p-5 shadow-sm">
                <h3 className="font-semibold">{item}</h3>
                <p className="text-sm text-muted-foreground">Hemat hingga 25% untuk periode terbatas.</p>
              </div>
            )
          )}
        </div>

        <div className="rounded-lg border bg-muted/40 p-6 text-sm text-muted-foreground">
          <p>
            Manfaatkan kode promo langsung di halaman <Link to="/cart" className="font-semibold text-primary">Keranjang</Link> atau lanjutkan checkout untuk melihat estimasi ongkir.
          </p>
        </div>
      </div>
    </main>
  );
};

export default Sale;
