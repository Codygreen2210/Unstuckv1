import { AppNavTop, AppNavBottom } from "@/components/app-nav";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh flex flex-col">
      <AppNavTop />
      <main className="flex-1 pb-24 md:pb-10">
        <div className="mx-auto max-w-3xl w-full px-5 md:px-6">{children}</div>
      </main>
      <AppNavBottom />
    </div>
  );
}
