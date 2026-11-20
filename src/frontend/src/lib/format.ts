import type { Timestamp } from "@/backend";

/** Backend timestamps are nanosecond bigints. */
export function timestampToDate(timestamp: Timestamp): Date | null {
  const date = new Date(Number(timestamp / 1_000_000n));
  return Number.isNaN(date.getTime()) ? null : date;
}

const dateFormatter = new Intl.DateTimeFormat("es-VE", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

const dateTimeFormatter = new Intl.DateTimeFormat("es-VE", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

export function formatDate(timestamp: Timestamp): string {
  const date = timestampToDate(timestamp);
  return date ? dateFormatter.format(date) : "—";
}

export function formatDateTime(timestamp: Timestamp): string {
  const date = timestampToDate(timestamp);
  return date ? dateTimeFormatter.format(date) : "—";
}

/** Backend money values are integer cents. */
export function centsToNumber(cents: bigint): number {
  return Number(cents) / 100;
}

export function formatUsd(cents: bigint): string {
  return new Intl.NumberFormat("es-VE", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(centsToNumber(cents));
}

export function formatBs(cents: bigint): string {
  return `Bs. ${new Intl.NumberFormat("es-VE", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(centsToNumber(cents))}`;
}

/** Parses a user-typed amount ("25,50" or "25.50") into integer cents. */
export function parseAmountToCents(raw: string): bigint | null {
  const normalized = raw.trim().replace(/\s/g, "").replace(",", ".");
  if (!/^\d+(\.\d{0,2})?$/.test(normalized)) return null;
  const [whole, fraction = ""] = normalized.split(".");
  return BigInt(whole) * 100n + BigInt(fraction.padEnd(2, "0"));
}

/** BCV rate is stored in cents of bolívares per USD. */
export function formatBcvRate(rateCents: bigint): string {
  return `Bs. ${new Intl.NumberFormat("es-VE", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(centsToNumber(rateCents))}`;
}

export function formatMegabits(megabits: bigint): string {
  return `${megabits.toString()} Mbps`;
}

export function formatMegabytes(mb: bigint): string {
  if (mb >= 1024n) {
    return `${(Number(mb) / 1024).toFixed(1)} GB`;
  }
  return `${mb.toString()} MB`;
}

export function formatPhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 11) {
    return `${digits.slice(0, 4)}-${digits.slice(4, 7)}-${digits.slice(7)}`;
  }
  return phone;
}

export function initials(fullName: string): string {
  return fullName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}
