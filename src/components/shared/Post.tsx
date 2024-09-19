import { multiFormatDateString } from '@/lib/utils';
import { Models } from 'appwrite';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Icon } from 'lucide-react';
import SquareStack from './squareStack';



type PostProps = {
  post: Models.Document;
  newToSite?: boolean;
  dragHandleProps?: any;
}

const Post = ({ post, newToSite, dragHandleProps }: PostProps) => {
  const navigate = useNavigate();

  const { imageUrls, $id } = post;

  const handlePostClick = (e: React.MouseEvent) => {
    e.preventDefault();
    
      window.history.pushState(null, '', `#post-${$id}`);
      // Dispatch a custom event to notify the parent component
      window.dispatchEvent(new CustomEvent('postSelected', { detail: { postId: $id } }));
  };

  return (
    <motion.div
      layout
      className="m-3 animate-fade-in"
      {...dragHandleProps}
    >
      <div
        onClick={handlePostClick}
        className="relative w-auto shadow-md hover:shadow-lg rounded-xl overflow-hidden transition-all duration-500 ease-in-out"
      >
        {imageUrls && (
          <img
            className="rounded-xl w-full user-drag-none"
            style={{
              userDrag: 'none',
              WebkitUserDrag: 'none',
              userSelect: 'none',
              MozUserSelect: 'none',
              WebkitUserSelect: 'none',
              msUserSelect: 'none',
            }}
            src={imageUrls[0]}
            alt="user-post"
          />
        )}

        <div className="absolute top-0 left-0 mt-2 mr-2 flex justify-end">
          <div className="d lg:w-10 lg:h-10 md:w-12 md:h-12 sm:w-15 sm:h-15  w-12 h-12 p-2 flex items-center justify-center text-light-1 text-xl outline-none">
            {imageUrls.length > 1 && <Icon iconNode={SquareStack} />}

          </div>
        </div>
      </div>
      <div className="subtle-semibold  gap-2  py-2 text-light-3">
        {multiFormatDateString(post?.$createdAt)}
      </div>

    </motion.div>
  );
};

export default Post;
