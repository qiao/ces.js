SRC = $(shell find src -name "*.js" -type f)
TEST_TIMEOUT = 2000
TEST_REPORTER = spec

dist/ces-browser.js: $(SRC)
	@node util/build.js

test:
	@NODE_ENV=test \
		./node_modules/.bin/mocha \
		    --ui bdd \
			--require should \
			--timeout $(TEST_TIMEOUT) \
			--reporter $(TEST_REPORTER) \
			--bail

clean:
	rm -f dist/*.js

.PHONY: test clean
