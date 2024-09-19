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

export type INewPost = {
  userId: string;
  caption: string;
  imageUrls: string[];
  location?: string;
  tags?: string;
  imageSeo?: string;
  category: string;
};

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
  order: number;
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  searchedPosts: any;

};

export type DarkModeProps = {
  darkMode: boolean;
  toggleDarkMode?: () => void;
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

export type DocumentType = {
  caption: string;
  tags: string[];
  location: string;
  imageUrls: string[];
  imageIds: string[];
  category: string;
  thumbnailUrl: string | null;
  $id: string;
  $createdAt: string;
  $updatedAt: string;
  $permissions: string[];
  creator: Creator;
  // add other properties if needed
};

export type PostPage = {
  documents: DocumentType[];
  // other properties...
};

export type PostsQueryResult = {
  pages: PostPage[];
  // other properties...
};