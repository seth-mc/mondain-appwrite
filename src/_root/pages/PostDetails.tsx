import { Loader } from "@/components/shared";
import { useParams } from 'react-router-dom';

import { useState, useEffect } from 'react';
import { useGetPostById } from "@/lib/react-query/queries";
import { multiFormatDateString } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";
//import { multiFormatDateString } from "@/lib/utils";

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
        <div className="flex lg:px-80 md:px-40 px-20 justify-center items-center md:items-start flex-initial">
          <div className="relative">
            {/* Assuming post.images is an array of image URLs */}
            <img
              className="rounded-t-3xl rounded-b-3xl"
              src={post?.imageUrls[currentImageIndex]}
              alt="user-post"
            />
            {post?.imageUrls.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={() => handleImageSwitch('prev')}
                  className="absolute w-12 top-1/2 left-2 transform -translate-y-1/2 text-white p-2 rounded-full text-2xl outline-none"
                >
                  <ChevronLeft />
                </button>
                <button
                  type="button"
                  onClick={() => handleImageSwitch('next')}
                  className="absolute w-12 top-1/2 right-2 transform -translate-y-1/2 text-white p-2 rounded-full text-2xl outline-none"
                >
                  <ChevronRight />
                </button>
              </>
            )}
          </div>
        </div>
        <div className="lg:px-80 md:px-40 px-20 w-full p-5 flex-1 xl:min-w-620">
          <div className="flex items-center">
            <div>
              <h1 className="text-4xl font-bold break-words mt-3">
                {post.caption}
              </h1>
              <div className="subtle-semibold  gap-2  py-2 text-light-3">
                {multiFormatDateString(post?.$createdAt)}
              </div>
              <p className="mt-3">{post.tags}</p>
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