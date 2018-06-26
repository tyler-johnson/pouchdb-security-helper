import {assign} from "lodash";
import Security from "./doc.js";
import Level from "./level.js";
import {default as Type, Names, Roles} from "./type.js";

assign(Security, { Level, Type, Names, Roles });

let plugin = {
	Security,
	security: function(doc) {
		return new Security(this, doc);
	}
};

export default plugin;
