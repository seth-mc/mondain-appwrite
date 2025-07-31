import { Loader, MasonryLayout } from ".";
import { SearchResultProps } from "@/types";

const SearchResults = ({ isSearchFetching, searchedPosts }: SearchResultProps) => {
  if (isSearchFetching) {
    return <Loader />;
  }

  // Handle both array and object with documents property
  const posts = Array.isArray(searchedPosts) ? searchedPosts : searchedPosts?.documents;

  if (posts && posts.length > 0) {
    return (
      <div className="flex justify-center">
        <div className="max-w-[850px] w-full">
          <MasonryLayout posts={posts} />
        </div>
      </div>
    );
  } else {
    return <p className="text-light-4 mt-10 text-center w-full">No results found</p>;
  }
};

export default SearchResults;