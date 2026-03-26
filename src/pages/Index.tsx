import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import LanguageToggle from "@/components/shared/LanguageToggle";
import MedicalDisclaimer from "@/components/shared/MedicalDisclaimer";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Heart, Stethoscope, FlaskConical, Pill, ShieldCheck,
  ArrowRight, ArrowLeft, Sparkles, Activity, Users, Globe
} from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: "easeOut" as const },
  }),
};

const Index = () => {
  const { t, isRtl } = useLanguage();
  const Arrow = isRtl ? ArrowLeft : ArrowRight;

  const features = [
    { icon: Activity, title: t("hub.feature1_title"), desc: t("hub.feature1_desc"), color: "text-wellness" },
    { icon: FlaskConical, title: t("hub.feature2_title"), desc: t("hub.feature2_desc"), color: "text-accent" },
    { icon: Stethoscope, title: t("hub.feature3_title"), desc: t("hub.feature3_desc"), color: "text-clinical" },
    { icon: Pill, title: t("hub.feature4_title"), desc: t("hub.feature4_desc"), color: "text-primary" },
  ];

  const steps = [
    { num: "01", title: t("hub.step1_title"), desc: t("hub.step1_desc"), icon: "💬" },
    { num: "02", title: t("hub.step2_title"), desc: t("hub.step2_desc"), icon: "🤖" },
    { num: "03", title: t("hub.step3_title"), desc: t("hub.step3_desc"), icon: "✅" },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-lg border-b">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Heart className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-display font-bold text-lg">TELsTP</span>
          </div>
          <div className="flex items-center gap-2">
            <LanguageToggle />
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-hero">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-pulse-glow" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-wellness/10 rounded-full blur-3xl animate-pulse-glow" style={{ animationDelay: "1.5s" }} />
        </div>

        <div className="container mx-auto px-4 py-20 md:py-32 relative">
          <motion.div
            className="text-center max-w-3xl mx-auto"
            initial="hidden"
            animate="visible"
            variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
          >
            <motion.div variants={fadeUp} custom={0} className="inline-flex items-center gap-2 bg-primary/10 rounded-full px-4 py-1.5 text-sm text-primary font-medium mb-6">
              <Sparkles className="w-4 h-4" />
              {t("hub.subtitle")}
            </motion.div>

            <motion.h1 variants={fadeUp} custom={1} className="font-display text-4xl md:text-6xl font-bold text-foreground leading-tight mb-4">
              {t("hub.title")}
            </motion.h1>

            <motion.p variants={fadeUp} custom={2} className="text-lg md:text-xl text-muted-foreground mb-10 leading-relaxed">
              {t("hub.mission")}
            </motion.p>

            {/* Portal Cards */}
            <motion.div variants={fadeUp} custom={3} className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
              {/* Wellness Portal */}
              <Link to="/wellness" className="group">
                <Card className="relative overflow-hidden border-2 border-transparent hover:border-wellness/40 transition-all duration-300 shadow-medical hover:shadow-wellness">
                  <CardContent className="p-6 text-center space-y-3">
                    <div className="w-14 h-14 mx-auto rounded-2xl bg-wellness/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Heart className="w-7 h-7 text-wellness" />
                    </div>
                    <h3 className="font-display font-bold text-xl">{t("hub.wellness_portal")}</h3>
                    <p className="text-sm text-muted-foreground">{t("hub.wellness_desc")}</p>
                    <Button className="bg-wellness hover:bg-wellness/90 text-white gap-2 mt-2">
                      {t("hub.enter_portal")}
                      <Arrow className="w-4 h-4" />
                    </Button>
                  </CardContent>
                </Card>
              </Link>

              {/* Assist Portal */}
              <Link to="/assist" className="group">
                <Card className="relative overflow-hidden border-2 border-transparent hover:border-clinical/40 transition-all duration-300 shadow-medical hover:shadow-clinical">
                  <CardContent className="p-6 text-center space-y-3">
                    <div className="w-14 h-14 mx-auto rounded-2xl bg-clinical/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Stethoscope className="w-7 h-7 text-clinical" />
                    </div>
                    <h3 className="font-display font-bold text-xl">{t("hub.assist_portal")}</h3>
                    <p className="text-sm text-muted-foreground">{t("hub.assist_desc")}</p>
                    <Button className="bg-clinical hover:bg-clinical/90 text-white gap-2 mt-2">
                      {t("hub.enter_portal")}
                      <Arrow className="w-4 h-4" />
                    </Button>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-card/50">
        <div className="container mx-auto px-4">
          <motion.h2
            className="font-display text-3xl font-bold text-center mb-12"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            {t("hub.how_it_works")}
          </motion.h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {steps.map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="text-center space-y-3"
              >
                <div className="text-4xl mb-2">{step.icon}</div>
                <div className="text-xs font-bold text-primary tracking-widest">{step.num}</div>
                <h3 className="font-display font-semibold text-lg">{step.title}</h3>
                <p className="text-sm text-muted-foreground">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.h2
            className="font-display text-3xl font-bold text-center mb-12"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            {t("hub.features")}
          </motion.h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {features.map((feat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className="h-full hover:shadow-medical transition-shadow">
                  <CardContent className="p-5 space-y-3">
                    <feat.icon className={`w-8 h-8 ${feat.color}`} />
                    <h3 className="font-display font-semibold">{feat.title}</h3>
                    <p className="text-sm text-muted-foreground">{feat.desc}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Impact */}
      <section className="py-20 bg-gradient-hero">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="max-w-2xl mx-auto space-y-6"
          >
            <h2 className="font-display text-3xl font-bold">{t("hub.impact")}</h2>
            <div className="grid grid-cols-3 gap-6 mt-8">
              <div className="space-y-1">
                <div className="font-display text-3xl font-bold text-primary">78%</div>
                <div className="text-xs text-muted-foreground">AI Gap Closed</div>
              </div>
              <div className="space-y-1">
                <div className="font-display text-3xl font-bold text-wellness">24/7</div>
                <div className="text-xs text-muted-foreground">Available</div>
              </div>
              <div className="space-y-1">
                <div className="font-display text-3xl font-bold text-clinical">100%</div>
                <div className="text-xs text-muted-foreground">Non-Profit</div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Disclaimer */}
      <section className="py-12">
        <div className="container mx-auto px-4 max-w-2xl">
          <MedicalDisclaimer variant="banner" />
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-primary" />
              <span>{t("hub.powered_by")}</span>
            </div>
            <div className="flex items-center gap-4">
              <Link to="/privacy" className="hover:text-foreground transition-colors">{t("common.privacy_policy")}</Link>
              <span>•</span>
              <span>© 2025 TELsTP — Non-Profit</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
