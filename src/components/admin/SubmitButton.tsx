"use client";

import { useFormStatus } from "react-dom";
import type { ReactNode } from "react";

export function SubmitButton({ children = "حفظ", className = "" }: { children?: ReactNode; className?: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className={`rounded-xl bg-navy px-5 py-3 text-sm font-bold text-white transition disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
    >
      {pending ? "جاري الحفظ..." : children}
    </button>
  );
}
