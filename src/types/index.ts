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
  file: File[];
  thumbnail?: File;
  location?: string;
  tags?: string;
  imageSeo?: string;
  category: string;
};

export type IUpdatePost = {
  postId: string;
  caption: string;
  imageIds: string[];
  imageUrls: URL[];
  thumbnail?: URL;
  file: File[];
  location?: string;
  tags?: string;
  imageSeo?: string;
  category: string;
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
  searchedPosts: any;
};

export type DarkModeProps = {
  isAdmin: boolean;
  darkMode: boolean;
  toggleDarkMode: () => void;
};

export type Page = {
  documents: Document[];
};