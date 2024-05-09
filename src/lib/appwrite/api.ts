import { ID, Query } from "appwrite";

import { appwriteConfig, account, databases, storage, avatars, graphql } from "./config";
import { IUpdatePost, INewPost, INewUser, IUpdateUser } from "@/types";


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
    const session = await account.createEmailPasswordSession(user.email, user.password);

    return session;
  } catch (error) {
    console.log(error);
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
export async function createPost(post: INewPost) {
  try {
    // Upload files to Appwrite storage
    const uploadedFiles = await uploadFiles(post.file);

    let thumbnailUrl = null;
    if (post.thumbnail) {
      const uploadedThumbnail = await uploadFiles([post.thumbnail]);
      if (uploadedThumbnail.length > 0) {
        thumbnailUrl = getFilePreview(uploadedThumbnail[0].$id);
      }
    }

    if (uploadedFiles.length === 0) throw new Error("No files uploaded");

    // Get file URLs
    const fileUrls = uploadedFiles.map(file => getFilePreview(file.$id)).filter(url => url);
    if (fileUrls.length === 0) {
      uploadedFiles.forEach(file => deleteFile(file.$id));
      throw new Error("Failed to get file URLs");
    }


    // Convert tags into array
    const tags = post.tags?.replace(/ /g, "").split(",") || [];

    // Create post with multiple image URLs
    const newPost = await databases.createDocument(
      appwriteConfig.databaseId,
      appwriteConfig.postCollectionId,
      ID.unique(),
      {
        creator: post.userId,
        caption: post.caption,
        imageUrls: fileUrls,
        thumbnailUrl, // Save thumbnail URL
        imageIds: uploadedFiles.map(file => file.$id),
        location: post.location,
        tags,
        category: post.category
      }
    );

    if (!newPost) {
      uploadedFiles.forEach(file => deleteFile(file.$id));
      throw new Error("Failed to create new post");
    }

    return newPost;
  } catch (error) {
    console.error("Failed to create post:", error);
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
      2000,
      2000,
      "top",
      100
    );

    if (!fileUrl) throw Error;

    return fileUrl;
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
export async function searchPosts(searchTerm: string, activeCategory?: string) {
  try {
    if (!searchTerm) {
      if (activeCategory && activeCategory !== "") {
        const posts = await databases.listDocuments(
          appwriteConfig.databaseId,
          appwriteConfig.postCollectionId,
          [Query.search("category", activeCategory)]
        );
        return posts;
      }
    }

    const searchTermArray = [searchTerm.toLowerCase(), searchTerm.toUpperCase(), searchTerm.charAt(0).toUpperCase() + searchTerm.slice(1)];
    const posts = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.postCollectionId,
      [
        Query.or([
          Query.contains("caption", searchTermArray),
          Query.contains("tags", searchTermArray),
          Query.contains("location", searchTermArray),
          Query.contains("category", searchTermArray),
        ])
      ]
    );

    if (!posts) throw Error;

    return posts;
  } catch (error) {
    console.log(error);
  }
}


export async function getInfinitePosts({ pageParam }: { pageParam: number }) {
  const queries: any[] = [Query.orderDesc("$updatedAt"), Query.limit(9)];

  if (pageParam) {
    queries.push(Query.cursorAfter(pageParam.toString()));
  }

  try {
    const posts = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.postCollectionId,
      queries
    );

    if (!posts) throw Error;

    return posts;
  } catch (error) {
    console.log(error);
  }
}

// ============================== GET POST BY ID
export async function getPostById(postId?: string) {
  if (!postId) throw Error;

  try {
    const post = await databases.getDocument(
      appwriteConfig.databaseId,
      appwriteConfig.postCollectionId,
      postId
    );

    if (!post) throw Error;

    return post;
  } catch (error) {
    console.log(error);
  }
}

