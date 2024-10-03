import {AfterViewInit, Component, ElementRef, Inject, Renderer2, ViewChild} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {ICategoryItem, ISubCategory} from '../../shared/models';
import {Subscription} from 'rxjs';
import {fabric} from 'fabric';
import {ActionSheetController, AlertController, IonRouterOutlet, ModalController} from '@ionic/angular';
import {CatalogSearchPage} from '../catalog-search/catalog-search.page';
import {RangeCustomEvent} from '@ionic/angular';
import {Observable, Observer} from 'rxjs';
import {Location} from '@angular/common';
import {AngularFirestore} from '@angular/fire/firestore';
import {AuthService} from '../../core/services/auth.service';
import {first} from 'rxjs/operators';
import {DOCUMENT} from '@angular/common';
import {HttpClient} from '@angular/common/http';
import {ClipboardService} from 'ngx-clipboard';
import {environment} from '../../../environments/environment';

@Component({
  selector: 'app-catalog-item',
  templateUrl: 'catalog-item.page.html',
  styleUrls: ['catalog-item.page.scss']
})
export class CatalogItemPage implements AfterViewInit {
  @ViewChild('editorWrapper') editorWrapper: ElementRef;
  @ViewChild('editorCanvas') editorCanvas: ElementRef;
  domain = environment.domain;
  base64Image: any;
  routerSubscription: Subscription;
  data: any;
  item: ICategoryItem;
  editorSection = '';
  textString = '';
  formatZ = 1;
  itemID = '';

  backgrounds = [];
  elements = [];
  objects = [];

  editorItem: ICategoryItem = {};

  // Fabric
  public canvas: fabric.Canvas;
  public props = {
    canvasFill: '#ffffff',
    canvasImage: '',
    id: null,
    opacity: null,
    fill: '#000000',
    fontSize: 50,
    lineHeight: 1,
    charSpacing: 1,
    fontWeight: null,
    fontStyle: null,
    textAlign: null,
    fontFamily: null,
    // eslint-disable-next-line @typescript-eslint/naming-convention
    TextDecoration: ''
  };
  public url: string | ArrayBuffer = '';
  public size: any = {width: 375, height: 375};
  public json: any;
  public figureEditor = false;
  public selected: any;

  editorWidth = 0;

  isImageReady = false;
  finalImage = '';
  finalImageUrl = '';

  activeFilter = '';

  filters = [
    {name: 'none', class: ''},
    {name: '1977', class: 'filter-1977'},
    {name: 'Aden', class: 'filter-aden'},
    {name: 'Amaro', class: 'filter-amaro'},
    {name: 'Ashby', class: 'filter-ashby'},
    {name: 'Brannan', class: 'filter-brannan'},
    {name: 'Brooklyn', class: 'filter-brooklyn'},
    {name: 'Charmes', class: 'filter-charmes'},
    {name: 'Clarendon', class: 'filter-clarendon'},
    {name: 'Crema', class: 'filter-crema'},
    {name: 'Dogpatch', class: 'filter-dogpatch'},
    {name: 'Earlybird', class: 'filter-earlybird'},
    {name: 'Gingham', class: 'filter-gingham'},
    {name: 'Ginza', class: 'filter-ginza'},
    {name: 'Hefe', class: 'filter-hefe'},
    {name: 'Helena', class: 'filter-helena'},
    {name: 'Hudson', class: 'filter-hudson'},
    {name: 'Inkwell', class: 'filter-inkwell'},
    {name: 'Kelvin', class: 'filter-kelvin'},
    {name: 'Kuno', class: 'filter-juno'},
    {name: 'Lark', class: 'filter-lark'},
    {name: 'Lo-Fi', class: 'filter-lofi'},
    {name: 'Ludwig', class: 'filter-ludwig'},
    {name: 'Maven', class: 'filter-maven'},
    {name: 'Mayfair', class: 'filter-mayfair'},
    {name: 'Moon', class: 'filter-moon'},
    {name: 'Nashville', class: 'filter-nashville'},
    {name: 'Perpetua', class: 'filter-perpetua'},
    {name: 'Poprocket', class: 'filter-poprocket'},
    {name: 'Reyes', class: 'filter-reyes'},
    {name: 'Rise', class: 'filter-rise'},
    {name: 'Sierra', class: 'filter-sierra'},
    {name: 'Skyline', class: 'filter-skyline'},
    {name: 'Slumber', class: 'filter-slumber'},
    {name: 'Stinson', class: 'filter-stinson'},
    {name: 'Sutro', class: 'filter-sutro'},
    {name: 'Toaster', class: 'filter-toaster'},
    {name: 'Valencia', class: 'filter-valencia'},
    {name: 'Vesper', class: 'filter-vesper'},
    {name: 'Walden', class: 'filter-walden'},
    {name: 'Willow', class: ' filter-willow'},
    {name: 'X-Pro II', class: 'filter-xpro-ii'},
  ];

