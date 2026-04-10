//#region imports
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
//#endregion

//#region functions
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
//#endregion
