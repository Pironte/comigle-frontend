import { Injectable } from '@angular/core';
import { HubConnection, HubConnectionBuilder } from '@microsoft/signalr';

@Injectable({
  providedIn: 'root'
})
export class SignalrService {
  public hubConnection!: HubConnection;

  constructor() { }

  public startConnection = async (url: string): Promise<void> => {
    this.hubConnection = new HubConnectionBuilder()
      .withUrl(url)
      .withAutomaticReconnect()
      .build();

    this.hubConnection
      .start()
      .then(() => console.log('Iniciou a conexão com o hub'))
      .catch(err => console.log('Erro ao iniciar a conexão' + err))
  }

  public addTransferListener = (methodName: string, action: (...args: any[]) => void) => {
    console.log(`estou ouvindo o método: ${methodName}`);
    this.hubConnection.on(methodName, (action));
  }

  public invokeSignalrMethod(methodName: string, message: string) {
    this.hubConnection.invoke(methodName, message);
  }
}
