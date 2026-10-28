export { buildGoogleCalendarUrl, buildGoogleCalendarUrlForEvent } from "@/lib/calendar";

export function scrollToSection(id) {
  if (typeof document === "undefined") return;
  const element = document.getElementById(id);
  if (element) {
    element.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

export function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}
