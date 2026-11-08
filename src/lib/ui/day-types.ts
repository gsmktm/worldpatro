import type { CalendarResult } from "@/lib/calendars";
export type DaySnapshot={
 canonical:{date:string;instantUsed:string;timezone:string;latitude:number;longitude:number;locale:string};
 calendars:CalendarResult[];
 panchang:{tithi:{name:string;number:number;paksha:string};nakshatra:{name:string};yoga:{name:string};sunTimes:{sunrise:string|null;sunset:string|null};moonTimes:{moonrise:string|null;moonset:string|null};moon:{phaseAngle:number};method:string};
 generatedAt:string;warning:string;
};
