 # OpenAihub
 telegram bot based on JS using telegraf. The main goal of the project is to simplify work with chatGPT and dal-e-3 
 
## content
- [technologies](#technologies)
- [Begin](#begin)

- ## technologies
- [JS](https://www.javascript.com/)
- [OpenAiApi](https://openai.com/blog/openai-api)
- [telegram Api](https://core.telegram.org/bots)
- [axios](https://github.com/axios/axios)
- [fluent-ffmpeg](https://github.com/fluent-ffmpeg/node-fluent-ffmpeg)

 ## begin
 For the bot to work correctly, you need to install the following libraries using npm:
 
 fluent-ffmpeg
 ```sh
 $ npm i fluent-ffmpeg @ffmpeg-installer/ffmpeg
```

OpenAiApi 
```sh
$ npm install openai
```

Telegram Api
```sh
$ npm install i  node-telegram-bot-api
```
```sh
npm install i  telegraf
 ```

Axios
```sh
$ npm i axios
```
also need to modify your ```package .json ``` by adding
```javascript
"type": "module",
```
after parametter "main"
You also need to create the following files in the project root:
```userIds.json```
which should contain records of the id of people who can use the bot. It should also indicate the number of requests that the bot can answer. Message counter need to be equals 0 atthe start of project. For example:
```javascript
{
  "~user id~": {
    "messageLimit": 2,
    "messageCount": 0
  },
  "~user id~": {
    "messageLimit": 3 //limit of requests,
    "messageCount": 0 //count of messages
  }
}
```

