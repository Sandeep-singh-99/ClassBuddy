import { Outlet } from "react-router-dom";
import Footer from "./components/Footer";
import Navbar from "./components/Navbar";
import { useEffect } from "react";
import { useAppDispatch } from "./hooks/hooks";
import { checkAuth } from "./redux/slice/authSlice";
// import { ToastContainer } from "react-toastify";
import { Toaster } from "@/components/ui/sonner";

export default function App() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(checkAuth());
  }, [dispatch]);

  return (
    <>
      <Toaster />
      <Navbar />
      <Outlet />
      <Footer />
    </>
  );
}
