import { Contact, LayoutDashboard, Menu } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import AuthComponent from "./AuthComponent";
import { Button } from "./ui/button";
import { useAppSelector } from "@/hooks/hooks";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  const { user } = useAppSelector((state) => state.auth);

  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-[#0c1729]/80 backdrop-blur-md border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link
          to={"/"}
          className="text-2xl font-bold text-yellow-400 tracking-tight"
        >
          ClassBuddy
        </Link>

        {/* Desktop Links */}
       {
        user ? (
           <div className="hidden md:flex items-center gap-4 text-gray-300">
          <Link to={"/contact"} className="hover:text-yellow-400 transition">
            <Button variant={"outline"}>
              <Contact />
              Contact
            </Button>
          </Link>


          <Link to={"/dashboard"} className="hover:text-yellow-400 transition">
            <Button variant={"outline"}>
              <LayoutDashboard />
              Dashboard
            </Button>
          </Link>

          <Link to={"/profile"} className="hover:text-yellow-400 transition">
            <img src={user.image_url} alt={user.full_name} className="w-8 h-8 rounded-full object-cover" />
          </Link>
        </div>
        ) : (
          <AuthComponent />
        )
       }

        {/* Mobile Menu Button */}
        <button
          className="md:hidden text-gray-300"
          onClick={() => setIsOpen(!isOpen)}
        >
          <Menu className="w-7 h-7" />
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-[#0c1729] border-t border-gray-800 flex flex-col items-center py-6 space-y-4">
          <a
            href="#home"
            className="text-gray-300 hover:text-yellow-400 transition"
          >
            Home
          </a>
          <a
            href="#features"
            className="text-gray-300 hover:text-yellow-400 transition"
          >
            Features
          </a>
          <a
            href="#testimonials"
            className="text-gray-300 hover:text-yellow-400 transition"
          >
            Testimonials
          </a>
          <Link
            to={"/contact"}
            className="text-gray-300 hover:text-yellow-400 transition"
          >
            Contact
          </Link>
          <AuthComponent />
        </div>
      )}
    </nav>
  );
}







// import { Contact, LayoutDashboard, Menu, X, Sparkles } from "lucide-react";
// import { useState } from "react";
// import { Link } from "react-router-dom";
// import AuthComponent from "./AuthComponent";
// import { Button } from "./ui/button";
// import { useAppSelector } from "@/hooks/hooks";

// export default function Navbar() {
//   const [isOpen, setIsOpen] = useState(false);
//   const { user } = useAppSelector((state) => state.auth);

//   return (
//     <nav className="fixed top-0 left-0 w-full z-50 bg-[#0c1729]/80 backdrop-blur-lg border-b border-gray-800">
//       <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
//         {/* Logo */}
//         <Link
//           to={"/"}
//           className="flex items-center gap-2 text-2xl font-bold text-yellow-400 tracking-tight hover:opacity-90 transition"
//         >
//           <Sparkles className="w-6 h-6 text-yellow-400" />
//           ClassBuddy
//         </Link>

//         {/* Desktop Links */}
//         {user ? (
//           <div className="hidden md:flex items-center gap-6 text-gray-300 font-medium">
//             <Link
//               to={"/contact"}
//               className="hover:text-yellow-400 transition flex items-center gap-2"
//             >
//               <Button variant="outline" className="flex items-center gap-2">
//                 <Contact className="w-4 h-4" />
//                 Contact
//               </Button>
//             </Link>

//             <Link
//               to={"/dashboard"}
//               className="hover:text-yellow-400 transition flex items-center gap-2"
//             >
//               <Button variant="outline" className="flex items-center gap-2">
//                 <LayoutDashboard className="w-4 h-4" />
//                 Dashboard
//               </Button>
//             </Link>

//             {/* Profile Avatar */}
//             <Link
//               to={"/profile"}
//               className="hover:scale-105 transition-transform"
//             >
//               <img
//                 src={user.image_url}
//                 alt={user.full_name}
//                 className="w-9 h-9 rounded-full ring-2 ring-gray-700 hover:ring-yellow-400 transition"
//               />
//             </Link>
//           </div>
//         ) : (
//           <div className="hidden md:block">
//             <AuthComponent />
//           </div>
//         )}

//         {/* Mobile Toggle */}
//         <button
//           className="md:hidden text-gray-300 focus:outline-none"
//           onClick={() => setIsOpen(!isOpen)}
//         >
//           {isOpen ? <X className="w-7 h-7" /> : <Menu className="w-7 h-7" />}
//         </button>
//       </div>

//       {/* Mobile Menu */}
//       {isOpen && (
//         <div className="md:hidden bg-[#0c1729] border-t border-gray-800 py-6 px-6 animate-slide-down">
//           <div className="flex flex-col items-center space-y-4 text-lg font-medium">
//             <Link
//               to={"/"}
//               className="text-gray-300 hover:text-yellow-400 transition"
//               onClick={() => setIsOpen(false)}
//             >
//               Home
//             </Link>
//             <a
//               href="#features"
//               className="text-gray-300 hover:text-yellow-400 transition"
//               onClick={() => setIsOpen(false)}
//             >
//               Features
//             </a>
//             <a
//               href="#testimonials"
//               className="text-gray-300 hover:text-yellow-400 transition"
//               onClick={() => setIsOpen(false)}
//             >
//               Testimonials
//             </a>
//             <Link
//               to={"/contact"}
//               className="text-gray-300 hover:text-yellow-400 transition"
//               onClick={() => setIsOpen(false)}
//             >
//               Contact
//             </Link>

//             {/* Mobile Auth / User */}
//             <div className="pt-4">
//               {user ? (
//                 <Link to={"/dashboard"} onClick={() => setIsOpen(false)}>
//                   <Button className="w-full bg-yellow-400 text-black hover:bg-yellow-500">
//                     Dashboard
//                   </Button>
//                 </Link>
//               ) : (
//                 <AuthComponent />
//               )}
//             </div>
//           </div>
//         </div>
//       )}
//     </nav>
//   );
// }
