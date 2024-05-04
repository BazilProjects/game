/*
var ws_scheme = window.location.protocol == "https:" ? "wss" : "ws";
 
var ws_path = ws_scheme + '://' + window.location.host + "/game/" + links
*/

// Get the pathname from the URL
var pathname = window.location.pathname;

// Extract the last segment after the last slash
// Extract the segment after the last slash
var gameId = pathname.split('/').filter(Boolean).pop();

// Now you can use gameId to construct your WebSocket path
var ws_scheme = window.location.protocol == "https:" ? "wss" : "ws";
var ws_path = ws_scheme + '://' + window.location.host + "/game/" + gameId;

// Use ws_path for WebSocket connection
console.log(ws_path);  // Example: "wss://game-k0m7.onrender.com/game/1"


if (typeof Last_played_Card !== 'undefined') {
    // This block of code will execute if Last_played_Card is not null
    Last_played_Card = null; // This sets the outer Last_played_Card to null
}

var symbol=null

var owner_pick_card_turn=null
var opponent_pick_card_turn=null

console.log("Connecting to " + ws_path);
var socket = new ReconnectingWebSocket(ws_path);


function add_picked_card(receive,picked) {
    // Add the card and its status to owner_cards
    receive[picked[0]] = picked[1];

    console.log(receive);
    return receive
}


// Function to handle picking a card
function try_pick_card() {
    console.log(myturn,c_player)
    if (myturn===c_player){
        const data = {
            command: "pick_cards_during_play",
        };
        socket.send(JSON.stringify(data));
    
    }
    
}
// Function to handle picking a card
function Switch_player_turn() {
    if (myturn===c_player){
        if ((myturn===1 && owner_pick_card_turn===false) ||(myturn===-1 && opponent_pick_card_turn===false)) {
            const data = {
                command:"card-played",
                sub_command: "Switch_player_turn"
            };
            socket.send(JSON.stringify(data));
        }

    }

    
}


// Function to handle picking a card
function resign_from_game() {
    if (myturn===c_player){
        const data = {
            command: "resign",
            sub_command:myturn
        };
        socket.send(JSON.stringify(data));
        console.log('Resignation Sent to server')
        alert("Button clicked!");
    }
    
}


// Set up event listener for incoming messages
socket.onmessage = function (message) {
      console.log("Got websocket message " + message.data);
      var data = JSON.parse(message.data)
      // Extract and log p, row, and column
      console.log(data)
      if (("owner_pick_card_turn" && "opponent_pick_card_turn") in data){
        owner_pick_card_turn=data.owner_pick_card_turn
        opponent_pick_card_turn=data.opponent_pick_card_turn
      } 

      if (data.command=="join"){
        console.log("command 2 = ")//,data.command)
        //if(data.opp_online!==true) {
        //  console.log("DIalog box  :",data.opp_online)
        //  showModal()
        //}
      }
      if (data.command=="start-game"){
        // Dictionary with image names for the upper row
        var upperRowImages = data.owner;
        // Dictionary with image names for the lower row
        var lowerRowImages = data.opponent;
        // Function to send image name to the server
        // Function to send image name to the server
        function sendImageName(imageName) {
            const data = {
                command: "start-game",
                image_name: imageName
            };
            socket.send(JSON.stringify(data));
        }

        // Function to create image elements and append them to a given row
        function createImages(rowId, images) {
            var row = document.getElementById(rowId);
            Object.entries(images).forEach(function([imageName, imageLabel]) {
                var img = document.createElement("img");
                img.src = "/static/img/" + imageName + ".png"; // Construct the image source URL
                img.alt = imageLabel;
                img.classList.add("image");
                img.onclick = function() {
                    //sendImageName(imageName);
                };
                row.appendChild(img);
            });
        }
    

        // Dictionary with image names for the upper row
        var upperRowImages = data.owner;
        // Dictionary with image names for the lower row
        var lowerRowImages = data.opponent;

        // Call the function to create images for the upper row
        createImages("upper-row", upperRowImages);

        // Call the function to create images for the lower row
        createImages("lower-row", lowerRowImages);
    }
    if (data.command==="pick_cards_during_play") {
        owner_cards=data.owner_cards
        opponent_cards=data.opponent_cards
        up_date_cards(owner_cards,opponent_cards)
    }
    if (data.command==="pick_cards_during_play_not_allowed") {
        console.log('Pick card not allowed')
    }
    if ("symbol" in data) {
        symbol=data.symbol

        // Array of values to compare against
        var valuesToCheck = ['4', '5', '6', '7', '9', '10', 'K', 'Q'];

        // Check if symbol is equal to any of the values
        if (valuesToCheck.includes(symbol)) {
            // Find the button element by its class name
            var modal = document.getElementById("exampleModal");

        } else {

            // Find the button element by its class name
            var modal = document.getElementById("exampleModal");
        }
        // Check if the modal is currently visible
        if ($(modal).is(":visible")) {
            // Close the modal if it's visible
            $(modal).modal("hide");
        } else {
            // If the modal is not visible, do something else (e.g., 'pass')
            console.log("Modal is already hidden");
            // You can also choose to do nothing or perform some other action here
        }
        update_asked_question(data);

        }
    if (data.command==="Switch_player_turn"){
        c_player=data.c_player
    }
    if (data.command === "card-played") {

        Last_played_Card=data.Last_played_Card;
        // Get the image name for the last played card
        if ('c_player' in data){
            c_player=data.c_player
        }
        

        var imageName = Last_played_Card[0];
        //print(data)
        //var imageName = data["Last_played_Card"][0];

        if (Last_played_Card[0]==='RED_Joker'){
            console.log("PICK 5 red")
        }
        else if (Last_played_Card[0]==='Black_Joker') {
            console.log("PICK 5 black")
        }
        else if (Last_played_Card[1]==='Pick_2') {
            counter_possible=data.try_to_counter
            Last_played_Card=data.Last_played_Card
            if (counter_possible==true){
                console.log(myturn,c_player)
                if (myturn!=c_player){
                    cards_for_that=data.possible_counter
                    // Call the function to attach images to the modal
                    attachImagesToModal(cards_for_that);
                    
                    // Find the button element by its class name
                    var modal = document.getElementById("cardstopick");

                    // Show the modal
                    $(modal).modal("show");
                    Update_images(data,imageName)
                }else {
                    update_last_played_card(data)
                }
            } else {
                owner_cards=data.owner_cards
                opponent_cards=data.opponent_cards
                up_date_cards(owner_cards,opponent_cards)
                update_last_played_card(data)
            }
        }
        else if (Last_played_Card[1]==='Pick_3') {
            console.log("PICK 3")
            console.log("-"*50)
            console.log(data)
            counter_possible=data.try_to_counter
            Last_played_Card=data.Last_played_Card
            if (counter_possible==true){
                console.log(myturn,c_player)
                if (myturn!=c_player){
                    cards_for_that=data.possible_counter
                    // Call the function to attach images to the modal
                    attachImagesToModal(cards_for_that);
                    
                    // Find the button element by its class name
                    var modal = document.getElementById("cardstopick");

                    // Show the modal
                    $(modal).modal("show");
                    Update_images(data,imageName)
                }else {
                    update_last_played_card(data)
                }
            } else {
                // Find the button element by its class name
                var modal = document.getElementById("cardstopick");

                
                // Check if the modal is currently visible
                if ($(modal).is(":visible")) {
                    // Close the modal if it's visible
                    $(modal).modal("hide");
                } else {
                    // If the modal is not visible, do something else (e.g., 'pass')
                    console.log("Modal is already hidden");
                    // You can also choose to do nothing or perform some other action here
                }

                owner_cards=data.owner_cards
                opponent_cards=data.opponent_cards
                console.log('owner_cards:',owner_cards)
                console.log('opponent_cards',opponent_cards)

                up_date_cards(owner_cards,opponent_cards)
                update_last_played_card(data)
            }
        }
        else if (Last_played_Card[1]==='Question' && !("symbol" in data)) {
            console.log(myturn,c_player);
            if (myturn==c_player){
                if (Last_played_Card[0]==='AS') {
                    // Find the button element by its class name
                    var modal = document.getElementById("exampleModal_AS");

                    // Show the modal
                    $(modal).modal("show");
                    Update_images(data,imageName);
                } else {
                    // Find the button element by its class name
                    var modal = document.getElementById("exampleModal");

                    // Show the modal
                    $(modal).modal("show");
                    Update_images(data,imageName);
                }
                
            }
        }
        

        else {

            // Function to create and append a single image element to a given row
            function createImage(rowId, imageName) {
                var row = document.getElementById(rowId);
                row.innerHTML = ''; // Clear existing contents of the row

                var img = document.createElement("img");
                img.src = "/static/img/" + imageName + ".png"; // Construct the image source URL
                img.alt = imageName;
                img.classList.add("image");
                img.onclick = function () {
                    //sendImageName(imageName);
                };
                row.appendChild(img);

                console.log('Image added to the row:', rowId);
            }

            // Call the function to create and append the image for the last played card
            createImage("Card-played", imageName);
            // Define the key and value to search for
            var keyToMatch = data.Last_played_Card[0];
            var valueToMatch = data.Last_played_Card[1];

            // Iterate over owner_cards object
            for (var key in owner_cards) {
                // Check if the current key and value match the specified criteria
                if (key === keyToMatch && owner_cards[key] === valueToMatch) {
                    console.log("Matching key-value pair found in owner_cards:");
                    console.log("Key:", key);
                    console.log("Value:", owner_cards[key]);
                    // Delete the matching key-value pair from owner_cards
                    delete owner_cards[key];
                    // Dictionary with image names for the upper row
                    var upperRowImages =owner_cards
                    // Function to send image name to the server
                    function sendImageName(imageName) {
                        const data = {
                            command: "start-game",
                            image_name: imageName
                        };
                        socket.send(JSON.stringify(data));
                    }

                    // Function to create image elements and append them to a given row
                    function createImages(rowId, images,side) {
                        var row = document.getElementById(rowId);

                        row.innerHTML = ''; // Clear existing contents of the row

                        Object.entries(images).forEach(function([imageName, imageLabel]) {
                            var img = document.createElement("img");
                            img.src = "/static/img/" + imageName + ".png"; // Construct the image source URL
                            img.alt = imageLabel;
                            img.classList.add("image");
                            img.onclick = function() {
                              // Assuming you have Last_played_Card and Next_played_Card defined somewhere
                                
                                var Next_played_Card =[imageName, imageLabel] //['Black_Joker', 'Pick_5_black']; // Example values
                                if (side=='owner' && myturn==1) {
                                    if (myturn===c_player) {
                                        // Call the function with the appropriate arguments
                                        playable=game_rules(Last_played_Card, Next_played_Card);
                                        if (playable===true) {
                                          console.log('Played')
                                          //sendImageName(imageName);
                                        } else {
                                          console.log("Not Playable")
                                        }
                                    } else {
                                        console.log(myturn,c_player)
                                        console.log("Not Your Turn")
                                    }
                                } else if (side=='opponent' && myturn==-1){

                                    if (myturn===c_player) {
                                        // Call the function with the appropriate arguments
                                        playable=game_rules(Last_played_Card, Next_played_Card);
                                        if (playable===true) {
                                          console.log('Played')
                                          //sendImageName(imageName);
                                        } else {
                                          console.log("Not Playable")
                                        }
                                    } else {
                                        console.log("Not Your Turn")
                                    }
                                }
                                
                            };
                            row.appendChild(img);
                        });
                    }

                    // Call the function to create images for the upper row
                    createImages("upper-row", upperRowImages,'owner');

                    console.log("Deleted from owner_cards");
            // Prepare data object
            const data = {
                command: "player_cards",
                owner_cards: owner_cards,
                opponent_cards:opponent_cards,
            };

            // Send data over WebSocket connection
            socket.send(JSON.stringify(data));
                    // No need to continue searching after deletion, so break out of the loop
                    break;
                }
            }

            // Iterate over opponent_cards object
            for (var key in opponent_cards) {
                // Check if the current key and value match the specified criteria
                if (key === keyToMatch && opponent_cards[key] === valueToMatch) {
                    console.log("Matching key-value pair found in opponent_cards:");
                    console.log("Key:", key);
                    console.log("Value:", opponent_cards[key]);
                    // Delete the matching key-value pair from opponent_cards
                    delete opponent_cards[key];

                    var lowerRowImages = opponent_cards

                    // Function to send image name to the server
                    function sendImageName(imageName) {
                        const data = {
                            command: "start-game",
                            image_name: imageName
                        };
                        socket.send(JSON.stringify(data));
                    }

                    // Function to create image elements and append them to a given row
                    function createImages(rowId, images,side) {
                        var row = document.getElementById(rowId);
                        row.innerHTML = ''; 
                        Object.entries(images).forEach(function([imageName, imageLabel]) {
                            var img = document.createElement("img");
                            img.src = "/static/img/" + imageName + ".png"; // Construct the image source URL
                            img.alt = imageLabel;
                            img.classList.add("image");
                            img.onclick = function() {
                              // Assuming you have Last_played_Card and Next_played_Card defined somewhere
                                
                                var Next_played_Card =[imageName, imageLabel] //['Black_Joker', 'Pick_5_black']; // Example values
                                if (side=='owner' && myturn==1) {
                                    if (myturn===c_player) {
                                        // Call the function with the appropriate arguments
                                        playable=game_rules(Last_played_Card, Next_played_Card);
                                        if (playable===true) {
                                          console.log('Played')
                                          //sendImageName(imageName);
                                        } else {
                                          console.log("Not Playable")
                                        }
                                    } else {
                                        console.log("Not Your Turn")
                                    }
                                } else if (side=='opponent' && myturn==-1){

                                    if (myturn===c_player) {
                                        // Call the function with the appropriate arguments
                                        playable=game_rules(Last_played_Card, Next_played_Card);
                                        if (playable===true) {
                                          console.log('Played')
                                          //sendImageName(imageName);
                                        } else {
                                          console.log("Not Playable")
                                        }
                                    } else {
                                        console.log("Not Your Turn")
                                    }
                                }
                                
                            };
                            row.appendChild(img);
                        });
                    }

                    // Call the function to create images for the lower row
                    createImages("lower-row", lowerRowImages,'opponent');

                    console.log("Deleted from opponent_cards");
            // Prepare data object
            const data = {
                command: "player_cards",
                owner_cards: owner_cards,
                opponent_cards:opponent_cards,
            };

            // Send data over WebSocket connection
            socket.send(JSON.stringify(data));
                    // No need to continue searching after deletion, so break out of the loop
                    break;
                }
            }
        }
    }

}; 
  


