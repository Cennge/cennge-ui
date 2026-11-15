"use client";

import { Separator } from "cennge-ui";

const days = [
  {
    date: "November 1",
    commits: ["test(next): look from both sides of the server's time zone on every run", "fix(playground): read the repositories' update dates in UTC"],
  },
  {
    date: "October 31",
    commits: ["fix(kbd): draw the key symbols at the size of the cap", "feat(charts): Sparkline"],
  },
];

export default function CommitsByDay() {
  return (
    <div className="flex w-full max-w-md flex-col gap-3">
      {days.map((day) => (
        <section key={day.date} className="flex flex-col gap-2">
          <Separator>{day.date}</Separator>
          <ul className="flex flex-col gap-1 text-sm">
            {day.commits.map((message) => (
              <li key={message} className="truncate">
                {message}
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
