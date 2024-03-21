import { Injectable } from '@angular/core';
import { HubConnection, HubConnectionBuilder } from '@microsoft/signalr';

@Injectable({
  providedIn: 'root'
})
export class SignalrService {
  public hubConnection!: HubConnection;
  public clientId!: string | null;

  constructor() { }

  /**
   * Inicia conexão com o hub
   * @param url Url para conexão com o hub
   */
  public startConnection = async (url: string): Promise<void> => {
    this.hubConnection = new HubConnectionBuilder()
      .withUrl(url)
      .withAutomaticReconnect()
      .build();

    await this.hubConnection.start();

    this.clientId = this.hubConnection.connectionId;
    console.log('Iniciou a conexão com o hub')
  }

  /**
   * Este método realiza toda a negociação de conexão com o serviço de sinalização, enviando offer, icecandidate e answer.
   * @param methodName Nome do método que será chamado, geralmente é 'Send'
   * @param connectionId Id de conexão com o hub
   * @param remoteConnectionId Id de conexão do hub alvo
   * @param message Mensagem que conterá icecandidate, offer ou answer
   */
  public async invokeSignalrMethod(methodName: string, connectionId: string | null, remoteConnectionId: string | null, message: string) {
    await this.hubConnection.invoke(methodName, connectionId, remoteConnectionId, message);
  }

  /**
   * Adiciona o usuário como conectado e disponível
   * @param connectionId Id de conexão com o hub
   */
  public async AddUserAvaiable(connectionId: string | null) {
    await this.hubConnection.invoke("AddUser", connectionId);
  }

  /**
   * Busca um usuário que esteja disponível para uma transmissão de vídeo
   * @param connectionId Id de conexão do hub
   * @returns Um id de hub disponível para conexão
   */
  public async GetUserAvaiable(connectionId: string | null): Promise<string> {
    return this.hubConnection.invoke<string>("TryFindAvailableUser", connectionId);
  }

  /**
   * Marca o usuário como disponível para novas buscas
   * @param connectionId Id de conexão com o hub
   */
  public async MarkUserAsAvaiable(connectionId: string | null) {
    await this.hubConnection.invoke("MarkUserAsAvailable", connectionId);
  }

  /**
   * Marca o usuário como ocupado para novas buscas
   * @param connectionId Id de conexão com o hub
   */
  public async MarkUserAsBusy(connectionId: string | null) {
    await this.hubConnection.invoke("MarkUserAsBusy", connectionId);
  }

  /**
   * Remove o usuário da lista de usuários conectados
   * @param connectionId Id de conexão com o hub
   */
  public async RemoveUser(connectionId: string) {
    await this.hubConnection.invoke("RemoveUser", connectionId);
  }

  /**
   * Envia a mensagem de chat para o usuário alvo
   * @param username Usuário que está enviando a mensagem
   * @param connectionId Id de conexão com o hub do usuário alvo
   * @param message Mensagem que será enviada para o usuário alvo
   */
  public async SendMessage(username: string | null,  connectionId: string | null, message: string) {
    await this.hubConnection.invoke("SendMessage", username, connectionId, message);
  }
}