  filterMode: 'filter' | 'corrections' = 'filter';

  canvasFormat = '4:5';

  gamma = {
    red: { min: '0',  max: '10',  step: '0.003921',  value: '1' },
    green: { min: '0',  max: '10',  step: '0.003921',  value: '1' },
    blue: { min: '0',  max: '10',  step: '0.003921',  value: '1' }
  };
  isFiltersAvailable = false;
  isTextOptionsAvailable = false;
  fonts: any[] = [];

  constructor(
    @Inject(DOCUMENT) private document: any,
    private authService: AuthService,
    private renderer: Renderer2,
    private route: ActivatedRoute,
    private routerOutlet: IonRouterOutlet,
    private modalCtrl: ModalController,
    public actionSheetController: ActionSheetController,
    private location: Location,
    private db: AngularFirestore,
    private auth: AuthService,
    private router: Router,
    private alertController: AlertController,
    private _clipboardService: ClipboardService,
    private httpClient: HttpClient
  ) {
  }

  get isAdmin(): boolean {
    const U = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null;
    return !(!U.isAdmin || !this.authService.isLoggedIn);
  }

  myBackButton() {
    this.location.back();
  }

  onGetFonts() {
    this.fonts.length = 0;
    this.httpClient.get('../../assets/catalog/fonts/fonts.json').subscribe((data: any) => {
      this.fonts = data.sort((a, b) => a.name.localeCompare(b.name));
    });
  }

  public ngAfterViewInit() {
    this.onGetFonts();
    // this.domain = this.document.location.origin;
    this.routerSubscription = this.route.params.subscribe(params => {
      this.itemID = params.id;

      this.db.collection('categories').doc(params.category).get().pipe(first()).subscribe((cat: any) => {
        const subcategory = cat.data().subCategories.find((subCategory: ISubCategory) => subCategory.id === params.subCategory);
        this.route.queryParams
          .subscribe(qp => {
            if (qp.project) {
              this.db
                .collection('users')
                .doc(JSON.parse(localStorage.getItem('user')).id)
                .get()
                .pipe(first())
                .subscribe((resp: any) => {
                  this.item = resp.data().projects.find(p => p.id === qp.project).item;
                  this.onSetItemDetails();
                });
            } else {
              this.item = subcategory.items.find((item: ICategoryItem) => item.id === params.id);
              this.onSetItemDetails();
            }
          });
        this.backgrounds = subcategory.backgrounds;
        this.objects = subcategory.objects;
        this.elements = subcategory.elements;
      });
    });
  }

  onSetItemDetails() {
    this.editorItem.background = this.item.background;
    this.editorItem.element = this.item.element;
    this.editorItem.object = this.item.object;
    this.editorItem.title = this.item.title;
    this.editorItem.subtitle = this.item.subtitle;
    this.onStart();
  }

