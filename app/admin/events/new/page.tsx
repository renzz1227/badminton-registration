"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function CreateEventPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setLoading(true);
    setError("");

    const formData = new FormData(event.currentTarget);

    const response = await fetch("/api/admin/events", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title: formData.get("title"),
        venue: formData.get("venue"),
        eventDate: formData.get("eventDate"),
        startTime: formData.get("startTime"),
        endTime: formData.get("endTime"),
        price: Number(formData.get("price")),
        capacity: Number(formData.get("capacity")),
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      setError(data.error || "Failed to create event.");
      setLoading(false);
      return;
    }

    router.push("/");
    router.refresh();
  }

  return (
    <main className="min-h-screen bg-gray-100 px-4 py-8">
      <div className="mx-auto max-w-xl">
        <h1 className="mb-6 text-3xl font-bold text-gray-900">
          Create Event
        </h1>

        <form
          onSubmit={handleSubmit}
          className="space-y-5 rounded-2xl bg-white p-6 shadow"
        >
          <div>
            <label className="mb-1 block font-medium text-gray-700">
              Event Title
            </label>

            <input
              name="title"
              required
              placeholder="Sep 30 — Shinjuku"
              className="w-full rounded-lg border border-gray-300 p-3 text-gray-900"
            />
          </div>

          <div>
            <label className="mb-1 block font-medium text-gray-700">
              Venue
            </label>

            <input
              name="venue"
              required
              placeholder="Shinjuku Sports Center"
              className="w-full rounded-lg border border-gray-300 p-3 text-gray-900"
            />
          </div>

          <div>
            <label className="mb-1 block font-medium text-gray-700">
              Date
            </label>

            <input
              type="date"
              name="eventDate"
              required
              className="w-full rounded-lg border border-gray-300 p-3 text-gray-900"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block font-medium text-gray-700">
                Start Time
              </label>

              <input
                type="time"
                name="startTime"
                required
                className="w-full rounded-lg border border-gray-300 p-3 text-gray-900"
              />
            </div>

            <div>
              <label className="mb-1 block font-medium text-gray-700">
                End Time
              </label>

              <input
                type="time"
                name="endTime"
                required
                className="w-full rounded-lg border border-gray-300 p-3 text-gray-900"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block font-medium text-gray-700">
                Price (¥)
              </label>

              <input
                type="number"
                name="price"
                min="0"
                required
                className="w-full rounded-lg border border-gray-300 p-3 text-gray-900"
              />
            </div>

            <div>
              <label className="mb-1 block font-medium text-gray-700">
                Capacity
              </label>

              <input
                type="number"
                name="capacity"
                min="1"
                required
                className="w-full rounded-lg border border-gray-300 p-3 text-gray-900"
              />
            </div>
          </div>

          {error && (
            <div className="rounded-lg bg-red-100 p-3 text-red-700">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-green-600 px-5 py-3 font-semibold text-white hover:bg-green-700 disabled:opacity-50"
          >
            {loading ? "Creating..." : "Create Event"}
          </button>
        </form>
      </div>
    </main>
  );
}