import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { ICategoryItem } from '../../shared/models';
import { HttpClient} from '@angular/common/http';

@Component({
  selector: 'app-catalog-search',
  templateUrl: './catalog-search.page.html',
  styleUrls: ['./catalog-search.page.scss'],
})
export class CatalogSearchPage implements OnInit {
  @Input() type: string;
  data: any;
  title = 'Выберите ';
  routeSrc = 'url(../../../assets/catalog/';
  entities: any[] = [];
  items: any[] = [];

  constructor(
    private httpClient: HttpClient,
    private modalCtrl: ModalController
  ) { }

  ngOnInit() {
    this.httpClient.get('../../assets/catalog/data.json').subscribe((data: any) => {
      this.data = data;
      if(this.type) {
        if(this.type === 'element') {
          this.title += 'элемент';
          this.routeSrc += 'elements/';
          this.entities = this.data.elements;
          this.onGetItems();
        }
        if(this.type === 'object') {
          this.title += 'обьект';
          this.routeSrc += 'objects/';
          this.entities = this.data.objects;
          this.onGetItems();
        }
        if(this.type === 'background') {
          this.routeSrc += 'backgrounds/';
          this.title += 'фон';
          this.entities = this.data.backgrounds;
          this.onGetItems();
        }
      }
    });
  }
  onGetItems(): void {
    this.items.length = 0;
    this.entities.forEach((item: ICategoryItem) => this.items.push(item));
  }

  getItems(ev: any): void {
    this.onGetItems();
    const val = ev.target.value;
    if (val && val.trim() !== '') {
      this.items = this.items.filter(item => (item.tags.find(t => t.indexOf(val.toLowerCase()) > -1)));
    }
  }

  onSelect(id) {
    this.modalCtrl.dismiss({ type: this.type, id }).then();
  }

  close() {
    this.modalCtrl.dismiss().then();
  }
}
