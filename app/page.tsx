import EventCard from "@/components/EventCard";
import { supabase } from "@/lib/supabase";
import LineUser from "@/components/LineUser";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function Home() {
  const { data: events, error: eventsError } = await supabase
    .from("events")
    .select("*")
    .order("event_date", { ascending: true });

  if (eventsError) {
    return (
      <main className="min-h-screen bg-gray-100 p-8">
        <p className="text-red-600">
          Failed to load events: {eventsError.message}
        </p>
      </main>
    );
  }

  const { data: registrations, error: registrationsError } =
    await supabase
      .from("registrations")
      .select(`
        id,
        event_id,
        user_id,
        status,
        created_at,
        users (
          display_name
        )
      `);
      
  if (registrationsError) {
    return (
      <main className="min-h-screen bg-gray-100 p-8">
        <p className="text-red-600">
          Failed to load registrations: {registrationsError.message}
        </p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-100 px-4 py-8">
      <div className="mx-auto max-w-2xl">
        <h1 className="mb-2 text-3xl font-bold text-green-600">
          🏸 Badminton Sessions
        </h1>

        <div className="mb-6">
          <LineUser />
        </div>

        <div className="space-y-5">
          {events?.map((event) => {
            const eventRegistrations =
              registrations?.filter(
                (registration) =>
                  registration.event_id === event.id &&
                  registration.status !== "cancelled"
              ) ?? [];

            const confirmedRegistrations =
              eventRegistrations.filter(
                (registration) =>
                  registration.status === "confirmed"
              );

            const waitingRegistrations =
              eventRegistrations.filter(
                (registration) =>
                  registration.status === "waiting"
              );

            const confirmedCount =
              confirmedRegistrations.length;

            const waitingCount =
              waitingRegistrations.length;

            const players = eventRegistrations.map(
              (registration) => ({
                id: registration.id,
                user_id: registration.user_id,
                display_name:
                  registration.users?.[0]?.display_name ??
                  "Unknown Player",
                status: registration.status as
                  | "confirmed"
                  | "waiting",
              })
            );

            const confirmedUserIds =
              confirmedRegistrations.map(
                (registration) =>
                  registration.user_id
              );

            const waitingUserIds =
              waitingRegistrations.map(
                (registration) =>
                  registration.user_id
              );

            return (
              <EventCard
                key={event.id}
                id={event.id}
                title={event.title}
                venue={event.venue}
                date={event.event_date}
                time={`${event.start_time}–${event.end_time}`}
                price={event.price}
                confirmed={confirmedCount}
                capacity={event.capacity}
                waiting={waitingCount}
                players={players}
                confirmedUserIds={confirmedUserIds}
                waitingUserIds={waitingUserIds}
              />
            );
          })}
        </div>
      </div>
    </main>
  );
}