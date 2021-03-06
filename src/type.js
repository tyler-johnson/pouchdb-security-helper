import {union,without} from "lodash";

export default class SecurityType {
	constructor(items) {
		this.items = [];
		if (items) this.add(items);
	}

	get size() {
		return this.items.length;
	}

	add(items) {
		if (items instanceof SecurityType) items = items.toJSON();
		items = [].concat(items).filter((i) => i && typeof i === "string");

		this.items = union(this.items, items);
		return this;
	}

	remove(items) {
		items = [].concat(items).filter((i) => i && typeof i === "string");
		this.items = without(...[ this.items ].concat(items));
		return this;
	}

	removeAll() {
		this.items = [];
		return this;
	}

	has(item) {
		if (Array.isArray(item)) return item.some((i) => this.has(i));
		return this.items.indexOf(item) >= 0;
	}

	toJSON() {
		return this.items.slice(0);
	}

	forEach(fn, ctx) {
		this.items.forEach(fn, ctx);
		return this;
	}

	map(fn, ctx) {
		return this.items.map(fn, ctx);
	}

	clone() {
		return new SecurityType(this);
	}
}

export class Roles extends SecurityType {}

export class Names extends SecurityType {
	add(user) {
		user = this._parseUserName(user);
		return SecurityType.prototype.add.call(this, user);
	}

	remove(user) {
		user = this._parseUserName(user);
		return SecurityType.prototype.remove.call(this, user);
	}

	has(user) {
		user = this._parseUserName(user);
		return SecurityType.prototype.has.call(this, user);
	}

	_parseUserName(user) {
		if (Array.isArray(user)) return user.map(this._parseUserName, this);
		if (typeof user === "object" && user.name) user = user.name;
		return user;
	}
}
