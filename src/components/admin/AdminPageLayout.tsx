import { type ReactNode } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ShieldCheck } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface AdminPageLayoutProps {
  title: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
  onSignOut?: () => void;
}

const tabs = [
  { to: "/admin/products/new", label: "Tambah produk" },
  { to: "/admin/monitoring", label: "Monitoring & produk" },
];

const AdminPageLayout = ({
  title,
  description,
  actions,
  children,
  onSignOut,
}: AdminPageLayoutProps) => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div className="min-h-screen bg-muted/30 py-10 px-4">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Akses admin terverifikasi</p>
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-bold">{title}</h1>
              <Badge variant="secondary" className="flex items-center gap-1">
                <ShieldCheck className="h-4 w-4" />
                Admin
              </Badge>
            </div>
            {description ? (
              <p className="text-sm text-muted-foreground">{description}</p>
            ) : null}
          </div>

          <div className="flex flex-wrap gap-2">
            {actions}
            <Button variant="outline" onClick={() => navigate("/")}>
              Lihat toko
            </Button>
            <Button variant="secondary" onClick={onSignOut}>
              Keluar
            </Button>
          </div>
        </div>

        <nav className="sticky top-4 z-10 -mx-1 bg-muted/60 backdrop-blur supports-[backdrop-filter]:bg-muted/70 rounded-lg border p-2 shadow-sm">
          <div className="flex flex-wrap gap-2">
            {tabs.map((tab) => {
              const isActive = location.pathname === tab.to;
              return (
                <Button
                  key={tab.to}
                  variant={isActive ? "default" : "ghost"}
                  className="flex-1 md:flex-none"
                  asChild
                >
                  <Link to={tab.to}>{tab.label}</Link>
                </Button>
              );
            })}
          </div>
        </nav>

        {children}
      </div>
    </div>
  );
};

export default AdminPageLayout;
