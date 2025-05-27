"use client";

import { useEffect, useState } from "react";
import { GoogleAnalytics } from '@next/third-parties/google';
import { SiteSettingsForApp } from "@/app/_actions/app-actions";


export default function Analytics({ siteSettings }: { siteSettings: SiteSettingsForApp }) {
    const [showAnalytics, setShowAnalytics] = useState(false);
  
    useEffect(() => {
      const consent = localStorage.getItem("cookie-consent");
      if (consent === "accepted") {
        setShowAnalytics(true);
      }
    }, []);
  
    if (!showAnalytics || !siteSettings.googleAnalyticsId || !siteSettings.isCookieConsentEnabled) return null;

  
    return (
      <GoogleAnalytics gaId={siteSettings.googleAnalyticsId} />
    );
  }