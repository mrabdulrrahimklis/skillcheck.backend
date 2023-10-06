# Keleya Skill-Check

## Backend

The task here is to finish the provided 'barebone' backend by implementing all endpoints and required functionality, and setting up the database following these requirements. The goal of this 'project' is to end up with a working REST API with CRUD endpoints for a simple user management, paired with authorization and authentication methods.

For the backend we are using two modern frameworks, [NestJS](https://docs.nestjs.com/) and [Prisma](https://www.prisma.io/docs/getting-started) running on Node 14. To make the database setup as simple as possible, we will use a SQlite DB. One part of this task will thus be, to familiarize yourself with the technology stack.

The repository as provided throws NotImplementedException() for the missing functions, as well as misses the data structures and database.

### Types

Data is being transferred between functions using Data Transfer Objects. This need to be implemented in accordance with the data model. Optionally, data validation should be implemented as well to assure that valid data is being sent into the application.

### Database

The database should follow this schema:
![backend schema](backend_schema.png)

Command lines:

- `npx prisma migrate dev` for migration
- `npx prisma db seed` for seeding

### Endpoints

- GET /user should query for users with these optional filtering parameters:
  - `limit` Limit the number of results returned
  - `offset` Skip the first n results
  - `updatedSince` Return only items which were updated since Date.
  - `id` An Array of id(s) to limit the query to
  - `name` a LIKE search for names
  - `credentials` include the related credentials in result
  - `email` search for matching email
- GET /user/:id should return one specific user with that id
- (public) POST /user should create a new user with credentials
- PATCH /user should update a user if it exists and should update credentials if they exist IF the user has not been deleted previously
- DELETE /user marks the user as deleted and also removes related credentials rows, but does NOT remove the user row itself
- (public) POST /user/authenticate authenticates the user with an email/password combination and returns a boolean
- (public) POST /user/token authenticates the user with an email/password combination and returns a JWT token
- (public) POST /user/validate validates a Bearer token sent via authorization header and returns a boolean

### Security

- Endpoints marked (public) should allow access without authorization
- Endpoints **not** marked (public) should check JWT tokens and map to users
- Health Check endpoints should be public and no JWT should be required
- Non-public endpoints called by Admin users should allow requests to modify all users, while regular users should locked into their own user - they are only allowed to work on their own user id
- Passwords need to be hashed and salted

### Testing

- If possible, unit tests should check the functionality of the various endpoints and services
- Alternatively, discuss why certain tests were not implemented, necessary or useful, or suggest a test environment

### Extra

- Discuss improvements to the data models or endpoints
- Feel free to suggest other solutions to implement similar projects (but for this skill check, do use the given tech stack as provided here)

### How to do the skill check

- Fork this repository
- Make modifications as you see fit
- Add all your notes into this readme
- Send us the link to your fork
- Tell us how long it took you to get the repository to the state you sent us - remember: it's ok to take time if it's done properly.
- Import Hiring Backend Test.postman_collection.json into the latest Postman client and run the collection tests. Depending on how you seed your database, some tests may need to be adjusted for ids. Please take a screenshot of the results like this one:
- ![postman_tests.png](postman_tests.png)
- Send us this screenshot as well as the export of your postman tests.
- the following should run without errors:
```
yarn
npx migrate reset
yarn test
```

### Your Notes Below Here

- Done tasks with NotImplementedException()
- Packages as I get request of this task focus was to work in this env and I tried to NOT install or update any of dependency but Prisma have great improvements in new version especially for Nested create data so thats reason why I used 
```
  async create(createUserDto: CreateUserDto) {
    const { Credentials, ...rest } = createUserDto;

    const hash = await hashPassword(Credentials.hash);
    const credentials = await this.prisma.credentials.create({ data: { hash } });

    try {
      return this.prisma.user.create({
        data: {
          ...rest,
          credentials_id: credentials.id,
        },
      });
    } catch (e) {
      this.prisma.credentials.delete({ where: { id: credentials.id } });

      throw new HttpException('Bad request.', HttpStatus.BAD_REQUEST);
    }
  }
```
instead of using something like this from documentation
```
const result = await prisma.user.create({
  data: {
    email: 'elsa@prisma.io',
    name: 'Elsa Prisma',
    posts: {
      create: [
        { title: 'How to make an omelette' },
        { title: 'How to eat an omelette' },
      ],
    },
  },
  include: {
    posts: true, // Include all posts in the returned object
  },
})
```
- in some deep validation including this class validator I will also include `Zod` or `Yup` validators in my project because that gives us new level of validation in services also
- Swagger documentation is now fixed and generated and I made bit of refactoring of `main.ts` file and refactor some functions
- As I was working on multiple NestJS projects I wish to maybe always have separated models and modular project architecture then I'll be able to speed up on some other projects and reuse some logic from previous projects and have some sub-repository
- Whole Query exception filter here is just focused on one case and it will be great to better handle it
- on findMany users Request there is now excluded soft deleted users but there is flag that can be changed to get all users including soft delete but soft deleted users will not have Credentials
- test are added in Postman but also in code with Jest for several services functions but for controler just there is old tests that show service and controler are there

## Improvnments

- I wish to use here some packages for generating Classes from `prisma.schema` that will speed up development once when then generic is done: [Class Generator]("https://www.npmjs.com/package/prisma-class-generator")
- It will be great to use some `prisma-filter` that help us in filtering data but also provide readable link for loading data: [Prisma Filter]("https://github.com/chax-at/prisma-filter")

Postman collection in file Keleya Klis.postman_collection.json

 ![createUser.png](/postman_test_picture/createUser.png)
 ![getToken.png](/postman_test_picture/getToken.png)
 ![userById.png](/postman_test_picture/userById.png)
 ![userUpdate.png](/postman_test_picture/userUpdate.png)
