import { Archive, HomeIcon, LogOut, Settings, SquareLibrary, Trash2 } from 'lucide-react'
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@web-archive/shared/components/side-bar'
import { useEffect, useState } from 'react'
import { isNumberString } from '@web-archive/shared/utils'
import { useLocation } from 'react-router-dom'
import { ScrollArea } from '@web-archive/shared/components/scroll-area'
import SettingDialog from './setting-dialog'
import SidebarFolderMenu from './side-bar-folder-menu'
import SidebarTagMenu from './side-bar-tag-menu'
import { Link, useNavigate, useParams } from '~/router'

interface SidebarProps {
  selectedTag: number | null
  setSelectedTag: (tag: number | null) => void
}

function Component({ selectedTag, setSelectedTag }: SidebarProps) {
  const navigate = useNavigate()

  const [openedFolder, setOpenedFolder] = useState<number | null>(null)
  const { slug } = useParams('/folder/:slug')
  const { pathname } = useLocation()

  useEffect(() => {
    if (pathname.startsWith('/folder/') && isNumberString(slug))
      setOpenedFolder(Number(slug))
    else
      setOpenedFolder(null)
  }, [slug, pathname])

  const handleLogout = () => {
    localStorage.removeItem('token')
    navigate('/login')
  }

  const [settingDialogOpen, setSettingDialogOpen] = useState(false)

  const isActive = (path: string) => pathname === path

  return (
    <Sidebar className="border-r border-border/40">
      <SettingDialog open={settingDialogOpen} setOpen={setSettingDialogOpen} />

      <SidebarHeader className="p-6 pb-4">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10 group-hover:bg-primary/15 transition-colors">
            <Archive className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="font-serif text-lg font-semibold text-foreground leading-tight">
              Web Archive
            </h2>
            <p className="text-xs text-muted-foreground">Your digital library</p>
          </div>
        </Link>
      </SidebarHeader>

      <SidebarContent className="px-3">
        <ScrollArea className="h-full">
          <div className="space-y-1">
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  className={`w-full justify-start h-10 px-3 rounded-lg transition-all ${
                    isActive('/')
                      ? 'bg-primary/10 text-primary font-medium'
                      : 'hover:bg-accent text-foreground'
                  }`}
                >
                  <Link to="/">
                    <HomeIcon className="w-4 h-4 mr-3" />
                    <span>Home</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>

            <div className="pt-4">
              <SidebarFolderMenu
                openedFolder={openedFolder}
                setOpenedFolder={setOpenedFolder}
              />
            </div>

            <div className="pt-2">
              <SidebarTagMenu
                selectedTag={selectedTag}
                setSelectedTag={setSelectedTag}
                selectedFolder={openedFolder}
              />
            </div>
          </div>
        </ScrollArea>
      </SidebarContent>

      <SidebarFooter className="p-3 border-t border-border/40">
        <SidebarMenu className="space-y-0.5">
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className={`w-full justify-start h-9 px-3 rounded-lg text-sm ${
                pathname.startsWith('/showcase')
                  ? 'bg-primary/10 text-primary font-medium'
                  : 'hover:bg-accent text-muted-foreground hover:text-foreground'
              }`}
            >
              <Link to="/showcase/folder">
                <SquareLibrary className="w-4 h-4 mr-3" />
                Showcase
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>

          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={() => setSettingDialogOpen(true)}
              className="w-full justify-start h-9 px-3 rounded-lg text-sm hover:bg-accent text-muted-foreground hover:text-foreground"
            >
              <Settings className="w-4 h-4 mr-3" />
              Settings
            </SidebarMenuButton>
          </SidebarMenuItem>

          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className={`w-full justify-start h-9 px-3 rounded-lg text-sm ${
                isActive('/trash')
                  ? 'bg-primary/10 text-primary font-medium'
                  : 'hover:bg-accent text-muted-foreground hover:text-foreground'
              }`}
            >
              <Link to="/trash">
                <Trash2 className="w-4 h-4 mr-3" />
                Trash
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>

          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={() => {
                setOpenedFolder(null)
                handleLogout()
              }}
              className="w-full justify-start h-9 px-3 rounded-lg text-sm hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
            >
              <LogOut className="w-4 h-4 mr-3" />
              Logout
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}

export default Component
