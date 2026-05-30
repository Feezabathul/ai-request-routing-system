"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Sparkles, Loader2, AlertCircle } from "lucide-react";
import { classifyRequestWithAI } from "@/lib/ai-classification";
import { getRequests, saveRequests, type StoredRequest } from "@/lib/request-storage";
import { getCurrentUser } from "@/lib/current-user";

export default function CreateRequestPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [classifying, setClassifying] = useState(false);
  const [form, setForm] = useState({ title: "", description: "" });
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [aiPreview, setAiPreview] = useState<{ category: string; confidence: number } | null>(null);
  const [currentUserLabel, setCurrentUserLabel] = useState<string | null>(null);

  React.useEffect(() => {
    const user = getCurrentUser();
    if (user) {
      setCurrentUserLabel(`${user.name} (${user.email})`);
    }
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setAiPreview(null);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);

    const currentUser = getCurrentUser();
    if (!currentUser?.id || !currentUser.email) {
      setError("You must be logged in to submit a request. Please log in again.");
      return;
    }

    setLoading(true);
    setClassifying(true);

    const { aiCategory, aiConfidence } = classifyRequestWithAI(
      form.title.trim(),
      form.description.trim()
    );

    setClassifying(false);

    const newRequest: StoredRequest = {
      id: Date.now().toString(),
      title: form.title.trim(),
      createdById: currentUser.id,
      createdByName: currentUser.name,
      createdByEmail: currentUser.email,
      customerName: currentUser.name,
      customerEmail: currentUser.email,
      description: form.description.trim(),
      category: aiCategory,
      aiCategory,
      aiConfidence,
      priority: "Medium",
      status: "Pending",
      assignedAgentId: undefined,
      assignedAgentName: undefined,
      assignedAt: undefined,
      createdAt: new Date().toISOString(),
    };

    const requests = getRequests();
    requests.push(newRequest);
    saveRequests(requests);

    setMessage(
      `Request submitted as ${currentUser.name}. AI classified: ${aiCategory} (${aiConfidence}% confidence).`
    );

    setTimeout(() => {
      setLoading(false);
      router.push("/dashboard/requests");
    }, 1800);
  };

  const handleCancel = () => {
    router.back();
  };

  const runPreview = () => {
    if (!form.title.trim()) return;
    const result = classifyRequestWithAI(form.title, form.description);
    setAiPreview({ category: result.aiCategory, confidence: result.aiConfidence });
  };

  return (
    <section className="mx-auto max-w-2xl space-y-6 rounded-lg bg-white p-6 shadow-sm">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Submit a Request</h1>
        <p className="mt-1 text-sm text-gray-500">
          Describe your issue. Your account details are attached automatically.
        </p>
        {currentUserLabel && (
          <p className="mt-2 text-sm text-gray-600">
            Submitting as <strong>{currentUserLabel}</strong>
          </p>
        )}
      </div>

      {error && (
        <div className="flex items-start gap-2 rounded-lg bg-red-50 p-3 text-red-800">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <p className="text-sm">{error}</p>
        </div>
      )}

      {message && (
        <div className="flex items-start gap-2 rounded-lg bg-green-50 p-3 text-green-800">
          <Sparkles className="mt-0.5 h-4 w-4 shrink-0" />
          <p className="text-sm">{message}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700" htmlFor="title">
            Title
          </label>
          <Input
            id="title"
            name="title"
            placeholder="e.g. Unable to login"
            value={form.title}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700" htmlFor="description">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            rows={5}
            placeholder="e.g. I am getting an invalid password error when I try to sign in."
            className="w-full rounded-lg border border-gray-300 p-3 focus:outline-none focus:ring-2 focus:ring-indigo-200"
            value={form.description}
            onChange={handleChange}
            required
          />
        </div>

        {aiPreview && (
          <div className="rounded-lg border border-indigo-100 bg-indigo-50 p-4 text-sm">
            <p className="font-medium text-indigo-900">AI preview (on submit)</p>
            <p className="mt-1 text-indigo-700">
              Category: {aiPreview.category} · Confidence: {aiPreview.confidence}%
            </p>
          </div>
        )}

        <div className="flex flex-col gap-3 sm:flex-row">
          <Button
            type="button"
            variant="outline"
            onClick={runPreview}
            disabled={!form.title.trim() || loading}
            className="flex items-center justify-center gap-2"
          >
            <Sparkles className="h-4 w-4" />
            Preview AI Category
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={loading}
            className="flex flex-1 items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                {classifying ? "AI analyzing…" : "Submitting…"}
              </>
            ) : (
              "Submit Request"
            )}
          </Button>
          <Button type="button" variant="outline" onClick={handleCancel} disabled={loading}>
            Cancel
          </Button>
        </div>
      </form>
    </section>
  );
}
