curl -i --header "Content-Type: application/json" \
  --request POST \
  --data '{"clear": true}' \
  http://localhost:9000/service/clear

echo

curl -i --header "Content-Type: application/json" \
  --request POST \
  --data '{"username": "user_1"}' \
  http://localhost:9000/users/add

echo

curl -i --header "Content-Type: application/json" \
  --request POST \
  --data '{"username": "user_2"}' \
  http://localhost:9000/users/add

echo

curl -i --header "Content-Type: application/json" \
  --request POST \
  --data '{"username": "user_3"}' \
  http://localhost:9000/users/add

echo

curl -i --header "Content-Type: application/json" \
  --request POST \
  --data '{"name": "chat_1", "users": ["1", "2"]}' \
  http://localhost:9000/chats/add

echo

curl -i --header "Content-Type: application/json" \
  --request POST \
  --data '{"chat": "1", "author": "1", "text": "hi"}' \
  http://localhost:9000/messages/add
echo


curl -i --header "Content-Type: application/json" \
  --request POST \
  --data '{"user": "1"}' \
  http://localhost:9000/chats/get

echo

curl -i --header "Content-Type: application/json" \
  --request POST \
  --data '{"chat": "1"}' \
  http://localhost:9000/messages/get

echo
