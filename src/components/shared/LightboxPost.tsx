import React, { useEffect, useState } from 'react';
import { Models } from 'appwrite';
import { motion, AnimatePresence } from 'framer-motion';
import { appwriteConfig, databases } from '@/lib/appwrite/config';

type LightboxPostProps = {
  postId: string;
  newToSite: boolean;
  isAdmin: boolean;
  onClose: () => void;
  onNext: () => void;
  onPrevious: () => void;
  currentIndex: number;
  totalItems: number;
  allPosts: Models.Document[];
}

const LightboxPost = ({ 
  postId, 
  onClose, 
  onNext, 
  onPrevious,
  allPosts
}: LightboxPostProps) => {
  const [post, setPost] = React.useState<Models.Document | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [allImages, setAllImages] = useState<{url: string, postId: string}[]>([]);
  const [currentGlobalIndex, setCurrentGlobalIndex] = useState(0);
  const [aspectRatio, setAspectRatio] = useState<string>('4/5');
  const [imageLoaded, setImageLoaded] = useState(false);

  // Create a flat array of all images across all posts
  useEffect(() => {
    const images = allPosts.flatMap(post => 
      post.imageUrls.map((url: string) => ({ url, postId: post.$id }))
    );
    setAllImages(images);
    
    // Find the current global index
    const globalIndex = images.findIndex(img => 
      img.postId === postId && img.url === post?.imageUrls[currentImageIndex]
    );
    if (globalIndex !== -1) {
      setCurrentGlobalIndex(globalIndex);
    }
  }, [allPosts, postId, post, currentImageIndex]);

  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.target as HTMLImageElement;
    const width = img.naturalWidth;
    const height = img.naturalHeight;
    
    if (width > height) {
      // Horizontal image
      setAspectRatio('5/4');
    } else if (width < height) {
      // Vertical image
      setAspectRatio('4/5');
    } else {
      // Square image
      setAspectRatio('1/1');
    }
    setImageLoaded(true);
  };

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const response = await databases.getDocument(
          appwriteConfig.databaseId,
          appwriteConfig.postCollectionId,
          postId
        );
        setPost(response);
      } catch (error) {
        console.error('Error fetching post:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPost();
  }, [postId]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowRight') {
        handleNextImage();
      } else if (e.key === 'ArrowLeft') {
        handlePreviousImage();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, currentGlobalIndex, allImages]);

  const handleNextImage = () => {
    if (currentGlobalIndex < allImages.length - 1) {
      const nextImage = allImages[currentGlobalIndex + 1];
      if (nextImage.postId !== postId) {
        // If we're moving to a new post, update the post
        setPost(allPosts.find(p => p.$id === nextImage.postId) || null);
        setCurrentImageIndex(0);
        onNext();
      } else {
        // If we're staying in the same post, just update the image index
        setCurrentImageIndex(prev => prev + 1);
      }
      setCurrentGlobalIndex(prev => prev + 1);
      setImageLoaded(false);
    }
  };

  const handlePreviousImage = () => {
    if (currentGlobalIndex > 0) {
      const prevImage = allImages[currentGlobalIndex - 1];
      if (prevImage.postId !== postId) {
        // If we're moving to a new post, update the post
        setPost(allPosts.find(p => p.$id === prevImage.postId) || null);
        const prevPost = allPosts.find(p => p.$id === prevImage.postId);
        setCurrentImageIndex(prevPost ? prevPost.imageUrls.length - 1 : 0);
        onPrevious();
      } else {
        // If we're staying in the same post, just update the image index
        setCurrentImageIndex(prev => prev - 1);
      }
      setCurrentGlobalIndex(prev => prev - 1);
      setImageLoaded(false);
    }
  };

  if (isLoading || !post) return null;

  const isVideo = post.mediaType === 'video';
  const { imageUrls, thumbnailUrl } = post;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/80"
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            onClose();
          }
        }}
      >
        <motion.div
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          exit={{ scale: 0.8 }}
          transition={{ duration: 0.3 }}
          className="relative max-w-4xl w-full mx-4"
        >
          <div className="d relative flex items-center justify-center" style={{ aspectRatio }}>
            {isVideo && thumbnailUrl ? (
              <img
                src={thumbnailUrl}
                alt="video-thumbnail"
                onLoad={handleImageLoad}
                className="w-[50%] h-[50%] object-contain"
                style={{
                  opacity: imageLoaded ? 1 : 0,
                  transition: 'opacity 0.3s ease-in-out'
                }}
              />
            ) : (
              <img
                src={imageUrls[currentImageIndex]}
                alt="user-post"
                onLoad={handleImageLoad}
                className="d w-[50%] h-[50%] object-contain"
                style={{
                  opacity: imageLoaded ? 1 : 0,
                  transition: 'opacity 0.3s ease-in-out'
                }}
              />
            )}
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            className="absolute top-4 right-4 z-50 text-white hover:text-gray-300"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-8 w-8"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>

          <div className="absolute bottom-4 left-4 text-white">
            {currentGlobalIndex + 1} / {allImages.length}
          </div>

          <button
            onClick={handlePreviousImage}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:text-gray-300"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-8 w-8"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>

          <button
            onClick={handleNextImage}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:text-gray-300"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-8 w-8"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default LightboxPost;