// ============================== UPDATE POST
export async function updatePost(post: IUpdatePost) {
  const hasFilesToUpdate = post.file.length > 0;

  try {
    let images = {
      imageUrls: post.imageUrls || [],
      imageIds: post.imageIds || [],
    };

    if (hasFilesToUpdate) {
      // Upload new files to Appwrite storage
      const uploadedFiles = await uploadFiles(post.file);
      if (uploadedFiles.length === 0) throw Error;

      // Get new file urls
      const newFileUrls = uploadedFiles.map(file => getFilePreview(file.$id));
      if (newFileUrls.length === 0) {
        uploadedFiles.forEach(file => deleteFile(file.$id));
        throw Error;
      }

      images = {
        imageUrls: [...images.imageUrls, ...newFileUrls],
        imageIds: [...images.imageIds, ...uploadedFiles.map(file => file.$id)],
      };
    }

    // Convert tags into array
    const tags = post.tags?.replace(/ /g, "").split(",") || [];

    // Update post with multiple image URLs
    const updatedPost = await databases.updateDocument(
      appwriteConfig.databaseId,
      appwriteConfig.postCollectionId,
      post.postId,
      {
        caption: post.caption,
        imageUrls: images.imageUrls,
        imageIds: images.imageIds,
        location: post.location,
        tags: tags,
      }
    );

    if (!updatedPost) {
      if (hasFilesToUpdate) {
        images.imageIds.forEach(id => deleteFile(id));
      }
      throw Error;
    }

    // Optionally delete old files if necessary
    // ...

    return updatedPost;
  } catch (error) {
    console.log(error);
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

// ============================== CREATE A QUEUED POST
export async function createQueuedPost(post: INewPost) {
  try {
    // Upload files to Appwrite storage
    const uploadedFiles = await uploadFiles(post.file);

    if (uploadedFiles.length === 0) throw Error;

    // Get file URLs
    const fileUrls = uploadedFiles.map(file => getFilePreview(file.$id)).filter(url => url);

    if (fileUrls.length === 0) {
      uploadedFiles.forEach(file => deleteFile(file.$id));
      throw Error;
    }

    // Convert tags into array
    const tags = post.tags?.replace(/ /g, "").split(",") || [];

    // Create post with multiple image URLs
    const newPost = await databases.createDocument(
      appwriteConfig.databaseId,
      appwriteConfig.queuedPostsCollectionId,
      ID.unique(),
      {
        creator: post.userId,
        caption: post.caption,
        imageUrls: fileUrls, // Storing multiple image URLs
        imageIds: uploadedFiles.map(file => file.$id), // Storing IDs of all uploaded files
        location: post.location,
        tags: tags,
        category: post.category
      }
    );

    if (!newPost) {
      uploadedFiles.forEach(file => deleteFile(file.$id));
      throw Error;
    }

    return newPost;
  } catch (error) {
    console.log(error);
  }
}

// ============================== FUNCTION TO MOVE POST FROM QUEUE TO MAIN POSTS COLLECTION
export async function transferPostToMain(postId: string) {
  // Add logic to move the post
}

// ============================================================
// USER
// ============================================================

// ============================== GET USERS
export async function getUsers(limit?: number) {
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
      const uploadedFile = await uploadFile(user.file[0]);
      if (!uploadedFile) throw Error;

      // Get new file url
      const fileUrl = getFilePreview(uploadedFile.$id);
      if (!fileUrl) {
        await deleteFile(uploadedFile.$id);
        throw Error;
      }

      image = { ...image, imageUrl: fileUrl, imageId: uploadedFile.$id };
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



// ============================================================
// SPARKS
// ============================================================

// ============================== CREATE SPARK
export async function createSpark(post: INewPost) {
  try {
    // Upload files to Appwrite storage
    const uploadedFiles = await uploadFiles(post.file);

    if (uploadedFiles.length === 0) throw Error;

    // Get file URLs
    const fileUrls = uploadedFiles.map(file => getFilePreview(file.$id)).filter(url => url);

    if (fileUrls.length === 0) {
      uploadedFiles.forEach(file => deleteFile(file.$id));
      throw Error;
    }

    // Convert tags into array
    const tags = post.tags?.replace(/ /g, "").split(",") || [];

    // Create post with multiple image URLs
    const newPost = await databases.createDocument(
      appwriteConfig.databaseId,
      appwriteConfig.postCollectionId,
      ID.unique(),
      {
        creator: post.userId,
        caption: post.caption,
        imageUrls: fileUrls, // Storing multiple image URLs
        imageIds: uploadedFiles.map(file => file.$id), // Storing IDs of all uploaded files
        location: post.location,
        tags: tags,
        category: post.category
      }
    );

    if (!newPost) {
      uploadedFiles.forEach(file => deleteFile(file.$id));
      throw Error;
    }

    return newPost;
  } catch (error) {
    console.log(error);
  }
}

// ============================== SEARCH SPARKS
export async function searchSparks(searchTerm: string, activeCategory?: string) {
  try {
    if (!searchTerm) {
      if (activeCategory && activeCategory !== "") {
        const posts = await databases.listDocuments(
          appwriteConfig.databaseId,
          appwriteConfig.postCollectionId,
          [Query.search("category", activeCategory)]
        );
        return posts;
      }
    }

    const posts = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.postCollectionId,
      [Query.search("caption", searchTerm)]
    );

    if (!posts) throw Error;

    return posts;
  } catch (error) {
    console.log(error);
  }
}

export async function getInfiniteSparks({ pageParam }: { pageParam: number }) {
  const queries: any[] = [Query.orderDesc("$updatedAt"), Query.limit(9)];

  if (pageParam) {
    queries.push(Query.cursorAfter(pageParam.toString()));
  }

  try {
    const posts = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.postCollectionId,
      queries
    );

    if (!posts) throw Error;

    return posts;
  } catch (error) {
    console.log(error);
  }
}

// ============================== GET POST BY ID
export async function getSparkById(postId?: string) {
  if (!postId) throw Error;

  try {
    const post = await databases.getDocument(
      appwriteConfig.databaseId,
      appwriteConfig.postCollectionId,
      postId
    );

    if (!post) throw Error;

    return post;
  } catch (error) {
    console.log(error);
  }
}

// ============================== UPDATE POST
export async function updateSpark(post: IUpdatePost) {
  const hasFilesToUpdate = post.file.length > 0;

  try {
    let images = {
      imageUrls: post.imageUrls || [],
      imageIds: post.imageIds || [],
    };

    if (hasFilesToUpdate) {
      // Upload new files to Appwrite storage
      const uploadedFiles = await uploadFiles(post.file);
      if (uploadedFiles.length === 0) throw Error;

      // Get new file urls
      const newFileUrls = uploadedFiles.map(file => getFilePreview(file.$id));
      if (newFileUrls.length === 0) {
        uploadedFiles.forEach(file => deleteFile(file.$id));
        throw Error;
      }

      images = {
        imageUrls: [...images.imageUrls, ...newFileUrls],
        imageIds: [...images.imageIds, ...uploadedFiles.map(file => file.$id)],
      };
    }

    // Convert tags into array
    const tags = post.tags?.replace(/ /g, "").split(",") || [];

    // Update post with multiple image URLs
    const updatedPost = await databases.updateDocument(
      appwriteConfig.databaseId,
      appwriteConfig.postCollectionId,
      post.postId,
      {
        caption: post.caption,
        imageUrls: images.imageUrls,
        imageIds: images.imageIds,
        location: post.location,
        tags: tags,
      }
    );

    if (!updatedPost) {
      if (hasFilesToUpdate) {
        images.imageIds.forEach(id => deleteFile(id));
      }
      throw Error;
    }

    // Optionally delete old files if necessary
    // ...

    return updatedPost;
  } catch (error) {
    console.log(error);
  }
}


// ============================== DELETE POST
export async function deleteSpark(postId?: string, imageId?: string) {
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

// ============================== SAVE POST
export async function saveSpark(userId: string, postId: string) {
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
export async function deleteSavedSpark(savedRecordId: string) {
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
