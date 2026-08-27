import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

/** Junta classes do Tailwind resolvendo conflito, e é o que o shadcn e o Magic UI esperam. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
