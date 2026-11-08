import type {MetadataRoute} from "next";
export default function manifest():MetadataRoute.Manifest{
 return {name:"World Patro",short_name:"World Patro",description:"Calendar, culture and your connected world. From Nepal.",start_url:"/app",display:"standalone",background_color:"#09171d",theme_color:"#10272e",lang:"en",icons:[{src:"/icon.svg",sizes:"any",type:"image/svg+xml",purpose:"any"}],shortcuts:[{name:"Calendar",url:"/app/patro"},{name:"My planner",url:"/app/planner"},{name:"Festivals",url:"/app/festivals"}]};
}
