import React from "react";

const Navbar = () => {
  return (
    <nav className="w-full fixed top-0 left-0 z-50 bg-[#4285f4] shadow-lg py-4 px-8 flex justify-between items-center">
      <div className="text-2xl font-bold text-white tracking-tight">
        Sidekick
      </div>
      <ul className="flex space-x-8 text-white font-medium">
        <li>
          <a
            href="#how-it-works"
            className="hover:text-blue-200 transition-colors"
          >
            How it works
          </a>
        </li>
        <li>
          <a
            href="#templates"
            className="hover:text-blue-200 transition-colors"
          >
            Templates
          </a>
        </li>
        <li>
          <a href="#pricing" className="hover:text-blue-200 transition-colors">
            Pricing
          </a>
        </li>
        <li>
          <a href="/login" className="hover:text-blue-200 transition-colors">
            Login / Sign up
          </a>
        </li>
      </ul>
    </nav>
  );
};

export default Navbar;
