import {
  Archive,
  Folder,
  FolderOpen,
  Hash,
  Home,
  LogOut,
  MoreHorizontal,
  Pencil,
  Plus,
  Trash2,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { isNumberString } from '@web-archive/shared/utils'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@web-archive/shared/components/ui/sidebar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@web-archive/shared/components/ui/dropdown-menu'
import { Button } from '@web-archive/shared/components/ui/button'
import { Link, useNavigate, useParams } from '~/router'
import { createFolder, deleteFolder, getAllFolder, updateFolder } from '~/data/folder'
import { deleteTag, getAllTag, updateTag } from '~/data/tag'
import NewFolderDialog from '~/components/new-folder-dialog'
import EditFolderDialog from '~/components/edit-folder-dialog'
import EditTagDialog from '~/components/edit-tag-dialog'

interface AppSidebarProps {
  selectedTag: number | null
  setSelectedTag: (tag: number | null) => void
}

export default function AppSidebar({
  selectedTag,
  setSelectedTag,
}: AppSidebarProps) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [openedFolder, setOpenedFolder] = useState<number | null>(null)
  const { slug } = useParams('/folder/:slug')
  const { pathname } = useLocation()

  // Dialogs state
  const [newFolderOpen, setNewFolderOpen] = useState(false)
  const [editFolderId, setEditFolderId] = useState<number | null>(null)
  const [editFolderName, setEditFolderName] = useState('')
  const [editTagId, setEditTagId] = useState<number | null>(null)
  const [editTagName, setEditTagName] = useState('')

  // Queries
  const { data: folders = [] } = useQuery({
    queryKey: ['folders'],
    queryFn: getAllFolder,
  })

  const { data: tags = [] } = useQuery({
    queryKey: ['tags'],
    queryFn: getAllTag,
  })

  // Mutations
  const deleteFolderMutation = useMutation({
    mutationFn: deleteFolder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['folders'] })
      toast.success('Folder deleted')
      navigate('/')
    },
  })

  const createFolderMutation = useMutation({
    mutationFn: createFolder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['folders'] })
      toast.success('Folder created')
      setNewFolderOpen(false)
    },
  })

  const updateFolderMutation = useMutation({
    mutationFn: ({ id, name }: { id: number, name: string }) =>
      updateFolder(id, name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['folders'] })
      toast.success('Folder updated')
      setEditFolderId(null)
    },
  })

  const deleteTagMutation = useMutation({
    mutationFn: deleteTag,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tags'] })
      toast.success('Tag deleted')
      if (selectedTag)
        setSelectedTag(null)
    },
  })

  const updateTagMutation = useMutation({
    mutationFn: ({ id, name }: { id: number, name: string }) =>
      updateTag({ id, name }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tags'] })
      toast.success('Tag updated')
      setEditTagId(null)
    },
  })

  useEffect(() => {
    if (pathname.startsWith('/folder/') && isNumberString(slug)) {
      setOpenedFolder(Number(slug))
    }
    else {
      setOpenedFolder(null)
    }
  }, [slug, pathname])

  const handleLogout = () => {
    localStorage.removeItem('token')
    navigate('/login')
  }

  const isActive = (path: string) => pathname === path

  return (
    <>
      <Sidebar>
        <SidebarHeader className="border-b border-sidebar-border">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton size="lg" asChild>
                <Link to="/">
                  <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                    <Archive className="size-4" />
                  </div>
                  <div className="flex flex-col gap-0.5 leading-none">
                    <span className="font-semibold">Web Archive</span>
                    <span className="text-xs text-muted-foreground">
                      Your digital library
                    </span>
                  </div>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>

        <SidebarContent>
          {/* Navigation */}
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={isActive('/')}>
                    <Link to="/" onClick={() => setSelectedTag(null)}>
                      <Home className="size-4" />
                      <span>Home</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          {/* Folders */}
          <SidebarGroup>
            <SidebarGroupLabel>Folders</SidebarGroupLabel>
            <SidebarGroupAction
              title="Add folder"
              onClick={() => setNewFolderOpen(true)}
            >
              <Plus className="size-4" />
            </SidebarGroupAction>
            <SidebarGroupContent>
              <SidebarMenu>
                {folders.map(folder => (
                  <SidebarMenuItem key={folder.id}>
                    <SidebarMenuButton
                      asChild
                      isActive={openedFolder === folder.id}
                    >
                      <Link
                        to="/folder/:slug"
                        params={{ slug: folder.id.toString() }}
                      >
                        {openedFolder === folder.id
                          ? (
                            <FolderOpen className="size-4" />
                            )
                          : (
                            <Folder className="size-4" />
                            )}
                        <span>{folder.name}</span>
                      </Link>
                    </SidebarMenuButton>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <SidebarMenuAction showOnHover>
                          <MoreHorizontal className="size-4" />
                        </SidebarMenuAction>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent side="right" align="start">
                        <DropdownMenuItem
                          onClick={() => {
                            setEditFolderId(folder.id)
                            setEditFolderName(folder.name)
                          }}
                        >
                          <Pencil className="mr-2 size-4" />
                          Rename
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive"
                          onClick={() => {
                            if (
                              window.confirm(
                                'Are you sure you want to delete this folder?',
                              )
                            ) {
                              deleteFolderMutation.mutate(folder.id)
                            }
                          }}
                        >
                          <Trash2 className="mr-2 size-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          {/* Tags */}
          <SidebarGroup>
            <SidebarGroupLabel>Tags</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {tags.map(tag => (
                  <SidebarMenuItem key={tag.id}>
                    <SidebarMenuButton
                      isActive={selectedTag === tag.id}
                      onClick={() =>
                        setSelectedTag(selectedTag === tag.id ? null : tag.id)}
                    >
                      <Hash className="size-4" />
                      <span>{tag.name}</span>
                    </SidebarMenuButton>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <SidebarMenuAction showOnHover>
                          <MoreHorizontal className="size-4" />
                        </SidebarMenuAction>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent side="right" align="start">
                        <DropdownMenuItem
                          onClick={() => {
                            setEditTagId(tag.id)
                            setEditTagName(tag.name)
                          }}
                        >
                          <Pencil className="mr-2 size-4" />
                          Rename
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive"
                          onClick={() => {
                            if (
                              window.confirm(
                                'Are you sure you want to delete this tag?',
                              )
                            ) {
                              deleteTagMutation.mutate(tag.id)
                            }
                          }}
                        >
                          <Trash2 className="mr-2 size-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </SidebarMenuItem>
                ))}
                {tags.length === 0 && (
                  <div className="px-2 py-4 text-xs text-muted-foreground text-center">
                    No tags yet
                  </div>
                )}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter className="border-t border-sidebar-border">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                onClick={handleLogout}
                className="text-destructive hover:text-destructive"
              >
                <LogOut className="size-4" />
                <span>Logout</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>

      {/* Dialogs */}
      <NewFolderDialog
        open={newFolderOpen}
        onOpenChange={setNewFolderOpen}
        onSubmit={name => createFolderMutation.mutate(name)}
        loading={createFolderMutation.isPending}
      />

      <EditFolderDialog
        open={editFolderId !== null}
        onOpenChange={open => !open && setEditFolderId(null)}
        folderName={editFolderName}
        onFolderNameChange={setEditFolderName}
        onSubmit={() =>
          editFolderId
          && updateFolderMutation.mutate({ id: editFolderId, name: editFolderName })}
        loading={updateFolderMutation.isPending}
      />

      <EditTagDialog
        open={editTagId !== null}
        onOpenChange={open => !open && setEditTagId(null)}
        tagName={editTagName}
        onTagNameChange={setEditTagName}
        onSubmit={() =>
          editTagId
          && updateTagMutation.mutate({ id: editTagId, name: editTagName })}
        loading={updateTagMutation.isPending}
      />
    </>
  )
}
