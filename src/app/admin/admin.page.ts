import {Component, OnInit} from '@angular/core';
import {map} from 'rxjs/operators';
import {AngularFirestore} from '@angular/fire/firestore';
import {AlertController} from '@ionic/angular';
import {environment} from "../../environments/environment";

@Component({
  selector: 'app-admin',
  templateUrl: './admin.page.html',
  styleUrls: ['./admin.page.scss'],
})
export class AdminPage implements OnInit {
  domain = environment.domain;
  isModalOpen = false;
  isEditMode = true;
  editID = '';
  isProductAdd = false;
  isProductEdit = false;
  categoryWasUpdated = false;
  subCategoryWasUpdated = false;
  data: any;
  id = this.guidGenerator();
  elements: any;
  objects: any;
  backgrounds: any;
  covers: any;
  content = '';
  activeSegment = 'categories';
  activeInnerSegment = 'd';
  activeSubCategorySegment = 'd';
  activeProductSegment = 'd';
  categories: any;
  selectedItem: any;
  selectedCategory: any;
  selectedSubCategory: any;
  name: string;
  categoryName: string;
  subCategoryName: string;
  bName: string;
  eName: string;
  oName: string;
  cName: string;

  selected = { element: '',  object: '',  background: '', cover: '' };
  addModalType = '';

  constructor(
    private db: AngularFirestore,
    private alertController: AlertController
  ) {}

  get json(): string {
    // eslint-disable-next-line max-len
    return '{"id": "' + this.id + '", "object": "' + this.selected.object + '", "element": "' + this.selected.element + '", "background": "' + this.selected.background + '", "content":"' + this.content + '", "cover":"' + this.selected.cover + '","tags": []}';
  }

  get isPublishDisabled(): boolean {
    return !(this.selected.element && this.selected.object && this.selected.background && this.selected.cover);
  }

  ngOnInit() {
    this.db
      .collection('categories')
      .valueChanges()
      .pipe()
      .subscribe((resp: any) => {
        this.categories = resp;
        console.log(this.categories);
      });

    this.db.collection('data').snapshotChanges().pipe(
      map(actions => actions.map(a => {
          const data = a.payload.doc.data();
          const id = a.payload.doc.id;
          if(id === 'elements') {
            return { elements: data };
          }
          if(id === 'objects') {
            return { objects: data };
          }
          if(id === 'backgrounds') {
            return { backgrounds: data };
          }
          if(id === 'covers') {
            return { covers: data };
          }
        }))
    ).subscribe(resp => {
      this.data = resp;

      this.elements = [];
      this.objects = [];
      this.backgrounds = [];
      this.covers = [];

      Object.keys(this.data.find(i => i.elements).elements).forEach(k => {
        this.elements.push(this.data.find(i => i.elements).elements[k]);
      });

      Object.keys(this.data.find(i => i.objects).objects).forEach(k => {
        this.objects.push(this.data.find(i => i.objects).objects[k]);
      });

      Object.keys(this.data.find(i => i.backgrounds).backgrounds).forEach(k => {
        this.backgrounds.push(this.data.find(i => i.backgrounds).backgrounds[k]);
      });

      Object.keys(this.data.find(i => i.covers).covers).forEach(k => {
        this.covers.push(this.data.find(i => i.covers).covers[k]);
      });


      this.selected.element = '';
      this.selected.object = '';
      this.selected.background = '';
      this.selected.cover = '';
    });
  }

  onChange(e) {
    this.activeSegment = e.detail.value;
  }

  onChangeInner(e) {
    this.activeInnerSegment = e.detail.value;
  }

  onChangeSubCategory(e) {
    this.activeSubCategorySegment = e.detail.value;
  }

  onChangeProduct(e) {
    this.activeProductSegment = e.detail.value;
  }

  onSelect(property: string, id: string) {
    this.selected[property] = id;
  }

