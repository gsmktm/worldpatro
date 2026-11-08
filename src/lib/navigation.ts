export type NavItem={slug:string;label:string;ne:string;icon:string;description:string;group:string};
export const NAV_ITEMS:NavItem[]=[
{slug:"",label:"Overview",ne:"आजको संसार",icon:"home",description:"Your day, calendars and connected tools",group:"DAILY"},
{slug:"patro",label:"Calendar",ne:"पात्रो",icon:"calendar",description:"Nine calendars and month navigation",group:"DAILY"},
{slug:"panchang",label:"Panchang",ne:"पञ्चाङ्ग",icon:"sun",description:"Tithi, nakshatra, sunrise and moonrise",group:"DAILY"},
{slug:"festivals",label:"Festivals",ne:"चाडपर्व",icon:"leaf",description:"Source-backed festivals and calendar export",group:"DAILY"},
{slug:"planner",label:"My planner",ne:"मेरो योजना",icon:"bell",description:"Personal events, notes and calendar export",group:"DAILY"},
{slug:"tools",label:"Everyday tools",ne:"उपयोगी साधन",icon:"tools",description:"Date conversion, age, numbers and world clocks",group:"DAILY"},
{slug:"jyotish-explorer",label:"Observatory",ne:"ज्योतिष वेधशाला",icon:"compass",description:"Explore ten astronomical and Jyotish tools",group:"JYOTISH"},
{slug:"kundli",label:"Birth chart",ne:"जन्मकुण्डली",icon:"chart",description:"Lagna, grahas, divisional charts and dasha",group:"JYOTISH"},
{slug:"muhurat",label:"Muhurat finder",ne:"मुहूर्त",icon:"clock",description:"Location-aware candidate windows",group:"JYOTISH"},
{slug:"numerology",label:"Numerology",ne:"अङ्कशास्त्र",icon:"grid",description:"Name and birth-number calculations",group:"JYOTISH"},
{slug:"astrology",label:"Astrology studio",ne:"ज्योतिष अध्ययन",icon:"star",description:"Planetary positions and traditional interpretation",group:"JYOTISH"},
{slug:"world",label:"World intelligence",ne:"विश्व जानकारी",icon:"globe",description:"Country indicators and public data",group:"EXPLORE"},
{slug:"people",label:"Public lives atlas",ne:"व्यक्तित्व सङ्ग्रह",icon:"user",description:"Public profiles with evidence",group:"EXPLORE"},
{slug:"religions",label:"Traditions",ne:"धार्मिक परम्परा",icon:"book",description:"Reviewed observances across traditions",group:"EXPLORE"},
{slug:"learn",label:"Learning hub",ne:"अध्ययन",icon:"book",description:"Published articles and sources",group:"EXPLORE"},
{slug:"wens",label:"WENS · WBGR-109",ne:"WENS · WBGR-109",icon:"compass",description:"Navagraha and the symbolic equilibrium system",group:"WENS"},
{slug:"gates",label:"729 gates",ne:"७२९ द्वार",icon:"grid",description:"Search the nine-by-nine-by-nine symbolic cube",group:"WENS"},
{slug:"wbe",label:"Balance studio",ne:"सन्तुलन अध्ययन",icon:"layers",description:"Nine-dial symbolic assessment",group:"WENS"},
{slug:"research",label:"Research",ne:"अनुसन्धान",icon:"search",description:"Private notebooks, notes and evidence",group:"WORKSPACE"},
{slug:"sources",label:"Sources",ne:"स्रोतहरू",icon:"book",description:"Publishers, provenance and retrieval dates",group:"WORKSPACE"},
{slug:"authorities",label:"Calendar authorities",ne:"पात्रोका आधिकारिक स्रोत",icon:"shield",description:"Published authority releases",group:"WORKSPACE"},
{slug:"alerts",label:"Watchlists",ne:"निगरानी सूची",icon:"bell",description:"Account notifications and watchlists",group:"WORKSPACE"},
{slug:"agents",label:"AI conductor",ne:"AI सहायक",icon:"star",description:"Bounded AI supervisor and specialists",group:"WORKSPACE"},
{slug:"workflows",label:"Workflows",ne:"कार्यप्रवाह",icon:"layers",description:"Track private requests and approvals",group:"WORKSPACE"},
{slug:"consult",label:"Consultations",ne:"परामर्श",icon:"heart",description:"Published experts and booking requests",group:"WORKSPACE"},
{slug:"privacy",label:"Privacy & export",ne:"गोपनीयता",icon:"shield",description:"Account data controls and export",group:"WORKSPACE"},
{slug:"admin",label:"Admin studio",ne:"व्यवस्थापन",icon:"settings",description:"Protected editorial publishing",group:"WORKSPACE"},
{slug:"system",label:"System status",ne:"प्रणाली स्थिति",icon:"grid",description:"Module and backend availability",group:"WORKSPACE"},
{slug:"account",label:"My account",ne:"मेरो खाता",icon:"user",description:"Sign in and manage account access",group:"WORKSPACE"}
];
export const NAV_GROUPS=[
 {id:"DAILY",label:"YOUR EVERYDAY",ne:"तपाईंको हरेक दिन"},
 {id:"JYOTISH",label:"JYOTISH & TIME",ne:"ज्योतिष र समय"},
 {id:"EXPLORE",label:"CULTURE & THE WORLD",ne:"संस्कृति र विश्व"},
 {id:"WENS",label:"WENS · SYMBOLIC SYSTEM",ne:"WENS · प्रतीकात्मक प्रणाली"},
 {id:"WORKSPACE",label:"YOUR WORKSPACE",ne:"तपाईंको कार्यक्षेत्र"}
];
export const modulePath=(slug:string)=>slug?"/app/"+slug:"/app";
