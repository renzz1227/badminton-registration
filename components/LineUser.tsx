"use client";

import { useLineUser } from "@/components/LineUserProvider";

export default function LineUser() {
  const {
    user,
    loading,
    error,
  } = useLineUser();

  if (loading) {
    return (
      <p className="text-gray-500">
        Loading LINE profile...
      </p>
    );
  }

  if (error) {
    return (
      <p className="text-red-600">
        {error}
      </p>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="flex items-center gap-3">
      {user.picture_url && (
        <img
          src={user.picture_url}
          alt={user.display_name}
          className="h-11 w-11 rounded-full object-cover"
        />
      )}

      <div>
        <p className="text-sm text-gray-500">
          Welcome
        </p>

        <p className="font-semibold text-gray-900">
          {user.display_name}
        </p>
      </div>
    </div>
  );
}