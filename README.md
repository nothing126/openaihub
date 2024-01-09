 # OpenAihub
 telegram bot based on JS using telegraf. The main goal of the project is to simplify work with chatGPT and dal-e-3 
 <!-- PROJECT LOGO -->
<br />
<div align="center">
  <a href="https://github.com/nothing126/openaihub/blob/master/img/dalle.jpg">
    <img src="https://github.com/nothing126/openaihub/blob/master/img/dalle.jpg" alt="Logo" width="80" height="80">
  </a>

  <h3 align="center">Dalle</h3>

  <p align="center">
    <
    <br />
    <br />
    <a href="https://t.me/Nonthing1571">View Demo</a>
    ·
    <a href="https://t.me/Nonthing1571">Report Bug</a>
    ·
    <a href="https://t.me/Nonthing1571">Request Feature</a>
  </p>
</div>

## Content
- [technologies](#technologies)
- [Begin](#begin)
- [To do](#to-do)
- [Contributions](#contributions)
- [project team](#project-team )

- ## technologies
- [JS](https://www.javascript.com/)
- [OpenAiApi](https://openai.com/blog/openai-api)
- [telegram Api](https://core.telegram.org/bots)
- [axios](https://github.com/axios/axios)
- [fluent-ffmpeg](https://github.com/fluent-ffmpeg/node-fluent-ffmpeg)

 ## Begin
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
$ npm install i  telegraf
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
For logs of using and error logs you need to create text files ```logs``` and ```errorlogs``` also you can change file names in ```errwriter.js``` and ```logwriter.js```.
For downloading images you need to create folder in root of project and change path in ```image.json```.
For downloading voices you need to create folder in the root of project and change path in ```oga.js```.
Also you need ```config.js```  in which the api keys will be stored. For example:
```javascript
    export const openaiKey ='YOUR OPENAI KEY'
    export const tgKey =  'YOUR TELEGRAM KEY'
```
## To do
- [x] add readme
- [ ] improve image generation
- [ ] switch to gpt-4

## Contributions      
for cooperation, suggestions or questions please contact forgptjs12@gmail.com

## Project team
Its my own project developed only by me

