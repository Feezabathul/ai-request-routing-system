"use client";

import { useEffect, useState } from "react";
import { Bell, CheckCircle2, Clock3, FileText, UserRound } from "lucide-react";

type Notification = {
  id: string;
  title: string;
  message: string;
  createdAt: string;
  eventType: "REQUEST_CREATED" | "ASSIGNED" | "STATUS_CHANGED";
};

const icons = {
  REQUEST_CREATED: FileText,
  ASSIGNED: UserRound,
  STATUS_CHANGED: CheckCircle2,
};

export default function UserNotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/user/notifications", { cache: "no-store" })
      .then(async (response) => {
        if (!response.ok) throw new Error("Unable to load notifications");
        return response.json();
      })
      .then((data: { notifications: Notification[] }) => setNotifications(data.notifications))
      .catch(() => setError("Unable to load your notifications."))
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="mx-auto w-full max-w-4xl p-4 sm:p-6">
      <header className="mb-6 flex items-start gap-3 sm:mb-8">
        <div className="rounded-xl bg-indigo-100 p-2.5 text-indigo-600"><Bell className="h-5 w-5" /></div>
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-indigo-600">Customer Portal</p>
          <h1 className="mt-2 text-2xl font-bold text-slate-900 sm:text-3xl">Notifications</h1>
          <p className="mt-2 text-sm text-slate-500">Updates about your requests.</p>
        </div>
      </header>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {loading && <p className="p-6 text-sm text-slate-500">Loading notifications...</p>}
        {!loading && error && <p className="p-6 text-sm text-red-600">{error}</p>}
        {!loading && !error && notifications.length === 0 && (
          <div className="flex flex-col items-center px-6 py-14 text-center">
            <Bell className="h-10 w-10 text-slate-300" />
            <p className="mt-3 text-sm font-medium text-slate-700">No notifications yet</p>
            <p className="mt-1 text-sm text-slate-500">Updates about your requests will appear here.</p>
          </div>
        )}
        {!loading && !error && notifications.map((notification) => {
          const Icon = icons[notification.eventType];
          return (
            <article key={notification.id} className="flex gap-4 border-b border-slate-100 p-5 last:border-b-0 sm:p-6">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-indigo-600"><Icon className="h-5 w-5" /></div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                  <h2 className="text-sm font-semibold text-slate-900">{notification.title}</h2>
                  <span className="flex shrink-0 items-center gap-1 text-xs text-slate-400"><Clock3 className="h-3.5 w-3.5" />{new Date(notification.createdAt).toLocaleString()}</span>
                </div>
                <p className="mt-1 text-sm leading-6 text-slate-600">{notification.message}</p>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}