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
import { useState } from "react";


type PostFormValues = z.infer<typeof PostValidation>;

type PostFormProps = {
  post?: Models.Document;
  action: "Create" | "Update";
};

const PostForm = ({ post, action }: PostFormProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useUserContext();
  const [uploadedFileUrls, setUploadedFileUrls] = useState<string[]>(post?.imageUrls || []);

  const form = useForm<PostFormValues>({
    resolver: zodResolver(PostValidation),
    defaultValues: {
      caption: post?.caption || "",
      imageUrls: post?.imageUrls || [],
      location: post?.location || "",
      tags: post?.tags?.join(",") || "",
      category: post?.category || "",
    },
  });

  const handleUploadComplete = (urls: string[]) => {
    console.log("handleUploadComplete called in PostForm with urls:", urls);
    setUploadedFileUrls(urls);
    form.setValue('imageUrls', urls);
  };

  const S3ooshConfig = {
    maxTotalFiles: 10,
    maxSize: 10485760,
    acceptedFileTypes: {
      "image/*": [".png", ".jpg", ".jpeg", ".gif"],
      "application/pdf": [".pdf"],
      "audio/*": [".mp3", ".wav", ".ogg"],
      "video/*": [".mp4", ".mov", ".avi", ".mkv"],
    },
  };

  const { mutateAsync: createPost, isPending: isPendingCreate } = useCreatePost();
  const { mutateAsync: updatePost, isPending: isPendingUpdate } = useUpdatePost();

  const handleSubmit = async (values: PostFormValues) => {
    try {
      if (action === "Update" && post) {
        const updatedPost = await updatePost({
          ...values,
          postId: post.$id,
          imageIds: post.imageId,
          imageUrls: uploadedFileUrls, // Use the new URLs for update
        });

        if (updatedPost) {
          toast({ title: "Post updated successfully" });
          navigate(`/posts/${post.$id}`);
        }
      } else {
        const newPost = await createPost({
          ...values,
          userId: user.id,
          imageUrls: uploadedFileUrls,
        });

        if (newPost) {
          toast({ title: "Post created successfully" });
          navigate("/");
        }
      }
    } catch (error) {
      toast({ title: `Failed to ${action.toLowerCase()} post. Please try again.`, variant: "destructive" });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="flex flex-col gap-9 w-full max-w-5xl">
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