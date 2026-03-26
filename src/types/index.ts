import { Models } from "appwrite";

export type INavLink = {
  label: string;
  route: string;
};

export type IUpdateUser = {
  userId: string;
  name: string;
  bio: string;
  imageId: string;
  imageUrl: URL | string;
  file: File[];
};

export interface INewPost {
  userId: string;
  caption: string;
  file?: File;
  location?: string;
  tags?: string;
  mediaType?: string;
  thumbnailUrl?: string;
  videoUrl?: string;
  imageUrls?: string[];
  category?: string;
  shopifyProductId?: string;
}

export type IUpdatePost = {
  postId: string;
  caption: string;
  imageIds: string[];
  imageUrls: string[];
  location?: string;
  tags: string[] | string;
  content?: string;
  imageSeo?: string;
  category: string;
  order?: number;
  shopifyProductId?: string;
  quoteText?: string;
};

export type IUser = {
  id: string;
  name: string;
  username: string;
  email: string;
  imageUrl: string;
  bio: string;
  admin: boolean;
};

export type INewUser = {
  name: string;
  email: string;
  username: string;
  password: string;
};


export type SearchResultProps = {
  isSearchFetching: boolean;
  searchedPosts: Models.Document[];
};

export type DarkModeProps = {
  darkMode: boolean;
  toggleDarkMode: () => void;
  isAdmin?: boolean;
};


export type Document = {
  $id: string;
}

export type Page = {
    documents: Document[];
    cursor: string;  // or number, depending on how your cursor works
}


export type Creator = {
  name: string;
  username: string;
  accountId: string;
  email: string;
  bio: string | null;
  imageUrl: string;
  // add other properties if needed
};

export type DocumentType = Models.Document & {
  caption: string;
  tags: string[];
  location: string;
  imageUrls: string[];
  imageIds: string[];
  category: string;
  thumbnailUrl: string | null;
  shopifyProductId?: string;
  mediaType?: string;
  quoteText?: string;
  creator: Creator;
};

export type PostPage = {
  documents: DocumentType[];
  // other properties...
};

export type PostsQueryResult = {
  pages: PostPage[];
  // other properties...
};