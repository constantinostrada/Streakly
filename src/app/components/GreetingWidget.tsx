"use client";

import { useEffect, useState } from "react";

const daysOfWeek = [
  "domingo",
  "lunes",
  "martes",
  "miércoles",
  "jueves",
  "viernes",
  "sábado",
];

const months = [
  "enero",
  "febrero",
  "marzo",
  "abril",
  "mayo",
  "junio",
  "julio",
  "agosto",
  "septiembre",
  "octubre",
  "noviembre",
  "diciembre",
];

export default function GreetingWidget(): JSX.Element {
  const [mounted, setMounted] = useState(false);
  const [currentTime, setCurrentTime] = useState<Date | null>(null);

  useEffect(() => {
    setMounted(true);
    setCurrentTime(new Date());
  }, []);

  if (!mounted || !currentTime) {
    // Render empty or placeholder during SSR or before mount
    return <div className="p-4 bg-white rounded shadow-md w-full max-w-sm">Loading...</div>;
  }

  const hour = currentTime.getHours();
  let greeting = "";
  if (hour >= 6 && hour < 12) {
    greeting = "Buenos días";
  } else if (hour >= 12 && hour < 20) {
    greeting = "Buenas tardes";
  } else {
    greeting = "Buenas noches";
  }

  const dayName = daysOfWeek[currentTime.getDay()];
  const day = currentTime.getDate();
  const monthName = months[currentTime.getMonth()];

  const formattedDate = `${dayName}, ${day} de ${monthName}`;

  return (
    <div className="p-6 bg-white rounded-lg shadow-md w-full max-w-sm">
      <h2 className="text-xl font-semibold mb-2">{greeting}</h2>
      <p className="text-gray-600">{formattedDate}</p>
    </div>
  );
}
