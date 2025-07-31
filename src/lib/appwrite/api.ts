import { ID, Query, ImageGravity, Models } from "appwrite";

import { appwriteConfig, account, databases, storage, avatars, graphql } from "./config";
import { IUpdatePost, INewPost, INewUser, IUpdateUser, Page } from "@/types";
import { GifSettings } from "@/types/video";
import { mainCategories } from "@/constants";


// ============================================================
// AUTH
// ============================================================

// ============================== SIGN UP
export async function createUserAccount(user: INewUser) {
  try {
    const newAccount = await account.create(
      ID.unique(),
      user.email,
      user.password,
      user.name
    );

    if (!newAccount) throw Error;

    const avatarUrl = avatars.getInitials(user.name);


    const newUser = await saveUserToDB({
      accountId: newAccount.$id,
      name: newAccount.name,
      email: newAccount.email,
      username: user.username,
      imageUrl: avatarUrl,
    });

    return newUser;
  } catch (error) {
    console.log(error);
    return error;
  }
}

// ============================== SAVE USER TO DB
export async function saveUserToDB(user: {
  accountId: string;
  email: string;
  name: string;
  imageUrl: URL;
  username?: string;
}) {
  try {
    const newUser = await databases.createDocument(
      appwriteConfig.databaseId,
      appwriteConfig.userCollectionId,
      ID.unique(),
      user
    );

    return newUser;
  } catch (error) {
    console.log(error);
  }
}

// ============================== SIGN IN
export async function signInAccount(user: { email: string; password: string }) {
  try {
    // Create email/password session
    const session = await account.createEmailPasswordSession(user.email, user.password);
    return session;
  } catch (error) {
    console.error("SignIn Error:", error);
    throw error;
  }
}

// ============================== GET ACCOUNT
export async function getAccount() {
  try {
    const currentAccount = await account.get();

    return currentAccount;
  } catch (error) {
    console.log(error);
  }
}

// ============================== GET USER
export async function getCurrentUser() {
  try {
    const currentAccount = await getAccount();

    if (!currentAccount) throw Error;

    const currentUser = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.userCollectionId,
      [Query.equal("accountId", currentAccount.$id)]
    );

    if (!currentUser) throw Error;

    return currentUser.documents[0];
  } catch (error) {
    console.log(error);
    return null;
  }
}

// ============================== SIGN OUT
export async function signOutAccount() {
  try {
    const session = await account.deleteSession("current");

    return session;
  } catch (error) {
    console.log(error);
  }
}

// ============================================================
// POSTS
// ============================================================

// ============================== CREATE POST
export async function createPost(post: INewPost & { file?: File }) {
  try {
    let fileUrl = '';
    let uploadedFile;

    // If file is provided, upload it
    if (post.file) {
      uploadedFile = await storage.createFile(
        appwriteConfig.storageId,
        ID.unique(),
        post.file
      );

      if (!uploadedFile) throw Error;

      fileUrl = storage.getFileView(
        appwriteConfig.storageId,
        uploadedFile.$id
      ).toString();
    } else if (post.imageUrls && post.imageUrls.length > 0) {
      // If file is not provided but imageUrls are, use the first URL
      fileUrl = post.imageUrls[0];
    } else {
      throw Error("No file or image URL provided");
    }

    // Convert tags to array
    const tags = post.tags?.replace(/ /g, "").split(",") || [];

    // Handle empty thumbnailUrl
    const thumbnailUrl = post.thumbnailUrl === "" ? null : post.thumbnailUrl;

    console.log("Creating post with data:", {
      creator: [post.userId],
      caption: post.caption,
      imageUrls: post.imageUrls || [fileUrl],
      location: post.location,
      tags: tags,
      mediaType: post.mediaType || 'image',
      thumbnailUrl: thumbnailUrl,
      category: post.category
    });

    // Create post
    const newPost = await databases.createDocument(
      appwriteConfig.databaseId,
      appwriteConfig.postCollectionId,
      ID.unique(),
      {
        creator: post.userId,
        caption: post.caption,
        imageUrls: post.imageUrls || [fileUrl],
        location: post.location,
        tags: tags,
        mediaType: post.mediaType || 'image',
        thumbnailUrl: thumbnailUrl,
        category: post.category,
        shopifyProductId: post.shopifyProductId || null
      }
    );

    if (!newPost) {
      if (uploadedFile?.$id) {
        await storage.deleteFile(appwriteConfig.storageId, uploadedFile.$id);
      }
      throw Error;
    }

    return newPost;
  } catch (error) {
    console.error("Error in createPost:", error);
    throw error;
  }
}

