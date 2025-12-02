import { collegeService } from "@/services/collegeService"

export const College = {
  list: async () => {
    const res = await collegeService.getAll()
    return res.data || []
  },
}

export default College

