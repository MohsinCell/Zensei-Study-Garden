"use client";

import { useState, useRef, useEffect, useCallback, KeyboardEvent, ClipboardEvent } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { InlineLoader } from "@/components/ui/Loader";

type Step = "email" | "verify";

const OTP_DURATION = 120;
const RESEND_COOLDOWN = 90;

function getPasswordStrength(pw: string) {
  if (!pw) return { score: 0, label: "", color: "" };
  let s = 0;
  if (pw.length >= 6) s++;
  if (pw.length >= 10) s++;
  if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) s++;
  if (/\d/.test(pw)) s++;
  if (/[^a-zA-Z0-9]/.test(pw)) s++;

  if (s <= 1) return { score: s, label: "Weak", color: "var(--color-error)" };
  if (s === 2) return { score: s, label: "Fair", color: "var(--color-ember)" };
  if (s === 3) return { score: s, label: "Good", color: "var(--color-gold)" };
  return { score: s, label: "Strong", color: "var(--color-accent)" };
}

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [digits, setDigits] = useState<string[]>(["", "", "", "", "", ""]);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [otpComplete, setOtpComplete] = useState(false);
  const [shakeCells, setShakeCells] = useState(false);
  const [otpTimer, setOtpTimer] = useState(OTP_DURATION);
  const [resendTimer, setResendTimer] = useState(0);
  const [resending, setResending] = useState(false);

  const digitRefs = useRef<(HTMLInputElement | null)[]>([]);
  const otpIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const resendIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const code = digits.join("");
  const strength = getPasswordStrength(password);

  useEffect(() => {
    setOtpComplete(code.length === 6 && digits.every((d) => d !== ""));
  }, [digits, code]);

  // OTP expiry countdown
  useEffect(() => {
    if (step === "verify") {
      setOtpTimer(OTP_DURATION);
      otpIntervalRef.current = setInterval(() => {
        setOtpTimer((prev) => {
          if (prev <= 1) {
            if (otpIntervalRef.current) clearInterval(otpIntervalRef.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => { if (otpIntervalRef.current) clearInterval(otpIntervalRef.current); };
  }, [step]);

  // Resend cooldown
  useEffect(() => {
    if (resendTimer > 0) {
      resendIntervalRef.current = setInterval(() => {
        setResendTimer((prev) => {
          if (prev <= 1) {
            if (resendIntervalRef.current) clearInterval(resendIntervalRef.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => { if (resendIntervalRef.current) clearInterval(resendIntervalRef.current); };
  }, [resendTimer]);

  const focusCell = (i: number) => digitRefs.current[i]?.focus();

  const handleDigitChange = (i: number, value: string) => {
    const clean = value.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
    if (clean.length > 1) {
      const pasted = clean.slice(0, 6);
      const next = ["", "", "", "", "", ""];
      pasted.split("").forEach((ch, j) => { next[j] = ch; });
      setDigits(next);
      setError("");
      setTimeout(() => focusCell(Math.min(pasted.length - 1, 5)), 0);
      return;
    }
    const d = clean.slice(-1);
    const next = [...digits];
    next[i] = d;
    setDigits(next);
    setError("");
    if (d && i < 5) focusCell(i + 1);
  };

  const handleDigitKeyDown = (i: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      if (digits[i]) {
        const next = [...digits]; next[i] = ""; setDigits(next);
      } else if (i > 0) {
        focusCell(i - 1);
        const next = [...digits]; next[i - 1] = ""; setDigits(next);
      }
    } else if (e.key === "ArrowLeft" && i > 0) focusCell(i - 1);
    else if (e.key === "ArrowRight" && i < 5) focusCell(i + 1);
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/[^a-zA-Z0-9]/g, "").toUpperCase().slice(0, 6);
    if (!pasted) return;
    const next = ["", "", "", "", "", ""];
    pasted.split("").forEach((ch, i) => { next[i] = ch; });
    setDigits(next);
    setError("");
    setTimeout(() => focusCell(Math.min(pasted.length - 1, 5)), 0);
  };

  const triggerShake = () => {
    setShakeCells(true);
    setTimeout(() => setShakeCells(false), 600);
  };

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`;

  const sendOtp = useCallback(async () => {
    const res = await fetch("/api/auth/otp/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: email.trim(), type: "forgot-password" }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to send code");
  }, [email]);

  // Resend OTP
  const handleResendCode = async () => {
    if (resendTimer > 0 || resending) return;
    setResending(true);
    setError("");
    try {
      await sendOtp();
      setDigits(["", "", "", "", "", ""]);
      setResendTimer(RESEND_COOLDOWN);
      setOtpTimer(OTP_DURATION);
      if (otpIntervalRef.current) clearInterval(otpIntervalRef.current);
      otpIntervalRef.current = setInterval(() => {
        setOtpTimer((prev) => {
          if (prev <= 1) {
            if (otpIntervalRef.current) clearInterval(otpIntervalRef.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      setResending(false);
      setTimeout(() => focusCell(0), 100);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to resend");
      setResending(false);
    }
  };

  // Step 1: send reset code
  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email.trim()) { setError("Email is required"); return; }

    setLoading(true);
    try {
      await sendOtp();
      setStep("verify");
      setResendTimer(RESEND_COOLDOWN);
      setLoading(false);
      setTimeout(() => focusCell(0), 100);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setLoading(false);
    }
  };

  // Step 2: verify OTP + set new password
  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (otpTimer === 0) { setError("Code expired - resend a new one"); triggerShake(); return; }
    if (!otpComplete) { setError("Enter the full 6-character code"); triggerShake(); return; }
    if (!password.trim()) { setError("New password is required"); return; }
    if (password.length < 6) { setError("Password must be at least 6 characters"); return; }
    if (password !== confirmPassword) { setError("Passwords don't match"); return; }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/otp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          code: code.trim(),
          type: "forgot-password",
          password,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Invalid code");
        triggerShake();
        setLoading(false);
        return;
      }

      const result = await signIn("credentials", {
        email: email.trim(),
        password,
        redirect: false,
      });

      if (result?.error) {
        setError(result.error);
        setLoading(false);
      } else {
        router.push("/explore");
      }
    } catch {
      setError("Something went wrong");
      setLoading(false);
    }
  };

  const stepIndex = step === "email" ? 0 : 1;

  return (
    <div className="auth-page px-4 py-8 sm:py-12 !overflow-y-auto">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-[10%] w-80 h-80 bg-accent/[0.04] rounded-full blur-[100px]" />
        <div className="absolute bottom-1/4 right-[10%] w-64 h-64 bg-gold/[0.03] rounded-full blur-[80px]" />
      </div>

      <div className="w-full max-w-[384px] relative">
        <div className="quest-frame rounded-2xl bg-bg-card/70 backdrop-blur-sm border border-border-subtle p-5 sm:p-8 animate-fade-in-scale">
          <div className="text-center mb-6">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-gold/20 to-gold/5 border border-gold/25 flex items-center justify-center mx-auto mb-5 shadow-[0_0_24px_rgba(212,181,125,0.1)]">
              <KeyIcon className="w-7 h-7 text-gold" />
            </div>
            <h1 className="text-xl font-bold tracking-tight">
              {step === "email" ? "Reset password" : "Almost there"}
            </h1>
            <p className="text-text-muted text-[13px] mt-1.5 leading-relaxed">
              {step === "email"
                ? "Enter your email and we'll send you a reset code"
                : `Enter the code sent to ${email}`}
            </p>
          </div>

          <div className="flex items-center justify-center gap-2 mb-6">
            {[0, 1].map((i) => (
              <div key={i}>
                <div
                  className="h-1.5 rounded-full transition-all duration-300"
                  style={{
                    width: i === stepIndex ? 32 : 12,
                    background: i < stepIndex
                      ? "var(--color-gold)"
                      : i === stepIndex
                        ? "linear-gradient(90deg, var(--color-gold-dim), var(--color-gold))"
                        : "var(--color-border)",
                    boxShadow: i === stepIndex ? "0 0 8px rgba(212,181,125,0.3)" : "none",
                  }}
                />
              </div>
            ))}
          </div>

          {step === "email" && (
            <form onSubmit={handleSendCode} className="space-y-4 animate-fade-up">
              {error && <ErrorBanner message={error} />}
              <div>
                <label className="block text-[12px] text-text-muted font-semibold mb-2 uppercase tracking-wider">Email</label>
                <input
                  type="email" value={email}
                  onChange={(e) => { setEmail(e.target.value); setError(""); }}
                  placeholder="you@example.com" required
                  className="input-field focus-ring" autoFocus
                />
              </div>
              <button type="submit" disabled={loading} className="btn-primary btn-tactile w-full mt-2">
                {loading ? <InlineLoader text="Sending code..." /> : "Send Reset Code"}
              </button>
            </form>
          )}

          {step === "verify" && (
            <form onSubmit={handleVerify} className="space-y-5 animate-fade-up">
              {error && <ErrorBanner message={error} />}

              <div>
                <label className="block text-[12px] text-text-muted font-semibold mb-3 uppercase tracking-wider text-center">
                  Verification Code
                </label>
                <div
                  className={shakeCells ? "otp-shake" : ""}
                  style={{ display: "flex", gap: "8px", justifyContent: "center" }}
                >
                  {digits.map((digit, i) => (
                    <OTPCell
                      key={i}
                      index={i}
                      value={digit}
                      inputRef={(el) => { digitRefs.current[i] = el; }}
                      isComplete={otpComplete}
                      hasError={!!error}
                      onChange={(val) => handleDigitChange(i, val)}
                      onKeyDown={(e) => handleDigitKeyDown(i, e)}
                      onPaste={handlePaste}
                      disabled={loading || otpTimer === 0}
                    />
                  ))}
                </div>
                <div className="mt-3 h-0.5 rounded-full bg-border-subtle overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-300 ease-out"
                    style={{
                      width: `${(digits.filter(Boolean).length / 6) * 100}%`,
                      background: error ? "var(--color-error)" : otpComplete ? "var(--color-gold)" : "linear-gradient(90deg, var(--color-gold-dim), var(--color-gold))",
                      boxShadow: otpComplete ? "0 0 8px rgba(212,181,125,0.4)" : "none",
                    }}
                  />
                </div>

                <div className="flex items-center justify-between mt-2.5 px-0.5">
                  <span className={`text-[11px] font-mono tracking-wider ${otpTimer <= 30 ? "text-error" : "text-text-dim"}`}>
                    {otpTimer > 0 ? `Expires in ${formatTime(otpTimer)}` : "Code expired"}
                  </span>
                  <button
                    type="button"
                    onClick={handleResendCode}
                    disabled={resendTimer > 0 || resending}
                    className="text-[11px] font-semibold text-gold hover:text-gold/80 disabled:text-text-dim disabled:cursor-not-allowed transition-colors"
                  >
                    {resending ? "Sending..." : resendTimer > 0 ? `Resend in ${resendTimer}s` : "Resend code"}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[12px] text-text-muted font-semibold mb-2 uppercase tracking-wider">New Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setError(""); }}
                    placeholder="At least 6 characters"
                    required minLength={6}
                    className="input-field focus-ring pr-11"
                  />
                  <button
                    type="button" onClick={() => setShowPassword((s) => !s)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-text-dim hover:text-text-muted transition-colors p-1"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    <EyeIcon open={showPassword} />
                  </button>
                </div>

                {password && (
                  <div className="mt-2 space-y-1">
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <div
                          key={i}
                          className="h-1 flex-1 rounded-full transition-all duration-300"
                          style={{
                            background: i <= strength.score ? strength.color : "var(--color-border)",
                            boxShadow: i <= strength.score && strength.score >= 4 ? `0 0 6px ${strength.color}` : "none",
                          }}
                        />
                      ))}
                    </div>
                    <p className="text-[11px] font-medium transition-colors duration-200" style={{ color: strength.color }}>
                      {strength.label}
                    </p>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-[12px] text-text-muted font-semibold mb-2 uppercase tracking-wider">Confirm Password</label>
                <div className="relative">
                  <input
                    type={showConfirm ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => { setConfirmPassword(e.target.value); setError(""); }}
                    placeholder="Repeat your password"
                    required
                    className="input-field focus-ring pr-11"
                  />
                  <button
                    type="button" onClick={() => setShowConfirm((s) => !s)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-text-dim hover:text-text-muted transition-colors p-1"
                    aria-label={showConfirm ? "Hide password" : "Show password"}
                  >
                    <EyeIcon open={showConfirm} />
                  </button>
                </div>
                {confirmPassword && password !== confirmPassword && (
                  <p className="text-[11px] text-error mt-1.5">Passwords do not match</p>
                )}
                {confirmPassword && password === confirmPassword && confirmPassword.length >= 6 && (
                  <p className="text-[11px] text-accent mt-1.5">Passwords match</p>
                )}
              </div>

              <button
                type="submit" disabled={loading || !otpComplete || otpTimer === 0}
                className="btn-primary btn-tactile w-full"
                style={otpComplete && !loading && otpTimer > 0 ? { boxShadow: "0 0 16px rgba(212,181,125,0.2)" } : {}}
              >
                {loading ? (
                  <InlineLoader text="Resetting..." />
                ) : otpComplete && otpTimer > 0 ? (
                  <span className="flex items-center justify-center gap-2"><KeyIcon className="w-4 h-4" />Reset Password</span>
                ) : "Reset Password"}
              </button>

              <button
                type="button"
                onClick={() => { setStep("email"); setDigits(["", "", "", "", "", ""]); setError(""); setPassword(""); setConfirmPassword(""); }}
                className="btn-ghost w-full"
              >
                &larr; Back
              </button>
            </form>
          )}
        </div>

        <p className="text-center text-[13px] text-text-dim mt-6">
          Remember your password?{" "}
          <Link href="/auth/signin" className="text-accent hover:text-accent-hover font-semibold transition-colors">
            Sign in
          </Link>
        </p>
      </div>

      <OTPStyles accent="gold" />
    </div>
  );
}

function OTPCell({ index, value, inputRef, isComplete, hasError, onChange, onKeyDown, onPaste, disabled }: {
  index: number; value: string; inputRef: (el: HTMLInputElement | null) => void;
  isComplete: boolean; hasError: boolean;
  onChange: (val: string) => void; onKeyDown: (e: KeyboardEvent<HTMLInputElement>) => void;
  onPaste: (e: ClipboardEvent<HTMLInputElement>) => void; disabled: boolean;
}) {
  const [pop, setPop] = useState(false);
  const prevValue = useRef("");
  useEffect(() => {
    if (value && !prevValue.current) {
      setPop(true);
      const t = setTimeout(() => setPop(false), 280);
      return () => clearTimeout(t);
    }
    prevValue.current = value;
  }, [value]);

  return (
    <input
      ref={inputRef} type="text" inputMode="text" value={value}
      onChange={(e) => onChange(e.target.value)} onKeyDown={onKeyDown} onPaste={onPaste}
      disabled={disabled} className="otp-cell"
      data-filled={value !== ""} data-complete={isComplete} data-error={hasError} data-pop={pop}
      autoComplete="one-time-code" style={{ animationDelay: `${index * 30}ms` }}
    />
  );
}

function EyeIcon({ open }: { open: boolean }) {
  return (
    <div style={{ transition: "transform 0.3s cubic-bezier(0.34,1.56,0.64,1)", transform: open ? "rotate(180deg)" : "rotate(0deg)" }}>
      {open ? (
        <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
        </svg>
      ) : (
        <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12c1.292 4.338 5.31 7.5 10.066 7.5.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
        </svg>
      )}
    </div>
  );
}

function ErrorBanner({ message }: { message: string }) {
  return (
    <div className="bg-error/8 border border-error/20 rounded-xl p-3 animate-fade-up">
      <p className="text-error text-[13px] font-medium">{message}</p>
    </div>
  );
}

function KeyIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 0 1 3 3m3 0a6 6 0 0 1-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1 1 21.75 8.25Z" />
    </svg>
  );
}

function OTPStyles({ accent = "accent" }: { accent?: "accent" | "gold" }) {
  const isGold = accent === "gold";
  const c = isGold ? "212,181,125" : "139,171,122";
  const focusColor = isGold ? "var(--color-gold)" : "var(--color-accent)";
  const filledColor = isGold ? "var(--color-gold-dim)" : "var(--color-accent-dim)";
  const completeColor = isGold ? "var(--color-gold)" : "var(--color-accent)";

  return (
    <style>{`
      @keyframes otp-pop {
        0% { transform: scale(1); }
        40% { transform: scale(1.18) translateY(-2px); }
        70% { transform: scale(0.94); }
        100% { transform: scale(1); }
      }
      @keyframes otp-shake {
        0%, 100% { transform: translateX(0); }
        15% { transform: translateX(-5px) rotate(-1deg); }
        30% { transform: translateX(5px) rotate(1deg); }
        45% { transform: translateX(-4px); }
        60% { transform: translateX(4px); }
        75% { transform: translateX(-2px); }
        90% { transform: translateX(2px); }
      }
      @keyframes otp-complete-pulse {
        0% { box-shadow: 0 0 0 0 rgba(${c},0.4); }
        60% { box-shadow: 0 0 0 6px rgba(${c},0); }
        100% { box-shadow: 0 0 0 0 rgba(${c},0); }
      }
      .otp-cell {
        width: 44px; height: 52px; border-radius: 12px;
        background: var(--color-bg-input); border: 1.5px solid var(--color-border);
        color: var(--color-text); font-size: 1.375rem; font-weight: 700;
        text-align: center; font-family: var(--font-sans);
        caret-color: transparent; outline: none; cursor: text;
        transition: border-color 0.18s ease, box-shadow 0.18s ease, background 0.18s ease;
        -webkit-user-select: none; user-select: none;
        text-transform: uppercase;
      }
      .otp-cell:focus {
        border-color: ${focusColor}; background: var(--color-bg-elevated);
        box-shadow: 0 0 0 3px rgba(${c},0.12), inset 0 1px 3px rgba(0,0,0,0.15);
      }
      .otp-cell[data-filled="true"] {
        border-color: ${filledColor};
        background: color-mix(in srgb, var(--color-bg-elevated) 85%, ${completeColor} 15%);
      }
      .otp-cell[data-filled="true"][data-complete="true"] {
        border-color: ${completeColor};
        background: color-mix(in srgb, var(--color-bg-elevated) 80%, ${completeColor} 20%);
        animation: otp-complete-pulse 0.5s ease-out;
      }
      .otp-cell[data-error="true"] {
        border-color: var(--color-error) !important;
        background: color-mix(in srgb, var(--color-bg-input) 90%, var(--color-error) 10%);
        box-shadow: 0 0 0 3px rgba(201,93,74,0.1);
      }
      .otp-cell[data-pop="true"] {
        animation: otp-pop 0.28s cubic-bezier(0.34,1.56,0.64,1) both;
      }
      .otp-cell:disabled { opacity: 0.5; cursor: not-allowed; }
      .otp-shake { animation: otp-shake 0.5s ease-in-out; }
    `}</style>
  );
}
