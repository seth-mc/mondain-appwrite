import { useEffect } from "react";
import { Header, Sidebar } from "@/components/shared";
import { DarkModeProps } from "@/types";

const Shop = ({ darkMode, isAdmin, toggleDarkMode }: DarkModeProps) => {
  useEffect(() => {
    // Load Shopify Web Components script
    const script = document.createElement('script');
    script.type = 'module';
    script.src = 'https://cdn.shopify.com/storefront/web-components.js';
    document.head.appendChild(script);

    // Handle product anchor navigation
    const handleProductFocus = () => {
      const hash = window.location.hash;
      if (hash.startsWith('#product-')) {
        const productId = hash.replace('#product-', '');
        console.log('Focusing on product:', productId);
        
        // Scroll to product or highlight it
        setTimeout(() => {
          const productElement = document.querySelector(`[data-product-id="${productId}"]`);
          if (productElement) {
            productElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }, 1000); // Wait for Shopify components to load
      }
    };

    // Handle hash changes
    window.addEventListener('hashchange', handleProductFocus);
    handleProductFocus(); // Handle initial hash

    return () => {
      // Cleanup
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
      window.removeEventListener('hashchange', handleProductFocus);
    };
  }, []);

  return (
    <div className="min-h-screen bg-light-1">
      <Sidebar darkMode={darkMode} />
      <Header 
        darkMode={darkMode} 
        isAdmin={isAdmin} 
        toggleDarkMode={toggleDarkMode} 
      />
      
      <main className="px-4 md:px-8 md:ml-64">
        <div className="max-w-screen-xl mx-auto py-8">
          
          {/* Shop Header */}
          <div className="flex flex-col items-center mb-12">
            <div className="relative">
              <img
                src="/assets/icons/mondain-porti.gif"
                alt="Logo"
                className={`w-[400px] pt-8 mb-6 ${darkMode ? 'invert' : ''}`}
              />
            </div>
          </div>

          {/* Shopify Store Context */}
          <div 
            dangerouslySetInnerHTML={{
              __html: `
                <script type="module" src="https://cdn.shopify.com/storefront/web-components.js"></script>
                <shopify-store 
                  store-domain="m-ondain.myshopify.com"
                  country="US" 
                  language="en"
                  public-access-token="8c6d7e13254333199d913e533d62f9f2"
                >
                  <!-- Global Cart -->
                  <shopify-cart id="main-cart">
                    <div slot="empty">Your cart is empty</div>
                  </shopify-cart>

                  <!-- Products Grid -->
                  <div class="products-section">
                    <h2 class="section-title">All Products</h2>
                    <div class="products-grid">
                      <shopify-list-context type="product" query="products" first="24">
                        <template>
                          <div class="product-card">
                            <!-- Product Image with Quick Add Overlay -->
                            <div class="product-image-container">
                              <shopify-media
                                width="400"
                                height="400"
                                query="product.featuredImage"
                                class="product-image"
                              ></shopify-media>
                              
                              <!-- Quick Add Button (appears on hover) - INSIDE TEMPLATE for proper context -->
                              <button 
                                class="quick-add-btn"
                                onclick="
                                  const cart = getElementById('main-cart');
                                  if (cart && typeof cart.addLine === 'function') {
                                    const addPromise = cart.addLine(event);
                                    if (addPromise && typeof addPromise.then === 'function') {
                                      addPromise.then(() => {
                                        console.log('Quick add successful');
                                        setTimeout(() => cart.showModal(), 100);
                                      }).catch(err => console.error('Quick add failed:', err));
                                    } else {
                                      setTimeout(() => cart.showModal(), 200);
                                    }
                                  }
                                "
                                title="Quick Add to Cart"
                              >
                                Quick Add
                              </button>
                              
                              <!-- View Product Button -->
                              <button 
                                class="view-product-btn"
                                onclick="getElementById('product-modal').showModal(); getElementById('product-modal-context').update(event);"
                                title="View Product Details"
                              >
                                View Details
                              </button>
                            </div>
                            
                            <!-- Product Info -->
                            <div class="product-info">
                              <h3 class="product-title">
                                <shopify-data query="product.title"></shopify-data>
                              </h3>
                              <div class="product-price">
                                <shopify-money query="product.priceRange.minVariantPrice"></shopify-money>
                              </div>
                              <p class="product-vendor">
                                <shopify-data query="product.vendor"></shopify-data>
                              </p>
                              
                              <!-- Add to Cart Button - INSIDE TEMPLATE for proper context -->
                              <button 
                                class="add-to-cart-btn"
                                onclick="
                                  const cart = getElementById('main-cart');
                                  if (cart && typeof cart.addLine === 'function') {
                                    const addPromise = cart.addLine(event);
                                    if (addPromise && typeof addPromise.then === 'function') {
                                      addPromise.then(() => {
                                        console.log('Add to cart successful');
                                        setTimeout(() => cart.showModal(), 100);
                                      }).catch(() => { 
                                        getElementById('product-modal').showModal(); 
                                        getElementById('product-modal-context').update(event); 
                                      });
                                    } else {
                                      setTimeout(() => cart.showModal(), 200);
                                    }
                                  }
                                "
                              >
                                Add to Cart
                              </button>
                            </div>
                          </div>
                        </template>
                        
                        <template slot="empty">
                          <div class="empty-state">
                            <p>No products available at the moment.</p>
                          </div>
                        </template>
                      </shopify-list-context>
                    </div>
                  </div>

                  <!-- Product Details Modal -->
                  <dialog id="product-modal" class="product-modal">
                    <shopify-context id="product-modal-context" type="product" wait-for-update>
                      <template>
                        <div class="modal-container">
                          <!-- Close Button -->
                          <div class="modal-close-container">
                            <button class="modal-close-btn" onclick="getElementById('product-modal').close();">
                              ✕
                            </button>
                          </div>
                          
                          <!-- Modal Content -->
                          <div class="modal-content">
                            <div class="modal-layout">
                              <!-- Product Image -->
                              <div class="modal-media">
                                <shopify-media
                                  width="500"
                                  height="500"
                                  query="product.selectedOrFirstAvailableVariant.image"
                                  class="modal-image"
                                ></shopify-media>
                              </div>
                              
                              <!-- Product Details -->
                              <div class="modal-details">
                                <div class="modal-header">
                                  <span class="modal-vendor">
                                    <shopify-data query="product.vendor"></shopify-data>
                                  </span>
                                  <h1 class="modal-title">
                                    <shopify-data query="product.title"></shopify-data>
                                  </h1>
                                  <div class="modal-price">
                                    <shopify-money query="product.selectedOrFirstAvailableVariant.price"></shopify-money>
                                  </div>
                                </div>
                                
                                <!-- Variant Selector -->
                                <div class="variant-selector-container">
                                  <shopify-variant-selector></shopify-variant-selector>
                                </div>
                                
                                <!-- Action Buttons -->
                                <div class="modal-buttons">
                                  <button
                                    class="modal-add-btn"
                                    onclick="getElementById('main-cart').addLine(event).then(() => { getElementById('main-cart').showModal(); getElementById('product-modal').close(); });"
                                    shopify-attr--disabled="!product.selectedOrFirstAvailableVariant.availableForSale"
                                  >
                                    Add to Cart
                                  </button>
                                  <button
                                    class="modal-buy-btn"
                                    onclick="document.querySelector('shopify-store').buyNow(event)"
                                    shopify-attr--disabled="!product.selectedOrFirstAvailableVariant.availableForSale"
                                  >
                                    Buy Now
                                  </button>
                                </div>
                                
                                <!-- Product Description -->
                                <div class="modal-description">
                                  <shopify-data query="product.descriptionHtml"></shopify-data>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </template>
                      <div shopify-loading-placeholder class="modal-loading">
                        <p>Loading product details...</p>
                      </div>
                    </shopify-context>
                  </dialog>
                </shopify-store>
              `
            }}
          />

          {/* Floating Cart Button */}
          <div className="hidden fixed bottom-6 right-6">
            <button 
              className="bg-black text-white px-6 py-3 rounded-full shadow-lg hover:bg-gray-800 transition-colors font-medium"
              onClick={() => {
                const cart = document.getElementById('main-cart') as any;
                if (cart) {
                  cart.showModal();
                }
              }}
            >
              Open Cart
            </button>
          </div>
        </div>
      </main>

      <style dangerouslySetInnerHTML={{
        __html: `
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
          
          /* Section Styles */
          .products-section {
            margin-bottom: 3rem;
          }
          
          .section-title {
            font-size: 2rem;
            font-weight: 700;
            margin-bottom: 2rem;
            text-align: center;
            color: #000;
            font-family: 'Times New Roman', serif;
          }
          
          /* Products Grid */
          .products-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 2rem;
            margin-bottom: 2rem;
          }
          
          /* Product Card */
          .product-card {
            background: white;
            border-radius: 0.75rem;
            overflow: hidden;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
            transition: all 0.3s ease;
            position: relative;
          }
          
          .product-card:hover {
            transform: translateY(-4px);
            box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
          }
          
          /* Product Image Container */
          .product-image-container {
            position: relative;
            aspect-ratio: 1;
            overflow: hidden;
            background: #f8f9fa;
          }
          
          .product-image {
            width: 100%;
            height: 100%;
            object-fit: cover;
            transition: transform 0.3s ease;
          }
          
          .product-card:hover .product-image {
            transform: scale(1.05);
          }
          
          /* Quick Add Button (Hover) */
          .quick-add-btn {
            position: absolute;
            top: 1rem;
            right: 1rem;
            background: rgba(0, 0, 0, 0.9);
            color: white;
            padding: 0.5rem 1rem;
            border: none;
            border-radius: 9999px;
            font-size: 0.875rem;
            font-weight: 600;
            cursor: pointer;
            opacity: 0;
            transform: translateY(-8px);
            transition: all 0.3s ease;
            z-index: 10;
          }
          
          .product-card:hover .quick-add-btn {
            opacity: 1;
            transform: translateY(0);
          }
          
          .quick-add-btn:hover {
            background: rgba(0, 0, 0, 1);
            transform: scale(1.05);
          }
          
          /* View Product Button */
          .view-product-btn {
            position: absolute;
            bottom: 1rem;
            left: 50%;
            transform: translateX(-50%) translateY(8px);
            background: white;
            color: #000;
            padding: 0.5rem 1rem;
            border: 2px solid #000;
            border-radius: 0.375rem;
            font-size: 0.875rem;
            font-weight: 600;
            cursor: pointer;
            opacity: 0;
            transition: all 0.3s ease;
            z-index: 10;
          }
          
          .product-card:hover .view-product-btn {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
          }
          
          .view-product-btn:hover {
            background: #000;
            color: white;
          }
          
          /* Product Info */
          .product-info {
            padding: 1.5rem;
          }
          
          .product-title {
            font-size: 1.125rem;
            font-weight: 600;
            margin: 0 0 0.5rem 0;
            color: #000;
            line-height: 1.4;
          }
          
          .product-price {
            font-size: 1.25rem;
            font-weight: 700;
            color: #000;
            margin-bottom: 0.5rem;
          }
          
          .price-range-indicator {
            font-size: 0.875rem;
            color: #6b7280;
            font-weight: 400;
          }
          
          .product-vendor {
            font-size: 0.875rem;
            color: #6b7280;
            margin: 0 0 1rem 0;
            text-transform: uppercase;
            letter-spacing: 0.05em;
          }
          
          /* Add to Cart Button */
          .add-to-cart-btn {
            width: 100%;
            background: #000;
            color: white;
            padding: 0.875rem 1rem;
            border: 2px solid #000;
            border-radius: 0.5rem;
            font-size: 1rem;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
            text-transform: uppercase;
            letter-spacing: 0.05em;
          }
          
          .add-to-cart-btn:hover {
            background: white;
            color: #000;
          }
          
          /* Empty State */
          .empty-state {
            grid-column: 1 / -1;
            text-align: center;
            padding: 3rem;
            color: #6b7280;
            font-size: 1.125rem;
          }
          
          /* Modal Styles */
          .product-modal {
            padding: 0;
            border: none;
            border-radius: 1rem;
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
            max-width: 100vw;
            max-height: 100vh;
            width: fit-content;
            height: auto;
            margin: auto;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            position: fixed;
          }
          
          .product-modal::backdrop {
            background: rgba(0, 0, 0, 0.5);
          }
          
          .modal-container {
            position: relative;
            background: white;
            border-radius: 1rem;
            overflow: hidden;
            width: 100%;
            min-width: 350px;
            max-width: 70rem;
          }
          
          .modal-close-container {
            position: absolute;
            top: 0.75rem;
            right: 0.75rem;
            z-index: 20;
          }
          
          .modal-close-btn {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            background: rgba(0, 0, 0, 0.1);
            border: none;
            font-size: 1.25rem;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.3s ease;
          }
          
          .modal-close-btn:hover {
            background: rgba(0, 0, 0, 0.2);
          }
          
          .modal-content {
            padding: 2rem;
            width: 100%;
            min-height: 400px;
          }
          
          .modal-layout {
            display: grid;
            gap: 2rem;
            grid-template-columns: 1fr;
            width: 100%;
            align-items: start;
            min-height: 350px;
          }
          
          @media (min-width: 768px) {
            .modal-layout {
              grid-template-columns: 1fr 1fr;
              gap: 3rem;
              min-height: 450px;
            }
            .modal-content {
              padding: 2.5rem;
            }
            .modal-details {
              min-height: 400px;
            }
          }
          
          @media (min-width: 1200px) {
            .product-modal {
              max-width: 85vw;
              max-height: 85vh;
            }
            .modal-container {
              max-width: 80rem;
            }
            .modal-content {
              padding: 3rem;
            }
            .modal-layout {
              gap: 4rem;
            }
          }
          
          .modal-media {
            display: flex;
            justify-content: center;
            align-items: flex-start;
            max-height: 800px;
            overflow: hidden;
          }
          
          .modal-image {
            width: 100%;
            max-width: 400px;
            height: auto;
            border-radius: 0.5rem;
            object-fit: cover;
          }
          
          .modal-details {
            display: flex;
            flex-direction: column;
            gap: 1.5rem;
            justify-content: flex-start;
            min-height: 300px;
            padding: 0.5rem 0;
          }
          
          .modal-header {
            display: flex;
            flex-direction: column;
            gap: 0.375rem;
          }
          
          .modal-vendor {
            font-size: 0.75rem;
            text-transform: uppercase;
            letter-spacing: 0.1em;
            color: #6b7280;
            font-weight: 700;
          }
          
          .modal-title {
            font-size: 2rem;
            font-weight: 700;
            margin: 0;
            color: #000;
            line-height: 1.2;
          }
          
          .modal-price {
            font-size: 1.5rem;
            font-weight: 700;
            color: #000;
          }
          
          .variant-selector-container {
            border-top: 1px solid #e5e7eb;
            border-bottom: 1px solid #e5e7eb;
            padding: 1rem 0;
            margin: 0.5rem 0;
          }
          
          .modal-buttons {
            display: flex;
            flex-direction: column;
            gap: 0.75rem;
            margin-top: 1rem;
            margin-bottom: 1rem;
            padding-bottom: 0.5rem;
          }
          
          .modal-add-btn, .modal-buy-btn {
            padding: 1.25rem 2.5rem;
            border: 2px solid #000;
            border-radius: 0.5rem;
            font-size: 1.1rem;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            cursor: pointer;
            transition: all 0.3s ease;
            min-height: 56px;
          }
          
          .modal-add-btn {
            background: #000;
            color: white;
          }
          
          .modal-add-btn:hover {
            background: white;
            color: #000;
          }
          
          .modal-add-btn:disabled {
            opacity: 0.5;
            cursor: not-allowed;
          }
          
          .modal-buy-btn {
            background: white;
            color: #000;
          }
          
          .modal-buy-btn:hover {
            background: #f3f4f6;
          }
          
          .modal-buy-btn:disabled {
            opacity: 0.5;
            cursor: not-allowed;
          }
          
          .modal-description {
            color: #374151;
            line-height: 1.6;
          }
          
          .modal-description p {
            margin: 0 0 1rem 0;
          }
          
          .modal-loading {
            padding: 3rem;
            text-align: center;
            color: #6b7280;
          }
          
          /* Shopify Component Customization */
          shopify-cart::part(dialog) {
            border-radius: 0.75rem;
            max-width: 600px;
            margin: auto;
            padding: 1.5rem;
          }
          
          shopify-cart::part(primary-button) {
            background-color: #000000;
            border: 2px solid #000000;
            border-radius: 0.5rem;
            color: #ffffff;
            font-size: 1rem;
            font-weight: 600;
            padding: 1rem 2rem;
            transition: all 0.3s ease;
          }
          
          shopify-cart::part(primary-button):hover {
            background-color: #ffffff;
            color: #000000;
          }
          
          shopify-cart::part(secondary-button) {
            background-color: #ffffff;
            color: #000000;
            fill: #000000;
            border: 1px solid #e5e7eb;
            border-radius: 0.375rem;
            font-size: 0.875rem;
            padding: 0.5rem 1rem;
            transition: all 0.3s ease;
          }
          
          shopify-cart::part(secondary-button):hover {
            background-color: #f9fafb;
            border-color: #d1d5db;
          }
          
          shopify-variant-selector::part(form) {
            display: flex;
            flex-direction: column;
            gap: 1rem;
          }
          
          shopify-variant-selector::part(label) {
            font-weight: 600;
            margin-bottom: 0.5rem;
            color: #000000;
            font-size: 0.875rem;
            text-transform: uppercase;
            letter-spacing: 0.05em;
          }
          
          shopify-variant-selector::part(radio) {
            margin-right: 0.5rem;
          }
          
          dialog::backdrop {
            background-color: rgba(0, 0, 0, 0.5);
          }
        `
      }} />
    </div>
  );
};

export default Shop;