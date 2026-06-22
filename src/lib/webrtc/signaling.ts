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

export const ICE_SERVERS: RTCIceServer[] = [
  { urls: "stun:stun.l.google.com:19302" },
  { urls: "stun:stun1.l.google.com:19302" },
];