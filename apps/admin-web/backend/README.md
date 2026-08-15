# Admin-web mock backend

This directory owns the admin-domain state and business rules: caddie fleet,
tee times, assignments, and compliance. It currently uses browser localStorage
so the Vite mock can run without a server.

The React subscription adapter remains under `src/lib/fleet.ts`. When a real
API is introduced, replace the localStorage implementation here with a server
client while preserving the frontend adapter interface.

`caddie-verification.ts` is deliberately separate from the fleet mock. Its
five exported async review functions and their `@nobogey/contracts` types are
the frontend/backend boundary for caddie verification. A real implementation
can replace those functions one at a time without changing the UI. Documents
remain opaque references in the mock; storage and previewing belong to a
future backend implementation.
