import Stripe from "stripe";

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

export function getStripeServer(): Stripe | null {
  if (!stripeSecretKey) return null;
  return new Stripe(stripeSecretKey, {
    typescript: true,
  });
}

export const PLANS = [
  {
    id: "free",
    name: "Free",
    price: 0,
    priceLabel: "Gratis",
    maxProjects: 3,
    maxPhotosPerProject: 100,
    features: [
      "3 proyek",
      "100 foto per proyek",
      "Gallery client standar",
      "Progress tracking",
      "Dukungan email",
    ],
    priceId: null,
  },
  {
    id: "basic",
    name: "Basic",
    price: 199000,
    priceLabel: "Rp199.000",
    maxProjects: 20,
    maxPhotosPerProject: 500,
    features: [
      "20 proyek",
      "500 foto per proyek",
      "Gallery client + kurasi",
      "Progress tracking",
      "Undang klien via email",
      "Prioritas support",
    ],
    priceId: process.env.STRIPE_BASIC_PRICE_ID,
  },
  {
    id: "pro",
    name: "Pro",
    price: 499000,
    priceLabel: "Rp499.000",
    maxProjects: 999999,
    maxPhotosPerProject: 999999,
    features: [
      "Proyek tak terbatas",
      "Foto tak terbatas",
      "Gallery client + kurasi",
      "Progress tracking",
      "Undang klien via email",
      "Custom branding",
      "Prioritas support 24/7",
    ],
    priceId: process.env.STRIPE_PRO_PRICE_ID,
  },
] as const;

export type PlanId = (typeof PLANS)[number]["id"];

export function getPlanLimits(planId: string) {
  const plan = PLANS.find((p) => p.id === planId);
  if (!plan) return PLANS[0];
  return plan;
}
