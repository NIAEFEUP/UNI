This game is a web distributed version of popular game UNO.
The middle view web page displays the game table (the card last played and players connected with the respective hand size) and the mobile_client allows for a player to see his own hand.

For deployment, URL names and ports on javascript files from mobile_client and middle_view must be changed for the right address and ports where the nodeJS server is located.

The attached shell script automatically creates 2 UNO tables on address/path:3000 and address/path/:3001 wich our virtual hosts files then rewrote to http://address/path/1 for the 3000 port and /2 for the 3001.