  guidGenerator(): string {
    // eslint-disable-next-line no-bitwise
    const S4 = () => (((1+Math.random())*0x10000)|0).toString(16).substring(1);
    return (S4()+'-'+S4()+'-'+S4()+'-'+S4()+S4()+S4());
  }

  onAdd(type) {
    if(type === 'new') {
      if(this.selectedItem){
        this.setOpen(true);
        this.addModalType = '[x]';
      } else if (this.selectedSubCategory){
        this.addModalType = 'проект';
        this.isProductAdd = true;
      } else if (this.selectedCategory) {
        this.setOpen(true);
        this.addModalType = 'подкатегорию';
      } else {
        this.setOpen(true);
        this.addModalType = 'категорию';
      }
    } else if(type === 'objects') {
       this.addModalType = 'обьект';
       this.setOpen(true);
    } else if(type === 'elements') {
       this.addModalType = 'элемент';
       this.setOpen(true);
    } else if(type === 'background') {
       this.addModalType = 'фон';
       this.setOpen(true);
    } else if(type === 'cover') {
       this.addModalType = 'кавер';
       this.setOpen(true);
    }
  }

  onPublish() {
    const subCategories = JSON.parse(JSON.stringify(this.categories.find(i => i.id === this.selectedCategory.id).subCategories));
    subCategories.find(c => c.id === this.selectedSubCategory.id).items.push(JSON.parse(this.json));

    this.db.collection('categories').doc(this.selectedCategory.id).update({
      subCategories
    }).then(() => {
      this.addModalType = '';
      this.isProductAdd = false;
      this.onSelectCategory(this.categories.find(i => i.id === this.selectedCategory.id));
      // eslint-disable-next-line max-len
      this.onSelectSubCategory(this.categories.find(i => i.id === this.selectedCategory.id).subCategories.find(i => i.id === this.selectedSubCategory.id));
    });
  }

  onUpdateCategory() {
    if(this.selectedSubCategory) {
      // eslint-disable-next-line max-len
      const TEMP = JSON.parse(JSON.stringify(this.categories.find(i => i.id === this.selectedCategory.id).subCategories.filter(s => s.id !== this.selectedSubCategory.id)));
      TEMP.push(this.selectedSubCategory);
      this.db.collection('categories').doc(this.selectedCategory.id).update({
        subCategories: TEMP,
      }).then(() => {
        this.subCategoryWasUpdated = false;
      });
    } else if(this.selectedCategory) {
      this.db.collection('categories').doc(this.selectedCategory.id).update({
        backgrounds: this.selectedCategory.backgrounds,
        elements: this.selectedCategory.elements,
        objects: this.selectedCategory.objects
      }).then(() => {
        this.categoryWasUpdated = false;
      });
    }
  }

  onSelectCategory(id: string) {
    this.categoryWasUpdated = false;
    this.selectedCategory = id;
  }

  onSelectSubCategory(id: string) {
    this.subCategoryWasUpdated = false;
    this.selectedSubCategory = id;
  }

  isSelectedInCategory(id, field) {
    return !!(this.selectedCategory[field].find(i => i.id === id));
  }

  isSelectedInSubCategory(id, field) {
    return !!(this.selectedSubCategory[field].find(i => i.id === id));
  }

  setOpen(isOpen: boolean) {
    this.isModalOpen = isOpen;
    if(this.isEditMode) {
      this.isEditMode = false;
      this.categoryName = '';
      this.subCategoryName = '';
      this.editID = '';
    }
  }

  onEdit(item, type) {
    this.editID = item.id;
    if(type === 'category') {
      this.addModalType = 'категорию';
      this.categoryName = item.title;
      this.isModalOpen = true;
      this.isEditMode = true;
    } else if(type === 'sub-category') {
      this.addModalType = 'подкатегорию';
      this.subCategoryName = item.title;
      this.isModalOpen = true;
      this.isEditMode = true;
    }
  }

