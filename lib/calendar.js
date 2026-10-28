import { EVENTS, VENUE, WEDDING } from "@/lib/wedding-data";

function formatGoogleCalendarDate(date) {
  return date.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}

function escapeIcs(text) {
  return String(text)
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\n/g, "\\n");
}

function invitationSiteUrl() {
  const url = (WEDDING.siteUrl || "").trim();
  if (!url || /example\.com/i.test(url)) return null;
  return url;
}

/** @param {{ title: string, date: string, time?: string, venue: string, address: string }} event */
function eventCalendarDescription(event) {
  const lines = [
    `Celebrating ${WEDDING.coupleDisplay}'s wedding — ${event.title}.`,
    [event.date, event.time].filter(Boolean).join(" · "),
    `${event.venue}, ${event.address}`,
  ];
  const site = invitationSiteUrl();
  if (site) lines.push(site);
  return lines.join("\n");
}

/** @param {{ title: string, calendarStart: string, calendarEnd: string, venue: string, address: string, time?: string, date: string, id: string }} event */
export function buildGoogleCalendarUrlForEvent(event) {
  const start = new Date(event.calendarStart);
  const end = new Date(event.calendarEnd);

  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: `${WEDDING.coupleDisplay} — ${event.title}`,
    dates: `${formatGoogleCalendarDate(start)}/${formatGoogleCalendarDate(end)}`,
    details: eventCalendarDescription(event),
    location: `${event.venue}, ${event.address}`,
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

/** Default link: wedding ceremony (footer helper). */
export function buildGoogleCalendarUrl() {
  const ceremony = EVENTS.find((e) => e.id === "ceremony");
  if (ceremony) return buildGoogleCalendarUrlForEvent(ceremony);
  return buildGoogleCalendarUrlForEvent({
    id: "ceremony",
    title: "Wedding Ceremony",
    calendarStart: WEDDING.date,
    calendarEnd: new Date(
      new Date(WEDDING.date).getTime() + 4 * 60 * 60 * 1000
    ).toISOString(),
    venue: VENUE.name,
    address: VENUE.address,
    time: "10:00 AM",
  });
}

/** @param {{ title: string, calendarStart: string, calendarEnd: string, venue: string, address: string, time?: string, id: string }} event */
export function buildIcsForEvent(event) {
  const start = new Date(event.calendarStart);
  const end = new Date(event.calendarEnd);
  const stamp = formatGoogleCalendarDate(new Date());
  const uidHost =
    invitationSiteUrl()?.replace(/[^\w.]/g, "") || "wedding-invite";
  const uid = `${event.id}-${event.calendarStart}@${uidHost}`;

  const description = eventCalendarDescription(event);

  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "PRODID:-//Wedding Invitation//EN",
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `DTSTAMP:${stamp}`,
    `DTSTART:${formatGoogleCalendarDate(start)}`,
    `DTEND:${formatGoogleCalendarDate(end)}`,
    `SUMMARY:${escapeIcs(`${WEDDING.coupleDisplay} — ${event.title}`)}`,
    `LOCATION:${escapeIcs(`${event.venue}, ${event.address}`)}`,
    `DESCRIPTION:${escapeIcs(description)}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
}

/** @param {{ title: string, id: string }} event */
export function downloadEventIcs(event) {
  if (typeof document === "undefined") return;

  const ics = buildIcsForEvent(event);
  const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${WEDDING.groom}-${WEDDING.bride}-${event.id}.ics`;
  link.click();
  URL.revokeObjectURL(url);
}
