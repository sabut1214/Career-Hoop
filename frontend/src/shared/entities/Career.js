import { careerService } from "@/features/careers/services/careerService"

export const Career = {
  list: async () => {
    const res = await careerService.getAll()
    return res.data || []
  },
}

export default Career

