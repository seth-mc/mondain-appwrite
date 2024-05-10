import { useState, useEffect } from 'react';

type ImageSwitcherProps = {
    imageUrls: string[];
};

const ImageSwitcher = ({ imageUrls }: ImageSwitcherProps) => {
    const [currentIndex, setCurrentIndex] = useState(0);

    // Preload images
    useEffect(() => {
        imageUrls.forEach(url => {
            const img = new Image();
            img.src = url;
        });
    }, [imageUrls]);

    // Function to handle next image
    const handleNext = () => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % imageUrls.length);
    };

    // Function to handle previous image
    const handlePrev = () => {
        setCurrentIndex((prevIndex) => {
            if (prevIndex === 0) return imageUrls.length - 1;
            return prevIndex - 1;
        });
    };

    return (
        <div>
            {imageUrls.length > 1 && (
                <button onClick={handlePrev}>Previous</button>
            )}
            <img src={imageUrls[currentIndex]} alt={`Slide ${currentIndex}`} />
            {imageUrls.length > 1 && (
                <button onClick={handleNext}>Next</button>
            )}
        </div>
    );
};

export default ImageSwitcher;
