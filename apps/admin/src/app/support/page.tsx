"use client";

import { useEffect, useState } from "react";

type Ticket = { id: string; title: string; status: string; createdAt: string };

export default function AdminSupportPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);

  useEffect(() => {
    fetch("/api/admin?section=support")
      .then((res) => res.json())
      .then(setTickets);
  }, []);

  return (
    <main className="mx-auto flex w-full max-w-7xl flex-col gap-4 p-4 md:p-8">
      <section className="card p-6">
        <h2 className="text-2xl font-semibold">Support Tickets</h2>
      </section>
      <section className="space-y-3">
        {tickets.map((ticket) => (
          <article key={ticket.id} className="card p-5">
            <div className="flex justify-between">
              <p className="font-semibold">{ticket.title}</p>
              <span className="text-xs uppercase text-slate-500">{ticket.status}</span>
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}
