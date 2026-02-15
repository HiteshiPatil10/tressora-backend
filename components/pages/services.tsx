"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabaseClient"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"

import { Plus, Edit2, Trash2, Clock, DollarSign } from "lucide-react"

export function ServicesPage() {

  const [servicesList, setServicesList] = useState<any[]>([])
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingService, setEditingService] = useState<any>(null)

  const [newService, setNewService] = useState({
    name: "",
    price: "",
    duration: "",
    category: "",
  })

  // 🔹 Fetch services
  useEffect(() => {
    fetchServices()
  }, [])

  async function fetchServices() {
    const { data } = await supabase.from("services").select("*")

    const mapped = (data || []).map((s: any) => ({
      id: s.id,
      name: s.name,
      price: s.price,
      duration: s.duration_minutes,
      category: s.category,
      active: s.active,
    }))

    setServicesList(mapped)
  }

  // 🔹 Add
  async function handleAddService() {
    if (!newService.name) return

    await supabase.from("services").insert({
      name: newService.name,
      price: parseInt(newService.price),
      duration_minutes: parseInt(newService.duration),
      category: newService.category,
      active: true,
    })

    setShowAddModal(false)
    setNewService({ name: "", price: "", duration: "", category: "" })
    fetchServices()
  }

  // 🔹 Edit
  async function handleEditService() {
    if (!editingService) return

    await supabase
      .from("services")
      .update({
        name: editingService.name,
        price: editingService.price,
        duration_minutes: editingService.duration,
        category: editingService.category,
      })
      .eq("id", editingService.id)

    setEditingService(null)
    fetchServices()
  }

  // 🔹 Toggle Active
  async function toggleActive(id: string) {
    const service = servicesList.find((s) => s.id === id)

    await supabase
      .from("services")
      .update({ active: !service.active })
      .eq("id", id)

    fetchServices()
  }

  // 🔹 Delete
  async function deleteService(id: string) {
    await supabase.from("services").delete().eq("id", id)
    fetchServices()
  }

  const categories = [...new Set(servicesList.map((s) => s.category))]

  return (
    <div className="flex flex-col gap-6">

      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-serif text-3xl font-bold text-foreground">
            Services Management
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Add, edit, and manage salon services
          </p>
        </div>

        <Button
          className="bg-primary text-primary-foreground hover:bg-primary/90"
          onClick={() => setShowAddModal(true)}
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Service
        </Button>
      </div>

      {/* Category Stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {categories.map((cat) => {
          const catServices = servicesList.filter((s) => s.category === cat)
          const activeCount = catServices.filter((s) => s.active).length

          return (
            <Card key={cat}>
              <CardContent className="p-4">
                <p className="text-xs uppercase text-muted-foreground">{cat}</p>
                <p className="mt-1 text-2xl font-bold">{catServices.length}</p>
                <p className="text-xs text-muted-foreground">
                  {activeCount} active
                </p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {servicesList.map((service) => (
          <Card key={service.id}>
            <CardContent className="p-5">

              <div className="flex justify-between">
                <div>
                  <h3 className="font-semibold">{service.name}</h3>
                  <Badge className="mt-1">{service.category}</Badge>
                </div>

                <div className="flex gap-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setEditingService({ ...service })}
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                  </Button>

                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => deleteService(service.id)}
                  >
                    <Trash2 className="h-3.5 w-3.5 text-red-500" />
                  </Button>
                </div>
              </div>

              <div className="mt-4 flex gap-4 text-sm">
                <div className="flex items-center gap-1">
                  <DollarSign className="h-4 w-4" />
                  ₹{service.price}
                </div>

                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {service.duration} min
                </div>
              </div>

              <div className="mt-3 flex justify-between">
                <span className="text-xs text-muted-foreground">
                  {service.active ? "Active" : "Inactive"}
                </span>

                <Switch
                  checked={service.active}
                  onCheckedChange={() => toggleActive(service.id)}
                />
              </div>

            </CardContent>
          </Card>
        ))}
      </div>

      {/* ADD DIALOG */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Service</DialogTitle>
          </DialogHeader>

          <div className="flex flex-col gap-3">

            <Input
              placeholder="Service Name"
              value={newService.name}
              onChange={(e) =>
                setNewService({ ...newService, name: e.target.value })
              }
            />

            <Input
              type="number"
              placeholder="Price"
              value={newService.price}
              onChange={(e) =>
                setNewService({ ...newService, price: e.target.value })
              }
            />

            <Input
              type="number"
              placeholder="Duration (min)"
              value={newService.duration}
              onChange={(e) =>
                setNewService({ ...newService, duration: e.target.value })
              }
            />

            <Select
              onValueChange={(v) =>
                setNewService({ ...newService, category: v })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Category" />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="Hair">Hair</SelectItem>
                <SelectItem value="Grooming">Grooming</SelectItem>
                <SelectItem value="Spa">Spa</SelectItem>
                <SelectItem value="Combo">Combo</SelectItem>
              </SelectContent>
            </Select>

          </div>

          <DialogFooter>
            <Button onClick={handleAddService}>
              Add Service
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* EDIT DIALOG */}
      <Dialog
        open={!!editingService}
        onOpenChange={() => setEditingService(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Service</DialogTitle>
          </DialogHeader>

          {editingService && (
            <div className="flex flex-col gap-3">

              <Input
                value={editingService.name}
                onChange={(e) =>
                  setEditingService({
                    ...editingService,
                    name: e.target.value,
                  })
                }
              />

              <Input
                type="number"
                value={editingService.price}
                onChange={(e) =>
                  setEditingService({
                    ...editingService,
                    price: parseInt(e.target.value),
                  })
                }
              />

              <Input
                type="number"
                value={editingService.duration}
                onChange={(e) =>
                  setEditingService({
                    ...editingService,
                    duration: parseInt(e.target.value),
                  })
                }
              />

            </div>
          )}

          <DialogFooter>
            <Button onClick={handleEditService}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  )
}
