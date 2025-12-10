'use client'

import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { ThemeToggle } from "@/components/theme-toggle";
import { TooltipProvider } from "@/components/ui/tooltip";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const style = {
        "--sidebar-width": "16rem",
        "--sidebar-width-icon": "3rem",
    };

    return (
        <TooltipProvider>
            <SidebarProvider style={style as React.CSSProperties}>
                <div className="flex min-h-screen w-full">
                    <AppSidebar />
                    <div className="flex flex-col flex-1 min-w-0">
                        <header className="sticky top-0 z-40 flex h-16 items-center justify-between gap-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4">
                            <SidebarTrigger data-testid="button-sidebar-toggle" />
                            <ThemeToggle />
                        </header>
                        <main className="flex-1 p-4 md:p-6 overflow-auto">
                            {children}
                        </main>
                    </div>
                </div>
            </SidebarProvider>
        </TooltipProvider>
    );
}
