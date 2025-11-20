import { useState } from 'react';
import { Home, Plus, Trophy, User as UserIcon, Palette, LogOut, Gamepad2 } from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from './ui/sidebar';
import { Separator } from './ui/separator';
import { RecentGames } from './RecentGames';
import { Rankings } from './Rankings';
import { CreateGameModal } from './CreateGameModal';
import { JoinGameModal } from './JoinGameModal';
import { UserProfile } from './UserProfile';

type ViewType = 'home' | 'rankings' | 'profile';

interface DashboardProps {
  username: string;
  onJoinGame?: (gameCode: string) => void;
  onLogout?: () => void;
}

export function Dashboard({ username, onJoinGame, onLogout }: DashboardProps) {
  const [currentView, setCurrentView] = useState<ViewType>('home');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50">
        <Sidebar className="border-r border-orange-100 bg-white/80 backdrop-blur-sm">
          <SidebarHeader className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-400 to-amber-400 flex items-center justify-center">
                <Palette className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="bg-gradient-to-r from-orange-500 via-amber-500 to-rose-500 bg-clip-text text-transparent">
                  Drawsync
                </h2>
                <p className="text-gray-500 text-sm">Hola, {username}</p>
              </div>
            </div>
          </SidebarHeader>

          <Separator className="bg-orange-100" />

          <SidebarContent className="p-4">
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={() => setCurrentView('home')}
                  isActive={currentView === 'home'}
                  className="data-[active=true]:bg-gradient-to-r data-[active=true]:from-orange-100 data-[active=true]:to-amber-100 data-[active=true]:text-orange-600 hover:bg-orange-50 transition-all"
                >
                  <Home className="w-5 h-5" />
                  <span>Inicio</span>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={() => setIsCreateModalOpen(true)}
                  className="bg-gradient-to-r from-orange-500 to-amber-500 text-white hover:from-orange-600 hover:to-amber-600 transition-all shadow-md"
                >
                  <Plus className="w-5 h-5" />
                  <span>Crear partida</span>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={() => setIsJoinModalOpen(true)}
                  className="border border-orange-200 text-orange-600 hover:bg-orange-50 transition-all mt-2"
                >
                  <Gamepad2 className="w-5 h-5" />
                  <span>Unirse a partida</span>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={() => setCurrentView('rankings')}
                  isActive={currentView === 'rankings'}
                  className="data-[active=true]:bg-gradient-to-r data-[active=true]:from-orange-100 data-[active=true]:to-amber-100 data-[active=true]:text-orange-600 hover:bg-orange-50 transition-all"
                >
                  <Trophy className="w-5 h-5" />
                  <span>Rankings</span>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={() => setCurrentView('profile')}
                  isActive={currentView === 'profile'}
                  className="data-[active=true]:bg-gradient-to-r data-[active=true]:from-orange-100 data-[active=true]:to-amber-100 data-[active=true]:text-orange-600 hover:bg-orange-50 transition-all"
                >
                  <UserIcon className="w-5 h-5" />
                  <span>Mi perfil</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>

            <Separator className="my-4 bg-orange-100" />

            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={onLogout}
                  className="text-rose-500 hover:bg-rose-50 transition-all"
                >
                  <LogOut className="w-5 h-5" />
                  <span>Cerrar sesión</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarContent>
        </Sidebar>

        <SidebarInset className="flex-1">
          <header className="flex h-16 items-center gap-4 border-b border-orange-100 bg-white/60 backdrop-blur-sm px-6">
            <SidebarTrigger className="text-orange-600 hover:bg-orange-50" />
            <Separator orientation="vertical" className="h-6 bg-orange-100" />
            <h1 className="text-gray-700">
              {currentView === 'home' && 'Mis partidas recientes'}
              {currentView === 'rankings' && 'Rankings globales'}
              {currentView === 'profile' && 'Mi perfil'}
            </h1>
          </header>

          <main className="flex-1 p-6">
            {currentView === 'home' && <RecentGames />}
            {currentView === 'rankings' && <Rankings />}
            {currentView === 'profile' && <UserProfile />}
          </main>
        </SidebarInset>
      </div>

      <CreateGameModal
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
        onGameCreated={onJoinGame}
        username={username}
      />
      <JoinGameModal
        open={isJoinModalOpen}
        onOpenChange={setIsJoinModalOpen}
        onGameJoined={onJoinGame}
        username={username}
      />
    </SidebarProvider>
  );
}