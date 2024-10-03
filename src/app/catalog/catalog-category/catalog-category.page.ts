import {Component, OnInit} from '@angular/core';
import {Subscription} from 'rxjs';
import {ActivatedRoute} from '@angular/router';
import {ICategory, ISubCategory} from '../../shared/models';
import {HttpClient} from '@angular/common/http';
import {first} from 'rxjs/operators';
import {AngularFirestore} from '@angular/fire/firestore';
import {environment} from "../../../environments/environment";

@Component({
  selector: 'app-catalog-category',
  templateUrl: 'catalog-category.page.html',
  styleUrls: ['catalog-category.page.scss']
})
export class CatalogCategoryPage implements OnInit {
  domain = environment.domain;
  routerSubscription: Subscription;
  items: ISubCategory[] = [];
  activeCategory: ICategory;

  constructor(
    private db: AngularFirestore,
    private httpClient: HttpClient,
    private route: ActivatedRoute,
  ) {}

  public ngOnInit() {
    this.routerSubscription = this.route.params.subscribe(params => {
      this.db
        .collection('categories')
        .doc(params.category)
        .get()
        .pipe(first())
        .subscribe((resp: any) => {
          this.activeCategory = resp.data();
          this.onGetItems();
        });

      /*this.httpClient.get('../../../assets/catalog/data.json').subscribe((data: any) => {
        this.data = data;
        this.activeCategory = this.data.categories.find((category: ICategory) => category.id === params.category);
        this.onGetItems();
      });*/
    });
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
    this.activeCategory.subCategories.forEach((item: ISubCategory) => this.items.push(item));
  }
}