window.onload = function() {
    
    // Dictionary with image names for the upper row
    var upperRowImages =owner_cards
    // Dictionary with image names for the lower row
    var lowerRowImages = opponent_cards

    // Function to send image name to the server
    function sendImageName(imageName) {
        const data = {
            command: "start-game",
            image_name: imageName
        };
        socket.send(JSON.stringify(data));
    }

    // Function to create image elements and append them to a given row
    function createImages(rowId, images,side) {
        var row = document.getElementById(rowId);
        Object.entries(images).forEach(function([imageName, imageLabel]) {
            var img = document.createElement("img");
            img.src = "/static/img/" + imageName + ".png"; // Construct the image source URL
            img.alt = imageLabel;
            img.classList.add("image");
            img.onclick = function() {
              // Assuming you have Last_played_Card and Next_played_Card defined somewhere
                
                var Next_played_Card =[imageName, imageLabel] //['Black_Joker', 'Pick_5_black']; // Example values
                if (side=='owner' && myturn==1) {
                    if (myturn===c_player) {
                        // Call the function with the appropriate arguments
                        playable=game_rules(Last_played_Card, Next_played_Card);
                        if (playable===true) {
                          console.log('Played')
                          //sendImageName(imageName);
                        } else {
                          console.log("Not Playable")
                        }
                    } else {
                        console.log("Not Your Turn")
                    }
                } else if (side=='opponent' && myturn==-1){

                    if (myturn===c_player) {
                        // Call the function with the appropriate arguments
                        playable=game_rules(Last_played_Card, Next_played_Card);
                        if (playable===true) {
                          console.log('Played')
                          //sendImageName(imageName);
                        } else {
                          console.log("Not Playable")
                        }
                    } else {
                        console.log("Not Your Turn")
                    }
                }
                
            };
            row.appendChild(img);
        });
    }

    // Call the function to create images for the upper row
    createImages("upper-row", upperRowImages,'owner');

    // Call the function to create images for the lower row
    createImages("lower-row", lowerRowImages,'opponent');
};



