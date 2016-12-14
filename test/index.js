import test from "tape";
import PouchDB from "pouchdb";
import memoryAdapter from "pouchdb-adapter-memory";
import securityPlugin from "../src/index.js";

PouchDB.plugin(memoryAdapter);
PouchDB.plugin(securityPlugin);

test("security() method returns an security object", (t) => {
	t.plan(1);
	let db = new PouchDB("tmpdb", { adapter: "memory" });
	let security = db.security();
	t.ok(security, "returns security object");
});
