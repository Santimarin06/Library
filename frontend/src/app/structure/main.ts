import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Nav } from './nav/nav';

@Component({
  selector: 'app-main',
  imports: [Nav, RouterModule],
  templateUrl: './main.html',
  styleUrl: './main.css',
})
export class Main {

}
