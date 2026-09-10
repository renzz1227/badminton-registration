import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default async function AdminPage() {
  const { data: events, error } = await supabase
    .from("events")
    .select("*")
    .order("event_date", { ascending: true });

  if (error) {
    return (
      <main className="min-h-screen bg-gray-100 p-8">
        <p className="text-red-600">
          Failed to load events: {error.message}
        </p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-100 px-4 py-8">
      <div className="mx-auto max-w-3xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              🏸 Event Admin
            </h1>

            <p className="mt-1 text-gray-600">
              Manage badminton sessions
            </p>
          </div>

          <Link
            href="/"
            className="rounded-lg bg-gray-200 px-4 py-2 text-gray-700"
          >
            ← Events
          </Link>
        </div>

        <Link
          href="/admin/events/new"
          className="mb-6 inline-block rounded-lg bg-green-600 px-5 py-3 font-semibold text-white"
        >
          + Create Event
        </Link>

        <div className="space-y-4">
          {events?.map((event) => (
            <div
              key={event.id}
              className="rounded-xl bg-white p-5 shadow"
            >
              <h2 className="text-xl font-bold text-gray-900">
                {event.title}
              </h2>

              <div className="mt-2 space-y-1 text-gray-600">
                <p>📍 {event.venue}</p>
                <p>📅 {event.event_date}</p>
                <p>
                  ⏰ {event.start_time}–{event.end_time}
                </p>
                <p>💴 ¥{event.price}</p>
                <p>👥 Capacity: {event.capacity}</p>
              </div>

              <div className="mt-4 flex gap-2">
                <Link
                  href={`/admin/events/${event.id}/edit`}
                  className="rounded-lg bg-blue-600 px-4 py-2 text-white"
                >
                  Edit
                </Link>

                <Link
                  href={`/admin/events/${event.id}/delete`}
                  className="rounded-lg bg-red-500 px-4 py-2 text-white"
                >
                  Delete
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}