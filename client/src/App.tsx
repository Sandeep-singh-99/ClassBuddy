import { Outlet } from "react-router-dom";
import Footer from "./components/Footer";
import Navbar from "./components/Navbar";
import { useEffect } from "react";
import { useAppDispatch } from "./hooks/hooks";
import { checkAuth } from "./redux/slice/authSlice";

export default function App() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(checkAuth())
  }, [dispatch])
  
  return (
    <>
      <Navbar />
      <Outlet />
      <Footer />
    </>
  );
}