function game_rules(Last_played_Card, Next_played_Card) {

    if (Last_played_Card!==null && symbol !==null){
        //diamond
        if (symbol==='diamond' && (['D'].includes(Next_played_Card[0]) || Next_played_Card[0] === 'RED_Joker')) {
            Last_played_Card = Next_played_Card;

            const data = {
                command: "card-played",
                sub_command:"",
                Last_played_Card: Last_played_Card
            };
            socket.send(JSON.stringify(data));
            console.log('Sent');
            symbol=null
            return true;
        }
        else if (symbol==='diamond' && ['D'].includes(Next_played_Card[0])) {
            Last_played_Card = Next_played_Card;

            const data = {
                command: "card-played",
                sub_command:"",
                Last_played_Card: Last_played_Card
            };
            socket.send(JSON.stringify(data));
            console.log('Sent');
            symbol=null
            return true;
        }

        //spade
        else if (symbol==='spade' && (['D'].includes(Next_played_Card[0]) || Next_played_Card[0] === 'Black_Joker')) {
            Last_played_Card = Next_played_Card;

            const data = {
                command: "card-played",
                sub_command:"",
                Last_played_Card: Last_played_Card
            };
            socket.send(JSON.stringify(data));
            console.log('Sent');
            symbol=null
            return true;
        }
        else if (symbol==='spade' && ['D'].includes(Next_played_Card[0])) {
            Last_played_Card = Next_played_Card;

            const data = {
                command: "card-played",
                sub_command:"",
                Last_played_Card: Last_played_Card
            };
            socket.send(JSON.stringify(data));
            console.log('Sent');
            symbol=null
            return true;
        }

        //heart
        else if (symbol==='heart' && (['D'].includes(Next_played_Card[0]) || Next_played_Card[0] === 'RED_Joker')) {
            Last_played_Card = Next_played_Card;

            const data = {
                command: "card-played",
                sub_command:"",
                Last_played_Card: Last_played_Card
            };
            socket.send(JSON.stringify(data));
            console.log('Sent');
            symbol=null
            return true;
        }
        else if (symbol==='heart' && ['D'].includes(Next_played_Card[0])) {
            Last_played_Card = Next_played_Card;

            const data = {
                command: "card-played",
                sub_command:"",
                Last_played_Card: Last_played_Card
            };
            socket.send(JSON.stringify(data));
            console.log('Sent');
            symbol=null
            return true;
        }

        //flower
        else if (symbol==='flower' && (['F'].includes(Next_played_Card[0]) || Next_played_Card[0] === 'Black_Joker')) {
            Last_played_Card = Next_played_Card;

            const data = {
                command: "card-played",
                sub_command:"",
                Last_played_Card: Last_played_Card
            };
            socket.send(JSON.stringify(data));
            console.log('Sent');
            symbol=null
            return true;
        }
        else if (symbol==='flower' && ['F'].includes(Next_played_Card[0])) {
            Last_played_Card = Next_played_Card;

            const data = {
                command: "card-played",
                sub_command:"",
                Last_played_Card: Last_played_Card
            };
            socket.send(JSON.stringify(data));
            console.log('Sent');
            symbol=null
            return true;
        }
    }
    else if (Last_played_Card === null) {
        console.log(Last_played_Card,'Last_played_Card')

        // Define the letters to check for
        const lettersToCheck = ['4', '5', '6', '9', '10', 'Q', 'K'];
        if (Next_played_Card[0]!='7H') {
            lettersToCheck.push('7');
        }

        // Check if any of the letters appear in the string
        const containsLetter = lettersToCheck.some(letter => Next_played_Card[0].includes(letter));

        // Check the result
        if (containsLetter) {
            Last_played_Card = Next_played_Card;

            const data = {
                command: "card-played",
                sub_command:"",
                Last_played_Card: Last_played_Card
            };
            socket.send(JSON.stringify(data));
            console.log('Sent');

            return true;
        } else {

            // Check the result
            if (Next_played_Card[1] == 'Question') {

                Last_played_Card = Next_played_Card;

                const data = {
                    command: "card-played",
                    sub_command: "Question",
                    Last_played_Card: Last_played_Card
                };
                socket.send(JSON.stringify(data));
                return true;
                
                
            } else if (Next_played_Card[1] == "Pick_2") {
                Last_played_Card = Next_played_Card;

                const data = {
                    command: "card-played",
                    sub_command: "Pick_2",
                    Last_played_Card: Last_played_Card
                };
                socket.send(JSON.stringify(data));
                return true;
            } else if (Next_played_Card[1] == "Pick_3") {
                Last_played_Card = Next_played_Card;

                const data = {
                    command: "card-played",
                    sub_command: "Pick_3",
                    Last_played_Card: Last_played_Card
                };
                socket.send(JSON.stringify(data));
                return true;
            } else if (Next_played_Card[1] == "Pick_5_black") {
                Last_played_Card = Next_played_Card;

                const data = {
                    command: "card-played",
                    sub_command: "Pick_5_black",
                    Last_played_Card: Last_played_Card
                };
                socket.send(JSON.stringify(data));
                return true;
            } else if (Next_played_Card[1] == "Pick_5_red") {
                Last_played_Card = Next_played_Card;

                const data = {
                    command: "card-played",
                    sub_command: "Pick_5_red",
                    Last_played_Card: Last_played_Card
                };
                socket.send(JSON.stringify(data));
                return true;
            } else if (Next_played_Card[1] === "Add_Top") {
                Last_played_Card = Next_played_Card;

                const data = {
                    command: "card-played",
                    sub_command: "Add_Top",
                    Last_played_Card: Last_played_Card,
                    make_player_turn:false
                };
                socket.send(JSON.stringify(data));
                return true;
            } else if (Next_played_Card[1] === "End_game") {
                Last_played_Card = Next_played_Card;

                const data = {
                    command: "End_game",
                    sub_command: myturn,
                    Last_played_Card: Last_played_Card
                };
                socket.send(JSON.stringify(data));
                return true;
            }
        }
    } else {
        // Last_played_Card is not null
        console.log("Last_played_Card is not null");
        console.log(Last_played_Card,Next_played_Card)
        // List of elements to check
        const elements_to_check = ['4','5','6','7','9','10','K', 'Q'];  // Example value

        // Extract the card numbers
        const next_card_number = Next_played_Card[0].slice(0, -1);
        const last_card_number = Last_played_Card[0].slice(0, -1);

        // Iterate over the list and check if any element is present in both cards
        const common_element = elements_to_check.find(element => next_card_number.includes(element) && last_card_number.includes(element));

        if (common_element) {
            console.log("Common element present:", common_element);
            console.log(Last_played_Card)
            console.log(Next_played_Card)
            Last_played_Card = Next_played_Card;

            const data = {
                command: "card-played",
                sub_command:'',
                Last_played_Card: Last_played_Card
            };
            socket.send(JSON.stringify(data));
            return true;
        } 
        console.log(Last_played_Card)
        console.log(Next_played_Card)
        //console.log("No common element found in both cards.");
        if (Next_played_Card[1]==='Question'){
            Last_played_Card = Next_played_Card;

            const data = {
                command: "card-played",
                sub_command: "Question",
                Last_played_Card: Last_played_Card
            };
            socket.send(JSON.stringify(data));
            return true;
        }

        if (['H', 'D'].includes(Last_played_Card[0]) && Next_played_Card[0] === 'RED_Joker') {
            counter=counter_is_possible_function(Next_played_Card)
            console.log('***********************************')
            console.log(counter)
            console.log('***********************************')
            if (counter.length!==0) {
                console.log('Send message to the opponent to counter or pick 5');
                Last_played_Card = Next_played_Card;

                // Prepare data object
                const data = {
                    command: "card-played",
                    Last_played_Card: Last_played_Card,
                    sub_command:"Pick_3",
                    possible_counter:counter
                };

                // Send data over WebSocket connection
                socket.send(JSON.stringify(data));

                return true;
            }else {
                Last_played_Card = Next_played_Card;

                // Prepare data object
                const data = {
                    command: "card-played",
                    Last_played_Card: Last_played_Card,
                    sub_command:"Pick_3",
                    possible_counter:counter
                };

                // Send data over WebSocket connection
                socket.send(JSON.stringify(data));

                return true;
                }
        }

        if (['F', 'S'].includes(Last_played_Card[0]) && Next_played_Card[0] === 'Black_Joker') {
            counter=counter_is_possible_function(Next_played_Card)
            console.log('***********************************')

            console.log('***********************************')
            if (counter.length!==0) {
                console.log('Send message to the opponent to counter or pick 5');
                Last_played_Card = Next_played_Card;

                // Prepare data object
                const data = {
                    command: "card-played",
                    Last_played_Card: Last_played_Card,
                    sub_command:"Pick_3",
                    possible_counter:counter
                };

                // Send data over WebSocket connection
                socket.send(JSON.stringify(data));

                return true;
            }else {
                Last_played_Card = Next_played_Card;

                // Prepare data object
                const data = {
                    command: "card-played",
                    Last_played_Card: Last_played_Card,
                    sub_command:"Pick_3",
                    possible_counter:counter
                };

                // Send data over WebSocket connection
                socket.send(JSON.stringify(data));

                return true;
                }
        }

        if (Last_played_Card[0].includes('H')) {//} && Last_played_Card[1] === 'Ignore') {
            const lettersToCheck = ['4', '5', '6', '9', '10', 'Q', 'K'];

            // Check if any of the letters appear in the string
            const containsLetter = lettersToCheck.some(letter => Next_played_Card[0].includes(letter));

            // Check if the condition is met
            if (containsLetter && Next_played_Card[0].includes('H')) {
                // Update Last_played_Card
                Last_played_Card = Next_played_Card;

                // Prepare data object
                const data = {
                    command: "card-played",
                    Last_played_Card: Last_played_Card,
                    sub_command:"",
                };

                // Send data over WebSocket connection
                socket.send(JSON.stringify(data));

                return true;
            }

            if (Next_played_Card[1] === 'Pick_2') {
                counter = counter_is_possible_function(Next_played_Card);
                console.log('***********************************');
                console.log(counter);
                console.log('***********************************');
                if (counter.length !== 0) {
                    console.log('Send message to the opponent to counter or pick 5');
                    Last_played_Card = Next_played_Card;

                    // Prepare data object
                    const data = {
                        command: "card-played",
                        Last_played_Card: Last_played_Card,
                        sub_command: "Pick_2",
                        possible_counter: counter
                    };

                    // Send data over WebSocket connection
                    socket.send(JSON.stringify(data));

                    return true;
                } else {
                    Last_played_Card = Next_played_Card;

                    // Prepare data object
                    const data = {
                        command: "card-played",
                        Last_played_Card: Last_played_Card,
                        sub_command: "Pick_2",
                        possible_counter: counter
                    };

                    // Send data over WebSocket connection
                    socket.send(JSON.stringify(data));

                    return true;
                }
            }

                    
            if (Next_played_Card[1] === 'Pick_3') {
                counter = counter_is_possible_function(Next_played_Card);
                console.log('***********************************');
                console.log(counter);
                console.log('***********************************');
                if (counter.length !== 0) {
                    console.log('Send message to the opponent to counter or pick 5');
                    Last_played_Card = Next_played_Card;

                    // Prepare data object
                    const data = {
                        command: "card-played",
                        Last_played_Card: Last_played_Card,
                        sub_command: "Pick_3",
                        possible_counter: counter
                    };

                    // Send data over WebSocket connection
                    socket.send(JSON.stringify(data));

                    return true;
                } else {
                    Last_played_Card = Next_played_Card;

                    // Prepare data object
                    const data = {
                        command: "card-played",
                        Last_played_Card: Last_played_Card,
                        sub_command: "Pick_3",
                        possible_counter: counter
                    };

                    // Send data over WebSocket connection
                    socket.send(JSON.stringify(data));

                    return true;
                }
            }
            if (Next_played_Card[1] === 'Add_Top') {
                if (Last_played_Card[1]=== 'Add_Top') {
                    if (Last_played_Card[0].includes('J')) {
                        if (Next_played_Card[0].includes('J')) {
                            // Update Last_played_Card
                            Last_played_Card = Next_played_Card;

                            // Prepare data object
                            const data = {
                                command: "card-played",
                                Last_played_Card: Last_played_Card,
                                make_player_turn:false,
                            };

                            // Send data over WebSocket connection
                            socket.send(JSON.stringify(data));

                            return true;
                        }
                        else if (Next_played_Card[0] === '8H') {
                            // Update Last_played_Card
                            Last_played_Card = Next_played_Card;

                            // Prepare data object
                            const data = {
                                command: "card-played",
                                Last_played_Card: Last_played_Card,
                                make_player_turn:false,
                            };

                            // Send data over WebSocket connection
                            socket.send(JSON.stringify(data));

                            return true;
                        } else if (Next_played_Card[0].includes('H')) {
                            // Update Last_played_Card
                            Last_played_Card = Next_played_Card;

                            // Prepare data object
                            const data = {
                                command: "card-played",
                                Last_played_Card: Last_played_Card,
                                make_player_turn:true,
                            };

                            // Send data over WebSocket connection
                            socket.send(JSON.stringify(data));

                            return true;
                        }
                    }
                    if (Last_played_Card[0].includes('8')) {
                        if (Next_played_Card[0].includes('8')) {
                            // Update Last_played_Card
                            Last_played_Card = Next_played_Card;

                            // Prepare data object
                            const data = {
                                command: "card-played",
                                Last_played_Card: Last_played_Card,
                                make_player_turn:false,
                            };

                            // Send data over WebSocket connection
                            socket.send(JSON.stringify(data));

                            return true;
                        }
                        else if (Next_played_Card[0] === 'JH') {
                            // Update Last_played_Card
                            Last_played_Card = Next_played_Card;

                            // Prepare data object
                            const data = {
                                command: "card-played",
                                Last_played_Card: Last_played_Card,
                                make_player_turn:false,
                            };

                            // Send data over WebSocket connection
                            socket.send(JSON.stringify(data));

                            return true;
                        } else if (Next_played_Card[0].includes('H') ) {
                            // pass
                            // Update Last_played_Card
                            Last_played_Card = Next_played_Card;

                            // Prepare data object
                            const data = {
                                command: "card-played",
                                Last_played_Card: Last_played_Card,
                                make_player_turn:true,
                            };

                            // Send data over WebSocket connection
                            socket.send(JSON.stringify(data));

                            return true;
                        }
                    }
                } else {
                    // Update Last_played_Card
                    Last_played_Card = Next_played_Card;

                    // Prepare data object
                    const data = {
                        command: "card-played",
                        Last_played_Card: Last_played_Card,
                        make_player_turn:true,
                    };

                    // Send data over WebSocket connection
                    socket.send(JSON.stringify(data));

                    return true;
                }

            }

        }
        if (Last_played_Card[0].includes('H') && Last_played_Card[1] !== 'Ignore' && Next_played_Card[0].includes('H') || Next_played_Card[0].includes('3')) {
            if (Last_played_Card[1] === 'Pick_3' ) {
                // Update Last_played_Card
                Last_played_Card = Next_played_Card;

                // Prepare data object
                const data = {
                    command: "card-played",
                    Last_played_Card: Last_played_Card,
                    sub_command:"",
                };

                // Send data over WebSocket connection
                socket.send(JSON.stringify(data));

                return true;
            }
            if (Last_played_Card[1] === 'Pick_2') {
                // Update Last_played_Card
                Last_played_Card = Next_played_Card;

                // Prepare data object
                const data = {
                    command: "card-played",
                    Last_played_Card: Last_played_Card,
                    sub_command:"",
                };

                // Send data over WebSocket connection
                socket.send(JSON.stringify(data));

                return true;
            }
            if (Last_played_Card[1] === 'Ignore') {
                // Update Last_played_Card
                Last_played_Card = Next_played_Card;

                // Prepare data object
                const data = {
                    command: "card-played",
                    Last_played_Card: Last_played_Card,
                    sub_command:"",
                };

                // Send data over WebSocket connection
                socket.send(JSON.stringify(data));

                return true;
            }


        }

        // Diamond
        if (Last_played_Card[0].includes('D') ) {//&& Last_played_Card[1] === 'Ignore') {
            const lettersToCheck = ['4', '5', '6', '7','9', '10', 'Q', 'K'];

            // Check if any of the letters appear in the string
            const containsLetter = lettersToCheck.some(letter => Next_played_Card[0].includes(letter));

            // Check if the condition is met
            if (containsLetter && Next_played_Card[0].includes('D')) {
                // Update Last_played_Card
                Last_played_Card = Next_played_Card;

                // Prepare data object
                const data = {
                    command: "card-played",
                    Last_played_Card: Last_played_Card,
                    sub_command:"",
                };

                // Send data over WebSocket connection
                socket.send(JSON.stringify(data));

                return true;
            }

            if (Next_played_Card[1] === 'Pick_2') {

                counter=counter_is_possible_function(Next_played_Card)
                console.log('***********************************')
                console.log(counter)
                console.log('***********************************')
                if (counter.length!==0) {
                    console.log('Send message to the opponent to counter or pick 5');
                    Last_played_Card = Next_played_Card;

                    // Prepare data object
                    const data = {
                        command: "card-played",
                        Last_played_Card: Last_played_Card,
                        sub_command:"Pick_2",
                        possible_counter:counter
                    };

                    // Send data over WebSocket connection
                    socket.send(JSON.stringify(data));

                    return true;
                }else {
                    Last_played_Card = Next_played_Card;

                    // Prepare data object
                    const data = {
                        command: "card-played",
                        Last_played_Card: Last_played_Card,
                        sub_command:"Pick_2",
                        possible_counter:counter
                    };

                    // Send data over WebSocket connection
                    socket.send(JSON.stringify(data));

                    return true;
                    }
                }
                
            if (Next_played_Card[1] === 'Pick_3') {
                counter = counter_is_possible_function(Next_played_Card);
                console.log('***********************************');
                console.log(counter);
                console.log('***********************************');
                if (counter.length !== 0) {
                    console.log('Send message to the opponent to counter or pick 5');
                    Last_played_Card = Next_played_Card;

                    // Prepare data object
                    const data = {
                        command: "card-played",
                        Last_played_Card: Last_played_Card,
                        sub_command: "Pick_3",
                        possible_counter: counter
                    };

                    // Send data over WebSocket connection
                    socket.send(JSON.stringify(data));

                    return true;
                } else {
                    Last_played_Card = Next_played_Card;

                    // Prepare data object
                    const data = {
                        command: "card-played",
                        Last_played_Card: Last_played_Card,
                        sub_command: "Pick_3",
                        possible_counter: counter
                    };

                    // Send data over WebSocket connection
                    socket.send(JSON.stringify(data));

                    return true;
                }
            }
            if (Next_played_Card[1] === 'Add_Top') {
                if (Last_played_Card[1]=== 'Add_Top') {
                    if (Last_played_Card[0].includes('J')) {
                        if (Next_played_Card[0].includes('J')) {
                            // Update Last_played_Card
                            Last_played_Card = Next_played_Card;

                            // Prepare data object
                            const data = {
                                command: "card-played",
                                Last_played_Card: Last_played_Card,
                                make_player_turn:false,
                            };

                            // Send data over WebSocket connection
                            socket.send(JSON.stringify(data));

                            return true;
                        }
                        else if (Next_played_Card[0] === '8D') {
                            // Update Last_played_Card
                            Last_played_Card = Next_played_Card;

                            // Prepare data object
                            const data = {
                                command: "card-played",
                                Last_played_Card: Last_played_Card,
                                make_player_turn:false,
                            };

                            // Send data over WebSocket connection
                            socket.send(JSON.stringify(data));

                            return true;
                        } else if (Next_played_Card[0].includes('D')) {
                            // Update Last_played_Card
                            Last_played_Card = Next_played_Card;

                            // Prepare data object
                            const data = {
                                command: "card-played",
                                Last_played_Card: Last_played_Card,
                                make_player_turn:true,
                            };

                            // Send data over WebSocket connection
                            socket.send(JSON.stringify(data));

                            return true;
                        }
                    }
                    if (Last_played_Card[0].includes('8')) {
                        if (Next_played_Card[0].includes('8')) {
                            // Update Last_played_Card
                            Last_played_Card = Next_played_Card;

                            // Prepare data object
                            const data = {
                                command: "card-played",
                                Last_played_Card: Last_played_Card,
                                make_player_turn:false,
                            };

                            // Send data over WebSocket connection
                            socket.send(JSON.stringify(data));

                            return true;
                        }
                        else if (Next_played_Card[0] === 'JD') {
                            // Update Last_played_Card
                            Last_played_Card = Next_played_Card;

                            // Prepare data object
                            const data = {
                                command: "card-played",
                                Last_played_Card: Last_played_Card,
                                make_player_turn:false,
                            };

                            // Send data over WebSocket connection
                            socket.send(JSON.stringify(data));

                            return true;
                        } else if (Next_played_Card[0].includes('D') ) {
                            // pass
                            // Update Last_played_Card
                            Last_played_Card = Next_played_Card;

                            // Prepare data object
                            const data = {
                                command: "card-played",
                                Last_played_Card: Last_played_Card,
                                make_player_turn:true,
                            };

                            // Send data over WebSocket connection
                            socket.send(JSON.stringify(data));

                            return true;
                        }
                    }
                } else {
                    // pass
                    // Update Last_played_Card
                    Last_played_Card = Next_played_Card;

                    // Prepare data object
                    const data = {
                        command: "card-played",
                        Last_played_Card: Last_played_Card,
                        make_player_turn:true,
                    };

                    // Send data over WebSocket connection
                    socket.send(JSON.stringify(data));

                    return true;
                }

            }

        }

        // Flower
        if (Last_played_Card[0].includes('F') ) {//&& Last_played_Card[1] === 'Ignore') {
            const lettersToCheck = ['4', '5', '6', '7','9', '10', 'Q', 'K'];

            // Check if any of the letters appear in the string
            const containsLetter = lettersToCheck.some(letter => Next_played_Card[0].includes(letter));

            // Check if the condition is met
            if (containsLetter && Next_played_Card[0].includes('F')) {
                // Update Last_played_Card
                Last_played_Card = Next_played_Card;

                // Prepare data object
                const data = {
                    command: "card-played",
                    Last_played_Card: Last_played_Card,
                    sub_command:"",
                };

                // Send data over WebSocket connection
                socket.send(JSON.stringify(data));

                return true;
            }

            if (Next_played_Card[1] === 'Pick_2') {

                counter=counter_is_possible_function(Next_played_Card)
                console.log('***********************************')
                console.log(counter)
                console.log('***********************************')
                if (counter.length!==0) {
                    console.log('Send message to the opponent to counter or pick 5');
                    Last_played_Card = Next_played_Card;

                    // Prepare data object
                    const data = {
                        command: "card-played",
                        Last_played_Card: Last_played_Card,
                        sub_command:"Pick_2",
                        possible_counter:counter
                    };

                    // Send data over WebSocket connection
                    socket.send(JSON.stringify(data));

                    return true;
                }else {
                    Last_played_Card = Next_played_Card;

                    // Prepare data object
                    const data = {
                        command: "card-played",
                        Last_played_Card: Last_played_Card,
                        sub_command:"Pick_2",
                        possible_counter:counter
                    };

                    // Send data over WebSocket connection
                    socket.send(JSON.stringify(data));

                    return true;
                    }
                }
                
            if (Next_played_Card[1] === 'Pick_3') {
                counter = counter_is_possible_function(Next_played_Card);
                console.log('***********************************');
                console.log(counter);
                console.log('***********************************');
                if (counter.length !== 0) {
                    console.log('Send message to the opponent to counter or pick 5');
                    Last_played_Card = Next_played_Card;

                    // Prepare data object
                    const data = {
                        command: "card-played",
                        Last_played_Card: Last_played_Card,
                        sub_command: "Pick_3",
                        possible_counter: counter
                    };

                    // Send data over WebSocket connection
                    socket.send(JSON.stringify(data));

                    return true;
                } else {
                    Last_played_Card = Next_played_Card;

                    // Prepare data object
                    const data = {
                        command: "card-played",
                        Last_played_Card: Last_played_Card,
                        sub_command: "Pick_3",
                        possible_counter: counter
                    };

                    // Send data over WebSocket connection
                    socket.send(JSON.stringify(data));

                    return true;
                }
            }
            if (Next_played_Card[1] === 'Add_Top') {
                if (Last_played_Card[1]=== 'Add_Top') {
                    if (Last_played_Card[0].includes('J')) {
                        if (Next_played_Card[0].includes('J')) {
                            // Update Last_played_Card
                            Last_played_Card = Next_played_Card;

                            // Prepare data object
                            const data = {
                                command: "card-played",
                                Last_played_Card: Last_played_Card,
                                make_player_turn:false,
                            };

                            // Send data over WebSocket connection
                            socket.send(JSON.stringify(data));

                            return true;
                        }
                        else if (Next_played_Card[0] === '8F') {
                            // Update Last_played_Card
                            Last_played_Card = Next_played_Card;

                            // Prepare data object
                            const data = {
                                command: "card-played",
                                Last_played_Card: Last_played_Card,
                                make_player_turn:false,
                            };

                            // Send data over WebSocket connection
                            socket.send(JSON.stringify(data));

                            return true;
                        } else if (Next_played_Card[0].includes('F')) {
                            // Update Last_played_Card
                            Last_played_Card = Next_played_Card;

                            // Prepare data object
                            const data = {
                                command: "card-played",
                                Last_played_Card: Last_played_Card,
                                make_player_turn:true,
                            };

                            // Send data over WebSocket connection
                            socket.send(JSON.stringify(data));

                            return true;
                        }
                    }
                    if (Last_played_Card[0].includes('8')) {
                        if (Next_played_Card[0].includes('8')) {
                            // Update Last_played_Card
                            Last_played_Card = Next_played_Card;

                            // Prepare data object
                            const data = {
                                command: "card-played",
                                Last_played_Card: Last_played_Card,
                                make_player_turn:false,
                            };

                            // Send data over WebSocket connection
                            socket.send(JSON.stringify(data));

                            return true;
                        }
                        else if (Next_played_Card[0] === 'JF') {
                            // Update Last_played_Card
                            Last_played_Card = Next_played_Card;

                            // Prepare data object
                            const data = {
                                command: "card-played",
                                Last_played_Card: Last_played_Card,
                                make_player_turn:false,
                            };

                            // Send data over WebSocket connection
                            socket.send(JSON.stringify(data));

                            return true;
                        } else if (Next_played_Card[0].includes('F') ) {
                            // pass
                            // Update Last_played_Card
                            Last_played_Card = Next_played_Card;

                            // Prepare data object
                            const data = {
                                command: "card-played",
                                Last_played_Card: Last_played_Card,
                                make_player_turn:true,
                            };

                            // Send data over WebSocket connection
                            socket.send(JSON.stringify(data));

                            return true;
                        }
                    }
                } else {
                    // Update Last_played_Card
                    Last_played_Card = Next_played_Card;

                    // Prepare data object
                    const data = {
                        command: "card-played",
                        Last_played_Card: Last_played_Card,
                        make_player_turn:true,
                    };

                    // Send data over WebSocket connection
                    socket.send(JSON.stringify(data));

                    return true;
                }

            }

        }

        // SPADE
        if (Last_played_Card[0].includes('S')) {//&& Last_played_Card[1] === 'Ignore') {
            console.log('SPades played ')
            const lettersToCheck = ['4', '5','7','6', '9', '10', 'Q', 'K'];

            // Check if any of the letters appear in the string
            const containsLetter = lettersToCheck.some(letter => Next_played_Card[0].includes(letter));

            // Check if the condition is met
            if (containsLetter && Next_played_Card[0].includes('S')) {
                // Update Last_played_Card
                Last_played_Card = Next_played_Card;

                // Prepare data object
                const data = {
                    command: "card-played",
                    Last_played_Card: Last_played_Card,
                    sub_command:"",
                };

                // Send data over WebSocket connection
                socket.send(JSON.stringify(data));

                return true;
            }

            if (Next_played_Card[1] === 'Pick_2') {

                counter=counter_is_possible_function(Next_played_Card)
                console.log('***********************************')
                console.log(counter)
                console.log('***********************************')
                if (counter.length!==0) {
                    console.log('Send message to the opponent to counter or pick 5');
                    Last_played_Card = Next_played_Card;

                    // Prepare data object
                    const data = {
                        command: "card-played",
                        Last_played_Card: Last_played_Card,
                        sub_command:"Pick_2",
                        possible_counter:counter
                    };

                    // Send data over WebSocket connection
                    socket.send(JSON.stringify(data));

                    return true;
                }else {
                    Last_played_Card = Next_played_Card;

                    // Prepare data object
                    const data = {
                        command: "card-played",
                        Last_played_Card: Last_played_Card,
                        sub_command:"Pick_2",
                        possible_counter:counter
                    };

                    // Send data over WebSocket connection
                    socket.send(JSON.stringify(data));

                    return true;
                    }
                }
                
            if (Next_played_Card[1] === 'Pick_3') {
                counter=counter_is_possible_function(Next_played_Card)
                console.log('***********************************')
                console.log(counter)
                console.log('***********************************')
                if (counter.length!==0) {
                    console.log('Send message to the opponent to counter or pick 5');
                    Last_played_Card = Next_played_Card;

                    // Prepare data object
                    const data = {
                        command: "card-played",
                        Last_played_Card: Last_played_Card,
                        sub_command:"Pick_3",
                        possible_counter:counter
                    };

                    // Send data over WebSocket connection
                    socket.send(JSON.stringify(data));

                    return true;
                }else {
                    Last_played_Card = Next_played_Card;

                    // Prepare data object
                    const data = {
                        command: "card-played",
                        Last_played_Card: Last_played_Card,
                        sub_command:"Pick_3",
                        possible_counter:counter
                    };

                    // Send data over WebSocket connection
                    socket.send(JSON.stringify(data));

                    return true;
                    }
            }
            if (Next_played_Card[1] === 'Add_Top') {
                if (Last_played_Card[1]=== 'Add_Top') {
                    if (Last_played_Card[0].includes('J')) {
                        if (Next_played_Card[0].includes('J')) {
                            // Update Last_played_Card
                            Last_played_Card = Next_played_Card;

                            // Prepare data object
                            const data = {
                                command: "card-played",
                                Last_played_Card: Last_played_Card,
                                make_player_turn:false,
                            };

                            // Send data over WebSocket connection
                            socket.send(JSON.stringify(data));

                            return true;
                        }
                        else if (Next_played_Card[0] === '8S') {
                            // Update Last_played_Card
                            Last_played_Card = Next_played_Card;

                            // Prepare data object
                            const data = {
                                command: "card-played",
                                Last_played_Card: Last_played_Card,
                                make_player_turn:false,
                            };

                            // Send data over WebSocket connection
                            socket.send(JSON.stringify(data));

                            return true;
                        } else if (Next_played_Card[0].includes('S')) {
                            // Update Last_played_Card
                            Last_played_Card = Next_played_Card;

                            // Prepare data object
                            const data = {
                                command: "card-played",
                                Last_played_Card: Last_played_Card,
                                make_player_turn:true,
                            };

                            // Send data over WebSocket connection
                            socket.send(JSON.stringify(data));

                            return true;
                        }
                    }
                    if (Last_played_Card[0].includes('8')) {
                        if (Next_played_Card[0].includes('8')) {
                            // Update Last_played_Card
                            Last_played_Card = Next_played_Card;

                            // Prepare data object
                            const data = {
                                command: "card-played",
                                Last_played_Card: Last_played_Card,
                                make_player_turn:false,
                            };

                            // Send data over WebSocket connection
                            socket.send(JSON.stringify(data));

                            return true;
                        }
                        else if (Next_played_Card[0] === 'JS') {
                            // Update Last_played_Card
                            Last_played_Card = Next_played_Card;

                            // Prepare data object
                            const data = {
                                command: "card-played",
                                Last_played_Card: Last_played_Card,
                                make_player_turn:false,
                            };

                            // Send data over WebSocket connection
                            socket.send(JSON.stringify(data));

                            return true;
                        } else if (Next_played_Card[0].includes('S') ) {
                            // pass
                            // Update Last_played_Card
                            Last_played_Card = Next_played_Card;

                            // Prepare data object
                            const data = {
                                command: "card-played",
                                Last_played_Card: Last_played_Card,
                                make_player_turn:true,
                            };

                            // Send data over WebSocket connection
                            socket.send(JSON.stringify(data));

                            return true;
                        }
                    }
                } else {
                    // Update Last_played_Card
                    Last_played_Card = Next_played_Card;

                    // Prepare data object
                    const data = {
                        command: "card-played",
                        Last_played_Card: Last_played_Card,
                        make_player_turn:true,
                    };

                    // Send data over WebSocket connection
                    socket.send(JSON.stringify(data));

                    return true;
                }

            }
        }
    }
    
    console.log('None of the above conditions met, return false.');
    return false;
};








