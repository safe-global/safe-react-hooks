# Contributing Guidelines

First off, **thank you** for considering contributing to this project!

## Table of contents

- [I Have a Question](#i-have-a-question)
- [I Want to Contribute](#i-want-to-contribute)

## I Have a Question

See our [support guidelines](https://github.com/safe-global/safe-core-sdk-react-hooks/tree/main/SUPPORT.md). **Do not** use GitHub issues for general support or questions.

## I Want to Contribute
### Legal Notice
You will need to agree to [our CLA](https://safe.global/cla) in order to be possible to consider your contribution.

### Starting Guide

By following the steps bellow you will understand the development process and worflow.
1. [Forking the repository](#forking-the-repository)
2. [Installing Node and Yarn](#installing-node-and-yarn)
3. [Installing dependencies](#installing-dependencies)
4. [Running the tests](#running-the-tests)
5. [Submitting a pull request](#submitting-a-pull-request)

#### Forking the repository

The first step would be to [fork the repository](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/working-with-forks/fork-a-repo#forking-a-repository). This will allow you to get a current copy of the repository state. Follow the steps to also clone your forked repository locally.

For active development we use the `development` branch. Our `main` branch contains only the currently published code. All new branches should be created from `development`.

#### Installing Node and Yarn

The Safe{Core} SDK uses [Node](https://nodejs.org) as development environment and Yarn to manage the dependencies. You will need to make sure you are using the [latest Node LTS version](https://nodejs.org/en/about/previous-releases) and that you have available Yarn v1.

You can check which versions you are using with:

```bash
node -v
yarn -v
```

#### Installing dependencies    

Install all dependencies and build the whole project by using the following commands at the project root.

```bash
yarn install
yarn build
```

#### Running the tests

```bash
yarn test
```

#### Submitting a pull request

From the forked repository you can [open a pull request](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/proposing-changes-to-your-work-with-pull-requests/creating-a-pull-request) to the original repository. Make sure to select the `safe-global:development` branch as the target branch.
