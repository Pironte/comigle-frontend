import { CommonModule, NgOptimizedImage } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthenticationServiceService } from '../../service/authentication/authentication-service.service';
import { Router, RouterModule } from '@angular/router';
import { SignalrService } from '../../service/chathub/signalr.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-videochat',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterModule, NgOptimizedImage],
  templateUrl: './videochat.component.html',
  styleUrl: './videochat.component.scss'
})
export class VideochatComponent implements OnInit, OnDestroy {
  messages: { username: string | null, content: string; isReceived: boolean }[] = [];
  newMessage: string = '';
  userName: string | null = '';
  isOpen: boolean = false;
  receiveChannel!: RTCDataChannel | undefined;
  connectionId!: string | null;
  localStream!: MediaStream;
  remoteConnectionId!: string | null;
  isDisableChat: boolean = true;
  isNextPeerDisable: boolean = false;

  mapPeerConnection = new Map<string | null, RTCPeerConnection>();

  constructor(public authService: AuthenticationServiceService, public signalrService: SignalrService, private router: Router) {
    this.userName = this.authService.getUserName();
  }

  async ngOnDestroy(): Promise<void> {
    let rtcConnection = this.mapPeerConnection.get(this.signalrService.clientId);
    rtcConnection?.close();
    this.mapPeerConnection.delete(this.connectionId);
    await this.signalrService.RemoveUser(this.connectionId ?? "");
  }

  /**
   * Cria conexão entre os peers
   */
  async createPeerConnection(isNextPeer: boolean) {
    const configuration = {
      iceServers: [
        {
          urls: "stun:stun.l.google.com:19302"
        }
      ]
    };

    this.mapPeerConnection.set(this.signalrService.hubConnection.connectionId, new RTCPeerConnection(configuration));
    let rtcConnection = this.mapPeerConnection.get(this.signalrService.hubConnection.connectionId);
    this.connectionId = this.signalrService.hubConnection.connectionId;

    if (!isNextPeer)
      await this.signalrService.AddUserAvaiable(this.connectionId);

    if (rtcConnection) {
      rtcConnection.onicecandidate = async (event) => {
        if (event.candidate) {
          await this.signalrService.invokeSignalrMethod("Send", this.connectionId, this.remoteConnectionId, JSON.stringify({ "sdp": event.candidate }));
        }
      }

      rtcConnection.ontrack = (event) => {
        // Cria um novo MediaStream ou usa um existente

        let remoteStream!: MediaStream;

        if (event.streams[0]) {
          remoteStream = event.streams[0];
        }

        // Adiciona o track recebido ao MediaStream
        remoteStream.addTrack(event.track);

        // Agora você pode usar esse MediaStream para exibir o vídeo
        var remoteVideo = document.getElementById('remote') as HTMLVideoElement;
        remoteVideo.srcObject = remoteStream;
      }

      rtcConnection.onnegotiationneeded = async () => {
        try {
          // if (!this.remoteConnectionId) {
          this.remoteConnectionId = await this.signalrService.GetUserAvaiable(this.connectionId);
          // }

          if (!this.remoteConnectionId)
            return;

          await this.signalrService.MarkUserAsBusy(this.connectionId);

          // Criar uma oferta e definí-la como a descrição local
          const offer = await rtcConnection?.createOffer();
          await rtcConnection?.setLocalDescription(offer);

          // Enviar a oferta para o outro peer através do canal de sinalização
          await this.signalrService.invokeSignalrMethod("Send", this.connectionId, this.remoteConnectionId, JSON.stringify({ "offer": rtcConnection?.localDescription }));
        } catch (error) {
          console.error('Erro ao criar oferta: ', error);
        }
      };

      rtcConnection.onconnectionstatechange = async (event) => {
        let rtcConnection = this.mapPeerConnection.get(this.connectionId);
        if (rtcConnection?.connectionState == 'connected') {
          this.isDisableChat = false;
        }
        if (rtcConnection?.connectionState == "failed" || rtcConnection?.connectionState == 'disconnected') {
          await this.signalrService.MarkUserAsAvaiable(this.connectionId);
          this.remoteConnectionId = null;
          this.messages = [];
          this.isDisableChat = true;
          rtcConnection.restartIce();
        }
      }
    }
  }

