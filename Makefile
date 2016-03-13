BIN = ./node_modules/.bin
SRC = $(wildcard src/* src/*/*)

build: index.js

index.js: src/index.js $(SRC)
	$(BIN)/rollup $< -c -f cjs > $@

test.js: test/index.js index.js $(TEST)
	$(BIN)/rollup $< -c -f cjs > $@

test: test-node test-browser
	make clean-self

test-node: test.js install-self
	node $<

test-browser: test.js install-self
	$(BIN)/browserify $< --debug | $(BIN)/tape-run

install-self: clean-self
	ln -s ../ node_modules/pouchdb-security-helper

clean-self:
	rm -f node_modules/pouchdb-security-helper

clean:
	rm -f index.js test.js

.PHONY: build clean test test-node test-browser install-self clean-self
