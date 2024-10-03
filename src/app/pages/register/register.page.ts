import {FormGroup, FormBuilder, Validators} from '@angular/forms';
import {Component, OnInit} from '@angular/core';
import {AlertController, ToastController} from '@ionic/angular';
import {Router} from '@angular/router';
import {AuthService} from 'src/app/core/services/auth.service';
import {take} from "rxjs/operators";

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
})
export class RegisterPage implements OnInit {
  registerForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    public auth: AuthService,
    private alertCtrl: AlertController,
    private toastCtrl: ToastController,
    private router: Router,
  ) {
  }

  ngOnInit() {
    this.registerForm = this.fb.group({
      name: ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(6)]],
      email: ['', [Validators.required, Validators.email]]
    });
  }

  register() {
    this.auth.isEmailAvailable(this.registerForm.value.email)
      .pipe(take(1))
      .subscribe(res => {
        if (res.length > 0) {
          const alert = this.alertCtrl.create({
            header: 'Error',
            message: 'Email already taken',
            buttons: ['OK']
          });
          alert.then(a => a.present());
        } else {
          this.auth.signUp(this.registerForm.value).then(async () => {
            this.auth.SendVerificationMail().then(() => {
              this.router.navigateByUrl('/catalog').then();
            });
          }, async (err) => {
            const alert = await this.alertCtrl.create({
              header: 'Error',
              message: err.message,
              buttons: ['OK']
            });
            await alert.present();
          });
        }
      });
  }
}
