"use client";

import { CalendarPlus, Download } from "lucide-react";
import {
  buildGoogleCalendarUrlForEvent,
  downloadEventIcs,
} from "@/lib/calendar";
import { cn } from "@/lib/utils";

export default function AddToCalendarButtons({ event, compact = false }) {
  const googleUrl = buildGoogleCalendarUrlForEvent(event);

  return (
    <div
      className={cn(
        "flex flex-col gap-2 sm:flex-row sm:flex-wrap",
        compact ? "sm:gap-2" : "sm:gap-3"
      )}
    >
      <a
        href={googleUrl}
        target="_blank"
        rel="noopener noreferrer"
        className={cn(
          "inline-flex min-h-[44px] flex-1 items-center justify-center gap-2 rounded-xl border border-gold/25 bg-gold/10 px-4 py-2.5 text-sm font-medium text-gold-dark transition-colors hover:border-gold/40 hover:bg-gold/15 sm:min-w-[10rem] sm:flex-none",
          compact && "text-xs sm:text-sm"
        )}
      >
        <CalendarPlus className="h-4 w-4 shrink-0" aria-hidden="true" />
        Google Calendar
      </a>
      <button
        type="button"
        onClick={() => downloadEventIcs(event)}
        className={cn(
          "inline-flex min-h-[44px] flex-1 items-center justify-center gap-2 rounded-xl border border-stone-200 bg-white px-4 py-2.5 text-sm font-medium text-charcoal transition-colors hover:border-stone-300 hover:bg-stone-50 sm:min-w-[10rem] sm:flex-none",
          compact && "text-xs sm:text-sm"
        )}
      >
        <Download className="h-4 w-4 shrink-0 text-sage-600" aria-hidden="true" />
        Apple / Outlook (.ics)
      </button>
    </div>
  );
}
