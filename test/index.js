import PouchDB from "pouchdb";
import memoryAdapter from "pouchdb-adapter-memory";
import securityPlugin from "../src/index.js";

PouchDB.plugin(memoryAdapter);
PouchDB.plugin(securityPlugin);

import "./doc.js";
import "./level.js";
import "./type.js";
