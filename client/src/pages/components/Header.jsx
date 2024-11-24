import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import defaultProfileImg from "../../assets/images/profile.png";

const Header = () => {
  const { currentUser } = useSelector((state) => state.user);
  const location = useLocation();
  const currentPath = location.pathname;

  const navItems = [
    { key: "/", label: "Home", to: "/" },
    { key: "/search", label: "Packages", to: "/search" },
  ];

  return (
    <>
      <div className="bg-black/90 p-4 flex justify-between items-center">
        <h1
          className="h-min text-4xl font-bold relative"
          style={{
            color: "transparent",
            WebkitTextStroke: "0.7px",
            WebkitTextStrokeColor: "#fff",
          }}
        >
          Come
          <span
            className="shadow-xl rounded-lg text-slate-400 text-2xl absolute left-1 top-[-10px] text-center"
            style={{
              WebkitTextStroke: "0",
            }}
          >
            Dream Tours
          </span>
        </h1>
        <nav className="flex items-center justify-center space-x-10 text-slate-400">
          {navItems.map((item) => (
            <Link
              key={item.key}
              to={item.to}
              className={`${
                currentPath === item.key
                  ? "font-bold bg-transparent p-2 rounded-md text-white"
                  : ""
              } hover: hover:scale-105 transition-all duration-150`}
            >
              {item.label}
            </Link>
          ))}
          <div className="w-10 h-10 flex items-center justify-center ">
            {currentUser ? (
              <Link
                to={`/profile/${
                  currentUser.user_role === 1 ? "admin" : "user"
                }`}
              >
                <img
                  src={currentUser.avatar || defaultProfileImg}
                  alt={currentUser.username}
                  className="border w-10 h-10 border-black rounded-[50%]"
                />
              </Link>
            ) : (
              <Link to={`/login`} className="bg-white py-1 px-3 text-black font-semibold mr-3">Login</Link>
            )}
          </div>
        </nav>
      </div>
    </>
  );
};

export default Header;
