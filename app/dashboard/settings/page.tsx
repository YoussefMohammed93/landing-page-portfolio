"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function SettingsPage() {
  return (
    <div>
      <Card>
        <CardHeader>
          <CardTitle>Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <p>
            This is where you can configure your dashboard and website settings.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
