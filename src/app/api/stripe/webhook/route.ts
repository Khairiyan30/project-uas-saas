import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase";
import { getStripeServer } from "@/lib/stripe";

export async function POST(request: NextRequest) {
  const stripe = getStripeServer();
  if (!stripe) {
    return NextResponse.json(
      { error: "Stripe tidak dikonfigurasi" },
      { status: 503 }
    );
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    return NextResponse.json(
      { error: "Webhook secret tidak dikonfigurasi" },
      { status: 503 }
    );
  }

  const body = await request.text();
  const signature = request.headers.get("stripe-signature") || "";

  let event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    console.error("Stripe webhook signature verification failed:", err);
    return NextResponse.json(
      { error: "Invalid signature" },
      { status: 400 }
    );
  }

  const supabase = createSupabaseServerClient();

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as any;
        const userId = session.metadata?.user_id;

        if (userId) {
          const planMap: Record<string, string> = {
            [process.env.STRIPE_BASIC_PRICE_ID || ""]: "basic",
            [process.env.STRIPE_PRO_PRICE_ID || ""]: "pro",
          };

          const plan = planMap[session.line_items?.data?.[0]?.price?.id] || "basic";

          await supabase.from("subscriptions").upsert({
            user_id: userId,
            plan,
            status: "active",
            stripe_customer_id: session.customer,
            stripe_subscription_id: session.subscription,
            current_period_start: new Date(
              (session as any).current_period_start * 1000
            ).toISOString(),
            current_period_end: new Date(
              (session as any).current_period_end * 1000
            ).toISOString(),
          });
        }
        break;
      }

      case "invoice.paid":
      case "customer.subscription.updated": {
        const subscription = event.data.object as any;
        const customerId = subscription.customer;

        const { data: userSub } = await supabase
          .from("subscriptions")
          .select("user_id")
          .eq("stripe_customer_id", customerId)
          .single();

        if (userSub) {
          const planMap: Record<string, string> = {
            [process.env.STRIPE_BASIC_PRICE_ID || ""]: "basic",
            [process.env.STRIPE_PRO_PRICE_ID || ""]: "pro",
          };

          const priceId = subscription.items?.data?.[0]?.price?.id;
          const plan = planMap[priceId] || "free";

          await supabase
            .from("subscriptions")
            .update({
              plan,
              status: subscription.status,
              current_period_start: new Date(
                subscription.current_period_start * 1000
              ).toISOString(),
              current_period_end: new Date(
                subscription.current_period_end * 1000
              ).toISOString(),
            })
            .eq("stripe_customer_id", customerId);
        }
        break;
      }

      case "customer.subscription.deleted": {
        const deletedSub = event.data.object as any;
        const delCustomerId = deletedSub.customer;

        await supabase
          .from("subscriptions")
          .update({
            plan: "free",
            status: "canceled",
            stripe_subscription_id: null,
            current_period_end: new Date().toISOString(),
          })
          .eq("stripe_customer_id", delCustomerId);
        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook handler error:", error);
    return NextResponse.json(
      { error: "Webhook handler error" },
      { status: 500 }
    );
  }
}
