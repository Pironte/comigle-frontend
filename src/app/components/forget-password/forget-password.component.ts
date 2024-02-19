import { Component } from '@angular/core';
import { HeaderlogoComponent } from '../header/headerlogo/headerlogo.component';
import { AuthenticationServiceService } from '../../service/authentication/authentication-service.service';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MessageService } from '../../service/message/message.service';
import { MessageType } from '../enums/level.enum';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-forget-password',
  standalone: true,
  imports: [HeaderlogoComponent, ReactiveFormsModule, CommonModule],
  templateUrl: './forget-password.component.html',
  styleUrl: './forget-password.component.scss'
})
export class ForgetPasswordComponent {
  forgetPasswordForm!: FormGroup;

  constructor(private authService: AuthenticationServiceService, private router: Router, public messageService: MessageService) {
    this.forgetPasswordForm = new FormGroup({
      username: new FormControl('', [Validators.required])
    });
  }

  get username() {
    return this.forgetPasswordForm.get('username')!;
  }

  onForgetPassword() {
    if (!this.forgetPasswordForm.valid) {
      return;
    }

    var userName = this.forgetPasswordForm.value.username;
    this.authService.forgetPassword(userName).subscribe(
      {
        next: (response) => {
          if (response.success) {
            this.messageService.setMessage("Foi enviado um e-mail para recuperação de senha!", MessageType.Success, 8000);
          }
          else {
            this.messageService.setMessage(response.message, MessageType.Error, 8000);
          }
        },
        error: (err) => {
          this.messageService.setMessage("Falha geral ao realizar processo de recuperação de senha", MessageType.Error, 8000);
        }
      }
    );
  }
}
