import SecurityLevel from "./level.js";

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
		} else if (this.database.request) {
			p = this.database.request({
				method: "GET",
				url: "_security"
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
		} else if (this.database.request) {
			p = this.database.request({
				url: "_security",
				method: "PUT",
				body: this.toJSON()
			});
		} else {
			p = Promise.reject(new Error("Cannot save security on this database."));
		}

		return p;
	}
}
