---
nexus: nexus-ai-chat-importer
plugin_version: "1.2.0"
provider: chatgpt
aliases: "Stripe API Spec Created"
conversation_id: b8ccb561-5d64-4c47-88a0-124baabac772
create_time: 06/21/2024 at 9:41 PM
update_time: 06/21/2024 at 9:41 PM
---

# Title: Stripe API Spec Created

Created: 06/21/2024 at 9:41 PM
Last Updated: 06/21/2024 at 9:41 PM
Chat URL: https://chat.openai.com/c/b8ccb561-5d64-4c47-88a0-124baabac772


>[!nexus_user] **User** - 06/21/2024 at 9:41 PM
> Create a spec for this API: curl -G https://api.stripe.com/v1/customers -u "sk_test_4eC39HqLyjWDarjtT1zdp7dc:" -d limit=3
<!-- UID: aaa2892b-7622-401e-8e8d-5a20aa31d707 -->




>[!nexus_agent] **Assistant** - 06/21/2024 at 9:41 PM
> Here's the OpenAPI 3.1.0 specification for the given cURL command to interact with the Stripe API to list customers with a specified limit.
> 
> ```yaml
> openapi: 3.1.0
> info:
>  title: Stripe API
>  description: API for interacting with Stripe to manage customers.
>  version: 1.0.0
> servers:
>  - url: https://api.stripe.com/v1
>  description: Main (production) server
> paths:
>  /customers:
>  get:
>  operationId: listCustomers
>  summary: Returns a list of customers.
>  description: Retrieves a list of customers with a specified limit.
>  parameters:
>  - name: limit
>  in: query
>  required: false
>  description: A limit on the number of objects to be returned.
>  schema:
>  type: integer
>  example: 3
>  responses:
>  '200':
>  description: A JSON array of customer objects.
>  content:
>  application/json:
>  schema:
>  type: array
>  items:
>  type: object
>  properties:
>  id:
>  type: string
>  object:
>  type: string
>  email:
>  type: string
>  description:
>  type: string
>  security:
>  - api_key: []
> components:
>  securitySchemes:
>  api_key:
>  type: http
>  scheme: basic
>  description: Use your Stripe secret key as the username. Leave the password blank.
> ```
> 
> This specification includes:
> 
> - Basic information about the API in the `info` section.
> - A `servers` section indicating the base URL for the API.
> - A `paths` section with a single endpoint (`/customers`) and a `get` operation.
> - Parameters for the `limit` query parameter.
> - A basic response schema indicating a list of customer objects.
> - Security schemes using HTTP Basic Authentication, as specified by the `-u` option in the cURL command.
<!-- UID: f5331de8-a516-4830-892c-f05ea1f21de4 -->

---


