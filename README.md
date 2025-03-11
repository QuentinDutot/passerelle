# PasserelleJS

[![npm](https://img.shields.io/npm/v/passerelle.svg?maxAge=1000)](https://www.npmjs.com/package/passerelle)
[![npm](https://img.shields.io/npm/dt/passerelle.svg?maxAge=1000)](https://www.npmjs.com/package/passerelle)
[![CI](https://github.com/QuentinDutot/passerelle/actions/workflows/ci.yml/badge.svg)](https://github.com/QuentinDutot/passerelle/actions/workflows/ci.yml)

TypeScript **Inversion of Control** container for **Dependency Injection**.

It supports **Functions and Classes**, **Scoped Containers**, **Transient and Singleton Strategies**, and **Cyclic Dependency Detection**.

- 🪶 0.9KB minified
- 🧩 Zero dependencies
- 📦 TypeScript and ESM
- 🧪 100% Test Coverage
- 🌐 Runtime Agnostic (Browser, Node, Deno, Bun, AWS, Vercel, Cloudflare, ..)

## 🚀 Usage

```js
import { createContainer } from 'conteneur'

const container = createContainer()

container.register({
  dataService: [createDataService],
  reportService: [createReportService],
})

const reportService = container.resolve('reportService')

reportService.getReport() // Report: data from DataService
```

Full TypeScript example with resolution, injection, scoping: [docs/typescript-example.md](./docs/typescript-example.md)

## 🔋 APIs

Creates a new container.

```js
createContainer(options?: ContainerOptions): Container
```

`options.defaultStrategy` : *transient* (default) - *singleton*

### register

Registers multiple resolvers within the container.

```js
container.register(entries: ResolverEntries): void
```

`options.strategy` : *transient* (default) - *singleton*

### resolve

Injects a function or a class **registered** in the container with its dependencies and returns the result.

```js
container.resolve<Key  extends keyof Container>(key: Key): Container[Key]
```

### inject

Injects a function or a class **not registered** in the container with its dependencies and returns the result.

```js
container.inject<T>(target: FunctionFactory<T>): T
```

### createScope

Creates a new scope within the container.

```js
container.createScope():  void
```

## 📊 Comparisons
|                     | ConteneurJS | InversifyJS | TSyringe  | TypeDI   | Awilix    |
|---------------------|-------------|-------------|-----------|----------|-----------|
| TS + ESM + Tests    | ✅          | ✅          | ✅        | ✅       | ✅        |
| Dependency Count    | 🥇 0        | 🥈 1        | 🥈 1      | 🥇 0     | 🥉 2      |
| Runtime Agnostic    | ✅          | ❌          | ❌        | ❌       | ❌        |
| Function Support    | ✅          | ❌          | ❌        | ❌       | ✅        |
| Class Support       | ✅          | ✅          | ✅        | ✅       | ✅        |
| Value Support       | ✅          | ❌          | ❌        | ❌       | ✅        |
| Decorator Free      | ✅          | ❌          | ❌        | ❌       | ✅        |
| Lifetime Management | ✅          | ✅          | ✅        | ✅       | ✅        |
| Scoped Container    | ✅          | ✅          | ✅        | ❌       | ✅        |
| Size (min)          | 🥇 1.1kb    | ➖ 49.9kb   | ➖ 15.6kb | 🥈 9.5kb | 🥉 12.5kb |
| Size (min + gzip)   | 🥇 0.6kb    | ➖ 11.1kb   | ➖ 4.7kb  | 🥈 2.7kb | 🥉 4.6kb  |

## 📃 Inspiration

This project was inspired by [jeffijoe/awilix](https://github.com/jeffijoe/awilix) and builds upon its core concepts.
