import React, { useEffect, useRef, useState } from 'react';
import { Models } from 'appwrite';
import { motion } from 'framer-motion';
import { GripVertical, ShoppingCart } from 'lucide-react';
import { useDeletePostFull } from '@/lib/react-query/queries';

type PostProps = {
  post: Models.Document;
  newToSite?: boolean;
  dragHandleProps?: any;
  isAdmin?: boolean;
  delay?: number;
  isSelected?: boolean;
}

const Post = ({ post, dragHandleProps, isAdmin, delay = 0, isSelected = false }: PostProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);
  const [deleting, setDeleting] = useState(false);
  const contextMenuRef = useRef<HTMLDivElement>(null);
  const { mutateAsync: deletePostFull } = useDeletePostFull();
  const isVideo = post.mediaType === 'video';
  const isQuote = post.mediaType === 'quote';
  const { imageUrls, thumbnailUrl, shopifyProductId } = post;
  const hasShopifyProduct = shopifyProductId && shopifyProductId.trim() !== '';

  // Load Shopify Web Components script if this post has a product
  useEffect(() => {
    if (hasShopifyProduct && !document.querySelector('script[src*="storefront/web-components"]')) {
      const script = document.createElement('script');
      script.type = 'module';
      script.src = 'https://cdn.shopify.com/storefront/web-components.js';
      document.head.appendChild(script);
    }
  }, [hasShopifyProduct]);

  // Dismiss context menu on outside click
  useEffect(() => {
    if (!contextMenu) return;
    const dismiss = (e: MouseEvent) => {
      if (contextMenuRef.current && !contextMenuRef.current.contains(e.target as Node)) {
        setContextMenu(null);
      }
    };
    document.addEventListener('mousedown', dismiss);
    return () => document.removeEventListener('mousedown', dismiss);
  }, [contextMenu]);

  const handleContextMenu = (e: React.MouseEvent) => {
    if (!isAdmin) return;
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY });
  };

  const handleDelete = async () => {
    setContextMenu(null);
    setDeleting(true);
    try {
      await deletePostFull(post.$id);
    } catch (err) {
      console.error('Delete failed:', err);
      alert('Delete failed — check the console for details.');
    } finally {
      setDeleting(false);
    }
  };

  const handleClick = (e: React.MouseEvent) => {
    // Basic checks to not override internal elements
    if ((e.target as Element).closest('button')) return;
    if ((e.target as Element).closest('.modal-container')) return;

    if (!isSelected) {
      const customEvent = new CustomEvent('postSelected', {
        detail: { postId: post.$id },
        bubbles: true,
        composed: true
      });
      document.dispatchEvent(customEvent);
    }
  };
  const handleBuyClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (!hasShopifyProduct) return;
    const modal = document.getElementById(`product-modal-${post.$id}`) as HTMLDialogElement;
    if (modal) modal.showModal();
  };

  return (
    <>
    <motion.div
      onClick={handleClick}
      onContextMenu={handleContextMenu}
      className="post-container"
      style={{
        padding: '8px',
        background: 'none',
        border: 'none',
        position: 'relative',
        overflow: isQuote ? 'visible' : 'hidden',
        cursor: 'pointer',
        display: 'block'
      }}
      initial={{ opacity: 0, y: 20 }}
      animate={{
        opacity: isSelected ? 0.3 : 1,
        y: 0,
        scale: isSelected ? 0.95 : 1
      }}
      transition={{
        duration: 0.3,
        delay: delay,
        ease: "easeOut"
      }}
      whileHover={{ scale: 1.02 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {isAdmin && (
        <div
          {...dragHandleProps}
          className="drag-handle"
          style={{
            position: 'absolute',
            top: '12px',
            right: '12px',
            background: 'rgba(0, 0, 0, 0.7)',
            borderRadius: '4px',
            padding: '4px',
            cursor: 'grab',
            zIndex: 10,
            display: 'flex',
            alignItems: 'center',
            opacity: 0.5,
            justifyContent: 'center',
          }}
          onMouseDown={(e) => e.stopPropagation()}
        >
          <GripVertical size={16} color="white" />
        </div>
      )}
      {isQuote ? (
        <div
          style={{
            width: '100%',
            borderRadius: '4px',
            background: '#f7f6f3',
            padding: '20px 24px 24px',
            boxSizing: 'border-box',
          }}
        >
          <div style={{
            fontFamily: "Georgia, 'Times New Roman', serif",
            fontSize: '48px',
            lineHeight: 1,
            color: '#c8c4bc',
            userSelect: 'none',
            marginBottom: '4px',
          }}>"</div>
          <p style={{
            fontFamily: "Georgia, 'Times New Roman', serif",
            fontSize: '15px',
            lineHeight: 1.65,
            color: '#1a1a1a',
            textAlign: 'center',
            margin: '0 0 4px',
            wordBreak: 'break-word',
          }}>
            {post.quoteText || post.caption}
          </p>
          <div style={{
            fontFamily: "Georgia, 'Times New Roman', serif",
            fontSize: '48px',
            lineHeight: 1,
            color: '#c8c4bc',
            textAlign: 'right',
            userSelect: 'none',
          }}>"</div>
        </div>
      ) : isVideo && thumbnailUrl ? (
        <img
          src={thumbnailUrl}
          alt="video-thumbnail"
          style={{
            width: '100%',
            height: 'auto',
            borderRadius: '4px',
            display: 'block'
          }}
        />
      ) : (
        <img
          src={isHovered && imageUrls.length > 1 ? imageUrls[1] : imageUrls[0]}
          alt="user-post"
          style={{
            width: '100%',
            height: 'auto',
            borderRadius: '4px',
            display: 'block',
            transition: 'opacity 0.3s ease-in-out'
          }}
        />
      )}

      {/* Buy Button for Shopify Products */}
      {!isQuote && hasShopifyProduct && (
        <div
          className="buy-button"
          style={{
            position: 'absolute',
            bottom: '12px',
            left: '12px',
            background: 'rgba(0, 0, 0, 0.8)',
            borderRadius: '6px',
            padding: '8px 12px',
            cursor: 'pointer',
            zIndex: 10,
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            opacity: 0,
            transform: 'translateY(10px)',
            transition: 'all 0.3s ease',
          }}
          onClick={handleBuyClick}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(0, 0, 0, 0.9)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(0, 0, 0, 0.8)';
          }}
        >
          <ShoppingCart size={14} color="white" />
          <span style={{
            color: 'white',
            fontSize: '12px',
            fontWeight: '600',
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
          }}>
            Buy Now
          </span>
        </div>
      )}


      {/* Deleting overlay */}
      {deleting && (
        <div style={{
          position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          borderRadius: '4px', zIndex: 20,
        }}>
          <span style={{ color: 'white', fontSize: '12px', fontFamily: 'monospace' }}>Deleting…</span>
        </div>
      )}

      {/* CSS for hover effects */}
      <style dangerouslySetInnerHTML={{
        __html: `
          .post-container:hover .buy-button {
            opacity: 1 !important;
            transform: translateY(0) !important;
          }
        `
      }} />

      {/* Embedded Product Modal for Shoppable Posts */}
      {!isQuote && hasShopifyProduct && (
        <dialog id={`product-modal-${post.$id}`} className="product-modal z-50">
          {/* @ts-ignore - custom shopify attribute */}
          <shopify-context type="product" gid={`gid://shopify/Product/${shopifyProductId}`}>
            {/* dangerouslySetInnerHTML on <template> correctly populates its content fragment,
                which is required for Shopify Web Components to recognise their context */}
            <template dangerouslySetInnerHTML={{ __html: `
              <div class="modal-container">
                <div class="modal-close-container">
                  <button class="modal-close-btn" onclick="document.getElementById('product-modal-${post.$id}').close()">✕</button>
                </div>
                <div class="modal-content">
                  <div class="modal-layout">
                    <div class="modal-media">
                      <shopify-media width="500" height="500" query="product.selectedOrFirstAvailableVariant.image" class="modal-image"></shopify-media>
                    </div>
                    <div class="modal-details">
                      <div class="modal-header">
                        <span class="modal-vendor"><shopify-data query="product.vendor"></shopify-data></span>
                        <h1 class="modal-title font-times"><shopify-data query="product.title"></shopify-data></h1>
                        <div class="modal-price font-space"><shopify-money query="product.selectedOrFirstAvailableVariant.price"></shopify-money></div>
                      </div>
                      <div class="modal-buttons font-courier">
                        <button class="modal-add-btn" shopify-attr--disabled="!product.selectedOrFirstAvailableVariant.availableForSale"
                          onclick="(function(btn){var cart=document.getElementById('global-cart');var modal=document.getElementById('product-modal-${post.$id}');if(cart&&cart.addLine){cart.addLine(btn).then(function(){cart.showModal();if(modal)modal.close();})}})(this)">Add to Cart</button>
                        <button class="modal-buy-btn" shopify-attr--disabled="!product.selectedOrFirstAvailableVariant.availableForSale"
                          onclick="(function(btn){var store=document.querySelector('shopify-store');if(store&&store.buyNow)store.buyNow(btn)})(this)">Buy Now</button>
                      </div>
                      <div class="modal-description font-courier text-sm">
                        <shopify-data query="product.descriptionHtml"></shopify-data>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ` }} />
            <div shopify-loading-placeholder="" className="modal-loading font-courier">
              <p>Loading product details...</p>
            </div>
          </shopify-context>
        </dialog>
      )}
    </motion.div>

      {/* Right-click context menu */}
      {contextMenu && (
        <div
          ref={contextMenuRef}
          style={{
            position: 'fixed',
            top: contextMenu.y,
            left: contextMenu.x,
            zIndex: 9999,
            background: 'white',
            borderRadius: '8px',
            boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
            padding: '4px',
            minWidth: '160px',
          }}
          onContextMenu={(e) => e.preventDefault()}
        >
          <button
            onClick={handleDelete}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              width: '100%',
              padding: '8px 12px',
              border: 'none',
              background: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '13px',
              color: '#dc2626',
              textAlign: 'left',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = '#fef2f2')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Delete post
          </button>
        </div>
      )}
    </>
  );
};

export default Post;
