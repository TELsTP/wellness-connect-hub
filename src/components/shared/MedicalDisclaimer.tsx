import { useLanguage } from "@/contexts/LanguageContext";
import { AlertTriangle } from "lucide-react";

interface Props {
  variant?: "banner" | "inline" | "compact";
}

const MedicalDisclaimer = ({ variant = "inline" }: Props) => {
  const { t } = useLanguage();

  if (variant === "compact") {
    return (
      <p className="text-xs text-muted-foreground text-center py-1 px-2">
        {t("common.disclaimer")}
      </p>
    );
  }

  if (variant === "banner") {
    return (
      <div className="bg-accent/10 border border-accent/30 rounded-lg p-4 flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-accent shrink-0 mt-0.5" />
        <div>
          <h4 className="font-semibold text-sm text-foreground">{t("hub.disclaimer_title")}</h4>
          <p className="text-sm text-muted-foreground mt-1">{t("hub.disclaimer_text")}</p>
          <p className="text-xs text-muted-foreground mt-2 opacity-70">{t("hub.privacy_note")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-muted/50 rounded-md px-3 py-2 text-xs text-muted-foreground flex items-center gap-2">
      <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
      <span>{t("common.disclaimer")}</span>
    </div>
  );
};

export default MedicalDisclaimer;
