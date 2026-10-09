# Private reports — World Patro

World Patro uses authenticated Firebase user-scoped collections or Supabase rows with user_id ownership.

- GET /api/v1/reports?kind=kundli&view=summary returns titles, IDs and saved timestamps, without transmitting full birth-chart JSON in the listing.
- POST /api/v1/reports requires JSON, 512 KiB maximum body and same-origin browser request integrity.
- DELETE /api/v1/reports/{id} validates the ID, requires authentication, checks Firebase user path ownership or Supabase user_id row ownership, and enforces same-origin browser integrity.
- The Kundli interface shows saved chart records and asks for confirmation before permanent deletion.
- Birth-chart calculations remain stateless; only explicit Save persists a report.

Limitations: Deletion removes the primary report record, not independently retained provider backups or historical operational logs. Account-wide data export/deletion and verified backup-retention policies are separate pending work. The user should know that recorded birth time and location are sensitive personal details.