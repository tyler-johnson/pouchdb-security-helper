import test from "tape";
import PouchDB from "pouchdb-core";
import securityPlugin from "../src/index.js";

const {Security} = securityPlugin;

test("security.admins and security.members are a security levels", (t) => {
	t.plan(2);
	let db = new PouchDB("tmpdb", { adapter: "memory" });
	let security = db.security();

	t.ok(security.admins instanceof Security.Level, "admins is a SecurityLevel instance");
	t.ok(security.members instanceof Security.Level, "members is a SecurityLevel instance");
});

test("removeAll() removes everything from the level", (t) => {
	t.plan(2);
	let db = new PouchDB("tmpdb", { adapter: "memory" });
	let security = db.security();
	let level = security.members;

	level.add({ names: [ "name" ], roles: [ "role" ] });
	t.notOk(level.isEmpty(), "level is not empty");
	level.removeAll();
	t.ok(level.isEmpty(), "level is empty");
});

test("add() merges in names and roles with existing without duplicates", (t) => {
	t.plan(1);
	let db = new PouchDB("tmpdb", { adapter: "memory" });
	let security = db.security();
	let level = security.members;
	level.set({ names: [ "name" ], roles: [ "role", "role3" ] });
	level.add({ names: [ "name", "name2" ], roles: [ "role", "role2" ] });
	t.deepEqual(level.toJSON(), {
		names: [ "name", "name2" ],
		roles: [ "role", "role3", "role2" ]
	}, "level has correct names and roles");
});

test("remove() removes names and roles from existing", (t) => {
	t.plan(1);
	let db = new PouchDB("tmpdb", { adapter: "memory" });
	let security = db.security();
	let level = security.members;
	level.set({ names: [ "name" ], roles: [ "role", "role3" ] });
	level.remove({ names: [ "name" ], roles: [ "role", "role2" ] });
	t.deepEqual(level.toJSON(), {
		names: [ ],
		roles: [ "role3" ]
	}, "level has correct names and roles");
});

test("set() overwrites existing", (t) => {
	t.plan(1);
	let db = new PouchDB("tmpdb", { adapter: "memory" });
	let security = db.security();
	let level = security.members;
	level.set({ names: [ "name" ], roles: [ "role", "role3" ] });
	level.set({ names: [ "name2" ], roles: [ "role", "role2" ] });
	t.deepEqual(level.toJSON(), {
		names: [ "name2" ],
		roles: [ "role", "role2" ]
	}, "level has correct names and roles");
});
