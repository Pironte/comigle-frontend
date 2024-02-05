import { Component } from '@angular/core';
import { HeaderlogoComponent } from '../header/headerlogo/headerlogo.component';
import { CommonModule } from '@angular/common';
import { Message } from '../../models/message.models';
import { MessageService } from '../../service/message/message.service';
import { MessageType } from '../enums/level.enum';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthenticationServiceService } from '../../service/authentication/authentication-service.service';
import { LoginRequest } from '../../models/login.models';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [HeaderlogoComponent, CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  loginForm!: FormGroup;
  message: Message | null = null;

  constructor(private authService: AuthenticationServiceService, private messageService: MessageService, private router: Router) {
    this.loginForm = new FormGroup({
      username: new FormControl('', [Validators.required]),
      password: new FormControl('', [Validators.required])
    });

    this.messageService.currentMessage.subscribe(msg => {
      this.message = msg;
      console.log(`estou recebendo a mensagem ${msg}`);
    });
  }

  login() {
    if (this.loginForm.valid) {
      const request = new LoginRequest(this.loginForm.value.username, this.loginForm.value.password);

      this.authService.login(request).subscribe(
        {
          next: (response) => {
            // Exemplo: tratar a resposta aqui
            if (!response.success) {
              this.messageService.setMessage("Usuário/Senha incorretos", MessageType.Error);
              this.loginForm.reset();
            } else {
              sessionStorage.setItem("token", response.token);
              this.router.navigate(['/home']);
            }
          },
          error: (err) => {
            // Tratar erros aqui
            this.messageService.setMessage("Falha geral ao cadastrar usuário", MessageType.Error);
          }
        })
    }
  }

  get messageClass() {
    if (!this.message) return '';

    switch (this.message.type) {
      case MessageType.Success:
        return 'alert-success';
      case MessageType.Error:
        return 'alert-danger';
      case MessageType.Warning:
        return 'alert-warning';
      case MessageType.Info:
        return 'alert-info';
      default:
        return '';
    }
  }
}
