# Awesome Project Build with TypeORM

Steps to run this project:

1. Run `npm i` command
2. Setup database settings inside `data-source.ts` file
3. Run `npm start` command

4. i have made some changes on my package.json file to make it dev dependencies
5. change the name to app.ts
6. the verifyed user id can be access from any router by importing the `verifyToken` function from authuser middleware. so now it is not only middleware we can reuse it
7. about the token i prefer to put it in cookie than session. if doing that have issue let me know.