  onStart() {
    setTimeout(() => {
      this.editorWidth = this.editorWrapper.nativeElement.offsetWidth;
      this.renderer.setAttribute(this.editorCanvas.nativeElement, 'width', `${this.editorWidth}`);
      this.renderer.setAttribute(this.editorCanvas.nativeElement, 'height', `${this.editorWidth}`);
      this.canvas = new fabric.Canvas(this.editorCanvas.nativeElement, {
        hoverCursor: 'pointer',
        selection: true,
        selectionBorderColor: 'blue',
        isDrawingMode: false
      });
      this.canvas.on({
        'mouse:down': (e) => {
          if (e?.target?.id) {
            if (e.target.id === 'editorObject') {
              // this.editorSection = 'object';
            }
            if (e.target.id === 'editorElement') {
              // this.editorSection = 'element';
            }
          }
          const selectedObject = e.target;
          if (selectedObject) {
            this.selected = selectedObject;
            if (selectedObject.type !== 'group' && selectedObject) {
              this.getId();
              this.getOpacity();
              switch (selectedObject.type) {
                case 'i-text':
                  // this.editorSection = 'text';
                  this.getLineHeight();
                  this.getCharSpacing();
                  this.getBold();
                  this.getFill();
                  this.getTextDecoration();
                  this.getTextAlign();
                  this.getFontFamily();
                  break;
                case 'image':
                  // this.editorSection = 'object';
              }
            }
          }
        },
        'selection:created': () => {
          if(this.canvas.getActiveObject().type === 'image') {
            this.isFiltersAvailable = true;
            this.gammaStart();
          }
          if(this.canvas.getActiveObject().type === 'i-text') {
            this.isTextOptionsAvailable = true;
          }
        },
        'selection:updated': () => {
          if(this.canvas.getActiveObject().type === 'image') {
            this.isFiltersAvailable = true;
            this.gammaStart();
          } else {
            this.isFiltersAvailable = false;
          }
          this.isTextOptionsAvailable = this.canvas.getActiveObject().type === 'i-text';
        },
        'selection:cleared': () => {
          this.selected = null;
          this.isFiltersAvailable = false;
          this.isTextOptionsAvailable = false;
        }
      });

      this.onSetSize();

      if (this.editorItem.title) {
        this.onAddText('editorTitle', this.editorItem.title, 3);
      }
      if (this.editorItem.subtitle) {
        this.onAddText('editorSubTitle', this.editorItem.subtitle, 4);
      }
      setTimeout(() => {
        this.db
          .collection('items')
          .doc(this.itemID)
          .get()
          .pipe(first())
          .subscribe((resp: any) => {
            const DOC = resp.data();
            if(DOC && DOC.json) {
              localStorage.setItem('Kanvas', DOC.json.replaceAll('CURRENT_DOMAIN', this.domain).replace('\'', '"'));
              setTimeout(() => {
                this.loadCanvasFromJSON();
              }, 0);
            } else {
              this.onBackgroundSelect(this.editorItem.background);
              this.onElementSelect(this.editorItem.element);
              this.onObjectSelect(this.editorItem.object);
            }
            console.log(resp.data()?.json);
          });
      });
    });
  }

  onSetSize() {
    const size = this.editorWidth ? this.editorWidth : this.size.width;
    this.canvas.setWidth(size);
    if (this.canvasFormat === '4:5') {
      this.canvas.setHeight(size / 4 * 5);
    } else if (this.canvasFormat === '9:16') {
      this.canvas.setHeight(size / 9 * 16);
    } else {
      this.canvas.setHeight(size);
    }
    this.onBackgroundSelect(this.editorItem.background);
  }

  changeSize(format) {
    this.canvasFormat = format;
    this.onSetSize();
  }

  public onObjectSelect(id: string) {
    this.removePrevious('editorObject');
    this.editorItem.object = id;
    const src = '../../../assets/catalog/objects/' + id;
    fabric.Image.fromURL(src, (image) => {
      image.scaleToWidth(200);
      image.scaleToHeight(200);
      image.set({
        left: this.editorWidth / 2 - image.getScaledWidth() / 2,
        top: this.editorWidth / 2 - image.getScaledHeight() / 2
      });
      image.id = 'editorObject';
      image.zIndex = 2;
      this.canvas.add(image);
      this.selectItem(image);
    }, {crossOrigin: 'Anonymous'});
  }

  public onElementSelect(id: string) {
    this.removePrevious('editorElement');
    this.editorItem.element = id;
    const src = '../../../assets/catalog/elements/' + id;
    fabric.Image.fromURL(src, (image) => {
      image.scaleToWidth(200);
      image.scaleToHeight(200);
      image.set({
        left: this.editorWidth / 2 - image.getScaledWidth() / 2,
        top: this.editorWidth / 2 - image.getScaledHeight() / 2
      });
      image.id = 'editorElement';
      image.zIndex = 1;
      this.canvas.add(image);
      this.selectItem(image);
    }, {crossOrigin: 'Anonymous'});
  }

