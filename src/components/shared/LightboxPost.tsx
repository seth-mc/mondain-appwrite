import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Models } from 'appwrite';
import { motion, AnimatePresence } from 'framer-motion';
import { appwriteConfig, databases } from '@/lib/appwrite/config';
import { useUpdatePost } from '@/lib/react-query/queries';

type LightboxPostProps = {
  postId: string;
  newToSite: boolean;
  isAdmin: boolean;
  onClose: () => void;
  onNext: () => void;
  onPrevious: () => void;
  currentIndex: number;
  totalItems: number;
  allPosts: Models.Document[];
}

function timeAgo(dateStr: string) {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diff = Math.floor((now - then) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 2592000) return `${Math.floor(diff / 86400)}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

const LightboxPost = ({
  postId,
  isAdmin,
  onClose,
  onNext,
  onPrevious,
  currentIndex,
  totalItems,
  allPosts,
}: LightboxPostProps) => {
  const [post, setPost] = React.useState<Models.Document | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [allImages, setAllImages] = useState<{ url: string; postId: string }[]>([]);
  const [currentGlobalIndex, setCurrentGlobalIndex] = useState(0);
  const [imageLoaded, setImageLoaded] = useState(false);

  // Editable fields
  const [editTitle, setEditTitle] = useState('');
  const [editCaption, setEditCaption] = useState('');
  const [editQuoteText, setEditQuoteText] = useState('');
  const [editTags, setEditTags] = useState<string[]>([]);
  const [editNotes, setEditNotes] = useState('');
  const [newTagInput, setNewTagInput] = useState('');
  const [showTagInput, setShowTagInput] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const tagInputRef = useRef<HTMLInputElement>(null);
  const { mutateAsync: updatePost } = useUpdatePost();

  // canEdit: treat truthy isAdmin; also allow if user is logged in (newToSite=false) as a fallback
  const canEdit = !!isAdmin;

  // Sync local state when post loads
  useEffect(() => {
    if (post) {
      setEditTitle(post.caption || '');
      setEditCaption(post.caption || '');
      setEditQuoteText(post.quoteText || '');
      setEditTags(Array.isArray(post.tags) ? [...post.tags] : []);
      setEditNotes(post.content || '');
    }
  }, [post]); // only re-sync when post identity changes

  // Build flat image list
  useEffect(() => {
    const images = allPosts.flatMap(p =>
      (p.imageUrls || []).map((url: string) => ({ url, postId: p.$id }))
    );
    setAllImages(images);

    const globalIndex = images.findIndex(
      img => img.postId === postId && img.url === post?.imageUrls?.[currentImageIndex]
    );
    if (globalIndex !== -1) setCurrentGlobalIndex(globalIndex);
  }, [allPosts, postId, post, currentImageIndex]);

  // Fetch post
  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setImageLoaded(false);
    databases
      .getDocument(appwriteConfig.databaseId, appwriteConfig.postCollectionId, postId)
      .then(res => { if (!cancelled) { setPost(res); setCurrentImageIndex(0); } })
      .catch(err => console.error('Error fetching post:', err))
      .finally(() => { if (!cancelled) setIsLoading(false); });
    return () => { cancelled = true; };
  }, [postId]);

  const handleNextImage = useCallback(() => {
    if (currentGlobalIndex >= allImages.length - 1) return;
    const next = allImages[currentGlobalIndex + 1];
    if (next.postId !== postId) {
      setPost(allPosts.find(p => p.$id === next.postId) || null);
      setCurrentImageIndex(0);
      onNext();
    } else {
      setCurrentImageIndex(prev => prev + 1);
    }
    setCurrentGlobalIndex(prev => prev + 1);
    setImageLoaded(false);
  }, [currentGlobalIndex, allImages, postId, allPosts, onNext]);

  const handlePreviousImage = useCallback(() => {
    if (currentGlobalIndex <= 0) return;
    const prev = allImages[currentGlobalIndex - 1];
    if (prev.postId !== postId) {
      const prevPost = allPosts.find(p => p.$id === prev.postId);
      setPost(prevPost || null);
      setCurrentImageIndex(prevPost ? prevPost.imageUrls.length - 1 : 0);
      onPrevious();
    } else {
      setCurrentImageIndex(i => i - 1);
    }
    setCurrentGlobalIndex(prev => prev - 1);
    setImageLoaded(false);
  }, [currentGlobalIndex, allImages, postId, allPosts, onPrevious]);

  useEffect(() => {
    if (showTagInput) tagInputRef.current?.focus();
  }, [showTagInput]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;
      if (e.key === 'Escape') onClose();
      else if (e.key === 'ArrowRight') handleNextImage();
      else if (e.key === 'ArrowLeft') handlePreviousImage();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, handleNextImage, handlePreviousImage]);

  const save = async (overrides?: { caption?: string; tags?: string[]; content?: string; quoteText?: string }) => {
    if (!post) return;
    const caption = overrides?.caption ?? editCaption;
    const tags = overrides?.tags ?? editTags;
    const content = overrides?.content ?? editNotes;
    const quoteText = overrides?.quoteText ?? editQuoteText;
    setIsSaving(true);
    try {
      await updatePost({
        postId: post.$id,
        caption,
        tags,
        imageIds: post.imageIds || [],
        imageUrls: post.imageUrls || [],
        location: post.location,
        content,
        quoteText,
        imageSeo: post.imageSeo,
        category: post.category || '',
        order: post.order,
      });
    } catch (err) {
      console.error('Save failed:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const addTag = () => {
    const tag = newTagInput.trim().toLowerCase();
    if (tag && !editTags.includes(tag)) {
      const next = [...editTags, tag];
      setEditTags(next);
      save({ tags: next });
    }
    setNewTagInput('');
    setShowTagInput(false);
  };

  const removeTag = (tag: string) => {
    const next = editTags.filter(t => t !== tag);
    setEditTags(next);
    save({ tags: next });
  };

  if (isLoading || !post) return null;

  const isVideo = post.mediaType === 'video';
  const isQuote = post.mediaType === 'quote';
  const displayImage = isVideo ? post.thumbnailUrl : post.imageUrls?.[currentImageIndex];

  return (
    <AnimatePresence>
      {/* Backdrop */}
      <motion.div
        key="lightbox-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-6"
        style={{ background: 'rgba(0,0,0,0.85)' }}
        onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-5 left-5 z-50 w-9 h-9 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Main content row */}
        <div className="flex items-center gap-6 w-full max-w-6xl max-h-[90vh]" style={{ pointerEvents: 'none' }}>

          {/* ── Media area ── */}
          <div
            className="flex-1 relative flex items-center justify-center min-w-0"
            style={{ pointerEvents: 'auto' }}
          >
            {/* Prev — post-level for quotes, image-level otherwise */}
            {(isQuote ? currentIndex > 0 : currentGlobalIndex > 0) && (
              <button
                onClick={isQuote ? onPrevious : handlePreviousImage}
                className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            )}

            {isQuote ? (
              /* Quote display */
              <motion.div
                key={post.$id}
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.25 }}
                className="max-w-lg w-full mx-8 rounded-2xl shadow-2xl p-10 flex flex-col items-center"
                style={{ background: '#f7f6f3' }}
              >
                <div style={{
                  fontFamily: "Georgia, 'Times New Roman', serif",
                  fontSize: '72px',
                  lineHeight: 0.8,
                  color: '#c8c4bc',
                  alignSelf: 'flex-start',
                  userSelect: 'none',
                }}>"</div>
                <p style={{
                  fontFamily: "Georgia, 'Times New Roman', serif",
                  fontSize: '22px',
                  lineHeight: 1.65,
                  color: '#1a1a1a',
                  textAlign: 'center',
                  margin: '8px 0',
                  wordBreak: 'break-word',
                }}>
                  {post.quoteText || post.caption}
                </p>
                <div style={{
                  fontFamily: "Georgia, 'Times New Roman', serif",
                  fontSize: '72px',
                  lineHeight: 0.8,
                  color: '#c8c4bc',
                  alignSelf: 'flex-end',
                  userSelect: 'none',
                }}>"</div>
              </motion.div>
            ) : (
              <motion.img
                key={displayImage}
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: imageLoaded ? 1 : 0, scale: 1 }}
                transition={{ duration: 0.25 }}
                src={displayImage}
                alt="post"
                onLoad={() => setImageLoaded(true)}
                className="max-h-[85vh] max-w-full object-contain rounded-xl shadow-2xl"
              />
            )}

            {/* Next — post-level for quotes, image-level otherwise */}
            {(isQuote ? currentIndex < totalItems - 1 : currentGlobalIndex < allImages.length - 1) && (
              <button
                onClick={isQuote ? onNext : handleNextImage}
                className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            )}

            {/* Counter */}
            {!isQuote && (
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 text-white/40 text-xs font-space-mono">
                {currentGlobalIndex + 1} / {allImages.length}
              </div>
            )}
          </div>

          {/* ── Panel ── */}
          <motion.div
            key="lightbox-panel"
            initial={{ x: 32, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 32, opacity: 0 }}
            transition={{ duration: 0.28, ease: [0.4, 0, 0.2, 1] }}
            className="shrink-0 flex flex-col rounded-2xl overflow-hidden"
            style={{
              width: 340,
              maxHeight: '85vh',
              background: '#f5f5f5',
              boxShadow: '0 24px 60px rgba(0,0,0,0.4)',
              pointerEvents: 'auto',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Scrollable body */}
            <div className="flex-1 overflow-y-auto">

              {/* Title + timestamp */}
              <div className="px-6 pt-6 pb-3">
                {canEdit ? (
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => {
                      setEditTitle(e.target.value);
                      setEditCaption(e.target.value);
                    }}
                    onBlur={() => save({ caption: editTitle })}
                    placeholder="Add a title…"
                    className="w-full text-xl font-semibold text-gray-800 bg-transparent outline-none border-b border-transparent hover:border-gray-200 focus:border-gray-300 transition-colors leading-tight pb-0.5"
                  />
                ) : (
                  <h2 className="text-xl font-semibold text-gray-800 leading-tight">
                    {post.caption || 'Untitled'}
                  </h2>
                )}
                {post.$createdAt && (
                  <p className="text-xs text-gray-400 mt-1.5">{timeAgo(post.$createdAt)}</p>
                )}
              </div>

              <div className="mx-6 border-t border-gray-200" />

              {/* Quote Text (quotes) or Caption (everything else) */}
              <div className="px-6 py-4">
                <span className="text-[10px] font-semibold tracking-widest uppercase" style={{ color: '#e05c2e' }}>
                  {isQuote ? 'Quote Text' : 'Caption'}
                </span>
                <div className="mt-2 bg-white rounded-xl border border-gray-200 px-3 py-2.5">
                  {canEdit ? (
                    <textarea
                      value={isQuote ? editQuoteText : editCaption}
                      onChange={(e) => {
                        if (isQuote) {
                          setEditQuoteText(e.target.value);
                        } else {
                          setEditCaption(e.target.value);
                          setEditTitle(e.target.value);
                        }
                      }}
                      onBlur={() =>
                        isQuote
                          ? save({ quoteText: editQuoteText })
                          : save({ caption: editCaption })
                      }
                      rows={isQuote ? 5 : 3}
                      placeholder={isQuote ? 'Enter quote text…' : 'Add a caption…'}
                      className="w-full text-sm text-gray-700 bg-transparent outline-none resize-none leading-relaxed"
                      style={isQuote ? { fontFamily: "Georgia, 'Times New Roman', serif" } : undefined}
                    />
                  ) : (
                    <p className="text-sm text-gray-700 leading-relaxed" style={isQuote ? { fontFamily: "Georgia, 'Times New Roman', serif" } : undefined}>
                      {(isQuote ? post.quoteText : post.caption) || <span className="italic text-gray-400">None</span>}
                    </p>
                  )}
                </div>
              </div>

              {/* Caption label for quotes (separate from quote body) */}
              {isQuote && (
                <div className="px-6 pb-4">
                  <span className="text-[10px] font-semibold tracking-widest uppercase text-gray-400">
                    Caption
                  </span>
                  <div className="mt-2 bg-white rounded-xl border border-gray-200 px-3 py-2.5">
                    {canEdit ? (
                      <textarea
                        value={editCaption}
                        onChange={(e) => { setEditCaption(e.target.value); setEditTitle(e.target.value); }}
                        onBlur={() => save({ caption: editCaption })}
                        rows={2}
                        placeholder="Short caption / title…"
                        className="w-full text-sm text-gray-700 bg-transparent outline-none resize-none leading-relaxed"
                      />
                    ) : (
                      <p className="text-sm text-gray-700 leading-relaxed">
                        {post.caption || <span className="italic text-gray-400">No caption</span>}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Tags */}
              <div className="px-6 pb-4">
                <span className="text-[10px] font-semibold tracking-widest uppercase text-gray-400">
                  Tags
                </span>
                <div className="flex flex-wrap gap-2 mt-2">
                  {canEdit && (
                    showTagInput ? (
                      <input
                        ref={tagInputRef}
                        type="text"
                        value={newTagInput}
                        onChange={(e) => setNewTagInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') { e.preventDefault(); addTag(); }
                          if (e.key === 'Escape') { setShowTagInput(false); setNewTagInput(''); }
                        }}
                        onBlur={addTag}
                        placeholder="tag name"
                        className="text-sm border border-gray-300 rounded-full px-3 py-1 outline-none w-28 bg-white"
                      />
                    ) : (
                      <button
                        onClick={() => setShowTagInput(true)}
                        className="text-sm font-medium text-white rounded-full px-3.5 py-1.5 transition hover:opacity-90 leading-none"
                        style={{ background: '#e05c2e' }}
                      >
                        + Add tag
                      </button>
                    )
                  )}
                  {editTags.map((tag) => (
                    <span
                      key={tag}
                      className="group flex items-center gap-1 text-sm text-gray-600 bg-white border border-gray-200 rounded-full px-3 py-1.5 hover:border-gray-300 transition"
                    >
                      {tag}
                      {canEdit && (
                        <button
                          onClick={() => removeTag(tag)}
                          className="text-gray-300 hover:text-gray-500 ml-0.5 opacity-0 group-hover:opacity-100 transition text-base leading-none"
                        >
                          ×
                        </button>
                      )}
                    </span>
                  ))}
                </div>
              </div>

              {/* Notes */}
              <div className="px-6 pb-6">
                <span className="text-[10px] font-semibold tracking-widest uppercase text-gray-400">
                  Notes
                </span>
                <div className="mt-2 bg-white rounded-xl border border-gray-200 px-3 py-2.5 min-h-[72px]">
                  {canEdit ? (
                    <textarea
                      value={editNotes}
                      onChange={(e) => setEditNotes(e.target.value)}
                      onBlur={() => save({ content: editNotes })}
                      rows={4}
                      placeholder="Type here to add a note…"
                      className="w-full text-sm text-gray-600 bg-transparent outline-none resize-none leading-relaxed"
                    />
                  ) : (
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {post.content || <span className="italic text-gray-400">No notes</span>}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Bottom action bar */}
            <div className="shrink-0 border-t border-gray-200 bg-[#f5f5f5] px-5 py-3.5 flex items-center justify-end gap-3">
              {isSaving && (
                <span className="text-xs text-gray-400 mr-auto font-space-mono">saving…</span>
              )}
              {!isQuote && <a
                href={displayImage}
                download
                className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-200 bg-white hover:bg-gray-50 text-gray-400 hover:text-gray-600 transition"
                title="Download"
                onClick={(e) => e.stopPropagation()}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
              </a>}
              <button
                onClick={() => navigator.clipboard.writeText(displayImage)}
                className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-200 bg-white hover:bg-gray-50 text-gray-400 hover:text-gray-600 transition"
                title="Copy image URL"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
              </button>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default LightboxPost;
