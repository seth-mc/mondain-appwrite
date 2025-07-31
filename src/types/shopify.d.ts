declare namespace JSX {
  interface IntrinsicElements {
    'shopify-store': {
      'store-domain'?: string;
      'country'?: string;
      'language'?: string;
      'public-access-token'?: string;
    };
    'shopify-context': {
      'type'?: string;
      'handle'?: string;
      children?: React.ReactNode;
    };
    'shopify-list-context': {
      'type'?: string;
      'query'?: string;
      'first'?: string;
      children?: React.ReactNode;
    };
    'shopify-data': {
      'query'?: string;
      children?: React.ReactNode;
    };
    'shopify-money': {
      'query'?: string;
      children?: React.ReactNode;
    };
    'shopify-media': {
      'max-images'?: string;
      'width'?: string;
      'height'?: string;
      'query'?: string;
      'className'?: string;
    };
    'shopify-product-modal': {
      children?: React.ReactNode;
    };
    'shopify-buy-button': {
      'quantity'?: string;
      children?: React.ReactNode;
    };
    'shopify-cart': {
      'id'?: string;
    };
    'template': {
      'slot'?: string;
      children?: React.ReactNode;
    };
  }
} 