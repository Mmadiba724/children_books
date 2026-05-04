export interface Book {
  id: number | string;
  title: string;
  author: string;
  isbn: string;
  description: string;
  price: number;
  format: string;
  coverImageUrl: string | null;
  fileId: string | null;
  stockQuantity: number;
  categoryNames: string[];
  previewSnippetUrls: string[];
  createdAt: string;
  updatedAt: string;
}
