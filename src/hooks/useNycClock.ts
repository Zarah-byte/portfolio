import { useEffect, useState } from "react";

const nyc = new Intl.DateTimeFormat("en-US", {
  timeZone: "America/New_York",
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
});

/** Live NYC time, refreshed every 30s. Ported from js/site-footer.js. */
export function useNycClock() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(id);
  }, []);
  return { label: nyc.format(now), iso: now.toISOString() };
}
