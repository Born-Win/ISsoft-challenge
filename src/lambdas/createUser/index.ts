import { APIGatewayProxyEventV2, APIGatewayProxyCallback, Context } from 'aws-lambda';
import { DynamoDB } from 'aws-sdk';
import moment from 'moment';
import { InputUserData } from './input-user-data';
import { validate } from './validator';

const ddb = new DynamoDB.DocumentClient({
    region: 'eu-central-1'
});


function generateErrorObject(message: string) {
    return {
        error: message
    }
}

function createUser(requestId: string, userData: InputUserData) {
    const params = {
        TableName: 'Users',
        Item: {
            UserId: requestId, // Partition key
            CreationDate: moment.utc().format("YYYY-MM-DD:hh:mm:ss.SSS"), // Sort key
            ...userData
        }
    }

    return ddb.put(params).promise();
}

export const handler = async (event: APIGatewayProxyEventV2, context: Context, callback: APIGatewayProxyCallback): Promise<void> => {
    try {
        if (!event.body) {
            return callback(null, {
                statusCode: 400,
                body: JSON.stringify(generateErrorObject('Invalid user data'))
            });
        }

        const inputUserData = JSON.parse(event.body);
        const validationResult = validate(inputUserData);

        if (validationResult instanceof Error) {
            return callback(null, {
                statusCode: 400,
                body: JSON.stringify(generateErrorObject(validationResult.message))
            });
        }

        const requestId = context.awsRequestId;

        await createUser(requestId, validationResult);
        const responseBody = JSON.stringify({
            message: 'User was created',
            id: requestId
        });
        return callback(null, {
            statusCode: 201,
            body: responseBody
        })
    } catch (err: any) {
        console.error(err);
        callback(null, {
            statusCode: 500,
            body: JSON.stringify(generateErrorObject(err.message))
        })
    }
}
