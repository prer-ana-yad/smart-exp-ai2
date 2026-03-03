import { useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { Home, BarChart2, Settings } from "lucide-react";
import { motion } from "framer-motion";
import "./BottomNav.css";

export default function BottomNav() {


  const [showNav, setShowNav] = useState(true);
  const [lastScroll, setLastScroll] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScroll = window.scrollY;

      if (currentScroll > lastScroll) {
        setShowNav(false); // scrolling down
      } else {
        setShowNav(true); // scrolling up
      }

      setLastScroll(currentScroll);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScroll]);

 
















  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { path: "/home", icon: Home },
    { path: "/statistics", icon: BarChart2 },
    { path: "/settings", icon: Settings }
  ];

  const activeIndex = navItems.findIndex(
    (item) => item.path === location.pathname
  );

   return(
    <div className ={`bottom-nav ${showNav ? "show" :"hide"}`}>
        {navItems.map((item,index)=>{
            const Icon =item.icon;
            const isActive = location.pathname ===item.path;

            return(
                <div
                key={item.path}
                className={`nav-items ${isActive ? "active" : ""}`}
                onClick={() => navigate(item.path)}
                >
                    <motion.div
                    whileTap={{ scale: 0.8}}
                    className="icon-wrapper"
                    >
                        <Icon size={22}/>
                    </motion.div>

                    {isActive && (
                        <motion.div
                        layoutId="active-indicator"
                        className="active-indicator"
                        />
                    )}
                    </div>
            );
        })}
        </div>
   );
                   
   
       














        
    }
    
  
