import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const eventId = body.eventId;
    const userId = body.userId;

    if (!eventId || !userId) {
      return NextResponse.json(
        { error: "Missing eventId or userId" },
        { status: 400 }
      );
    }

    // Check if user already has a registration
    const { data: existingRegistration } = await supabaseAdmin
      .from("registrations")
      .select("*")
      .eq("event_id", eventId)
      .eq("user_id", userId)
      .eq("status", "confirmed")
      .maybeSingle();

    if (existingRegistration) {
      return NextResponse.json(
        { error: "User is already registered for this event." },
        { status: 400 }
      );
    }

    // Get event
    const { data: event, error: eventError } = await supabaseAdmin
      .from("events")
      .select("*")
      .eq("id", eventId)
      .single();

    if (eventError || !event) {
      return NextResponse.json(
        { error: "Event not found." },
        { status: 404 }
      );
    }

    // Count current confirmed registrations
    const { count, error: countError } = await supabaseAdmin
      .from("registrations")
      .select("*", { count: "exact", head: true })
      .eq("event_id", eventId)
      .eq("status", "confirmed");

    if (countError) {
      return NextResponse.json(
        { error: countError.message },
        { status: 500 }
      );
    }

    const status =
      (count ?? 0) < event.capacity
        ? "confirmed"
        : "waiting";

    // Insert registration
    const { data: registration, error: insertError } = await supabaseAdmin
      .from("registrations")
      .insert({
        event_id: eventId,
        user_id: userId,
        status,
      })
      .select()
      .single();

    if (insertError) {
      return NextResponse.json(
        { error: insertError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      registration,
    });
  } catch {
    return NextResponse.json(
      { error: "Unexpected server error." },
      { status: 500 }
    );
  }
}