"use client";

import {
  Eye,
  EyeOff,
  LoaderCircle,
  LockKeyhole,
  Mail,
  UserRound,
} from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useState } from "react";
import { toast } from "sonner";
import { authService } from "@/services/auth.service";
import { getErrorMessage } from "@/lib/utils";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Logo } from "./logo";

export function AuthForm({ mode }: { mode: "login" | "register" }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const isLogin = mode === "login";

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);

    try {
      if (isLogin) {
        await authService.login({ email, password });
        toast.success("Welcome back");
      } else {
        const registration = await authService.register({
          name: name.trim(),
          email: email.trim().toLowerCase(),
          password,
        });
        if (registration.developmentCode) {
          window.sessionStorage.setItem(
            "cafze_verification_code",
            registration.developmentCode,
          );
        }
        if (!authService.hasToken()) {
          toast.success("Account created. Verify your email to continue.");
          router.push(
            `/verify-email?email=${encodeURIComponent(email.trim().toLowerCase())}`,
          );
          return;
        }
        toast.success("Your organizer account is ready");
      }

      const requested = searchParams.get("returnTo");
      const destination =
        requested?.startsWith("/") && !requested.startsWith("//")
          ? requested
          : "/dashboard";
      router.replace(destination);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="grid min-h-screen lg:grid-cols-[minmax(380px,0.8fr)_1.2fr]">
      <section className="flex items-center justify-center px-5 py-10 sm:px-8">
        <div className="w-full max-w-sm">
          <Logo />
          <div className="mt-10">
            <p className="text-xs font-extrabold uppercase text-primary">
              Organizer portal
            </p>
            <h1 className="mt-2 text-2xl font-extrabold sm:text-3xl">
              {isLogin ? "Welcome back" : "Create your workspace"}
            </h1>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              {isLogin
                ? "Sign in to manage events, sales and guest check-in."
                : "Start selling tickets and managing guests in a few minutes."}
            </p>
          </div>

          <form className="mt-8 grid gap-5" onSubmit={handleSubmit}>
            {!isLogin && (
              <div className="grid gap-2">
                <Label htmlFor="name">Full name</Label>
                <div className="relative">
                  <UserRound
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                    size={16}
                  />
                  <Input
                    id="name"
                    className="pl-10"
                    autoComplete="name"
                    placeholder="Your name"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    minLength={2}
                    maxLength={120}
                    required
                  />
                </div>
              </div>
            )}
            <div className="grid gap-2">
              <Label htmlFor="email">Email address</Label>
              <div className="relative">
                <Mail
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                  size={16}
                />
                <Input
                  id="email"
                  className="pl-10"
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <LockKeyhole
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                  size={16}
                />
                <Input
                  id="password"
                  className="px-10"
                  type={showPassword ? "text" : "password"}
                  autoComplete={isLogin ? "current-password" : "new-password"}
                  placeholder="At least 6 characters"
                  minLength={6}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                />
                <button
                  type="button"
                  className="absolute right-2 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
                  onClick={() => setShowPassword((value) => !value)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <Button size="lg" disabled={submitting}>
              {submitting && <LoaderCircle className="animate-spin" size={17} />}
              {isLogin ? "Sign in" : "Create account"}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            {isLogin ? "New to Cafze?" : "Already have an account?"}{" "}
            <Link
              className="font-bold text-primary hover:underline"
              href={isLogin ? "/register" : "/login"}
            >
              {isLogin ? "Create account" : "Sign in"}
            </Link>
          </p>
          <Link
            href="/events"
            className="mt-8 block text-center text-xs font-semibold text-muted-foreground hover:text-foreground"
          >
            Continue to public events
          </Link>
        </div>
      </section>

      <aside className="relative hidden min-h-screen overflow-hidden bg-[#153f34] lg:block">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=1600&q=85"
          alt="A lively event audience"
          className="absolute inset-0 h-full w-full object-cover opacity-55"
        />
        <div className="absolute inset-0 bg-black/30" />
        <div className="absolute inset-x-0 bottom-0 p-12 text-white">
          <p className="max-w-xl text-3xl font-extrabold leading-tight">
            From first ticket to final check-in, keep your event moving.
          </p>
          <div className="mt-7 flex gap-8 text-sm">
            <span>
              <strong className="block text-xl">Mobile</strong>
              QR check-in
            </span>
            <span>
              <strong className="block text-xl">Live</strong>
              guest tracking
            </span>
            <span>
              <strong className="block text-xl">Simple</strong>
              ticket setup
            </span>
          </div>
        </div>
      </aside>
    </main>
  );
}
