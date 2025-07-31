import React, { useEffect } from 'react';
import { Models } from 'appwrite';
import { motion } from 'framer-motion';
import { GripVertical, ShoppingCart } from 'lucide-react';

type PostProps = {
  post: Models.Document;
  newToSite?: boolean;
  dragHandleProps?: any;
  isAdmin?: boolean;
  delay?: number;
  isSelected?: boolean;
}

const Post = ({ post, dragHandleProps, isAdmin, delay = 0, isSelected = false }: PostProps) => {
  const isVideo = post.mediaType === 'video';
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

  const handleClick = (e: React.MouseEvent) => {
    // Prevent click when dragging or clicking buy button
    if ((e.target as HTMLElement).closest('.drag-handle') || 
        (e.target as HTMLElement).closest('.buy-button')) {
      return;
    }
    const event = new CustomEvent('postSelected', { detail: { postId: post.$id } });
    window.dispatchEvent(event);
  };

  const handleBuyClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!hasShopifyProduct) return;
    
    console.log('Buy button clicked for product:', shopifyProductId);
    console.log('Post ID:', post.$id);
    
    // Check if cart exists first
    const mainCart = document.querySelector('#main-cart') as any;
    const globalCart = document.querySelector('#global-cart') as any;
    const anyShopifyCart = document.querySelector('shopify-cart') as any;
    const cart = mainCart || globalCart || anyShopifyCart;
    
    console.log('Available carts:', {
      mainCart: !!mainCart,
      globalCart: !!globalCart,
      anyShopifyCart: !!anyShopifyCart,
      selectedCart: !!cart
    });
    
    // Find and click the hidden Shopify button
    const hiddenButton = document.querySelector(`#hidden-buy-${post.$id}`) as HTMLElement;
    console.log('Hidden button found:', !!hiddenButton);
    
    if (hiddenButton) {
      console.log('Clicking hidden Shopify button');
      hiddenButton.click();
    } else {
      console.error('Hidden Shopify button not found, looking for all hidden buttons');
      const allHiddenButtons = document.querySelectorAll(`[id^="hidden-buy-"]`);
      console.log('All hidden buttons found:', allHiddenButtons.length);
      
      // Fallback: try direct cart approach
      if (cart) {
        console.log('Trying direct cart approach...');
        try {
          const variantId = /^\d+$/.test(shopifyProductId) 
            ? `gid://shopify/ProductVariant/${shopifyProductId}` 
            : shopifyProductId;
          
          cart.addLine({
            merchandiseId: variantId,
            quantity: 1
          }).then(() => {
            console.log('Direct add successful');
            cart.showModal();
          }).catch((err: any) => {
            console.error('Direct add failed:', err);
          });
        } catch (error) {
          console.error('Direct cart error:', error);
        }
      }
    }
  };

  return (
    <motion.div
      onClick={handleClick}
      className="post-container"
      style={{ 
        padding: '8px',
        background: 'none',
        border: 'none',
        position: 'relative',
        overflow: 'hidden',
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
      {isVideo && thumbnailUrl ? (
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
          src={imageUrls[0]}
          alt="user-post"
          style={{ 
            width: '100%',
            height: 'auto',
            borderRadius: '4px',
            display: 'block'
          }}
        />
      )}
      
      {/* Buy Button for Shopify Products */}
      {hasShopifyProduct && (
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
            Buy Poster
          </span>
        </div>
      )}
      
            {/* Hidden Shopify Context for Cart Functionality */}
      {hasShopifyProduct && (
        <div 
          className="buy-button" 
          style={{ 
            display: 'none',
            position: 'absolute',
            pointerEvents: 'none'
          }}
          dangerouslySetInnerHTML={{
            __html: `
              <shopify-context type="product" gid="gid://shopify/Product/${shopifyProductId}">
                <template>
                  <button
                    id="hidden-buy-${post.$id}"
                    onclick="
                       event.preventDefault();
                       event.stopPropagation();
                       console.log('Hidden button clicked');
                       
                       // Try multiple ways to find the cart
                       const mainCart = document.getElementById('main-cart');
                       const globalCart = document.getElementById('global-cart');
                       const anyCart = document.querySelector('shopify-cart');
                       const cart = mainCart || globalCart || anyCart;
                       
                       if (cart && typeof cart.addLine === 'function') {
                         console.log('Adding to cart via hidden button...');
                         const addPromise = cart.addLine(event);
                         
                         if (addPromise && typeof addPromise.then === 'function') {
                           addPromise.then(() => {
                             console.log('Item added successfully, showing modal...');
                             // Try to show modal with multiple approaches
                             if (typeof cart.showModal === 'function') {
                               cart.showModal();
                               console.log('Cart modal opened');
                             } else {
                               console.warn('showModal not available');
                             }
                           }).catch(err => {
                             console.error('Cart add failed:', err);
                           });
                         } else {
                           console.log('AddLine completed synchronously, showing modal...');
                           setTimeout(() => {
                             if (typeof cart.showModal === 'function') {
                               cart.showModal();
                               console.log('Cart modal opened (sync)');
                             }
                           }, 200);
                         }
                       } else {
                         console.error('No cart found or addLine not available');
                       }
                     "
                  >
                    Hidden Buy Button
                  </button>
                </template>
              </shopify-context>
            `
          }}
        />
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
    </motion.div>
  );
};

export default Post;
