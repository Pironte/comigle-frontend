import { Component } from '@angular/core';
import { HeaderlogoComponent } from '../header/headerlogo/headerlogo.component';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthenticationServiceService } from '../../service/authentication/authentication-service.service';
import { CreateUserRequest } from '../../models/register.models';
import { MessageService } from '../../service/message/message.service';
import { MessageType } from '../enums/level.enum';
import { Message } from '../../models/message.models';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [HeaderlogoComponent, ReactiveFormsModule, CommonModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent {
  registerForm!: FormGroup;
  message: Message | null = null;

  constructor(private authService: AuthenticationServiceService, private router: Router, private messageService: MessageService) {
    this.registerForm = new FormGroup({
      username: new FormControl('', [Validators.required]),
      email: new FormControl('', [Validators.required, Validators.email]),
      password: new FormControl('', [Validators.required]),
      confirmPassword: new FormControl('', [Validators.required])
    });

    this.messageService.currentMessage.subscribe(msg => {
      this.message = msg;
    });
  }

  get userName() {
    return this.registerForm.get('username')!;
  }

  get email() {
    return this.registerForm.get('email')!;
  }

  get password() {
    return this.registerForm.get('password')!;
  }

  get confirmPassword() {
    return this.registerForm.get('confirmPassword');
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

  register() {
    if (!this.registerForm.valid) {
      return;
    }

    const request = new CreateUserRequest(this.registerForm.value.username, this.registerForm.value.email, this.registerForm.value.password, this.registerForm.value.confirmPassword);
    this.authService.register(request).subscribe(
      {
        next: (response) => {
          // Exemplo: tratar a resposta aqui
          if (response.success) {
            this.messageService.setMessage("Usuário cadastrado com sucesso", MessageType.Success);
            this.router.navigate(['/login']);
          } else {
            this.messageService.setMessage(response.message, MessageType.Error);
          }
        },
        error: (err) => {
          // Tratar erros aqui
          this.messageService.setMessage("Falha geral ao cadastrar usuário", MessageType.Error);
        }
      })
  }
}
