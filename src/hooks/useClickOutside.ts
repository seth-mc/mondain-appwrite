import { useEffect, useRef } from 'react';

export const useClickOutside = <T extends HTMLElement = HTMLElement>(
  handler: (event: MouseEvent | TouchEvent) => void,
  listenCapturing: boolean = true
) => {
  const ref = useRef<T>(null);

  useEffect(() => {
    const handleClick = (event: MouseEvent | TouchEvent) => {
      // If the ref doesn't exist or the click is inside the element, don't call handler
      if (!ref.current || ref.current.contains(event.target as Node)) {
        return;
      }
      
      // Click is outside the element, call the handler
      handler(event);
    };

    // Add event listeners for both mouse and touch events
    document.addEventListener('click', handleClick, listenCapturing);
    document.addEventListener('touchstart', handleClick, listenCapturing);

    // Cleanup event listeners
    return () => {
      document.removeEventListener('click', handleClick, listenCapturing);
      document.removeEventListener('touchstart', handleClick, listenCapturing);
    };
  }, [handler, listenCapturing]);

  return ref;
};

export default useClickOutside; 