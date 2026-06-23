import { supabase } from "@/integrations/supabase/client";
import type { RealtimeChannel } from "@supabase/supabase-js";

export type SignalRole = "patient" | "clinician";

export interface SignalingHandlers {
  onOffer: (sdp: RTCSessionDescriptionInit, from: SignalRole) => void;
  onAnswer: (sdp: RTCSessionDescriptionInit, from: SignalRole) => void;
  onIce: (candidate: RTCIceCandidateInit, from: SignalRole) => void;
  onPeerJoin: (peer: SignalRole) => void;
  onPeerLeave: (peer: SignalRole) => void;
}

/**
 * Thin WebRTC signaling layer over Supabase Realtime broadcast.
 * One channel per room; messages are tagged with sender role so each side
 * ignores its own echoes.
 */
export class SignalingChannel {
  private channel: RealtimeChannel;
  constructor(
    private roomId: string,
    private role: SignalRole,
    private handlers: SignalingHandlers,
  ) {
    this.channel = supabase.channel(`call:${roomId}`, {
      config: { broadcast: { ack: false, self: false }, presence: { key: role } },
    });
  }

  async join() {
    this.channel
      .on("broadcast", { event: "offer" }, (msg) => {
        if (msg.payload.from !== this.role) this.handlers.onOffer(msg.payload.sdp, msg.payload.from);
      })
      .on("broadcast", { event: "answer" }, (msg) => {
        if (msg.payload.from !== this.role) this.handlers.onAnswer(msg.payload.sdp, msg.payload.from);
      })
      .on("broadcast", { event: "ice" }, (msg) => {
        if (msg.payload.from !== this.role) this.handlers.onIce(msg.payload.candidate, msg.payload.from);
      })
      .on("presence", { event: "join" }, ({ key }) => {
        if (key !== this.role) this.handlers.onPeerJoin(key as SignalRole);
      })
      .on("presence", { event: "leave" }, ({ key }) => {
        if (key !== this.role) this.handlers.onPeerLeave(key as SignalRole);
      });

    await new Promise<void>((resolve, reject) => {
      this.channel.subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          await this.channel.track({ role: this.role, ts: Date.now() });
          resolve();
        } else if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
          reject(new Error(`signaling subscribe failed: ${status}`));
        }
      });
    });
  }

  sendOffer(sdp: RTCSessionDescriptionInit) {
    return this.channel.send({ type: "broadcast", event: "offer", payload: { sdp, from: this.role } });
  }
  sendAnswer(sdp: RTCSessionDescriptionInit) {
    return this.channel.send({ type: "broadcast", event: "answer", payload: { sdp, from: this.role } });
  }
  sendIce(candidate: RTCIceCandidateInit) {
    return this.channel.send({ type: "broadcast", event: "ice", payload: { candidate, from: this.role } });
  }

  async leave() {
    try { await this.channel.untrack(); } catch { /* noop */ }
    await supabase.removeChannel(this.channel);
  }
}

/**
 * ICE servers. STUN is enough for ~80% of consumer NATs; for the strict
 * CG-NAT setups common on Egyptian mobile carriers we also need TURN.
 *
 * Self-hosted coturn is the planned route (see README "TURN / coturn"). When
 * those credentials are provisioned, set the following Vite env vars at
 * build time and the relay servers will be appended automatically — no code
 * change required:
 *
 *   VITE_TURN_URL       e.g. turn:turn.telstp.org:3478?transport=udp
 *   VITE_TURN_USERNAME  short-lived credential username (HMAC pattern)
 *   VITE_TURN_PASSWORD  short-lived credential password
 *
 * For production these should be minted per-session by an edge function
 * (TURN REST API / time-limited credentials) rather than baked into the
 * client bundle. The env-var path is a stopgap for the coturn pilot.
 */
const env = (import.meta as unknown as { env: Record<string, string | undefined> }).env;
const baseStun: RTCIceServer[] = [
  { urls: "stun:stun.l.google.com:19302" },
  { urls: "stun:stun1.l.google.com:19302" },
];
const turn = env.VITE_TURN_URL
  ? [{ urls: env.VITE_TURN_URL, username: env.VITE_TURN_USERNAME, credential: env.VITE_TURN_PASSWORD }]
  : [];
export const ICE_SERVERS: RTCIceServer[] = [...baseStun, ...turn];