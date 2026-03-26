import { useCallback, useEffect, useRef, useState } from "react";
import useDebounce from "@/hooks/useDebounce";
import { Loader, MasonryLayout, SearchResults } from "@/components/shared";
import { useGetPosts, useSearchPosts } from "@/lib/react-query/queries";
import { mainCategories } from "@/constants";
import { PostsQueryResult, DarkModeProps } from "@/types";
import { useUserContext } from "@/context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { Models } from "appwrite";

const allCategory = { name: "ALL PINS", subcategories: [] };
const navCategories = [allCategory, ...mainCategories];

// Round-robin interleave posts across main category buckets so the grid
// always shows a mix of THINGS / MONDAIN / VIDEO / DIGITAL rather than
// a chronological block of the same type.
// Quote posts are spliced in every QUOTE_INTERVAL regular posts.
const QUOTE_INTERVAL = 4;

// TEXT category subcategories — posts in this bucket are staggered separately
const textCategory = mainCategories.find(cat => cat.name === 'TEXT');
const textSubcategories = new Set(textCategory?.subcategories ?? []);

function isTextPost(post: Models.Document): boolean {
  return (
    post.mediaType === 'quote' ||
    textSubcategories.has((post.category ?? '').toLowerCase())
  );
}

function interleavePosts(posts: Models.Document[]): Models.Document[] {
  const textPosts = posts.filter(isTextPost);
  const regular = posts.filter(p => !isTextPost(p));

  // Build a bucket per non-TEXT main category + one for uncategorized
  const buckets: Record<string, Models.Document[]> = {};
  mainCategories.forEach(cat => {
    if (cat.name !== 'TEXT') buckets[cat.name] = [];
  });
  buckets["OTHER"] = [];

  regular.forEach(post => {
    const mainCat = mainCategories.find(cat =>
      cat.name !== 'TEXT' &&
      cat.subcategories.includes((post.category ?? "").toLowerCase())
    );
    (mainCat ? buckets[mainCat.name] : buckets["OTHER"]).push(post);
  });

  // Round-robin pick one from each non-empty bucket in order
  const queues = Object.values(buckets).filter(q => q.length > 0);
  const interleaved: Models.Document[] = [];
  while (queues.some(q => q.length > 0)) {
    for (let i = queues.length - 1; i >= 0; i--) {
      if (queues[i].length > 0) interleaved.push(queues[i].shift()!);
      else queues.splice(i, 1);
    }
  }

  // Adaptive interval: shrink below QUOTE_INTERVAL when regulars are scarce
  // so text posts are spread throughout rather than piling at the end.
  const effectiveInterval = textPosts.length > 0 && interleaved.length > 0
    ? Math.max(1, Math.min(QUOTE_INTERVAL, Math.floor(interleaved.length / textPosts.length)))
    : QUOTE_INTERVAL;

  const result: Models.Document[] = [];
  let textIdx = 0;
  for (let i = 0; i < interleaved.length; i++) {
    result.push(interleaved[i]);
    if ((i + 1) % effectiveInterval === 0 && textIdx < textPosts.length) {
      result.push(textPosts[textIdx++]);
    }
  }
  while (textIdx < textPosts.length) result.push(textPosts[textIdx++]);

  return result;
}