function Update_images(data,imageName) {
    function createImage(rowId, imageName) {
        var row = document.getElementById(rowId);
        row.innerHTML = ''; // Clear existing contents of the row

        var img = document.createElement("img");
        img.src = "/static/img/" + imageName + ".png"; // Construct the image source URL
        img.alt = imageName;
        img.classList.add("image");
        img.onclick = function () {
            //sendImageName(imageName);
        };
        row.appendChild(img);

        console.log('Image added to the row:', rowId);
    }

    // Call the function to create and append the image for the last played card
    createImage("Card-played", imageName);
    // Define the key and value to search for
    var keyToMatch = data.Last_played_Card[0];
    var valueToMatch = data.Last_played_Card[1];

    // Iterate over owner_cards object
    for (var key in owner_cards) {
        // Check if the current key and value match the specified criteria
        if (key === keyToMatch && owner_cards[key] === valueToMatch) {
            console.log("Matching key-value pair found in owner_cards:");
            console.log("Key:", key);
            console.log("Value:", owner_cards[key]);
            // Delete the matching key-value pair from owner_cards
            delete owner_cards[key];
            // Dictionary with image names for the upper row
            var upperRowImages =owner_cards
            // Function to send image name to the server
            function sendImageName(imageName) {
                const data = {
                    command: "start-game",
                    image_name: imageName
                };
                socket.send(JSON.stringify(data));
            }

            // Function to create image elements and append them to a given row
            function createImages(rowId, images,side) {
                var row = document.getElementById(rowId);
                row.innerHTML = ''; 
                Object.entries(images).forEach(function([imageName, imageLabel]) {
                    var img = document.createElement("img");
                    img.src = "/static/img/" + imageName + ".png"; // Construct the image source URL
                    img.alt = imageLabel;
                    img.classList.add("image");
                    img.onclick = function() {
                      // Assuming you have Last_played_Card and Next_played_Card defined somewhere
                        
                        var Next_played_Card =[imageName, imageLabel] //['Black_Joker', 'Pick_5_black']; // Example values
                        if (side=='owner' && myturn==1) {
                            if (myturn===c_player) {
                                // Call the function with the appropriate arguments
                                playable=game_rules(Last_played_Card, Next_played_Card);
                                if (playable===true) {
                                  console.log('Played')
                                  //sendImageName(imageName);
                                } else {
                                  console.log("Not Playable")
                                }
                            } else {
                                console.log("Not Your Turn")
                            }
                        } else if (side=='opponent' && myturn==-1){

                            if (myturn===c_player) {
                                // Call the function with the appropriate arguments
                                playable=game_rules(Last_played_Card, Next_played_Card);
                                if (playable===true) {
                                  console.log('Played')
                                  //sendImageName(imageName);
                                } else {
                                  console.log("Not Playable")
                                }
                            } else {
                                console.log("Not Your Turn")
                            }
                        }
                        
                    };
                    row.appendChild(img);
                });
            }
            // Call the function to create images for the upper row
            createImages("upper-row", upperRowImages,'owner');

            console.log("Deleted from owner_cards");
            // Prepare data object
            const data = {
                command: "player_cards",
                owner_cards: owner_cards,
                opponent_cards:opponent_cards,
            };

            // Send data over WebSocket connection
            socket.send(JSON.stringify(data));
            // No need to continue searching after deletion, so break out of the loop
            break;
        }
    }

    // Iterate over opponent_cards object
    for (var key in opponent_cards) {
        // Check if the current key and value match the specified criteria
        if (key === keyToMatch && opponent_cards[key] === valueToMatch) {
            console.log("Matching key-value pair found in opponent_cards:");
            console.log("Key:", key);
            console.log("Value:", opponent_cards[key]);
            // Delete the matching key-value pair from opponent_cards
            delete opponent_cards[key];

            var lowerRowImages = opponent_cards

            // Function to send image name to the server
            function sendImageName(imageName) {
                const data = {
                    command: "start-game",
                    image_name: imageName
                };
                socket.send(JSON.stringify(data));
            }

            // Function to create image elements and append them to a given row
            function createImages(rowId, images,side) {
                var row = document.getElementById(rowId);
                row.innerHTML = ''; 
                Object.entries(images).forEach(function([imageName, imageLabel]) {
                    var img = document.createElement("img");
                    img.src = "/static/img/" + imageName + ".png"; // Construct the image source URL
                    img.alt = imageLabel;
                    img.classList.add("image");
                    img.onclick = function() {
                      // Assuming you have Last_played_Card and Next_played_Card defined somewhere
                        
                        var Next_played_Card =[imageName, imageLabel] //['Black_Joker', 'Pick_5_black']; // Example values
                        if (side=='owner' && myturn==1) {
                            if (myturn===c_player) {
                                // Call the function with the appropriate arguments
                                playable=game_rules(Last_played_Card, Next_played_Card);
                                if (playable===true) {
                                  console.log('Played')
                                  //sendImageName(imageName);
                                } else {
                                  console.log("Not Playable")
                                }
                            } else {
                                console.log("Not Your Turn")
                            }
                        } else if (side=='opponent' && myturn==-1){

                            if (myturn===c_player) {
                                // Call the function with the appropriate arguments
                                playable=game_rules(Last_played_Card, Next_played_Card);
                                if (playable===true) {
                                  console.log('Played')
                                  //sendImageName(imageName);
                                } else {
                                  console.log("Not Playable")
                                }
                            } else {
                                console.log("Not Your Turn")
                            }
                        }
                        
                    };
                    row.appendChild(img);
                });
            }


            // Call the function to create images for the lower row
            createImages("lower-row", lowerRowImages,'opponent');

            console.log("Deleted from opponent_cards");
            // Prepare data object
            const data = {
                command: "player_cards",
                owner_cards: owner_cards,
                opponent_cards:opponent_cards,
            };

            // Send data over WebSocket connection
            socket.send(JSON.stringify(data));
            // No need to continue searching after deletion, so break out of the loop
            break;
        }
    }
}


