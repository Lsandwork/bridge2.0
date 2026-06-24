"use client";

import Link from "next/link";
import {
  ArrowRight,
  CalendarDays,
  Check,
  ChevronRight,
  CircleUserRound,
  FileDown,
  MessageSquareText,
  Plus,
  TrendingUp,
} from "lucide-react";
import type { SupportPathway } from "@/lib/support-pathways";
import "./pathway-dashboard.css";

export function PathwayDashboard({ pathway }: { pathway: SupportPathway }) {
  return (
    <main
      className="pathway-dashboard"
      style={{ "--pd-accent": pathway.accent, "--pd-soft": pathway.accentSoft } as React.CSSProperties}
    >
      <section className="pathway-dashboard__welcome">
        <div>
          <p className="pathway-dashboard__date">
            {new Intl.DateTimeFormat("en-US", { weekday: "long", month: "long", day: "numeric" }).format(new Date())}
          </p>
          <h2>Good morning, Alex</h2>
          <p>{pathway.audience}</p>
        </div>
        <div className="pathway-dashboard__welcome-actions">
          <Link href="/reports" className="pathway-dashboard__secondary"><FileDown size={16} /> Export summary</Link>
          <Link href="/tasks" className="pathway-dashboard__primary"><Plus size={16} /> Add to today</Link>
        </div>
      </section>

      <section className="pathway-dashboard__hero">
        <div className="pathway-dashboard__hero-copy">
          <span>{pathway.icon} {pathway.name} support pathway</span>
          <h1>{pathway.heroTitle}</h1>
          <p>{pathway.heroBody}</p>
          <Link href={pathway.primaryHref}>{pathway.primaryAction} <ArrowRight size={16} /></Link>
        </div>
        <div className="pathway-dashboard__scene" aria-hidden="true">
          <i className="pathway-dashboard__sun" />
          <i className="pathway-dashboard__hill one" />
          <i className="pathway-dashboard__hill two" />
          <i className="pathway-dashboard__path" />
          <i className="pathway-dashboard__person" />
          <b>✦</b>
        </div>
      </section>

      <section className="pathway-dashboard__section">
        <header className="pathway-dashboard__section-head">
          <div><span>Your day at a glance</span><h2>Today’s rhythm</h2></div>
          <Link href="/routines">View full schedule <ArrowRight size={14} /></Link>
        </header>
        <div className="pathway-dashboard__rhythm">
          {pathway.today.map((item) => (
            <Link href="/routines" key={`${item.time}-${item.title}`} className={item.complete ? "complete" : ""}>
              <span>{item.time}{item.complete ? <Check size={16} /> : <i />}</span>
              <strong>{item.title}</strong>
              <small>{item.detail}</small>
            </Link>
          ))}
        </div>
      </section>

      <div className="pathway-dashboard__columns">
        <section className="pathway-dashboard__section">
          <header className="pathway-dashboard__section-head">
            <div><span>Made for this moment</span><h2>Helpful supports</h2></div>
          </header>
          <div className="pathway-dashboard__tools">
            {pathway.supportAreas.map((area) => (
              <Link href={area.href} key={area.title}>
                <i>{area.icon}</i>
                <span><strong>{area.title}</strong><small>{area.body}</small></span>
                <ChevronRight size={16} />
              </Link>
            ))}
          </div>
        </section>

        <section className="pathway-dashboard__section">
          <header className="pathway-dashboard__section-head">
            <div><span>Small steps count</span><h2>This week</h2></div>
            <Link href="/progress">Details</Link>
          </header>
          <div className="pathway-dashboard__progress">
            <div className="pathway-dashboard__ring"><span>78<small>%</small></span></div>
            <div><strong>12 support moments completed</strong><p>Three more than last week.</p></div>
          </div>
          <div className="pathway-dashboard__outcome">
            <span><TrendingUp size={15} /> {pathway.outcomeLabel}</span>
            <strong>{pathway.outcomeValue}</strong>
          </div>
        </section>
      </div>

      <section className="pathway-dashboard__care-note">
        <CircleUserRound size={34} />
        <div><span>From your care circle</span><p>{pathway.careNote}</p></div>
        <Link href="/care-team"><MessageSquareText size={15} /> Reply</Link>
      </section>

      <section className="pathway-dashboard__quick">
        <Link href="/goals"><TrendingUp size={18} /><span><strong>Goals</strong><small>Review current priorities</small></span></Link>
        <Link href="/care-team"><CircleUserRound size={18} /><span><strong>Care circle</strong><small>Three active members</small></span></Link>
        <Link href="/reports"><CalendarDays size={18} /><span><strong>Latest report</strong><small>Weekly summary ready</small></span></Link>
      </section>
    </main>
  );
}
