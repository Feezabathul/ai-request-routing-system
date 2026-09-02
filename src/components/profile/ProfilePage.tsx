"use client";

import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { Camera, CheckCircle2, UserRound } from "lucide-react";
import { getCurrentUser, setCurrentUser } from "@/lib/current-user";

type Profile = { id: string; name: string; email: string; avatar: string | null };

export default function ProfilePage({ portalLabel }: { portalLabel: string }) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [name, setName] = useState("");
  const [avatar, setAvatar] = useState("");
  const [editing, setEditing] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/profile")
      .then(async (response) => {
        if (!response.ok) throw new Error("Unable to load profile");
        return response.json();
      })
      .then((data: { user: Profile }) => {
        setProfile(data.user);
        setName(data.user.name);
        setAvatar(data.user.avatar ?? "");
      })
      .catch(() => setError("Unable to load your profile."));
  }, []);

  const handleAvatarChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setAvatar(typeof reader.result === "string" ? reader.result : "");
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError("");
    const response = await fetch("/api/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: name.trim(), avatar: avatar || null }),
    });
    if (!response.ok) {
      setError("Unable to save your profile.");
      return;
    }
    const data: { user: Profile } = await response.json();
    setProfile(data.user);
    setName(data.user.name);
    setAvatar(data.user.avatar ?? "");
    const currentUser = getCurrentUser();
    if (currentUser) {
      setCurrentUser({ ...currentUser, name: data.user.name, avatar: data.user.avatar ?? undefined });
    }
    setEditing(false);
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2500);
  };

  return (
    <section className="mx-auto w-full max-w-3xl p-4 sm:p-6">
      <header className="mb-6 sm:mb-8">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-indigo-600">{portalLabel}</p>
        <h1 className="mt-2 text-2xl font-bold text-slate-900 sm:text-3xl">Customer Profile</h1>
      </header>

      <form onSubmit={handleSubmit} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
        <div className="flex flex-col gap-5 border-b border-slate-200 pb-7 sm:flex-row sm:items-center">
          <div className="relative h-24 w-24 shrink-0">
            {avatar ? (
              <img src={avatar} alt="Profile" className="h-24 w-24 rounded-full object-cover ring-4 ring-indigo-50" />
            ) : (
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-indigo-100 text-indigo-600 ring-4 ring-indigo-50">
                <UserRound className="h-10 w-10" />
              </div>
            )}
            <label className="absolute bottom-0 right-0 flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-indigo-600 text-white shadow-md hover:bg-indigo-700" title="Change profile picture">
              <Camera className="h-4 w-4" />
              <input type="file" accept="image/*" onChange={handleAvatarChange} className="sr-only" disabled={!editing} />
            </label>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Personal details</h2>
            <p className="mt-1 text-sm text-slate-500">Update your name and profile picture.</p>
          </div>
        </div>

        {error && <p className="mt-5 text-sm text-red-600">{error}</p>}
        <div className="mt-7 grid gap-5 sm:grid-cols-2">
          <label className="block">
            <span className="text-sm font-medium text-slate-700">User name</span>
            <input value={name} onChange={(event) => setName(event.target.value)} readOnly={!editing} required className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 read-only:bg-slate-50" />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-slate-700">User email</span>
            <input value={profile?.email ?? ""} readOnly className="mt-2 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-500" />
          </label>
        </div>

        <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-end">
          {saved && <span className="flex items-center gap-2 text-sm text-emerald-600"><CheckCircle2 className="h-4 w-4" />Profile saved</span>}
          {!editing && <button type="button" onClick={() => setEditing(true)} className="rounded-lg border border-indigo-200 px-5 py-2.5 text-sm font-semibold text-indigo-700 hover:bg-indigo-50">Edit Profile</button>}
          {editing && <button type="submit" className="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700">Save Changes</button>}
        </div>
      </form>
    </section>
  );
}
