# Muhurat screening — World Patro

Derived conceptually from the user's Arko Jyotish TAR. The implementation computes transparent candidate windows for community/tradition review, not an objective lucky-time score.

- API POST /api/v1/muhurat/search: strict JSON validation, 4 KiB body limit, up to 31 Gregorian days, IANA timezone and coordinates.
- Source: astronomy-engine sunrise/sunset for the local civil date; existing World Patro Panchang at sunrise; simple tradition-sensitive weekday/tithi review; daylight Rahu Kala exclusion.
- Every candidate shows dates, time windows, criteria satisfied, warnings and reasons. criteriaMatched is a count rather than an auspiciousness probability.
- UI: /app/muhurat with date/location inputs, nine event categories, detailed reasoning and explicit skipped-date reporting.

Limits: This cannot establish one universal or official Muhurat. Other community-specific rules, astrological Tara Bala, Guru/Shukra observances, natal compatibility and festival calendars are not yet integrated. Polar sunrise/sunset and unusual historical timezone cases may be skipped rather than fabricated.

No personal data is persisted. Distributed platform-level rate limiting is still required before anonymous high-volume use.