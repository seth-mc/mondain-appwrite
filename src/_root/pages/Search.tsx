import { useEffect, useState } from "react";
import { useInView } from "react-intersection-observer";

import useDebounce from "@/hooks/useDebounce";
import { Loader, MasonryLayout } from "@/components/shared";
import { useGetPosts, useSearchPosts } from "@/lib/react-query/queries";

export type SearchResultProps = {
  isSearchFetching: boolean;
  searchedPosts: any;
};

const SearchResults = ({ isSearchFetching, searchedPosts }: SearchResultProps) => {
  if (isSearchFetching) {
    return <Loader />;
  } else if (searchedPosts && searchedPosts.documents.length > 0) {
    return <MasonryLayout posts={searchedPosts} />;
  } else {
    return (
      <p className="text-light-4 mt-10 text-center w-full">No results found</p>
    );
  }
};

const Search = () => {
  const { ref, inView } = useInView();
  const { data: posts, fetchNextPage, hasNextPage } = useGetPosts();

  const [searchValue, setSearchValue] = useState("");
  const debouncedSearch = useDebounce(searchValue, 500);
  const { data: searchedPosts, isFetching: isSearchFetching } = useSearchPosts(debouncedSearch);

  useEffect(() => {
    if (inView && !searchValue) {
      fetchNextPage();
    }
  }, [inView, searchValue]);

  if (!posts)
    return (
      <div className="flex-center w-full h-full">
        <Loader />
      </div>
    );

  const shouldShowSearchResults = searchValue !== "";
  const shouldShowPosts = !shouldShowSearchResults && 
    posts.pages.every((item) => item.documents.length === 0);

  return (
    <div>
    <div className="flex justify-center">
        <img
          className="w-80"
          src="/assets/icons/mondain-svg.svg"
          alt="logo"
        />
      </div>
      <div className="px-8 sm:px-10 md:px-20 lg:px-80 flex gap-2 w-full mt-5 pb-7 scroll-transition-fade">
      <div className="flex justify-start items-center w-full px-2 rounded-xl bg-light-1 border border-2 border-black focus-within:shadow-sm">
        <img src="/assets/icons/search.svg"
          alt="search"
          className="ml-1"
        />
        <input
          type="text"
          onChange={(e) => setSearchValue(e.target.value)}
          placeholder="Search"
          value={searchValue}
          className="p-2 w-full bg-light-1 outline-none font-spacemono"
        />
      </div>
    </div>
      <div className="flex-between w-full max-w-5xl mt-16 mb-7">

      <div className="flex-center gap-4 bg-light-2 rounded-xl px-4 py-2 cursor pointer">
        <p className="small-medium md:base-medium text-light-4">All</p>
        <img src="/assets/icons/filter.svg"
        width={20}
        height={20} 
        alt="filter"
        />
      </div>
    </div>
    <div className="flex justify-center">
        {shouldShowSearchResults ? (
          <SearchResults
            isSearchFetching={isSearchFetching}
            searchedPosts={searchedPosts}
          />
        ) : shouldShowPosts ? (
          <p className="text-light-4 mt-10 text-center w-full">End of posts</p>
        ) : (
          posts.pages.map((post, index) => (
            <MasonryLayout key={`page-${index}`} posts={post}/>
            
          ))
        )}
      </div>
    </div>

  )
}

export default Search;