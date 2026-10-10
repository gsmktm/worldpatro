/** Branding designation, not a calendar conversion or a new mathematical gate count. */
export const WBGR=Object.freeze({id:"WBGR-109",edition:"1799 BS",series:"WENS",title:"WBGR-109 · 1799 BS · WENS",legacyId:"WBE-9",gateCount:729,anchorCount:9,dimensions:[9,9,9] as const,type:"symbolic-user-reflection" as const});
export function wbgrGateCode(legacyCode:string){return legacyCode.replace(/^WBE-/,"WBGR-109-");}
export function displayWbgrGate<T extends {code:string}>(gate:T){return {...gate,legacyCode:gate.code,code:wbgrGateCode(gate.code)};}
