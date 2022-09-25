# Contribution

Hi 👋🏼

Really happy to see you here ^^.

This document aims to onboard you onto `clix` contributing.

## How submit a pull request?
* First, you should check that your branch is based on a feature branch (`vX.X.X`), if there are no new feature branch available you should create them your self or ask me (gorez.tony@gmail.com).
* Each feature should be covered with
  * unit tests
  * functional tests
* The pull request should have a proper title and description explaining
  * Context/motivation
  * What you added?
  * What is the gain?
* Before asking for reviews, please make sure your tests are passing in the CI
* `README.md` or any documentation should have been updated if necessary

## Install the dependencies:

```
npm i
```

> ⚠️ Required Node.JS version: 16.X.X or greater.

## Tests

### Unit Tests

What do you need to know about the unit tests ?

* Technology: [tap](https://node-tap.org/)
* Command: `npm test:unit`
* Watch Command: `npm test:unit:watch` *(Recommended during development session.)*

### Functional Tests

* Technology: [tap](https://node-tap.org/)
* Command: `npm run test:functional`

### Run tests in CI

Sometimes in your hacking journey you'll have to handle backward compatibility for Node.JS 16.x, 17.x and 18.x.

So If you want to mimic the CI and run tests (unit or functional) in a previous version of node, you could use this template command:

```bash
$ docker run --rm -it -v $PWD:$PWD --workdir $PWD <node-version> <command>
```

Where:
- node-version: a docker image (like `node:12`, `node:14`...)
- command: a npm command from the package.json (like `npm run test`)

For example, if you want to run functional tests in Node.JS 16.x:

```bash
$ docker run --rm -it -v $PWD:$PWD --workdir $PWD node:16 npm run test:functional
```

## Debugging

To see all the internal logs used in `clix`, set the DEBUG environment variable to restqa when launching your command.

```
DEBUG=1 <your-command>
```

## Release

We have a workflow in the CI responsible for packages releases (`.gihtub/workflows/publish.yml`).

### How to trigger a release ?

You have to:
* Bump the version in the `package.json`
* Add a tag to the last commit.
```bash
$ git tag <version>
```
* Push the tag
```bash
$  git push --tags
```
* Go to github repository interface and visit the release [page](https://github.com/tony-go/clix/releases)
* Click on "Draft a new release button", then:
  * Choose the tag you just pushed
  * Write a title (the version)
  * Write a description in the proper way, please look at old release if you need a model.
  * Click on "Publish Release" button
* You should find a new "publish" workflow in the [actions section](https://github.com/tony-go/clix/actions/workflows/publish.yml)

