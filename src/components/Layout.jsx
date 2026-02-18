import { Outlet } from 'react-router-dom';
import { BottomNav } from './BottomNav';
import { Sidebar } from './Sidebar';

export function Layout() {
  return (
    <div className="flex min-h-[100dvh] flex-col bg-background">
      <Sidebar />
      <main className="flex-1 pb-20 md:pb-6 md:pl-52">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  );
}
