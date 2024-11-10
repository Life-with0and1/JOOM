import Image from "next/image";
import React from "react";

const Loader = () => {
  return (
    <div className="flex-center h-scren w-full">
      <Image src="/icons/loading-circle.svg" width={50} height={50} />
    </div>
  );
};

export default Loader;
