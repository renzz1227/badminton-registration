import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

type LineVerifyResponse = {
  iss?: string;
  sub?: string;
  aud?: string;
  exp?: number;
  iat?: number;
  name?: string;
  picture?: string;
  error?: string;
  error_description?: string;
};

export async function POST(request: Request) {
  try {
    const { idToken } = await request.json();

    if (!idToken) {
      return NextResponse.json(
        { error: "Missing LINE ID token." },
        { status: 400 }
      );
    }

    const channelId = process.env.LINE_CHANNEL_ID;

    if (!channelId) {
      return NextResponse.json(
        { error: "LINE_CHANNEL_ID is not configured." },
        { status: 500 }
      );
    }

    const body = new URLSearchParams();

    body.append("id_token", idToken);
    body.append("client_id", channelId);

    const lineResponse = await fetch(
      "https://api.line.me/oauth2/v2.1/verify",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body,
      }
    );

    const lineProfile =
      (await lineResponse.json()) as LineVerifyResponse;

    if (!lineResponse.ok || !lineProfile.sub) {
      console.error("LINE verification failed:", lineProfile);

      return NextResponse.json(
        {
          error:
            lineProfile.error_description ||
            "LINE token verification failed.",
        },
        { status: 401 }
      );
    }

    const lineUserId = lineProfile.sub;
    const displayName = lineProfile.name || "LINE User";
    const pictureUrl = lineProfile.picture || null;

    const { data: existingUser, error: findError } =
      await supabaseAdmin
        .from("users")
        .select("*")
        .eq("line_user_id", lineUserId)
        .maybeSingle();

    if (findError) {
      return NextResponse.json(
        { error: findError.message },
        { status: 500 }
      );
    }

    if (existingUser) {
      const { data: updatedUser, error: updateError } =
        await supabaseAdmin
          .from("users")
          .update({
            display_name: displayName,
            picture_url: pictureUrl,
          })
          .eq("id", existingUser.id)
          .select()
          .single();

      if (updateError) {
        return NextResponse.json(
          { error: updateError.message },
          { status: 500 }
        );
      }

      return NextResponse.json({
        user: updatedUser,
      });
    }

    const { data: newUser, error: insertError } =
      await supabaseAdmin
        .from("users")
        .insert({
          line_user_id: lineUserId,
          display_name: displayName,
          picture_url: pictureUrl,
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
      user: newUser,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Unexpected server error." },
      { status: 500 }
    );
  }
}