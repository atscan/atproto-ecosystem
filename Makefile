.PHONY: all

all: test build

test:
	deno test --allow-read utils/test.js 

build:
	deno run --allow-read --allow-write utils/build.js

format:
	deno fmt

fmt: format