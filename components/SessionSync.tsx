"use client";

import { useEffect } from "react";
import { refreshMe } from "@/lib/me";

/** Ilova ochilganda sessiyani bir marta tekshiradi. */
export default function SessionSync() {
  useEffect(() => {
    void refreshMe();
  }, []);
  return null;
}
