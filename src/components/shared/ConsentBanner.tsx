import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Shield } from "lucide-react";

interface Props {
  onAccept: () => void;
  portalType: "wellness" | "clinical";
}

const ConsentBanner = ({ onAccept, portalType }: Props) => {
  const { t } = useLanguage();

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-card border rounded-2xl shadow-medical max-w-md w-full p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
            portalType === "clinical" ? "bg-clinical/10" : "bg-wellness/10"
          }`}>
            <Shield className={`w-5 h-5 ${portalType === "clinical" ? "text-clinical" : "text-wellness"}`} />
          </div>
          <h3 className="font-display font-semibold text-lg">{t("wellness.consent_title")}</h3>
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed">{t("wellness.consent_text")}</p>
        <div className="bg-muted/50 rounded-lg p-3">
          <p className="text-xs text-muted-foreground">{t("hub.privacy_note")}</p>
        </div>
        <Button
          onClick={onAccept}
          className={`w-full ${portalType === "clinical" ? "bg-clinical hover:bg-clinical/90" : "bg-wellness hover:bg-wellness/90"} text-white`}
        >
          {t("wellness.consent_agree")}
        </Button>
      </div>
    </div>
  );
};

export default ConsentBanner;
