// Example values for Next_played_Card and Last_played_Card
const Next_played_Card = ['kS', 'Ignore'];  // Example value
const Last_played_Card = ['kh', 'From'];     // Example value

// List of elements to check
const elements_to_check = ['5', 'k', 'Q'];  // Example value

// Extract the card numbers
const next_card_number = Next_played_Card[0].slice(0, -1);
const last_card_number = Last_played_Card[0].slice(0, -1);

// Iterate over the list and check if any element is present in both cards
const common_element = elements_to_check.find(element => next_card_number.includes(element) && last_card_number.includes(element));

if (common_element) {
    console.log("Common element present:", common_element);
} else {
    console.log("No common element found in both cards.");
}
