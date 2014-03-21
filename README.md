#webRTC-chat

WebRTC-chat is a Video/Text chat implemented using a new exciting web technology called WebRTC.  WebRTC provides a means of installing a P2P connection between two browsers. That is, the browser becomes a peer in P2P network. This allows us developers to implement that kind of web application that since a fews years ago wouldn't be impossible to imagine. 

The only goal of this project is to study and understand in depth the characteristic and possibility of this new technology. I want to implement a chat service with the following features : 
  - Optional Video Chat with different  video qualities : QVGA, VGA, HD.  ( done )
  - Optional Audio ( working )
  - Optional DataConnection  
		- Text Chat 
		- File sharing 
  -  A mesh network is used to connect peers.  ( done ) 
  -  Session restoring 
  -  Move to HTTPS and WSS
  -  Bandwidth adaptetion
  -  More then 2 users are allowed to connect at same time. In fact, there is no limit for the number  ( done ) 
     of users but a mesh network does not scale well and after 4 or 5 users the application is    
     unusable 

A deployed version of the application can be found at : http://webrtc-chat-experiment.herokuapp.com/

##How to use it

Using this app is really easy, you need just to go to the page and automatically a chat is created. To invite someone else in the room,
you need just to share the url of the page.

##Signalling service 
The signalling service is implemented using node.js and socket. ( full implemented and tested )
      
##Techonology 
THe front end is implemented using Backbone.js. The base app model is built around the single peer connections object.    When a new peer connection is created is added to a BackBone collection which mantains a list of all peer Connection
open in the web page. 

Express and jade are used to dinamically generate web pages. 
    
There is no need for a db as I don't keep any information regarding peer sessions in the back-end. 

##Note 
The project is under havy development. 

## Next things to do 
- Audio channel ( Problems remove echo )
- Move to SSH and WSS 
- Data Channel  ( to implement entirely) 
 
### License

This software is licensed under the MIT License.

Copyright Fedor Indutny, 2012.

Permission is hereby granted, free of charge, to any person obtaining a
copy of this software and associated documentation files (the
"Software"), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to permit
persons to whom the Software is furnished to do so, subject to the
following conditions:

The above copyright notice and this permission notice shall be included
in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
USE OR OTHER DEALINGS IN THE SOFTWARE.