function handleClick(symbol) {
        const data = {
        command: "ask-played",
        symbol:symbol,
        };
        socket.send(JSON.stringify(data));
    }

function handleClicks(symbol) {
        const data = {
        command: "counter",
        symbol:symbol,
        Last_played_Card:Last_played_Card,

        };
        socket.send(JSON.stringify(data));
    }

function counter_is_possible_function(card){
    if (myturn===1) {
        opponent_CARDS=opponent_cards
    } else if (myturn===-1) {
        opponent_CARDS=owner_cards
    }
    if (card[1]==='Pick_2') {
        if (card[0]==='2F') {
            // Sample list of items
            var itemList = ["3F", "AS", "Black_Joker", "2D","2S",'2H'];
        } 
        else if (card[0]==='2S'){
            var itemList = ["3S", "AS", "Black_Joker", "2D","2S",'2H'];
        }
        else if (card[0]==='2D'){
            var itemList = ["3D", "AS", "RED_Joker", "2F","2S",'2H'];
        }
        else if (card[0]==='2H'){
            var itemList = ["3H", "AS", "RED_Joker", "2D","2S",'2F'];
        }
    }
    else if (card[1]==='Pick_3') {
        if (card[0]==='3F') {
            // Sample list of items
            var itemList = ["2F", "AS", "Black_Joker", "3D","3S",'3H'];
        } 
        else if (card[0]==='3S'){
            var itemList = ["2S", "AS", "Black_Joker", "3D","3S",'3H'];
        }
        else if (card[0]==='3D'){
            var itemList = ["2D", "AS", "RED_Joker", "3F","3S",'3H'];
        }
        else if (card[0]==='3H'){
            var itemList = ["2H", "AS", "RED_Joker", "3D","3S",'3F'];
        }
    }
    else if (card[1]==='Pick_5_red') {
        var itemList = ["AS", "Black_Joker", "3F","3S",'2F','2S'];

    }
    else if (card[1]==='Pick_5_black') {
        var itemList = ["RED_Joker", "3D","3H",'2D','2H','AS'];
    }
    console.log(opponent_CARDS)

    // Sample card[1] array
    var cardActions = Object.keys(opponent_CARDS);
    console.log(cardActions);

    var matchingCards = [];

    // Iterate over itemList and check if any item is present in cardActions
    itemList.forEach(function(item) {
        if (cardActions.includes(item)) {
            matchingCards.push(item);
        }
    });
    console.log(matchingCards)
    // Check if any card in opponentCards has the value "Pick_2"
    return matchingCards
    
}
function up_date_cards(owner_cardss,opponent_cardss) {

    var upperRowImages =owner_cardss
    // Dictionary with image names for the lower row
    var lowerRowImages = opponent_cardss

    // Function to send image name to the server
    function sendImageName(imageName) {
        const data = {
            command: "start-game",
            image_name: imageName
        };
        socket.send(JSON.stringify(data));
    }

    // Function to create image elements and append them to a given row
    function createImages(rowId, images,side) {
        var row = document.getElementById(rowId);
        row.innerHTML = '';
        Object.entries(images).forEach(function([imageName, imageLabel]) {
            var img = document.createElement("img");
            img.src = "/static/img/" + imageName + ".png"; // Construct the image source URL
            img.alt = imageLabel;
            img.classList.add("image");
            img.onclick = function() {
              // Assuming you have Last_played_Card and Next_played_Card defined somewhere
                
                var Next_played_Card =[imageName, imageLabel] //['Black_Joker', 'Pick_5_black']; // Example values
                if (side=='owner' && myturn==1) {
                    if (myturn===c_player) {
                        // Call the function with the appropriate arguments
                        playable=game_rules(Last_played_Card, Next_played_Card);
                        if (playable===true) {
                          console.log('Played')
                          //sendImageName(imageName);
                        } else {
                          console.log("Not Playable")
                        }
                    } else {
                        console.log("Not Your Turn")
                    }
                } else if (side=='opponent' && myturn==-1){

                    if (myturn===c_player) {
                        // Call the function with the appropriate arguments
                        playable=game_rules(Last_played_Card, Next_played_Card);
                        if (playable===true) {
                          console.log('Played')
                          //sendImageName(imageName);
                        } else {
                          console.log("Not Playable")
                        }
                    } else {
                        console.log("Not Your Turn")
                    }
                }
                
            };
            row.appendChild(img);
        });
    }

    // Call the function to create images for the upper row
    createImages("upper-row", upperRowImages,'owner');

    // Call the function to create images for the lower row
    createImages("lower-row", lowerRowImages,'opponent');
};




