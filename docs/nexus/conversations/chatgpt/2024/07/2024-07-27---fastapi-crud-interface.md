---
nexus: nexus-ai-chat-importer
plugin_version: "1.2.0"
provider: chatgpt
aliases: "FastAPI CRUD Interface"
conversation_id: 1c2bcca1-6bce-43bf-b2e5-4ff938065725
create_time: 07/27/2024 at 5:12 PM
update_time: 07/27/2024 at 5:19 PM
---

# Title: FastAPI CRUD Interface

Created: 07/27/2024 at 5:12 PM
Last Updated: 07/27/2024 at 5:19 PM
Chat URL: https://chat.openai.com/c/1c2bcca1-6bce-43bf-b2e5-4ff938065725


>[!nexus_user] **User** - 07/27/2024 at 5:12 PM
> Write a crud interface with fastapi
<!-- UID: aaa24b2d-77dd-49a2-98c8-20425666c749 -->




>[!nexus_agent] **Assistant** - 07/27/2024 at 5:12 PM
> Sure! Below is a simple CRUD (Create, Read, Update, Delete) interface using FastAPI, which allows you to manage a collection of items. We'll create a basic in-memory database using a Python list for simplicity.
> 
> First, ensure you have FastAPI and Uvicorn installed. You can install them using:
> 
> ```sh
> pip install fastapi uvicorn
> ```
> 
> Here's a complete example:
> 
> ```python
> from fastapi import FastAPI, HTTPException
> from pydantic import BaseModel
> from typing import List, Optional
> 
> app = FastAPI()
> 
> # In-memory database (a list of items)
> items_db = []
> 
> # Pydantic model for the items
> class Item(BaseModel):
>  id: int
>  name: str
>  description: Optional[str] = None
>  price: float
>  tax: Optional[float] = None
> 
> @app.post("/items/", response_model=Item)
> def create_item(item: Item):
>  for db_item in items_db:
>  if db_item['id'] == item.id:
>  raise HTTPException(status_code=400, detail="Item with this ID already exists")
>  items_db.append(item.dict())
>  return item
> 
> @app.get("/items/", response_model=List[Item])
> def read_items(skip: int = 0, limit: int = 10):
>  return items_db[skip : skip + limit]
> 
> @app.get("/items/{item_id}", response_model=Item)
> def read_item(item_id: int):
>  for item in items_db:
>  if item["id"] == item_id:
>  return item
>  raise HTTPException(status_code=404, detail="Item not found")
> 
> @app.put("/items/{item_id}", response_model=Item)
> def update_item(item_id: int, item: Item):
>  for index, db_item in enumerate(items_db):
>  if db_item["id"] == item_id:
>  items_db[index] = item.dict()
>  return item
>  raise HTTPException(status_code=404, detail="Item not found")
> 
> @app.delete("/items/{item_id}", response_model=Item)
> def delete_item(item_id: int):
>  for index, item in enumerate(items_db):
>  if item["id"] == item_id:
>  deleted_item = items_db.pop(index)
>  return deleted_item
>  raise HTTPException(status_code=404, detail="Item not found")
> 
> if __name__ == "__main__":
>  import uvicorn
>  uvicorn.run(app, host="0.0.0.0", port=8000)
> ```
> 
> ### Explanation:
> 
> 1. **Item Model**: Defined using Pydantic's `BaseModel` to specify the data structure.
> 2. **Create Item**: Adds a new item to the in-memory database.
> 3. **Read Items**: Retrieves a list of items with optional pagination (using `skip` and `limit` query parameters).
> 4. **Read Single Item**: Retrieves an item by its `id`.
> 5. **Update Item**: Updates an existing item by its `id`.
> 6. **Delete Item**: Deletes an item by its `id`.
> 
> ### Running the Application:
> 
> To run the FastAPI application, save the code in a file (e.g., `main.py`) and run it using Uvicorn:
> 
> ```sh
> uvicorn main:app --reload
> ```
> 
> You can then access the API documentation and test the endpoints by navigating to `http://127.0.0.1:8000/docs` in your web browser.
> 
> This is a basic example to get you started. For a production-grade application, consider using a proper database, adding authentication, and handling more complex error cases.
<!-- UID: 41e64cbb-93b8-4d73-b27c-cb5c9fccac74 -->

