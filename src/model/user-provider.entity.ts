import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm";
import { AuthProvider } from "../enum/auth-provider.enum";
import { User } from "./user.entity";

@Entity("user_providers")
export class UserProvider {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "text", nullable: false })
  email: string;

  @Column({ type: "text", nullable: false })
  name: string;

  @Column({ type: "text", nullable: true })
  photo: string;

  // Đảm bảo khai báo rõ ràng loại dữ liệu cho enum
  @Column({ type: "enum", enum: AuthProvider, nullable: false })
  provider: AuthProvider;

  @ManyToOne(() => User, (user) => user.providers)
  user: User;
}
