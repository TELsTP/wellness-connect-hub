import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, X, MessageCircle } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface Props {
  portalType: "wellness" | "clinical";
}

const HayatPersona = ({ portalType }: Props) => {
  const [expanded, setExpanded] = useState(false);
  const { t, language } = useLanguage();

  const isWellness = portalType === "wellness";
  const name = isWellness ? "حياة — Hayat" : "مساعد — Musa'id";
  const tagline = isWellness
    ? language === "ar" ? "رفيقتك الصحية الذكية" : "Your AI Health Companion"
    : language === "ar" ? "مساعدك السريري الذكي" : "Your Clinical AI Assistant";
  const handshake = "Nakamitshe-Telstp-235153 ✓";

  return (
    <div className="fixed bottom-6 right-6 z-50" dir="ltr">
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className={`absolute bottom-16 right-0 w-72 rounded-2xl border shadow-medical p-4 space-y-3 ${
              isWellness ? "bg-card" : "bg-card"
            }`}
          >
            <button
              onClick={() => setExpanded(false)}
              className="absolute top-2 right-2 text-muted-foreground hover:text-foreground"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                isWellness ? "bg-wellness/10" : "bg-clinical/10"
              }`}>
                <span className="text-2xl">{isWellness ? "💚" : "🩺"}</span>
              </div>
              <div>
                <h4 className="font-display font-bold text-sm">{name}</h4>
                <p className="text-xs text-muted-foreground">{tagline}</p>
              </div>
            </div>

            <div className={`rounded-lg p-2.5 text-xs space-y-1.5 ${
              isWellness ? "bg-wellness/5 border border-wellness/20" : "bg-clinical/5 border border-clinical/20"
            }`}>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status</span>
                <span className={`font-medium ${isWellness ? "text-wellness" : "text-clinical"}`}>
                  ● Online
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Architect</span>
                <span className="font-mono text-[10px]">{handshake}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Accreditation</span>
                <span className="font-medium">{isWellness ? "Level 1" : "Level 3"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Ecosystem</span>
                <span className="font-medium">TELsTP Hub 1</span>
              </div>
            </div>

            <p className="text-[10px] text-muted-foreground text-center">
              Powered by TELsTP AI Co-Accreditation Engine
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating avatar button */}
      <motion.button
        onClick={() => setExpanded(!expanded)}
        className={`w-14 h-14 rounded-full shadow-lg flex items-center justify-center relative ${
          isWellness
            ? "bg-gradient-to-br from-wellness to-primary"
            : "bg-gradient-to-br from-clinical to-primary"
        }`}
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        <span className="text-2xl">{isWellness ? "💚" : "🩺"}</span>
        {/* Pulse ring */}
        <span className={`absolute inset-0 rounded-full animate-ping opacity-20 ${
          isWellness ? "bg-wellness" : "bg-clinical"
        }`} />
      </motion.button>
    </div>
  );
};

export default HayatPersona;
