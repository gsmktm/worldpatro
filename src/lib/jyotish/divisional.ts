// Selected Parashari-style divisional sign rules; chart-specific conventions may vary.
// This subset is explicit; it does not claim all Shodashavarga (16) charts are migrated.
export const DIVISIONAL_CHARTS=[
  {id:"D1",label:"Rashi · D1"},
  {id:"D2",label:"Hora · D2"},
  {id:"D3",label:"Drekkana · D3"},
  {id:"D7",label:"Saptamsa · D7"},
  {id:"D9",label:"Navamsha · D9"},
  {id:"D10",label:"Dashamsha · D10"},
  {id:"D12",label:"Dwadashamsha · D12"}
] as const;
export type DivisionId=typeof DIVISIONAL_CHARTS[number]["id"];
const norm=(n:number)=>((n%360)+360)%360;
export function divisionalSign(longitude:number,id:DivisionId):number {
  const L=norm(longitude),sign=Math.floor(L/30),deg=L%30,odd=sign%2===0;
  switch(id){
    case "D1":return sign;
    case "D2":return odd?(deg<15?4:3):(deg<15?3:4);
    case "D3":return (sign+Math.floor(deg/10)*4)%12;
    case "D7":return ((odd?sign:(sign+6)%12)+Math.floor(deg/(30/7)))%12;
    case "D9":return Math.floor(L/(30/9))%12;
    case "D10":return ((odd?sign:(sign+8)%12)+Math.floor(deg/3))%12;
    case "D12":return (sign+Math.floor(deg/2.5))%12;
  }
}
