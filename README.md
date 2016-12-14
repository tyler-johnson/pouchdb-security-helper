# PouchDB Security Helper

[![npm](https://img.shields.io/npm/v/pouchdb-security-helper.svg)](https://www.npmjs.com/package/pouchdb-security-helper) [![Build Status](https://travis-ci.org/tyler-johnson/pouchdb-security-helper.svg?branch=master)](https://travis-ci.org/tyler-johnson/pouchdb-security-helper)

A PouchDB plugin with helpers for handling the CouchDB `_security` document.

## Install

Install via NPM:

```sh
npm i pouchdb-security-helper -S
```

And use like any normal PouchDB plugin:

```js
const securityPlugin = require("pouchdb-security-helper");
PouchDB.plugin(securityPlugin);
```

## Usage

This plugin adds a single method to PouchDB instances: `.security()`. This will return a Security instance which has several helper methods for dealing with the `_security` document. The typical flow is to fetch the existing security document, make some changes, and then save it back to the database.

```js
const security = db.security();

security.fetch().then(() => {
  // add superadmin as role to members and admins
  security.members.roles.add("superadmin");
  security.admins.roles.add("superadmin");

  return security.save();
}).catch(e => {
  console.error(e);
});
```

There are also methods for determining if a user or role is in the security document.

```js
const security = db.security();
const user = { name: "bobby", roles: [ "superadmin" ] };

security.fetch().then(() => {
  if (!security.userHasAccess(user)) {
    throw new Error("User does not have access.");
  }
}).catch(e => {
  console.error(e);
});
```

## API

#### db.security()

```
db.security() → Security
```

This method is attached to the PouchDB instance by this plugin. This will return a new instance of the Security class that is attached to the database.

The PouchDB instance you call this on should be using the `http` adapter and be connected to a CouchDB instance. Otherwise, you will need to use the [pouchdb-security](http://ghub.io/pouchdb-security) plugin to add security features. This will allow the Security document to be fetched and saved.

```js
const security = db.security();
```

### Security

The `Security` class is the main class that represents the entire `_security` document.

#### security.admins and security.members

```
security.admins → SecurityLevel
security.members → SecurityLevel
```

These are the objects representing the `admins` and `members` levels in the security document.

#### security.fetch()

```
security.fetch() → Promise<void>
```

This will retrieve the latest `_security` document and store it within the Security instance. After this completes it is safe to use the helpers on the Security document.

#### security.save()

```
security.save() → Promise<void>
```

This will save any changes to the internal Security document back to CouchDB. This will write exactly what is held internally, which means you must call `.fetch()` before calling save. Otherwise the security document will be overwritten with a blank object.

#### security.hasMembers()

```
security.hasMembers() → Boolean
```

Returns a boolean for whether or not the security document has any `names` or `roles` in the `members` object.

#### security.hasAdmins()

```
security.hasAdmins() → Boolean
```

Returns a boolean for whether or not the security document has any `names` or `roles` in the `admins` object.

#### security.userHasAccess()

```
security.userHasAccess( userCtx ) → Boolean
```

Determines if a user, as defined by the `userCtx`, has a name or role in the security document. The `userCtx` should be an object with `name` and `roles` fields, usually what `_session` would return. It can also be string, in which case it is interpretted as the `name` and used with `.nameHasAccess()`.

#### security.nameHasAccess()

```
security.nameHasAccess( name ) → Boolean
```

Determines if a `name` has access to the database, by checking it against the `admins` and `members` names array.

#### security.roleHasAccess()

```
security.roleHasAccess( role ) → Boolean
```

Determines if a `role` has access to the database, by checking it against the `admins` and `members` roles array.

#### security.toJSON()

```
security.toJSON() → Object
```

Returns the object of JSON that could be saved to the `_security` document in CouchDB.

#### security.reset()

```
security.reset() → this
```

Removes everything inside the security document, all names and roles, admins and members.

#### security.clone()

```
security.clone() → Security
```

Returns a new Security instance that is an exact duplicate of this instance.

### Security Level

The `SecurityLevel` class represents the object with `names` and `roles` arrays. In the `security` document, these are the `admins` and `members` objects.

#### level.names and level.roles

```
level.names → SecurityType
level.roles → SecurityType
```

These are the objects representing the `names` and `roles` in a security level.

#### level.removeAll()

```
level.removeAll() → this
```

Removes all `names` and `roles` from this level.

#### level.isEmpty()

```
level.isEmpty() → Boolean
```

Returns `true` when this level does not have any `names` or `roles`.

#### level.add()

```
level.add( data [, opts ] ) → this
```

Adds names and roles into the level, merging with existing names and roles. `data` should be an object with `names` and `roles` arrays. `opts` matches the `.set()` options, with `add` defaulting to `true`.

#### level.remove()

```
level.remove( data [, opts ] ) → this
```

Removes names and roles from the level. `data` should be an object with `names` and `roles` arrays. `opts` matches the `.set()` options, with `remove` defaulting to `true`.

#### level.set()

```
level.set( data [, opts ] ) → this
```

Sets `names` and `roles` on the level, using a `data` object. This is very dynamic and depending on how you use `opts` this will do different things.

- Set `{ add: true }` for `opts` to merge the data in with the level.
- Set `{ remove: true }` for `opts` to remove the data from the level.
- Don't pass `opts` to overwrite the existing level completely.

#### level.toJSON()

```
level.toJSON() → Object
```

Returns a simple JSON object representing the level. This can be saved back to CouchDB.

#### level.clone()

```
level.clone() → SecurityLevel
```

Returns an exact duplicate of this SecurityLevel instance.

### SecurityType

A SecurityType is the lowest level class in a security document and represents an list of strings, typically for `names` or `roles`.

#### type.size

```
type.size → Number
```

Returns the length of the underlying array.

#### type.add()

```
type.add( items ) → this
```

Add a name or role to the list. This can be a string or an array of strings. This will only add names and roles which are not already in the list, ensuring that there are no duplicates.

#### type.remove()

```
type.remove( items ) → this
```

Remove a name or role from the list. This can be a string or an array of strings.

#### type.removeAll()

```
type.removeAll() → this
```

Removes all items from the list.

#### type.has()

```
type.has( item ) → Boolean
```

Returns `true` if `item` can be found in the list.

#### type.toJSON()

```
type.toJSON() → Array
```

Returns the list as an array of strings.

#### type.forEach()

```
type.forEach( fn [, ctx ] ) → this
```

Run a function `fn` over every item in the list. This will call fn with the syntax `fn.call(ctx, item, index, list)`.

#### type.map()

```
type.map( fn [, ctx ] ) → Array
```

Similar to `.forEach()`, but returns an array of items that was returned from `fn`.

#### type.clone()

```
type.clone() → SecurityType
```

Returns an exact copy of the SecurityType.