  public onBackgroundSelect(id: string) {
    this.editorItem.background = id;
    const bgSrc = this.domain + '/assets/catalog/backgrounds/' + id;
    fabric.Image.fromURL(bgSrc, (image) => {
      this.canvas.setBackgroundImage(image, this.canvas.renderAll.bind(this.canvas), {
        scaleX: this.canvas.width / image.width,
        scaleY: this.canvas.height / image.height
      });
    }, {crossOrigin: 'Anonymous'});
  }

  public onSelectFilter(f: any) {
    this.activeFilter = f.class;
  }

  public onAddText(id: string, t: string, index: number) {
    const text = new fabric.IText(t, {
      left: this.editorWidth / 2,
      top: this.editorWidth / 2,
      fontSize: this.props.fontSize,
      lineHeight: this.props.lineHeight,
      charSpacing: this.props.charSpacing,
      fontFamily: 'helvetica',
      angle: 0,
      fill: '#000000',
      scaleX: 0.5,
      scaleY: 0.5,
      fontWeight: '',
      hasRotatingPoint: true,
      id,
      zIndex: index
    });

    this.extend(text, id);
    this.canvas.add(text);
    this.selectItemAfterAdded(text);
    setTimeout(() => {
      if (index > 3) {
        // eslint-disable-next-line no-underscore-dangle
        this.canvas._objects.sort((a, b) => (a.zIndex > b.zIndex) ? 1 : -1);
        this.canvas.renderAll();
      }
    }, 500);
  }

  public selectItem(obj) {
    this.canvas.discardActiveObject().renderAll();
    this.canvas.setActiveObject(obj);
  }

  public removePrevious(objectName) {
    const obj = this.canvas.getObjects().find(o => o.id === objectName);
    if (obj) {
      this.selectItem(obj);
      this.canvas.remove(this.canvas.getActiveObject());
    }
  }

  public async onOpenFilters(type: string) {
    const modal = await this.modalCtrl.create({
      component: CatalogSearchPage,
      presentingElement: this.routerOutlet.nativeEl,
      componentProps: {type},
      swipeToClose: true
    });
    await modal.present();
    await modal.onWillDismiss().then(resp => {
      if (resp.data) {
        if (resp.data.type === 'element') {
          this.onElementSelect(resp.data.id);
        }
        if (resp.data.type === 'object') {
          this.onObjectSelect(resp.data.id);
        }
        if (resp.data.type === 'background') {
          this.onBackgroundSelect(resp.data.id);
        }
      }
    });
  }

  onFontSizeChange(ev: Event) {
    this.props.fontSize = (ev as RangeCustomEvent).detail.value as number;
    this.setFontSize();
  }

  onLineHeightChange(ev: Event) {
    this.props.lineHeight = (ev as RangeCustomEvent).detail.value as number;
    this.setLineHeight();
  }

  onLetterSpacingChange(ev: Event) {
    this.props.charSpacing = (ev as RangeCustomEvent).detail.value as number;
    this.setCharSpacing();
  }

  addText() {
    if (this.textString) {
      const text = new fabric.IText(this.textString, {
        left: this.editorWidth / 2,
        top: this.editorWidth / 2,
        fontSize: this.props.fontSize,
        lineHeight: this.props.lineHeight,
        charSpacing: this.props.charSpacing,
        fontFamily: 'helvetica',
        angle: 0,
        fill: '#000000',
        scaleX: 0.5,
        scaleY: 0.5,
        fontWeight: '',
        hasRotatingPoint: true
      });

      this.extend(text, this.randomId());
      this.canvas.add(text);
      this.selectItemAfterAdded(text);
      this.textString = '';
    }
  }

  getImgPolaroid(event: any) {
    const el = event.target;
    fabric.loadSVGFromURL(el.src, (objects, options) => {
      const image = fabric.util.groupSVGElements(objects, options);
      image.set({
        left: 10,
        top: 10,
        angle: 0,
        padding: 10,
        cornerSize: 10,
        hasRotatingPoint: true,
      });
      this.extend(image, this.randomId());
      this.canvas.add(image);
      this.selectItemAfterAdded(image);
    });
  }

