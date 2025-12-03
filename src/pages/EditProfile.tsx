import { type ChangeEvent, type FormEvent, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/context/auth-context";
import { useUpdateUserProfile, useUserProfile } from "@/hooks/useUserProfile";

const EditProfile = () => {
  const navigate = useNavigate();
  const { user, isAdmin, authLoading } = useAuth();
  const { data: profile, isLoading: profileLoading } = useUserProfile(user?.id);
  const { mutateAsync: saveProfile, isPending: saveProfilePending } = useUpdateUserProfile(user?.id);
  const { toast } = useToast();
  const [profileForm, setProfileForm] = useState({
    fullName: "",
    phone: "",
    city: "",
    address: "",
    postalCode: "",
  });

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      navigate("/login", { replace: true });
      return;
    }

    if (isAdmin) {
      navigate("/admin/dashboard", { replace: true });
    }
  }, [authLoading, isAdmin, navigate, user]);

  useEffect(() => {
    if (profile) {
      setProfileForm({
        fullName: profile.full_name ?? "",
        phone: profile.phone ?? "",
        city: profile.city ?? "",
        address: profile.address ?? "",
        postalCode: profile.postal_code ?? "",
      });
      return;
    }

    if (user?.user_metadata) {
      const metadata = user.user_metadata as Record<string, string>;

      setProfileForm((current) => ({
        ...current,
        fullName: metadata.full_name ?? current.fullName,
      }));
    }
  }, [profile, user?.user_metadata]);

  const initial = (profile?.full_name ?? user?.email ?? "U")
    .charAt(0)
    .toUpperCase();

  const displayName = useMemo(() => {
    const nameFromProfile = [profile?. full_name]
      .filter(Boolean)
      .join(" ")
      .trim();

    if (nameFromProfile) return nameFromProfile;
    if (profile?.full_name) return profile.full_name;
    return (user?.user_metadata as Record<string, string> | undefined)?.full_name || "Akun Anda";
  }, [profile?.full_name, user?.user_metadata]);

  const handleProfileChange = (field: keyof typeof profileForm) =>
    (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setProfileForm((current) => ({ ...current, [field]: event.target.value }));
    };

  const handleProfileSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!user?.id) return;

    try {
      await saveProfile({
        full_name: profileForm.fullName.trim() || null,
        phone: profileForm.phone.trim() || null,
        city: profileForm.city.trim() || null,
        address: profileForm.address.trim() || null,
        postal_code: profileForm.postalCode.trim() || null,
      });

      toast({
        title: "Profil diperbarui",
        description: "Data penerima kamu berhasil disimpan.",
      });
    } catch (error) {
      console.error("handleProfileSubmit error:", error);
      toast({
        title: "Gagal menyimpan profil",
        description: "Periksa koneksi atau coba lagi sebentar lagi.",
        variant: "destructive",
      });
    }
  };

  if (!user || isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Memuat halaman profil</CardTitle>
            <CardDescription>Menyiapkan data akun Anda...</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-10 w-full animate-pulse rounded-md bg-muted" />
          </CardContent>
        </Card>
      </div>
    );
  }

return (
  <div className="min-h-screen bg-muted/30 py-10 px-4">
    <div className="max-w-3xl mx-auto space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm text-muted-foreground">Perbarui data penerima & kontak</p>
          <h1 className="text-3xl font-bold">Edit Profil</h1>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={() => navigate("/dashboard")}>Dashboard</Button>
          <Button onClick={() => navigate("/")}>Kembali ke toko</Button>
        </div>
      </div>

      {/* Profile Card */}
      <Card>
        <CardHeader className="flex flex-row items-center gap-4 space-y-0">
          <Avatar className="h-14 w-14">
            <AvatarImage
              src={(user.user_metadata as Record<string, string> | undefined)?.avatar_url}
              alt="Avatar pengguna"
            />
            <AvatarFallback>{initial}</AvatarFallback>
          </Avatar>
          <div>
            <CardTitle>{displayName}</CardTitle>
            <CardDescription>{user.email}</CardDescription>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <p className="text-sm text-muted-foreground">
            Lengkapi detail penerima agar checkout berikutnya lebih cepat dan akurat.
          </p>

          <Separator />

          {/* Form */}
          <form className="space-y-6" onSubmit={handleProfileSubmit}>
            
            {/* Full name */}
            <div className="space-y-2">
              <Label htmlFor="fullName">Nama lengkap</Label>
              <Input
                id="fullName"
                value={profileForm.fullName}
                onChange={handleProfileChange("fullName")}
                placeholder=""
                disabled={profileLoading || saveProfilePending}
              />
            </div>

            {/* Phone + City + Postal Code */}
<div className="grid gap-4 md:grid-cols-3">
  
  <div className="space-y-2">
    <Label htmlFor="phone">Nomor Telepon</Label>
    <Input
      id="phone"
      value={profileForm.phone}
      onChange={handleProfileChange("phone")}
      placeholder="0812xxxxxxx"
      disabled={profileLoading || saveProfilePending}
    />
  </div>

  <div className="space-y-2">
    <Label htmlFor="city">Kota / Kabupaten</Label>
    <Input
      id="city"
      value={profileForm.city}
      onChange={handleProfileChange("city")}
      placeholder=""
      disabled={profileLoading || saveProfilePending}
    />
  </div>

  <div className="space-y-2">
    <Label htmlFor="postalCode">Kode Pos</Label>
    <Input
      id="postalCode"
      value={profileForm.postalCode}
      onChange={handleProfileChange("postalCode")}
      placeholder=""
      disabled={profileLoading || saveProfilePending}
    />
  </div>

</div>


            {/* Address */}
            <div className="space-y-2">
              <Label htmlFor="address">Alamat lengkap</Label>
              <Textarea
                id="address"
                value={profileForm.address}
                onChange={handleProfileChange("address")}
                placeholder=""
                disabled={profileLoading || saveProfilePending}
                rows={3}
              />
            </div>

            {/* Submit */}
            <div className="flex flex-wrap items-center gap-4">
              <Button
                type="submit"
                disabled={profileLoading || saveProfilePending}
              >
                {saveProfilePending ? "Menyimpan..." : "Simpan perubahan"}
              </Button>

              <p className="text-xs text-muted-foreground">
                Informasi ini akan otomatis terisi saat kamu checkout.
              </p>
            </div>

          </form>
        </CardContent>
      </Card>
    </div>
  </div>
);

};

export default EditProfile;
