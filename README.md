# Node js serverless NoSQL infrastructure

Infrastructure created for collecting data and injecting it into the respective tables.

## Technologies
   | Type     |   Name    |
   | -------- | --------: |
   | Platform | Node.js   |
   | Database | DynamoDB  |
   | AWS      | S3        |
   | AWS      | Lambda    |
   | CI/CD    | Terraform |
   | Testing  | Jest      |

## How To Use

### Presetting

Before deploying lambda expressions to AWS, you need to prepare the data with the appropriate structure:
- `npm run compile` - compiling typescript and creating a dist folder.
- `npm run terraform:prepare:data` - processing the dist folder into a special structure for deployment.

Using terraform as a CI/CD requires it to be initialized: `npm run terraform:init`

### Deploy lambdas
`npm run terraform:deploy` - in result will be generated endpoints in<b>./terraform/terraform.tfstate</b>

### Additional
Tthe terraform variable file `terraform.tfvars` is not added to github, so you need to add it with your own values