  addImageOnCanvas(url) {
    if (url) {
      fabric.Image.fromURL(url, (image) => {
        image.set({
          left: 10,
          top: 10,
          angle: 0,
          padding: 10,
          cornerSize: 10,
          hasRotatingPoint: true
        });
        image.scaleToWidth(200);
        image.scaleToHeight(200);
        this.extend(image, this.randomId());
        this.canvas.add(image);
        this.selectItemAfterAdded(image);
      }, {crossOrigin: 'Anonymous'});
    }
  }

  readUrl(event) {
    if (event.target.files && event.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (readerEvent) => {
        this.url = readerEvent.target.result;
        this.addImageOnCanvas(readerEvent.target.result);
      };
      reader.readAsDataURL(event.target.files[0]);
    }
  }

  removeWhite() {
    this.url = '';
  }

  addFigure(figure) {
    let add: any;
    switch (figure) {
      case 'rectangle':
        add = new fabric.Rect({
          width: 200, height: 100, left: 10, top: 10, angle: 0,
          fill: '#3f51b5'
        });
        break;
      case 'square':
        add = new fabric.Rect({
          width: 100, height: 100, left: 10, top: 10, angle: 0,
          fill: '#4caf50'
        });
        break;
      case 'triangle':
        add = new fabric.Triangle({
          width: 100, height: 100, left: 10, top: 10, fill: '#2196f3'
        });
        break;
      case 'circle':
        add = new fabric.Circle({
          radius: 50, left: 10, top: 10, fill: '#ff5722'
        });
        break;
    }
    this.extend(add, this.randomId());
    this.canvas.add(add);
    this.selectItemAfterAdded(add);
  }

  cleanSelect() {
    this.canvas.discardActiveObject().renderAll();
  }

  selectItemAfterAdded(obj) {
    this.canvas.discardActiveObject().renderAll();
    this.canvas.setActiveObject(obj);
  }

  setCanvasFill() {
    if (!this.props.canvasImage) {
      this.canvas.backgroundColor = this.props.canvasFill;
      this.canvas.renderAll();
    }
  }

  extend(obj, id) {
    obj.toObject = ((toObject) => function() {
      return fabric.util.object.extend(toObject.call(this), {
        id
      });
    })(obj.toObject);
  }

  setCanvasImage() {
    const self = this;
    if (this.props.canvasImage) {
      this.canvas.setBackgroundColor(new fabric.Pattern({source: this.props.canvasImage, repeat: 'repeat'}), () => {
        self.props.canvasFill = '';
        self.canvas.renderAll();
      });
    }
  }

  randomId() {
    return Math.floor(Math.random() * 999999) + 1;
  }

  getActiveStyle(styleName, object) {
    object = object || this.canvas.getActiveObject();
    if (!object) {
      return '';
    }

    if (object.getSelectionStyles && object.isEditing) {
      return (object.getSelectionStyles()[styleName] || '');
    } else {
      return (object[styleName] || '');
    }
  }

  setActiveStyle(styleName, value: string | number, object: fabric.IText) {
    object = object || this.canvas.getActiveObject() as fabric.IText;
    if (!object) {
      return;
    }

    if (object.setSelectionStyles && object.isEditing) {
      const style = {};
      style[styleName] = value;

      if (typeof value === 'string') {
        if (value.includes('underline')) {
          object.setSelectionStyles({underline: true});
        } else {
          object.setSelectionStyles({underline: false});
        }

        if (value.includes('overline')) {
          object.setSelectionStyles({overline: true});
        } else {
          object.setSelectionStyles({overline: false});
        }

        if (value.includes('line-through')) {
          object.setSelectionStyles({linethrough: true});
        } else {
          object.setSelectionStyles({linethrough: false});
        }
      }

      object.setSelectionStyles(style);
      object.setCoords();

    } else {
      if (typeof value === 'string') {
        if (value.includes('underline')) {
          object.set('underline', true);
        } else {
          object.set('underline', false);
        }

        if (value.includes('overline')) {
          object.set('overline', true);
        } else {
          object.set('overline', false);
        }

        if (value.includes('line-through')) {
          object.set('linethrough', true);
        } else {
          object.set('linethrough', false);
        }
      }

      object.set(styleName, value);
    }

    object.setCoords();
    this.canvas.renderAll();
  }

