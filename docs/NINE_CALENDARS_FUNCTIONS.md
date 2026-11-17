# Nine Calendars · One Patro — interactive month functions
Written: 2026-11-17 (Tuesday) · Implementation review v1

The `/app/patro#patro-nine-months` section lets visitors choose one of nine civil/cultural calendar profiles, browse forward/backward through its actual month **where a date method exists**, select a date to update all nine day readings and location-aware Panchang, copy selected date, and export native month date-correspondence CSV files.

## Calendar function matrix

| Profile | Source/method | Daily correspondence | Native calendar month grid | Status |
| --- | --- | --- | --- | --- |
| Vedic Panchang | Astronomy-engine, local noon and selected location | Tithi, Nakshatra, Yoga, Sun/Moon in existing Panchang | Gregorian reference navigator only; **no fabricated lunar month** | Astronomy required |
| Gregorian | Intl/ICU Gregorian | Yes | Yes | Calculated |
| Bikram Sambat | Kathmandu Metropolitan City / nMiti CC0 | Yes, **2083 BS only** | Yes inside exact published/reference 2083 ranges | Municipal / open dataset |
| Nepal Sambat | Needs authoritative Newar lunisolar source | Not yet | Gregorian reference navigator only, no invented native dates | Authority required |
| Islamic Hijri (Civil) | Intl/ICU `islamic-civil` | Yes | Yes, tabular | Calculated; moon sighting may differ |
| Chinese Lunisolar | Intl/ICU `chinese` | Yes | Yes, handles leap-month boundaries | Calculated, historical verification limited |
| Hebrew | Intl/ICU `hebrew` | Yes | Yes, handles extra Adar | Calculated; observances start at sunset |
| Persian Solar Hijri | Intl/ICU `persian` | Yes | Yes | Calculated |
| Thai Buddhist Era | Intl/ICU `buddhist` | Yes | Yes | Calculated |

A date in Gregorian 1900–2100 is the stable interchange key. Months are detected by actual ICU first-day transitions, **not** assumed to have 30 or 31 days. Chinese named and leap months and Hebrew leap Adar are read from ICU's own labels. Civil day correspondence does not certify religious observance.

## HTTP interface

`GET /api/v1/calendar/month?date=2026-11-17&calendar=bs&locale=ne`

Returns `selectedDate` and `calendar` with `title,status,mode,source,note,start,end,previousDate,nextDate,days[42]`. Every cell includes its Gregorian ISO date, calendar day string, source classification and whether it is inside the selected month.

- `calendar`: one of `vedic,gregorian,bs,nepal-sambat,hijri,chinese,hebrew,persian,buddhist`
- `date`: valid Gregorian YYYY-MM-DD, 1900–2100; defaults to Nepal current day
- `locale`: `en` or `ne`
- 400 for unsupported calendar IDs, impossible dates and dates outside the supported Gregorian range
- Public, read-only, cacheable; no user state or database access

For all nine **daily** profiles use `GET /api/v1/patro/today?date=YYYY-MM-DD`, `POST /api/v1/calendar/convert` or the location-aware `GET /api/v1/patro/day`.

## Limits not silently overridden

- No official Nepal Sambat lunar conversion dataset is presently integrated.
- Vedic Panchang is a calculation **for a selected date and place**, not a generic twelve-month civil calendar.
- BS conversion is source-bounded to 2083. Unavailable months/years are visibly marked `authority-required`; Gregorian navigation remains possible.
- Neither external Ashesh/Hamro content nor unofficial festival tables are bulk-imported.
- Export files are **civil date correspondences**, not holiday or muhurat authorization.
- Arbitrary reverse parsing of ICU lunar dates is not provided; users navigate their native month and select a date. Leap months make unqualified YYYY-MM-DD reverse text potentially ambiguous.

## Verification

`node scripts/validate-nine-calendars.mjs` runs against a built production server in GitHub Actions. It checks 9 profiles, 7 native + 2 reference month modes, 42-day grid, first/last days, next/previous month roundtrip, BS 2083 29-day Mangsir, provenance and invalid input rejection.

Official API considerations: [Intl.formatToParts](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat/formatToParts) and [Intl.DateTimeFormat](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat).
