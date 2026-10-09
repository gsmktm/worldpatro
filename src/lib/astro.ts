import * as Astro from "astronomy-engine";

const TITHI_NAMES = [
  "Pratipada","Dwitiya","Tritiya","Chaturthi","Panchami","Shashthi","Saptami",
  "Ashtami","Navami","Dashami","Ekadashi","Dwadashi","Trayodashi","Chaturdashi","Purnima / Amavasya"
];
const NAKSHATRAS = [
  "Ashwini","Bharani","Krittika","Rohini","Mrigashira","Ardra","Punarvasu","Pushya","Ashlesha",
  "Magha","Purva Phalguni","Uttara Phalguni","Hasta","Chitra","Swati","Vishakha","Anuradha",
  "Jyeshtha","Mula","Purva Ashadha","Uttara Ashadha","Shravana","Dhanishta","Shatabhisha",
  "Purva Bhadrapada","Uttara Bhadrapada","Revati"
];
const YOGAS = [
  "Vishkambha","Priti","Ayushman","Saubhagya","Shobhana","Atiganda","Sukarma","Dhriti","Shula",
  "Ganda","Vriddhi","Dhruva","Vyaghata","Harshana","Vajra","Siddhi","Vyatipata","Variyana",
  "Parigha","Shiva","Siddha","Sadhya","Shubha","Shukla","Brahma","Indra","Vaidhriti"
];

const norm = (n: number) => ((n % 360) + 360) % 360;

function lahiriAyanamsa(date: Date) {
  const jd = date.getTime() / 86400000 + 2440587.5;
  const T = (jd - 2451545.0) / 36525;
  const precessionArcSec =
    5028.796195 * T + 1.1054348 * T ** 2 + 0.00007964 * T ** 3 - 0.000023857 * T ** 4;
  return 23.8531972 + precessionArcSec / 3600;
}

function hhmm(date: Date | null, tz: string) {
  if (!date) return null;
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: tz, hour: "2-digit", minute: "2-digit", hour12: false
  }).format(date);
}

export type PanchangInput = {
  date: Date;
  lat: number;
  lon: number;
  elevation?: number;
  tz: string;
};

export function calculatePanchang(input: PanchangInput) {
  const { date, lat, lon, tz, elevation = 0 } = input;
  const time = Astro.MakeTime(date);
  const sunTropical = Astro.SunPosition(time).elon;
  const moon = Astro.EclipticGeoMoon(time);
  const moonTropical = norm(moon.lon);
  const ayanamsa = lahiriAyanamsa(date);
  const sunSidereal = norm(sunTropical - ayanamsa);
  const moonSidereal = norm(moonTropical - ayanamsa);
  const elongation = norm(moonTropical - sunTropical);
  const tithiNumber = Math.floor(elongation / 12) + 1;
  const tithiInPaksha = ((tithiNumber - 1) % 15) + 1;
  const paksha = tithiNumber <= 15 ? "Shukla" : "Krishna";
  const nakshatraIndex = Math.floor(moonSidereal / (360 / 27));
  const yogaIndex = Math.floor(norm(sunSidereal + moonSidereal) / (360 / 27));
  const observer = new Astro.Observer(lat, lon, elevation);
  const dayStart = new Date(date);
  dayStart.setUTCHours(0, 0, 0, 0);
  const sunrise = Astro.SearchRiseSet(Astro.Body.Sun, observer, 1, Astro.MakeTime(dayStart), 2);
  const sunset = Astro.SearchRiseSet(Astro.Body.Sun, observer, -1, Astro.MakeTime(dayStart), 2);
  const moonrise = Astro.SearchRiseSet(Astro.Body.Moon, observer, 1, Astro.MakeTime(dayStart), 2);
  const moonset = Astro.SearchRiseSet(Astro.Body.Moon, observer, -1, Astro.MakeTime(dayStart), 2);

  return {
    method: "Astronomy Engine 2.1.19 + Lahiri/Chitrapaksha approximation",
    interpretationBoundary: "Astronomical quantities are calculated; auspicious/inauspicious meaning is traditional interpretation.",
    ayanamsa: Number(ayanamsa.toFixed(6)),
    sun: { tropicalLongitude: Number(sunTropical.toFixed(6)), siderealLongitude: Number(sunSidereal.toFixed(6)) },
    moon: { tropicalLongitude: Number(moonTropical.toFixed(6)), siderealLongitude: Number(moonSidereal.toFixed(6)), phaseAngle: Number(Astro.MoonPhase(time).toFixed(4)) },
    tithi: { number: tithiNumber, paksha, name: TITHI_NAMES[tithiInPaksha - 1] },
    nakshatra: { number: nakshatraIndex + 1, name: NAKSHATRAS[nakshatraIndex] },
    yoga: { number: yogaIndex + 1, name: YOGAS[yogaIndex] },
    sunTimes: {
      sunrise: hhmm(sunrise ? sunrise.date : null, tz),
      sunset: hhmm(sunset ? sunset.date : null, tz)
    },
    moonTimes: {
      moonrise: hhmm(moonrise ? moonrise.date : null, tz),
      moonset: hhmm(moonset ? moonset.date : null, tz)
    },
    location: { lat, lon, elevation, tz },
    provenance: {
      type: "ASTRONOMICAL_EPHEMERIS",
      library: "astronomy-engine@2.1.19",
      ayanamsa: "Lahiri approximation anchored at J2000"
    }
  };
}
