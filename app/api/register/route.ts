import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const eventId = body.eventId;
    const userId = body.userId;

    if (!eventId || !userId) {
      return NextResponse.json(
        { error: "Missing eventId or userId." },
        { status: 400 }
      );
    }

    // Find event
    const { data: event, error: eventError } =
      await supabaseAdmin
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

    // Check if user already has a registration row
    const {
      data: existingRegistration,
      error: existingError,
    } = await supabaseAdmin
      .from("registrations")
      .select("*")
      .eq("event_id", eventId)
      .eq("user_id", userId)
      .maybeSingle();

    if (existingError) {
      return NextResponse.json(
        { error: existingError.message },
        { status: 500 }
      );
    }

    // If already actively registered
    if (
      existingRegistration &&
      existingRegistration.status !== "cancelled"
    ) {
      return NextResponse.json(
        {
          error:
            "User is already registered for this event.",
        },
        { status: 400 }
      );
    }

    // Count confirmed players
    const { count, error: countError } =
      await supabaseAdmin
        .from("registrations")
        .select("*", {
          count: "exact",
          head: true,
        })
        .eq("event_id", eventId)
        .eq("status", "confirmed");

    if (countError) {
      return NextResponse.json(
        { error: countError.message },
        { status: 500 }
      );
    }

    const newStatus =
      (count ?? 0) < event.capacity
        ? "confirmed"
        : "waiting";

    let registration;

    // Reuse cancelled registration
    if (existingRegistration) {
      const { data, error } =
        await supabaseAdmin
          .from("registrations")
          .update({
            status: newStatus,
            created_at: new Date().toISOString(),
          })
          .eq("id", existingRegistration.id)
          .select()
          .single();

      if (error) {
        return NextResponse.json(
          { error: error.message },
          { status: 500 }
        );
      }

      registration = data;
    } else {
      // First time registering
      const { data, error } =
        await supabaseAdmin
          .from("registrations")
          .insert({
            event_id: eventId,
            user_id: userId,
            status: newStatus,
          })
          .select()
          .single();

      if (error) {
        return NextResponse.json(
          { error: error.message },
          { status: 500 }
        );
      }

      registration = data;
    }

    return NextResponse.json({
      success: true,
      registration,
    });
  } catch (error) {
    console.error("Register error:", error);

    return NextResponse.json(
      { error: "Unexpected server error." },
      { status: 500 }
    );
  }
}