  onToggleBackground(item, type) {
    if(type === 'category') {
      this.categoryWasUpdated = true;
      const TEMP = this.selectedCategory.backgrounds.find(i => i.id === item.id);
      if(!!TEMP) {
        this.selectedCategory.backgrounds = this.selectedCategory.backgrounds.filter(i => i.id !== item.id);
      } else {
        this.selectedCategory.backgrounds.push(item);
      }
    }
    if(type === 'sub-category') {
      this.subCategoryWasUpdated = true;
      const TEMP = this.selectedSubCategory.backgrounds.find(i => i.id === item.id);
      if(!!TEMP) {
        this.selectedSubCategory.backgrounds = this.selectedSubCategory.backgrounds.filter(i => i.id !== item.id);
      } else {
        this.selectedSubCategory.backgrounds.push(item);
      }
    }
  }

  onToggleObject(item, type) {
    if(type === 'category') {
      this.categoryWasUpdated = true;
      const TEMP = this.selectedCategory.objects.find(i => i.id === item.id);
      if(!!TEMP) {
        this.selectedCategory.objects = this.selectedCategory.objects.filter(i => i.id !== item.id);
      } else {
        this.selectedCategory.objects.push(item);
      }
    }
    if(type === 'sub-category') {
      this.subCategoryWasUpdated = true;
      const TEMP = this.selectedSubCategory.objects.find(i => i.id === item.id);
      if(!!TEMP) {
        this.selectedSubCategory.objects = this.selectedSubCategory.objects.filter(i => i.id !== item.id);
      } else {
        this.selectedSubCategory.objects.push(item);
      }
    }
  }

  onToggleElement(item, type) {
    if(type === 'category') {
      this.categoryWasUpdated = true;
      const TEMP = this.selectedCategory.elements.find(i => i.id === item.id);
      if(!!TEMP) {
        this.selectedCategory.elements = this.selectedCategory.elements.filter(i => i.id !== item.id);
      } else {
        this.selectedCategory.elements.push(item);
      }
    }
    if(type === 'sub-category') {
      this.subCategoryWasUpdated = true;
      const TEMP = this.selectedSubCategory.elements.find(i => i.id === item.id);
      if(!!TEMP) {
        this.selectedSubCategory.elements = this.selectedSubCategory.elements.filter(i => i.id !== item.id);
      } else {
        this.selectedSubCategory.elements.push(item);
      }
    }
  }

  async presentAlert(item, type) {
    const alert = await this.alertController.create({
      header: 'Удалить запись?',
      buttons: [
        {
          text: 'Отменить',
          role: 'cancel',
          handler: () => {
            console.log();
          },
        },
        {
          text: 'Удалить',
          role: 'confirm',
          handler: () => {
            if(type === 'category') {
              this.db.collection('categories').doc(item.id).delete();
            } else if(type === 'sub-category') {
              this.db.collection('categories').doc(this.selectedCategory.id).update({
                subCategories: this.selectedCategory.subCategories.filter(i => i.id !== item.id)
              }).then(() => {
                this.onSelectCategory(this.categories.find(i => i.id === this.selectedCategory.id));
              });
            } else if(type === 'item') {
              const TEMP = JSON.parse(JSON.stringify(this.selectedSubCategory));
              delete TEMP.items;
              TEMP.items = this.selectedSubCategory.items.filter(i => i.id !== item.id);
              const T = JSON.parse(JSON.stringify(this.selectedCategory.subCategories.filter(c => c.id !== this.selectedSubCategory.id)));
              T.push(TEMP);
              this.db.collection('categories').doc(this.selectedCategory.id).update({
                subCategories: T
              }).then(resp => {
                this.onSelectCategory(this.categories.find(i => i.id === this.selectedCategory.id));
                // eslint-disable-next-line max-len
                this.onSelectSubCategory(this.categories.find(i => i.id === this.selectedCategory.id).subCategories.find(i => i.id === this.selectedSubCategory.id));
              });
            } else if(type === 'object') {
              const TEMP = JSON.parse(JSON.stringify(this.data.find(i => i.objects).objects));
              delete TEMP[item.id];
              this.db.collection('data').doc('objects').set(TEMP);
            } else if(type === 'element') {
              const TEMP = JSON.parse(JSON.stringify(this.data.find(i => i.elements).elements));
              delete TEMP[item.id];
              this.db.collection('data').doc('elements').set(TEMP);
            } else if(type === 'background') {
              const TEMP = JSON.parse(JSON.stringify(this.data.find(i => i.backgrounds).backgrounds));
              delete TEMP[item.id];
              this.db.collection('data').doc('backgrounds').set(TEMP);
            } else if(type === 'cover') {
              const TEMP = JSON.parse(JSON.stringify(this.data.find(i => i.covers).covers));
              delete TEMP[item.id];
              this.db.collection('data').doc('covers').set(TEMP);
            }
          },
        },
      ],
    });

    await alert.present();

    const { role } = await alert.onDidDismiss();
  }