// Function to create and attach images to the modal
function attachImagesToModal(cardArray) {
  var modalBody = document.querySelector(".modal-body1");
  
  // Loop through the cardArray
  cardArray.forEach(function(card) {
    // Create an image element
    var img = document.createElement("img");
    
    // Set the src attribute of the image
    img.src = "/static/img/" + card + ".png"; // Assuming image paths are constructed this way
    
    // Set the alt attribute of the image
    img.alt = card;
    
    // Set styles for the image
    img.style.flex = "1";
    img.style.width = "30px";
    img.style.height = "350px";
    

    
    // Attach onclick event handler to the image
    img.onclick = function() {
      handleClicks(this.alt); // Pass the alt attribute (card name) to the handleClick function
    };
    
    // Append the image to the modal body
    modalBody.appendChild(img);
  });
}


function update_asked_question(data) {
    // Function to create and append a single image element to a given row
    function createImage(rowId, imageName) {
        var row = document.getElementById(rowId);
        row.innerHTML = ''; // Clear existing contents of the row

        var img = document.createElement("img");
        img.src = "/static/img/" + imageName + ".png"; // Construct the image source URL
        img.alt = imageName;
        img.classList.add("image");
        img.onclick = function () {
            //sendImageName(imageName);
        };
        row.appendChild(img);

        console.log('Image added to the row:', rowId);
    }

    
    // Define the key and value to search for
    var keyToMatch = data.symbol;

    // Call the function to create and append the image for the last played card
    createImage("question_card", keyToMatch);
}
function update_last_played_card(data) {
    // Function to create and append a single image element to a given row
    function createImage(rowId, imageName) {
        var row = document.getElementById(rowId);
        row.innerHTML = ''; // Clear existing contents of the row

        var img = document.createElement("img");
        img.src = "/static/img/" + imageName + ".png"; // Construct the image source URL
        img.alt = imageName;
        img.classList.add("image");
        img.onclick = function () {
            //sendImageName(imageName);
        };
        row.appendChild(img);

        console.log('Image added to the row:', rowId);
    }

    
    // Define the key and value to search for
    var keyToMatch = data.Last_played_Card[0];
    var valueToMatch = data.Last_played_Card[1];

    // Call the function to create and append the image for the last played card
    createImage("Card-played", keyToMatch);

    // Iterate over owner_cards object
    for (var key in owner_cards) {
        // Check if the current key and value match the specified criteria
        if (key === keyToMatch && owner_cards[key] === valueToMatch) {
            console.log("Matching key-value pair found in owner_cards:");
            console.log("Key:", key);
            console.log("Value:", owner_cards[key]);
            // Delete the matching key-value pair from owner_cards
            delete owner_cards[key];
            // Dictionary with image names for the upper row
            var upperRowImages =owner_cards
            // Function to send image name to the server
            function sendImageName(imageName) {
                const data = {
                    command: "start-game",
                    image_name: imageName
                };
                socket.send(JSON.stringify(data));
            }

            // Function to create image elements and append them to a given row
            function createImages(rowId, images,side) {
                var row = document.getElementById(rowId);

                row.innerHTML = ''; // Clear existing contents of the row

                Object.entries(images).forEach(function([imageName, imageLabel]) {
                    var img = document.createElement("img");
                    img.src = "/static/img/" + imageName + ".png"; // Construct the image source URL
                    img.alt = imageLabel;
                    img.classList.add("image");
                    img.onclick = function() {
                      // Assuming you have Last_played_Card and Next_played_Card defined somewhere
                        
                        var Next_played_Card =[imageName, imageLabel] //['Black_Joker', 'Pick_5_black']; // Example values
                        if (side=='owner' && myturn==1) {
                            if (myturn===c_player) {
                                // Call the function with the appropriate arguments
                                playable=game_rules(Last_played_Card, Next_played_Card);
                                if (playable===true) {
                                  console.log('Played')
                                  //sendImageName(imageName);
                                } else {
                                  console.log("Not Playable")
                                }
                            } else {
                                console.log("Not Your Turn")
                            }
                        } else if (side=='opponent' && myturn==-1){

                            if (myturn===c_player) {
                                // Call the function with the appropriate arguments
                                playable=game_rules(Last_played_Card, Next_played_Card);
                                if (playable===true) {
                                  console.log('Played')
                                  //sendImageName(imageName);
                                } else {
                                  console.log("Not Playable")
                                }
                            } else {
                                console.log("Not Your Turn")
                            }
                        }
                        
                    };
                    row.appendChild(img);
                });
            }

            // Call the function to create images for the upper row
            createImages("upper-row", upperRowImages,'owner');

            console.log("Deleted from owner_cards");
            // Prepare data object
            const data = {
                command: "player_cards",
                owner_cards: owner_cards,
                opponent_cards:opponent_cards,
            };

            // Send data over WebSocket connection
            socket.send(JSON.stringify(data));
            // No need to continue searching after deletion, so break out of the loop
            break;
        }
    }

    // Iterate over opponent_cards object
    for (var key in opponent_cards) {
        // Check if the current key and value match the specified criteria
        if (key === keyToMatch && opponent_cards[key] === valueToMatch) {
            console.log("Matching key-value pair found in opponent_cards:");
            console.log("Key:", key);
            console.log("Value:", opponent_cards[key]);
            // Delete the matching key-value pair from opponent_cards
            delete opponent_cards[key];

            var lowerRowImages = opponent_cards

            // Function to send image name to the server
            function sendImageName(imageName) {
                const data = {
                    command: "start-game",
                    image_name: imageName
                };
                socket.send(JSON.stringify(data));
            }

            // Function to create image elements and append them to a given row
            function createImages(rowId, images,side) {
                var row = document.getElementById(rowId);
                row.innerHTML = ''; 
                Object.entries(images).forEach(function([imageName, imageLabel]) {
                    var img = document.createElement("img");
                    img.src = "/static/img/" + imageName + ".png"; // Construct the image source URL
                    img.alt = imageLabel;
                    img.classList.add("image");
                    img.onclick = function() {
                      // Assuming you have Last_played_Card and Next_played_Card defined somewhere
                        
                        var Next_played_Card =[imageName, imageLabel] //['Black_Joker', 'Pick_5_black']; // Example values
                        if (side=='owner' && myturn==1) {
                            if (myturn===c_player) {
                                // Call the function with the appropriate arguments
                                playable=game_rules(Last_played_Card, Next_played_Card);
                                if (playable===true) {
                                  console.log('Played')
                                  //sendImageName(imageName);
                                } else {
                                  console.log("Not Playable")
                                }
                            } else {
                                console.log("Not Your Turn")
                            }
                        } else if (side=='opponent' && myturn==-1){

                            if (myturn===c_player) {
                                // Call the function with the appropriate arguments
                                playable=game_rules(Last_played_Card, Next_played_Card);
                                if (playable===true) {
                                  console.log('Played')
                                  //sendImageName(imageName);
                                } else {
                                  console.log("Not Playable")
                                }
                            } else {
                                console.log("Not Your Turn")
                            }
                        }
                        
                    };
                    row.appendChild(img);
                });
            }

            // Call the function to create images for the lower row
            createImages("lower-row", lowerRowImages,'opponent');

            console.log("Deleted from opponent_cards");
            // Prepare data object
            const data = {
                command: "player_cards",
                owner_cards: owner_cards,
                opponent_cards:opponent_cards,
            };

            // Send data over WebSocket connection
            socket.send(JSON.stringify(data));
            // No need to continue searching after deletion, so break out of the loop
            break;
        }
    }
}