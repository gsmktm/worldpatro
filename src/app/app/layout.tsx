import { Suspense } from "react";
import { AppShell } from "@/components/app-shell";
export const dynamic="force-dynamic";
export default function Layout({children}:{children:React.ReactNode}) {
  return <Suspense fallback={<div className="wp-starting" role="status"><span>ॐ</span><strong>World Patro</strong><small>Opening your workspace…</small></div>}><AppShell>{children}</AppShell></Suspense>;
}
