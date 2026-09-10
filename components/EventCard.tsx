"use client";

import { useState } from "react";

type EventCardProps = {
  id: number;
  title: string;
  venue: string;
  date: string;
  time: string;
  price: number;
  confirmed: number;
  capacity: number;
  waiting?: number;
  status?: "available" | "registered" | "waiting" | "full";
  players?: Player[];
};

type Player = {
  id: number;
  display_name: string;
  status: "confirmed" | "waiting";
};

export default function EventCard({
  id,
  title,
  venue,
  date,
  time,
  price,
  confirmed,
  capacity,
  waiting = 0,
  status = "available",
  players = [],
}: EventCardProps) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [showPlayers, setShowPlayers] = useState(false);

  async function handleRegister() {
    setLoading(true);
    setMessage("");

    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          eventId: id,
          userId: 1, // temporary Renzo user
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.error || "Registration failed.");
        return;
      }

      if (data.registration.status === "confirmed") {
        setMessage("Registration confirmed!");
      } else {
        setMessage("Event is full. You were added to the waiting list.");
      }

      window.location.reload();
    } catch {
      setMessage("Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  async function handleCancel() {
    const confirmed = window.confirm(
      "Are you sure you want to cancel your registration?"
    );

    if (!confirmed) {
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const response = await fetch("/api/cancel", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          eventId: id,
          userId: 1, // temporary Renzo user
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.error || "Cancellation failed.");
        return;
      }

      setMessage("Registration cancelled.");

      window.location.reload();
    } catch {
      setMessage("Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="overflow-hidden rounded-2xl border-l-[6px] border-green-500 bg-white p-5 shadow-md">
      <div className="flex items-start justify-between gap-3">
        <h2 className="text-xl font-bold text-gray-900">
          {title}
        </h2>

        {status === "waiting" && (
          <span className="rounded-full bg-orange-100 px-3 py-1 text-sm font-semibold text-orange-700">
            Waiting
          </span>
        )}

        {status === "registered" && (
          <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-semibold text-blue-700">
            Registered
          </span>
        )}

        {status === "full" && (
          <span className="rounded-full bg-red-100 px-3 py-1 text-sm font-semibold text-red-600">
            Full
          </span>
        )}
      </div>

      <div className="mt-3 space-y-1 text-gray-700">
        <p>📍 {venue}</p>
        <p>📅 {date}</p>
        <p>⏰ {time}</p>
        <p>💴 ¥{price}</p>
      </div>

      <div className="mt-4 flex gap-4 text-gray-700">
        <span>
          👥 {confirmed} / {capacity} confirmed
        </span>

        {waiting > 0 && (
          <span>
            ⏳ {waiting} waiting
          </span>
        )}
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        {status === "available" && (
          <button
            onClick={handleRegister}
            disabled={loading}
            className="rounded-lg bg-green-600 px-5 py-2.5 font-medium text-white hover:bg-green-700 disabled:opacity-50"
          >
            {loading ? "Registering..." : "Register"}
          </button>
        )}

        {status === "registered" && (
          <>
            <button className="rounded-lg bg-gray-600 px-5 py-2.5 font-medium text-white">
              Edit
            </button>

            <button
              onClick={handleCancel}
              disabled={loading}
              className="rounded-lg bg-red-500 px-5 py-2.5 font-medium text-white hover:bg-red-600 disabled:opacity-50"
            >
              {loading ? "Cancelling..." : "Cancel Registration"}
            </button>
          </>
        )}

        {status === "waiting" && (
          <>
            <button
              disabled
              className="rounded-lg bg-orange-500 px-5 py-2.5 font-medium text-white"
            >
              Waiting List
            </button>

            <button
              onClick={handleCancel}
              disabled={loading}
              className="rounded-lg bg-red-500 px-5 py-2.5 font-medium text-white hover:bg-red-600 disabled:opacity-50"
            >
              {loading ? "Cancelling..." : "Cancel Waiting List"}
            </button>
          </>
        )}

        {status === "full" && (
          <button
            onClick={handleRegister}
            disabled={loading}
            className="rounded-lg bg-orange-500 px-5 py-2.5 font-medium text-white"
          >
            {loading ? "Joining..." : "Join Waiting List"}
          </button>
        )}
      </div>

      {message && (
        <p className="mt-3 text-sm text-gray-700">
          {message}
        </p>
      )}

      <button
        onClick={() => setShowPlayers(!showPlayers)}
        className="mt-5 text-green-600 underline"
      >
        {showPlayers ? "▼ Hide players" : "▶ Show players"}
      </button>
      {showPlayers && (
        <div className="mt-4 border-t pt-4">
          <div>
            <h3 className="font-semibold text-gray-900">
              Confirmed Players
            </h3>

            <div className="mt-2 space-y-1 text-gray-700">
              {players.filter((player) => player.status === "confirmed").length === 0 ? (
                <p className="text-sm text-gray-500">
                  No confirmed players yet.
                </p>
              ) : (
                players
                  .filter((player) => player.status === "confirmed")
                  .map((player, index) => (
                    <p key={player.id}>
                      {index + 1}. {player.display_name}
                    </p>
                  ))
              )}
            </div>
          </div>

          <div className="mt-4">
            <h3 className="font-semibold text-gray-900">
              Waiting List
            </h3>

            <div className="mt-2 space-y-1 text-gray-700">
              {players.filter((player) => player.status === "waiting").length === 0 ? (
                <p className="text-sm text-gray-500">
                  No one is waiting.
                </p>
              ) : (
                players
                  .filter((player) => player.status === "waiting")
                  .map((player, index) => (
                    <p key={player.id}>
                      {index + 1}. {player.display_name}
                    </p>
                  ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}