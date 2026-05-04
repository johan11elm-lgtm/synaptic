import { useEffect, useState } from "react";

export function useActiveSection(ids: string[]): string {
  const [active, setActive] = useState<string>(ids[0] ?? "");
  const idsKey = ids.join(",");

  useEffect(() => {
    const orderedIds = idsKey.split(",").filter(Boolean);
    const elements = orderedIds
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);

    if (elements.length === 0) return;

    const intersecting = new Set<string>();

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) intersecting.add(entry.target.id);
          else intersecting.delete(entry.target.id);
        }
        const deepest = orderedIds.filter((id) => intersecting.has(id)).pop();
        if (deepest) setActive(deepest);
      },
      { rootMargin: "-30% 0px -30% 0px", threshold: 0 },
    );

    for (const el of elements) observer.observe(el);
    return () => observer.disconnect();
  }, [idsKey]);

  return active;
}
