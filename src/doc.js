import SecurityLevel from "./level.js";
import { Headers } from "pouchdb-fetch";

export default class Security {
	constructor(db, secobj) {
		if (db instanceof Security) {
			secobj = db.toJSON();
			db = db.database;
		}

		this.database = db;
		this.reset(secobj);
	}

	hasMembers() {
		return !this.members.isEmpty();
	}

	hasAdmins() {
		return !this.admins.isEmpty();
	}

	userHasAccess(user) {
		if (typeof user === "string") return this.nameHasAccess(user);
		return !this.hasMembers() || (user.name && this.nameHasAccess(user.name)) ||
			(Array.isArray(user.roles) && user.roles.some(this.roleHasAccess, this));
	}

	nameHasAccess(name) {
		return this.members.names.has(name) ||
			this.admins.names.has(name);
	}

	roleHasAccess(role) {
		if (role === "_admin") return true;

		return this.members.roles.has(role) ||
			this.admins.roles.has(role);
	}

	toJSON() {
		return {
			members: this.members.toJSON(),
			admins: this.admins.toJSON()
		};
	}

	reset(sec) {
		sec = sec || {};
		this.members = new SecurityLevel(sec.members);
		this.admins = new SecurityLevel(sec.admins);
		return this;
	}

	clone() {
		return new Security(this);
	}

	fetch() {
		let p;

		if (this.database.getSecurity) {
			p = this.database.getSecurity();
		} else if (this.database.fetch) {
			const headers = new Headers();
			headers.set("Accept", "application/json");
			p = this.database.fetch("_security", {
				headers
			}).then(resp => {
				if (!resp.ok) {
					throw new Error("Failed to fetch security document.");
				}

				return resp.json();
			});
		} else {
			p = Promise.reject(new Error("Cannot fetch security on this database."));
		}

		return p.then((sec) => {
			this.reset(sec);
		});
	}

	save() {
		let p;

		if (this.database.putSecurity) {
			p = this.database.putSecurity(this.toJSON());
		} else if (this.database.fetch) {
			const headers = new Headers();
			headers.set("Content-Type", "application/json");
			headers.set("Accept", "application/json");
			p = this.database.fetch("_security", {
				method: "PUT",
				body: JSON.stringify(this.toJSON()),
				headers
			}).then(resp => {
				if (!resp.ok) {
					throw new Error("Failed to save security document.");
				}
			});
		} else {
			p = Promise.reject(new Error("Cannot save security on this database."));
		}

		return p.then(() => {});
	}
}
