"use client";

import { useEffect, useRef, useState } from "react";
import { Camera, LoaderCircle, RotateCw, ScanLine, X } from "lucide-react";

export default function BarcodeScannerModal({ open, onClose, onDetected, targetLabel = "IMEI" }) {
  const videoRef = useRef(null);
  const detectedRef = useRef(false);
  const onCloseRef = useRef(onClose);
  const onDetectedRef = useRef(onDetected);
  const [status, setStatus] = useState("starting");
  const [message, setMessage] = useState("");
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => { onCloseRef.current = onClose; }, [onClose]);
  useEffect(() => { onDetectedRef.current = onDetected; }, [onDetected]);

  useEffect(() => {
    if (!open) return;
    let active = true;
    let controls;
    let closeTimeout;
    const videoElement = videoRef.current;
    detectedRef.current = false;
    queueMicrotask(() => {
      if (!active) return;
      setStatus("starting");
      setMessage("");
    });

    const start = async () => {
      try {
        if (!window.isSecureContext && window.location.hostname !== "localhost") {
          throw new Error("Camera scanning requires HTTPS.");
        }
        const [{ BrowserMultiFormatReader }, { BarcodeFormat, DecodeHintType }] = await Promise.all([
          import("@zxing/browser"),
          import("@zxing/library"),
        ]);
        const hints = new Map();
        hints.set(DecodeHintType.POSSIBLE_FORMATS, [
          BarcodeFormat.CODE_128,
          BarcodeFormat.CODE_39,
          BarcodeFormat.CODE_93,
          BarcodeFormat.ITF,
          BarcodeFormat.CODABAR,
        ]);
        hints.set(DecodeHintType.ALLOWED_LENGTHS, Int32Array.from([15]));
        const reader = new BrowserMultiFormatReader(hints, {
          delayBetweenScanAttempts: 60,
          delayBetweenScanSuccess: 150,
          tryPlayVideoTimeout: 3000,
        });
        controls = await reader.decodeFromConstraints({
          audio: false,
          video: {
            facingMode: { ideal: "environment" },
            width: { ideal: 1280 },
            height: { ideal: 720 },
            advanced: [{ focusMode: "continuous" }],
          },
        }, videoElement, (result) => {
          if (!active || detectedRef.current || !result) return;
          const rawValue = result.getText().trim();
          const digits = rawValue.replace(/\D/g, "");
          if (digits.length !== 15) {
            setStatus("scanning");
            setMessage(`Detected ${digits.length || rawValue.length} characters. Point the camera at a 15-digit IMEI barcode.`);
            return;
          }
          detectedRef.current = true;
          controls?.stop();
          setStatus("success");
          setMessage(`IMEI ${digits} detected`);
          onDetectedRef.current(digits);
          closeTimeout = window.setTimeout(() => onCloseRef.current(), 450);
        });
        if (active) {
          setStatus("scanning");
          setMessage("Hold the 15-digit IMEI barcode inside the frame.");
        }
      } catch (error) {
        if (!active) return;
        setStatus("error");
        if (error?.name === "NotAllowedError") setMessage("Camera permission was denied. Allow camera access in your browser settings and try again.");
        else if (error?.name === "NotFoundError") setMessage("No camera was found on this device.");
        else setMessage(error?.message || "Could not start the camera scanner.");
      }
    };

    start();
    return () => {
      active = false;
      window.clearTimeout(closeTimeout);
      controls?.stop();
      const stream = videoElement?.srcObject;
      stream?.getTracks?.().forEach((track) => track.stop());
    };
  }, [open, retryKey]);

  if (!open) return null;

  return <div className="fixed inset-0 z-[150] grid place-items-center bg-black/75 p-3 backdrop-blur-[2px]" role="dialog" aria-modal="true" aria-labelledby="scanner-title">
    <div className="w-full max-w-xl overflow-hidden rounded-[24px] bg-white shadow-2xl">
      <div className="flex items-start justify-between gap-4 border-b px-5 py-4">
        <div><h2 id="scanner-title" className="flex items-center gap-2 text-base font-black"><ScanLine size={19}/>Scan {targetLabel} barcode</h2><p className="mt-1 text-[10px] text-[#747c76]">The detected 15-digit number will fill the selected product field automatically.</p></div>
        <button type="button" onClick={onClose} aria-label="Close barcode scanner" className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#f0f2f0]"><X size={16}/></button>
      </div>

      <div className="relative aspect-[4/3] overflow-hidden bg-black">
        <video ref={videoRef} autoPlay muted playsInline className="h-full w-full object-cover"/>
        <div className="pointer-events-none absolute inset-[17%_8%] rounded-2xl border-2 border-white/90 shadow-[0_0_0_999px_rgba(0,0,0,.38)]">
          <span className="absolute -left-0.5 -top-0.5 h-8 w-8 rounded-tl-2xl border-l-4 border-t-4 border-[#42df83]"/>
          <span className="absolute -right-0.5 -top-0.5 h-8 w-8 rounded-tr-2xl border-r-4 border-t-4 border-[#42df83]"/>
          <span className="absolute -bottom-0.5 -left-0.5 h-8 w-8 rounded-bl-2xl border-b-4 border-l-4 border-[#42df83]"/>
          <span className="absolute -bottom-0.5 -right-0.5 h-8 w-8 rounded-br-2xl border-b-4 border-r-4 border-[#42df83]"/>
          {status === "scanning" && <span className="absolute inset-x-3 top-1/2 h-px animate-pulse bg-[#42df83] shadow-[0_0_10px_2px_#42df83]"/>}
        </div>
        {status === "starting" && <div className="absolute inset-0 grid place-items-center bg-black/70 text-white"><div className="text-center"><LoaderCircle size={28} className="mx-auto animate-spin"/><p className="mt-3 text-xs font-bold">Starting camera…</p></div></div>}
      </div>

      <div className="flex items-start gap-3 px-5 py-4">
        <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl ${status === "error" ? "bg-red-50 text-red-600" : status === "success" ? "bg-green-50 text-green-700" : "bg-[#eef4ef] text-[#173f2c]"}`}><Camera size={17}/></span>
        <div className="min-w-0 flex-1"><p className="text-xs font-black">{status === "error" ? "Camera unavailable" : status === "success" ? "Barcode detected" : "Scanning…"}</p><p className={`mt-1 text-[10px] leading-5 ${status === "error" ? "text-red-600" : "text-[#747c76]"}`}>{message}</p>{status === "error" && <button type="button" onClick={() => setRetryKey((key) => key + 1)} className="mt-3 inline-flex items-center gap-2 rounded-full border border-red-200 px-4 py-2 text-[10px] font-bold text-red-700"><RotateCw size={13}/>Try camera again</button>}</div>
      </div>
    </div>
  </div>;
}
