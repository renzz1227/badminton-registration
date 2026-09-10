"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";

export default function DeleteEventPage() {
  const params = useParams();
  const router = useRouter();

  const id = params.id as string;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleDelete() {
    setLoading(true);

    const response = await fetch(`/api/admin/events/${id}`, {
      method: "DELETE",
    });

    const data = await response.json();

    if (!response.ok) {
      setError(data.error || "Failed to delete event.");
      setLoading(false);
      return;
    }

    router.push("/admin");
    router.refresh();
  }

  return (
    <main className="min-h-screen bg-gray-100 px-4 py-8">
      <div className="mx-auto max-w-md rounded-xl bg-white p-6 shadow">
        <h1 className="text-2xl font-bold text-gray-900">
          Delete Event
        </h1>

        <p className="mt-3 text-gray-600">
          Are you sure you want to delete this badminton session?
        </p>

        <p className="mt-2 text-sm text-red-500">
          Registrations for this event will also be deleted.
        </p>

        {error && (
          <p className="mt-4 text-red-600">
            {error}
          </p>
        )}

        <div className="mt-6 flex gap-3">
          <button
            onClick={() => router.push("/admin")}
            className="rounded-lg bg-gray-200 px-4 py-2 text-gray-700"
          >
            Cancel
          </button>

          <button
            onClick={handleDelete}
            disabled={loading}
            className="rounded-lg bg-red-500 px-4 py-2 text-white"
          >
            {loading ? "Deleting..." : "Delete Event"}
          </button>
        </div>
      </div>
    </main>
  );
}