// ============================== UPLOAD FILE
export async function uploadFiles(files: File[]) {
  try {
    const uploadPromises = files.map(file => 
      storage.createFile(appwriteConfig.storageId, ID.unique(), file)
    );
    const uploadedFiles = await Promise.all(uploadPromises);
    return uploadedFiles;
  } catch (error) {
    console.log(error);
    return [];
  }
}

// ============================== GET FILE URL
export function getFilePreview(fileId: string): string;
export function getFilePreview(fileIds: string[]): string[];
export function getFilePreview(fileIdOrIds: string | string[]) {
  if (Array.isArray(fileIdOrIds)) {
    return fileIdOrIds.map(id => getSingleFilePreview(id));
  } else {
    return getSingleFilePreview(fileIdOrIds);
  }
}

function getSingleFilePreview(fileId: string): string {
  try {
    const fileUrl = storage.getFilePreview(
      appwriteConfig.storageId,
      fileId,
      800,
      800,
      ImageGravity.Center,
      100
    );

    if (!fileUrl) throw Error;

    return fileUrl.toString(); // Convert URL to string
  } catch (error) {
    console.error(error);
    return ''; // Return a default value or handle the error as needed
  }
}


// ============================== DELETE FILE
export async function deleteFile(fileId: string) {
  try {
    await storage.deleteFile(appwriteConfig.storageId, fileId);

    return { status: "ok" };
  } catch (error) {
    (error);
  }
}

// ============================== SEARCH POSTS
export async function searchPosts(searchTerm: string, activeCategory?: string, pageParam?: string): Promise<Models.DocumentList<Models.Document>> {
  try {
    const queries: any[] = [
      Query.orderAsc("order"),  // Sort by order field first
      Query.orderDesc("$createdAt"),  // Then by creation date
      Query.limit(9)  // Same limit as getInfinitePosts
    ];

    if (pageParam) {
      queries.push(Query.cursorAfter(pageParam.toString()));
    }

    if (!searchTerm) {
      if (activeCategory && activeCategory !== "") {
        // Find the main category and its subcategories
        const mainCategory = mainCategories.find((cat: { name: string; subcategories: string[] }) => cat.name === activeCategory);
        if (mainCategory) {
          // Add category filter to the beginning of queries
          queries.unshift(
            Query.or(
              mainCategory.subcategories.map((subcat: string) => 
                Query.equal("category", subcat)
              )
            )
          );
        }
      }
    } else {
      const searchTermArray = [searchTerm.toLowerCase(), searchTerm.toUpperCase(), searchTerm.charAt(0).toUpperCase() + searchTerm.slice(1)];
      queries.unshift(
        Query.or([
          Query.contains("caption", searchTermArray),
          Query.contains("tags", searchTermArray),
          Query.contains("location", searchTermArray),
          Query.contains("category", searchTermArray),
        ])
      );
    }

    console.log('Executing search with queries:', JSON.stringify(queries, null, 2));

    const posts = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.postCollectionId,
      queries
    );

    if (!posts) {
      console.log('No posts returned from database');
      return { documents: [], total: 0 } as Models.DocumentList<Models.Document>;
    }

    console.log(`Search returned ${posts.documents.length} results`);
    return posts;
  } catch (error) {
    console.error('Search error:', error);
    // Return empty result instead of throwing
    return { documents: [], total: 0 } as Models.DocumentList<Models.Document>;
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function getInfinitePosts({ pageParam = 0 }: { pageParam?: any }): Promise<Page> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const queries: any[] = [
    Query.orderAsc("order"),  // Sort by order field first
    Query.orderDesc("$updatedAt"),  // Then by updatedAt
    Query.limit(9)
  ];
  if (pageParam) {
      queries.push(Query.cursorAfter(pageParam.toString()));
  }

  try {
      const posts = await databases.listDocuments(
          appwriteConfig.databaseId,
          appwriteConfig.postCollectionId,
          queries
      );

      // Assuming posts is always defined and handling when not
      if (!posts || !posts.documents) {
          return { documents: [], cursor: '' } as Page;  // Return an empty page structure
      }

      return {
          documents: posts.documents,
          cursor: posts.documents.length ? posts.documents[posts.documents.length - 1].$id : ''
      } as Page;  // Use type assertion here
  } catch (error) {
      console.error(error);
      return { documents: [], cursor: '' } as Page;  // Return an empty page structure in case of error
  }
}


