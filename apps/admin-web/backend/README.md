# Admin-web mock backend

This directory owns the admin-domain state and business rules: caddie fleet,
tee times, assignments, compliance, and audit entries. It currently uses
browser localStorage so the Vite mock can run without a server.

The React subscription adapter remains under `src/lib/fleet.ts`. When a real
API is introduced, replace the localStorage implementation here with a server
client while preserving the frontend adapter interface.
