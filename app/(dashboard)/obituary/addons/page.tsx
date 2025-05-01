"use client"

import { useState } from "react"
import { Plus, Eye, Pencil, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { DataTable } from "@/components/data-table"
import { ColumnDef } from "@tanstack/react-table"

export default function ObituaryAddonsPage() {
  const { toast } = useToast()
  const [searchQuery, setSearchQuery] = useState("")
  const [viewDialogOpen, setViewDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedAddon, setSelectedAddon] = useState<any>(null)
  const [newAddon, setNewAddon] = useState({ name: "", price: "" })
  const [editAddon, setEditAddon] = useState({ id: 0, name: "", price: "" })
  const [isSubmitting, setIsSubmitting] = useState(false)


  type ObituaryAddon = {
    id: number
    name: string
    price: number
  }

  const addons: ObituaryAddon[] = [
    { id: 1, name: "Photo Frame", price: 9.99 },
    { id: 2, name: "Background Color", price: 4.99 },
    { id: 3, name: "Video Upload", price: 19.99 },
    { id: 4, name: "Additional Images", price: 14.99 },
    { id: 5, name: "Contact Details", price: 7.99 },
    { id: 6, name: "Premium Fonts", price: 5.99 },
    { id: 7, name: "Extended Duration", price: 12.99 },
    { id: 8, name: "Social Media Sharing", price: 3.99 },
    { id: 9, name: "QR Code", price: 2.99 },
    { id: 10, name: "Custom URL", price: 8.99 },
  ]



  const handleView = (addon: any) => {
    setSelectedAddon(addon)
    setViewDialogOpen(true)
  }

  const handleEdit = (addon: any) => {
    setEditAddon({
      id: addon.id,
      name: addon.name,
      price: addon.price,
    })
    setEditDialogOpen(true)
  }

  const handleDelete = (addon: any) => {
    setSelectedAddon(addon)
    setDeleteDialogOpen(true)
  }

  const handleAddSubmit = async () => {
    setIsSubmitting(true)
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      toast({
        title: "Addon created",
        description: "The addon has been created successfully.",
      })

      setAddDialogOpen(false)
      setNewAddon({ name: "", price: "" })
    } catch (error) {
      toast({
        title: "Error",
        description: "An error occurred while creating the addon.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEditSubmit = async () => {
    setIsSubmitting(true)
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      toast({
        title: "Addon updated",
        description: "The addon has been updated successfully.",
      })

      setEditDialogOpen(false)
    } catch (error) {
      toast({
        title: "Error",
        description: "An error occurred while updating the addon.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const confirmDelete = async () => {
    setIsSubmitting(true)
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      toast({
        title: "Addon deleted",
        description: "The addon has been deleted successfully.",
      })

      setDeleteDialogOpen(false)
    } catch (error) {
      toast({
        title: "Error",
        description: "An error occurred while deleting the addon.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const columns: ColumnDef<ObituaryAddon>[] = [
    {
      accessorKey: "name",
      header: "Name",
    },
    {
      accessorKey: "price",
      header: "Price",
    },

    {
      id: "actions",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => handleView(row.original)}>
            <Eye className="h-4 w-4" />
            <span className="sr-only">View</span>
          </Button>
          <Button variant="ghost" size="icon" onClick={() => handleEdit(row.original)}>
            <Pencil className="h-4 w-4" />
            <span className="sr-only">Edit</span>
          </Button>
          <Button variant="ghost" size="icon" onClick={() => handleDelete(row.original)}>
            <Trash2 className="h-4 w-4" />
            <span className="sr-only">Delete</span>
          </Button>
        </div>
      ),
    },
  ]

  return (
    <>
      <div className="flex flex-col gap-5">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight">Obituary Addons</h1>
          <Button onClick={() => setAddDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Addon
          </Button>
        </div>

        <DataTable columns={columns} data={addons} searchKey="name" searchPlaceholder="Search addons..." />

      </div>

      {/* View Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Addon Details</DialogTitle>
            <DialogDescription>Detailed information about the addon.</DialogDescription>
          </DialogHeader>
          {selectedAddon && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Name</Label>
                <div className="col-span-3">{selectedAddon.name}</div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Price</Label>
                <div className="col-span-3">${selectedAddon.price.toFixed(2)}</div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Add Dialog */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add Addon</DialogTitle>
            <DialogDescription>Create a new addon for obituary packages.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input
                id="name"
                value={newAddon.name}
                onChange={(e) => setNewAddon({ ...newAddon, name: e.target.value })}
                className="col-span-3"
                placeholder="Enter addon name"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="price" className="text-right">
                Price ($)
              </Label>
              <Input
                id="price"
                type="number"
                min="0"
                step="0.01"
                value={newAddon.price}
                onChange={(e) => setNewAddon({ ...newAddon, price: e.target.value })}
                className="col-span-3"
                placeholder="Enter price"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddSubmit} disabled={isSubmitting || !newAddon.name || !newAddon.price}>
              {isSubmitting ? "Creating..." : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Addon</DialogTitle>
            <DialogDescription>Update the addon details.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-name" className="text-right">
                Name
              </Label>
              <Input
                id="edit-name"
                value={editAddon.name}
                onChange={(e) => setEditAddon({ ...editAddon, name: e.target.value })}
                className="col-span-3"
                placeholder="Enter addon name"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-price" className="text-right">
                Price ($)
              </Label>
              <Input
                id="edit-price"
                type="number"
                min="0"
                step="0.01"
                value={editAddon.price}
                onChange={(e) => setEditAddon({ ...editAddon, price: e.target.value })}
                className="col-span-3"
                placeholder="Enter price"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditSubmit} disabled={isSubmitting || !editAddon.name || !editAddon.price}>
              {isSubmitting ? "Updating..." : "Update"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the addon
              {selectedAddon && ` "${selectedAddon.name}"`} and remove it from the system.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
