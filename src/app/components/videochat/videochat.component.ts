import { CommonModule, NgOptimizedImage } from '@angular/common';
import { Component, OnInit } from '@angular/core';
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
export class VideochatComponent implements OnInit {
  messages: string[] = [];
  newMessage: string = '';
  userName: string | null = '';
  isOpen: boolean = false;
  rtcConnection!: RTCPeerConnection | undefined;
  localStream!: MediaStream;

  constructor(public authService: AuthenticationServiceService, private signalrService: SignalrService, private router: Router) {
    this.userName = this.authService.getUserName();
  }

  async createPeerConnection() {
    this.rtcConnection = new RTCPeerConnection();

    this.rtcConnection.onicecandidate = (event) => {
      if (event.candidate) {
        this.signalrService.invokeSignalrMethod("Send", JSON.stringify({ "sdp": event.candidate }));
      }
    }

    this.rtcConnection.ontrack = (event) => {
      console.log("Track de mídia recebido.");

      // Cria um novo MediaStream ou usa um existente
      let remoteStream = event.streams[0];

      // Adiciona o track recebido ao MediaStream
      remoteStream.addTrack(event.track);

      // Agora você pode usar esse MediaStream para exibir o vídeo
      var remoteVideo = document.getElementById('remote') as HTMLVideoElement;
      remoteVideo.srcObject = remoteStream;

      console.log("Fluxo de mídia adicionado ao elemento de vídeo.");
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

  async signalindOnReceive() {
    this.signalrService.hubConnection.on("Receive", async (data) => {
      var message = JSON.parse(data);
      console.log(message);

      if (this.rtcConnection?.connectionState == 'connected')
        return;

      if (message?.offer) {
        try {
          await this.rtcConnection?.setRemoteDescription(message.offer as RTCSessionDescriptionInit);
        } catch (error) {
          console.log(error);
        }

        var answer = await this.rtcConnection?.createAnswer();
        await this.rtcConnection?.setLocalDescription(answer as RTCSessionDescriptionInit);

        this.signalrService.invokeSignalrMethod("Send", JSON.stringify({ "sdp": this.rtcConnection?.localDescription }));
      }
      else if (message?.sdp?.type == 'answer') {
        try {
          this.rtcConnection?.setRemoteDescription(message.sdp as RTCSessionDescriptionInit)
        } catch (error) {
          console.log(error);
        }
      }
      else if (message?.sdp?.candidate) {
        try {
          this.rtcConnection?.addIceCandidate(message.sdp as RTCIceCandidateInit);
        } catch (error) {
          console.log(error);
        }
      }
      else if (message?.action) {
        console.log(message);
        if (message.action == "close") {

          for (const track of this.localStream.getTracks()) {
            track.stop();
          }

          this.rtcConnection?.close();

          await this.signalindOnReceive();
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
      }
    });
  }

  async ngOnInit(): Promise<void> {
    await this.signalindOnReceive();
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

  async muteAudio() {
    this.localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
    for (const algo of this.localStream.getTracks()) {
      this.rtcConnection?.addTrack(algo, this.localStream);
    }
  }

  async unMuteAudio() {
    this.localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    for (const algo of this.localStream.getTracks()) {
      this.rtcConnection?.addTrack(algo, this.localStream);
    }
  }

  disconnect() {
    console.log('estou sendo chamado');
    try {
      // Parar todas as faixas e liberar a câmera e o microfone
      for (const track of this.localStream.getTracks()) {
        track.stop();
      }

      this.rtcConnection?.close();
      this.signalrService.invokeSignalrMethod("Send", JSON.stringify({ "action": "close" }));
      this.router.navigate(['/home']);
    } catch (error) {
      console.log(error);
    }
  }

  async nextPeer() {
    console.log('estou sendo chamado');
    try {
      // Parar todas as faixas e liberar a câmera e o microfone
      for (const track of this.localStream.getTracks()) {
        track.stop();
      }

      this.rtcConnection?.close();
      this.signalrService.invokeSignalrMethod("Send", JSON.stringify({ "action": "close" }));

      await this.signalindOnReceive();
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