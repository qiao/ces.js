SRC = $(shell find src -name "*.js" -type f)
TEST_TIMEOUT = 2000
TEST_REPORTER = spec

test:
	@NODE_ENV=test \
		./node_modules/.bin/mocha \
		    --ui tdd \
			--require should \
			--timeout $(TEST_TIMEOUT) \
			--reporter $(TEST_REPORTER) \
			--bail

.PHONY: test
