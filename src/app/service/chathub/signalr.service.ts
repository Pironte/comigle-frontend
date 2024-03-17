import { Injectable } from '@angular/core';
import { HubConnection, HubConnectionBuilder } from '@microsoft/signalr';

@Injectable({
  providedIn: 'root'
})
export class SignalrService {
  public hubConnection!: HubConnection;
  public clientId!: string | null;

  constructor() { }

  public startConnection = async (url: string): Promise<void> => {
    this.hubConnection = new HubConnectionBuilder()
      .withUrl(url)
      .withAutomaticReconnect()
      .build();

    await this.hubConnection.start();

    this.clientId = this.hubConnection.connectionId;
    console.log(`este é o clientID da conexão: ${this.clientId}`)
    console.log('Iniciou a conexão com o hub')
  }

  public invokeSignalrMethod(methodName: string, connectionId: string | null, message: string) {
    this.hubConnection.invoke(methodName, connectionId, message);
  }

  public invokeSignalrMethodGet(methodName: string, connectionId: string | null): Promise<string> {
    return this.hubConnection.invoke<string>(methodName, connectionId);
  }

  public savePeersDictionary(connectionId: string | null, state: string) {
    this.hubConnection.invoke<string>("SavePeersDictionary", connectionId, state);
  }

  public savePeersConnect(localConnectionId: string | null, remoteConnectionId: string) {
    this.hubConnection.invoke<string>("SavePeersConnect", localConnectionId, remoteConnectionId);
  }

  public invokeSignalrMethodDelete(methodName: string, connectionId: string | null) {
    this.hubConnection.invoke(methodName, connectionId);
  }
}
