import type { Metadata } from "next";
import "./globals.css";
import "./styles/wbe-studio.css";
import "./styles/wens-studio.css";
import "./styles/patro-studio.css";
import "./styles/numerology-studio.css";
import "./styles/kundli-studio.css";
import "./styles/muhurat-studio.css";
import "./styles/privacy-studio.css";
import "./styles/admin-console.css";
import "./styles/work-modules.css";
import "./styles/system-live.css";
import "./styles/login-auth.css";
import "./styles/jyotish-explorer.css";
import "./styles/tokens.css";
import "./styles/observatory.css";

export const metadata: Metadata = {
  title: { default:"World Patro", template:"%s · World Patro" },
  description:"Your Nepali calendar, Panchang, festivals, Jyotish, personal planner and everyday tools. Rooted in Nepal. Connected to the world.",
  applicationName:"World Patro",
  manifest:"/manifest.webmanifest",
  icons:{icon:"/icon.svg",apple:"/icon.svg"}
};

export default function RootLayout({children}:{children:React.ReactNode}) {
  return <html lang="en" suppressHydrationWarning><head><script dangerouslySetInnerHTML={{__html:'try{document.documentElement.dataset.wpTheme=localStorage.getItem("worldpatro.theme.v1")==="day"?"day":"night"}catch(e){}'}}/></head><body>{children}</body></html>;
}

