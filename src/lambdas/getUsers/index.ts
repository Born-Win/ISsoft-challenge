import { APIGatewayProxyEventV2, APIGatewayProxyCallback, Context } from 'aws-lambda';
import { DynamoDB } from 'aws-sdk';
import { validate } from './validator';

const ddb = new DynamoDB.DocumentClient({
    region: 'eu-central-1'
});

function generateErrorObject(message: string) {
    return {
        error: message
    }
}

function getUsers(queryParams: Record<string, string>) {
    let filterExpression = '';
    const expressionAttributeValues = {};
    const paramsArray = Object.keys(queryParams);

    for (const [index, param] of paramsArray.entries()) {
        filterExpression += `${param} = :${param}`;
        if (index != paramsArray.length - 1) {
            filterExpression += ' AND ';
        };
        expressionAttributeValues[`:${param}`] = queryParams[param];
    }

    const params: {
        TableName: string;
        FilterExpression?: string;
        ExpressionAttributeValues?: Record<string, string>
    } = {
        TableName: 'Users'
    };

    // Filter expression and expression attribute values cannot be empty
    if (filterExpression) {
        params.FilterExpression = filterExpression;
        params.ExpressionAttributeValues = expressionAttributeValues;
    }

    return ddb.scan(params).promise();
}


export const handler = async (event: APIGatewayProxyEventV2, context: Context, callback: APIGatewayProxyCallback): Promise<void> => {
    try {
        const queryParams = event.queryStringParameters || {};
    
        const validationResult = validate(queryParams);
    
        if (validationResult instanceof Error) {
            return callback(null, {
                statusCode: 400,
                body: JSON.stringify(generateErrorObject(validationResult.message))
            });
        }
    
        const getUsersResult = await getUsers(validationResult);
        const responseBody = JSON.stringify(getUsersResult);
        return callback(null, {
            statusCode: 200,
            body: responseBody
        });
    } catch (err: any) {
        console.error(err);
        callback(null, {
            statusCode: 500,
            body: JSON.stringify(generateErrorObject(err.message))
        })
    }
}
