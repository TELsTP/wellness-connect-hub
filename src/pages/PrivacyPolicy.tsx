import { useLanguage } from "@/contexts/LanguageContext";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Shield } from "lucide-react";
import LanguageToggle from "@/components/shared/LanguageToggle";

const PrivacyPolicy = () => {
  const { t, isRtl } = useLanguage();
  const BackArrow = isRtl ? ArrowRight : ArrowLeft;

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-lg border-b">
        <div className="container mx-auto px-4 h-14 flex items-center justify-between">
          <Link to="/">
            <Button variant="ghost" size="sm" className="gap-1">
              <BackArrow className="w-4 h-4" />
              {t("common.back")}
            </Button>
          </Link>
          <LanguageToggle />
        </div>
      </header>

      <div className="container mx-auto px-4 py-12 max-w-3xl prose prose-sm dark:prose-invert">
        <div className="flex items-center gap-3 mb-6">
          <Shield className="w-8 h-8 text-primary" />
          <h1 className="font-display m-0">{t("common.privacy_policy")}</h1>
        </div>

        <p className="text-muted-foreground">Last updated: January 2025</p>

        <h2>1. Overview</h2>
        <p>
          TELsTP Telemedicine Hub ("we", "us", "our") is a non-profit AI-powered telemedicine platform
          committed to protecting the privacy and security of all users. This policy explains how we handle
          information when you use our services.
        </p>

        <h2>2. Data We Do NOT Collect</h2>
        <ul>
          <li><strong>No personal health information (PHI)</strong> is stored on our servers</li>
          <li><strong>No user accounts or profiles</strong> are required</li>
          <li><strong>No conversation logs</strong> are permanently stored</li>
          <li><strong>No biometric or genetic data</strong> is collected</li>
          <li><strong>No tracking or profiling</strong> of users</li>
        </ul>

        <h2>3. Anonymous Access</h2>
        <p>
          Our platform operates on an anonymous-first model. All AI interactions are session-based
          and are not linked to any personal identity. When a browser session ends, conversation data
          is discarded.
        </p>

        <h2>4. Compliance</h2>
        <p>Our platform is designed in compliance with:</p>
        <ul>
          <li><strong>HIPAA</strong> (Health Insurance Portability and Accountability Act) — Privacy-by-design approach</li>
          <li><strong>Egyptian Personal Data Protection Law (Law 151 of 2020)</strong> — Full compliance with Egyptian data protection regulations</li>
          <li><strong>WHO Digital Health Guidelines</strong> — Following international standards for digital health platforms</li>
        </ul>

        <h2>5. AI-Generated Content Disclaimer</h2>
        <p>
          All responses provided by our AI systems are for informational and guidance purposes only.
          They do not constitute medical diagnoses, prescriptions, or professional medical advice.
          Users are strongly encouraged to consult qualified healthcare professionals for any
          medical decisions.
        </p>

        <h2>6. Local Storage</h2>
        <p>
          We use browser localStorage only for:
        </p>
        <ul>
          <li>Language preference (English/Arabic)</li>
          <li>Consent acknowledgment status</li>
          <li>Optional session data that users explicitly choose to save</li>
        </ul>
        <p>This data never leaves the user's device.</p>

        <h2>7. Contact</h2>
        <p>
          For privacy concerns or questions, contact the TELsTP project team at:
          <br />
          <strong>Email:</strong> privacy@telstp.org
        </p>

        <div className="bg-muted/50 rounded-lg p-4 mt-8">
          <p className="text-sm text-muted-foreground m-0">
            🏅 This privacy policy is part of the TELsTP AI Co-Accreditation framework.
            Our commitment to privacy and safety is audited and accredited under TELsTP standards.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
