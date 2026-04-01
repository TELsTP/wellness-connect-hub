import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Award, Download, X } from "lucide-react";
import jsPDF from "jspdf";

interface CertificateGeneratorProps {
  messageContent: string;
  sessionId: string;
  onClose: () => void;
}

const extractAccreditation = (content: string) => {
  const levelMatch = content.match(/Level\s*(\d)/i);
  const confidenceMatch = content.match(/Confidence:\s*(\d+)%/i);
  const domainMatch = content.match(/Domain[:\s]+(\w+)/i) || content.match(/Clinical/i);
  return {
    level: levelMatch ? `Level ${levelMatch[1]}` : "Level 3",
    confidence: confidenceMatch ? parseInt(confidenceMatch[1]) : 85,
    domain: domainMatch ? (typeof domainMatch[1] === "string" ? domainMatch[1] : "Clinical") : "Clinical",
  };
}

const CertificateGenerator = ({ messageContent, sessionId, onClose }: CertificateGeneratorProps) => {
  const { t } = useLanguage();
  const extracted = extractAccreditation(messageContent);
  const [doctorOverride, setDoctorOverride] = useState("");
  const [mohEnabled, setMohEnabled] = useState(true);
  const [generating, setGenerating] = useState(false);

  const generatePDF = async () => {
    setGenerating(true);
    const certId = `CERT-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;

    try {
      // Log to accreditation_logs
      await supabase.from("accreditation_logs").insert({
        certificate_id: certId,
        level: extracted.level,
        domain: extracted.domain,
        confidence_score: extracted.confidence,
        doctor_override: doctorOverride || null,
      });

      // Log architect handshake
      await supabase.from("architect_handshakes").insert({
        action_type: "certificate_generation",
        handshake_code: "Nakamitshe-Telstp-235153",
      });

      // Generate PDF
      const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
      const w = doc.internal.pageSize.getWidth();
      const h = doc.internal.pageSize.getHeight();

      // Background
      doc.setFillColor(15, 23, 42); // slate-900
      doc.rect(0, 0, w, h, "F");

      // Border frame
      doc.setDrawColor(59, 130, 246); // blue-500
      doc.setLineWidth(1.5);
      doc.rect(10, 10, w - 20, h - 20);
      doc.setDrawColor(34, 197, 94); // green-500
      doc.setLineWidth(0.5);
      doc.rect(14, 14, w - 28, h - 28);

      // Header
      doc.setTextColor(59, 130, 246);
      doc.setFontSize(12);
      doc.text("TELsTP — Telemedicine & Life-Science Technology Platform", w / 2, 28, { align: "center" });

      doc.setTextColor(255, 255, 255);
      doc.setFontSize(28);
      doc.text("Co-Accreditation Certificate", w / 2, 45, { align: "center" });

      doc.setTextColor(156, 163, 175); // gray-400
      doc.setFontSize(10);
      doc.text("AI-Human Collaborative Clinical Decision Support", w / 2, 54, { align: "center" });

      // Divider
      doc.setDrawColor(59, 130, 246);
      doc.setLineWidth(0.3);
      doc.line(40, 60, w - 40, 60);

      // Certificate details — left column
      const leftX = 35;
      const rightX = w / 2 + 15;
      let y = 72;

      doc.setTextColor(156, 163, 175);
      doc.setFontSize(9);
      doc.text("CERTIFICATE ID", leftX, y);
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(12);
      doc.text(certId, leftX, y + 6);

      doc.setTextColor(156, 163, 175);
      doc.setFontSize(9);
      doc.text("ACCREDITATION LEVEL", rightX, y);
      doc.setTextColor(34, 197, 94);
      doc.setFontSize(16);
      doc.text(extracted.level, rightX, y + 7);

      y += 22;
      doc.setTextColor(156, 163, 175);
      doc.setFontSize(9);
      doc.text("CLINICAL DOMAIN", leftX, y);
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(12);
      doc.text(extracted.domain, leftX, y + 6);

      doc.setTextColor(156, 163, 175);
      doc.setFontSize(9);
      doc.text("AI CONFIDENCE SCORE", rightX, y);
      doc.setTextColor(59, 130, 246);
      doc.setFontSize(16);
      doc.text(`${extracted.confidence}%`, rightX, y + 7);

      // Confidence bar
      const barX = rightX + 30;
      const barW = 80;
      doc.setFillColor(30, 41, 59);
      doc.roundedRect(barX, y - 1, barW, 8, 2, 2, "F");
      doc.setFillColor(59, 130, 246);
      doc.roundedRect(barX, y - 1, (barW * extracted.confidence) / 100, 8, 2, 2, "F");

      y += 22;
      doc.setTextColor(156, 163, 175);
      doc.setFontSize(9);
      doc.text("EGYPTIAN MOH GUIDELINES", leftX, y);
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(12);
      doc.text(mohEnabled ? "✓ Included" : "✗ Not Included", leftX, y + 6);

      doc.setTextColor(156, 163, 175);
      doc.setFontSize(9);
      doc.text("DOCTOR VALIDATION", rightX, y);
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(12);
      doc.text(doctorOverride || "Pending Doctor Review", rightX, y + 6);

      y += 22;
      doc.setTextColor(156, 163, 175);
      doc.setFontSize(9);
      doc.text("SESSION ID", leftX, y);
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(10);
      doc.text(sessionId, leftX, y + 6);

      doc.setTextColor(156, 163, 175);
      doc.setFontSize(9);
      doc.text("ISSUED", rightX, y);
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(10);
      doc.text(new Date().toISOString().split("T")[0], rightX, y + 6);

      // Divider
      doc.setDrawColor(59, 130, 246);
      doc.line(40, y + 16, w - 40, y + 16);

      // Architect Handshake
      y += 26;
      doc.setTextColor(34, 197, 94);
      doc.setFontSize(9);
      doc.text("ARCHITECT HANDSHAKE: Nakamitshe-Telstp-235153 — Verified ✓", w / 2, y, { align: "center" });

      // Footer
      doc.setTextColor(100, 116, 139);
      doc.setFontSize(7);
      doc.text("⚕️ This certificate validates AI-human co-accredited clinical decision support. Not a medical license or diagnosis.", w / 2, h - 22, { align: "center" });
      doc.text("HIPAA-compliant • Egyptian Data Protection Law 151/2020 • TELsTP Non-Profit Initiative", w / 2, h - 17, { align: "center" });

      doc.save(`TELsTP-Certificate-${certId}.pdf`);
      toast.success("Certificate generated and downloaded!");
      onClose();
    } catch (err) {
      console.error("Certificate generation error:", err);
      toast.error("Failed to generate certificate");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="mt-3 p-4 rounded-xl border border-clinical/30 bg-clinical/5 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-semibold text-clinical">
          <Award className="w-4 h-4" />
          Co-Accreditation Certificate
        </div>
        <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-3 gap-3 text-xs">
        <div className="bg-card border rounded-lg p-2">
          <span className="text-muted-foreground block">Level</span>
          <span className="font-bold text-clinical">{extracted.level}</span>
        </div>
        <div className="bg-card border rounded-lg p-2">
          <span className="text-muted-foreground block">Domain</span>
          <span className="font-bold">{extracted.domain}</span>
        </div>
        <div className="bg-card border rounded-lg p-2">
          <span className="text-muted-foreground block">Confidence</span>
          <span className="font-bold text-clinical">{extracted.confidence}%</span>
        </div>
      </div>

      <div className="flex items-center gap-2 text-xs">
        <span className="text-muted-foreground">MOH Guidelines</span>
        <Switch checked={mohEnabled} onCheckedChange={setMohEnabled} />
      </div>

      <Input
        value={doctorOverride}
        onChange={(e) => setDoctorOverride(e.target.value)}
        placeholder="Doctor name / override note (optional)"
        className="text-sm"
      />

      <Button
        onClick={generatePDF}
        disabled={generating}
        className="w-full bg-clinical hover:bg-clinical/90 text-white gap-2"
      >
        <Download className="w-4 h-4" />
        {generating ? "Generating..." : "Download Certificate PDF"}
      </Button>
    </div>
  );
};

export default CertificateGenerator;
