import {ICategoryItem} from './category-item.model';

export interface ISubCategory {
  id: string;
  title: string;
  tags: string[];
  items: ICategoryItem[];
  elements: [];
  objects: [];
  backgrounds: [];
}
