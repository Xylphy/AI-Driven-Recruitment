import React from "react";

const Footer: React.FC = () => {
  return (
    <footer
      style={{ textAlign: "center", padding: "1rem", background: "#f1f1f1" }}
    >
      <p>
        &copy; {new Date().getFullYear()} Alliance. All rights reserved. Change
        lang diri guads thanks
      </p>
    </footer>
  );
};

export default Footer;
