<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="200" alt="Nest Logo" /></a>
</p>

# Thai Official Prep API

This is the backend API for the One-Stop Service for Government Exams preparation platform, built with NestJS, Prisma, and PostgreSQL.

## Description

A comprehensive platform to help users prepare for Thai government official exams, featuring exam banks, announcements, user management, and subscription services.

## Getting Started

### Prerequisites

- Node.js (v18 or later)
- npm or yarn
- PostgreSQL
- Docker (optional, for running PostgreSQL)

### Installation

1.  Clone the repository:
    ```bash
    git clone <repository-url>
    ```
2.  Navigate to the project directory:
    ```bash
    cd thai-official-prep-api
    ```
3.  Install dependencies:
    ```bash
    npm install
    ```

### Environment Configuration

1.  Create a `.env` file by copying the example file. This file will store your local environment variables.
    ```bash
    cp .env.example .env
    ```
2.  Open the `.env` file and fill in the required values for your local environment, especially `DATABASE_URL` and `JWT_SECRET`.

### Running the App

```bash
# development
npm run start

# watch mode
npm run start:dev

# production mode
npm run start:prod
```

### Database Migration

To apply database schema changes, run the Prisma migrate command:
```bash
npx prisma migrate dev --name <migration-name>
```

## Stay in touch

- Author - [Your Name](https://your-website.com)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](LICENSE).
