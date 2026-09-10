import EventCard from "@/components/EventCard";
import { supabase } from "@/lib/supabase";
import LineUser from "@/components/LineUser";

export default async function Home() {
  const TEST_USER_ID = 1; // change this if Renzo's user id is different

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

  const { data: registrations, error: registrationsError } = await supabase
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

            const confirmedCount = eventRegistrations.filter(
              (registration) => registration.status === "confirmed"
            ).length;

            const waitingCount = eventRegistrations.filter(
              (registration) => registration.status === "waiting"
            ).length;

            const players = eventRegistrations
            .filter(
              (registration) =>
                registration.status === "confirmed" ||
                registration.status === "waiting"
            )
            .map((registration) => ({
              id: registration.id,
              display_name:
                registration.users?.[0]?.display_name ?? "Unknown Player",
              status: registration.status as "confirmed" | "waiting",
            }));

            const myRegistration = eventRegistrations.find(
              (registration) =>
                registration.user_id === TEST_USER_ID
            );

            let status:
              | "available"
              | "registered"
              | "waiting"
              | "full" = "available";

            if (myRegistration?.status === "confirmed") {
              status = "registered";
            } else if (myRegistration?.status === "waiting") {
              status = "waiting";
            } else if (confirmedCount >= event.capacity) {
              status = "full";
            }

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
                status={status}
                players={players}
              />
            );
          })}
        </div>
      </div>
    </main>
  );
}