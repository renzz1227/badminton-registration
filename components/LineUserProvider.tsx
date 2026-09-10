"use client";

import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";

import liff from "@line/liff";

type AppUser = {
  id: number;
  line_user_id: string;
  display_name: string;
  picture_url?: string | null;
};

type LineUserContextType = {
  user: AppUser | null;
  loading: boolean;
  error: string;
};

const LineUserContext =
  createContext<LineUserContextType>({
    user: null,
    loading: true,
    error: "",
  });

export function LineUserProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [user, setUser] =
    useState<AppUser | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {
    async function initializeLine() {
      try {
        await liff.init({
          liffId:
            process.env.NEXT_PUBLIC_LIFF_ID!,
        });

        if (!liff.isLoggedIn()) {
          liff.login();
          return;
        }

        const idToken =
          liff.getIDToken();

        if (!idToken) {
          throw new Error(
            "LINE ID token is unavailable."
          );
        }

        const response = await fetch(
          "/api/auth/line",
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify({
              idToken,
            }),
          }
        );

        const data =
          await response.json();

        if (!response.ok) {
          throw new Error(
            data.error ||
              "LINE login failed."
          );
        }

        setUser(data.user);
      } catch (err) {
        console.error(err);

        setError(
          err instanceof Error
            ? err.message
            : "LINE initialization failed."
        );
      } finally {
        setLoading(false);
      }
    }

    initializeLine();
  }, []);

  return (
    <LineUserContext.Provider
      value={{
        user,
        loading,
        error,
      }}
    >
      {children}
    </LineUserContext.Provider>
  );
}

export function useLineUser() {
  return useContext(LineUserContext);
}