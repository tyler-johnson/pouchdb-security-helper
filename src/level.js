import {defaults} from "lodash";
import {Names, Roles} from "./type.js";

export default class SecurityLevel {
	constructor(data) {
		data = data || {};
		this.names = new Names(data.names);
		this.roles = new Roles(data.roles);
	}

	removeAll() {
		this.names.removeAll();
		this.roles.removeAll();
		return this;
	}

	isEmpty() {
		return !this.names.size && !this.roles.size;
	}

	add(data, opts) {
		return this.set(data, defaults({ add: true, remove: false }, opts));
	}

	remove(data, opts) {
		return this.set(data, defaults({ remove: true }, opts));
	}

	set(data, opts) {
		data = data || {};
		opts = opts || {};
		var add = opts.add, remove = opts.remove;

		// reset if not adding or removing
		if (!add && !remove) this.removeAll();

		// set the new data
		this.names[remove ? "remove" : "add"](data.names);
		this.roles[remove ? "remove" : "add"](data.roles);

		return this;
	}

	toJSON() {
		return {
			names: this.names.toJSON(),
			roles: this.roles.toJSON()
		};
	}

	clone() {
		return new SecurityLevel(this);
	}
}
