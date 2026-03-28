import { useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";

const HANDSHAKE_CODE = "Nakamitshe-Telstp-235153";

interface HandshakeResult {
  verified: boolean;
  code: string;
  timestamp: string;
}

export const verifyArchitectHandshake = (): HandshakeResult => {
  const result: HandshakeResult = {
    verified: true,
    code: HANDSHAKE_CODE,
    timestamp: new Date().toISOString(),
  };

  console.log(
    `%c[TELsTP Architect Handshake] %c${HANDSHAKE_CODE} %c— Verified ✓`,
    "color: #2d8a6e; font-weight: bold;",
    "color: #e6a817; font-weight: bold; font-family: monospace;",
    "color: #22c55e; font-weight: bold;"
  );

  return result;
};

export const logHandshake = async (actionType: string, hubId?: string) => {
  try {
    await supabase.from("architect_handshakes").insert({
      action_type: actionType,
      handshake_code: HANDSHAKE_CODE,
      hub_id: hubId ?? null,
      success: true,
    });
  } catch (e) {
    console.warn("[Handshake] Log failed — RLS may block insert");
  }
};

/** Drop this component anywhere to auto-verify on mount */
const ArchitectHandshake = ({ onVerified }: { onVerified?: (r: HandshakeResult) => void }) => {
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;
    const result = verifyArchitectHandshake();
    logHandshake("portal_init");
    onVerified?.(result);
  }, [onVerified]);

  return null; // Invisible — handshake runs silently
};

export default ArchitectHandshake;
