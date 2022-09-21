# Archive files for lambdas and s3 objects
data "archive_file" "lambda_create_user" {
  type        = "zip"
  source_dir  = "../${path.module}/terraform-data/createUser"
  output_path = "../${path.module}/terraform-data/createUser.zip"
}

data "archive_file" "lambda_get_users" {
  type        = "zip"
  source_dir  = "../${path.module}/terraform-data/getUsers"
  output_path = "../${path.module}/terraform-data/getUsers.zip"
}

# IAM role for lambdas
resource "aws_iam_role" "lambda_role" {
  name               = "lambda_role"
  assume_role_policy = file("../lambda_assume_role_policy.json")
}

# IAM role dynamodb policy for lambdas
resource "aws_iam_role_policy" "lambda_policy" {
  name   = "lambda_policy"
  role   = aws_iam_role.lambda_role.id
  policy = file("../lambda_policy.json")
}

# IAM role-policy for lambdas
resource "aws_iam_role_policy_attachment" "lambda_policy" {
  role       = aws_iam_role.lambda_role.id
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

# AWS s3 object for createUser
resource "aws_s3_object" "lambda_create_user" {
  bucket = aws_s3_bucket.lambda_bucket.id
  key    = "createUser.zip"
  source = data.archive_file.lambda_create_user.output_path
  etag   = filemd5(data.archive_file.lambda_create_user.output_path)
}

# AWS s3 object for getUsers
resource "aws_s3_object" "lambda_get_users" {
    bucket = aws_s3_bucket.lambda_bucket.id
    key    = "getUsers.zip"
    source = data.archive_file.lambda_get_users.output_path
    etag   = filemd5(data.archive_file.lambda_get_users.output_path)
}

## IAM lambda functions
resource "aws_lambda_function" "createUser" {
  function_name    = "createUser"
  handler          = "lambda/index.handler"
  s3_bucket        = aws_s3_bucket.lambda_bucket.id
  s3_key           = aws_s3_object.lambda_create_user.key
  runtime          = "nodejs16.x"
  source_code_hash = data.archive_file.lambda_create_user.output_base64sha256
  role             = aws_iam_role.lambda_role.arn
}

resource "aws_lambda_function" "getUsers" {
  function_name    = "getUsers"
  handler          = "lambda/index.handler"
  s3_bucket        = aws_s3_bucket.lambda_bucket.id
  s3_key           = aws_s3_object.lambda_get_users.key
  runtime          = "nodejs16.x"
  source_code_hash = data.archive_file.lambda_get_users.output_base64sha256
  role             = aws_iam_role.lambda_role.arn
}

# Lambda url
# resource "aws_lambda_function_url" "create_user_lambda_live" {
#   function_name      = aws_lambda_function.createUser.function_name
#   authorization_type = "AWS_IAM"

#   cors {
#     allow_credentials = true
#     allow_origins     = ["*"]
#     allow_methods     = ["*"]
#     allow_headers     = ["date", "keep-alive"]
#     expose_headers    = ["keep-alive", "date"]
#     max_age           = 86400
#   }
# }

# resource "aws_lambda_function_url" "get_users_lambda_live" {
#   function_name      = aws_lambda_function.getUsers.function_name
#   authorization_type = "AWS_IAM"

#   cors {
#     allow_credentials = true
#     allow_origins     = ["*"]
#     allow_methods     = ["*"]
#     allow_headers     = ["date", "keep-alive"]
#     expose_headers    = ["keep-alive", "date"]
#     max_age           = 86400
#   }
# }

# Output urls
output "create_user_api_url" {
  value = aws_apigatewayv2_stage.dev_create_user.invoke_url
}

output "get_users_api_url" {
  value = aws_apigatewayv2_stage.dev_get_users.invoke_url
}

# Log
resource "aws_cloudwatch_log_group" "lambdas" {
  name              = "/aws/lambda/lambdas"
  retention_in_days =  14
}