import { Client, Graphql, Account, Databases, Storage, Avatars } from "appwrite";

export const appwriteConfig = {
    url: import.meta.env.VITE_APPWRITE_URL,
    appDomain: import.meta.env.VITE_APP_DOMAIN,
    appDomainTarget: import.meta.env.VITE_APP_DOMAIN_TARGET,
    projectId: import.meta.env.VITE_APPWRITE_PROJECT_ID,
    databaseId: import.meta.env.VITE_APPWRITE_DATABASE_ID,
    storageId: import.meta.env.VITE_APPWRITE_STORAGE_ID,
    userCollectionId: import.meta.env.VITE_APPWRITE_USER_COLLECTION_ID,
    postCollectionId: import.meta.env.VITE_APPWRITE_POST_COLLECTION_ID,
    savesCollectionId: import.meta.env.VITE_APPWRITE_SAVES_COLLECTION_ID,
    queuedPostsCollectionId: import.meta.env.VITE_APPWRITE_QUEUE_COLLECTION_ID,
    sparkCollectionId: import.meta.env.VITE_APPWRITE_SPARK_COLLECTION_ID,
  };
  

export const client = new Client();


client.setEndpoint(appwriteConfig.url);
client.setProject(appwriteConfig.projectId);

export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);
export const avatars = new Avatars(client);
export const graphql = new Graphql(client);