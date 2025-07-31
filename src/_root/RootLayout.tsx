import { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { gsap } from "gsap";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { DarkModeProps } from '@/types'
import { Header } from "@/components/shared";

// Register GSAP plugins
gsap.registerPlugin(ScrollToPlugin, ScrollTrigger);

const RootLayout = ({ isAdmin, darkMode, toggleDarkMode }: DarkModeProps) => {
  const location = useLocation();

  useEffect(() => {
    // Initialize smooth scrolling
    const smoothScroll = () => {
      gsap.to(window, {
        duration: 1,
        scrollTo: {
          y: 0,
          autoKill: false
        },
        ease: "power2.inOut"
      });
    };

    // Scroll to top on route change
    smoothScroll();

    // Cleanup
    return () => {
      gsap.killTweensOf(window);
    };
  }, [location.pathname]);

  return (
    <div className="bg-light-1 transition h-screen w-screen overflow-y-scroll relative">
      <Header isAdmin={isAdmin} darkMode={darkMode} toggleDarkMode={toggleDarkMode} />

      <section className=" w-full h-full">
        <Outlet context={{ darkMode, isAdmin, toggleDarkMode }} />
      </section>

      <iframe title="frame01" className="sc-widget" frameBorder="no" allow="autoplay"  src="https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/1909915274&color=%23ff5500&auto_play=false&hide_related=false&show_comments=true&show_user=true&show_reposts=false&show_teaser=true&visual=true"></iframe>
    </div>
  )
}

export default RootLayout