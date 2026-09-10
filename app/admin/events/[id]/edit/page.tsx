"use client";

import { FormEvent, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

export default function EditEventPage() {
  const params = useParams();
  const router = useRouter();

  const id = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    title: "",
    venue: "",
    eventDate: "",
    startTime: "",
    endTime: "",
    price: 0,
    capacity: 1,
  });

  useEffect(() => {
    async function loadEvent() {
      const response = await fetch(`/api/admin/events/${id}`);
      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to load event.");
        setLoading(false);
        return;
      }

      setForm({
        title: data.event.title,
        venue: data.event.venue,
        eventDate: data.event.event_date,
        startTime: data.event.start_time.slice(0, 5),
        endTime: data.event.end_time.slice(0, 5),
        price: data.event.price,
        capacity: data.event.capacity,
      });

      setLoading(false);
    }

    loadEvent();
  }, [id]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();

    setSaving(true);
    setError("");

    const response = await fetch(`/api/admin/events/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(form),
    });

    const data = await response.json();

    if (!response.ok) {
      setError(data.error || "Failed to update event.");
      setSaving(false);
      return;
    }

    router.push("/admin");
    router.refresh();
  }

  if (loading) {
    return (
      <main className="p-8">
        <p>Loading...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-100 px-4 py-8">
      <div className="mx-auto max-w-xl">
        <h1 className="mb-6 text-3xl font-bold text-gray-900">
          Edit Event
        </h1>

        <form
          onSubmit={handleSubmit}
          className="space-y-4 rounded-xl bg-white p-6 shadow"
        >
          <input
            value={form.title}
            onChange={(e) =>
              setForm({ ...form, title: e.target.value })
            }
            className="w-full rounded-lg border p-3 text-gray-900"
            placeholder="Title"
          />

          <input
            value={form.venue}
            onChange={(e) =>
              setForm({ ...form, venue: e.target.value })
            }
            className="w-full rounded-lg border p-3 text-gray-900"
            placeholder="Venue"
          />

          <input
            type="date"
            value={form.eventDate}
            onChange={(e) =>
              setForm({ ...form, eventDate: e.target.value })
            }
            className="w-full rounded-lg border p-3 text-gray-900"
          />

          <div className="grid grid-cols-2 gap-4">
            <input
              type="time"
              value={form.startTime}
              onChange={(e) =>
                setForm({ ...form, startTime: e.target.value })
              }
              className="rounded-lg border p-3 text-gray-900"
            />

            <input
              type="time"
              value={form.endTime}
              onChange={(e) =>
                setForm({ ...form, endTime: e.target.value })
              }
              className="rounded-lg border p-3 text-gray-900"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <input
              type="number"
              value={form.price}
              onChange={(e) =>
                setForm({
                  ...form,
                  price: Number(e.target.value),
                })
              }
              className="rounded-lg border p-3 text-gray-900"
            />

            <input
              type="number"
              value={form.capacity}
              onChange={(e) =>
                setForm({
                  ...form,
                  capacity: Number(e.target.value),
                })
              }
              className="rounded-lg border p-3 text-gray-900"
            />
          </div>

          {error && (
            <p className="text-red-600">{error}</p>
          )}

          <button
            type="submit"
            disabled={saving}
            className="w-full rounded-lg bg-blue-600 px-4 py-3 text-white"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </form>
      </div>
    </main>
  );
}