  getActiveProp(name) {
    const object = this.canvas.getActiveObject();
    if (!object) {
      return '';
    }

    return object[name] || '';
  }

  setActiveProp(name, value) {
    const object = this.canvas.getActiveObject();
    if (!object) {
      return;
    }
    object.set(name, value).setCoords();
    this.canvas.renderAll();
  }

  getId() {
    this.props.id = this.canvas.getActiveObject().toObject().id;
  }

  setId() {
    const val = this.props.id;
    const complete = this.canvas.getActiveObject().toObject();
    this.canvas.getActiveObject().toObject = () => {
      complete.id = val;
      return complete;
    };
  }

  getOpacity() {
    this.props.opacity = this.getActiveStyle('opacity', null) * 100;
  }

  setOpacity() {
    this.setActiveStyle('opacity', parseInt(this.props.opacity, 10) / 100, null);
  }

  getFill() {
    this.props.fill = this.getActiveStyle('fill', null);
  }

  setFill() {
    this.setActiveStyle('fill', this.props.fill, null);
  }

  getLineHeight() {
    this.props.lineHeight = this.getActiveStyle('lineHeight', null);
  }

  setLineHeight() {
    this.setActiveStyle('lineHeight', parseFloat(String(this.props.lineHeight)), null);
  }

  getCharSpacing() {
    this.props.charSpacing = this.getActiveStyle('charSpacing', null);
  }

  setCharSpacing() {
    this.setActiveStyle('charSpacing', this.props.charSpacing, null);
  }

  getFontSize() {
    this.props.fontSize = this.getActiveStyle('fontSize', null);
  }

  setFontSize() {
    this.setActiveStyle('fontSize', parseInt(String(this.props.fontSize), 10), null);
  }

  getBold() {
    this.props.fontWeight = this.getActiveStyle('fontWeight', null);
  }

  setBold() {
    this.props.fontWeight = !this.props.fontWeight;
    this.setActiveStyle('fontWeight', this.props.fontWeight ? 'bold' : '', null);
  }

  setFontStyle() {
    this.props.fontStyle = !this.props.fontStyle;
    if (this.props.fontStyle) {
      this.setActiveStyle('fontStyle', 'italic', null);
    } else {
      this.setActiveStyle('fontStyle', 'normal', null);
    }
  }

  getTextDecoration() {
    this.props.TextDecoration = this.getActiveStyle('textDecoration', null);
  }

  setTextDecoration(value) {
    let iclass = this.props.TextDecoration;
    if (iclass.includes(value)) {
      iclass = iclass.replace(RegExp(value, 'g'), '');
    } else {
      iclass += ` ${value}`;
    }
    this.props.TextDecoration = iclass;
    this.setActiveStyle('textDecoration', this.props.TextDecoration, null);
  }

  hasTextDecoration(value) {
    return this.props.TextDecoration.includes(value);
  }

  getTextAlign() {
    this.props.textAlign = this.getActiveProp('textAlign');
  }

  setTextAlign(value) {
    this.props.textAlign = value;
    this.setActiveProp('textAlign', this.props.textAlign);
  }

  getFontFamily() {
    this.props.fontFamily = this.getActiveProp('fontFamily');
  }

  setFontFamily() {
    this.setActiveProp('fontFamily', this.props.fontFamily);
  }

  removeSelected() {
    const activeObject = this.canvas.getActiveObject();
    const activeGroup = this.canvas.getActiveObjects();
    if (activeObject) {
      this.canvas.remove(activeObject);
      // this.textString = '';
    } else if (activeGroup) {
      this.canvas.discardActiveObject();
      const self = this;
      activeGroup.forEach((object) => {
        self.canvas.remove(object);
      });
    }
  }

  bringToFront() {
    const activeObject = this.canvas.getActiveObject();
    const activeGroup = this.canvas.getActiveObjects();

    if (activeObject) {
      activeObject.bringToFront();
      activeObject.opacity = 1;
    } else if (activeGroup) {
      this.canvas.discardActiveObject();
      activeGroup.forEach((object) => {
        object.bringToFront();
      });
    }
  }

