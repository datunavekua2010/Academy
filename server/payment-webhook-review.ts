/**
 * Payment webhook contract: review-only, deliberately unrouted and fail-closed.
 * No provider has been selected. Never make this endpoint live until a real
 * provider-specific verifier and atomic, service-only database RPC are reviewed.
 */
import type { SupabaseClient } from '@supabase/supabase-js';

export type VerifiedPaymentEvent = {
  provider: string;
  eventId: string;
  providerCustomerId: string;
  providerSubscriptionId: string;
  providerVersion: string;
  eventType: string;
};
export type AtomicPaymentResult = 'applied' | 'duplicate' | 'ignored';

/** Example trusted backend call only, not an authorization mechanism. The RPC
 * does not exist yet. It MUST atomically deduplicate and update an entitlement,
 * resolve customers from a server-managed mapping, enforce provider ordering,
 * and be executable only by an appropriately scoped server role. */
export async function applyVerifiedPaymentEvent(client: SupabaseClient, event: VerifiedPaymentEvent): Promise<AtomicPaymentResult> {
  if (![event.provider,event.eventId,event.providerCustomerId,event.providerSubscriptionId,event.providerVersion,event.eventType].every(x => typeof x === 'string' && x.length > 0 && x.length <= 200)) throw new Error('Invalid event');
  const { data, error } = await client.rpc('review_payment_apply_verified_event', {
    p_provider:event.provider,p_event_id:event.eventId,p_customer_id:event.providerCustomerId,
    p_subscription_id:event.providerSubscriptionId,p_provider_version:event.providerVersion,p_event_type:event.eventType,
  });
  if (error || (data !== 'applied' && data !== 'duplicate' && data !== 'ignored')) throw new Error('Payment event not committed');
  return data;
}

/** Placeholder must reject all requests, including valid-looking signatures.
 * To implement later: read bounded raw bytes, verify the provider signature and
 * timestamp using its official algorithm, map the verified payload, then call
 * the atomic RPC above. Never trust a browser-supplied user ID or payment status. */
export async function paymentWebhookReviewEndpoint(_request: Request): Promise<Response> {
  return new Response('Not available', { status:503, headers:{'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'} });
}
