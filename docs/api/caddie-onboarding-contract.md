# Caddie Onboarding and Club Verification Contract

The mobile app currently persists the onboarding draft only on the device so the guided flow can be exercised before the backend exists. This is not an identity, authorization, verification, or source-of-truth mechanism.

## Required server records

- `caddie_profiles`: id, full_name, profile_photo, tagline, bio, years_experience, verification_status, onboarding_completed_at, created_at, updated_at.
- `courses`: id, name, city, region, country, logo, registry_number_required, employment_status_required.
- `caddie_club_associations`: caddie_id, course_id, registry_number, membership_employment_status, verification_status.
- `caddie_skills` and `caddie_languages`: join tables to canonical skill and language records; a database constraint must limit active supported languages to two.
- `caddie_credentials` and `caddie_portfolio_highlights`: structured, separately addressable records. A credential's verification status is independent of its user-entered fields.
- `caddie_verification_requests`: id, caddie_id, course_id, submitted_at, status, reviewed_at, reviewed_by, club_notes, rejection_or_change_reason, submission_version.

## API and authorization behavior

1. `POST /caddies/onboarding-drafts` and `PATCH /caddies/onboarding-drafts/:id` validate and persist each editable step for the authenticated caddie.
2. `POST /caddies/:id/verification-requests` atomically validates required fields, freezes the submitted verification-sensitive version, writes a request, and changes the profile and club association to `pending`.
3. A club-admin-only review endpoint may transition a request from `pending` to `verified`, `changes_requested`, or `rejected`, recording reviewer identity and notes. Caddies must never be allowed to approve their own records.
4. Profile/dashboard/availability mutations that need an approved caddie must be enforced by the backend from the authenticated profile's `verification_status`, not by an Expo route or AsyncStorage value.
5. Material changes during `pending` create a new submission version or return the record to a resubmission state; registry numbers and credentials are not silently altered beneath an active review.

## Shared status enum

`draft | pending | verified | changes_requested | rejected`

This is the `CaddieVerificationStatus` vocabulary in `packages/contracts` and
is also used by the local admin-web review adapter. Matching terms do not make
the two frontend mocks synchronized: each application retains its own local
fixtures until an authenticated API persists and distributes these records.

Client validation exists for immediate feedback only. The server repeats every validation rule, including course-ID ownership, club-specific requirements, credential shape, supported-language limit, and legal status transitions.