  sendToBack() {
    const activeObject = this.canvas.getActiveObject();
    const activeGroup = this.canvas.getActiveObjects();

    if (activeObject) {
      this.canvas.sendToBack(activeObject);
      activeObject.sendToBack();
      activeObject.opacity = 1;
    } else if (activeGroup) {
      this.canvas.discardActiveObject();
      activeGroup.forEach((object) => {
        object.sendToBack();
      });
    }
  }

  saveCanvasToJSON() {
    const json = JSON.stringify(this.canvas);
    localStorage.setItem('Kanvas', json);
  }

  loadCanvasFromJSON() {
    const CANVAS = JSON.parse(localStorage.getItem('Kanvas'));
    CANVAS.objects.forEach(obj => {
      if (obj.type === 'image' && obj.src && obj.src.includes('catalog/elements')) {
        obj.id = 'editorElement';
      }
      if (obj.type === 'image' && obj.src && obj.src.includes('catalog/objects')) {
        obj.id = 'editorObject';
      }
    });
    this.canvas.loadFromJSON(JSON.stringify(CANVAS), () => {
      this.canvas.renderAll();
      this.onSetSize();
    });
  }

  rasterizeJSON() {
    this.json = JSON.stringify(this.canvas, null, 2);
  }

  async presentActionSheet() {
    const actionSheet = await this.actionSheetController.create({
      header: 'Выбрите действие',
      cssClass: 'my-custom-class',
      buttons: [
        /*{ text: 'Сохранить JSON', icon: 'images-outline', handler: () => this.saveCanvasToJSON() },
        { text: 'Загрузить JSON', icon: 'images-outline', handler: () => this.loadCanvasFromJSON() },*/
        {text: this.isAdmin ? 'Обновить JSON' : 'Сохранить проект', icon: 'save-outline', handler: () => this.saveProjectToAccount()},
        {text: 'Сохранить изображение', icon: 'save-outline', handler: () => this.onSave()},
        {text: 'Отмена', icon: 'close', role: 'cancel', cssClass: 'admin-btn'}
      ]
    });
    await actionSheet.present();

    // eslint-disable-next-line @typescript-eslint/no-shadow
    const {} = await actionSheet.onDidDismiss();
  }

  onSave() {
    this.canvas.discardActiveObject().renderAll();
    const size = (this.editorWidth ? this.editorWidth : this.size.width) * 5;
    const width = size;
    let height = size;
    if (this.canvasFormat === '4:5') {
      height = size / 4 * 5;
    } else if (this.canvasFormat === '9:16') {
      height = size / 9 * 16;
    }

    const image = new Image();
    image.crossOrigin = 'Anonymous';
    const resizedCanvas = document.createElement('canvas');
    const resizedContext = resizedCanvas.getContext('2d');

    resizedCanvas.height = height;
    resizedCanvas.width = width;

    resizedContext.drawImage(this.editorCanvas.nativeElement, 0, 0, width, height);
    image.src = resizedCanvas.toDataURL('image/png');

    this.finalImage = image.outerHTML;
    this.finalImageUrl = image.src;
    this.isImageReady = true;
  }

  onGetLayerIcon(id: string) {
    if (id.toLowerCase().includes('title')) {
      return 'text-outline';
    }
    if (id.toLowerCase().includes('object')) {
      return 'planet-outline';
    }
    if (id.toLowerCase().includes('element')) {
      return 'extension-puzzle-outline';
    }
  }

  moveTop(index: number, obj: any) {
    console.log(index, obj);
  }

  moveBottom(index: number, obj: any) {
    console.log(index, obj);
  }

  delete(index: number, obj: any) {
    console.log(index, obj);
  }

  onSelect(obj: any) {
    // eslint-disable-next-line no-underscore-dangle
    this.canvas.setActiveObject(this.canvas.item(this.canvas._objects.findIndex(i => i.id === obj.id)));
  }

  downloadImage() {
    this.getBase64ImageFromURL(this.finalImageUrl).subscribe(base64data => {
      this.base64Image = 'data:image/jpg;base64,' + base64data;
      const link = document.createElement('a');
      document.body.appendChild(link);
      link.setAttribute('href', this.base64Image);
      link.setAttribute('download', 'SMME.jpg');
      link.click();
    });
  }

