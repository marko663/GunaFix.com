"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import { addIssueComment, closeIssue, setIssueLabels } from "@/lib/github";
import { clearAuthCookie, isAuthed, setAuthCookie, verifyPassword } from "@/lib/dashboardAuth";

export async function login(formData: FormData) {
  const password = String(formData.get("password") || "");
  if (!verifyPassword(password)) {
    redirect("/dashboard?error=1");
  }
  await setAuthCookie();
  redirect("/dashboard");
}

export async function logout() {
  await clearAuthCookie();
  redirect("/dashboard");
}

export async function decideAction(formData: FormData) {
  if (!(await isAuthed())) return;
  const number = Number(formData.get("number"));
  const decision = String(formData.get("decision"));
  await addIssueComment(number, decision === "granted" ? "approve" : "deny");
  revalidatePath("/dashboard");
}

export async function markContactedAction(formData: FormData) {
  if (!(await isAuthed())) return;
  const number = Number(formData.get("number"));
  const currentLabels = String(formData.get("currentLabels") || "")
    .split(",")
    .filter(Boolean);
  const nextLabels = [...currentLabels.filter((l) => !l.startsWith("status:")), "status:contacted"];
  await setIssueLabels(number, nextLabels);
  revalidatePath("/dashboard");
}

export async function closeIssueAction(formData: FormData) {
  if (!(await isAuthed())) return;
  const number = Number(formData.get("number"));
  await closeIssue(number);
  revalidatePath("/dashboard");
}
