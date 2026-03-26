import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Languages } from "lucide-react";

const LanguageToggle = ({ className = "" }: { className?: string }) => {
  const { language, setLanguage, t } = useLanguage();

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => setLanguage(language === "en" ? "ar" : "en")}
      className={`gap-2 ${className}`}
    >
      <Languages className="w-4 h-4" />
      <span>{t("common.language")}</span>
    </Button>
  );
};

export default LanguageToggle;
