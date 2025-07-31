import * as React from "react"
import Autoplay from "embla-carousel-autoplay"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel"

type Category = {
  name: string;
}

type CarouselPluginProps = {
  activeCategory: string;
  categories: Category[];
  setActiveCategory: React.Dispatch<React.SetStateAction<string>>;
  setSearchValue: React.Dispatch<React.SetStateAction<string>>;
}

function CarouselPlugin({ activeCategory, categories, setActiveCategory, setSearchValue }: CarouselPluginProps) {
  const plugin = React.useRef(
    Autoplay({ delay: 3000, stopOnInteraction: false })
  )

  // Split categories into chunks of 8
  const chunks = categories.reduce((resultArray: Category[][], item: Category, index: number) => {
    const chunkIndex = Math.floor(index/4)
    if(!resultArray[chunkIndex]) {
      resultArray[chunkIndex] = []
    }
    resultArray[chunkIndex].push(item)
    return resultArray
  }, [])

  return (
    <Carousel
      plugins={[plugin.current]}
      className="d w-full"
      onMouseEnter={plugin.current.stop}
      onMouseLeave={plugin.current.reset}
    >
      <CarouselContent>
        {chunks.map((chunk, index) => (
          <CarouselItem key={index} className="max-w-full">
            <div className="flex justify-center gap-2 flex-wrap">
              {chunk.map(category => (
                <div key={category.name} className="flex items-center px-2 mb-2" onClick={() => {
                  setActiveCategory(category.name)
                  setSearchValue("")
                }}>
                  <button
                    className={`rounded-full p-2 transition duration-300 ease-in-out ${activeCategory === category.name ? 'btn-radial-green' : 'btn-radial-gray'}`}
                  >
                    {/* Add your button icon here */}
                  </button>
                  <p
                    className={`cursor-pointer p-2 text-dark-1 font-times transition duration-300 ease-in-out ${activeCategory === category.name ? 'text-dark-1' : 'text-light-3'} rounded-full`}
                  >
                    {category.name}
                  </p>
                </div>
              ))}
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
    </Carousel>
  )
}

export default CarouselPlugin;