---




>[!nexus_user] **User** - 07/27/2024 at 5:13 PM
> duckman-http-1 | Traceback (most recent call last):
> duckman-http-1 | File "/app/fastapi.py", line 1, in <module>
> duckman-http-1 | from fastapi import FastAPI, HTTPException
> duckman-http-1 | File "/app/fastapi.py", line 1, in <module>
> duckman-http-1 | from fastapi import FastAPI, HTTPException
> duckman-http-1 | ImportError: cannot import name 'FastAPI' from partially initialized module 'fastapi' (most likely due to a circular import) (/app/fastapi.py)
<!-- UID: aaa28392-8399-4d8a-883b-2001acfbf0d1 -->




>[!nexus_agent] **Assistant** - 07/27/2024 at 5:13 PM
> The error occurs because your script file is named `fastapi.py`, which causes a conflict with the actual FastAPI module. When Python tries to import FastAPI, it mistakenly tries to import from your script file instead of the FastAPI library.
> 
> To fix this issue, rename your script file to something other than `fastapi.py`, for example, `main.py`.
> 
> Here’s how you can proceed:
> 
> 1. Rename your script file to `main.py`.
> 2. Ensure the content of `main.py` is as follows:
> 
> ```python
> from fastapi import FastAPI, HTTPException
> from pydantic import BaseModel
> from typing import List, Optional
> 
> app = FastAPI()
> 
> # In-memory database (a list of items)
> items_db = []
> 
> # Pydantic model for the items
> class Item(BaseModel):
>  id: int
>  name: str
>  description: Optional[str] = None
>  price: float
>  tax: Optional[float] = None
> 
> @app.post("/items/", response_model=Item)
> def create_item(item: Item):
>  for db_item in items_db:
>  if db_item['id'] == item.id:
>  raise HTTPException(status_code=400, detail="Item with this ID already exists")
>  items_db.append(item.dict())
>  return item
> 
> @app.get("/items/", response_model=List[Item])
> def read_items(skip: int = 0, limit: int = 10):
>  return items_db[skip : skip + limit]
> 
> @app.get("/items/{item_id}", response_model=Item)
> def read_item(item_id: int):
>  for item in items_db:
>  if item["id"] == item_id:
>  return item
>  raise HTTPException(status_code=404, detail="Item not found")
> 
> @app.put("/items/{item_id}", response_model=Item)
> def update_item(item_id: int, item: Item):
>  for index, db_item in enumerate(items_db):
>  if db_item["id"] == item_id:
>  items_db[index] = item.dict()
>  return item
>  raise HTTPException(status_code=404, detail="Item not found")
> 
> @app.delete("/items/{item_id}", response_model=Item)
> def delete_item(item_id: int):
>  for index, item in enumerate(items_db):
>  if item["id"] == item_id:
>  deleted_item = items_db.pop(index)
>  return deleted_item
>  raise HTTPException(status_code=404, detail="Item not found")
> 
> if __name__ == "__main__":
>  import uvicorn
>  uvicorn.run(app, host="0.0.0.0", port=8000)
> ```
> 
> 3. Run the application with Uvicorn:
> 
> ```sh
> uvicorn main:app --reload
> ```
> 
> This should resolve the import error and allow your FastAPI application to run correctly.
<!-- UID: 6d1284cc-a36e-45ce-8fb1-883dcbbbe1d4 -->

---




>[!nexus_user] **User** - 07/27/2024 at 5:19 PM
> AttributeError: module 'motor.motor_asyncio' has no attribute 'AsyncIOClient'
<!-- UID: aaa271c1-d603-42d4-a3aa-6a7a5d8aa645 -->




