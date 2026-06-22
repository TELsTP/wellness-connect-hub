import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Video, Loader2, Copy } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Props {
  role: "patient" | "clinician";
  sessionId: string;
  language: string;
  accent: "wellness" | "clinical";
  label: string;
}

/**
 * Patient side creates a new room and navigates to it.
 * Clinician side is given a paste-to-join box (they receive the link from the patient
 * or from a deputization handoff).
 */
const LiveCallLauncher = ({ role, sessionId, language, accent, label }: Props) => {
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  const [joinId, setJoinId] = useState("");
  const accentCls = accent === "wellness" ? "bg-wellness hover:bg-wellness/90" : "bg-clinical hover:bg-clinical/90";

  const startRoom = async () => {
    setBusy(true);
    try {
      const id = `room-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
      const { error } = await supabase.from("rooms").insert({
        id,
        created_by_session: sessionId,
        patient_session: role === "patient" ? sessionId : null,
        clinician_session: role === "clinician" ? sessionId : null,
        status: "open",
        ai_deputy_active: true,
        language,
      });
      if (error) throw error;
      navigate(`/call/${id}?role=${role}`);
    } catch (e) {
      console.error(e);
      toast.error("Could not start the live room.");
    } finally {
      setBusy(false);
    }
  };

  const joinRoom = () => {
    const id = joinId.trim();
    if (!id) return;
    navigate(`/call/${id}?role=${role}`);
  };

  return (
    <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center">
      <Button onClick={startRoom} disabled={busy} className={`${accentCls} text-white gap-2`} size="sm">
        {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Video className="w-4 h-4" />}
        {label}
      </Button>
      <div className="flex gap-2 items-center">
        <input
          value={joinId}
          onChange={(e) => setJoinId(e.target.value)}
          placeholder="paste room id"
          className="text-xs px-2 py-1.5 rounded-md border bg-background w-32 sm:w-40"
        />
        <Button onClick={joinRoom} variant="outline" size="sm" className="gap-1">
          <Copy className="w-3.5 h-3.5" /> Join
        </Button>
      </div>
    </div>
  );
};

export default LiveCallLauncher;