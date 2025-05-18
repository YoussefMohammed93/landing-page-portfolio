"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

export default function MainPage() {
  const tasks = useQuery(api.tasks.get);

  return (
    <main className="w-full h-screen flex items-center justify-center">
      <ul className="flex items-center flex-col gap-5">
        {tasks?.map((task) => {
          return (
            <li
              key={task._id}
              className={`text-5xl ${
                task.isCompleted ? "text-green-500" : "text-yellow-500"
              }`}
            >
              {task.text}
            </li>
          );
        })}
      </ul>
    </main>
  );
}
