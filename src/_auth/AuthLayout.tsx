import { Outlet } from "react-router-dom";

export default function AuthLayout() {

  return (
    <>
      <section className="bg-light-1 flex flex-1 justify-center items-center flex-col py-10">
        <Outlet />
      </section>

      <img
        src="https://mondain-presigned-media.s3.us-east-2.amazonaws.com/uploads/95b9396b-9197-48ef-997e-c72c774948d5.svg"
        alt="logo"
        className="hidden xl:block h-screen w-1/2 object-cover bg-no-repeat"
      />
    </>
  );
}
