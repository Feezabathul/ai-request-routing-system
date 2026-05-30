"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Sparkles, Loader2 } from "lucide-react";
import { classifyRequestWithAI } from "@/lib/ai-classification";
import { getRequests, saveRequests, type StoredRequest } from "@/lib/request-storage";
import { getUserRole } from "@/lib/role";

export default function CreateRequestPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [classifying, setClassifying] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    customerName: "",
    customerEmail: "",
  });
  const [message, setMessage] = useState<string | null>(null);
  const [aiPreview, setAiPreview] = useState<{ category: string; confidence: number } | null>(null);

  const [isCustomer, setIsCustomer] = useState(false);

  useEffect(() => {
    setIsCustomer(getUserRole() === "CUSTOMER");
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setAiPreview(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setClassifying(true);
    setMessage(null);

    const { aiCategory, aiConfidence } = classifyRequestWithAI(
      form.title.trim(),
      form.description.trim()
    );

    setClassifying(false);

    const customerName =
      form.customerName.trim() ||
      (isCustomer ? "Customer" : "Guest User");
    const customerEmail =
      form.customerEmail.trim() ||
      (isCustomer ? "customer@example.com" : "guest@example.com");

    const newRequest: StoredRequest = {
      id: Date.now().toString(),
      title: form.title.trim(),
      customerName,
      customerEmail,
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
      `Request submitted. AI classified as ${aiCategory} (${aiConfidence}% confidence). An admin will assign an agent.`
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
          Describe your issue. Our AI will categorize it automatically — no need to
          pick a department.
        </p>
      </div>

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

        {!isCustomer && (
          <div className="grid grid-cols-1 gap-4 rounded-lg border border-gray-100 bg-gray-50 p-4 md:grid-cols-2">
            <p className="text-xs text-gray-500 md:col-span-2">
              Optional — for admin-created tickets on behalf of a customer
            </p>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700" htmlFor="customerName">
                Customer Name
              </label>
              <Input
                id="customerName"
                name="customerName"
                placeholder="Customer name"
                value={form.customerName}
                onChange={handleChange}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700" htmlFor="customerEmail">
                Customer Email
              </label>
              <Input
                id="customerEmail"
                name="customerEmail"
                type="email"
                placeholder="email@example.com"
                value={form.customerEmail}
                onChange={handleChange}
              />
            </div>
          </div>
        )}

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
