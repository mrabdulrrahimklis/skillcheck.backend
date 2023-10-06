import { Credentials } from "./credential.entity";

export class UserEntity {
  id: number
  name: string
  email: string
  email_confirmed: boolean
  is_admin: boolean
  credentials_id: number
  roles: string[]
  created_at: Date
  updated_at: Date
  credentials?: Credentials
}