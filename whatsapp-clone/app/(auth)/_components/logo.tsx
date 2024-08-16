import Image from "next/image";
import { cn } from "@/lib/utils";
import { Poppins } from "next/font/google";
import { Banana } from "lucide-react";

const font = Poppins({
  subsets: ["latin"],
  weight: ["200", "300", "400", "500", "600", "700", "800"],
});

export const Logo = () => {
  return (
    <div className="flex flex-col items-center gap-y-4">
      <div className="bg-white rounded-full p-1">
        <Banana className="rounded-xl w-28 h-20" />
      </div>
      <div className={cn("flex flex-col items-center", font.className)}>
        <p className="text-xl font-semibold text-green-700">
          Whatsapp(Clone) Messenger
        </p>
      </div>
    </div>
  );
};
