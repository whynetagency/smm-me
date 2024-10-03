import {Component, OnInit} from '@angular/core';
import {ICategory} from '../shared/models';
import {HttpClient} from '@angular/common/http';
import {AngularFirestore} from '@angular/fire/firestore';
import {first} from 'rxjs/operators';
import {environment} from '../../environments/environment';

@Component({
  selector: 'app-catalog',
  templateUrl: './catalog.page.html',
  styleUrls: ['./catalog.page.scss'],
})
export class CatalogPage implements OnInit {
  domain = environment.domain;
  data: any;
  items: ICategory[] = [];

  constructor(
    private db: AngularFirestore,
    private httpClient: HttpClient
  ) {}

  public ngOnInit(): void {
    this.db
      .collection('categories')
      .valueChanges()
      .pipe(first())
      .subscribe((resp: any) => {
        this.data = {categories: resp};
        this.onGetItems();
      });

    /*this.httpClient.get('../../assets/catalog/data.json').subscribe((data: any) => {
      this.data = data;
      this.onGetItems();
    });*/
  }

  public getItems(ev: any): void {
    this.onGetItems();
    const val = ev.target.value;
    if (val && val.trim() !== '') {
      this.items = this.items.filter(item => (item.tags.find(t => t.indexOf(val.toLowerCase()) > -1)));
    }
  }

  private onGetItems(): void {
    this.items.length = 0;
    this.data.categories.forEach((item: ICategory) => this.items.push(item));
  }

  downloadJson(myJson: any){
    const sJson = JSON.stringify(myJson);
    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/json;charset=UTF-8,' + encodeURIComponent(sJson));
    element.setAttribute('download', 'primer-server-task.json');
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click(); // simulate click
    document.body.removeChild(element);
  }

}
