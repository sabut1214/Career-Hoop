import { studentService } from "@/services/studentService"

export const Student = {
  list: async () => {
    const res = await studentService.getAll()
    return res.data || []
  },
  create: async (data) => {
    const res = await studentService.create(data)
    return res.data
  },
  update: async (id, data) => {
    const res = await studentService.update(id, data)
    return res.data
  },
}

export default Student

