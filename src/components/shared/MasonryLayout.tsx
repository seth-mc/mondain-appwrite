import Masonry from 'react-masonry-css';
import { Post } from '@/components/shared';
import { Models } from 'appwrite';

type PostsProps = {
  posts: Models.Document[];
};

const breakpointColumnsObj = {
  default: 4,
  3000: 6,
  2000: 5,
  1200: 3,
  1000: 2,
  500: 1,
};

const MasonryLayout = ({ posts }: PostsProps) => {
  return (
    <Masonry className="flex animate-slide-fwd" breakpointCols={breakpointColumnsObj}>
      {posts?.map((post: Models.Document) => (
        <Post key={post.$id} post={post} />
      ))}
    </Masonry>
  );
};

export default MasonryLayout;
