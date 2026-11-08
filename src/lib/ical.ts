export type CalendarEvent={id:string;date:string;title:string;description?:string;location?:string};
/** RFC 5545 all-day events. UTF-8 physical lines are at most 75 octets. */
function escapeText(value:string){return value.replace(/\\/g,"\\\\").replace(/\r?\n/g,"\\n").replace(/;/g,"\\;").replace(/,/g,"\\,");}
function fold(line:string){
  const lines:string[]=[];let part="",bytes=0;
  for(const c of line){const size=new TextEncoder().encode(c).length;if(bytes+size>75){lines.push(part);part=" ";bytes=1;}part+=c;bytes+=size;}
  lines.push(part);return lines.join("\r\n");
}
export function eventsToIcs(events:readonly CalendarEvent[],now=new Date()){
  const stamp=now.toISOString().replace(/[-:]/g,"").replace(/\.\d{3}Z$/,"Z");
  const lines=["BEGIN:VCALENDAR","VERSION:2.0","PRODID:-//World Patro//Personal Calendar v3//EN","CALSCALE:GREGORIAN","METHOD:PUBLISH"];
  for(const event of events){
    const date=event.date.replaceAll("-","");
    const next=new Date(event.date+"T12:00:00Z");next.setUTCDate(next.getUTCDate()+1);
    lines.push("BEGIN:VEVENT","UID:"+escapeText(event.id)+"@worldpatro.vercel.app","DTSTAMP:"+stamp,"DTSTART;VALUE=DATE:"+date,"DTEND;VALUE=DATE:"+next.toISOString().slice(0,10).replaceAll("-",""),"SUMMARY:"+escapeText(event.title));
    if(event.description)lines.push("DESCRIPTION:"+escapeText(event.description));
    if(event.location)lines.push("LOCATION:"+escapeText(event.location));
    lines.push("END:VEVENT");
  }
  lines.push("END:VCALENDAR","");
  return lines.map(fold).join("\r\n");
}
