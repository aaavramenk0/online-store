import { UserRole } from "@prisma/client"



export type TypeGetUsersQuery = {
  sortOrder?: 'asc' | 'desc'
  sortBy?: string
  perPage?: string
  page?: string
  search?: string
  role:? UserRole
}