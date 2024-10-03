import {Component, OnInit} from '@angular/core';
import {Subscription} from 'rxjs';
import {ActivatedRoute} from '@angular/router';
import {ICategoryItem, ISubCategory} from '../../shared/models';
import {HttpClient} from '@angular/common/http';
import {first} from 'rxjs/operators';
import {AngularFirestore} from '@angular/fire/firestore';
import {AlertController} from '@ionic/angular';
import {environment} from '../../../environments/environment';

@Component({
  selector: 'app-catalog-items-list',
  templateUrl: 'catalog-items-list.page.html',
  styleUrls: ['catalog-items-list.page.scss']
})
export class CatalogItemsListPage implements OnInit {
  domain = environment.domain;
  routerSubscription: Subscription;
  data: any;
  items: ICategoryItem[] = [];
  categoryId: string;
  activeSubCategory: ISubCategory;
  userId = JSON.parse(localStorage.getItem('user')).id;
  rating: any[];
  isRatingReady = false;

  constructor(
    private db: AngularFirestore,
    private httpClient: HttpClient,
    private route: ActivatedRoute,
    private alertController: AlertController
  ) {}

  public ngOnInit() {
    this.routerSubscription = this.route.params.subscribe(params => {
      this.categoryId = params.category;
      this.db
        .collection('categories')
        .doc(params.category)
        .get()
        .pipe(first())
        .subscribe((resp: any) => {
          this.activeSubCategory = resp.data().subCategories.find((subCategory: ISubCategory) => subCategory.id === params.subCategory);
          this.onGetItems();
          this.onGetItemsRating();
        });
      /*this.httpClient.get('../../../assets/catalog/data.json').subscribe((data: any) => {
        this.data = data;
        this.activeSubCategory = this.data.categories
          .find((category: ICategory) => category.id === params.category).subCategories
          .find((subCategory: ISubCategory) => subCategory.id === params.subCategory);
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

  onGetRating(id) {
    const ratingArray = this.rating.find(i => i.id === id);
    let ratingValue = 0;
    if(ratingArray) {
      ratingArray.votes.forEach(i => ratingValue += i.value);
      return ratingValue/ratingArray.votes.length;
    } else {
      return 0;
    }
  }

  isRatingDisabled(item) {
    if(this.rating.find(i => i.id === item.id)) {
      return !!(this.rating.find(i => i.id === item.id).votes.find(i => i.user === this.userId));
    } else {
      return false;
    }
  }

  async onRatingChange(item, e) {
    const alert = await this.alertController.create({
      header: `Опубликовать Вашу оценку? (${e.rating})`,
      buttons: [
        {
          text: 'Нет',
          role: 'cancel',
          handler: () => {},
        },
        {
          text: 'Да',
          role: 'delete',
          handler: () => {
            if(this.rating.find(i => i.id === item.id)) {
              const rating = this.rating.find(i => i.id === item.id);
              rating.votes.push({user: this.userId, value: e.rating});
              this.db.collection('rating').doc(item.id).set({
                id: item.id,
                votes: rating.votes
              });
            } else {
              this.db.collection('rating').doc(item.id).set({
                id: item.id,
                votes: [{user: this.userId, value: e.rating}]
              });
            }
          }
        },
      ],
    });

    await alert.present();
  }

  onGetItemsRating() {
    this.db
      .collection('rating')
      .valueChanges()
      .pipe(first())
      .subscribe((resp: any) => {
        this.rating = resp;
        this.isRatingReady = true;
      });
  }

  private onGetItems(): void {
    this.items.length = 0;
    this.activeSubCategory.items.forEach((item: ICategoryItem) => this.items.push(item));
  }

}
