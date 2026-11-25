/**
 * World Patro original SVG vocabulary for the 41 VedicPatro homepage feature categories,
 * researched 2026-11-25. These are NEW, independently drawn visual interpretations.
 * The cited external page establishes menu taxonomy only; no assets/icons were imported.
 * UI status means: available (matching module), related (adjacent module only),
 * concept (visual asset only, no implementation implied).
 */
export type VedicFeatureStatus="available"|"related"|"concept";
export type VedicFeatureCategory="calendar"|"jyotish"|"muhurat";
export type VedicFeature={
  id:string;name:string;ne:string;motif:string;path:string;
  href:string|null;status:VedicFeatureStatus;
};
export type VedicFeatureSection={
  id:VedicFeatureCategory;title:string;ne:string;entries:readonly VedicFeature[];
};
export const VEDIC_FEATURE_SECTIONS:readonly VedicFeatureSection[] = [
  {
    "id": "calendar",
    "title": "Calendar & time",
    "ne": "पात्रो तथा काल गणना",
    "entries": [
      {
        "id": "holidays",
        "name": "Festivals & holidays",
        "ne": "बिदा तथा पर्व",
        "motif": "Festival lamp and calendar",
        "path": "M4 5h16v16H4ZM7 2v6m10-6v6M4 10h16M8 17c3 2 5 2 8 0M12 12c-2 2-2 3 0 4 2-1 2-2 0-4",
        "href": "/app/festivals",
        "status": "related"
      },
      {
        "id": "converter",
        "name": "Date converter",
        "ne": "मिति रूपान्तरण",
        "motif": "Two date cards with exchange arrows",
        "path": "M3 5h8v12H3ZM13 7h8v12h-8M5 3v4M16 5v4M4 9h6M14 11h6M9 20h8m-3-3 3 3-3 3",
        "href": "/app/tools",
        "status": "available"
      },
      {
        "id": "sankranti",
        "name": "Solar ingress",
        "ne": "सूर्यक्रान्ति",
        "motif": "Sun crossing a zodiac arc",
        "path": "M3 18a9 9 0 0 1 18 0M12 2v4M7 7l2 3m8-3-2 3M5 17h14M12 12a3 3 0 1 0 0 6 3 3 0 1 0 0-6",
        "href": "/app/astrology",
        "status": "related"
      },
      {
        "id": "annual-panchang",
        "name": "Annual Panchang cycle",
        "ne": "वार्षिक पञ्चाङ्ग चक्र",
        "motif": "Twelve-part seasonal circular dial",
        "path": "M12 2a10 10 0 1 0 0 20 10 10 0 1 0 0-20M12 2v5m0 10v5M2 12h5m10 0h5M5 5l4 4m6 6 4 4m0-14-4 4M9 15l-4 4",
        "href": "/app/patro",
        "status": "related"
      },
      {
        "id": "daily-kranti",
        "name": "Daily solar declination",
        "ne": "दैनिक क्रान्ति",
        "motif": "Moving sun over horizon",
        "path": "M2 18h20M4 14h16M5 12l3-2 3 1 4-5 4 2M12 3v3M19 3l-2 2M3 5l2 2",
        "href": "/app/astrology",
        "status": "related"
      },
      {
        "id": "panchak-calendar",
        "name": "Panchak calendar",
        "ne": "पञ्चक पात्रो",
        "motif": "Five consecutive star dots",
        "path": "M3 4h18v17H3ZM7 2v4m10-4v4M3 9h18M6 14h.2M9 16h.2M12 14h.2M15 16h.2M18 14h.2",
        "href": null,
        "status": "concept"
      },
      {
        "id": "adhik-maas",
        "name": "Intercalary month",
        "ne": "अधिक मास",
        "motif": "Companion lunar disks over year line",
        "path": "M3 4h18v17H3ZM7 2v4m10-4v4M3 10h18M8 13a3 3 0 1 0 0 6 3 3 0 1 0 0-6M16 13a3 3 0 1 0 0 6 3 3 0 1 0 0-6",
        "href": "/app/learn",
        "status": "related"
      },
      {
        "id": "ritu",
        "name": "Seasons · Ritu",
        "ne": "ऋतु",
        "motif": "Sun, leaf and snow crystals",
        "path": "M4 7a3 3 0 1 0 0 6 3 3 0 1 0 0-6M4 2v2M12 11c4-5 8-3 7 2-1 5-7 5-7 8M12 18l6-5M4 19h6M7 16v6",
        "href": null,
        "status": "concept"
      },
      {
        "id": "brahma-mana",
        "name": "Brahma time scales",
        "ne": "ब्रह्म मान",
        "motif": "Three nested cosmic cycles",
        "path": "M12 2a10 10 0 1 0 0 20 10 10 0 1 0 0-20M12 6a6 6 0 1 0 0 12 6 6 0 1 0 0-12M12 10a2 2 0 1 0 0 4 2 2 0 1 0 0-4M12 2v4",
        "href": "/app/learn",
        "status": "related"
      },
      {
        "id": "learning",
        "name": "Vedic learning",
        "ne": "वैदिक सिकाइ",
        "motif": "Open scripture and star",
        "path": "M12 6v15M12 6C9 4 5 4 2 5v13c4-1 7 0 10 3 3-3 6-4 10-3V5c-3-1-7-1-10 1ZM18 2v4m-2-2h4",
        "href": "/app/learn",
        "status": "available"
      }
    ]
  },
  {
    "id": "jyotish",
    "title": "Jyotish & astronomy",
    "ne": "ज्योतिष तथा मुहूर्त",
    "entries": [
      {
        "id": "avakahada",
        "name": "Avakahada Chakra",
        "ne": "अवकहडा चक्र",
        "motif": "Nine-ring nakshatra wheel",
        "path": "M12 2a10 10 0 1 0 0 20 10 10 0 1 0 0-20M12 5a7 7 0 1 0 0 14 7 7 0 1 0 0-14M12 8a4 4 0 1 0 0 8 4 4 0 1 0 0-8M12 2v3m0 14v3M2 12h3m14 0h3",
        "href": null,
        "status": "concept"
      },
      {
        "id": "abhijit",
        "name": "Abhijit Muhurta",
        "ne": "अभिजित् मुहूर्त",
        "motif": "Midday sun above minute dial",
        "path": "M3 20h18M12 2v3M5 6l3 3m11-3-3 3M12 8a5 5 0 1 0 0 10 5 5 0 1 0 0-10M12 11v3l2 1",
        "href": "/app/vedic",
        "status": "available"
      },
      {
        "id": "kundli",
        "name": "Birth chart",
        "ne": "जन्मकुण्डली निर्माण",
        "motif": "Diamond chart inside square",
        "path": "M2 2h20v20H2ZM12 2l10 10-10 10L2 12ZM2 2l20 20M22 2 2 22M12 6v4m0 4v4",
        "href": "/app/kundli",
        "status": "available"
      },
      {
        "id": "kundli-milan",
        "name": "Chart matching",
        "ne": "कुण्डली मिलान",
        "motif": "Two joined birth charts",
        "path": "M2 4h10v10H2ZM12 10h10v10H12ZM7 4l5 5-5 5-5-5ZM17 10l5 5-5 5-5-5M7 19h4",
        "href": null,
        "status": "concept"
      },
      {
        "id": "e-patha",
        "name": "E-path · readings",
        "ne": "ई-पाठ",
        "motif": "Open manuscript and recitation",
        "path": "M12 7v13M12 7C9 5 6 5 3 6v12c4-1 7 0 9 2 2-2 6-3 9-2V6c-3-1-6-1-9 1ZM6 3l2-1m8 0 2 1M12 1v3",
        "href": "/app/learn",
        "status": "related"
      },
      {
        "id": "rashifal",
        "name": "Horoscope · Rāśi",
        "ne": "राशिफल",
        "motif": "Twelve-spoke Zodiac dial",
        "path": "M12 2a10 10 0 1 0 0 20 10 10 0 1 0 0-20M12 6a6 6 0 1 0 0 12 6 6 0 1 0 0-12M12 2v4m0 12v4M2 12h4m12 0h4M5 5l3 3m8 8 3 3",
        "href": "/app/astrology",
        "status": "related"
      },
      {
        "id": "tithi",
        "name": "Lunar tithi",
        "ne": "तिथि",
        "motif": "Half-illuminated Moon with Sun",
        "path": "M12 3a9 9 0 1 0 0 18 9 9 0 1 0 0-18ZM12 3c6 5 6 13 0 18M3 3l2 2",
        "href": "/app/panchang",
        "status": "available"
      },
      {
        "id": "nakshatra",
        "name": "Nakshatra",
        "ne": "नक्षत्र",
        "motif": "Cluster of ordered stars",
        "path": "M12 2l2.5 7.2L22 12l-7.5 2.1L12 22l-2.5-7.9L2 12l7.5-2.8ZM20 2v3m-1.5-1.5h3",
        "href": "/app/panchang",
        "status": "available"
      },
      {
        "id": "yoga",
        "name": "Panchang Yoga",
        "ne": "योग",
        "motif": "Conjoined solar lunar circles",
        "path": "M7 7a6 6 0 1 0 0 12 6 6 0 1 0 0-12M17 5a6 6 0 1 0 0 12 6 6 0 1 0 0-12M7 13h10",
        "href": "/app/panchang",
        "status": "available"
      },
      {
        "id": "karana",
        "name": "Half-tithi Karana",
        "ne": "करण",
        "motif": "Two halves of lunar dial",
        "path": "M12 2a10 10 0 1 0 0 20 10 10 0 1 0 0-20M12 2v20M2 12h20M12 12l5-5",
        "href": "/app/vedic",
        "status": "available"
      },
      {
        "id": "moon-rashi",
        "name": "Moon Rāśi",
        "ne": "चन्द्र राशि",
        "motif": "Crescent with sidereal stars",
        "path": "M19 15a7 7 0 0 1-10-10 8 8 0 1 0 10 10ZM19 3l.5 1.5L21 5l-1.5.5L19 7l-.5-1.5L17 5l1.5-.5",
        "href": "/app/moon",
        "status": "available"
      },
      {
        "id": "gochar",
        "name": "Graha Gochar",
        "ne": "ग्रह गोचर",
        "motif": "Planetary path through orbit",
        "path": "M12 2a10 10 0 1 0 0 20 10 10 0 1 0 0-20M5 16c3-4 9-5 14-7M17 6l2 3-4 1M9 12a2 2 0 1 0 0 4 2 2 0 1 0 0-4",
        "href": "/app/astrology",
        "status": "related"
      },
      {
        "id": "graha-asta",
        "name": "Planetary setting",
        "ne": "ग्रह अस्त",
        "motif": "Planet descending behind horizon",
        "path": "M2 17h20M5 20h14M7 15a5 5 0 0 1 10 0M12 2v5M5 7l3 3m11-3-3 3M12 10v4m-2-2 2 2 2-2",
        "href": "/app/astrology",
        "status": "related"
      },
      {
        "id": "graha-vakri",
        "name": "Retrograde motion",
        "ne": "ग्रह वक्री",
        "motif": "Reverse orbital direction arrow",
        "path": "M5 7a9 9 0 1 1-1 9M5 7V2M5 7h5M15 8a4 4 0 1 1-1 7M17 15l-3 0 1 3",
        "href": "/app/astrology",
        "status": "related"
      },
      {
        "id": "chandra-grahan",
        "name": "Lunar eclipse",
        "ne": "चन्द्र ग्रहण",
        "motif": "Moon passing through shadow",
        "path": "M12 3a9 9 0 1 0 0 18 9 9 0 1 0 0-18ZM4 4c10 0 12 16 16 16M4 20c10 0 12-16 16-16M12 7v10",
        "href": "/app/jyotish-explorer",
        "status": "related"
      },
      {
        "id": "surya-grahan",
        "name": "Solar eclipse",
        "ne": "सूर्य ग्रहण",
        "motif": "Corona with occluding disc",
        "path": "M12 2v3m0 14v3M2 12h3m14 0h3M5 5l2 2m10 10 2 2m0-14-2 2M7 17l-2 2M12 7a5 5 0 1 0 0 10 5 5 0 1 0 0-10M12 9a3 3 0 1 0 0 6 3 3 0 1 0 0-6",
        "href": "/app/jyotish-explorer",
        "status": "related"
      }
    ]
  },
  {
    "id": "muhurat",
    "title": "Daily times & life rituals",
    "ne": "दैनिक शुभाशुभ तथा संस्कार",
    "entries": [
      {
        "id": "choghadiya",
        "name": "Choghadiya",
        "ne": "चौघडिया",
        "motif": "Eight-part time wheel",
        "path": "M12 2a10 10 0 1 0 0 20 10 10 0 1 0 0-20M12 2v20M2 12h20M5 5l14 14m0-14L5 19M12 12l6-2",
        "href": "/app/vedic",
        "status": "available"
      },
      {
        "id": "hora",
        "name": "Planetary Hora",
        "ne": "होरा",
        "motif": "Planet orbit and hour hand",
        "path": "M12 3a9 9 0 1 0 0 18 9 9 0 1 0 0-18M12 6v6l5 3M5 5l2 2M18 6l1-1M12 2v2",
        "href": "/app/vedic",
        "status": "available"
      },
      {
        "id": "lagna",
        "name": "Lagna · Ascendant",
        "ne": "लग्न",
        "motif": "Rising star at the horizon",
        "path": "M2 19h20M4 16h16M12 15V3M8 7l4-4 4 4M6 12l2-2m8 0 2 2M5 22h14",
        "href": "/app/kundli",
        "status": "related"
      },
      {
        "id": "chandrabala",
        "name": "Chandra Bala",
        "ne": "चन्द्रबल",
        "motif": "Moon in protective emblem",
        "path": "M12 2 20 6v6c0 5-4 9-8 10-4-1-8-5-8-10V6ZM16 13a5 5 0 0 1-5-6 5 5 0 1 0 5 6",
        "href": "/app/muhurat",
        "status": "related"
      },
      {
        "id": "tarabala",
        "name": "Tara Bala",
        "ne": "ताराबल",
        "motif": "Star within protective shield",
        "path": "M12 2 20 6v6c0 5-4 9-8 10-4-1-8-5-8-10V6ZM12 7l1.5 3 3 .5-2.2 2.2.5 3.2L12 14l-2.8 2 .5-3.2L7.5 10.5l3-.5Z",
        "href": "/app/muhurat",
        "status": "related"
      },
      {
        "id": "panchak-rahit",
        "name": "Panchak Rahit",
        "ne": "पञ्चक रहित",
        "motif": "Five dots with check mark",
        "path": "M5 5h.2m5 0h.2m5 0h.2m5 0h.2M5 10h.2m5 0h.2m5 0h.2m5 0h.2M4 17l5 4L20 10",
        "href": null,
        "status": "concept"
      },
      {
        "id": "pushkar-navamsa",
        "name": "Pushkar Navamsa",
        "ne": "पुष्कर नवांश",
        "motif": "Nine lotus sectors",
        "path": "M3 3h18v18H3ZM9 3v18M15 3v18M3 9h18M3 15h18M10 13l2-3 2 3-2 2Z",
        "href": null,
        "status": "concept"
      },
      {
        "id": "vivaha",
        "name": "Marriage · Vivaha",
        "ne": "विवाह",
        "motif": "Two intersecting garlands",
        "path": "M8 4a4 4 0 0 0 0 8c0 3 4 8 4 8s4-5 4-8a4 4 0 0 0-8-8ZM6 7l2 2m8-2-2 2M4 16c3-2 5-2 8 0s5 2 8 0",
        "href": "/app/muhurat",
        "status": "related"
      },
      {
        "id": "bratabandha",
        "name": "Bratabandha",
        "ne": "ब्रतबन्ध",
        "motif": "Sacred thread over ceremonial knot",
        "path": "M4 5c4-3 12-3 16 0M4 19c4 3 12 3 16 0M4 5c-1 8 17 8 16 14M20 5C21 13 3 13 4 19M10 10l4 4m0-4-4 4",
        "href": "/app/muhurat",
        "status": "related"
      },
      {
        "id": "griha-arambha",
        "name": "House construction",
        "ne": "गृह आरम्भ",
        "motif": "Foundation of a rising house",
        "path": "M3 11 12 4l9 7M5 11v9h14v-9M8 20v-6h8v6M3 22h18M7 9l2-2",
        "href": "/app/muhurat",
        "status": "related"
      },
      {
        "id": "griha-pravesh",
        "name": "Housewarming",
        "ne": "गृह प्रवेश",
        "motif": "Door threshold with sacred vessel",
        "path": "M4 21V5h16v16M9 21v-9h6v9M12 7a3 3 0 0 1 3 3H9a3 3 0 0 1 3-3ZM7 3h10",
        "href": "/app/muhurat",
        "status": "related"
      },
      {
        "id": "vyapar",
        "name": "Business opening",
        "ne": "व्यापारिक प्रतिष्ठान",
        "motif": "Storefront with auspicious doorway",
        "path": "M3 10l2-6h14l2 6-2 3-3-1-3 1-3-1-3 1-2-3ZM5 13v8h14v-8M9 21v-6h6v6",
        "href": "/app/muhurat",
        "status": "related"
      },
      {
        "id": "rudri",
        "name": "Rudri ceremony",
        "ne": "रुद्री जुर्ने",
        "motif": "Trishul and ritual drops",
        "path": "M12 3v18M7 4c0 4 5 5 5 1 0 4 5 3 5-1M7 4V2m10 2V2M7 15h10M5 20l-2-3M19 20l2-3",
        "href": "/app/muhurat",
        "status": "related"
      },
      {
        "id": "agni",
        "name": "Fire ceremony",
        "ne": "अग्नि जुर्ने",
        "motif": "Sacred ritual flame",
        "path": "M12 2c1 5 6 6 6 12a6 6 0 0 1-12 0c0-5 3-6 6-12ZM12 11c1 2 3 3 3 5a3 3 0 0 1-6 0c0-2 2-3 3-5ZM4 21h16",
        "href": "/app/muhurat",
        "status": "related"
      },
      {
        "id": "annaprasan",
        "name": "Annaprasan",
        "ne": "अन्नप्रासन",
        "motif": "Ceremonial food bowl and spoon",
        "path": "M3 14c0 5 4 7 9 7s9-2 9-7ZM3 14h18M17 3v7M13 5a4 4 0 0 1 4-2 4 4 0 0 1 4 2M10 10l2 2 2-2",
        "href": "/app/muhurat",
        "status": "related"
      }
    ]
  }
];
export const VEDIC_FEATURE_ICONS:readonly VedicFeature[] = VEDIC_FEATURE_SECTIONS.flatMap(x=>x.entries);
