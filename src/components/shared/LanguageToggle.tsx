import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Languages } from "lucide-react";

const LanguageToggle = ({ className = "" }: { className?: string }) => {
  const { language, setLanguage, t } = useLanguage();

  const next = () => {
    const order: Array<"en" | "ar" | "zh"> = ["en", "ar", "zh"];
    const idx = order.indexOf(language as any);
    setLanguage(order[(idx + 1) % order.length]);
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={next}
      className={`gap-2 ${className}`}
      title="Language / اللغة / 语言"
    >
      <Languages className="w-4 h-4" />
      <span>{t("common.language_next")}</span>
    </Button>
  );
};

export default LanguageToggle;
