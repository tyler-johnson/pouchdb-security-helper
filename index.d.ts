/// <reference types="pouchdb-core" />

declare namespace PouchDB {
  export namespace SecurityHelper {
    interface SecurityTypeClass {
      new(items?: string | string[] | SecurityType): SecurityType;
    }

    interface SecurityType {
      size: number;
      items: string[];
      add(items?: string | string[] | SecurityType): this;
      remove(items?: string | string[]): this;
      removeAll(): this;
      has(item: string | string[]): boolean;
      toJSON(): string[];
      forEach(fn: (item: string, index: number, list: string[]) => any, ctx?: any): this;
      map<T>(fn: (item: string, index: number, list: string[]) => T, ctx?: any): T[];
      clone(): this;
    }

    interface RolesClass extends SecurityTypeClass {}
    interface Roles extends SecurityType {}

    interface NamesClass extends SecurityTypeClass {}
    interface Names extends SecurityType {
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

    interface SecurityLevelClass {
      new(data?: Partial<SecurityLevelDocument> | SecurityLevel): SecurityLevel;
    }

    interface SecurityLevel {
      names: Names;
      roles: Roles;

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
      name?: string | null;
      roles?: string[];
    }

    interface SecurityClass {
      new(db: PouchDB.Database | Security, secobj?: PartialSecurityDocument): Security;
      Level: SecurityLevelClass;
      Type: SecurityTypeClass;
      Names: NamesClass;
      Roles: RolesClass;
    }

    interface Security {
      members: SecurityLevel;
      admins: SecurityLevel;

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
  }

  interface Database<Content extends {} = {}> {
    Security: SecurityHelper.SecurityClass;
    security(doc?: SecurityHelper.PartialSecurityDocument): SecurityHelper.Security;
  }
}

declare module "pouchdb-security-helper" {
  const Plugin: PouchDB.Plugin;
  export = Plugin;
}
