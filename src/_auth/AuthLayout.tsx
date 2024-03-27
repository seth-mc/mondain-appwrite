import { Outlet, Navigate } from "react-router-dom";

import { useUserContext } from "@/context/AuthContext";

export default function AuthLayout() {
  const { user, isAuthenticated } = useUserContext();

  // Check if the user has the "admin" label
  const isAdmin = user && user.labels && user.labels.includes('admin');


  return (
    <>
      {isAuthenticated ? (
        <Navigate to={isAdmin ? "/admin" : "/"} />
      ) : (
        <>
          <section className="flex flex-1 justify-center items-center flex-col py-10">
            <Outlet />
          </section>

          <img
            src="/assets/images/side-img.svg"
            alt="logo"
            className="hidden xl:block h-screen w-1/2 object-cover bg-no-repeat"
          />
        </>
      )}
    </>
  );
}
