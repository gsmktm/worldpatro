export function downloadText(filename:string,text:string,mime="text/plain;charset=utf-8"){
  const url=URL.createObjectURL(new Blob([text],{type:mime})),a=document.createElement("a");
  a.href=url;a.download=filename;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
}
