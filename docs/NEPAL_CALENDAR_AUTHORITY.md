# Nepal BS authority coverage and verification

Reviewed on 2026-10-09. Only two months from Kathmandu Metropolitan City official municipality website are included:

- Bhadra 2083 BS: 2026-08-17 through 2026-09-16 (31 days). Source: https://new.kathmandu.gov.np/en/calendar
- Asoj 2083 BS: 2026-09-17 through 2026-10-17 (31 days). Source: https://kathmandu.gov.np/en/calendar

The city's calendar provides both AD and BS dates, along with festivals/holidays. This code imports only the **date correspondence**; it does not treat city events as nationally authoritative holiday or Panchang determinations. It also does not extrapolate month lengths.

The Nepal Panchanga Nirnayak Vikas Samiti's site (https://npns.gov.np/) describes the approval/publication framework for almanacs, and its 2083 notices should be considered when extending Panchang and festival layers. Do not confuse municipal BS/AD conversion with a Panchang approval certificate.

## APIs
- GET /api/v1/calendar/bs/convert?ad=2026-10-09 -> 2083-06-23 with source.
- GET /api/v1/calendar/bs/convert?bs=2083-06-23 -> 2026-10-09.
- Unsupported/out-of-coverage dates -> HTTP 404 with explicit authority_required classification.
- GET /api/v1/patro/today?date=2026-10-09 -> BS card marked VERIFIED MUNICIPAL CALENDAR with link.

## Next expansion
Get licensed/citeable official year/month source datasets or verified government monthly releases for all BS years, store a versioned source hash and publication metadata, independently cross-check roundtrips and date-range continuity, then expand coverage by reviewed release only. Nepal Sambat remains expert-review required.
