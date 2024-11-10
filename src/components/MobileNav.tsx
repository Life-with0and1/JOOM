"use client";

import Image from "next/image";
import { Sheet, SheetClose, SheetContent, SheetTrigger } from "./ui/sheet";
import Link from "next/link";
import { SidebarLinks } from "@/constants";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";

const MobileNav = () => {
  const pathname = usePathname();
  return (
    <section className="w-full max-w-[264px]">
      <Sheet>
        <SheetTrigger asChild>
          <Image
            src="/icons/hamburger.svg"
            width={36}
            height={36}
            alt="hamburger"
            className="cursor-pointer sm:hidden"
          />
        </SheetTrigger>
        <SheetContent side="left" className="border-none bg-dark-1">
          <Link href="/" className="flex items-center gap-1">
            <Image
              className="max-sm:size-10"
              src="/icons/logo.svg"
              width={32}
              height={32}
              alt="logo"
            />
            <p className="text-[26px] font-extrabold text-white">Joom</p>
          </Link>
          <div className="flex h-[calc(100vh-72px)] flex-col justify-between overflow-y-auto">
            <SheetClose asChild>
              <section className="flex h-full flex-col gap-6 pt-16 text-white">
                {SidebarLinks.map((link) => {
                  const isActive =
                    pathname === link.route;
                  return (
                    <SheetClose asChild key={link.route}>

                    <Link
                      href={link.route}
                      className={cn(
                        "flex gap-4 items-center p-4 rounded-lg max-w-60",
                        {
                          "bg-blue-1": isActive,
                        }
                      )}
                      key={link.label}
                    >
                      <Image
                        alt={link.label}
                        height={20}
                        width={20}
                        src={link.imgUrl}
                      />
                      <p className="font-semibold">
                        {link.label}
                      </p>
                    </Link>
                    </SheetClose>
                  );
                })}
              </section>
            </SheetClose>
          </div>
        </SheetContent>
      </Sheet>
    </section>
  );
};

export default MobileNav;
