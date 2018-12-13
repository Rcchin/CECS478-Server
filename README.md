# CECS 478 Secure Chat
Welcome! This is the server side code for our End to End Encryption Chat application. Everything related to the server can be found here. This will cover all design and documentation.

## Contributors
* Raymond Chin
* Michael Ly

## Getting Started

This document will help you understand what we have built here and the limitations of our implementation. 

## Prerequisites

Must have the client side code found at (https://github.com/Rcchin/CECS478-Client)

## End to End Chat

Built this project from multiple steps. Ultimate goal is to create a end to end encrption chat. Therefore even the server is an adversary. 

### Server Side
The server is made up of two models, the user and the message. The user model allows us to create a user and verify that users "identity" with a token made by jwt. The message model contains payloads such as "RSACipher, ciphertext, tag, IV, sender and receiver. Since the server is an adversary, we made sure to not store any sensitive information on the server. The passwords to the users are salted and hashed by bcryptjs. The sent messages are encrypted by the client before it is sent to the server (using our .postMessage function). The messages are stored in the mongo database until a getMessage request. Using jwt tokenization we are able to identify the user's name by decoding the token. With this we are able to create .getMessage function where we only get the messages when the receiver is the same as the user creating the getMessage request. We designed the messages to get deleted on the database once the user does the getMessage function to keep the messages off the database.

## Built With
* Javascript
* RESTful API created on AWS Ubuntu

## Presentation
* [Presentation](https://github.com/Rcchin/CECS478-Server/blob/master/CECS_478_Presentation.pdf)