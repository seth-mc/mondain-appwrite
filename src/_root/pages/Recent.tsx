import { useState } from "react";
import { Loader, LightboxPost, Header, Sidebar } from "@/components/shared";
import { useGetRecentPosts } from "@/lib/react-query/queries";
import { DarkModeProps } from "@/types";
import { useUserContext } from "@/context/AuthContext";
import { Models } from "appwrite";
import { AnimatePresence, motion } from "framer-motion";
import { MapPin, Calendar } from "lucide-react";

type PostDocument = Models.Document & {
  caption?: string;
  imageUrls?: string[];
  location?: string;
  tags?: string[];
  category?: string;
  thumbnailUrl?: string;
  mediaType?: string;
  $createdAt?: string;
};

const Recent = ({ darkMode, isAdmin, toggleDarkMode }: DarkModeProps) => {
  const { data: recentPosts, isLoading } = useGetRecentPosts();
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [selectedPostIndex, setSelectedPostIndex] = useState<number | null>(null);
  const { isAuthenticated } = useUserContext();
  const newToSite = !isAuthenticated;

  const posts = recentPosts?.documents || [];

  const resetFilters = () => {
    // No filters to reset on Recent page, but keeping for consistency
  };

  const handlePostClick = (postId: string) => {
    const index = posts.findIndex((post: PostDocument) => post.$id === postId);
    setSelectedPostId(postId);
    setSelectedPostIndex(index);
  };

  const handleClose = () => {
    setSelectedPostId(null);
    setSelectedPostIndex(null);
    window.history.pushState(null, '', window.location.pathname);
  };

  const handleNext = () => {
    if (selectedPostIndex === null) return;
    const nextIndex = (selectedPostIndex + 1) % posts.length;
    setSelectedPostId(posts[nextIndex].$id);
    setSelectedPostIndex(nextIndex);
  };

  const handlePrevious = () => {
    if (selectedPostIndex === null) return;
    const prevIndex = (selectedPostIndex - 1 + posts.length) % posts.length;
    setSelectedPostId(posts[prevIndex].$id);
    setSelectedPostIndex(prevIndex);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <div className="flex-center w-full h-full">
        <Loader />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-light-1">
      <Sidebar darkMode={darkMode} />
      <Header 
        darkMode={darkMode} 
        isAdmin={isAdmin} 
        toggleDarkMode={toggleDarkMode} 
        resetFilters={resetFilters}
      />
      
      <main className="px-4 md:px-8 md:ml-64">
        <div className="max-w-screen-xl mx-auto py-8">
          <div className="pt-20 pb-10 flex flex-col items-center mb-12">
            <img src="/assets/icons/mondain-3.svg" alt="Mondain Logo" className="max-w-[200px]" />
          </div>

          <div className="space-y-6">
            {posts.length > 0 ? (
              posts.map((post: PostDocument, index: number) => {
                const isVideo = post.mediaType === 'video';
                const imageUrl = isVideo && post.thumbnailUrl ? post.thumbnailUrl : post.imageUrls?.[0];
                
                return (
                  <motion.div
                    key={post.$id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className="bg-light-1 rounded-lg shadow-sm border border-light-1/50 overflow-hidden hover:shadow-md transition-shadow duration-200 cursor-pointer"
                    onClick={() => handlePostClick(post.$id)}
                  >
                    <div className="flex">
                      {/* Image Section */}
                      <div className="w-64 h-48 flex-shrink-0 relative">
                        {imageUrl ? (
                          <img
                            src={imageUrl}
                            alt={post.caption || 'Post image'}
                            className="h-full rounded-lg object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                            <span className="text-gray-400">No image</span>
                          </div>
                        )}
                        {isVideo && (
                          <div className="absolute top-2 right-2 bg-black bg-opacity-70 text-white px-2 py-1 rounded text-xs">
                            VIDEO
                          </div>
                        )}
                      </div>

                      {/* Content Section */}
                      <div className="flex-1 p-6">
                        <div className="flex justify-between items-start mb-4">
                          <h3 className="text-xl font-mono font-semibold text-dark-1 line-clamp-2">
                            {post.caption || 'Untitled'}
                          </h3>
                          <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded uppercase tracking-wide">
                            {post.category || 'UNCATEGORIZED'}
                          </span>
                        </div>

                        <div className="space-y-3">
                          {post.location && (
                            <div className="flex items-center text-gray-600">
                              <MapPin className="w-4 h-4 mr-2" />
                              <span className="text-sm">{post.location}</span>
                            </div>
                          )}

                          {post.$createdAt && (
                            <div className="flex items-center text-gray-600">
                              <Calendar className="w-4 h-4 mr-2" />
                              <span className="text-sm">{formatDate(post.$createdAt)}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">No recent posts found</p>
              </div>
            )}
          </div>
        </div>
      </main>

      <AnimatePresence>
        {selectedPostId && (
          <LightboxPost
            postId={selectedPostId}
            newToSite={newToSite}
            isAdmin={isAdmin ?? false}
            onClose={handleClose}
            onNext={handleNext}
            onPrevious={handlePrevious}
            currentIndex={selectedPostIndex ?? 0}
            totalItems={posts.length}
            allPosts={posts}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default Recent;