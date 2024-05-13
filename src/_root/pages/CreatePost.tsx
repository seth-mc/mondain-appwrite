import PostForm from "@/components/forms/PostForm";
import { SquarePlus } from 'lucide-react';

const CreatePost = () => {
  return (
    <div className="text-dark-1 flex flex-1">
      <div className="common-container">
        <div className="max-w-5xl flex-start gap-3 justify-start w-full">
        <SquarePlus size={36}/>
          <h2 className="h3-bold md:h2-bold text-left w-full">Create Post</h2>
        </div>

        <PostForm action="Create" />
      </div>
    </div>
  );
};

export default CreatePost;
