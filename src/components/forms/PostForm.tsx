import * as z from "zod";
import { Models } from "appwrite";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import S3oosh from "@/components/shared/s3oosh";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Button,
  Input,
  Textarea,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui";
import { PostValidation } from "@/lib/validation";
import { useToast } from "@/components/ui/use-toast";
import { useUserContext } from "@/context/AuthContext";
import { Loader } from "@/components/shared";
import { useCreatePost, useUpdatePost } from "@/lib/react-query/queries";
import { categories } from "@/constants";
import { useState, useCallback } from "react";


type PostFormValues = z.infer<typeof PostValidation>;

type PostFormProps = {
  post?: Models.Document;
  action: "Create" | "Update";
};

interface OrderedUrl {
  url: string;
  order: number;
}

const PostForm = ({ post, action }: PostFormProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useUserContext();
  const [uploadedFileUrls, setUploadedFileUrls] = useState<OrderedUrl[]>(
    post?.imageUrls?.map((url: string, index: number) => ({ url, order: index })) || []
  );
  const [isUploading, setIsUploading] = useState(false);

  const form = useForm<PostFormValues>({
    resolver: zodResolver(PostValidation),
    defaultValues: {
      caption: post?.caption || "",
      imageUrls: post?.imageUrls || [],
      videoUrl: post?.videoUrl || "",
      thumbnailUrl: post?.thumbnailUrl || "",
      mediaType: post?.mediaType || "image",
      location: post?.location || "",
      tags: post?.tags?.join(",") || "",
      category: post?.category || "",
      shopifyProductId: post?.shopifyProductId || "",
    },
  });

  const handleUploadComplete = useCallback((urls: string[]) => {
    if (isUploading) return; // Prevent duplicate uploads
    
    console.log("handleUploadComplete called in PostForm with urls:", urls);
    setIsUploading(true);
    
    try {
      // Check if the uploaded file is a video
      const isVideo = urls.some(url => url.includes('.mp4') || url.includes('.mov') || url.includes('.webm'));
      
      if (isVideo) {
        const videoUrl = urls.find(url => !url.includes('.gif'));
        const thumbnailUrl = urls.find(url => url.includes('.gif'));
        
        form.setValue('videoUrl', videoUrl || '');
        form.setValue('thumbnailUrl', thumbnailUrl || '');
        form.setValue('mediaType', 'video');
        form.setValue('imageUrls', []);
      } else {
        // Create ordered array of URLs with their positions
        const orderedUrls: OrderedUrl[] = urls.map((url, index) => ({
          url,
          order: index
        }));
        
        setUploadedFileUrls(orderedUrls);
        form.setValue('imageUrls', urls);
        form.setValue('mediaType', 'image');
        form.setValue('videoUrl', '');
        form.setValue('thumbnailUrl', '');

        // Analyze the first image for tags and category
        if (urls.length > 0) {
          analyzeImage(urls[0]);
        }
      }
    } finally {
      setIsUploading(false);
    }
  }, [form, isUploading]);

  // Move analyzeImage outside the handleUploadComplete function
  const analyzeImage = async (imageUrl: string) => {
    try {
      const response = await fetch('http://localhost:3001/api/image/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ imageUrl }),
      });
      
      const data = await response.json();
      
      // Auto-fill the form fields with only the data we receive
      form.setValue('tags', data.tags.join(', '));
      form.setValue('caption', data.caption);
    } catch (error) {
      console.error('Error analyzing image:', error);
    }
  };

  const S3ooshConfig = {
    maxTotalFiles: 10,
    maxSize: 104857600,
    acceptedFileTypes: {
      "image/*": [".png", ".jpg", ".jpeg", ".gif"],
      "video/*": [".mp4", ".mov", ".avi", ".mkv", ".webm", ".quicktime"],
    },
  };

  const { mutateAsync: createPost, isPending: isPendingCreate } = useCreatePost();
  const { mutateAsync: updatePost, isPending: isPendingUpdate } = useUpdatePost();

  const handleSubmit = async (values: PostFormValues) => {
    if (isUploading) {
      toast({ title: "Please wait for the upload to complete", variant: "destructive" });
      return;
    }

    try {
      if (action === "Update" && post) {
        const updatedPost = await updatePost({
          ...values,
          postId: post.$id,
          imageIds: post.imageId,
          imageUrls: uploadedFileUrls.map(item => item.url),
        });

        if (updatedPost) {
          toast({ title: "Post updated successfully" });
          navigate(`/posts/${post.$id}`);
        }
      } else {
        // Get the first image URL
        const firstImageUrl = uploadedFileUrls[0]?.url;
        if (!firstImageUrl) {
          toast({ title: "Please upload at least one image", variant: "destructive" });
          return;
        }

        console.log("Submitting post with values:", {
          userId: user.id,
          caption: values.caption,
          location: values.location,
          tags: values.tags,
          mediaType: values.mediaType,
          thumbnailUrl: values.thumbnailUrl,
          imageUrls: uploadedFileUrls.map(item => item.url),
          category: values.category
        });

        const newPost = await createPost({
          userId: user.id,
          caption: values.caption,
          location: values.location,
          tags: values.tags,
          mediaType: values.mediaType,
          thumbnailUrl: values.thumbnailUrl,
          imageUrls: uploadedFileUrls.map(item => item.url),
          category: values.category,
          shopifyProductId: values.shopifyProductId
        });

        if (newPost) {
          toast({ title: "Post created successfully" });
          navigate("/");
        } else {
          toast({ title: "Failed to create post", variant: "destructive" });
        }
      }
    } catch (error) {
      console.error("Error submitting post:", error);
      toast({ title: `Failed to ${action.toLowerCase()} post. Please try again.`, variant: "destructive" });
    }
  };



  return (
    <Form {...form}>
      <form 
        onSubmit={(e) => {
          e.preventDefault();
          console.log("Form submitted");
          form.handleSubmit((values) => {
            console.log("Form values:", values);
            handleSubmit(values);
          })(e);
        }} 
        className="flex flex-col gap-9 w-full max-w-5xl"
      >
        {/* Caption Field */}
        <FormField
          control={form.control}
          name="caption"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="shad-form_label">Caption</FormLabel>
              <FormControl>
                <Textarea className="shad-textarea custom-scrollbar" {...field} />
              </FormControl>
              <FormMessage className="shad-form_message" />
            </FormItem>
          )}
        />

        {/* File Upload Field */}
        <FormField
          control={form.control}
          name="imageUrls"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Add Photos</FormLabel>
              <FormControl>
                <S3oosh
                  config={S3ooshConfig}
                  dirInBucket='uploads'
                  onUploadComplete={handleUploadComplete}  // This line has been updated
                  initialUrls={field.value || []}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Location Field */}
        <FormField
          control={form.control}
          name="location"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="shad-form_label">Add Location</FormLabel>
              <FormControl>
                <Input type="text" className="shad-input" {...field} />
              </FormControl>
              <FormMessage className="shad-form_message" />
            </FormItem>
          )}
        />

        {/* Tags Field */}
        <FormField
          control={form.control}
          name="tags"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="shad-form_label">Add Tags (separated by comma " , ")</FormLabel>
              <FormControl>
                <Input placeholder="Art, Expression, Learn" type="text" className="shad-input" {...field} />
              </FormControl>
              <FormMessage className="shad-form_message" />
            </FormItem>
          )}
        />

        {/* Category Field */}
        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="shad-form_label">Category</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {categories.map((item, index) => (
                    <SelectItem key={index} value={item.name} className="text-base border-0 outline-none capitalize">{item.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Shopify Product ID Field - Only for Admins */}
        {user.admin && (
          <FormField
            control={form.control}
            name="shopifyProductId"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="shad-form_label">Shopify Product ID (Optional)</FormLabel>
                <FormControl>
                  <Input 
                    type="text" 
                    className="shad-input" 
                    placeholder="Enter Shopify product handle or ID"
                    {...field} 
                  />
                </FormControl>
                <FormMessage className="shad-form_message" />
                <p className="text-xs text-gray-500 mt-1">
                  Connect this post to a Shopify product to enable purchasing
                </p>
              </FormItem>
            )}
          />
        )}

        {/* Submit and Cancel Buttons */}
        <div className="flex gap-4 items-center justify-end">
          <Button type="button" className="shad-button_primary" onClick={() => navigate(-1)}>
            Cancel
          </Button>
          <Button
            type="submit"
            className="shad-button_dark_4 whitespace-nowrap"
            disabled={isPendingCreate || isPendingUpdate}
          >
            {(isPendingCreate || isPendingUpdate) && <Loader />}
            {action} Post
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default PostForm;