import { useEffect, useState } from "react";
import { useInView } from "react-intersection-observer";
import useDebounce from "@/hooks/useDebounce";
import { Loader, MasonryLayout, SearchResults, Header, Sidebar } from "@/components/shared";
import { useGetPosts, useSearchPosts } from "@/lib/react-query/queries";
import { mainCategories } from "@/constants";
import { PostsQueryResult } from "@/types";
import { DarkModeProps } from "@/types";
import { Search } from "lucide-react";
import { useUserContext } from "@/context/AuthContext";
import { motion } from "framer-motion";

const Home = ({ darkMode, isAdmin, toggleDarkMode }: DarkModeProps) => {
  const { ref, inView } = useInView();
  const { data: posts, fetchNextPage, hasNextPage } = useGetPosts() as unknown as { data: PostsQueryResult, fetchNextPage: Function, hasNextPage: boolean };  
  const [allPosts, setAllPosts] = useState([]);
  const [activeCategory, setActiveCategory] = useState('POSTERS');
  const [searchValue, setSearchValue] = useState("");
  const [isLogoZoomed, setIsLogoZoomed] = useState(false);
  const debouncedSearch = useDebounce(searchValue, 500);
  const { data: searchedPosts, isFetching: isSearchFetching, fetchNextPage: fetchNextSearchPage, hasNextPage: hasNextSearchPage } = useSearchPosts(debouncedSearch, activeCategory);
  const { isAuthenticated } = useUserContext();
  const newToSite = !isAuthenticated;

  const resetFilters = () => {
    setSearchValue("");
    setActiveCategory("POSTERS");
  }

  const handleLogoClick = () => {
    setIsLogoZoomed(!isLogoZoomed);
  }

  useEffect(() => {
    const handleScroll = () => {
      if (isLogoZoomed) {
        setIsLogoZoomed(false);
        window.scrollTo(0, 0);
      }
    };

    if (isLogoZoomed) {
      window.addEventListener('scroll', handleScroll, { passive: true });
    }
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isLogoZoomed]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isLogoZoomed) {
        setIsLogoZoomed(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isLogoZoomed]);

  useEffect(() => {
    if (inView) {
      // If there's a search value, use search pagination
      if (searchValue) {
        if (hasNextSearchPage) fetchNextSearchPage();
      } else {
        // If no search value but there's an active category filter, use search pagination
        // If no search value and no category filter (showing all posts), use regular pagination
        if (activeCategory && activeCategory !== '') {
          if (hasNextSearchPage) fetchNextSearchPage();
        } else {
          if (hasNextPage) fetchNextPage();
        }
      }
    }
  }, [inView, fetchNextPage, hasNextPage, searchValue, activeCategory, fetchNextSearchPage, hasNextSearchPage]);

  useEffect(() => {
    if (posts?.pages) {
      const newPosts = posts.pages.flatMap(page => page.documents) as never[];      
      setAllPosts(newPosts);
    }
  }, [posts]);

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
    <div className="min-h-screen bg-light-1">
      <Sidebar darkMode={darkMode} />
      <Header 
        darkMode={darkMode} 
        isAdmin={isAdmin} 
        toggleDarkMode={toggleDarkMode} 
        resetFilters={resetFilters}
      />
      
      <main className="px-4 md:px-8 md:ml-64">
        <div className="max-w-screen-xl mx-auto py-8">
          <div className="flex flex-col items-center mb-12">
            {isLogoZoomed && (
              <motion.div
                initial={{ 
                  opacity: 0,
                  scale: 0.4,
                  position: 'fixed',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)'
                }}
                animate={{ 
                  opacity: 1,
                  scale: 1,
                  position: 'fixed',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)'
                }}
                exit={{ 
                  opacity: 0,
                  scale: 0.4,
                  position: 'fixed',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)'
                }}
                transition={{
                  duration: 0.3,
                  ease: [0.4, 0, 0.2, 1]
                }}
                className="z-50 bg-black/0"
                onClick={handleLogoClick}
                onWheel={() => setIsLogoZoomed(false)}
              >
                <div className="h-screen w-auto">
                  <img
                    src="https://mondain-presigned-media.s3.us-east-2.amazonaws.com/uploads/c44f903e-5a3a-473d-814b-b5fd2cb856c1.gif"
                    alt="Logo"
                    className={`!max-w-none h-full w-auto object-contain cursor-pointer ${darkMode ? 'invert' : ''}`}
                  />
                </div>
              </motion.div>
            )}
            <div className="relative">
              <img
                src="https://mondain-presigned-media.s3.us-east-2.amazonaws.com/uploads/c44f903e-5a3a-473d-814b-b5fd2cb856c1.gif"
                alt="Logo"
                className={`w-[800px] pt-16 mb-8 cursor-pointer ${darkMode ? 'invert' : ''}`}
                onClick={handleLogoClick}
              />
            </div>
            <motion.div
              animate={{
                opacity: isLogoZoomed ? 0.5 : 1,
                scale: isLogoZoomed ? 0.95 : 1
              }}
              transition={{
                duration: 0.5,
                ease: [0.4, 0, 0.2, 1]
              }}
            >
              <div className="rounded-md flex items-center md:min-w-[500px] w-full x-4 py-2 bg-light-1 border border-dark-4 focus-within:shadow-sm">
                <Search className="mx-4 w-5 h-5 text-dark-3 "/>
                <input
                  type="text"
                  onChange={(e) => {
                    setSearchValue(e.target.value);
                  }}
                  placeholder="Search memories..."
                  value={searchValue}
                  className="w-full ml-3 bg-transparent text-dark-1 outline-none font-times placeholder:text-dark-3"
                />
              </div>
            </motion.div>
          </div>

          {/* Category Selector */}
          <div className="flex justify-center gap-8 mb-12">
            {mainCategories.map((category) => (
              <button
                key={category.name}
                onClick={() => {
                  setActiveCategory(category.name);
                  setSearchValue("");
                }}
                className={`font-courier italic uppercase text-base transition-colors duration-200 ${
                  activeCategory === category.name
                    ? 'text-red'
                    : 'text-dark-3 hover:text-red'
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>

          <motion.div
            animate={{
              opacity: isLogoZoomed ? 0.5 : 1,
              scale: isLogoZoomed ? 0.95 : 1
            }}
            transition={{
              duration: 0.5,
              ease: [0.4, 0, 0.2, 1]
            }}
          >
            <div className="mt-8">
              {shouldShowSearchResults ? (
                <SearchResults
                  isSearchFetching={isSearchFetching}
                  searchedPosts={searchedPosts?.pages.flatMap(page => page.documents) || []}
                />
              ) : shouldShowPosts ? (
                <p className="text-dark-3 text-center">No posts found</p>
              ) : (
                <div className="flex justify-center">
                  <div className="max-w-[850px] w-full">
                    <MasonryLayout 
                      isAdmin={isAdmin} 
                      newToSite={newToSite} 
                      posts={activeCategory && activeCategory !== '' ? (searchedPosts?.pages.flatMap(page => page.documents) || []) : allPosts} 
                    />
                  </div>
                </div>
              )}
            </div>

            {(
              (searchValue && hasNextSearchPage) || 
              (!searchValue && activeCategory && activeCategory !== '' && hasNextSearchPage) ||
              (!searchValue && (!activeCategory || activeCategory === '') && hasNextPage)
            ) && (
              <div ref={ref} className="mt-10">
                <Loader />
              </div>
            )}
          </motion.div>
        </div>
      </main>
    </div>
  );
}

export default Home;