'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSheet, openSheet } from '@/lib/store';
import { pricingPlans, pricingContent, caseStudyContent, formStrings, siteConfig } from '@/data/site-config';
import { PricingPlan, ContactFormData } from '@/types';
import { CloseIcon, CheckIcon, ArrowRightIcon } from './Icons';
import { Glow } from './Glow';
import { Shine } from './Shine';
import { Lit } from './CanvasWave';
import { cn } from '@/lib/utils';

function SheetModal({
  label,
  className,
  children
}: {
  label: string;
  className?: string;
  children: React.ReactNode;
}) {
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') openSheet(null);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={label}
      className="fixed inset-0 z-40 flex items-end justify-center p-3 md:items-center md:p-6"
    >
      <button
        type="button"
        tabIndex={-1}
        aria-hidden="true"
        onClick={() => openSheet(null)}
        className="fade absolute inset-0 cursor-default bg-black/60"
      />

      <div
        className={cn(
          "rise relative max-h-full w-full shell overflow-x-hidden overflow-y-auto overscroll-contain rounded-[28px] md:overflow-visible",
          className
        )}
      >
        <div
          className="pointer-events-none sticky top-0 z-10 flex h-0 justify-end"
          style={{ isolation: 'isolate' }}
        >
          <button
            type="button"
            aria-label="Close"
            onClick={() => openSheet(null)}
            className="press button-quiet z-10 flex items-center justify-center rounded-full outline-none focus-visible:ring-2 focus-visible:ring-white/30 pointer-events-auto mt-4.5 mr-4.5 size-9 md:mt-8 md:mr-8"
          >
            <Glow quiet />
            <span className="relative flex items-center gap-2">
              <CloseIcon className="size-4" />
            </span>
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function PlanCard({
  plan,
  cta = "Start a project",
  sheet = "contact"
}: {
  plan: PricingPlan;
  cta?: string;
  sheet?: 'contact' | 'brief';
}) {
  const content = (
    <div
      className={cn(
        "relative flex h-full flex-col rounded-[22px] md:rounded-[28px]",
        plan.featured ? "flow-border isolate p-5 md:p-7" : "plan p-5 md:p-8"
      )}
    >
      <h3 className="text-base font-semibold">{plan.title}</h3>

      <p className="mt-2.5 flex items-baseline font-medium md:mt-4">
        <span className="text-[36px] leading-none tracking-[-0.02em] md:text-[46px]">
          {plan.price}
        </span>
        <span className="text-text/60 ml-2.5 text-base font-normal">
          {plan.unit}
        </span>
      </p>

      <div className="bg-line my-4 h-px md:my-7" />

      <ul className="space-y-2 md:space-y-3.5">
        {plan.features.map((feature) => (
          <li
            key={feature}
            className="text-text/85 flex items-start gap-3 text-sm leading-snug md:text-[15px]"
          >
            <CheckIcon
              className={cn(
                "mt-px size-4 shrink-0",
                plan.featured ? "text-glow" : "text-text/60"
              )}
            />
            <span>{feature}</span>
          </li>
        ))}
      </ul>

      <div className="mt-auto pt-5 md:pt-9">
        {plan.featured ? (
          <button
            type="button"
            onClick={() => openSheet(sheet)}
            className="btn button-lit w-full"
          >
            <Glow rest />
            <span className="relative flex items-center gap-2">
              {cta}
              <ArrowRightIcon className="size-4" />
            </span>
          </button>
        ) : (
          <button
            type="button"
            onClick={() => openSheet(sheet)}
            className="btn button-quiet w-full"
          >
            <Shine quiet>{cta}</Shine>
          </button>
        )}
      </div>
    </div>
  );

  return plan.featured ? (
    <Lit className="h-full">{content}</Lit>
  ) : (
    content
  );
}

function PricingSheet() {
  return (
    <SheetModal label={pricingContent.label} className="md:max-w-[70rem]">
      <div className="p-2 md:p-5">
        <div className="px-3 pt-3 pr-14 pb-4 md:px-4 md:pt-4 md:pb-7">
          <h2 className="text-[22px] leading-[1.15] font-medium md:text-[25px]">
            {pricingContent.title}
          </h2>
          <p className="text-muted mt-2 text-[15px] tracking-[0.015em]">
            {pricingContent.lead}
          </p>
        </div>

        <div className="grid items-stretch gap-2 md:grid-cols-[1fr_1.1fr_1fr] md:gap-5">
          {pricingPlans.map((plan) => (
            <PlanCard key={plan.title} plan={plan} cta={pricingContent.cta} />
          ))}
        </div>

        {/* The before/after case study page lives at /showcase */}
        <div className="mt-6 px-3 md:px-4">
          <Link
            href="/showcase"
            onClick={() => openSheet(null)}
            className="btn-sm button-quiet"
          >
            <Shine quiet>See a before and after example</Shine>
          </Link>
        </div>
      </div>
    </SheetModal>
  );
}

function ContactSheet() {
  const [form, setForm] = useState<ContactFormData>({
    name: '',
    email: '',
    details: '',
    handle: '',
    other: '',
    services: [],
    budget: null
  });
  const [honeypot, setHoneypot] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'failed' | 'limited'>('idle');
  const startTime = useRef(Date.now());

  const isValidEmail = (email: string) => /\S+@\S+\.\S+/.test(email);
  const isValid = form.name.trim().length > 0 && isValidEmail(form.email);

  const toggleService = (srv: string) => {
    setForm((prev) => ({
      ...prev,
      services: prev.services.includes(srv)
        ? prev.services.filter((s) => s !== srv)
        : [...prev.services, srv]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid || status === 'sending') return;

    setStatus('sending');
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          website: honeypot,
          elapsed: Date.now() - startTime.current
        })
      });

      if (res.ok) {
        setStatus('sent');
      } else {
        setStatus(res.status === 429 ? 'limited' : 'failed');
      }
    } catch {
      setStatus('failed');
    }
  };

  return (
    <SheetModal label={formStrings.title} className="md:max-w-[36rem]">
      <div className="p-4 md:p-8">
        <h2 className="text-[22px] leading-[1.15] font-medium md:text-[25px]">
          {formStrings.title}
        </h2>
        <p className="text-muted mt-2 text-[15px] tracking-[0.015em]">
          {formStrings.lead}
        </p>

        {status === 'sent' ? (
          <div className="mt-8 rounded-[20px] glass-tint p-6 text-center">
            <h3 className="text-lg font-medium text-ink">
              {formStrings.sent.title.replace('{name}', form.name.trim() || 'there')}
            </h3>
            <p className="text-muted mt-2 text-sm">
              {formStrings.sent.text}
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-7 space-y-6">
            {/* Services */}
            <div>
              <label className="text-muted mb-3 block text-sm font-medium">
                {formStrings.services.label}
              </label>
              <div className="flex flex-wrap gap-2">
                {formStrings.services.options.map((opt) => {
                  const active = form.services.includes(opt);
                  return (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => toggleService(opt)}
                      aria-pressed={active}
                      className={cn(
                        "btn-sm transition-colors",
                        active ? "button-cream text-black" : "button-quiet"
                      )}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>

              {form.services.includes('Other') && (
                <input
                  type="text"
                  placeholder={formStrings.services.other.placeholder}
                  value={form.other}
                  onChange={(e) => setForm({ ...form, other: e.target.value })}
                  className="pill-field placeholder:text-faint mt-3 w-full rounded-[14px] px-4 py-3 text-[15px] outline-none"
                />
              )}
            </div>

            {/* Budget */}
            <div>
              <label className="text-muted mb-3 block text-sm font-medium">
                {formStrings.budget.label}
              </label>
              <div className="flex flex-wrap gap-2">
                {formStrings.budget.options.map((opt) => {
                  const active = form.budget === opt;
                  return (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => setForm({ ...form, budget: active ? null : opt })}
                      aria-pressed={active}
                      className={cn(
                        "btn-sm transition-colors",
                        active ? "button-cream text-black" : "button-quiet"
                      )}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Your details */}
            <div className="space-y-3">
              <label className="text-muted block text-sm font-medium">
                {formStrings.details}
              </label>

              <div className="grid gap-3 sm:grid-cols-2">
                <input
                  type="text"
                  required
                  placeholder={formStrings.fields.name}
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="pill-field placeholder:text-faint w-full rounded-[14px] px-4 py-3 text-[15px] outline-none"
                />

                <input
                  type="email"
                  required
                  placeholder={formStrings.fields.email}
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="pill-field placeholder:text-faint w-full rounded-[14px] px-4 py-3 text-[15px] outline-none"
                />
              </div>

              <input
                type="text"
                placeholder={formStrings.fields.handle}
                value={form.handle}
                onChange={(e) => setForm({ ...form, handle: e.target.value })}
                className="pill-field placeholder:text-faint w-full rounded-[14px] px-4 py-3 text-[15px] outline-none"
              />

              <textarea
                rows={4}
                placeholder={formStrings.fields.details}
                value={form.details}
                onChange={(e) => setForm({ ...form, details: e.target.value })}
                className="pill-field placeholder:text-faint w-full rounded-[14px] px-4 py-3 text-[15px] outline-none resize-none"
              />

              {/* Honeypot field */}
              <input
                type="text"
                tabIndex={-1}
                autoComplete="off"
                value={honeypot}
                onChange={(e) => setHoneypot(e.target.value)}
                className="hidden"
                aria-hidden="true"
              />
            </div>

            {status === 'failed' && (
              <p className="text-danger text-sm">{formStrings.failed}</p>
            )}
            {status === 'limited' && (
              <p className="text-danger text-sm">{formStrings.limited}</p>
            )}

            <button
              type="submit"
              disabled={!isValid || status === 'sending'}
              className="btn button-cream w-full disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Glow />
              <span className="relative">
                {status === 'sending' ? formStrings.sending : formStrings.submit}
              </span>
            </button>

            <div className="pt-2 text-center text-xs text-muted">
              <p>{formStrings.response}</p>
              <p className="mt-1">
                {formStrings.chat[0]}{' '}
                <a
                  href={siteConfig.x.href}
                  target="_blank"
                  rel="noreferrer"
                  className="link-ink"
                >
                  {formStrings.chat[1]}
                </a>{' '}
                {formStrings.chat[2]}{' '}
                <a
                  href={siteConfig.contra.href}
                  target="_blank"
                  rel="noreferrer"
                  className="link-ink"
                >
                  {formStrings.chat[3]}
                </a>
              </p>
            </div>
          </form>
        )}
      </div>
    </SheetModal>
  );
}

function OfferSheet() {
  const { offer } = caseStudyContent;
  return (
    <SheetModal label={offer.title} className="md:max-w-[30rem]">
      <div className="p-2 md:p-5">
        <div className="px-3 pt-3 pr-14 pb-4 md:px-4 md:pt-4 md:pb-7">
          <h2 className="text-[22px] leading-[1.15] font-medium md:text-[25px]">
            {offer.title}
          </h2>
          <p className="text-muted mt-2 text-[15px] tracking-[0.015em]">
            {offer.lead}
          </p>
        </div>
        <PlanCard plan={offer.plan} cta={offer.cta} sheet="brief" />
      </div>
    </SheetModal>
  );
}

function BriefSheet() {
  const { brief } = formStrings;
  const [link, setLink] = useState('');
  const [contact, setContact] = useState('');
  const [files, setFiles] = useState<{ name: string; data: string }[]>([]);
  const [honeypot, setHoneypot] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'failed' | 'limited'>('idle');
  const startTime = useRef(Date.now());

  const canSubmit = contact.trim().length > 0 && (link.trim().length > 0 || files.length > 0);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const selected = Array.from(e.target.files).slice(0, 4 - files.length);
    selected.forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setFiles((prev) => [...prev, { name: file.name, data: reader.result as string }]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit || status === 'sending') return;

    setStatus('sending');
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          services: [brief.option],
          contact,
          details: link.trim(),
          shots: files.map((f) => f.data.slice(f.data.indexOf(',') + 1)),
          website: honeypot,
          elapsed: Date.now() - startTime.current
        })
      });

      if (res.ok) {
        setStatus('sent');
      } else {
        setStatus(res.status === 429 ? 'limited' : 'failed');
      }
    } catch {
      setStatus('failed');
    }
  };

  return (
    <SheetModal label={brief.title} className="md:max-w-[36rem]">
      <div className="p-4 md:p-8">
        <h2 className="text-[22px] leading-[1.15] font-medium md:text-[25px]">
          {brief.title}
        </h2>
        <p className="text-muted mt-2 text-[15px] tracking-[0.015em]">
          {brief.lead}
        </p>

        {status === 'sent' ? (
          <div className="mt-8 rounded-[20px] glass-tint p-6 text-center">
            <h3 className="text-lg font-medium text-ink">
              {brief.sent.title}
            </h3>
            <p className="text-muted mt-2 text-sm">
              {brief.sent.text}
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-7 space-y-6">
            <div>
              <label className="text-muted mb-2 block text-sm font-medium">
                {brief.shots.label}
              </label>

              <div className="rounded-[16px] border border-dashed dashed-line p-4 text-center">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                  id="screenshot-input"
                />
                <label
                  htmlFor="screenshot-input"
                  className="cursor-pointer text-sm font-medium text-blue hover:underline"
                >
                  {brief.shots.add}
                </label>
                <p className="text-muted mt-1 text-xs">{brief.shots.hint}</p>

                {files.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {files.map((f, i) => (
                      <div
                        key={i}
                        className="glass-tint-strong flex items-center gap-2 rounded-lg px-2.5 py-1 text-xs"
                      >
                        <span className="truncate max-w-[120px]">{f.name}</span>
                        <button
                          type="button"
                          onClick={() => setFiles(files.filter((_, idx) => idx !== i))}
                          className="text-muted"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="text-muted mb-2 block text-sm font-medium">
                {brief.link}
              </label>
              <input
                type="text"
                placeholder="https://yourproduct.com"
                value={link}
                onChange={(e) => setLink(e.target.value)}
                className="pill-field placeholder:text-faint w-full rounded-[14px] px-4 py-3 text-[15px] outline-none"
              />
            </div>

            <div>
              <label className="text-muted mb-2 block text-sm font-medium">
                {brief.reach}
              </label>
              <input
                type="text"
                required
                placeholder={brief.contact}
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                className="pill-field placeholder:text-faint w-full rounded-[14px] px-4 py-3 text-[15px] outline-none"
              />

              <input
                type="text"
                tabIndex={-1}
                autoComplete="off"
                value={honeypot}
                onChange={(e) => setHoneypot(e.target.value)}
                className="hidden"
                aria-hidden="true"
              />
            </div>

            <button
              type="submit"
              disabled={!canSubmit || status === 'sending'}
              className="btn button-cream w-full disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Glow />
              <span className="relative">
                {status === 'sending' ? formStrings.sending : formStrings.submit}
              </span>
            </button>
          </form>
        )}
      </div>
    </SheetModal>
  );
}

export function Sheets() {
  const sheet = useSheet();
  const pathname = usePathname();

  // Any route change dismisses whatever sheet was open.
  useEffect(() => {
    openSheet(null);
  }, [pathname]);

  if (sheet === 'pricing') return <PricingSheet />;
  if (sheet === 'contact') return <ContactSheet />;
  if (sheet === 'offer') return <OfferSheet />;
  if (sheet === 'brief') return <BriefSheet />;
  return null;
}
