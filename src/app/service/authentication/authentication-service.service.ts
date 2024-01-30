import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CreateUserRequest } from '../../models/register.models';
import { CreateUserResponse } from '../../components/interfaces/register.interface';

@Injectable({
  providedIn: 'root'
})
export class AuthenticationServiceService {

  private urlEndpoint = 'https://localhost:7260';

  constructor(private http: HttpClient) { }

  register(request: CreateUserRequest): Observable<CreateUserResponse> {
    const registerEndpoint = `${this.urlEndpoint}/User/Register`;
    return this.http.post<CreateUserResponse>(registerEndpoint, request);
  }
}
