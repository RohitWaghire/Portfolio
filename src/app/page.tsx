import { Playground } from '@/components/Playground';
import { SidePanel } from '@/components/SidePanel';
import { Sheets } from '@/components/Sheets';

export default function HomePage() {
  return (
    <main className="relative h-dvh w-full overflow-hidden">
      <Playground />
      <SidePanel />
      <Sheets />
    </main>
  );
}
