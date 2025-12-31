import { Wallet, TrendingUp } from "lucide-react";

export function Logo() {
    return (
        <div className="flex items-center gap-3 select-none group">
            {/* İkon Kısmı */}
            <div className="relative">
                <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 shadow-lg shadow-blue-500/20 group-hover:shadow-blue-500/30 transition-all duration-300 group-hover:scale-105">
                    <Wallet className="w-5 h-5 text-white/90" strokeWidth={2.5} />
                </div>
                <div className="absolute -bottom-1 -right-1 bg-green-500 rounded-full p-[3px] border-[3px] border-background">
                    <TrendingUp className="w-2.5 h-2.5 text-white" strokeWidth={3} />
                </div>
            </div>

            {/* Yazı Kısmı */}
            <div className="flex flex-col">
                <div className="flex items-baseline gap-[1px]">
                    <span className="text-xl font-black bg-clip-text text-transparent bg-gradient-to-r from-blue-700 to-indigo-800 dark:from-blue-400 dark:to-indigo-300 tracking-tighter">
                        Harcama
                    </span>
                    <span className="text-xl font-light text-foreground/80 tracking-tight">
                        Takip
                    </span>
                </div>
                <div className="h-[2px] w-full bg-gradient-to-r from-blue-600/50 to-transparent rounded-full mt-0.5"></div>
            </div>
        </div>
    );
}
