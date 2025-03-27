/* 8. Create a demo of storing order data in DynamoDB. 
 *    Your demo should assume you need to store the things needed for an online eCommerce solution. 
 *    For local development, I recommend installing the LocalStack AWS emulator.
 */

import { CreateTableCommand, DeleteTableCommand, DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { BatchGetCommand, BatchWriteCommand } from '@aws-sdk/lib-dynamodb';

const client = new DynamoDBClient({
  endpoint: 'http://localhost:4566',
  region: 'us-east-1',
  credentials: {
    accessKeyId: 'test',
    secretAccessKey: 'test',
  },
});

console.log('\n\nCreating Orders table...');
await client.send(
  new CreateTableCommand({
    'TableName': 'Orders',
    'AttributeDefinitions': [{ AttributeName: 'OrderID', AttributeType: 'S' }],
    'KeySchema': [{ AttributeName: 'OrderID', KeyType: 'HASH' }],
    'ProvisionedThroughput': { ReadCapacityUnits: 5, WriteCapacityUnits: 5 },
  }),
).then((data) => {
  console.log(data);
}).catch((error) => {
  console.error(error);
});

console.log('\n\nInserting order data...');
const orders = [
  {
    PutRequest: {
      Item: {
        OrderID: crypto.randomUUID(),
        OrderDate: new Date().toISOString(),
        CustomerID: crypto.randomUUID(),
        OrderItems: [
          { ItemID: crypto.randomUUID(), Quantity: 1, Price: 10.00 },
          { ItemID: crypto.randomUUID(), Quantity: 2, Price: 15.00 },
        ],
        OrderTotal: 25.00,
      },
    },
  },
  {
    PutRequest: {
      Item: {
        OrderID: crypto.randomUUID(),
        OrderDate: new Date().toISOString(),
        CustomerID: crypto.randomUUID(),
        OrderItems: [
          { ItemID: crypto.randomUUID(), Quantity: 1, Price: 20.00 },
          { ItemID: crypto.randomUUID(), Quantity: 3, Price: 30.00 },
        ],
        OrderTotal: 50.00,
      },
    },
  },
];

await client.send(
  new BatchWriteCommand({
    RequestItems: {
      Orders: orders,
    },
  }),
).then((data) => {
  console.log(data);
}).catch((error) => {
  console.error(error);
});

console.log('\n\nGetting order data...');
const keys = { Keys: orders.map((order) => ({ OrderID: order.PutRequest.Item.OrderID })) };
await client.send(
  new BatchGetCommand({
    RequestItems: {
      Orders: keys,
    },
  }),
).then((data) => {
  console.log(data.Responses);
}).catch((error) => {
  console.error(error);
});

console.log('\n\nDeleting Orders table...');
await client.send(
  new DeleteTableCommand({ TableName: 'Orders' }),
).then((data) => {
  console.log(data);
}).catch((error) => {
  console.error(error);
});

//vim: set ts=2 sw=2 sts=2 et
