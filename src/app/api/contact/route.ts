import { NextResponse } from "next/server";
import { Resend } from "resend";
import { z } from "zod";

import { siteConfig } from "@/data/solaris";

const contactSchema = z.object({
  type: z.literal("contact"),
  name: z.string().trim().min(1).max(200),
  email: z.string().trim().email().max(200),
  message: z.string().trim().min(1).max(5000),
});

const bookingSchema = z.object({
  type: z.literal("booking"),
  name: z.string().trim().min(1).max(200),
  email: z.string().trim().email().max(200),
  date: z.string().trim().min(1).max(50),
  time: z.string().trim().min(1).max(50),
  topic: z.string().trim().max(2000).optional(),
});

const payloadSchema = z.discriminatedUnion("type", [contactSchema, bookingSchema]);

export async function POST(request: Request) {
  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = payloadSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid submission" }, { status: 400 });
  }

  const data = parsed.data;
  const subject =
    data.type === "booking"
      ? `Neue Terminanfrage von ${data.name}`
      : `Neue Projektanfrage von ${data.name}`;

  const body =
    data.type === "booking"
      ? `Name: ${data.name}\nEmail: ${data.email}\nDate: ${data.date}\nTime: ${data.time} (${siteConfig.timezone})\nTopic: ${data.topic || "(not provided)"}`
      : `Name: ${data.name}\nEmail: ${data.email}\n\nMessage:\n${data.message}`;

  const apiKey = process.env.RESEND_API_KEY;
  const toEmail = process.env.CONTACT_EMAIL || siteConfig.email;

  if (!apiKey) {
    console.log(`[contact] RESEND_API_KEY not set, logging submission instead:\n${subject}\n${body}`);
    return NextResponse.json({ ok: true, delivered: false });
  }

  try {
    const resend = new Resend(apiKey);
    await resend.emails.send({
      from: process.env.CONTACT_FROM_EMAIL || "Solaris Industrial <onboarding@resend.dev>",
      to: toEmail,
      replyTo: data.email,
      subject,
      text: body,
    });
    return NextResponse.json({ ok: true, delivered: true });
  } catch (error) {
    console.error("[contact] Failed to send email", error);
    return NextResponse.json({ error: "Failed to send message" }, { status: 502 });
  }
}
