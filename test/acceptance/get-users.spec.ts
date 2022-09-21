import config from 'config';
import axios from 'axios';
import { faker } from '@faker-js/faker/locale/en';
import { User } from '../../src/models/user';

async function createUser(createUserApiUrl: string): Promise<Omit<User, 'CreationDate'>> {
    const userDataToCreate = {
        FirstName: faker.name.firstName(),
        LastName: faker.name.lastName()
    };
    const createUserResult = await axios.post(
        createUserApiUrl,
        userDataToCreate,
        {
            headers: {
                'Content-Type': 'application/json'
            }
        }
    );
    expect(createUserResult.status).toEqual(201);
    const userId = createUserResult.data.id;
    expect(typeof userId).toBe('string');

    return {
        UserId: userId,
        ...userDataToCreate
    }
}

describe("Get users API", () => {
    const createUserApiUrl = `${config.get<string>('createUserApiUrl')}/`;
    const getUsersApiUrl = `${config.get<string>('getUsersApiUrl')}/`;
    
    test("should find created user by partition key", async () => {
        // 1. Create user
        const createdUser = await createUser(createUserApiUrl);

        // 2. Get just created user
        const getUserParams = {
            UserId: createdUser.UserId
        };
        const getUserResult = await axios.get(getUsersApiUrl, {
            params: getUserParams
        });
        expect(getUserResult.status).toEqual(200);
        const [foundUser] = getUserResult.data.Items;
        expect(foundUser).toEqual(
            expect.objectContaining({
                FirstName: createdUser.FirstName,
                LastName: createdUser.LastName
            })
        );
    });

    test("should find created user by optional properties", async () => {
        // 1. Create user
        const createdUser = await createUser(createUserApiUrl);

        // 2. Get just created user
        const getUserParams = {
            FirstName: createdUser.FirstName,
            LastName: createdUser.LastName
        };
        const getUserResult = await axios.get(getUsersApiUrl, {
            params: getUserParams
        });
        expect(getUserResult.status).toEqual(200);
        const [foundUser] = getUserResult.data.Items;
        expect(foundUser).toEqual(
            expect.objectContaining({
                FirstName: createdUser.FirstName,
                LastName: createdUser.LastName
            })
        );
    });

    test("should find created users", async () => {
        // 1. Create users
        const createdUsers: Omit<User, 'CreationDate'>[] = [];
        for (let i = 0; i < 2; i++) {
            const createdUser = await createUser(createUserApiUrl);
            createdUsers.push(createdUser);
        }
    
        // 2. Get all users
        const getUserParams = {};
        const getUserResult = await axios.get(getUsersApiUrl, {
            params: getUserParams
        });
        expect(getUserResult.status).toEqual(200);
    
        // 3. Check if users were found
        const foundUser1 = getUserResult.data.Items.find(user => user.UserId === createdUsers[0].UserId);
        const foundUser2 = getUserResult.data.Items.find(user => user.UserId === createdUsers[1].UserId);
        expect(foundUser1).toEqual(expect.objectContaining(createdUsers[0]));
        expect(foundUser2).toEqual(expect.objectContaining(createdUsers[1]));
    });

    test("should return error of wrong filter property", async () => {
        const getUserParams = {
            age: faker.random.numeric(2)
        }
        const getUserResult = await axios.get(getUsersApiUrl, {
            params: getUserParams,
            validateStatus: (status) => status === 400
        });
        expect(getUserResult.data.error).toBe('"age" is not allowed');
    });
});