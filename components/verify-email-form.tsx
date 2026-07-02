"use client";

import { ArrowLeft, LoaderCircle, MailCheck } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { toast } from "sonner";
import { authService } from "@/services/auth.service";
import { getErrorMessage } from "@/lib/utils";
import { Logo } from "./logo";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

export function VerifyEmailForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email")?.trim().toLowerCase() || "";
  const [code, setCode] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [resending, setResending] = useState(false);

  useEffect(() => {
    const developmentCode = window.sessionStorage.getItem(
      "cafze_verification_code",
    );
    if (developmentCode) setCode(developmentCode);
  }, []);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!email) return;
    setSubmitting(true);
    try {
      await authService.verifyEmail({ email, code });
      window.sessionStorage.removeItem("cafze_verification_code");
      toast.success("Email verified. You can now sign in.");
      router.replace(`/login?email=${encodeURIComponent(email)}`);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  }

  async function resend() {
    if (!email || resending) return;
    setResending(true);
    try {
      const result = await authService.resendVerification(email);
      if (result.developmentCode) {
        setCode(result.developmentCode);
      }
      toast.success("A new verification code was sent.");
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setResending(false);
    }
  }

  return (
    <main className="grid min-h-screen place-items-center bg-[#f5f8f6] px-4 py-10">
      <section className="w-full max-w-md rounded-lg border border-border bg-background p-6 shadow-soft sm:p-8">
        <Logo />
        <span className="mt-9 grid h-11 w-11 place-items-center rounded-md bg-secondary text-primary">
          <MailCheck size={21} />
        </span>
        <h1 className="mt-4 text-2xl font-extrabold">Verify your email</h1>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Enter the six-digit code sent to{" "}
          <strong className="text-foreground">{email || "your email"}</strong>.
        </p>

        <form className="mt-7 grid gap-4" onSubmit={submit}>
          <div className="grid gap-2">
            <Label htmlFor="code">Verification code</Label>
            <Input
              id="code"
              inputMode="numeric"
              autoComplete="one-time-code"
              pattern="[0-9]{6}"
              maxLength={6}
              className="h-12 text-center text-lg font-bold"
              placeholder="000000"
              value={code}
              onChange={(event) =>
                setCode(event.target.value.replace(/\D/g, "").slice(0, 6))
              }
              required
            />
          </div>
          <Button size="lg" disabled={submitting || code.length !== 6 || !email}>
            {submitting && <LoaderCircle className="animate-spin" size={17} />}
            Verify email
          </Button>
        </form>

        <div className="mt-5 flex items-center justify-between gap-3 text-xs">
          <Link
            href="/register"
            className="inline-flex items-center gap-1 font-semibold text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft size={14} />
            Back
          </Link>
          <button
            type="button"
            className="font-bold text-primary hover:underline disabled:opacity-50"
            disabled={resending || !email}
            onClick={resend}
          >
            {resending ? "Sending..." : "Resend code"}
          </button>
        </div>
      </section>
    </main>
  );
}
