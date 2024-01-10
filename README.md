 <a name="readme-top"></a>
  ----
 

<div align="center">
  <a href="[ https://github.com/nothing126/openaihub/graphs/contributors]">
    <img src="https://img.shields.io/github/contributors/nothing126/openaihub.svg?style=for-the-badge" alt="Contributors">
  </a>
  <a href="https://github.com/nothing126/openaihub/stargazers">
    <img src="https://img.shields.io/github/stars/nothing126/openaihub.svg?style=for-the-badge" alt="Stargazers">
  </a>
  <a href="https://github.com/nothing126/openaihub/issues">
    <img src="https://img.shields.io/github/issues/nothing126/openaihub.svg?style=for-the-badge" alt="Issues">
  </a>
  <a href="https://github.com/nothing126/openaihub/network/members">
    <img src="https://img.shields.io/github/forks/nothing126/openaihub.svg?style=for-the-badge" alt="Forks">
  </a>
</div>

 <!-- PROJECT LOGO -->
<br />
<div align="center">
  <a href="https://github.com/nothing126/openaihub/blob/master/img/dalle.jpg">
    <img src="https://github.com/nothing126/openaihub/blob/master/img/dalle.jpg" alt="Logo" width="300" height="300">
  </a>

  <h3 align="center">Dalle</h3>
  telegram bot based on JS using telegraf. The main goal of the project is to simplify work with chatGPT and dal-e-3 
  <p align="center">
    <br />
    <a href="https://t.me/Nonthing1571">Report Bug</a>
   
  </p>
</div>

 ----

## Content
- [TECHONOLOGIES](#technologies)
- [BEGIN](#Begin)
- [TO DO](#to-do)
- [CONTRIBUTIONS](#contributions)
- [PROJECT TEAM](#project-team )

 ----

- ## technologies
  
 <div align="flex-start">
* <a href="https://github.com/nodejs">
    <img src="https://github.com/nothing126/openaihub/blob/master/img/js.jpg" alt="axios bage" width="130" height="45">
  </a>
  
  <div align="flex-start">
* <a href="https://github.com/openai/openai-node">
    <img src="https://github.com/nothing126/openaihub/blob/master/img/openai.png" alt="axios bage" width="130" height="45">
  </a>
  
  <div align="flex-start">
* <a href="https://github.com/telegraf/telegraf">
    <img src="https://github.com/nothing126/openaihub/blob/master/img/telegraf1.png" alt="axios bage" width="60" height="60">
  </a>
  
  <div align="flex-start">
* <a href="https://github.com/axios/axios">
    <img src="https://github.com/nothing126/openaihub/blob/master/img/axios.png" alt="axios bage" width="130" height="45">
  </a>
  
  <div align="flex-start">
* <a href="https://github.com/fluent-ffmpeg/node-fluent-ffmpeg">
    <img src="https://github.com/nothing126/openaihub/blob/master/img/ffmpeg.jpg" alt="axios bage" width="130" height="45">
  </a>
   
   ----
   
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
 ----
## To do
- [x] add readme
- [ ] improve image generation
- [ ] switch to gpt-4

 ----
## Contributions      
Contributions are what make the open source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

If you have a suggestion that would make this better, please fork the repo and create a pull request. You can also simply open an issue with the tag "enhancement".
Don't forget to give the project a star! Thanks again!

1. Fork the Project
2. Clone Your Fork:
 ```sh
   $ git clone <your-repository-url>
 ```
 ```sh
   $ cd <your-project-name>
 ```
3. create future branch:
  ```sh
   $ git checkout -b feature/YourFeatureName
  ```
4. Commit changes:
 ```sh
    $ git commit -m 'Add some AmazingFeature'
  ```
5. Push Changes to Your Fork:
 ```sh
   $ git push origin feature/YourFeatureName
  ```
6.   Make pull request

   
for suggestions or questions please contact forgptjs12@gmail.com

 ----
## Project team
Its my own project developed only by me

[contributors-shield]:https://img.shields.io/github/contributors/nothing126/openaihub.svg?style=for-the-badge
[contributors-url]: https://github.com/nothing126/openaihub/graphs/contributors
[forks-shield]: https://img.shields.io/github/forks/nothing126/openaihub.svg?style=for-the-badge
[forks-url]:https://github.com/nothing126/openaihub/network/members
[stars-shield]: https://img.shields.io/github/stars/nothing126/openaihub.svg?style=for-the-badge
[stars-url]:https://github.com/nothing126/openaihub/stargazers
[issues-shield]:https://img.shields.io/github/issues/nothing126/openaihub.svg?style=for-the-badge
[issues-url]:https://github.com/nothing126/openaihub/issues