  getBase64ImageFromURL(url: string) {
    return Observable.create((observer: Observer<string>) => {
      const img: HTMLImageElement = new Image();
      img.crossOrigin = 'Anonymous';
      img.src = url;
      if (!img.complete) {
        img.onload = () => {
          observer.next(this.getBase64Image(img));
          observer.complete();
        };
        img.onerror = err => {
          observer.error(err);
        };
      } else {
        observer.next(this.getBase64Image(img));
        observer.complete();
      }
    });
  }

  getBase64Image(img: HTMLImageElement) {
    const canvas: HTMLCanvasElement = document.createElement('canvas');
    canvas.width = img.width;
    canvas.height = img.height;
    const ctx: CanvasRenderingContext2D = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0);
    const dataURL: string = canvas.toDataURL('image/png');
    return dataURL.replace(/^data:image\/(png|jpg);base64,/, '');
  }

  guidGenerator() {
    // eslint-disable-next-line no-bitwise
    const S4 = () => (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
    return (S4() + S4() + '-' + S4() + '-' + S4() + '-' + S4() + '-' + S4() + S4() + S4());
  }

  async saveProjectToAccount() {
    if (!this.isAdmin) {
      const alert = await this.alertController.create({
        header: 'Введите имя проекта',
        buttons: [
          {
            text: 'Сохранить',
            handler: (alertData) => {
              const project = {
                id: this.guidGenerator(),
                item: JSON.parse(JSON.stringify(this.item)),
                title: alertData.title ? alertData.title : 'Not Finished'
              };
              project.item.JSON = JSON.stringify(this.canvas);

              const userRef = this.db.collection('users').doc(JSON.parse(localStorage.getItem('user')).id);
              userRef.get().pipe(first()).subscribe((u: any) => {
                const user = u.data();
                if (!user.projects) {
                  user.projects = [];
                }
                const existingProject = user.projects?.find(p => p.id === project.id);
                // eslint-disable-next-line @typescript-eslint/no-unused-expressions
                existingProject ? existingProject.item = project.item : user.projects.push(project);
                userRef.set(user).then(() => {
                  this.router.navigateByUrl('/projects').then();
                });
              });
            }
          }
        ],
        inputs: [
          {
            name: 'title',
            placeholder: 'Имя проекта',
          }
        ],
      });
      await alert.present();
    } else {
      const userRef = this.db.collection('items').doc(this.itemID);

      userRef.set({json: JSON.stringify(this.canvas).replaceAll(this.domain, 'CURRENT_DOMAIN')}).then(() => {
        this.router.navigateByUrl('/catalog').then();
      });
    }
  }

  onHideSegment() {
    this.editorSection = '';
  }

  onChangeFilterMode(filterMode: 'filter' | 'corrections') {
    this.filterMode = filterMode;
  }


  applyFilter(index, filter) {
    const obj = this.canvas.getActiveObject();
    obj.filters[index] = filter;
    obj.applyFilters();
    this.canvas.renderAll();
  }

  getFilter(index) {
    const obj = this.canvas.getActiveObject();
    return obj.filters[index];
  }

  applyFilterValue(index, prop, value) {
    const obj = this.canvas.getActiveObject();
    if (obj.filters[index]) {
      obj.filters[index][prop] = value;
      obj.applyFilters();
      this.canvas.renderAll();
    }
  }

  sepia() {
    this.applyFilter(3, new fabric.Image.filters.Sepia());
  }

  gammaStart() {
    const v1 = parseFloat(this.gamma.red.value);
    const v2 = parseFloat(this.gamma.green.value);
    const v3 = parseFloat(this.gamma.blue.value);
    this.applyFilter(17, new fabric.Image.filters.Gamma({
      gamma: [v1, v2, v3]
    }));
  }

  gammaChange(e, index) {
    const current = this.getFilter(17).gamma;
    current[index] = parseFloat(e);
    this.applyFilterValue(17, 'gamma', current);
  }

  onResetGamma() {
    this.gamma.red.value = '1';
    this.gamma.green.value = '1';
    this.gamma.blue.value = '1';
    this.gammaStart();
  }

  onCopyToClipboard() {
    // eslint-disable-next-line no-underscore-dangle
    this._clipboardService.copy(this.item.content);
  }
}
