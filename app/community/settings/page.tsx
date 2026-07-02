"use client";

import {
  Camera,
  KeyRound,
  LoaderCircle,
  LockKeyhole,
  Save,
  UserRound,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/use-auth";
import { authService } from "@/services/auth.service";
import { getErrorMessage } from "@/lib/utils";

type Section = "profile" | "password";

export default function CommunitySettingsPage() {
  const router = useRouter();
  const { user, refresh } = useAuth();
  const inputRef = useRef<HTMLInputElement>(null);
  const [section, setSection] = useState<Section>("profile");
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [location, setLocation] = useState("");
  const [website, setWebsite] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState("");
  const [saving, setSaving] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    if (!user) return;
    setName(user.name || "");
    setBio(user.bio || "");
    setLocation(user.location || "");
    setWebsite(user.website || "");
    setPreview(user.image || user.profileImage || "");
  }, [user]);

  useEffect(
    () => () => {
      if (file && preview.startsWith("blob:")) URL.revokeObjectURL(preview);
    },
    [file, preview],
  );

  function choosePhoto(next?: File) {
    if (!next) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(next.type)) {
      toast.error("Choose a JPG, PNG or WebP image.");
      return;
    }
    if (next.size > 5 * 1024 * 1024) {
      toast.error("Profile images must be 5 MB or smaller.");
      return;
    }
    if (file && preview.startsWith("blob:")) URL.revokeObjectURL(preview);
    setFile(next);
    setPreview(URL.createObjectURL(next));
  }

  async function saveProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (name.trim().length < 2 || saving) return;
    setSaving(true);
    const body = new FormData();
    body.append("name", name.trim());
    body.append("bio", bio.trim());
    body.append("location", location.trim());
    body.append("website", website.trim());
    body.append("updateTarget", "profile");
    if (file) body.append("file", file);

    try {
      await authService.updateProfile(body);
      await refresh();
      setFile(null);
      toast.success("Profile updated");
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setSaving(false);
    }
  }

  async function savePassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (saving) return;
    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match.");
      return;
    }
    setSaving(true);
    try {
      await authService.changePassword({
        currentPassword,
        newPassword,
        confirmPassword,
      });
      toast.success("Password changed. Sign in again.");
      router.replace("/login");
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="min-h-[calc(100vh-4rem)] bg-[#f5f8f6] px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-4xl">
        <div>
          <p className="text-xs font-extrabold uppercase text-primary">
            Account
          </p>
          <h1 className="mt-1 text-2xl font-extrabold">Profile settings</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Keep your community identity and account security up to date.
          </p>
        </div>

        <div className="mt-7 grid gap-7 md:grid-cols-[200px_minmax(0,1fr)]">
          <nav className="grid h-fit gap-1">
            <SettingsLink
              active={section === "profile"}
              icon={UserRound}
              label="Public profile"
              onClick={() => setSection("profile")}
            />
            <SettingsLink
              active={section === "password"}
              icon={KeyRound}
              label="Password"
              onClick={() => setSection("password")}
            />
          </nav>

          {section === "profile" ? (
            <form
              className="rounded-lg border border-border bg-background p-5 sm:p-6"
              onSubmit={saveProfile}
            >
              <h2 className="text-base font-extrabold">Public profile</h2>
              <p className="mt-1 text-xs text-muted-foreground">
                These details appear beside your posts and on your profile.
              </p>

              <div className="mt-6 flex items-center gap-4">
                {preview ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={preview}
                    alt=""
                    className="h-20 w-20 rounded-lg object-cover"
                  />
                ) : (
                  <span className="grid h-20 w-20 place-items-center rounded-lg bg-secondary text-xl font-extrabold text-primary">
                    {name.charAt(0).toUpperCase() || "C"}
                  </span>
                )}
                <div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => inputRef.current?.click()}
                  >
                    <Camera size={15} />
                    Change photo
                  </Button>
                  <p className="mt-2 text-[10px] text-muted-foreground">
                    JPG, PNG or WebP up to 5 MB
                  </p>
                  <input
                    ref={inputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="sr-only"
                    onChange={(inputEvent) =>
                      choosePhoto(inputEvent.target.files?.[0])
                    }
                  />
                </div>
              </div>

              <div className="mt-7 grid gap-5">
                <div className="grid gap-2">
                  <Label htmlFor="settings-name">Full name</Label>
                  <Input
                    id="settings-name"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    minLength={2}
                    maxLength={120}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="settings-bio">Short bio</Label>
                  <Textarea
                    id="settings-bio"
                    className="min-h-24"
                    value={bio}
                    onChange={(event) => setBio(event.target.value)}
                    maxLength={500}
                    placeholder="What brings you to this community?"
                  />
                </div>
                <div className="grid gap-5 sm:grid-cols-2">
                  <div className="grid gap-2">
                    <Label htmlFor="settings-location">Location</Label>
                    <Input
                      id="settings-location"
                      value={location}
                      onChange={(event) => setLocation(event.target.value)}
                      maxLength={200}
                      placeholder="Dhaka, Bangladesh"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="settings-website">Website</Label>
                    <Input
                      id="settings-website"
                      value={website}
                      onChange={(event) => setWebsite(event.target.value)}
                      maxLength={500}
                      placeholder="https://example.com"
                    />
                  </div>
                </div>
              </div>
              <div className="mt-7 flex justify-end">
                <Button disabled={saving || name.trim().length < 2}>
                  {saving ? (
                    <LoaderCircle className="animate-spin" size={16} />
                  ) : (
                    <Save size={16} />
                  )}
                  Save profile
                </Button>
              </div>
            </form>
          ) : (
            <form
              className="rounded-lg border border-border bg-background p-5 sm:p-6"
              onSubmit={savePassword}
            >
              <h2 className="text-base font-extrabold">Change password</h2>
              <p className="mt-1 text-xs text-muted-foreground">
                You will be signed out after changing your password.
              </p>
              <div className="mt-6 grid max-w-lg gap-5">
                <PasswordField
                  id="current-password"
                  label="Current password"
                  value={currentPassword}
                  onChange={setCurrentPassword}
                  minLength={6}
                />
                <PasswordField
                  id="new-password"
                  label="New password"
                  value={newPassword}
                  onChange={setNewPassword}
                  minLength={8}
                />
                <PasswordField
                  id="confirm-password"
                  label="Confirm new password"
                  value={confirmPassword}
                  onChange={setConfirmPassword}
                  minLength={8}
                />
              </div>
              <div className="mt-7 flex justify-end">
                <Button disabled={saving} variant="destructive">
                  {saving ? (
                    <LoaderCircle className="animate-spin" size={16} />
                  ) : (
                    <KeyRound size={16} />
                  )}
                  Change password
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </main>
  );
}

function SettingsLink({
  active,
  icon: Icon,
  label,
  onClick,
}: {
  active: boolean;
  icon: typeof UserRound;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      className={`flex h-10 items-center gap-3 rounded-md px-3 text-sm font-bold ${
        active
          ? "bg-secondary text-primary"
          : "text-muted-foreground hover:bg-background hover:text-foreground"
      }`}
      onClick={onClick}
    >
      <Icon size={16} />
      {label}
    </button>
  );
}

function PasswordField({
  id,
  label,
  value,
  minLength,
  onChange,
}: {
  id: string;
  label: string;
  value: string;
  minLength: number;
  onChange: (value: string) => void;
}) {
  return (
    <div className="grid gap-2">
      <Label htmlFor={id}>{label}</Label>
      <div className="relative">
        <LockKeyhole
          className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          size={16}
        />
        <Input
          id={id}
          className="pl-10"
          type="password"
          autoComplete={
            id === "current-password" ? "current-password" : "new-password"
          }
          value={value}
          onChange={(event) => onChange(event.target.value)}
          minLength={minLength}
          required
        />
      </div>
    </div>
  );
}
