import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Sidebar from '@/components/sidebar';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session) redirect('/login');

  return (
    <div className="flex h-screen overflow-hidden bg-zinc-950 text-zinc-100 selection:bg-zinc-800 selection:text-white">
      <Sidebar />
      <main className="flex-1 overflow-y-auto bg-zinc-950/80">
        <div className="max-w-7xl mx-auto p-8 lg:p-10 space-y-8">
          {children}
        </div>
      </main>
    </div>
  );
}
