import { getSocket } from "./socketService";
import { useAuthStore } from "@/store/userStore";

interface SignalData {
  from: string;
  type: "offer" | "answer" | "ice";
  payload: RTCSessionDescriptionInit | { candidate: RTCIceCandidateInit };
}

class WebRTCService {
  private pc: RTCPeerConnection | null = null;
  private localStream: MediaStream | null = null;

  async startCall(
    localVideoEl: HTMLVideoElement,
    remoteVideoEl: HTMLVideoElement,
    roomId: string
  ) {
    const socket = getSocket();
    const user = useAuthStore.getState().user;

    if (!user || !socket) {
      throw new Error("User not authenticated or socket not connected");
    }

    this.pc = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    });

    this.localStream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });

    localVideoEl.srcObject = this.localStream;
    this.localStream.getTracks().forEach((track) => {
      this.pc?.addTrack(track, this.localStream!);
    });

    this.pc.ontrack = (evt) => {
      remoteVideoEl.srcObject = evt.streams[0];
    };

    this.pc.onicecandidate = (e) => {
      if (e.candidate) {
        socket.emit("call:signal", {
          type: "ice",
          roomId,
          payload: { candidate: e.candidate },
          from: user.id,
        });
      }
    };

    socket.emit("call:join", { roomId, userId: user.id });

    socket.on("call:signal", async ({ from, type, payload }: SignalData) => {
      if (type === "offer") {
        await this.pc?.setRemoteDescription(
          payload as RTCSessionDescriptionInit
        );
        const answer = await this.pc?.createAnswer();
        await this.pc?.setLocalDescription(answer!);
        socket.emit("call:signal", {
          to: from,
          type: "answer",
          payload: this.pc?.localDescription,
          from: user.id,
        });
      } else if (type === "answer") {
        await this.pc?.setRemoteDescription(
          payload as RTCSessionDescriptionInit
        );
      } else if (type === "ice") {
        try {
          await this.pc?.addIceCandidate(
            (payload as { candidate: RTCIceCandidateInit }).candidate
          );
        } catch (err) {
          console.error("ICE candidate error:", err);
        }
      }
    });

    const offer = await this.pc.createOffer();
    await this.pc.setLocalDescription(offer);
    socket.emit("call:signal", {
      roomId,
      type: "offer",
      payload: this.pc.localDescription,
      from: user.id,
    });
  }

  toggleAudio(muted: boolean) {
    this.localStream?.getAudioTracks().forEach((track) => {
      track.enabled = !muted;
    });
  }

  toggleVideo(enabled: boolean) {
    this.localStream?.getVideoTracks().forEach((track) => {
      track.enabled = enabled;
    });
  }

  endCall() {
    this.localStream?.getTracks().forEach((track) => track.stop());
    this.pc?.close();
    getSocket()?.off("call:signal");
    this.pc = null;
    this.localStream = null;
  }
}

export const webrtcService = new WebRTCService();
