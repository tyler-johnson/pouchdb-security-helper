/// <reference types="pouchdb-core" />

declare class SecurityType {
  size: number;
  items: string[];

  constructor(items?: string | string[] | SecurityType);

  add(items?: string | string[] | SecurityType): this;
  remove(items?: string | string[]): this;
  removeAll(): this;
  has(item: string | string[]): boolean;
  toJSON(): string[];
  forEach(fn: (item: string, index: number, list: string[]) => any, ctx?: any): this;
  map<T>(fn: (item: string, index: number, list: string[]) => T, ctx?: any): T[];
  clone(): this;
}

declare class Roles extends SecurityType {}

declare class Names extends SecurityType {
  add(user?: string | string[] | SecurityType | { name: string }): this;
  remove(user?: string | string[] | { name: string }): this;
  has(user?: string | string[] | { name: string }): boolean;
}

interface SecurityLevelDocument {
  names: string[];
  roles: string[];
}

interface SecurityLevelSetOptions {
  add?: boolean;
  remove?: boolean;
}

declare class SecurityLevel {
  names: Names;
  roles: Roles;

  constructor(data?: Partial<SecurityLevelDocument> | SecurityLevel);

  removeAll(): this;
  isEmpty(): boolean;
  add(data?: Partial<SecurityLevelDocument>, opts?: SecurityLevelSetOptions): this;
  remove(data?: Partial<SecurityLevelDocument>, opts?: SecurityLevelSetOptions): this;
  set(data?: Partial<SecurityLevelDocument>, opts?: SecurityLevelSetOptions): this;
  toJSON(): SecurityLevelDocument;
  clone(): this;
}

interface SecurityDocument {
  members: SecurityLevelDocument;
  admins: SecurityLevelDocument;
}

interface PartialSecurityDocument {
  members?: Partial<SecurityLevelDocument>;
  admins?: Partial<SecurityLevelDocument>;
}

interface UserDocument {
  name?: string;
  roles?: string[];
}

declare class Security {
  static Level: typeof SecurityLevel;
  static Type: typeof SecurityType;
  static Names: typeof Names;
  static Roles: typeof Roles;

  members: SecurityLevel;
  admins: SecurityLevel;

  constructor(db: PouchDB.Database | Security, secobj?: PartialSecurityDocument);

  hasMembers(): boolean;
  hasAdmins(): boolean;
  userHasAccess(user: string | UserDocument): boolean;
  nameHasAccess(name: string): boolean;
  roleHasAccess(role: string): boolean;
  toJSON(): SecurityDocument;
  reset(sec?: PartialSecurityDocument): this;
  clone(): this;
  fetch(): Promise<void>;
  save(): Promise<void>;
}

export = {
  Security,
  security(doc?: PartialSecurityDocument): Security
};
