import {Component, OnInit} from '@angular/core';
import {ModalController} from '@ionic/angular';
import {AngularFirestore} from '@angular/fire/firestore';
import {first} from 'rxjs/operators';
import {HttpClient} from '@angular/common/http';

@Component({
  selector: 'app-terms',
  templateUrl: './projects.page.html',
  styleUrls: ['./projects.page.scss'],
})
export class ProjectsPage implements OnInit {
  data: any;
  projects: any[] = [];

  constructor(
    private httpClient: HttpClient,
    private modalCtrl: ModalController,
    private db: AngularFirestore
  ) { }

  ngOnInit() {
    this.httpClient.get('../../../assets/catalog/data.json').subscribe((data: any) => {
      this.data = data;
      this.db
        .collection('users')
        .doc(JSON.parse(localStorage.getItem('user')).id)
        .get()
        .pipe(first())
        .subscribe((resp: any) => {
          this.projects = resp.data().projects;
        });
    });
  }

  onGetCategory(item: any) {
    const cat = this.data.categories.find(c => c.subCategories.find(s => s.items.find(i => i.id === item.id)));
    const subCat = cat.subCategories.find(s => s.items.find(i => i.id === item.id));
    return cat.title + ' | ' + subCat.title;
  }

  onGetLink(item: any) {
    const cat = this.data.categories.find(c => c.subCategories.find(s => s.items.find(i => i.id === item.id)));
    const subCat = cat.subCategories.find(s => s.items.find(i => i.id === item.id));
    return '../catalog/' + cat.id + '/' + subCat.id + '/' + item.id;
  }

  close() {
    this.modalCtrl.dismiss().then();
  }

  onRemove(proj) {
    const a = JSON.parse(JSON.stringify(this.projects.filter(p => p.id !== proj.id)));
    this.projects.length = 0;
    this.projects = [...a];

    const userRef = this.db.collection('users').doc(JSON.parse(localStorage.getItem('user')).id);
    userRef.get().pipe(first()).subscribe((u: any) => {
      const user = u.data();
      user.projects.length = 0;
      user.projects = [...this.projects];
      userRef.set(user).then(() => console.log('updated'));
    });
  }
}

