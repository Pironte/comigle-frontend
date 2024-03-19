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

  public async invokeSignalrMethod(methodName: string, connectionId: string | null, remoteConnectionId: string | null, message: string) {
    await this.hubConnection.invoke(methodName, connectionId, remoteConnectionId, message);
  }

  public async AddUserAvaiable(connectionId: string | null) {
    await this.hubConnection.invoke("AddUser", connectionId);
  }

  public async GetUserAvaiable(connectionId: string | null): Promise<string> {
    return this.hubConnection.invoke<string>("TryFindAvailableUser", connectionId);
  }

  public async MarkUserAsAvaiable(connectionId: string | null) {
    await this.hubConnection.invoke("MarkUserAsAvailable", connectionId);
  }

  public async MarkUserAsBusy(connectionId: string | null) {
    await this.hubConnection.invoke("MarkUserAsBusy", connectionId);
  }

  public async RemoveUser(connectionId: string) {
    await this.hubConnection.invoke("RemoveUser", connectionId);
  }
}
