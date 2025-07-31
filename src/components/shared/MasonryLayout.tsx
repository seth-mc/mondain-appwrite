import { useState, useEffect } from 'react';
import Masonry from 'react-masonry-css';
import { Post, LightboxPost } from '@/components/shared';
import { Models } from 'appwrite';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { AnimatePresence } from 'framer-motion';
import { DropResult } from '@hello-pangea/dnd';
import { useUpdatePost } from '@/lib/react-query/queries';

type PostDocument = Models.Document & {
  caption?: string;
  imageIds?: string[];
  imageUrls?: string[];
  location?: string;
  tags?: string[];
  category?: string;
  order?: number;
};

type PostsProps = {
  posts: Models.Document[];
  newToSite?: boolean;
  isAdmin?: boolean;
};

const breakpointColumnsObj = {
  default: 3,
  3000: 4,
  2000: 3,
  1200: 3,
  1000: 2,
  500: 1,
};

const MasonryLayout = ({ newToSite, posts, isAdmin = true }: PostsProps) => {
  const [orderedPosts, setOrderedPosts] = useState<PostDocument[]>(posts);
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [selectedPostIndex, setSelectedPostIndex] = useState<number | null>(null);
  const { mutateAsync: updatePost } = useUpdatePost();

  useEffect(() => {
    const handlePostSelected = (e: CustomEvent) => {
      const postId = e.detail.postId;
      const index = orderedPosts.findIndex(post => post.$id === postId);
      setSelectedPostId(postId);
      setSelectedPostIndex(index);
    };
    window.addEventListener('postSelected', handlePostSelected as EventListener);
    return () => window.removeEventListener('postSelected', handlePostSelected as EventListener);
  }, [orderedPosts]);

  useEffect(() => {
    // Ensure all posts have order values, assign them if missing
    const postsWithOrder = posts.map((post, index) => ({
      ...post,
      order: post.order !== undefined ? post.order : index
    }));
    
    // Sort by order field to ensure proper ordering
    const sortedPosts = postsWithOrder.sort((a, b) => (a.order || 0) - (b.order || 0));
    
    console.log('Posts loaded with order:', sortedPosts.map(p => ({ id: p.$id, order: p.order })));
    setOrderedPosts(sortedPosts as PostDocument[]);
  }, [posts]);

  const handleClose = () => {
    setSelectedPostId(null);
    setSelectedPostIndex(null);
    window.history.pushState(null, '', window.location.pathname);
  };

  const handleNext = () => {
    if (selectedPostIndex === null) return;
    const nextIndex = (selectedPostIndex + 1) % orderedPosts.length;
    setSelectedPostId(orderedPosts[nextIndex].$id);
    setSelectedPostIndex(nextIndex);
  };

  const handlePrevious = () => {
    if (selectedPostIndex === null) return;
    const prevIndex = (selectedPostIndex - 1 + orderedPosts.length) % orderedPosts.length;
    setSelectedPostId(orderedPosts[prevIndex].$id);
    setSelectedPostIndex(prevIndex);
  };

  const onDragEnd = async (result: DropResult) => {
    if (!result.destination || !isAdmin) return;
    
    const sourceIndex = result.source.index;
    const destinationIndex = result.destination.index;
    
    if (sourceIndex === destinationIndex) return;
  
    const items = Array.from(orderedPosts);
    const [reorderedItem] = items.splice(sourceIndex, 1);
    items.splice(destinationIndex, 0, reorderedItem);

    // Update the order of all posts based on their new positions
    const updatedItems = items.map((item, index) => ({
      ...item,
      order: index
    }));

    // Optimistically update the UI
    setOrderedPosts(updatedItems);

    // Only update posts whose order actually changed
    try {
      const postsToUpdate = [];
      
      // Determine the range of posts that need updating
      const startIndex = Math.min(sourceIndex, destinationIndex);
      const endIndex = Math.max(sourceIndex, destinationIndex);
      
      for (let i = startIndex; i <= endIndex; i++) {
        const item = updatedItems[i];
        if (item.order !== orderedPosts[i]?.order) {
          postsToUpdate.push({
            postId: item.$id,
            caption: item.caption || '',
            imageIds: item.imageIds || [],
            imageUrls: item.imageUrls || [],
            location: item.location || '',
            tags: item.tags || [],
            order: i,
            category: item.category || ''
          });
        }
      }

      console.log(`Updating ${postsToUpdate.length} posts with new order`);
      
      await Promise.all(
        postsToUpdate.map(updateData => updatePost(updateData))
      );
      
      console.log('Order update completed successfully');
    } catch (error) {
      console.error('Error updating post order:', error);
      // Revert optimistic update on error
      setOrderedPosts(orderedPosts);
    }
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Droppable droppableId="posts" type="COLUMN">
        {(provided) => (
          <div {...provided.droppableProps} ref={provided.innerRef}>
            <Masonry
              breakpointCols={breakpointColumnsObj}
              className="flex animate-slide-fwd"
              columnClassName="my-masonry-grid_column"
            >
              {orderedPosts.map((post, index) => (
                post && post.$id ? (
                  <Draggable key={post.$id} draggableId={post.$id} index={index} isDragDisabled={!isAdmin}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        style={{
                          ...provided.draggableProps.style,
                          opacity: snapshot.isDragging ? 0.5 : 1,
                        }}
                      >
                        <Post
                          newToSite={newToSite}
                          post={post}
                          dragHandleProps={provided.dragHandleProps}
                          isAdmin={isAdmin}
                          delay={index * 0.15}
                          isSelected={post.$id === selectedPostId}
                        />
                      </div>
                    )}
                  </Draggable>
                ) : null
              ))}
            </Masonry>
            {provided.placeholder}
          </div>
        )}
      </Droppable>
      <AnimatePresence>
        {selectedPostId && (
          <LightboxPost
            postId={selectedPostId}
            newToSite={newToSite ?? false}
            isAdmin={isAdmin}
            onClose={handleClose}
            onNext={handleNext}
            onPrevious={handlePrevious}
            currentIndex={selectedPostIndex ?? 0}
            totalItems={orderedPosts.length}
            allPosts={orderedPosts}
          />
        )}
      </AnimatePresence>
    </DragDropContext>
  );
}

export default MasonryLayout;