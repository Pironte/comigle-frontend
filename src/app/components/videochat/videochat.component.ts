import { CommonModule, NgOptimizedImage } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthenticationServiceService } from '../../service/authentication/authentication-service.service';
import { Router, RouterModule } from '@angular/router';
import { SignalrService } from '../../service/chathub/signalr.service';

@Component({
  selector: 'app-videochat',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterModule, NgOptimizedImage],
  templateUrl: './videochat.component.html',
  styleUrl: './videochat.component.scss'
})
export class VideochatComponent implements OnInit, OnDestroy {
  messages: string[] = [];
  newMessage: string = '';
  userName: string | null = '';
  isOpen: boolean = false;
  rtcConnection!: RTCPeerConnection | undefined;
  localStream!: MediaStream;

  constructor(public authService: AuthenticationServiceService, private signalrService: SignalrService, private router: Router) {
    this.userName = this.authService.getUserName();
  }

  ngOnDestroy(): void {
    this.rtcConnection?.close();
  }

  async createPeerConnection() {
    const configuration = {
      iceServers: [
        {
          urls: "stun:stun.l.google.com:19302"
        }
      ]
    };

    this.rtcConnection = new RTCPeerConnection(configuration);

    this.rtcConnection.onicecandidate = (event) => {
      if (event.candidate) {
        this.signalrService.invokeSignalrMethod("Send", JSON.stringify({ "sdp": event.candidate }));
      }
    }

    this.rtcConnection.ontrack = (event) => {
      // Cria um novo MediaStream ou usa um existente

      let remoteStream!: MediaStream;

      if (event.streams[0]) {
        remoteStream = event.streams[0];
      }

      console.log('estou passando aqui');

      // Adiciona o track recebido ao MediaStream
      remoteStream.addTrack(event.track);

      // Agora você pode usar esse MediaStream para exibir o vídeo
      var remoteVideo = document.getElementById('remote') as HTMLVideoElement;
      remoteVideo.srcObject = remoteStream;
    }

    this.rtcConnection.onnegotiationneeded = async () => {
      try {
        // Criar uma oferta e definí-la como a descrição local
        const offer = await this.rtcConnection?.createOffer();
        await this.rtcConnection?.setLocalDescription(offer);

        // Enviar a oferta para o outro peer através do canal de sinalização
        this.signalrService.invokeSignalrMethod("Send", JSON.stringify({ "offer": this.rtcConnection?.localDescription }));
      } catch (error) {
        console.error('Erro ao criar oferta: ', error);
      }
    };
  }

  async signalingOnReceive() {
    this.signalrService.hubConnection.on("Receive", async (data) => {
      var message = JSON.parse(data);

      if (this.rtcConnection?.connectionState == 'connected' || this.rtcConnection?.connectionState == 'closed' || this.rtcConnection?.connectionState == 'disconnected')
        return;

      if (message?.offer) {
        await this.rtcConnection?.setRemoteDescription(message.offer as RTCSessionDescriptionInit);

        var answer = await this.rtcConnection?.createAnswer();
        await this.rtcConnection?.setLocalDescription(answer as RTCSessionDescriptionInit);

        this.signalrService.invokeSignalrMethod("Send", JSON.stringify({ "sdp": this.rtcConnection?.localDescription }));
      }
      else if (message?.sdp?.type == 'answer') {
        this.rtcConnection?.setRemoteDescription(message.sdp as RTCSessionDescriptionInit)
      }
      else if (message?.sdp?.candidate) {
        this.rtcConnection?.addIceCandidate(message.sdp as RTCIceCandidateInit);
      }
      else if (message?.action) {
        if (message.action == "mute") {
          var remoteVideo = document.getElementById('remote') as HTMLVideoElement;
          if (remoteVideo) {
            remoteVideo.muted = true;
          }
        }
        else if (message.action == "unMute") {
          var remoteVideo = document.getElementById('remote') as HTMLVideoElement;
          if (remoteVideo)
            remoteVideo.muted = true;
        }
      }
    });
  }

  async ngOnInit(): Promise<void> {
    await this.signalingOnReceive();
    this.createPeerConnection().then(async () => {
      this.localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });

      for (const track of this.localStream.getTracks()) {
        this.rtcConnection?.addTrack(track, this.localStream);
      }

      this.localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      var user1 = document.getElementById('user1');
      (user1 as HTMLVideoElement).srcObject = this.localStream;
    });
  }

  muteAudio() {
    this.signalrService.invokeSignalrMethod("Send", JSON.stringify({ "action": "mute" }));
  }

  unMuteAudio() {
    this.signalrService.invokeSignalrMethod("Send", JSON.stringify({ "action": "unMute" }));
  }

  disconnect() {
    // Parar todas as faixas e liberar a câmera e o microfone
    for (const track of this.localStream.getTracks()) {
      track.stop();
    }

    this.rtcConnection?.close();
    // this.signalrService.invokeSignalrMethod("Send", JSON.stringify({ "action": "close" }));
    this.router.navigate(['/home']);
  }

  async nextPeer() {
    try {
      // Parar todas as faixas e liberar a câmera e o microfone
      // for (const track of this.localStream.getTracks()) {
      //   track.stop();
      // }

      this.rtcConnection?.close();
      this.rtcConnection = undefined;
      // this.signalrService.invokeSignalrMethod("Send", JSON.stringify({ "action": "close" }));

      this.createPeerConnection().then(async () => {
        this.localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });

        for (const track of this.localStream.getTracks()) {
          this.rtcConnection?.addTrack(track, this.localStream);
        }

        this.localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        var user1 = document.getElementById('user1');
        (user1 as HTMLVideoElement).srcObject = this.localStream;
      });
    } catch (error) {
      console.log(error);
    }
  }

  /**
   * Método que se encarrega de enviar um array de mensagens enviadas para o HTML
   */
  sendMessage(): void {
    if (this.newMessage.trim() !== '') {
      this.messages.push(`${this.userName}: ${this.newMessage}`);
      this.newMessage = '';
    }
  }

  toggleDropdown(): void {
    this.isOpen = !this.isOpen;
  }

  hideOptions() {
    this.isOpen = false;
  }
}