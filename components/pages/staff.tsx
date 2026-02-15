"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabaseClient"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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

import { Plus, Edit2, Phone, Mail, Calendar } from "lucide-react"

export function StaffPage() {

  const [staffList, setStaffList] = useState<any[]>([])
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingStaff, setEditingStaff] = useState<any>(null)

  const [newStaff, setNewStaff] = useState({
    name: "",
    phone: "",
    email: "",
    role: "",
  })

  // 🔹 Fetch staff
  useEffect(() => {
    fetchStaff()
  }, [])

  async function fetchStaff() {
    const { data } = await supabase.from("barbers").select("*")

    const mapped = (data || []).map((b: any) => ({
      id: b.id,
      name: b.name,
      phone: b.phone,
      email: b.email,
      role: b.role,
      status: b.status,
      avatar: b.name
        ?.split(" ")
        .map((n: string) => n[0])
        .join("")
        .toUpperCase(),
      joinDate: b.join_date,
      clientsHandled: b.clients_handled || 0,
      revenueGenerated: b.revenue_generated || 0,
    }))

    setStaffList(mapped)
  }

  // 🔹 Toggle status
  async function toggleStatus(id: string, newStatus: string) {
    await supabase
      .from("barbers")
      .update({ status: newStatus })
      .eq("id", id)

    fetchStaff()
  }

  // 🔹 Add staff
  async function handleAddStaff() {
    if (!newStaff.name) return

    await supabase.from("barbers").insert({
      name: newStaff.name,
      phone: newStaff.phone,
      email: newStaff.email,
      role: newStaff.role,
      status: "present",
      join_date: new Date().toISOString().split("T")[0],
      clients_handled: 0,
      revenue_generated: 0,
    })

    setShowAddModal(false)
    setNewStaff({ name: "", phone: "", email: "", role: "" })
    fetchStaff()
  }

  // 🔹 Edit staff
  async function handleEditStaff() {
    if (!editingStaff) return

    await supabase
      .from("barbers")
      .update({
        name: editingStaff.name,
        phone: editingStaff.phone,
        role: editingStaff.role,
      })
      .eq("id", editingStaff.id)

    setEditingStaff(null)
    fetchStaff()
  }

  const statusColor: Record<string, string> = {
    present: "bg-emerald-100 text-emerald-700",
    absent: "bg-red-100 text-red-700",
    "half-day": "bg-amber-100 text-amber-700",
    "on-leave": "bg-muted text-muted-foreground",
  }

  return (
    <div className="flex flex-col gap-6">

      {/* Header */}
      <div className="flex justify-between">
        <div>
          <h1 className="font-serif text-3xl font-bold">
            Staff Management
          </h1>
          <p className="text-sm text-muted-foreground">
            Manage your salon team
          </p>
        </div>

        <Button onClick={() => setShowAddModal(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Staff
        </Button>
      </div>

      {/* Staff Grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {staffList.map((staff) => (
          <Card key={staff.id}>
            <CardContent className="p-5">

              <div className="flex justify-between">
                <div className="flex gap-3">

                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 font-bold text-primary">
                    {staff.avatar}
                  </div>

                  <div>
                    <h3 className="font-semibold">{staff.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {staff.role}
                    </p>
                  </div>

                </div>

                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setEditingStaff({ ...staff })}
                >
                  <Edit2 className="h-4 w-4" />
                </Button>
              </div>

              <div className="mt-4 flex flex-col gap-2 text-sm text-muted-foreground">
                <span className="flex items-center gap-2">
                  <Phone className="h-3.5 w-3.5" /> {staff.phone}
                </span>

                <span className="flex items-center gap-2">
                  <Mail className="h-3.5 w-3.5" /> {staff.email}
                </span>

                <span className="flex items-center gap-2">
                  <Calendar className="h-3.5 w-3.5" /> Joined {staff.joinDate}
                </span>
              </div>

              <div className="mt-4 flex justify-between bg-secondary/50 p-3 rounded-xl">

                <div className="text-center">
                  <p className="font-bold">{staff.clientsHandled}</p>
                  <p className="text-xs">Clients</p>
                </div>

                <div className="text-center">
                  <p className="font-bold">
                    ₹{staff.revenueGenerated}
                  </p>
                  <p className="text-xs">Revenue</p>
                </div>

                <Badge className={statusColor[staff.status]}>
                  {staff.status}
                </Badge>

              </div>

              {/* Status dropdown */}
              <div className="mt-3 flex justify-between">
                <span className="text-xs">Availability</span>

                <Select
                  value={staff.status}
                  onValueChange={(v) =>
                    toggleStatus(staff.id, v)
                  }
                >
                  <SelectTrigger className="h-8 w-[120px] text-xs">
                    <SelectValue />
                  </SelectTrigger>

                  <SelectContent>
                    <SelectItem value="present">Present</SelectItem>
                    <SelectItem value="absent">Absent</SelectItem>
                    <SelectItem value="half-day">Half Day</SelectItem>
                    <SelectItem value="on-leave">On Leave</SelectItem>
                  </SelectContent>
                </Select>

              </div>

            </CardContent>
          </Card>
        ))}
      </div>

      {/* ADD DIALOG */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Staff</DialogTitle>
          </DialogHeader>

          <div className="flex flex-col gap-3">

            <Input
              placeholder="Full Name"
              onChange={(e) =>
                setNewStaff({ ...newStaff, name: e.target.value })
              }
            />

            <Input
              placeholder="Phone"
              onChange={(e) =>
                setNewStaff({ ...newStaff, phone: e.target.value })
              }
            />

            <Input
              placeholder="Email"
              onChange={(e) =>
                setNewStaff({ ...newStaff, email: e.target.value })
              }
            />

            <Input
              placeholder="Role"
              onChange={(e) =>
                setNewStaff({ ...newStaff, role: e.target.value })
              }
            />

          </div>

          <DialogFooter>
            <Button onClick={handleAddStaff}>
              Add Staff
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* EDIT DIALOG */}
      <Dialog
        open={!!editingStaff}
        onOpenChange={() => setEditingStaff(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Staff</DialogTitle>
          </DialogHeader>

          {editingStaff && (
            <div className="flex flex-col gap-3">

              <Input
                value={editingStaff.name}
                onChange={(e) =>
                  setEditingStaff({
                    ...editingStaff,
                    name: e.target.value,
                  })
                }
              />

              <Input
                value={editingStaff.phone}
                onChange={(e) =>
                  setEditingStaff({
                    ...editingStaff,
                    phone: e.target.value,
                  })
                }
              />

              <Input
                value={editingStaff.role}
                onChange={(e) =>
                  setEditingStaff({
                    ...editingStaff,
                    role: e.target.value,
                  })
                }
              />

            </div>
          )}

          <DialogFooter>
            <Button onClick={handleEditStaff}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  )
}
