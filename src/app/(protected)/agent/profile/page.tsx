"use client";

import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { Camera, CheckCircle2, UserRound } from "lucide-react";
import { getAgents, getCurrentAgent, saveAgents, type StoredAgent } from "@/lib/agents";
import { getCurrentUser, setCurrentUser, type CurrentUser } from "@/lib/current-user";

export default function AgentProfilePage() {
  const [agent, setAgent] = useState<StoredAgent | null>(null);
  const [name, setName] = useState("");
  const [avatar, setAvatar] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const currentAgent = getCurrentAgent();
    const currentUser = getCurrentUser();
    if (currentAgent) {
      setAgent(currentAgent);
      setName(currentAgent.name);
      setAvatar(currentAgent.avatar ?? "");
    } else if (currentUser?.role === "AGENT") {
      setName(currentUser.name);
      setAvatar(currentUser.avatar ?? "");
    }
  }, []);

  const handleAvatarChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => setAvatar(typeof reader.result === "string" ? reader.result : "");
    reader.readAsDataURL(file);
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    const currentUser = getCurrentUser();
    if (!currentUser || !name.trim()) return;

    const updatedUser: CurrentUser = { ...currentUser, name: name.trim(), avatar };
    setCurrentUser(updatedUser);
    localStorage.setItem("currentAgent", JSON.stringify({ ...agent, ...updatedUser, avatar }));

    if (agent) {
      saveAgents(
        getAgents().map((storedAgent) =>
          storedAgent.id === agent.id ? { ...storedAgent, name: name.trim(), avatar } : storedAgent,
        ),
      );
    }
    setAgent((current) => current ? { ...current, name: name.trim(), avatar } : current);
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2500);
  };

  const email = getCurrentUser()?.email ?? agent?.email ?? "";

  return (
    <section className="mx-auto w-full max-w-3xl p-6">
      <header className="mb-8">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-indigo-600">Agent Portal</p>
        <h1 className="mt-2 text-3xl font-bold text-slate-900">Agent Profile</h1>
        <p className="mt-2 text-slate-500">Manage your profile details and picture.</p>
      </header>

      <form onSubmit={handleSubmit} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex flex-col gap-6 border-b border-slate-200 pb-8 sm:flex-row sm:items-center">
          <div className="relative h-24 w-24 shrink-0">
            {avatar ? (
              <img src={avatar} alt="Agent profile" className="h-24 w-24 rounded-full object-cover ring-4 ring-indigo-50" />
            ) : (
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-indigo-100 text-indigo-600 ring-4 ring-indigo-50">
                <UserRound className="h-10 w-10" />
              </div>
            )}
            <label className="absolute bottom-0 right-0 flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-indigo-600 text-white shadow-md transition hover:bg-indigo-700" title="Change profile picture">
              <Camera className="h-4 w-4" />
              <input type="file" accept="image/*" onChange={handleAvatarChange} className="sr-only" />
            </label>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Personal details</h2>
            <p className="mt-1 text-sm text-slate-500">Your email comes from the account created by the administrator.</p>
          </div>
        </div>

        <div className="mt-8 grid gap-5 sm:grid-cols-2">
          <label className="block">
            <span className="text-sm font-medium text-slate-700">Full name</span>
            <input value={name} onChange={(event) => setName(event.target.value)} required className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100" />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-slate-700">Email address</span>
            <input value={email} readOnly className="mt-2 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-500" />
          </label>
        </div>

        <div className="mt-8 flex items-center justify-end gap-4">
          {saved && <span className="flex items-center gap-2 text-sm text-emerald-600"><CheckCircle2 className="h-4 w-4" />Profile saved</span>}
          <button type="submit" className="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700">Save changes</button>
        </div>
      </form>
    </section>
  );
}
