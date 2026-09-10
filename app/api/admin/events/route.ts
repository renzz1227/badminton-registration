import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const {
      title,
      venue,
      eventDate,
      startTime,
      endTime,
      price,
      capacity,
    } = body;

    if (
      !title ||
      !venue ||
      !eventDate ||
      !startTime ||
      !endTime ||
      price === undefined ||
      !capacity
    ) {
      return NextResponse.json(
        { error: "Please complete all fields." },
        { status: 400 }
      );
    }

    if (capacity < 1) {
      return NextResponse.json(
        { error: "Capacity must be at least 1." },
        { status: 400 }
      );
    }

    if (price < 0) {
      return NextResponse.json(
        { error: "Price cannot be negative." },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from("events")
      .insert({
        title,
        venue,
        event_date: eventDate,
        start_time: startTime,
        end_time: endTime,
        price,
        capacity,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      event: data,
    });
  } catch {
    return NextResponse.json(
      { error: "Unexpected server error." },
      { status: 500 }
    );
  }
}