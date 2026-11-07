"use client";

import { useEffect, useState } from "react";
import { hours } from "@/content/visit";

/** Today's opening status, computed in the visitor's browser (never at build time). */
export function OpeningStatus() {
  const [label, setLabel] = useState<{ open: boolean; text: string } | null>(null);

  useEffect(() => {
    const now = new Date();
    const today = hours[(now.getDay() + 6) % 7]!;
    if (!today.open || !today.close) {
      setLabel({ open: false, text: "Closed today · open tomorrow from 10:00" });
      return;
    }
    const minutes = now.getHours() * 60 + now.getMinutes();
    const [oh, om] = today.open.split(":").map(Number) as [number, number];
    const [ch, cm] = today.close.split(":").map(Number) as [number, number];
    if (minutes < oh * 60 + om) setLabel({ open: false, text: `Opens today at ${today.open}` });
    else if (minutes >= ch * 60 + cm) setLabel({ open: false, text: `Closed now · today ${today.open}–${today.close}` });
    else setLabel({ open: true, text: `Open today until ${today.close}` });
  }, []);

  return (
    <span aria-live="polite">
      <span className={`status-dot${label && !label.open ? " status-dot--closed" : ""}`} aria-hidden="true" />
      {label?.text ?? "Tuesday – Sunday from 10:00"}
    </span>
  );
}

export function HoursTable() {
  const [today, setToday] = useState<number | null>(null);
  useEffect(() => setToday((new Date().getDay() + 6) % 7), []);
  return (
    <table className="hours">
      <caption className="visually-hidden">Opening hours</caption>
      <tbody>
        {hours.map((d, i) => (
          <tr key={d.day} data-today={today === i}>
            <th scope="row">
              {d.day}
              {today === i && <span className="visually-hidden"> (today)</span>}
            </th>
            <td>
              {d.open ? `${d.open} – ${d.close}` : "Closed"}
              {d.note && d.open && <span className="soft small"> · {d.note}</span>}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
