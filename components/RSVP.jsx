"use client";

import { useState } from "react";
import { Heart, Loader2, Send } from "lucide-react";
import { EVENTS, WEDDING } from "@/lib/wedding-data";
import { submitRsvp } from "@/lib/google-drive";
import FadeIn from "./FadeIn";
import SectionHeading from "./SectionHeading";
import { TerminalRSVPFooter } from "./TerminalRSVP";

const initialForm = {
  name: "",
  contact: "",
  attending: "",
  guestCount: "1",
  events: [],
};

export default function RSVP() {
  const [form, setForm] = useState(initialForm);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [errors, setErrors] = useState({});

  const toggleEvent = (eventId) => {
    setForm((prev) => ({
      ...prev,
      events: prev.events.includes(eventId)
        ? prev.events.filter((id) => id !== eventId)
        : [...prev.events, eventId],
    }));
  };

  const validate = () => {
    const nextErrors = {};
    if (!form.name.trim()) nextErrors.name = "Please enter your name";
    if (!form.contact.trim()) nextErrors.contact = "Phone or email is required";
    if (!form.attending) nextErrors.attending = "Please let us know if you're attending";
    if (form.attending === "yes" && form.events.length === 0) {
      nextErrors.events = "Select at least one event you'll attend";
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    setSubmitError(null);
    try {
      await submitRsvp({
        name: form.name,
        contact: form.contact,
        attending: form.attending,
        guestCount: form.guestCount,
        events: form.events,
      });
      setSubmitted(true);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Could not submit RSVP — try again.";
      setSubmitError(message);
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setForm(initialForm);
    setSubmitted(false);
    setSubmitError(null);
    setErrors({});
  };

  if (submitted) {
    return (
      <section id="rsvp" className="scroll-mt-4 bg-sand px-5 py-16 md:py-24">
        <div className="mx-auto max-w-lg">
          <FadeIn>
            <TerminalRSVPFooter
              attending={form.attending}
              guestName={form.name}
              onReset={resetForm}
            />
          </FadeIn>
        </div>
      </section>
    );
  }

  return (
    <section id="rsvp" className="scroll-mt-4 bg-sand px-5 py-16 md:py-24">
      <div className="mx-auto max-w-lg">
        <SectionHeading
          label="RSVP"
          title="Will You Join Us?"
          subtitle={`Please let us know if you can celebrate with ${WEDDING.coupleDisplay}.`}
        />

        <FadeIn delay={100}>
          <form
            onSubmit={handleSubmit}
            className="rounded-3xl border border-stone-200/70 bg-ivory p-6 shadow-lg sm:p-8"
            noValidate
          >
            <div className="space-y-5">
              <div>
                <label htmlFor="name" className="mb-1.5 block text-sm font-medium text-charcoal">
                  Guest Name *
                </label>
                <input
                  id="name"
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full rounded-xl border border-stone-200 bg-white px-4 py-3 text-base text-charcoal outline-none transition-colors focus:border-sage-400 focus:ring-2 focus:ring-sage-100"
                  placeholder="Your full name"
                  autoComplete="name"
                />
                {errors.name && (
                  <p className="mt-1 text-xs text-red-600">{errors.name}</p>
                )}
              </div>

              <div>
                <label htmlFor="contact" className="mb-1.5 block text-sm font-medium text-charcoal">
                  Phone or Email *
                </label>
                <input
                  id="contact"
                  type="text"
                  value={form.contact}
                  onChange={(e) => setForm({ ...form, contact: e.target.value })}
                  className="w-full rounded-xl border border-stone-200 bg-white px-4 py-3 text-base text-charcoal outline-none transition-colors focus:border-sage-400 focus:ring-2 focus:ring-sage-100"
                  placeholder="+91 98765 43210 or you@email.com"
                  autoComplete="email tel"
                />
                {errors.contact && (
                  <p className="mt-1 text-xs text-red-600">{errors.contact}</p>
                )}
              </div>

              <fieldset>
                <legend className="mb-2 text-sm font-medium text-charcoal">
                  Attending? *
                </legend>
                <div className="flex gap-3">
                  {[
                    { value: "yes", label: "Joyfully Accept" },
                    { value: "no", label: "Regretfully Decline" },
                  ].map((option) => (
                    <label
                      key={option.value}
                      className={`flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl border px-3 py-3 text-sm font-medium transition-all ${
                        form.attending === option.value
                          ? "border-gold bg-gold/10 text-gold-dark"
                          : "border-stone-200 bg-white text-stone-600 hover:border-stone-300"
                      }`}
                    >
                      <input
                        type="radio"
                        name="attending"
                        value={option.value}
                        checked={form.attending === option.value}
                        onChange={(e) =>
                          setForm({ ...form, attending: e.target.value, events: [] })
                        }
                        className="sr-only"
                      />
                      {option.value === "yes" && (
                        <Heart className="h-4 w-4" aria-hidden="true" />
                      )}
                      {option.label}
                    </label>
                  ))}
                </div>
                {errors.attending && (
                  <p className="mt-1 text-xs text-red-600">{errors.attending}</p>
                )}
              </fieldset>

              {form.attending === "yes" && (
                <>
                  <div>
                    <label htmlFor="guestCount" className="mb-1.5 block text-sm font-medium text-charcoal">
                      Number of Guests
                    </label>
                    <select
                      id="guestCount"
                      value={form.guestCount}
                      onChange={(e) => setForm({ ...form, guestCount: e.target.value })}
                      className="w-full rounded-xl border border-stone-200 bg-white px-4 py-3 text-base text-charcoal outline-none transition-colors focus:border-sage-400 focus:ring-2 focus:ring-sage-100"
                    >
                      {[1, 2, 3, 4, 5].map((n) => (
                        <option key={n} value={String(n)}>
                          {n} {n === 1 ? "Guest" : "Guests"}
                        </option>
                      ))}
                    </select>
                  </div>

                  <fieldset>
                    <legend className="mb-2 text-sm font-medium text-charcoal">
                      Events Attending *
                    </legend>
                    <div className="space-y-2">
                      {EVENTS.map((event) => (
                        <label
                          key={event.id}
                          className={`flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 transition-all ${
                            form.events.includes(event.id)
                              ? "border-sage-300 bg-sage-50"
                              : "border-stone-200 bg-white hover:border-stone-300"
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={form.events.includes(event.id)}
                            onChange={() => toggleEvent(event.id)}
                            className="h-4 w-4 rounded border-stone-300 text-sage-600 focus:ring-sage-400"
                          />
                          <span className="text-sm text-charcoal">{event.title}</span>
                        </label>
                      ))}
                    </div>
                    {errors.events && (
                      <p className="mt-1 text-xs text-red-600">{errors.events}</p>
                    )}
                  </fieldset>
                </>
              )}
            </div>

            {submitError && (
              <p
                className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
                role="alert"
              >
                {submitError}
              </p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="mt-8 inline-flex min-h-[48px] w-full items-center justify-center gap-2 rounded-lg border border-charcoal/10 bg-charcoal px-6 py-3.5 font-mono text-sm font-semibold text-white shadow-lg transition-all hover:-translate-y-0.5 hover:bg-charcoal/90 hover:shadow-xl active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
            >
              {submitting ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              ) : (
                <Send className="h-4 w-4" aria-hidden="true" />
              )}
              {submitting ? "Submitting…" : "$ ./submit-rsvp.sh"}
            </button>
          </form>
        </FadeIn>
      </div>
    </section>
  );
}
