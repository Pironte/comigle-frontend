import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthenticationServiceService {

  private urlEndpoint = 'https://localhost:7260';

  constructor(private http: HttpClient) { }

  register(username: string, email: string, password: string, confirmPassword: string): Observable<string> {
    const registerEndpoint = `${this.urlEndpoint}/User/Register`;
    const body = { username, email, password, confirmPassword };
    return this.http.post<string>(registerEndpoint, body, { responseType: 'text' as 'json' });
  }
}
