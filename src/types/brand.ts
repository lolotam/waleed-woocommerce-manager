
export interface Brand {
  id: number;
  name: string;
  slug: string;
  description: string;
  image: {
    id: number;
    date_created: string;
    date_created_gmt: string;
    date_modified: string;
    date_modified_gmt: string;
    src: string;
    name: string;
    alt: string;
    title?: string;
    caption?: string;
  } | null;
  count: number;
  meta_data?: {
    id: number;
    key: string;
    value: any;
  }[];
}

export interface BrandFormData {
  name: string;
  slug: string;
  description: string;
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
