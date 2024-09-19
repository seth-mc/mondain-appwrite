import { useState, useEffect } from 'react';
import Masonry from 'react-masonry-css';
import { Post, LightboxPost } from '@/components/shared';
import { Models } from 'appwrite';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { AnimatePresence } from 'framer-motion';

type PostsProps = {
  posts: Models.Document[];
  newToSite?: boolean;
  isAdmin?: boolean;
};

const breakpointColumnsObj = {
  default: 4,
  3000: 5,
  2000: 4,
  1200: 3,
  1000: 2,
  500: 1,
};

const MasonryLayout = ({ newToSite, posts, isAdmin = true }: PostsProps) => {
  const [orderedPosts, setOrderedPosts] = useState<Models.Document[]>(posts);
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);

  useEffect(() => {
    const handlePostSelected = (e: CustomEvent) => {
      setSelectedPostId(e.detail.postId);
    };
    window.addEventListener('postSelected', handlePostSelected as EventListener);
    return () => window.removeEventListener('postSelected', handlePostSelected as EventListener);
  }, []);

  useEffect(() => {
    setOrderedPosts(posts);
  }, [posts]);

  const onDragEnd = (result) => {
    if (!result.destination || !isAdmin) return;

    const items = Array.from(orderedPosts);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setOrderedPosts(items);
    // TODO: Implement API call to update order in the database
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
                      />
                    </div>
                  )}
                </Draggable>
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
            newToSite={newToSite}
            isAdmin={isAdmin}
            onClose={() => {
              setSelectedPostId(null);
              window.history.pushState(null, '', window.location.pathname);
            }}
          />
        )}
      </AnimatePresence>
    </DragDropContext>
  );
}

export default MasonryLayout;