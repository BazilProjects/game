var ws_scheme = window.location.protocol == "https:" ? "wss" : "ws";
 
var ws_path = ws_scheme + '://' + window.location.host + "/game/" + 1

var Last_played_Card = null; // Example values
 
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
    const data = {
        command: "pick-card",
    };
    socket.send(JSON.stringify(data));
}

// Add event listener when DOM content is fully loaded
document.addEventListener("DOMContentLoaded", function() {
    // Retrieve the button element
    var pickCardButton = document.getElementById("pick-card-button");
    if (pickCardButton) {
        // Add event listener to the button
        pickCardButton.addEventListener("click", try_pick_card);
    } else {
        console.error("Button element not found.");
    }
});

// Set up event listener for incoming messages
socket.onmessage = function (message) {
      console.log("Got websocket message " + message.data);
      var data = JSON.parse(message.data)
      // Extract and log p, row, and column
      console.log(data)
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
                    sendImageName(imageName);
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


    if (data.command === "card-played") {
        Last_played_Card=data.Last_played_Card;
        // Get the image name for the last played card
        c_player=data.c_player
        console.log(c_player)
        var imageName = data.Last_played_Card[0];
        if (Last_played_Card[0]==='RED_Joker'){
            console.log("PICK 5 red")
        }
        else if (Last_played_Card[0]==='Black_Joker') {
            console.log("PICK 5 black")
        }
        else if (Last_played_Card[1]==='Pick_2') {
            console.log("PICK 2")
        }
        else if (Last_played_Card[1]==='Pick_3') {
            console.log("PICK 3")
        }
        else if (Last_played_Card[1]==='Question') {
            console.log("Ask start")
            // Find the button element by its class name
            var modal = document.getElementById("exampleModal");

            // Show the modal
            $(modal).modal("show");
            Update_images(data,imageName)

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
                    sendImageName(imageName);
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
                    function createImages(rowId, images) {
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

                                // Call the function with the appropriate arguments
                                playable=game_rules(Last_played_Card, Next_played_Card);
                                if (playable===true) {
                                  console.log('Played')
                                  sendImageName(imageName);
                                } else {
                                  console.log("Not Playable")
                                }
                                
                            };
                            row.appendChild(img);
                        });
                    }

                    // Call the function to create images for the upper row
                    createImages("upper-row", upperRowImages);

                    console.log("Deleted from owner_cards");
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
                    function createImages(rowId, images) {
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

                                // Call the function with the appropriate arguments
                                playable=game_rules(Last_played_Card, Next_played_Card);
                                if (playable===true) {
                                  console.log('Played')
                                  sendImageName(imageName);
                                } else {
                                  console.log("Not Playable")
                                }
                                
                            };
                            row.appendChild(img);
                        });
                    }


                    // Call the function to create images for the lower row
                    createImages("lower-row", lowerRowImages);

                    console.log("Deleted from opponent_cards");
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
                          sendImageName(imageName);
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
                          sendImageName(imageName);
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
    if (Last_played_Card === null) {

        // Define the letters to check for
        const lettersToCheck = ['4', '5', '6', '9', '10', 'Q', 'K'];

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
                    Last_played_Card: Last_played_Card
                };
                socket.send(JSON.stringify(data));
                return true;
            } else if (Next_played_Card[1] === "End_game") {
                Last_played_Card = Next_played_Card;

                const data = {
                    command: "card-played",
                    sub_command: "End_game",
                    Last_played_Card: Last_played_Card
                };
                socket.send(JSON.stringify(data));
                return true;
            }
        }
    } else {
        // Last_played_Card is not null
        console.log("Last_played_Card is not null");
        if (Next_played_Card[1] === 'Question') {
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

        if (['H', 'D'].includes(Last_played_Card[0]) && Next_played_Card[0] === 'RED_Joker') {

            if (counter_is_possible) {
                console.log('Send message to the opponent to counter or pick 5');

                if (pick) {
                    console.log('Randomly give him 5');
                }
                if (counter) {
                    if (counter === 'Pick_2') {
                        console.log('print give him 3');
                    }
                    if (counter === 'Pick_3') {
                        console.log('print give him 3');
                    }
                    if (counter === 'Pick_5_red') {
                        console.log('give opponent red joker');
                    }
                    if (counter === 'Pick_5_black') {
                        console.log('give opponent black joker');
                    }
                }
            }
        }

        if (['F', 'S'].includes(Last_played_Card[0]) && Next_played_Card[0] === 'Black_Joker') {
            if (counter_is_possible) {
                console.log('Send message to the opponent to counter or pick 5');

                if (pick) {
                    console.log('Randomly give him 5');
                }
                if (counter) {
                    if (counter === 'Pick_2') {
                        console.log('print give him 3');
                    }
                    if (counter === 'Pick_3') {
                        console.log('print give him 3');
                    }
                    if (counter === 'Pick_5_red') {
                        console.log('give opponent red joker');
                    }
                    if (counter === 'Pick_5_black') {
                        console.log('give opponent black joker');
                    }
                }
            }
        }

        if (Last_played_Card[0].includes('H') && Last_played_Card[1] === 'Ignore') {
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

            if (Last_played_Card[1] === 'Question') {
                console.log('i chose what to ask for Card type(h,s,f,d');
            }
            if (Last_played_Card[1] === 'Pick_2') {
                if (counter_is_possible) {
                    console.log('Send message to the opponent to counter or pick 5');

                    if (pick) {
                        console.log('Randomly give him 5');
                    }
                    if (counter) {
                        if (counter === 'Pick_2') {
                            console.log('opponent picks 2');
                        }
                        if (counter === 'Pick_3') {
                            console.log('opponent picks 3');
                        }
                        if (counter === 'Pick_5_red') {
                            console.log('give opponent red joker');
                        }
                        if (counter === 'Pick_5_black') {
                            console.log('give opponent black joker');
                        }
                    }
                }
                console.log('Server 2 random picks from Cards_deck_play to Next player then play again');
            }
            if (Last_played_Card[1] === 'Pick_3') {
                console.log('Send message to the opponent to counter or pick 5');
                if (counter_is_possible) {
                    console.log('Send message to the opponent to counter or pick 5');
                    if (pick) {
                        console.log('Randomly give him 5');
                    }
                    if (counter) {
                        if (counter === 'Pick_2') {
                            console.log('randomly give him 1');
                        }
                        if (counter === 'Pick_3') {
                            console.log('opponent picks 3');
                        }
                        if (counter === 'Pick_5_red') {
                            console.log('give opponent red joker');
                        }
                        if (counter === 'Pick_5_black') {
                            console.log('give opponent black joker');
                        }
                    }
                }
                console.log('Server 3 random picks from Cards_deck_play to Next player then play again');
            }
            if (Last_played_Card[1] === 'Add_Top') {
                console.log('Add another Card');
                if (Last_played_Card[0].includes('J')) {
                    if (Next_played_Card[0].includes('J')) {
                        // pass
                    }
                    if (Next_played_Card[0] === '8H') {
                        // pass
                    } else if (Next_played_Card[0].includes('H')) {
                        // pass
                    }
                }
                if (Last_played_Card[0] === '8') {
                    if (Next_played_Card[0] === '8') {
                        // pass
                    }
                    if (Next_played_Card[0] === 'jH') {
                        // pass
                    } else if (Next_played_Card[0].includes('H')) {
                        // pass
                    }
                }
            }
            if (Last_played_Card[1] === 'End_game') {
                console.log("Game Ended");
            }
        }

        // Diamond
        if (Last_played_Card[0].includes('D') && Last_played_Card[1] === 'Ignore') {
            const lettersToCheck = ['4', '5', '6', '9', '10', 'Q', 'K'];

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


            if (Last_played_Card[1] === 'Question') {
                console.log('i chose what to ask for Card type(h,s,f,d');
            }
            if (Last_played_Card[1] === 'Pick_2') {
                if (counter_is_possible) {
                    console.log('Send message to the opponent to counter or pick 5');

                    if (pick) {
                        console.log('Randomly give him 5');
                    }
                    if (counter) {
                        if (counter === 'Pick_2') {
                            console.log('opponent picks 2');
                        }
                        if (counter === 'Pick_3') {
                            console.log('opponent picks 3');
                        }
                        if (counter === 'Pick_5_red') {
                            console.log('give opponent red joker');
                        }
                        if (counter === 'Pick_5_black') {
                            console.log('give opponent black joker');
                        }
                    }
                }
                console.log('Server 2 random picks from Cards_deck_play to Next player then play again');
            }
            if (Last_played_Card[1] === 'Pick_3') {
                console.log('Send message to the opponent to counter or pick 5');
                if (counter_is_possible) {
                    console.log('Send message to the opponent to counter or pick 5');
                    if (pick) {
                        console.log('Randomly give him 5');
                    }
                    if (counter) {
                        if (counter === 'Pick_2') {
                            console.log('randomly give him 1');
                        }
                        if (counter === 'Pick_3') {
                            console.log('opponent picks 3');
                        }
                        if (counter === 'Pick_5_red') {
                            console.log('give opponent red joker');
                        }
                        if (counter === 'Pick_5_black') {
                            console.log('give opponent black joker');
                        }
                    }
                }
                console.log('Server 3 random picks from Cards_deck_play to Next player then play again');
            }
            if (Last_played_Card[1] === 'Add_Top') {
                console.log('Add another Card');
                if (Last_played_Card[0].includes('J')) {
                    if (Next_played_Card[0].includes('J')) {
                        // pass
                    }
                    if (Next_played_Card[0] === '8D') {
                        // pass
                    } else if (Next_played_Card[0].includes('D')) {
                        // pass
                    }
                }
                if (Last_played_Card[0] === '8') {
                    if (Next_played_Card[0] === '8') {
                        // pass
                    }
                    if (Next_played_Card[0] === 'jD') {
                        // pass
                    } else if (Next_played_Card[0].includes('D')) {
                        // pass
                    }
                }
            }
            if (Last_played_Card[1] === 'End_game') {
                console.log("Game Ended");
            }
        }

        // Flower
        if (Last_played_Card[0].includes('F') && Last_played_Card[1] === 'Ignore') {
            const lettersToCheck = ['4', '5', '6', '9', '10', 'Q', 'K'];

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


            if (Last_played_Card[1] === 'Question') {
                console.log('i chose what to ask for Card type(h,s,f,d');
            }
            if (Last_played_Card[1] === 'Pick_2') {
                if (counter_is_possible) {
                    console.log('Send message to the opponent to counter or pick 5');

                    if (pick) {
                        console.log('Randomly give him 5');
                    }
                    if (counter) {
                        if (counter === 'Pick_2') {
                            console.log('opponent picks 2');
                        }
                        if (counter === 'Pick_3') {
                            console.log('opponent picks 3');
                        }
                        if (counter === 'Pick_5_red') {
                            console.log('give opponent red joker');
                        }
                        if (counter === 'Pick_5_black') {
                            console.log('give opponent black joker');
                        }
                    }
                }
                console.log('Server 2 random picks from Cards_deck_play to Next player then play again');
            }
            if (Last_played_Card[1] === 'Pick_3') {
                console.log('Send message to the opponent to counter or pick 5');
                if (counter_is_possible) {
                    console.log('Send message to the opponent to counter or pick 5');
                    if (pick) {
                        console.log('Randomly give him 5');
                    }
                    if (counter) {
                        if (counter === 'Pick_2') {
                            console.log('randomly give him 1');
                        }
                        if (counter === 'Pick_3') {
                            console.log('opponent picks 3');
                        }
                        if (counter === 'Pick_5_red') {
                            console.log('give opponent red joker');
                        }
                        if (counter === 'Pick_5_black') {
                            console.log('give opponent black joker');
                        }
                    }
                }
                console.log('Server 3 random picks from Cards_deck_play to Next player then play again');
            }
            if (Last_played_Card[1] === 'Add_Top') {
                console.log('Add another Card');
                if (Last_played_Card[0].includes('J')) {
                    if (Next_played_Card[0].includes('J')) {
                        // pass
                    }
                    if (Next_played_Card[0] === '8F') {
                        // pass
                    } else if (Next_played_Card[0].includes('F')) {
                        // pass
                    }
                }
                if (Last_played_Card[0] === '8') {
                    if (Next_played_Card[0] === '8') {
                        // pass
                    }
                    if (Next_played_Card[0] === 'jF') {
                        // pass
                    } else if (Next_played_Card[0].includes('F')) {
                        // pass
                    }
                }
            }
            if (Last_played_Card[1] === 'End_game') {
                console.log("Game Ended");
            }
        }

        // SPADE
        if (Last_played_Card[0].includes('S') && Last_played_Card[1] === 'Ignore') {
            console.log('SPades played ')
            const lettersToCheck = ['4', '5', '6', '9', '10', 'Q', 'K'];

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


            if (Last_played_Card[1] === 'Question') {
                console.log('i chose what to ask for Card type(h,s,f,d');
            }
            if (Last_played_Card[1] === 'Pick_2') {
                if (counter_is_possible) {
                    console.log('Send message to the opponent to counter or pick 5');

                    if (pick) {
                        console.log('Randomly give him 5');
                    }
                    if (counter) {
                        if (counter === 'Pick_2') {
                            console.log('opponent picks 2');
                        }
                        if (counter === 'Pick_3') {
                            console.log('opponent picks 3');
                        }
                        if (counter === 'Pick_5_red') {
                            console.log('give opponent red joker');
                        }
                        if (counter === 'Pick_5_black') {
                            console.log('give opponent black joker');
                        }
                    }
                }
                console.log('Server 2 random picks from Cards_deck_play to Next player then play again');
            }
            if (Last_played_Card[1] === 'Pick_3') {
                console.log('Send message to the opponent to counter or pick 5');
                if (counter_is_possible) {
                    console.log('Send message to the opponent to counter or pick 5');
                    if (pick) {
                        console.log('Randomly give him 5');
                    }
                    if (counter) {
                        if (counter === 'Pick_2') {
                            console.log('randomly give him 1');
                        }
                        if (counter === 'Pick_3') {
                            console.log('opponent picks 3');
                        }
                        if (counter === 'Pick_5_red') {
                            console.log('give opponent red joker');
                        }
                        if (counter === 'Pick_5_black') {
                            console.log('give opponent black joker');
                        }
                    }
                }
                console.log('Server 3 random picks from Cards_deck_play to Next player then play again');
            }
            if (Last_played_Card[1] === 'Add_Top') {
                console.log('Add another Card');
                if (Last_played_Card[0].includes('J')) {
                    if (Next_played_Card[0].includes('J')) {
                        // pass
                    }
                    if (Next_played_Card[0] === '8S') {
                        // pass
                    } else if (Next_played_Card[0].includes('S')) {
                        // pass
                    }
                }
                if (Last_played_Card[0] === '8') {
                    if (Next_played_Card[0] === '8') {
                        // pass
                    }
                    if (Next_played_Card[0] === 'jS') {
                        // pass
                    } else if (Next_played_Card[0].includes('S')) {
                        // pass
                    }
                }
            }
            if (Last_played_Card[1] === 'End_game') {
                console.log("Game Ended");
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
            sendImageName(imageName);
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
            function createImages(rowId, images) {
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

                        // Call the function with the appropriate arguments
                        playable=game_rules(Last_played_Card, Next_played_Card);
                        if (playable===true) {
                          console.log('Played')
                          sendImageName(imageName);
                        } else {
                          console.log("Not Playable")
                        }
                        
                    };
                    row.appendChild(img);
                });
            }

            // Call the function to create images for the upper row
            createImages("upper-row", upperRowImages);

            console.log("Deleted from owner_cards");
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
            function createImages(rowId, images) {
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

                        // Call the function with the appropriate arguments
                        playable=game_rules(Last_played_Card, Next_played_Card);
                        if (playable===true) {
                          console.log('Played')
                          sendImageName(imageName);
                        } else {
                          console.log("Not Playable")
                        }
                        
                    };
                    row.appendChild(img);
                });
            }


            // Call the function to create images for the lower row
            createImages("lower-row", lowerRowImages);

            console.log("Deleted from opponent_cards");
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