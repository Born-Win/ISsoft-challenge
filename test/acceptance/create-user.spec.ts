import config from 'config';
import axios from 'axios';
import { faker } from '@faker-js/faker/locale/en';

describe("Create user API", () => {
    const createUserApiUrl = `${config.get<string>('createUserApiUrl')}/`;
    const getUsersApiUrl = `${config.get<string>('getUsersApiUrl')}/`;
    const jsonContentRequestHeaders = {
        headers: {
          'Content-Type': 'application/json'
        }
      };
    
    test("should create user and return id", async () => {
        // 1. Create user
        const userDataToCreate = {
            FirstName: faker.name.firstName(),
            LastName: faker.name.lastName()
        };
        const createUserResult = await axios.post(createUserApiUrl, userDataToCreate, jsonContentRequestHeaders);
        expect(createUserResult.status).toEqual(201);
        const userId = createUserResult.data.id;
        expect(typeof userId).toBe('string');

        // 2. Get just created user
        const getUserParams = {
            UserId: userId
        };
        const getUserResult = await axios.get(getUsersApiUrl, {
            params: getUserParams
        });
        expect(getUserResult.status).toEqual(200);
        const [foundUser] = getUserResult.data.Items;
        expect(foundUser).toEqual(
            expect.objectContaining({
                FirstName: userDataToCreate.FirstName,
                LastName: userDataToCreate.LastName
            })
        );
    });

    test("should return error of wrong body", async () => {
        const createUserResult = await axios.post(createUserApiUrl, "", {
            ...jsonContentRequestHeaders,
            validateStatus: (status) => status === 400
        });
        expect(typeof createUserResult.data.error).toEqual('string');
    });

    test("should return error of wrong user property", async () => {
        const userDataToCreate = {
            age: faker.random.numeric(2)
        };
        const createUserResult = await axios.post(createUserApiUrl, userDataToCreate, {
            ...jsonContentRequestHeaders,
            validateStatus: (status) => status === 400
        });
        expect(createUserResult.data.error).toBe('"age" is not allowed');
    });
});