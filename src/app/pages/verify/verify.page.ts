import { Component, OnInit } from '@angular/core';
import { AuthService } from "../../core/services/auth.service";

@Component({
  selector: 'app-verify',
  templateUrl: './verify.page.html',
  styleUrls: ['./verify.page.scss'],
})
export class VerifyPage implements OnInit {

  constructor(
    public authService: AuthService
  ) { }

  ngOnInit() { }

}
