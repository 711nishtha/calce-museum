import type { Metadata } from "next";
import { Suspense } from "react";
import { MuseumExperience } from "@/components/museum/MuseumExperience";
import "@/styles/museum.css";

export const metadata: Metadata = {
  title: "The 3D museum",
  description: "Walk through CALCE in real time: the forecourt, atrium, four galleries, café, garden and shop.",
};

export default function MuseumPage() {
  return (
    <Suspense fallback={<div className="museum" />}>
      <MuseumExperience />
    </Suspense>
  );
}
