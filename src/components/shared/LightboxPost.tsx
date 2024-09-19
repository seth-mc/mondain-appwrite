import { useEffect, useState } from 'react';
import { useGetPostById, useUpdatePost } from "@/lib/react-query/queries";
import { multiFormatDateString } from "@/lib/utils";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { motion, AnimatePresence } from 'framer-motion';
import { deletePost } from "@/lib/appwrite/api";
import { useQueryClient } from "@tanstack/react-query";
import { IUpdatePost } from '@/types';

type LightboxPostProps = {
    postId: string | null;
    onClose: () => void;
    isAdmin: boolean;
    newToSite: boolean;
};

const LightboxPost = ({ postId, onClose, isAdmin }: LightboxPostProps) => {
    const { data: post, isLoading } = useGetPostById(postId || undefined);
    const updatePost = useUpdatePost();
    const queryClient = useQueryClient();
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [order, setOrder] = useState<number | null>(null);
    const [caption, setCaption] = useState('');
    const [location, setLocation] = useState('');
    const [tags, setTags] = useState('');
    //const [content, setContent] = useState('');

    useEffect(() => {
        if (post) {
            setOrder(post.order);
            setCaption(post.caption);
            setLocation(post.location);
            setTags(post.tags.join(', '));
            //setContent(post.content || '');
        }
    }, [post]);

    if (isLoading || !post) return null;

    const handleImageSwitch = (direction: 'next' | 'prev') => {
        if (direction === 'next') {
            setCurrentImageIndex((prevIndex) =>
                prevIndex === post.imageUrls.length - 1 ? 0 : prevIndex + 1
            );
        } else {
            setCurrentImageIndex((prevIndex) =>
                prevIndex === 0 ? post.imageUrls.length - 1 : prevIndex - 1
            );
        }
    };

    const handleDelete = async () => {
        console.log('Delete button clicked');
        if (!postId || !post) return;
        try {
            // Assuming the first image in the array is the main image
            const imageId = post.imageUrls[0].split('/').pop() || '';
            await deletePost(postId, imageId);
            console.log('Post deleted successfully');
            // Invalidate and refetch queries
            await queryClient.invalidateQueries({ queryKey: ["posts"] });
            await queryClient.invalidateQueries({ queryKey: ["infinitePosts"] });
            onClose();
        } catch (error) {
            console.error('Failed to delete post:', error);
        }
    };

    const handleSave = async () => {
        if (!postId) return;
    
        try {
            const updatedPost: IUpdatePost = {
                postId,
                caption,
                location,
                tags: tags.split(',').map(tag => tag.trim()),
                imageUrls: post.imageUrls,
                imageIds: post.imageIds || [], // Add this line
                category: post.category || '', // Add this line
                order: order || 0,
            };
    
            await updatePost.mutateAsync(updatedPost);
            onClose();
        } catch (error) {
            console.error('Failed to update post:', error);
        }
    };

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center overflow-y-auto"
                onClick={onClose}
            >
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.3 }}
                    className="bg-white rounded-lg max-w-5xl w-full mx-4 my-8 relative"
                    onClick={(e) => e.stopPropagation()}
                >
                    <button
                        onClick={onClose}
                        className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
                    >
                        <X size={24} />
                    </button>
                    <div className="grid grid-cols-2 gap-4 p-6">
                        <div className="relative">
                            <img
                                src={post.imageUrls[currentImageIndex]}
                                alt={post.caption}
                                className="w-full h-auto rounded-lg"
                            />
                            {post.imageUrls.length > 1 && (
                                <>
                                    <button
                                        onClick={() => handleImageSwitch('prev')}
                                        className="absolute top-1/2 left-2 transform -translate-y-1/2 bg-white rounded-full p-2"
                                    >
                                        <ChevronLeft />
                                    </button>
                                    <button
                                        onClick={() => handleImageSwitch('next')}
                                        className="absolute top-1/2 right-2 transform -translate-y-1/2 bg-white rounded-full p-2"
                                    >
                                        <ChevronRight />
                                    </button>
                                </>
                            )}
                        </div>
                        <div>
                            {isAdmin ? (
                                <>
                                    <input
                                        type="text"
                                        value={caption}
                                        onChange={(e) => setCaption(e.target.value)}
                                        className="text-2xl font-bold mb-2 w-full"
                                        placeholder="Caption"
                                    />
                                    <input
                                        type="text"
                                        value={location}
                                        onChange={(e) => setLocation(e.target.value)}
                                        className="text-gray-600 mb-2 w-full"
                                        placeholder="Location"
                                    />
                                    <input
                                        type="number"
                                        value={order || ''}
                                        onChange={(e) => setOrder(Number(e.target.value))}
                                        className="mb-4 w-full"
                                        placeholder="Order"
                                    />
                                    <input
                                        type="text"
                                        value={tags}
                                        onChange={(e) => setTags(e.target.value)}
                                        className="mb-4 w-full"
                                        placeholder="Tags (comma-separated)"
                                    />
                                    {/* <textarea
                                        value={content}
                                        onChange={(e) => setContent(e.target.value)}
                                        className="mb-4 w-full h-64"
                                        placeholder="Content"
                                    /> */}
                                    <button
                                        onClick={handleDelete}
                                        className="bg-red text-white px-4 py-2 rounded hover:bg-red-600 mr-2"
                                    >
                                        Delete Post
                                    </button>
                                    <button
                                        onClick={handleSave}
                                        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                                    >
                                        Save Changes
                                    </button>
                                </>
                            ) : (
                                <>
                                    <h2 className="text-2xl font-bold mb-2">{post.caption}</h2>
                                    <p className="text-gray-600 mb-2">{post.location}</p>
                                    <p className="mb-4">{multiFormatDateString(post.$createdAt)}</p>
                                    <div className="flex flex-wrap gap-2 mb-4">
                                        
                                        {post.tags.map((tag: string, index: number) => (
                                            <span key={index} className="bg-gray-200 rounded-full px-3 py-1 text-sm">
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                    {/* <div className="h-64 overflow-y-auto">
                                        <p>{post.content}</p>
                                    </div> */}
                                </>
                            )}
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default LightboxPost;