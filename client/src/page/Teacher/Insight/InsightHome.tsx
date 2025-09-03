import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import { Outlet } from "react-router-dom";


export default function InsightHome() {
  return (
    <>
    <Navbar />
    <Outlet />
    <Footer />
    </>
  )
}
