import React, { useEffect, useState } from 'react';
import Masonry from 'react-masonry-css';
import { Post } from '@/components/shared';
import { Models } from 'appwrite';

type PostsProps = {
  posts: Models.Document[];
  newToSite?: boolean;
};

const breakpointColumnsObj = {
  default: 4,
  3000: 5,
  2000: 4,
  1200: 3,
  1000: 2,
  500: 1,
};

const MasonryLayout = ({ newToSite, posts }: PostsProps) => {
  const [visiblePosts, setVisiblePosts] = useState<Models.Document[]>([]);
  const [renderedPostIds, setRenderedPostIds] = useState<string[]>([]);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const staggerPosts = (index: number) => {
      if (index < posts.length) {
        const post = posts[index];
        if (!renderedPostIds.includes(post.$id)) {
          timeoutId = setTimeout(() => {
            setVisiblePosts((prevVisiblePosts) => [...prevVisiblePosts, post]);
            setRenderedPostIds((prevRenderedPostIds) => [...prevRenderedPostIds, post.$id]);
            if (index + 1 < posts.length && !renderedPostIds.includes(posts[index + 1].$id)) {
              setVisiblePosts((prevVisiblePosts) => [...prevVisiblePosts, posts[index + 1]]);
              setRenderedPostIds((prevRenderedPostIds) => [...prevRenderedPostIds, posts[index + 1].$id]);
            }
            if (index + 2 < posts.length && !renderedPostIds.includes(posts[index + 2].$id)) {
              setVisiblePosts((prevVisiblePosts) => [...prevVisiblePosts, posts[index + 2]]);
              setRenderedPostIds((prevRenderedPostIds) => [...prevRenderedPostIds, posts[index + 2].$id]);
            }
            staggerPosts(index + 1);
          }, 500);
        } else {
          staggerPosts(index + 1);
        }
      }
    };

    staggerPosts(0);

    return () => clearTimeout(timeoutId);
  }, [posts, renderedPostIds]);

  return (
    <Masonry className="d flex animate-slide-fwd" breakpointCols={breakpointColumnsObj}>
      {visiblePosts.map((post: Models.Document) => (
        <Post newToSite={newToSite} key={post.$id} post={post} />
      ))}
    </Masonry>
  );
};

export default MasonryLayout;
