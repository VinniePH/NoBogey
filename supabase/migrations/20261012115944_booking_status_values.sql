-- Add terminal states in their own migration so later migrations can safely use them.
-- `canceled` remains for backwards compatibility with existing clients; new APIs use it
-- as the persisted representation of the product-level CANCELLED state.
alter type public.booking_status add value if not exists 'expired';
alter type public.booking_status add value if not exists 'no_show';
