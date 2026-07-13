import { NextResponse } from "next/server";
import { PLANS } from "@/lib/stripe";

export async function GET() {
  return NextResponse.json({
    plans: PLANS.map((p) => ({
      id: p.id,
      name: p.name,
      price: p.price,
      priceLabel: p.priceLabel,
      maxProjects: p.maxProjects,
      maxPhotosPerProject: p.maxPhotosPerProject,
      features: p.features,
    })),
  });
}
