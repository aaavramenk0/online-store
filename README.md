# Online Store Website

Welcome to the documentation for the Online Store Website project repository. This documentation provides an overview of the project, its technical stack, and instructions on how to set up and run the application locally.

## Table of Contents

1. [Project Overview](#project-overview)
2. [Technical Stack](#technical-stack)
3. [Getting Started](#getting-started)
   - [Prerequisites](#prerequisites)
   - [Installation](#installation)

---

## 1. Project Overview

The Online Store Website is an e-commerce platform developed using Next.js for the frontend, Nest.js for the backend, and MongoDB for the database. The project aims to provide users with a seamless online shopping experience, featuring a user-friendly interface created with the `shadcn-ui` UI library.

## 2. Technical Stack

The technical stack used in this project includes:

- **Frontend**:

  - [Next.js](https://nextjs.org/) - A React framework for building web applications.
  - [TypeScript](https://www.typescriptlang.org/) - A statically typed superset of JavaScript for enhanced code quality and developer productivity.
  - [Shadcn-ui](https://github.com/shadcn/shadcn-ui) - A UI library for building elegant and responsive user interfaces.
  - [Tanstack Query](https://tanstack.com/query/latest) - Powerful asynchronous state management for TS/JS, React, Solid, Vue and Svelte
  - [TailwindCss](https://tailwindcss.com/) - A utility-first CSS framework packed with classes that can be composed to build any design, directly in your markup.
  - [Zod](https://zod.dev/) - TypeScript-first schema validation with static type inference
  - [Zustand](https://zustand-demo.pmnd.rs/) - A small, fast, and scalable bearbones state management solution.

- **Admin Panel**:

  - [React](https://react.dev/) - The library for web and native user interfaces
  - [TypeScript](https://www.typescriptlang.org/) - A statically typed superset of JavaScript for enhanced code quality and developer productivity.
  - [Shadcn-ui](https://github.com/shadcn/shadcn-ui) - A UI library for building elegant and responsive user interfaces.
  - [Tanstack Query](https://tanstack.com/query/latest) - Powerful asynchronous state management for TS/JS, React, Solid, Vue and Svelte
  - [TailwindCss](https://tailwindcss.com/) - A utility-first CSS framework packed with classes that can be composed to build any design, directly in your markup.
  - [Zod](https://zod.dev/) - TypeScript-first schema validation with static type inference

- **Backend**:

  - [Nest.js](https://nestjs.com/) - A progressive Node.js framework for building efficient and scalable server-side applications.
  - [TypeScript](https://www.typescriptlang.org/) - A statically typed superset of JavaScript for enhanced code quality and developer productivity.
  - [Swagger](https://swagger.io/) - A set of tools for describing an Api
  - [Cloudinary](https://cloudinary.com/) - Provides cloud-based image and video management services

- **Database**:

  - [MongoDB](https://www.mongodb.com/) - A NoSQL database for storing and managing application data.

## 3. Getting Started

### Prerequisites

Before you can run the Online Store Website locally, make sure you have the following prerequisites installed on your system:

- [Node.js](https://nodejs.org/) - The JavaScript runtime for running the application.
- [npm](https://www.npmjs.com/) or [Yarn](https://yarnpkg.com/) - Package managers for installing project dependencies.
- [MongoDB](https://www.mongodb.com/) - The database used by the application.

### Installation

1. Clone the repository:
   ```shell
   git clone -b auth https://github.com/aaavramenk0/online-store.git
   cd online-store
   ```
2. Install frontend dependencies:

   ```shell
   cd admin
   npm install

   cd ../client
   npm install
   ```

3. Install backend dependencies

   ```shell
   cd ../server-admin
   npm install

   cd ../server-client
   npm install
   ```
