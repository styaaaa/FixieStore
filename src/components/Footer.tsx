import { Link } from "react-router-dom";

export const Footer = () => {
  return (
    <footer className="bg-card border-t mt-16">
      <div className="container mx-auto px-4 py-10">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-4">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <img
                src="/bulat.png"
                alt="Ikon FixieStore"
                className="h-10 w-10 rounded-full bg-muted/20 dark:invert"
              />
              <div>
                <p className="text-xl font-semibold">FixieStore</p>
                <p className="text-sm text-muted-foreground">Carefully curated for your urban rides.</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              Toko fixie modern dengan koleksi terbaik, harga bersahabat, dan layanan pelanggan yang siap membantu.
            </p>
          </div>

          <div className="space-y-3">
            <h4 className="font-semibold">Links</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link to="/">Home</Link>
              </li>
              <li>
                <Link to="/contact">Contact</Link>
              </li>
              <li>
                <Link to="/terms">Term of Service</Link>
              </li>
              <li>
                <Link to="/privacy">Privacy Policy</Link>
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="font-semibold">Product</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>All Products</li>
              <li>New Arrivals</li>
              <li>Best Sellers</li>
              <li>Sale</li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="font-semibold">Admin</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>Dashboard</li>
              <li>Blog</li>
              <li>Affiliate Program</li>
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t pt-6 text-sm text-muted-foreground">
          <p>© 2024 FixieStore | All Rights Reserved</p>
        </div>
      </div>
    </footer>
  );
};
