import { supabase } from "./supabaseClient"

export async function getAppointmentsAnalytics() {
  const { data, error } = await supabase
    .from("appointments")
    .select(`
      id,
      appointment_date,
      appointment_time,
      status,
      services(name, price),
      barbers(id, name)
    `)

  if (error) {
    console.error(error)
    return []
  }

  return data
}
