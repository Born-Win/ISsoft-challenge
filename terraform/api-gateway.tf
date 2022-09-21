# APIs for lambdas
resource "aws_apigatewayv2_api" "create_user" {
  name          = "create_user"
  protocol_type = "HTTP"
}

resource "aws_apigatewayv2_api" "get_users" {
  name          = "get_users"
  protocol_type = "HTTP"
}

# Stages for APIs
resource "aws_apigatewayv2_stage" "dev_create_user" {
  api_id      = aws_apigatewayv2_api.create_user.id
  name        = "dev_create_user"
  auto_deploy = true

  access_log_settings {
    destination_arn = aws_cloudwatch_log_group.lambdas.arn

    format = jsonencode({
      requestId               = "$context.requestId"
      sourceIp                = "$context.identity.sourceIp"
      requestTime             = "$context.requestTime"
      protocol                = "$context.protocol"
      httpMethod              = "$context.httpMethod"
      resourcePath            = "$context.resourcePath"
      routeKey                = "$context.routeKey"
      status                  = "$context.status"
      responseLength          = "$context.responseLength"
      integrationErrorMessage = "$context.integrationErrorMessage"
      }
    )
  }
}

resource "aws_apigatewayv2_stage" "dev_get_users" {
  api_id      = aws_apigatewayv2_api.get_users.id
  name        = "dev_get_users"
  auto_deploy = true

  access_log_settings {
    destination_arn = aws_cloudwatch_log_group.lambdas.arn

    format = jsonencode({
      requestId               = "$context.requestId"
      sourceIp                = "$context.identity.sourceIp"
      requestTime             = "$context.requestTime"
      protocol                = "$context.protocol"
      httpMethod              = "$context.httpMethod"
      resourcePath            = "$context.resourcePath"
      routeKey                = "$context.routeKey"
      status                  = "$context.status"
      responseLength          = "$context.responseLength"
      integrationErrorMessage = "$context.integrationErrorMessage"
      }
    )
  }
}

# Intergrations for APIs
resource "aws_apigatewayv2_integration" "create_user" {
  api_id             = aws_apigatewayv2_api.create_user.id
  integration_uri    = aws_lambda_function.createUser.invoke_arn
  integration_type   = "AWS_PROXY"
  integration_method = "POST"
}

resource "aws_apigatewayv2_integration" "get_users" {
  api_id             = aws_apigatewayv2_api.get_users.id
  integration_uri    = aws_lambda_function.getUsers.invoke_arn
  integration_type   = "AWS_PROXY"
  integration_method = "POST"
}

# Routes for APIs
resource "aws_apigatewayv2_route" "create_user" {
  api_id    = aws_apigatewayv2_api.create_user.id
  route_key = "POST /"
  target    = "integrations/${aws_apigatewayv2_integration.create_user.id}"
}

resource "aws_apigatewayv2_route" "get_users" {
  api_id    = aws_apigatewayv2_api.get_users.id
  route_key = "GET /"
  target    = "integrations/${aws_apigatewayv2_integration.get_users.id}"
}