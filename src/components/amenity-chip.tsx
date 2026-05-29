import type { ComponentType } from "react";
import type { LucideIcon } from "lucide-react";
import * as Icons from "lucide-react";

interface AmenityChipProps {
  name: string;
  iconName?: string;
  Icon?: LucideIcon;
}

type IconComponent = ComponentType<{ className?: string }>;

export function AmenityChip({ name, iconName, Icon }: AmenityChipProps) {
  const IconComponent: IconComponent = Icon
    ? (Icon as unknown as IconComponent)
    : iconName
      ? ((Icons as unknown as Record<string, IconComponent>)[iconName] ||
          Icons.HelpCircle)
      : (Icons.HelpCircle as unknown as IconComponent);

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-white/50 dark:bg-white/[0.06] backdrop-blur-xl border border-black/[0.04] dark:border-white/[0.08] shadow-sm">
      <div className="flex items-center justify-center w-6 h-6 rounded-lg bg-black/[0.04] dark:bg-white/10">
        <IconComponent className="w-3.5 h-3.5 text-neutral-500 dark:text-white/65" />
      </div>
      <span className="text-[0.7rem] font-semibold text-neutral-600 dark:text-white/80 tracking-wide">
        {name}
      </span>
    </div>
  );
}
