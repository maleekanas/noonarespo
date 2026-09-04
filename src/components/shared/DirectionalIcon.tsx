import React from "react";
import { LucideIcon } from "lucide-react";

interface DirectionalIconProps {
  icon: LucideIcon;
  locale: string;
  className?: string;
}

/**
 * DirectionalIcon wraps a Lucide icon and flips it horizontally if the current locale is RTL (Arabic).
 */
export function DirectionalIcon({
  icon: Icon,
  locale,
  className = "w-5 h-5",
}: DirectionalIconProps) {
  const isArabic = locale === "ar";
  return (
    <span className={`inline-flex items-center justify-center ${isArabic ? "scale-x-[-1]" : ""}`}>
      <Icon className={className} />
    </span>
  );
}
