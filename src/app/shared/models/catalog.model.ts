import {ICategory} from './category.model';
import {IObject} from './object.model';
import {IElement} from './element.model';
import {IBackground} from './background.model';

export interface ICatalog {
  categories: ICategory[];
  objects: IObject[];
  elements: IElement[];
  backgrounds: IBackground[];
}