>[!nexus_agent] **Assistant** - 07/27/2024 at 5:19 PM
> The error `AttributeError: module 'motor.motor_asyncio' has no attribute 'AsyncIOClient'` indicates that you are trying to use `AsyncIOClient` from the `motor.motor_asyncio` module, but `motor_asyncio` does not have an `AsyncIOClient` attribute. Instead, you should use `AsyncIOMotorClient`.
> 
> Here’s how you can set up a FastAPI application with Motor (an async driver for MongoDB):
> 
> 1. **Install the necessary libraries**:
>  ```sh
>  pip install fastapi uvicorn motor pydantic
>  ```
> 
> 2. **Create your FastAPI application using Motor**:
> 
> ```python
> from fastapi import FastAPI, HTTPException
> from pydantic import BaseModel
> from typing import List, Optional
> import motor.motor_asyncio
> 
> app = FastAPI()
> 
> # MongoDB connection
> client = motor.motor_asyncio.AsyncIOMotorClient("mongodb://localhost:27017")
> db = client.test_database # replace with your database name
> collection = db.test_collection # replace with your collection name
> 
> # Pydantic model for the items
> class Item(BaseModel):
>  id: int
>  name: str
>  description: Optional[str] = None
>  price: float
>  tax: Optional[float] = None
> 
> @app.post("/items/", response_model=Item)
> async def create_item(item: Item):
>  if await collection.find_one({"id": item.id}):
>  raise HTTPException(status_code=400, detail="Item with this ID already exists")
>  await collection.insert_one(item.dict())
>  return item
> 
> @app.get("/items/", response_model=List[Item])
> async def read_items(skip: int = 0, limit: int = 10):
>  cursor = collection.find().skip(skip).limit(limit)
>  items = await cursor.to_list(length=limit)
>  return items
> 
> @app.get("/items/{item_id}", response_model=Item)
> async def read_item(item_id: int):
>  item = await collection.find_one({"id": item_id})
>  if item:
>  return item
>  raise HTTPException(status_code=404, detail="Item not found")
> 
> @app.put("/items/{item_id}", response_model=Item)
> async def update_item(item_id: int, item: Item):
>  result = await collection.update_one({"id": item_id}, {"$set": item.dict()})
>  if result.modified_count == 1:
>  updated_item = await collection.find_one({"id": item_id})
>  return updated_item
>  raise HTTPException(status_code=404, detail="Item not found")
> 
> @app.delete("/items/{item_id}", response_model=Item)
> async def delete_item(item_id: int):
>  result = await collection.delete_one({"id": item_id})
>  if result.deleted_count == 1:
>  return {"id": item_id}
>  raise HTTPException(status_code=404, detail="Item not found")
> 
> if __name__ == "__main__":
>  import uvicorn
>  uvicorn.run(app, host="0.0.0.0", port=8000)
> ```
> 
> ### Explanation:
> 
> 1. **MongoDB Connection**: 
>  ```python
>  client = motor.motor_asyncio.AsyncIOMotorClient("mongodb://localhost:27017")
>  db = client.test_database # replace with your database name
>  collection = db.test_collection # replace with your collection name
>  ```
>  This connects to a MongoDB instance running on `localhost:27017`.
> 
> 2. **CRUD Operations**:
>  - **Create Item**: Adds a new item to the MongoDB collection.
>  - **Read Items**: Retrieves a list of items with optional pagination.
>  - **Read Single Item**: Retrieves an item by its `id`.
>  - **Update Item**: Updates an existing item by its `id`.
>  - **Delete Item**: Deletes an item by its `id`.
> 
> ### Running the Application:
> 
> Save the code in a file (e.g., `main.py`) and run it using Uvicorn:
> 
> ```sh
> uvicorn main:app --reload
> ```
> 
> You can then access the API documentation and test the endpoints by navigating to `http://127.0.0.1:8000/docs` in your web browser.
<!-- UID: 2ba1767b-f026-4c83-a9b2-17dc88f252fa -->

---


