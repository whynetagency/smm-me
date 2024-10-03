import {ISubCategory} from './sub-category.model';

export interface ICategory {
  id: string;
  title: string;
  tags: string[];
  subCategories: ISubCategory[];
}