const Home = ({ darkMode, isAdmin }: DarkModeProps) => {
  const loaderRef = useRef<HTMLDivElement>(null);
  const { data: posts, fetchNextPage, hasNextPage } = useGetPosts() as unknown as {
    data: PostsQueryResult;
    fetchNextPage: () => void;
    hasNextPage: boolean;
  };
  const [allPosts, setAllPosts] = useState<Models.Document[]>([]);
  const [activeCategory, setActiveCategory] = useState("ALL PINS");
  const [searchValue, setSearchValue] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const debouncedSearch = useDebounce(searchValue, 500);
  const {
    data: searchedPosts,
    isFetching: isSearchFetching,
    fetchNextPage: fetchNextSearchPage,
    hasNextPage: hasNextSearchPage,
  } = useSearchPosts(debouncedSearch, activeCategory);
  const { isAuthenticated } = useUserContext();
  const newToSite = !isAuthenticated;
  const inputRef = useRef<HTMLInputElement>(null);
  const [scrolled, setScrolled] = useState(false);

  // "Filtered" = user has typed a search term OR selected a specific category (not "ALL PINS")
  const isFiltered = !!(searchValue || (activeCategory && activeCategory !== "ALL PINS"));

  const tryFetchMore = useCallback(() => {
    const distanceFromBottom =
      document.documentElement.scrollHeight - window.scrollY - window.innerHeight;
    if (distanceFromBottom < 600) {
      if (isFiltered) {
        if (hasNextSearchPage) fetchNextSearchPage();
      } else {
        if (hasNextPage) fetchNextPage();
      }
    }
  }, [isFiltered, hasNextPage, hasNextSearchPage, fetchNextPage, fetchNextSearchPage]);

  // Scroll listeners
  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 50);
      tryFetchMore();
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [tryFetchMore]);

  // Also fire immediately after each batch loads (handles short pages that don't need scrolling)
  useEffect(() => {
    tryFetchMore();
  }, [allPosts, tryFetchMore]);

  useEffect(() => {
    if (posts?.pages) {
      const newPosts = posts.pages.flatMap((page) => page.documents);
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
  const shouldShowPosts =
    !shouldShowSearchResults && !isFiltered && posts.pages.every((item) => item.documents.length === 0);

  const bgColor = darkMode ? "#000000" : "#f0f0f0";

  return (
    <div className={`min-h-screen ${darkMode ? "dark bg-dark-1" : "bg-[#f0f0f0]"}`}>

      {/* Sticky search + category bar */}
      <div className="sticky top-0 z-30 w-full">
        {/* Gradient backdrop — opaque at top, fades out below */}
        <div
          className="absolute inset-x-0 top-0 pointer-events-none"
          style={{
            height: "calc(100% + 56px)",
            background: `linear-gradient(to bottom, ${bgColor} 55%, ${bgColor}cc 75%, transparent 100%)`,
          }}
        />

        <div className="relative px-6 md:px-10 pt-[75px]">
          <div className="max-w-screen-xl mx-auto">

            {/* Search box */}
            <motion.div
              className="pt-5 pb-3 flex justify-center"
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, ease: [0.4, 0, 0.2, 1] }}
            >
              <motion.div
                className={`relative flex items-center w-full max-w-xl rounded-full px-5 py-3 cursor-text ${darkMode
                  ? "border border-white/20 hover:border-white/40 focus-within:border-white/60"
                  : "border border-dark-1/15 hover:border-dark-1/30 focus-within:border-dark-1/50"
                  }`}
                style={{ background: "transparent" }}
                onClick={() => inputRef.current?.focus()}
                animate={{
                  boxShadow: searchFocused
                    ? darkMode ? "0 0 0 3px rgba(255,255,255,0.06)" : "0 0 0 3px rgba(0,0,0,0.04)"
                    : "none",
                }}
                transition={{ duration: 0.2 }}
              >
                <div className="relative flex-1">
                  <AnimatePresence>
                    {!searchFocused && !searchValue && (
                      <motion.span
                        key="placeholder"
                        className={`absolute inset-0 text-[1.05rem] font-light italic leading-none pointer-events-none select-none flex items-center ${darkMode ? "text-white/30" : "text-dark-1/30"}`}
                        style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.15 }}
                      >
                        search mondain...
                      </motion.span>
                    )}
                  </AnimatePresence>
                  <input
                    ref={inputRef}
                    type="text"
                    value={searchValue}
                    onChange={(e) => setSearchValue(e.target.value)}
                    onFocus={() => setSearchFocused(true)}
                    onBlur={() => setSearchFocused(false)}
                    className={`w-full bg-transparent outline-none text-[1.05rem] font-light italic leading-none caret-current ${darkMode ? "text-white/80" : "text-dark-1/80"}`}
                    style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
                    spellCheck={false}
                  />
                </div>
                <AnimatePresence>
                  {searchValue && (
                    <motion.button
                      initial={{ opacity: 0, scale: 0.7 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.7 }}
                      transition={{ duration: 0.15 }}
                      onClick={() => setSearchValue("")}
                      className={`ml-3 text-xs shrink-0 ${darkMode ? "text-white/30 hover:text-white/60" : "text-dark-1/30 hover:text-dark-1/60"}`}
                    >
                      ✕
                    </motion.button>
                  )}
                </AnimatePresence>
              </motion.div>
            </motion.div>

            {/* Category nav — collapses on scroll */}
            <AnimatePresence initial={false}>
              {!scrolled && (
                <motion.div
                  key="categories"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.28, ease: [0.4, 0, 0.2, 1] }}
                  className="overflow-hidden"
                >
                  <nav className="flex items-center gap-x-6 gap-y-2 flex-wrap py-3 pb-4">
                    {navCategories.map((category, i) => (
                      <motion.button
                        key={category.name}
                        onClick={() => {
                          setActiveCategory(category.name);
                          setSearchValue("");
                        }}
                        className={`relative text-sm tracking-widest uppercase transition-colors duration-200 font-space-mono pb-0.5 ${activeCategory === category.name
                          ? darkMode ? "text-white" : "text-dark-1"
                          : darkMode ? "text-white/35 hover:text-white/70" : "text-dark-1/35 hover:text-dark-1/70"
                          }`}
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.25, delay: i * 0.04 }}
                      >
                        {category.name === "ALL PINS" ? "Everything" : category.name.charAt(0) + category.name.slice(1).toLowerCase()}
                        {activeCategory === category.name && (
                          <motion.div
                            layoutId="category-underline"
                            className={`absolute bottom-0 left-0 right-0 h-px ${darkMode ? "bg-white" : "bg-dark-1"}`}
                            transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
                          />
                        )}
                      </motion.button>
                    ))}
                  </nav>
                </motion.div>
              )}
            </AnimatePresence>

          </div>
        </div>
      </div>

      <main className="px-6 pt-20 md:px-10">
        <div className="max-w-screen-xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.45, ease: [0.4, 0, 0.2, 1] }}
          >
            {shouldShowSearchResults ? (
              <SearchResults
                isSearchFetching={isSearchFetching}
                searchedPosts={searchedPosts?.pages.flatMap((page) => page.documents) || []}
              />
            ) : shouldShowPosts ? (
              <motion.p
                className={`text-center py-24 text-sm tracking-widest uppercase font-space-mono ${darkMode ? "text-white/30" : "text-dark-1/30"
                  }`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
              >
                Nothing found
              </motion.p>
            ) : (
              <div className="flex justify-center">
                <div className="max-w-[900px] w-full">
                  <MasonryLayout
                    isAdmin={isAdmin}
                    newToSite={newToSite}
                    posts={isFiltered ? searchedPosts?.pages.flatMap((page) => page.documents) || [] : interleavePosts(allPosts)}
                  />
                </div>
              </div>
            )}
          </motion.div>

          {/* Infinite scroll loader */}
          <div ref={loaderRef} className="mt-10 pb-32 flex justify-center">
            {(isFiltered ? hasNextSearchPage : hasNextPage) && <Loader />}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Home;
