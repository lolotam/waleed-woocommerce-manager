
export interface Category {
  id: number;
  name: string;
  slug: string;
  parent: number;
  description: string;
  display: string;
  image: {
    id: number;
    date_created: string;
    date_created_gmt: string;
    date_modified: string;
    date_modified_gmt: string;
    src: string;
    name: string;
    alt: string;
  } | null;
  menu_order: number;
  count: number;
  extra_description?: string;
  meta_data?: {
    id: number;
    key: string;
    value: any;
  }[];
}

export interface CategoryFormData {
  name: string;
  slug: string;
  parent: number;
  description: string;
  extra_description?: string;
  image: {
    id?: number;
    src?: string;
    alt?: string;
    title?: string;
    caption?: string;
    description?: string;
  } | null;
  meta_data?: {
    id?: number;
    key: string;
    value: any;
  }[];
}
