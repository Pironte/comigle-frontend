import { Injectable } from '@angular/core';
import { HubConnection, HubConnectionBuilder } from '@microsoft/signalr';

@Injectable({
  providedIn: 'root'
})
export class SignalrService {
  private hubConnection!: HubConnection;

  constructor() { }

  public startConnection = (url: string): void => {
    this.hubConnection = new HubConnectionBuilder()
    .withUrl(url)
    .withAutomaticReconnect()
    .build();

    this.hubConnection
    .start()
    .then(() => console.log('Iniciou a conexão com o hub'))
    .catch(err => console.log('Erro ao iniciar a conexão' + err))
  }

  public addTransferChartDataListener = (methodName: string, action: (...args: any[]) => void) => {
    this.hubConnection.on(methodName, action);
  }
}
