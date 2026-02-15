"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabaseClient"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import { Calendar, Clock, User, RefreshCw, X } from "lucide-react"

export function SlotsPage() {

  const [selectedDate] = useState(
    new Date().toISOString().split("T")[0]
  )

  const [appointments, setAppointments] = useState<any[]>([])
  const [barbers, setBarbers] = useState<any[]>([])

  const [selectedSlot, setSelectedSlot] = useState<any>(null)
  const [showReassign, setShowReassign] = useState(false)
  const [reassignBarber, setReassignBarber] = useState("")

  const timeSlots = [
    "10:00","10:30","11:00","11:30",
    "12:00","12:30","13:00","13:30",
    "14:00","14:30","15:00","15:30",
    "16:00","16:30","17:00","17:30",
    "18:00","18:30"
  ]

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {

    const { data: appts } = await supabase
      .from("appointments")
      .select("*")
      .eq("date", selectedDate)

    const { data: barbs } = await supabase
      .from("barbers")
      .select("*")

    setAppointments(appts || [])
    setBarbers(barbs || [])
  }

  const todayAppointments = appointments

  function getSlotStatus(barberId: string, time: string) {

    const barber = barbers.find((b) => b.id === barberId)
    if (!barber) return "unknown"

    if (
      barber.status === "absent" ||
      barber.status === "on-leave"
    )
      return "absent"

    if (
      barber.status === "half-day" &&
      parseInt(time) >= 13
    )
      return "absent"

    if (time === "13:00" || time === "13:30")
      return "break"

    const booking = todayAppointments.find(
      (a) =>
        a.barber_id === barberId &&
        a.time === time
    )

    if (booking) return "booked"

    return "available"
  }

  function getBooking(barberId: string, time: string) {
    return todayAppointments.find(
      (a) =>
        a.barber_id === barberId &&
        a.time === time
    )
  }

  const statusColors: Record<string, string> = {
    available:
      "bg-emerald-100 text-emerald-700 border-emerald-200",
    booked:
      "bg-red-100 text-red-700 border-red-200 cursor-pointer",
    absent:
      "bg-muted text-muted-foreground border-border",
    break:
      "bg-amber-100 text-amber-700 border-amber-200",
    unknown:
      "bg-muted text-muted-foreground border-border",
  }

  const statusLabels: Record<string, string> = {
    available: "Free",
    booked: "Booked",
    absent: "N/A",
    break: "Break",
    unknown: "-",
  }

  const availableBarbers = barbers.filter(
    (b) =>
      b.status === "present" &&
      selectedSlot &&
      !todayAppointments.find(
        (a) =>
          a.barber_id === b.id &&
          a.time === selectedSlot.time
      ) &&
      b.id !== selectedSlot?.barber_id
  )

  async function handleReassign() {

    if (!reassignBarber || !selectedSlot) return

    await supabase
      .from("appointments")
      .update({
        barber_id: reassignBarber,
      })
      .eq("id", selectedSlot.id)

    setShowReassign(false)
    setSelectedSlot(null)
    setReassignBarber("")

    fetchData()
  }

  return (
    <div className="flex flex-col gap-6">

      {/* Header */}
      <div className="flex justify-between">
        <div>
          <h1 className="font-serif text-3xl font-bold">
            Appointment Slot Control
          </h1>
          <p className="text-sm text-muted-foreground">
            Manage all time slots
          </p>
        </div>

        <Badge className="border-primary/30 text-primary">
          <Calendar className="mr-1 h-3 w-3" />
          {selectedDate}
        </Badge>
      </div>

      {/* Matrix */}
      <Card>
        <CardHeader>
          <CardTitle className="flex gap-2">
            <Clock className="h-4 w-4 text-primary" />
            Daily Slot Matrix
          </CardTitle>
        </CardHeader>

        <CardContent className="overflow-x-auto">

          <table className="w-full border-separate border-spacing-1">

            <thead>
              <tr>
                <th className="px-3 py-2 text-xs">
                  Time
                </th>

                {barbers.map((b) => (
                  <th key={b.id} className="text-xs">
                    {b.name.split(" ")[0]}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {timeSlots.map((time) => (
                <tr key={time}>

                  <td className="text-xs px-2">
                    {time}
                  </td>

                  {barbers.map((b) => {
                    const status = getSlotStatus(
                      b.id,
                      time
                    )

                    const booking = getBooking(
                      b.id,
                      time
                    )

                    return (
                      <td key={b.id + time}>
                        <button
                          onClick={() => {
                            if (booking)
                              setSelectedSlot(
                                booking
                              )
                          }}
                          className={`w-full rounded border px-2 py-1 text-[11px] ${statusColors[status]}`}
                        >
                          {status === "booked" &&
                          booking
                            ? booking.client_name
                                ?.split(" ")[0]
                            : statusLabels[status]}
                        </button>
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>

          </table>
        </CardContent>
      </Card>

      {/* Booking Dialog */}
      <Dialog
        open={!!selectedSlot && !showReassign}
        onOpenChange={() => setSelectedSlot(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Booking Details
            </DialogTitle>
          </DialogHeader>

          {selectedSlot && (
            <div className="flex flex-col gap-3">

              <p>
                Client:{" "}
                {selectedSlot.client_name}
              </p>

              <p>
                Service:{" "}
                {selectedSlot.service}
              </p>

              <p>
                Time: {selectedSlot.time}
              </p>

              <DialogFooter>
                <Button
                  onClick={() =>
                    setShowReassign(true)
                  }
                >
                  Reassign Barber
                </Button>
              </DialogFooter>

            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Reassign */}
      <Dialog
        open={showReassign}
        onOpenChange={() =>
          setShowReassign(false)
        }
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Reassign Barber
            </DialogTitle>
          </DialogHeader>

          <Select
            value={reassignBarber}
            onValueChange={setReassignBarber}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select barber" />
            </SelectTrigger>

            <SelectContent>
              {availableBarbers.map((b) => (
                <SelectItem
                  key={b.id}
                  value={b.id}
                >
                  {b.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <DialogFooter>
            <Button onClick={handleReassign}>
              Confirm
            </Button>
          </DialogFooter>

        </DialogContent>
      </Dialog>

    </div>
  )
}
