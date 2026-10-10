# Patro — unified full-stack calendar and link audit

## Functional routes
- /app/patro: interactive calendars, month navigator, city presets, local noon Panchang, verified BS conversion, source notices, export and print.
- /app/panchang: shares URL date, timezone, location and astronomical methods.
- /api/v1/patro/day: one validated response containing nine calendar profiles, local noon Panchang, canonical context, module links, provenance and warnings.
- /api/v1/panchang/day: retains the compatible legacy API shape, now with strict date, timezone and location validation.
- /api/v1/calendar/bs/convert: exact authority-bounded BS/AD conversion.
- /api/v1/reports: optional authenticated account persistence (not available without configured Firebase/Supabase backend).

## Connected modules
Panchang, Muhurat, Kundli, festivals, authorities, source registry, world data, research, learning, privacy and admin have actual internal links. Adjacent features requiring providers/credentials remain explicitly contingent on them.

## Operational corrections
- Timezone-resolved local civil noon replaces fixed UTC sampling. New York and Nepal use distinct UTC instants for the same local date.
- Sunrise, sunset, moonrise and moonset now restrict results to the selected local civil date rather than UTC midnight.
- A single abortable data request prevents mixing a new calendar snapshot with stale Panchang values.
- Successful date/location calculations update shareable query parameters; JSON downloads and ICS are local. ICS is only a civil-day reference, not an official religious date declaration.
- Validation requires a real Gregorian date (1900–2100), latitude within ±66°, longitude within ±180°, elevation −500…9000m and valid IANA timezone.
- App reports require authenticated storage and are never written without an explicit Save action.

## Boundaries
Municipality-published Nepal BS coverage is limited to Bhadra and Asoj 2083. Nepal Sambat and other civil/religious authorizations are not invented. Tithi/nakshatra/yoga are instant-based noon values, not a guarantee for the entire day. More official calendars and live Firestore Admin setup remain pending.

## Regression scope
Production smoke tests cover 9 calendar count, BS authority, Kathmandu and New York noon instants, sunrise/sunset, legacy Panchang route, invalid parameters and module section rendering.