// ============================== GET POST BY ID
export async function getPostById(postId?: string) {
  if (!postId) throw Error("Post ID is required");

  try {
    const post = await databases.getDocument(
      appwriteConfig.databaseId,
      appwriteConfig.postCollectionId,
      postId
    );

    if (!post) throw Error("Post not found");

    return post;
  } catch (error) {
    console.log(error);
    throw error;
  }
}

// ============================== UPDATE POST
export async function updatePost(post: IUpdatePost) {
  try {
    // Convert tags into array
    const tags = Array.isArray(post.tags) 
  ? post.tags 
  : (typeof post.tags === 'string' ? post.tags.replace(/ /g, "").split(",") : []);

    // Update post with image URLs
    const updatedPost = await databases.updateDocument(
      appwriteConfig.databaseId,
      appwriteConfig.postCollectionId,
      post.postId,
      {
        caption: post.caption,
        imageUrls: post.imageUrls,
        location: post.location,
        tags: tags,
        order: post.order,
        content: post.content,
        category: post.category,
        shopifyProductId: post.shopifyProductId || null,
      }
    );

    if (!updatedPost) {
      throw Error("Failed to update post");
    }

    return updatedPost;
  } catch (error) {
    console.log(error);
    throw error;
  }
}


// ============================== DELETE POST
export async function deletePost(postId?: string, imageId?: string) {
  if (!postId || !imageId) return;

  try {
    const statusCode = await databases.deleteDocument(
      appwriteConfig.databaseId,
      appwriteConfig.postCollectionId,
      postId
    );

    if (!statusCode) throw Error;

    await deleteFile(imageId);

    return { status: "Ok" };
  } catch (error) {
    console.log(error);
  }
}

// ============================== LIKE / UNLIKE POST
export async function likePost(postId: string, likesArray: string[]) {
  try {
    const updatedPost = await databases.updateDocument(
      appwriteConfig.databaseId,
      appwriteConfig.postCollectionId,
      postId,
      {
        likes: likesArray,
      }
    );

    if (!updatedPost) throw Error;

    return updatedPost;
  } catch (error) {
    console.log(error);
  }
}

// ============================== SAVE POST
export async function savePost(userId: string, postId: string) {
  try {
    const updatedPost = await databases.createDocument(
      appwriteConfig.databaseId,
      appwriteConfig.savesCollectionId,
      ID.unique(),
      {
        user: userId,
        post: postId,
      }
    );

    if (!updatedPost) throw Error;

    return updatedPost;
  } catch (error) {
    console.log(error);
  }
}
// ============================== DELETE SAVED POST
export async function deleteSavedPost(savedRecordId: string) {
  try {
    const statusCode = await databases.deleteDocument(
      appwriteConfig.databaseId,
      appwriteConfig.savesCollectionId,
      savedRecordId
    );

    if (!statusCode) throw Error;

    return { status: "Ok" };
  } catch (error) {
    console.log(error);
  }
}

