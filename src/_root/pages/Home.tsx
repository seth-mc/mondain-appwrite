import { useEffect, useState } from "react";
import { useInView } from "react-intersection-observer";
import useDebounce from "@/hooks/useDebounce";
import { Loader, MasonryLayout, SearchResults } from "@/components/shared";
import { useGetPosts, useSearchPosts } from "@/lib/react-query/queries";
import { categories } from "@/constants";
import { PostsQueryResult } from "@/types";
import { DarkModeProps } from "@/types";



const Home = ({ darkMode }: DarkModeProps) => {
  const { ref, inView } = useInView();
  // eslint-disable-next-line @typescript-eslint/ban-types
  const { data: posts, fetchNextPage, hasNextPage } = useGetPosts() as unknown as { data: PostsQueryResult, fetchNextPage: Function, hasNextPage: boolean };  
  const [allPosts, setAllPosts] = useState([]);
  const [activeCategory, setActiveCategory] = useState('');
  const [searchValue, setSearchValue] = useState("");
  const debouncedSearch = useDebounce(searchValue, 500);
  const { data: searchedPosts, isFetching: isSearchFetching } = useSearchPosts(debouncedSearch, activeCategory);
  const cookieFallback = localStorage.getItem("cookieFallback");
  const newToSite = cookieFallback === "[]" || cookieFallback === null || cookieFallback === undefined;



  const resetSearch = () => {
    setSearchValue("");
    setActiveCategory("");
  }
  useEffect(() => {
    if (inView && hasNextPage && !searchValue && !activeCategory) {
      fetchNextPage();
    }
  }, [inView, fetchNextPage, hasNextPage, searchValue, activeCategory]);

  useEffect(() => {
    if (posts?.pages) {
      const newPosts = posts.pages.flatMap(page => page.documents) as never[];
      console.log("newPosts", newPosts);
      setAllPosts(newPosts);
    }
  }, [posts]);



  if (!posts)
    return (
      <div className="flex-center w-full h-full">
        <Loader />
      </div>
    );

  const shouldShowSearchResults = searchValue !== "" || activeCategory !== "";
  const shouldShowPosts = !shouldShowSearchResults &&
    posts.pages.every((item) => item.documents.length === 0);

  return (
    <div>
      <div onClick={resetSearch} className="flex justify-center">
        <img
          className={`d cursor-pointer w-80 ${darkMode ? 'invert' : ''}`}
          src="/assets/icons/mondain-svg.svg"
          alt="logo"
        />
      </div>
      { newToSite ? (
         <div></div> ) : (
      <div className="px-8 sm:px-10 md:px-20 lg:px-80 flex gap-2 w-full mt-5 pb-7 scroll-transition-fade">
        <div className="flex justify-start items-center w-full px-2 rounded-xl bg-light-1 border border-2 border-dark-1 focus-within:shadow-sm">
          <img src="/assets/icons/search.svg"
            alt="search"
            className="ml-1"
          />
          <input
            type="text"
            onChange={(e) => {
              setSearchValue(e.target.value);
              setActiveCategory("");
            }
            }
            placeholder="Search"
            value={searchValue}
            className="p-2 w-full bg-light-1 text-dark-1 outline-none font-spacemono"
          />
        </div>
      </div>
      )}
      <div className="lg:px-20 md:px-20 sm:px-0 px-5 flex flex-wrap justify-center gap-2">
        {categories.map(category => (
          <div key={category.name} className="flex items-center px-2 mb-2" onClick={() => {
            setActiveCategory(category.name)
            setSearchValue("")
          }}>
            <button
              className={`rounded-full p-2 transition duration-300 ease-in-out ${activeCategory === category.name ? 'btn-radial-green' : 'btn-radial-gray'} `}>
            </button>
            <p
              className={`cursor-pointer p-2  text-dark-1 font-spacemono transition duration-300 ease-in-out ${activeCategory === category.name ? 'text-dark-1' : 'text-light-3'} rounded-full `}
            >
              {category.name}
            </p>
          </div>
        ))}

      </div>
      <div className="flex-between w-full max-w-5xl mt-16 mb-7">

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
          <MasonryLayout newToSite={newToSite} posts={allPosts} />
        )}
      </div>
      {newToSite ? (
        <div>
        <a href="/sign-in">
          <div className="text-light-4 pb-20 mt-10 text-center w-full font-spacemono">Sign in to view more
        </div>
        </a>
        </div>
        ) : 
        hasNextPage && !searchValue && (
        <div ref={ref} className="mt-10">
          <Loader />
        </div>
      )}
  </div>
  )
}

export default Home;