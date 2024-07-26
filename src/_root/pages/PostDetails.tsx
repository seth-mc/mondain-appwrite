import { Loader } from "@/components/shared";
import { useParams } from 'react-router-dom';

import { useState, useEffect } from 'react';
import { useGetPostById } from "@/lib/react-query/queries";
import { multiFormatDateString } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";
//import { multiFormatDateString } from "@/lib/utils";
import { motion } from "framer-motion";

const PostDetails = () => {
  const { id } = useParams();

  const { data: post, isLoading } = useGetPostById(id);

  // Preload images
  useEffect(() => {
    post?.imageUrls.forEach((url: string) => {
      const img = new Image();
      img.src = url;
    });
  }, [post?.imageUrls]);

  const [tagColors, setTagColors] = useState<{ [key: string]: string }>({});

  const getTagColor = (tag: string) => {
    if (tagColors[tag]) {
      return tagColors[tag];
    } else {
      setTagColors(prevState => ({ ...prevState, [tag]: "bg-blue-500" }));
      return "bg-blue-500";
    }
  };


  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const handleImageSwitch = (direction: 'next' | 'prev') => {
    if (direction === 'next') {
      setCurrentImageIndex((prevIndex) => prevIndex === post?.imageUrls.length - 1 ? 0 : prevIndex + 1);
    } else {
      setCurrentImageIndex((prevIndex) => prevIndex === 0 ? post?.imageUrls.length - 1 : prevIndex - 1);
    }
  };


  if (isLoading || !post) {
    return <Loader />;
  }

  return (
    <>
      <div className="flex flex-col m-auto bg-light-1" style={{ maxWidth: '1000px', borderRadius: '32px' }}>
      <div className="lg:px-80 md:px-40 px-20 w-full p-5 flex-1 xl:min-w-620">
  <div className="flex items-center">
      
      <div className="subtle-semibold gap-2 py-2 text-light-3">
        {multiFormatDateString(post?.$createdAt)}
      </div>
      <div className="flex flex-wrap gap-2 mt-3">
        {post.tags.map((tag, index) => (
          <div
            key={index}
            className={`rounded-xl px-4 py-2 text-white font-semibold ${getTagColor(tag)}`}
          >
            {tag}
          </div>
        ))}
      </div>
    </div>
  </div>

<div className="flex lg:px-80 md:px-40 sm:px-20 px-10 justify-center items-center md:items-start flex-initial">
  <div className="relative">
    {/* Assuming post.images is an array of image URLs */}
    <img
      className="rounded-t-3xl rounded-b-3xl sm:p-0 p-5"
      src={post?.imageUrls[currentImageIndex]}
      alt="user-post"
    />
    {/* ... Rest of your component ... */}
  </div>
</div>
        <div className="lg:px-80 md:px-40 px-20 w-full p-5 flex-1 xl:min-w-620">
          <div className="flex items-center">
            <div>
            <motion.h1
        className="text-4xl font-bold break-words mt-3"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {post.caption}
      </motion.h1>
              <div className="subtle-semibold  gap-2  py-2 text-light-3">
                {multiFormatDateString(post?.$createdAt)}
              </div>
             
            </div>
          </div>
          {/* ... Rest of your component ... */}
        </div>
      </div>
      {/* ... Rest of your component, like related posts ... */}
      {/*{relatedPosts && relatedPosts.length > 0 && (
        <MasonryLayout posts={relatedPosts} />
      )}*/}
    </>
  );
};

export default PostDetails;