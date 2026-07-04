import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { format } from "date-fns";
import { ja } from "date-fns/locale";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string): string {
  return format(new Date(date), "yyyy年M月d日", { locale: ja });
}

export function formatDateShort(date: Date | string): string {
  return format(new Date(date), "M月d日", { locale: ja });
}

export function readingTime(html: string): number {
  const text = html.replace(/<[^>]+>/g, "");
  return Math.max(1, Math.ceil(text.length / 400));
}

export function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, "").trim();
}
