import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  ManyToOne,
  BeforeInsert,
} from "typeorm";
import { AbstractEntity } from "./abtract-entity.entity";
import { UserProvider } from "./user-provider.entity";
import { Role } from "../enum/role.enum";
import { ActiveStatus } from "../enum/activity-status.enum";
import { Language } from "./language.entity";
import { Theme } from "../enum/theme.enum";
import { SessionTimeoutAction } from "../enum/session-timeout-action.enum";
import { compareValue, hashValue } from "../utils/bcrypt";
import { Session } from "./session.entity";

@Entity("users")
export class User extends AbstractEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "text", unique: true, nullable: false })
  email: string;

  @Column({ type: "boolean", default: false })
  isEnabled: boolean;

  @Column({ type: "text", nullable: false, name: "encrypted_password" })
  password: string;

  @OneToMany(() => UserProvider, (userProvider) => userProvider.user, {
    cascade: true,
    orphanedRowAction: "delete",
  })
  providers: UserProvider[];

  @Column({ type: "enum", enum: Role, default: Role.USER })
  role: Role;

  @Column({ type: "enum", enum: ActiveStatus, default: ActiveStatus.INACTIVE })
  activeStatus: ActiveStatus;

  @ManyToOne(() => Language)
  language: Language;

  @Column({ type: "enum", enum: Theme, default: Theme.LIGHT })
  theme: Theme;

  @Column({ type: "timestamp", nullable: true, default: null })
  confirmedAt: Date;

  @Column({ type: "text", nullable: true })
  resetPasswordCode: string;

  @Column({ type: "timestamp", nullable: true, default: null })
  resetPasswordConfirmedAt: Date;

  @Column({ type: "timestamp", nullable: true, default: null })
  requestDeleteAt: Date;

  @Column({ type: "text", nullable: true })
  requestDeleteCode: string;

  @Column({ type: "boolean", default: false })
  unlockFaceId: boolean;

  @Column({ type: "text", nullable: true })
  unlockPinCode: string;

  @Column({ type: "boolean", default: false })
  loginWithFaceId: boolean;

  @Column({ type: "int", default: 15 })
  sessionTimeout: number;

  @Column({
    type: "enum",
    enum: SessionTimeoutAction,
    default: SessionTimeoutAction.LOGOUT,
  })
  sessionTimeoutAction: SessionTimeoutAction;

  @Column({ type: "boolean", default: true })
  rememberEmail: boolean;

  @Column({ type: "boolean", default: false })
  rememberPassword: boolean;

  @Column({ type: "boolean", default: false })
  logoutOnClose: boolean;

  @Column({ type: "boolean", default: false })
  twoFactorsAuthentication: boolean;

  @Column({ type: "boolean", default: false })
  allowScreenShots: boolean;

  @Column({ type: "int", default: 30 })
  clearClipboard: number;
  @OneToMany(() => Session, (session) => session.user)
  sessions: Session[];
  getSubRole(): string {
    return this.role.replace("ROLE_", "");
  }
  omitPassword(): Omit<this, "password"> {
    const { password, ...userWithoutPassword } = this; // Destructure to omit password
    return userWithoutPassword as Omit<this, "password">; // Type assertion
  }

  async comparePassword(val: string): Promise<boolean> {
    return compareValue(val, this.password);
  }

  @BeforeInsert()
  async hashPassword() {
    this.password = await hashValue(this.password);
  }
}
