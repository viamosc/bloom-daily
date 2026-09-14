"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SESSION_COOKIE, expectedSessionValue } from "@/lib/auth-edge";

export async function login(formData: FormData) {
  const password = String(formData.get("password") || "");
  const next = String(formData.get("next") || "/");
  const correctPassword = process.env.APP_PASSWORD;

  if (!correctPassword) {
    throw new Error("Missing APP_PASSWORD environment variable.");
  }

  if (password !== correctPassword) {
    redirect(`/login?error=1&next=${encodeURIComponent(next)}`);
  }

  const value = await expectedSessionValue();
  const store = await cookies();
  store.set(SESSION_COOKIE, value, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });

  redirect(next || "/");
}

export async function logout() {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
  redirect("/login");
}
