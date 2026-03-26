import { Models } from "appwrite";
import { useState } from "react";
import { useSavePost, useDeleteSavedPost } from "@/lib/react-query/queries";

type PostStatsProps = {
  post: Models.Document;
  userId: string;
};

const PostStats = ({ post, userId }: PostStatsProps) => {
  const savedPostRecord = post.saves?.find(
    (record: Models.Document) => record.$id === userId
  );

  const [isSaved, setIsSaved] = useState(savedPostRecord ? true : false);

  const { mutate: savePost } = useSavePost();
  const { mutate: deleteSavePost } = useDeleteSavedPost();

  const handleSavePost = (e: React.MouseEvent) => {
    e.stopPropagation();

    if (savedPostRecord) {
      setIsSaved(false);
      return deleteSavePost(savedPostRecord.$id);
    }

    savePost({ userId: userId, postId: post.$id });
    setIsSaved(true);
  };

  return (
    <div className="flex justify-between items-center z-20">
      <div className="flex gap-2">
        <img
          src={`/assets/icons/${isSaved ? "saved" : "save"}.svg`}
          alt="save"
          width={20}
          height={20}
          className="cursor-pointer"
          onClick={handleSavePost}
        />
      </div>
    </div>
  );
};

export default PostStats;
