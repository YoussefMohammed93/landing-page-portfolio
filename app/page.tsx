"use client";

import { Button } from "@/components/ui/button";

export default function MainPage() {
  return (
    <main>
      <Button
        onClick={() => {
          alert("Hello!");
        }}
      >
        Click
      </Button>
    </main>
  );
}