  onSave() {
    if(this.isEditMode) {
      if(this.addModalType === 'категорию') {
        this.db.collection('categories').doc(this.editID).update({
          title: this.categoryName
        }).then(() => {
          this.isModalOpen = false;
          this.isEditMode = false;
        });
      } else if(this.addModalType === 'подкатегорию') {
        this.selectedCategory.subCategories.find(i => i.id === this.editID).title = this.subCategoryName;
        this.db.collection('categories').doc(this.selectedCategory.id).update({
          subCategories: this.selectedCategory.subCategories
        }).then(() => {
          this.isModalOpen = false;
          this.isEditMode = false;
        });
      }
    } else {
      const ID = this.guidGenerator();
      if(this.addModalType === 'категорию') {
        this.db.collection('categories').doc(ID).set({
          id: ID,
          backgrounds: [],
          elements: [],
          objects: [],
          tags: [],
          subCategories: [],
          title: this.categoryName
        }).then(() => {
          this.categoryName = '';
          this.isModalOpen = false;
        });
      } else if(this.addModalType === 'подкатегорию') {
        this.selectedCategory.subCategories.push({
          backgrounds: [],
          elements: [],
          id: ID,
          items: [],
          objects: [],
          tags: [],
          title: this.subCategoryName
        });
        this.db.collection('categories').doc(this.selectedCategory.id).update({
          subCategories: this.selectedCategory.subCategories
        }).then(() => {
          this.subCategoryName = '';
          this.isModalOpen = false;
        });
      } else if(this.addModalType === 'фон') {
        const TEMP = JSON.parse(JSON.stringify(this.data.find(i => i.backgrounds).backgrounds));
        TEMP[this.bName] = {id: this.bName, tags: []};
        this.db.collection('data').doc('backgrounds').set(TEMP).then(() => {
          this.bName = '';
          this.isModalOpen = false;
        });
      } else if(this.addModalType === 'элемент') {
        const TEMP = JSON.parse(JSON.stringify(this.data.find(i => i.elements).elements));
        TEMP[this.eName] = {id: this.eName, tags: []};
        this.db.collection('data').doc('elements').set(TEMP).then(() => {
          this.eName = '';
          this.isModalOpen = false;
        });
      } else if(this.addModalType === 'обьект') {
        const TEMP = JSON.parse(JSON.stringify(this.data.find(i => i.objects).objects));
        TEMP[this.oName] = {id: this.oName, tags: []};
        this.db.collection('data').doc('objects').set(TEMP).then(() => {
          this.oName = '';
          this.isModalOpen = false;
        });
      } else if(this.addModalType === 'кавер') {
        const TEMP = JSON.parse(JSON.stringify(this.data.find(i => i.covers).covers));
        TEMP[this.cName] = {id: this.cName, tags: []};
        this.db.collection('data').doc('covers').set(TEMP).then(() => {
          this.cName = '';
          this.isModalOpen = false;
        });
      }
    }
  }
}
