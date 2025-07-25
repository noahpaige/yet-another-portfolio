"use client";

import React from "react";

const ArticleH1: React.FC<
  React.HTMLAttributes<HTMLHeadingElement> & { id: string }
> = ({ id, ...props }) => {
  const handleClick = () => {
    window.location.hash = `#${id}`;
  };
  return (
    <h1
      id={id}
      className="text-6xl font-bold text-zinc-100 mb-12 mt-16 scroll-mt-30 hover:underline cursor-pointer transition-all duration-200 text-center"
      onClick={handleClick}
      {...props}
    />
  );
};

const ArticleH2: React.FC<
  React.HTMLAttributes<HTMLHeadingElement> & { id: string }
> = ({ id, ...props }) => {
  const handleClick = () => {
    window.location.hash = `#${id}`;
  };
  return (
    <h2
      id={id}
      className="text-5xl font-medium text-zinc-100 mb-8 mt-12 scroll-mt-30 hover:underline cursor-pointer transition-all duration-200"
      onClick={handleClick}
      {...props}
    />
  );
};

const ArticleH3: React.FC<
  React.HTMLAttributes<HTMLHeadingElement> & { id: string }
> = ({ id, ...props }) => {
  const handleClick = () => {
    window.location.hash = `#${id}`;
  };
  return (
    <h3
      id={id}
      className="text-5xl font-light text-zinc-100 mb-6 mt-8 scroll-mt-30 hover:underline cursor-pointer transition-all duration-200"
      onClick={handleClick}
      {...props}
    />
  );
};

const ArticleH4: React.FC<
  React.HTMLAttributes<HTMLHeadingElement> & { id: string }
> = ({ id, ...props }) => {
  const handleClick = () => {
    window.location.hash = `#${id}`;
  };
  return (
    <h4
      id={id}
      className="text-2xl font-extralight text-zinc-100 mb-3 mt-6 scroll-mt-24 hover:underline cursor-pointer transition-all duration-200"
      onClick={handleClick}
      {...props}
    />
  );
};

export { ArticleH1, ArticleH2, ArticleH3, ArticleH4 };
