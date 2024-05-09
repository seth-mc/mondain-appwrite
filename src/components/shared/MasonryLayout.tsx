import Masonry from 'react-masonry-css';
import { Post } from '@/components/shared';
import { Models } from 'appwrite';

type PostsProps = {
  posts: Models.Document[];
  newToSite: boolean;
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
  return (
    <Masonry className="d flex animate-slide-fwd" breakpointCols={breakpointColumnsObj}>
      {posts?.map((post: Models.Document) => (
        <Post newToSite={newToSite} key={post.$id} post={post} />
      ))}
    </Masonry>
  );
};

export default MasonryLayout;
