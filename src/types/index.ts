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
    location?: string;
    tags?: string;
    imageSeo?: string;
    category: string;
    scheduledDate: string;
  };
  
  export type IUpdatePost = {
    postId: string;
    caption: string;
    imageIds: string[];
    imageUrls: URL[];
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
    labels: string[];
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
    darkMode: boolean, 
    toggleDarkMode: () => void;
  };
