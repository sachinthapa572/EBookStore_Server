export type QuerFilterOptions = {
  author: string;
  title: string;
  language: string;
  genre: string;
  publicationName: string;
  publishedAt: string;
  price: string;
  pageSize: number;
  pageNumber: number;
};

export interface BookDetails {
  _id: string;
  title: string;
  slug: string;
  description: string;
  language: string;
  publicationName: string;
  genre: string;
  publishedAt: string;
  price: Price;
  fileInfo: FileInfo;
  createdAt: string;
  updatedAt: string;
  author: {
    name: string;
    slug: string;
    _id: string;
  };
  cover: {
    id: string;
    url: string;
  };
}

interface Price {
  mrp: number;
  sale: number;
}

interface FileInfo {
  size: number;
  type: string;
  name: string;
}
