# Starter Project - `Backend Developer Expert`

## How to test this in local environment ?
### Installation
#### 1. `git clone https://github.com/husniyahLiSAn/forum-app-api.git`
#### 2. `cd forum-app-api`
#### 3. `npm install` to install the all dependencies needed

### Configuration
#### 4. Create two PostgreSQL databases for production & testing
#### 5. Rename `test_example.json` to `test.json`. Then change the `db_user`, `db_password`, & `db_name` (for testing database only) value in that `test.json` file based on yours
#### 6. Rename `.env.example` to `.env`. Then change the `db_user`, `db_password`, & `db_name` value in that `.env` file based on yours
#### 6.1. Change `access_token_key` and `refresh_token_key` in `.env` file with your generated encryption keys
You can generate your own encryption keys with following steps:
1. `node`
2. `require('crypto').randomBytes(64).toString('hex');`
3. Copy the result string and use it as the environment variable value to the config file

### Run the App
#### 7. `npm run migrate:test up` to migrate/create table to the testing database and `npm run migrate up` to migrate/create table to the original database
#### 8. `npm run test:watch` to run the test (Coverage 100%)
#### 9. `npm run start:dev` to run the server