  async signalingOnReceive() {
    this.signalrService.hubConnection.on("Receive", async (connectionId, data) => {
      var message = JSON.parse(data);

      let rtcConnection = this.mapPeerConnection.get(this.connectionId);
      // if (rtcConnection?.connectionState == 'connected') {
      //   return;
      // }

      if (rtcConnection) {
        if (message?.offer) {
          await rtcConnection.setRemoteDescription(message.offer as RTCSessionDescriptionInit);

          var answer = await rtcConnection?.createAnswer();
          await rtcConnection.setLocalDescription(answer as RTCSessionDescriptionInit);

          await this.signalrService.MarkUserAsBusy(this.connectionId);
          this.remoteConnectionId = connectionId;

          await this.signalrService.invokeSignalrMethod("Send", this.connectionId, connectionId, JSON.stringify({ "sdp": rtcConnection.localDescription }));
        }
        else if (message?.sdp?.type == 'answer') {
          await rtcConnection.setRemoteDescription(message.sdp as RTCSessionDescriptionInit)
        }
        else if (message?.sdp?.candidate) {
          await rtcConnection.addIceCandidate(message.sdp as RTCIceCandidateInit);
        }
      }
    });
  }

  async receiveMessage() {
    this.signalrService.hubConnection.on("ReceiveMessage", async (username, message) => {
      this.addReceivedMessage(username, message);
    });
  }

  async ngOnInit(): Promise<void> {
    this.signalrService.startConnection(`${environment.apiUrl}/chatHub`).then(async () => {
      await this.signalingOnReceive();
      await this.receiveMessage();
      this.createPeerConnection(false).then(async () => {
        let rtcConnection = this.mapPeerConnection.get(this.connectionId);
        this.localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });

        for (const track of this.localStream.getTracks()) {
          rtcConnection?.addTrack(track, this.localStream);
        }

        this.localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        var user1 = document.getElementById('user1');
        (user1 as HTMLVideoElement).srcObject = this.localStream;
      });
    });
  }

  async muteAudio() {
    let rtcConnection = this.mapPeerConnection.get(this.connectionId);
    var localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });

    for (var track of localStream.getTracks()) {
      rtcConnection?.addTrack(track, localStream);
    }
  }

  async unMuteAudio() {
    let rtcConnection = this.mapPeerConnection.get(this.connectionId);
    var localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });

    for (var track of localStream.getTracks()) {
      rtcConnection?.addTrack(track, localStream);
    }
  }

  async disconnect() {
    let rtcConnection = this.mapPeerConnection.get(this.connectionId);

    await this.signalrService.RemoveUser(this.connectionId ?? "");

    rtcConnection?.close();
    this.mapPeerConnection.delete(this.connectionId);
    // this.signalrService.invokeSignalrMethod("Send", JSON.stringify({ "action": "close" }));
    this.router.navigate(['/home']);
  }

  async nextPeer() {
    let rtcConnection = this.mapPeerConnection.get(this.connectionId);
    this.remoteConnectionId = null;

    rtcConnection?.close();
    this.mapPeerConnection.delete(this.connectionId);
    await this.signalrService.MarkUserAsAvaiable(this.connectionId);

    this.isDisableChat = true;
    this.isNextPeerDisable = true;

    setTimeout(() => {
      this.isNextPeerDisable = false;
    }, 5000);

    this.messages = [];
    // this.signalrService.invokeSignalrMethod("Send", JSON.stringify({ "action": "close" }));

    this.createPeerConnection(true).then(async () => {
      let rtcConnection = this.mapPeerConnection.get(this.connectionId);
      this.localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });

      for (const track of this.localStream.getTracks()) {
        rtcConnection?.addTrack(track, this.localStream);
      }

      this.localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      var user1 = document.getElementById('user1');
      (user1 as HTMLVideoElement).srcObject = this.localStream;
    });
  }

  /**
   * Método que se encarrega de enviar um array de mensagens enviadas para o HTML
   */
  async sendMessage() {
    if (this.newMessage.trim() !== '') {
      var messageToSend = this.newMessage;
      await this.signalrService.SendMessage(this.userName, this.remoteConnectionId, messageToSend);

      this.addSentMessage(this.userName, this.newMessage);
      this.newMessage = '';
    }
  }

  toggleDropdown(): void {
    this.isOpen = !this.isOpen;
  }

  hideOptions() {
    this.isOpen = false;
  }

  addReceivedMessage(username: string | null, content: string) {
    this.messages.push({ username: username, content: content, isReceived: true });
  }

  addSentMessage(username: string | null, content: string) {
    this.messages.push({ username: username, content: content, isReceived: false });
  }
}