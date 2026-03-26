import { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { gsap } from "gsap";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { DarkModeProps } from '@/types'

// Register GSAP plugins
gsap.registerPlugin(ScrollToPlugin, ScrollTrigger);

const RootLayout = ({ isAdmin, darkMode, toggleDarkMode }: DarkModeProps) => {
  const location = useLocation();

  useEffect(() => {
    const smoothScroll = () => {
      gsap.to(window, {
        duration: 1,
        scrollTo: { y: 0, autoKill: false },
        ease: "power2.inOut"
      });
    };

    smoothScroll();

    return () => {
      gsap.killTweensOf(window);
    };
  }, [location.pathname]);

  return (
    <div className="bg-light-1 transition min-h-screen w-screen relative">
      <section className="w-full">
        <Outlet context={{ darkMode, isAdmin, toggleDarkMode }} />
      </section>

      <iframe title="frame01" className="sc-widget" frameBorder="no" allow="autoplay" src="https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/1909915274&color=%23ff5500&auto_play=false&hide_related=false&show_comments=true&show_user=true&show_reposts=false&show_teaser=true&visual=true"></iframe>
    </div>
  )
}

export default RootLayout