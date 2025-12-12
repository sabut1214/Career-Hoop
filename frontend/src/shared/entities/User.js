export const User = {
  me: async () => {
    try {
      const raw = localStorage.getItem("user")
      if (raw) return JSON.parse(raw)
    } catch (e) {
      // ignore
    }
    return { full_name: "User", email: "" }
  },
}

export default User

