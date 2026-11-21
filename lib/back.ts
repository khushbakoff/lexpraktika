"use client";

/** Foydalanuvchi vaziyatga qayerdan kirganini eslab qoladi: "Orqaga" aynan shu joyga qaytaradi. */
const KEY = "lexsim-back";

export function rememberBack(path: string) {
  try {
    sessionStorage.setItem(KEY, path);
  } catch {
    /* saqlash mumkin bo'lmasa, standart yo'l ishlatiladi */
  }
}

export function readBack(): string | null {
  try {
    return sessionStorage.getItem(KEY);
  } catch {
    return null;
  }
}

export const BACK_LABEL: Record<string, string> = {
  "/": "Bosh sahifa",
  "/ariza": "Ariza",
  "/vaziyatlar": "Vaziyatlar",
  "/ish-beruvchi": "Ish beruvchi",
};
