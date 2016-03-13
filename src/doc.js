import {isArray} from "lodash";
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
			(isArray(user.roles) && user.roles.some(this.roleHasAccess, this));
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
		return this.database.request({
			method: "GET",
			url: "_security"
		}).then((sec) => {
			this.reset(sec);
		});
	}

	save() {
		return this.database.request({
			url: "_security",
			method: "PUT",
			body: this.toJSON()
		});
	}
}