// ============================== GET USER'S POST
export async function getUserPosts(userId?: string) {
  if (!userId) return;

  try {
    const post = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.postCollectionId,
      [Query.equal("creator", userId), Query.orderDesc("$createdAt")]
    );

    if (!post) throw Error;

    return post;
  } catch (error) {
    console.log(error);
  }
}

// ============================== GET POPULAR POSTS (BY HIGHEST LIKE COUNT)
export async function getRecentPosts() {
  try {
    const posts = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.postCollectionId,
      [Query.orderDesc("$createdAt"), Query.limit(5)]
    );

    if (!posts) throw Error;

    return posts;
  } catch (error) {
    console.log(error);
  }
}
// ============================== FUNCTION TO MOVE POST FROM QUEUE TO MAIN POSTS COLLECTION
/*export async function transferPostToMain(postId: string) {
  // Add logic to move the post
}*/

// ============================================================
// USER
// ============================================================

// ============================== GET USERS
export async function getUsers(limit?: number) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const queries: any[] = [Query.orderDesc("$createdAt")];

  if (limit) {
    queries.push(Query.limit(limit));
  }

  try {
    const users = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.userCollectionId,
      queries
    );

    if (!users) throw Error;

    return users;
  } catch (error) {
    console.log(error);
  }
}

// ============================== GET USER BY ID
export async function getUserById(userId: string) {
  try {
    const user = await databases.getDocument(
      appwriteConfig.databaseId,
      appwriteConfig.userCollectionId,
      userId
    );

    if (!user) throw Error;

    return user;
  } catch (error) {
    console.log(error);
  }
}

// ============================== UPDATE USER
export async function updateUser(user: IUpdateUser) {
  const hasFileToUpdate = user.file.length > 0;
  try {
    let image = {
      imageUrl: user.imageUrl,
      imageId: user.imageId,
    };

    if (hasFileToUpdate) {
      // Upload new file to appwrite storage
      const uploadedFile = await uploadFiles(user.file);
      if (!uploadedFile) throw Error;

      // Get new file url
      const fileUrl = getFilePreview(uploadedFile[0].$id);
      if (!fileUrl) {
        await deleteFile(uploadedFile[0].$id);
        throw Error;
      }

      image = { ...image, imageUrl: fileUrl, imageId: uploadedFile[0].$id };
    }

    //  Update user
    const updatedUser = await databases.updateDocument(
      appwriteConfig.databaseId,
      appwriteConfig.userCollectionId,
      user.userId,
      {
        name: user.name,
        bio: user.bio,
        imageUrl: image.imageUrl,
        imageId: image.imageId,
      }
    );

    // Failed to update
    if (!updatedUser) {
      // Delete new file that has been recently uploaded
      if (hasFileToUpdate) {
        await deleteFile(image.imageId);
      }
      // If no new file uploaded, just throw error
      throw Error;
    }

    // Safely delete old file after successful update
    if (user.imageId && hasFileToUpdate) {
      await deleteFile(user.imageId);
    }

    return updatedUser;
  } catch (error) {
    console.log(error);
  }
}

// ============================== CUSTOM SEARCH QUERY
export async function searchPostsGraphql(searchTerm: string) {
  const query = `query search($searchTerm: String!) {
    search(searchTerm: $searchTerm) {
      documents {
        caption
        tags
        imageSeo
        location
        imageUrls
        imageIds
        creator {
          name
          username
          imageUrl
        }
      }
    }
  }`;

  try {
    const response = await graphql.query({
      query,
      variables: { searchTerm }
    });
    return response;
  } catch (error) {
    console.error("GraphQL query error:", error);
    throw error;
  }
}

// Add new function for video processing
export async function processVideo(file: File, settings: GifSettings) {
  try {
    const formData = new FormData();
    formData.append('video', file);
    formData.append('settings', JSON.stringify(settings));

    const response = await fetch('/api/video/process', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Failed to process video');
    }

    const job = await response.json();
    return job;
  } catch (error) {
    console.error('Error processing video:', error);
    throw error;
  }
}