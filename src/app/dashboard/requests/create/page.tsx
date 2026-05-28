"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";


export default function CreateRequestPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: "",
    customerName: "",
    customerEmail: "",
    description: "",
    category: "Support",
    priority: "Medium",
  });
  const [message, setMessage] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Create new request object with unique id and timestamp
    const newRequest = {
      id: Date.now().toString(),
      title: form.title,
      customerName: form.customerName,
      customerEmail: form.customerEmail,
      description: form.description,
      category: form.category,
      priority: form.priority as "Low" | "Medium" | "High" | "Urgent",
      status: "Pending" as const,
      assignedAgent: undefined,
      createdAt: new Date().toISOString(),
    };
    // Save to localStorage
    if (typeof window !== "undefined") {
      const existing = localStorage.getItem("requests");
      const requests = existing ? JSON.parse(existing) : [];
      requests.push(newRequest);
      localStorage.setItem("requests", JSON.stringify(requests));
    }
    console.log("New request submitted:", newRequest);
    setMessage("Request created successfully!");
    // Simulate short delay then redirect
    setTimeout(() => {
      setLoading(false);
      router.push("/dashboard/requests");
    }, 1500);
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <section className="max-w-2xl mx-auto p-6 space-y-6 bg-white rounded-lg shadow-sm">
      <h1 className="text-2xl font-bold text-gray-800">Create New Request</h1>
      {message && (
        <div className="p-3 bg-green-100 text-green-800 rounded">
          {message}
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="title">Request Title</label>
          <Input
            id="title"
            name="title"
            placeholder="Enter request title"
            value={form.title}
            onChange={handleChange}
            required
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="customerName">Customer Name</label>
            <Input
              id="customerName"
              name="customerName"
              placeholder="John Doe"
              value={form.customerName}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="customerEmail">Customer Email</label>
            <Input
              id="customerEmail"
              name="customerEmail"
              type="email"
              placeholder="email@example.com"
              value={form.customerEmail}
              onChange={handleChange}
              required
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="description">Description</label>
          <textarea
            id="description"
            name="description"
            rows={4}
            placeholder="Provide a detailed description..."
            className="w-full rounded-lg border border-gray-300 p-2 focus:outline-none focus:ring-2 focus:ring-indigo-200"
            value={form.description}
            onChange={handleChange}
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="category">Category</label>
            <select
              id="category"
              name="category"
              value={form.category}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-300 p-2 focus:outline-none focus:ring-2 focus:ring-indigo-200"
            >
              <option value="Support">Support</option>
              <option value="Bug">Bug</option>
              <option value="Feature">Feature</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="priority">Priority</label>
            <select
              id="priority"
              name="priority"
              value={form.priority}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-300 p-2 focus:outline-none focus:ring-2 focus:ring-indigo-200"
            >
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
              <option value="Urgent">Urgent</option>
            </select>
          </div>
        </div>
        <div className="flex space-x-4 mt-4">
          <Button type="submit" variant="primary" disabled={loading} className="flex-1">
            {loading ? "Submitting..." : "Create Request"}
          </Button>
          <Button type="button" variant="outline" onClick={handleCancel} disabled={loading} className="flex-1">
            Cancel
          </Button>
        </div>
      </form>
    </section>
  );
}
