import test from "tape";
import PouchDB from "pouchdb-core";
import securityPlugin from "../src/index.js";

const {Security} = securityPlugin;

test("level.names and level.roles are a security types", (t) => {
	t.plan(4);
	let db = new PouchDB("tmpdb", { adapter: "memory" });
	let security = db.security();

	t.ok(security.admins.names instanceof Security.Type, "admins.names is a SecurityType instance");
	t.ok(security.members.names instanceof Security.Type, "members.names is a SecurityType instance");
	t.ok(security.admins.roles instanceof Security.Type, "admins.roles is a SecurityType instance");
	t.ok(security.members.roles instanceof Security.Type, "members.roles is a SecurityType instance");
});

test("has() returns true when item is in list", (t) => {
	t.plan(1);
	let db = new PouchDB("tmpdb", { adapter: "memory" });
	let security = db.security();
	let type = security.members.names;
	type.add([ "name", "name2", "name3" ]);
	t.ok(type.has("name"), "item is in list");
});

test("has() returns false when item is not in list", (t) => {
	t.plan(1);
	let db = new PouchDB("tmpdb", { adapter: "memory" });
	let security = db.security();
	let type = security.members.names;
	t.notOk(type.has("name"), "item is not in list");
});

test("add() adds items to the list without duplicates", (t) => {
	t.plan(3);
	let db = new PouchDB("tmpdb", { adapter: "memory" });
	let security = db.security();
	let type = security.members.names;

	type.add("name");
	t.ok(type.has("name"), "adds string name");
	type.add([ "name", "name2", "name3" ]);
	t.ok(type.has("name") && type.has("name2") && type.has("name3"), "adds array of names");
	t.ok(type.size === 3, "didn't duplicate");
});

test("remove() removes items from the list", (t) => {
	t.plan(3);
	let db = new PouchDB("tmpdb", { adapter: "memory" });
	let security = db.security();
	let type = security.members.names;
	type.add([ "name", "name2", "name3" ]);

	type.remove("name");
	t.notOk(type.has("name"), "removes string name");
	type.remove([ "name", "name2", "name3" ]);
	t.ok(!type.has("name2") && !type.has("name3"), "removes array of names");
	t.ok(type.size === 0, "list is now empty");
});

test("removeAll() empties the list", (t) => {
	t.plan(2);
	let db = new PouchDB("tmpdb", { adapter: "memory" });
	let security = db.security();
	let type = security.members.names;
	type.add([ "name", "name2", "name3" ]);

	t.ok(type.size, "starts off with size");
	type.removeAll();
	t.notOk(type.size, "list is now empty");
});
