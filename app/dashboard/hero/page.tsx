"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function HeroPage() {
  return (
    <div>
      <Card>
        <CardHeader>
          <CardTitle>Hero Section Management</CardTitle>
        </CardHeader>
        <CardContent>
          <p>
            This is where you can manage your hero section content and settings.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
