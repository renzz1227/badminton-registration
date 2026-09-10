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

    // Find the user's active registration
    const { data: registration, error: registrationError } = await supabaseAdmin
      .from("registrations")
      .select("*")
      .eq("event_id", eventId)
      .eq("user_id", userId)
      .neq("status", "cancelled")
      .maybeSingle();

    if (registrationError) {
      return NextResponse.json(
        { error: registrationError.message },
        { status: 500 }
      );
    }

    if (!registration) {
      return NextResponse.json(
        { error: "No active registration found." },
        { status: 404 }
      );
    }

    const wasConfirmed = registration.status === "confirmed";

    // Cancel current user
    const { error: cancelError } = await supabaseAdmin
      .from("registrations")
      .update({
        status: "cancelled",
      })
      .eq("id", registration.id);

    if (cancelError) {
      return NextResponse.json(
        { error: cancelError.message },
        { status: 500 }
      );
    }

    let promotedUser = null;

    // If a confirmed player cancelled,
    // promote the oldest waiting user
    if (wasConfirmed) {
      const { data: nextWaitingUser, error: waitingError } =
        await supabaseAdmin
          .from("registrations")
          .select("*")
          .eq("event_id", eventId)
          .eq("status", "waiting")
          .order("created_at", { ascending: true })
          .limit(1)
          .maybeSingle();

      if (waitingError) {
        return NextResponse.json(
          { error: waitingError.message },
          { status: 500 }
        );
      }

      if (nextWaitingUser) {
        const { data: promoted, error: promoteError } =
          await supabaseAdmin
            .from("registrations")
            .update({
              status: "confirmed",
            })
            .eq("id", nextWaitingUser.id)
            .select()
            .single();

        if (promoteError) {
          return NextResponse.json(
            { error: promoteError.message },
            { status: 500 }
          );
        }

        promotedUser = promoted;
      }
    }

    return NextResponse.json({
      success: true,
      promotedUser,
    });
  } catch {
    return NextResponse.json(
      { error: "Unexpected server error." },
      { status: 500 }
    );
  }
}