## Simple API for chat
This API helps you stay connected.

You can:
* [create user](#Add-User)
* [create chat with users](#Add-Chat)
* [post a message to a chat](#Post-Message-In-A-Chat)
* [get user's chat list](#Get-Chats-Of-Selected-User)
* [get chat history](#Get-Chat-Messages)

You can try it [here](http://chat.rasseki.pro/)

## Running on your machine 
The default port is 9000.

```bash
git clone https://github.com/eadium/chat-api.git
cd chat-api
docker-compose up --build -d
```
`--build` forces docker to rebuild the code to avoid running outdated versions

`-d` for `detached` mode

## Testing
This package includes basic bash tests.

You can run with: `npm test` or simply `./tests.sh`

# API guide
All requests require no auth.

## Add User 
Used to create a new user.

**URL** : `/users/add`

**Method** : `POST`

**Data constraints**

```json
{
    "username": "<username>",
}
```

**Data example**

```json
{
    "username": "Mickey"
}
```

## Success Response

**Code** : `200 OK`

**Content example**

```json
{
    "id": "2"
}
```

## Error Response
### 400 BAD REQUEST

**Condition** : Request body has an inappropriate format.

**Code** : `400 BAD REQUEST`

**Content** :

```json
{
    "message": "Invalid request"
}
```

### 409 CONFLICT

**Condition** : Value with this key already exists.

**Code** : `409 CONFLICT`

**Content** :

```json
{
    "message": "Username is occupied"
}
```

## Add Chat 
Used to create a new chat with selected users.

**URL** : `/users/add`

**Method** : `POST`

**Data constraints**

```json
{
    "name": "<chat_name>",
    "users": ["<array of user ID's>"]
}
```

**Data example**

```json
{
    "name": "chat10",
    "users": ["1", "2", "3"]
}
```

## Success Response

**Code** : `200 OK`

**Content example**

```json
{
    "id": "8"
}
```

## Error Response
### 400 BAD REQUEST

**Condition** : Request body has an inappropriate format.

**Code** : `400 BAD REQUEST`

**Content** :

```json
{
    "message": "Invalid request"
}
```

### 404 NOT FOUND

**Condition** : User with request ID does not exist.

**Code** : `404 NOT FOUND`

**Content** :

```json
{
    "message": "User not found"
}
```

### 409 CONFLICT

**Condition** : Chat with given name already exists.

**Code** : `409 CONFLICT`

**Content** :

```json
{
    "message": "Chat with this name already exists"
}
```

## Post Message In A Chat

Used to post a message in selected chat.

**URL** : `/messages/add`

**Method** : `POST`

## Success Response

**Code** : `200 OK`

**Content example**

```json
{
    "chat": "2",
    "author": "3",
    "text": "wow!"
}
```

## Error Response
### 400 BAD REQUEST

**Condition** : Request body has an inappropriate format.

**Code** : `400 BAD REQUEST`

**Content** :

```json
{
    "message": "Invalid request"
}
```

### 403 FORBIDDEN

**Condition** : User is attempting to post message to an someone else's chat.

**Code** : `403 FORBIDDEN`

**Content** :

```json
{
    "message": "User has no access to this chat"
}
```

### 404 NOT FOUND

**Condition** : Invalid user or chat id.

**Code** : `404 NOT FOUND`

**Content** :

```json
{
    "message": "Invalid user or chat id"
}
```

## Get Chats Of Selected User

Get user's chat list. Chats with newer messages are the first. Empty chats are sorted by their creation date.

**URL** : `/chats/get`

**Method** : `POST`

**Data constraints**

```json
{
    "user": "<user_id>"
}
```

**Data example**

```json
{
    "user": "2"
}
```

## Success Response

**Code** : `200 OK`

**Content example**

```json
[
    {
        "id": 1,
        "name": "chat1",
        "created": "Sat Aug 17 2019 22:31:12 GMT+0300 (Moscow Standard Time)"
    },
    {
        "id": 5,
        "name": "chat3",
        "created": "Sat Aug 17 2019 22:37:35 GMT+0300 (Moscow Standard Time)"
    },
    {
        "id": 3,
        "name": "chat2",
        "created": "Sat Aug 17 2019 22:37:28 GMT+0300 (Moscow Standard Time)"
    }
]
```

or if user has no chats yet:

```json
{
    "message": "User has no chats yet" 
}
```

## Error Response
### 400 BAD REQUEST

**Condition** : If requst body does not contain field `name` or it is empty.

**Code** : `400 BAD REQUEST`

**Content** :

```json
{
    "message": "Invalid request"
}
```
### 404 NOT FOUND

**Condition** : If selected user does not exist.

**Code** : `404 NOT FOUND`

**Content** :

```json
{
    "message": "Invalid user ID"
}
```

## Get Chat Messages

Get all messages from the selected chat. The earliest messages in the chat come fisrt. 

**URL** : `/messages/get`

**Method** : `POST`

**Data constraints**

```json
{
    "chat": "<chat_id>"
}
```

**Data example**

```json
{
    "chat": "12"
}
```

## Success Response

**Code** : `200 OK`

**Content example**

```json
[
    {
        "id": 1,
        "chat_id": 1,
        "author_id": 2,
        "text": "hi",
        "created": "Sat Aug 17 2019 22:41:06 GMT+0300 (Moscow Standard Time)"
    },
    {
        "id": 2,
        "chat_id": 1,
        "author_id": 2,
        "text": "good morning",
        "created": "Sat Aug 17 2019 22:41:13 GMT+0300 (Moscow Standard Time)"
    },
    {
        "id": 3,
        "chat_id": 1,
        "author_id": 1,
        "text": "what a nice day today!",
        "created": "Sat Aug 17 2019 22:41:28 GMT+0300 (Moscow Standard Time)"
    }
]
```

or if chat has no messages yet:

```json
{
    "message": "Chat is empty"
}
```

## Error Response
### 400 BAD REQUEST

**Condition** : If the requst body does not contain field `chat` or it is empty.

**Code** : `400 BAD REQUEST`

**Content** :

```json
{
    "message": "Invalid request"
}
```
### 404 NOT FOUND

**Condition** : If selected chat does not exist.

**Code** : `404 NOT FOUND`

**Content** :

```json
{
    "message": "Invalid chat ID"
}
```
