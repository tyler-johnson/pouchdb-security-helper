import test from "tape";
import PouchDB from "pouchdb-core";
import securityPlugin from "../src/index.js";

const {Security} = securityPlugin;

test("security() method returns an security object", (t) => {
	t.plan(1);
	let db = new PouchDB("tmpdb", { adapter: "memory" });
	let security = db.security();

	t.ok(security instanceof Security, "returns security object");
});

test("hasMembers() returns true when there are members", (t) => {
	t.plan(1);
	let db = new PouchDB("tmpdb", { adapter: "memory" });
	let security = db.security();
	security.members.names.add("test");
	t.ok(security.hasMembers(), "has members");
});

test("hasMembers() returns false when there are no members", (t) => {
	t.plan(1);
	let db = new PouchDB("tmpdb", { adapter: "memory" });
	let security = db.security();
	t.notOk(security.hasMembers(), "has no members");
});

test("hasAdmins() returns true when there are admins", (t) => {
	t.plan(1);
	let db = new PouchDB("tmpdb", { adapter: "memory" });
	let security = db.security();
	security.admins.names.add("test");
	t.ok(security.hasAdmins(), "has admins");
});

test("hasAdmins() returns false when there are no admins", (t) => {
	t.plan(1);
	let db = new PouchDB("tmpdb", { adapter: "memory" });
	let security = db.security();
	t.notOk(security.hasAdmins(), "has no admins");
});

test("nameHasAccess() returns true when name is an admin or member", (t) => {
	t.plan(2);
	let db = new PouchDB("tmpdb", { adapter: "memory" });
	let security = db.security();
	security.admins.names.add("admin");
	security.members.names.add("member");
	t.ok(security.nameHasAccess("admin"), "has admin name");
	t.ok(security.nameHasAccess("member"), "has member name");
});

test("nameHasAccess() returns false when name is not admin or member", (t) => {
	t.plan(2);
	let db = new PouchDB("tmpdb", { adapter: "memory" });
	let security = db.security();
	t.notOk(security.nameHasAccess("admin"), "does not have admin name");
	t.notOk(security.nameHasAccess("member"), "does not have member name");
});

test("roleHasAccess() returns true when role is an admin or member", (t) => {
	t.plan(2);
	let db = new PouchDB("tmpdb", { adapter: "memory" });
	let security = db.security();
	security.admins.roles.add("admin");
	security.members.roles.add("member");
	t.ok(security.roleHasAccess("admin"), "has admin role");
	t.ok(security.roleHasAccess("member"), "has member role");
});

test("roleHasAccess() returns false when role is not admin or member", (t) => {
	t.plan(2);
	let db = new PouchDB("tmpdb", { adapter: "memory" });
	let security = db.security();
	t.notOk(security.roleHasAccess("admin"), "does not have admin role");
	t.notOk(security.roleHasAccess("member"), "does not have member role");
});

test("userHasAccess() returns true name is in members list", (t) => {
	t.plan(1);
	let db = new PouchDB("tmpdb", { adapter: "memory" });
	let security = db.security();
	security.members.names.add("myuser");
	const user = { name: "myuser", roles: [ "one", "two" ] };
	t.ok(security.userHasAccess(user), "user has access");
});

test("userHasAccess() returns true role is in members list", (t) => {
	t.plan(1);
	let db = new PouchDB("tmpdb", { adapter: "memory" });
	let security = db.security();
	security.members.roles.add("two");
	const user = { name: "myuser", roles: [ "one", "two" ] };
	t.ok(security.userHasAccess(user), "user has access");
});

test("userHasAccess() returns true when there are no members", (t) => {
	t.plan(1);
	let db = new PouchDB("tmpdb", { adapter: "memory" });
	let security = db.security();
	const user = { name: "myuser", roles: [ "one", "two" ] };
	t.ok(security.userHasAccess(user), "user has access");
});

test("userHasAccess() returns false when there are members and no matches", (t) => {
	t.plan(1);
	let db = new PouchDB("tmpdb", { adapter: "memory" });
	let security = db.security();
	security.members.names.add("otheruser");
	const user = { name: "myuser", roles: [ "one", "two" ] };
	t.notOk(security.userHasAccess(user), "user does not have access");
});

test("reset() removes everything", (t) => {
	t.plan(3);
	let db = new PouchDB("tmpdb", { adapter: "memory" });
	let security = db.security();
	security.members.names.add("membername");
	security.members.roles.add("memberrole");
	security.admins.names.add("adminname");
	security.admins.roles.add("adminrole");

	t.ok(security.hasMembers() && security.hasAdmins(), "security has members and admins");
	security.reset();
	t.notOk(security.hasMembers(), "security does not have members");
	t.notOk(security.hasAdmins(), "security does not have admins");
});

test("fetches security document from remote", (t) => {
	t.plan(2);

	const rawsecurity =  {
		members: {
			names: ["memberName"],
			roles: ["memberRole"]
		},
		admins: {
			names: ["adminName"],
			roles: ["adminRole"]
		}
	};

	let db = new PouchDB("http://localhost:5984/tmpdb", { adapter: "memory" });
	let security = db.security();

	// mock fetch
	db.fetch = function(url) {
		t.equals(url, "_security", "correct url");

		return Promise.resolve({
			ok: true,
			json() {
				return Promise.resolve(rawsecurity);
			}
		});
	};

	security.fetch().then(() => {
		t.deepEquals(security.toJSON(), rawsecurity, "security matches fetch result");
		t.end();
	});
});

test("saves security document to remote", (t) => {
	t.plan(4);

	const rawsecurity =  {
		members: {
			names: ["memberName"],
			roles: ["memberRole"]
		},
		admins: {
			names: ["adminName"],
			roles: ["adminRole"]
		}
	};

	let db = new PouchDB("http://localhost:5984/tmpdb", { adapter: "memory" });
	let security = db.security(rawsecurity);

	// mock fetch
	db.fetch = function(url, options) {
		t.equals(url, "_security", "correct url");
		t.equals(options.method, "PUT", "correct request method");
		t.equals(options.headers.get("Content-Type"), "application/json", "correct content-type");
		t.deepEquals(JSON.parse(options.body), rawsecurity, "correct body");

		return Promise.resolve({
			ok: true
		});
	};

	security.save().then(() => {
		t.end();
	});
});
