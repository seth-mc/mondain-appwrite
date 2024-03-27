import { Models } from "appwrite";
import { Loader, MasonryLayout } from ".";

type SearchResultsProps = {
  isSearchFetching: boolean;
  searchedPosts: Models.Document[];
}

const SearchResults = ({ isSearchFetching, searchedPosts }: SearchResultsProps) => {
  if ( isSearchFetching ) return <Loader />

  if (searchedPosts.documents.length > 0) {
  return (
    <MasonryLayout posts={searchedPosts.documents}/>
  )
  }

  return (
    <p className="text-light-4 mt-10 text-center w-full">No results found.</p>
  )
}

export default SearchResults