import { Loader, MasonryLayout } from ".";
import { SearchResultProps } from "@/types";


const SearchResults = ({ isSearchFetching, searchedPosts }: SearchResultProps) => {
  if (isSearchFetching) {
    return <Loader />;
  } else if (searchedPosts?.documents?.length > 0) {

    return <MasonryLayout posts={searchedPosts.documents} />;
  } else {
    return <p className="text-light-4 mt-10 text-center w-full">No results found</p>;
  }
};

export default SearchResults