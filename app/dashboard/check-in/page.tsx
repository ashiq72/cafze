"use client";

import type { IScannerControls } from "@zxing/browser";
import {
  AlertTriangle,
  Camera,
  CheckCircle2,
  Keyboard,
  LoaderCircle,
  RefreshCw,
  ScanLine,
  XCircle,
} from "lucide-react";
import { FormEvent, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ticketService } from "@/services/ticket.service";
import type { CheckinResult } from "@/types";
import { getErrorMessage } from "@/lib/utils";

export default function CheckinPage() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const controlsRef = useRef<IScannerControls | null>(null);
  const busyRef = useRef(false);
  const startingRef = useRef(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraStarting, setCameraStarting] = useState(false);
  const [cameraError, setCameraError] = useState("");
  const [ticketId, setTicketId] = useState("");
  const [checking, setChecking] = useState(false);
  const [result, setResult] = useState<CheckinResult | null>(null);

  useEffect(
    () => () => {
      controlsRef.current?.stop();
      controlsRef.current = null;
    },
    [],
  );

  async function startCamera() {
    if (startingRef.current || cameraActive || !videoRef.current) return;
    controlsRef.current?.stop();
    controlsRef.current = null;
    startingRef.current = true;
    setCameraStarting(true);
    setCameraError("");
    setResult(null);
    busyRef.current = false;

    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error("This browser does not support camera access.");
      }
      const { BrowserQRCodeReader } = await import("@zxing/browser");
      const reader = new BrowserQRCodeReader();
      const controls = await reader.decodeFromConstraints(
        {
          audio: false,
          video: {
            facingMode: { ideal: "environment" },
          },
        },
        videoRef.current!,
        (scanResult, _error, scannerControls) => {
          if (!scanResult || busyRef.current) return;
          busyRef.current = true;
          scannerControls.stop();
          controlsRef.current = null;
          setCameraActive(false);
          void checkTicket(extractTicketId(scanResult.getText()));
        },
      );
      controlsRef.current = controls;
      if (busyRef.current) {
        controls.stop();
      } else {
        setCameraActive(true);
      }
    } catch (error) {
      setCameraActive(false);
      setCameraError(cameraMessage(error));
    } finally {
      startingRef.current = false;
      setCameraStarting(false);
    }
  }

  async function checkTicket(value: string) {
    const normalized = value.trim();
    if (!normalized || checking) return;
    setChecking(true);
    setResult(null);
    setCameraError("");
    try {
      setResult(await ticketService.checkin(normalized));
    } catch (error) {
      const message = getErrorMessage(error);
      setCameraError(message);
      toast.error(message);
    } finally {
      setChecking(false);
    }
  }

  function handleManualSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    controlsRef.current?.stop();
    controlsRef.current = null;
    setCameraActive(false);
    busyRef.current = true;
    void checkTicket(ticketId);
  }

  function resetScanner() {
    setResult(null);
    setTicketId("");
    busyRef.current = false;
    void startCamera();
  }

  return (
    <div className="mx-auto max-w-4xl">
      <div>
        <p className="text-xs font-extrabold uppercase text-primary">
          Door operations
        </p>
        <h1 className="mt-1 page-title">Ticket check-in</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Scan a guest&apos;s QR code or enter the ticket ID manually.
        </p>
      </div>

      <div className="mt-7 grid gap-7 lg:grid-cols-[minmax(0,1fr)_320px]">
        <section>
          <div className="relative aspect-[4/3] min-h-72 overflow-hidden rounded-lg bg-[#102f28]">
            <video
              ref={videoRef}
              className="h-full w-full object-cover"
              muted
              playsInline
            />

            {!cameraActive && !checking && !result && (
              <div className="absolute inset-0 grid place-items-center p-6 text-center text-white">
                <div>
                  <span className="mx-auto grid h-12 w-12 place-items-center rounded-md bg-white/10">
                    <Camera size={23} />
                  </span>
                  <h2 className="mt-4 text-base font-extrabold">
                    Ready to scan
                  </h2>
                  <p className="mx-auto mt-2 max-w-sm text-xs leading-5 text-white/65">
                    Camera access works on HTTPS or localhost. Use the rear
                    camera for the fastest scan.
                  </p>
                  <Button
                    className="mt-5 bg-white text-[#123d31] hover:bg-white/90"
                    onClick={startCamera}
                    disabled={cameraStarting}
                  >
                    {cameraStarting ? (
                      <LoaderCircle className="animate-spin" size={17} />
                    ) : (
                      <ScanLine size={17} />
                    )}
                    {cameraStarting ? "Starting camera" : "Start camera"}
                  </Button>
                </div>
              </div>
            )}

            {cameraActive && (
              <>
                <div className="pointer-events-none absolute inset-[12%] border border-white/50">
                  <span className="absolute -left-0.5 -top-0.5 h-8 w-8 border-l-4 border-t-4 border-accent" />
                  <span className="absolute -right-0.5 -top-0.5 h-8 w-8 border-r-4 border-t-4 border-accent" />
                  <span className="absolute -bottom-0.5 -left-0.5 h-8 w-8 border-b-4 border-l-4 border-accent" />
                  <span className="absolute -bottom-0.5 -right-0.5 h-8 w-8 border-b-4 border-r-4 border-accent" />
                </div>
                <span className="absolute inset-x-0 bottom-4 mx-auto w-fit rounded-full bg-black/55 px-3 py-1.5 text-[11px] font-bold text-white backdrop-blur">
                  Align QR code inside the frame
                </span>
              </>
            )}

            {checking && (
              <div className="absolute inset-0 grid place-items-center bg-[#102f28]/95 text-white">
                <span className="grid justify-items-center gap-3 text-sm font-bold">
                  <LoaderCircle className="animate-spin" size={25} />
                  Checking ticket
                </span>
              </div>
            )}

            {result && <CheckinOverlay result={result} onReset={resetScanner} />}
          </div>

          {cameraError && (
            <div className="mt-3 flex gap-2 rounded-md border border-amber-200 bg-amber-50 p-3 text-xs leading-5 text-amber-900">
              <AlertTriangle className="mt-0.5 shrink-0" size={15} />
              <span>
                Camera could not start. Check browser permission or use manual
                entry. {cameraError}
              </span>
            </div>
          )}
        </section>

        <aside>
          <div className="rounded-lg border border-border bg-background p-5">
            <div className="flex items-center gap-2">
              <Keyboard size={17} className="text-primary" />
              <h2 className="text-sm font-extrabold">Manual entry</h2>
            </div>
            <p className="mt-2 text-xs leading-5 text-muted-foreground">
              Use this when a guest&apos;s screen is damaged or camera access is
              unavailable.
            </p>
            <form className="mt-5 grid gap-3" onSubmit={handleManualSubmit}>
              <div className="grid gap-2">
                <Label className="text-xs" htmlFor="ticketId">
                  Ticket ID
                </Label>
                <Input
                  id="ticketId"
                  placeholder="e.g. TKT-24091"
                  value={ticketId}
                  onChange={(event) => setTicketId(event.target.value)}
                  autoComplete="off"
                  required
                />
              </div>
              <Button disabled={checking || !ticketId.trim()}>
                {checking ? (
                  <LoaderCircle className="animate-spin" size={16} />
                ) : (
                  <CheckCircle2 size={16} />
                )}
                Check ticket
              </Button>
            </form>
          </div>

          <div className="mt-4 border-y border-border py-4 text-xs text-muted-foreground">
            <strong className="block text-foreground">Fast check-in tips</strong>
            <ul className="mt-2 grid gap-2 leading-5">
              <li>Keep the guest&apos;s screen brightness high.</li>
              <li>Hold the camera steady around 20 cm away.</li>
              <li>Each QR code can only be checked in once.</li>
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}

