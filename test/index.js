import test from "tape";
import PouchDB from "pouchdb";
import securityPlugin from "pouchdb-security-helper";

PouchDB.plugin(securityPlugin);

test("security() method returns an security object", (t) => {
	t.plan(1);
	let db = new PouchDB("tmpdb", { adapter: "memory" });
	let security = db.security();
	t.ok(security, "returns security object");
});