function CheckinOverlay({
  result,
  onReset,
}: {
  result: CheckinResult;
  onReset: () => void;
}) {
  const valid = result.status === "valid";
  const used = result.status === "already-used";
  const Icon = valid ? CheckCircle2 : used ? AlertTriangle : XCircle;

  return (
    <div
      className={`absolute inset-0 grid place-items-center p-6 text-center text-white ${
        valid ? "bg-[#126147]/95" : used ? "bg-[#9a6715]/95" : "bg-[#9f3131]/95"
      }`}
    >
      <div>
        <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-white/15">
          <Icon size={29} />
        </span>
        <p className="mt-4 text-xs font-extrabold uppercase text-white/70">
          {valid ? "Valid ticket" : used ? "Already used" : "Invalid ticket"}
        </p>
        <h2 className="mt-1 text-xl font-extrabold">
          {valid
            ? result.attendee?.name || "Guest checked in"
            : used
              ? "Entry already recorded"
              : "Entry not allowed"}
        </h2>
        <p className="mx-auto mt-2 max-w-sm text-xs leading-5 text-white/75">
          {result.message}
        </p>
        <Button
          className="mt-5 bg-white text-foreground hover:bg-white/90"
          onClick={onReset}
        >
          <RefreshCw size={16} />
          Scan next ticket
        </Button>
      </div>
    </div>
  );
}

function extractTicketId(raw: string) {
  try {
    const parsed = JSON.parse(raw) as { ticketId?: string; id?: string };
    if (parsed.ticketId || parsed.id) return parsed.ticketId || parsed.id || raw;
  } catch {
    // QR values may be plain IDs or URLs.
  }

  try {
    const url = new URL(raw);
    return (
      url.searchParams.get("ticketId") ||
      url.pathname.split("/").filter(Boolean).at(-1) ||
      raw
    );
  } catch {
    return raw;
  }
}

function cameraMessage(error: unknown) {
  if (error instanceof DOMException) {
    if (error.name === "NotAllowedError") {
      return "Camera permission was denied. Allow camera access in your browser settings or use manual entry.";
    }
    if (error.name === "NotFoundError") {
      return "No camera was found on this device.";
    }
    if (error.name === "NotReadableError") {
      return "The camera is already being used by another application.";
    }
  }
  return error instanceof Error
    ? error.message
    : "Camera access is unavailable on this device.";
}
