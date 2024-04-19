/*

Web Services Final Assignment - PokeAPI - Drew Murray

I discovered a little late that there isn't many query parameters I could use in this API,
however I made it work by filtering in my js code.

The only query parameters I could use was limit and offset which I used by having next and previous page buttons.

I'm fetching 4 data types: Pokemon, Type, Ability, Moves.

Pokemon and Type are used for the Pokemon tab.
Ability is used for the Abilities Tab.
Moves is used for the Moves Tab.

I would've liked to add filters for battle class and type to moves but I unfortunatley didn't have time.
It would've functioned similarly to the filtering on the pokemon page anyways.

*/
pageLimit = 18;


const pokemonCards = document.querySelector("#pokemonCards");
const pokemonSearch = document.querySelector("#pokemonSearch");
const pokemonFirst = document.querySelector("#pokemonFirst");
const pokemonPrev = document.querySelector("#pokemonPrev");
const pokemonNext = document.querySelector("#pokemonNext");
const pokemonLast = document.querySelector("#pokemonLast");
const abilityFirst = document.querySelector("#abilityFirst");
const abilityPrev = document.querySelector("#abilityPrev");
const abilityNext = document.querySelector("#abilityNext");
const abilityLast = document.querySelector("#abilityLast");
const moveFirst = document.querySelector("#moveFirst");
const movePrev = document.querySelector("#movePrev");
const moveNext = document.querySelector("#moveNext");
const moveLast = document.querySelector("#moveLast");
var primaryType, secondaryType, pokemonArray, filteredPokemonArray, abilityArray, moveArray, filteredMoveArray;
search = "";
offset = 0;
page = 0;
totalPages = 0;
results = 0;
totalResults = 0;

document.getElementById("defaultType").click();

// This is adding an input event listener to my pokemonSearch input.
// When the user types into the input it will filter the currently displayed pokemon using their name.
pokemonSearch.addEventListener("input", function () {
    search = this.value.trim().toLowerCase();
    if (primaryType) {
        getPokemonByType(primaryType, secondaryType);
    } else {
        getAllPokemon();
    }
});

// This is the function that filters the Pokemon's name based on what the user types in the input
function searchPokemon() {
    const filteredPokemon = pokemonArray.filter(pokemon => {
        const pokemonName = pokemon.name.replace(/-/g, ' '); // Format the Pokeon's name for comparison
        return pokemonName.toLowerCase().includes(search); // Check if the Pokemon's name matches the user's search query
    });

    showSpinner();
    Promise.all(filteredPokemon.map(pokemon => {
        return fetch(pokemon.url)
            .then(response => response.json())
            .then(pokemonJson => ({
                name: pokemonJson.name.split("-").map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(" "),
                image: pokemonJson.sprites.front_default || "images/noImage.png",
                types: pokemonJson.types.map(type => type.type.name)
            }));
    })).then(data => {
        hideSpinner();
        pokemonArray = data;
        totalResults = pokemonArray.length;
        totalPages = Math.floor(totalResults / pageLimit) + 1;
        filterPokemon(); // Update the display with the filtered Pokemon
    });
}

function filterPokemon() {
    filteredPokemonArray = [];
    results = 0;
    for (; results < pageLimit && results + offset < totalResults; results++) {
        filteredPokemonArray.push(pokemonArray[results + offset]);
    }
    console.log(totalResults);
    console.log(results + offset);
    setPokemonButtons();
    displayPokemon(); // Update the display with the filtered Pokemon
}

// This function is used to select Pokemon type.
// When the user selects any of the type buttons, this function is called, passing in the type
// as a variable called type.
function selectType(type) {
    // If the primaryType is selected, the primary type is set to the secondary type
    // and the secondary type is set to null.
    if (type === primaryType) {
        primaryType = secondaryType
        secondaryType = null;
        // If the secondary type is selected, set it to null
    } else if (type === secondaryType) {
        secondaryType = null;
        // If primary type and secondary type are already selected,
        // set primary type to secondary type, and
        // secondary type to the selected type
    } else if (primaryType && secondaryType) {
        primaryType = secondaryType
        secondaryType = type;
        // If only primary type has been selected,
        // set secondary type to the selected type    
    } else if (primaryType) {
        secondaryType = type;
        // Otherwise set the primary type to the selected type    
    } else {
        primaryType = type;
    }

    // Clear background color of all type buttons
    document.querySelectorAll(".typeButtonImg").forEach(button => {
        button.style.backgroundColor = "transparent";
    });

    // Set background color of selected types
    if (primaryType) {
        document.getElementById(primaryType).style.backgroundColor = "#96ffb1";
    }
    if (secondaryType) {
        document.getElementById(secondaryType).style.backgroundColor = "#96ffb1";
    }

    page = 1;
    offset = 0;
    // If primary type is selected, get the Pokemon by type
    if (primaryType) {
        getPokemonByType(primaryType, secondaryType);
        // Otherwise get all Pokemon   
    } else {
        getAllPokemon();
    }
}

// Function used to fetch Pokemon by type
// This function fetches the "type" data type, I then get all pokemon associated with said type. 
function getPokemonByType(primaryType, secondaryType) {
    // Fetch Pokemon with the primary type (can't search by both types at the same time through api)
    fetch(`https://pokeapi.co/api/v2/type/${primaryType}?limit=100000&offset=0`)
        .then(response => response.json())
        .then(primaryJson => {
            pokemonCards.innerHTML = ""; // Clear the card area
            const primaryPokemon = primaryJson.pokemon.map(p => ({ name: p.pokemon.name, url: p.pokemon.url })); // Map the pokemon into a variable

            // Fetch Pokemon with the secondary type if the secondary type was selected
            if (secondaryType) {
                fetch(`https://pokeapi.co/api/v2/type/${secondaryType}?limit=100000&offset=0`)
                    .then(response => response.json())
                    .then(secondaryJson => {
                        const secondaryPokemon = secondaryJson.pokemon.map(p => ({ name: p.pokemon.name, url: p.pokemon.url }));
                        const outputPokemon = primaryPokemon.filter(pokemon =>
                            secondaryPokemon.some(p => p.url === pokemon.url) // Filter the pokemon for output by checking if they have the same url.
                            // This way only pokemon that were in both searches will be displayed.
                        );
                        pokemonArray = outputPokemon;
                        searchPokemon();
                    });
            } else {
                pokemonArray = primaryPokemon;
                searchPokemon();
            }
        });
}

// Function to fetch all Pokemon
// This function fetches the "pokemon" data type, I then use all the results.
function getAllPokemon() {
    fetch(`https://pokeapi.co/api/v2/pokemon?limit=100000&offset=0`)
        .then(response => response.json())
        .then(json => {
            pokemonCards.innerHTML = "";
            pokemonArray = json.results.map(pokemon => ({ name: pokemon.name, url: pokemon.url }));
            searchPokemon();
        })
}

// Function to display Pokemon as cards
// Function to display Pokemon as cards
function displayPokemon() {
    const pokeNumResults = document.getElementById("pokeNumResults");
    const pokePageNum = document.getElementById("pokePageNum");
    pokeNumResults.innerText = `Showing ${results} of ${totalResults} results.` // Set the number of results text
    pokePageNum.innerText = `Page ${page} of ${totalPages}` // Set the page number text
    const container = document.createElement("div"); // Create a div container that all cards will be stored in
    container.classList.add("pokemon-cards"); // Add a class to style the container

    // Loop through each pokemon in our filteredPokemonArray
    filteredPokemonArray.forEach(pokemon => {
        const card = document.createElement("div"); // Create a div for an individual card
        card.classList.add("pokemon-card"); // Add class to style the card

        // Create elements for name and image
        const nameElement = document.createElement("h3"); // Create h3 element for the name
        nameElement.innerText = pokemon.name; // Set the text to the pokemon's name
        const imageElement = document.createElement("img"); // Create img element for the image
        imageElement.src = pokemon.image; // Set the src to the pokemon's image

        // Create a container for types
        const typesElement = document.createElement("div"); // Create a container to store the pokemon's types
        typesElement.classList.add("pokemon-types"); // Add a class to style the container

        // Loop through each of the pokemon's types and create type images
        pokemon.types.forEach(type => {
            const typeImg = document.createElement("img"); // Create an img for the type icon
            typeImg.src = `images/${type}.png`; // Set the image based on the type name
            typeImg.alt = type; // Set alt attribute to the type name
            typeImg.title = type; // Set title attribute to the type name
            typesElement.appendChild(typeImg); // Add the image to the container
        });

        // Append name, image, and types to the card
        card.appendChild(nameElement); // Add the name to the card
        card.appendChild(imageElement); // Add the img to the card
        card.appendChild(typesElement); // Add the types to the card

        // Append the card to the container
        container.appendChild(card); // Add the card to the container
    });

    // Append the container to the pokemonCards element
    pokemonCards.appendChild(container); // Add the cards to the page
}

// Function used to fetch Abilities
// This function fetches the "ability" data type, I then get all pokemon associated with said type. 
function getAbilities() {
    // Search all abilities, filtering by limit and offset
    fetch(`https://pokeapi.co/api/v2/ability?limit=${pageLimit}&offset=${offset}`)
        .then(response => response.json())
        .then(json => {
            showSpinner();
            totalResults = json.count; // Set the totalResults to whatever the count value is in the json
            results = json.results.length; // Set the current results to be the length of the results array in the json
            page = offset / pageLimit + 1; // Calculate what the current page is
            totalPages = Math.floor(totalResults / pageLimit) + 1; // Calculate how many total pages there will be (used math.floor to round the value down)

            abilityArray = json.results.map(ability => ({ name: ability.name, url: ability.url })); // Store the abilities in a variable
            setAbilityButtons(); // Set the abilities buttons
            displayAbilities(); // Display the abilities
            hideSpinner();
        })
}

// This function is used to display the abilities
function displayAbilities() {
    const abilityBody = document.getElementById("abilityTable"); // Get the ability table
    const numResults = document.getElementById("numResults"); // Get the numResults p
    const pageNum = document.getElementById("pageNum"); // Get the pageNum p
    numResults.innerText = `Showing ${results} of ${totalResults} results.` // Set the number of results text
    pageNum.innerText = `Page ${page} of ${totalPages}` // Set the page number text
    // Set the headings for the ability table
    abilityBody.innerHTML = `
        <tr>
            <th>Name</th>
            <th>Effect</th>
        </tr>`;

    // Loop through the ability array
    abilityArray.forEach(ability => {
        // Fetch the abilities url to get all ability information
        fetch(ability.url)
            .then(response => response.json())
            .then(abilityData => {
                const row = document.createElement("tr"); // Create a table row for the data

                // Loop through the abilities names to find the english name
                abilityData.names.forEach(name => {
                    if (name.language.name == "en") {
                        row.innerHTML = `<td>${name.name}</td>`; // Add the name to the row
                    }
                })

                // Sometimes an ability might have multiple texts, we use this to make sure we only ouput one
                let hasEffect = false;

                // If the abilities effect_entries array has anything it it, loop through it.
                if (abilityData.effect_entries.length > 0) {
                    abilityData.effect_entries.forEach(entry => {
                        // When the entry is english, set the name.
                        if (entry.language.name == "en" && !hasEffect) {
                            row.innerHTML += `<td>${entry.effect}</td>`;
                            hasEffect = true;
                        }
                    })
                    // Or the abilities flavor_text_entries array has anything it it, loop through it.
                } else if (abilityData.flavor_text_entries.length > 0) {
                    abilityData.flavor_text_entries.forEach(entry => {
                        // When the entry is english, set the name.
                        if (entry.language.name == "en" && !hasEffect) {
                            row.innerHTML += `<td>${entry.flavor_text}</td>`;
                            hasEffect = true;
                        }
                    })
                    // If it has neither of those arrays, set the entry to our message    
                } else {
                    row.innerHTML += `<td>No Effect Text Found</td>`;
                }

                // Add the row to the table
                abilityBody.appendChild(row);
            });
    });
}

// This function gets all moves and stores them in an array
function getMoves() {
    fetch(`https://pokeapi.co/api/v2/move?limit=10000&offset=0`)
        .then(response => response.json())
        .then(json => {
            showSpinner();
            totalResults = json.count;
            totalPages = Math.floor(totalResults / pageLimit) + 1;

            const moves = json.results.map(move => {
                return fetch(move.url).then(response => response.json());
            });

            Promise.all(moves)
                .then(moves => {
                    moveArray = moves.map(moveData => ({
                        name: getMoveName(moveData),
                        type: moveData.type.name,
                        damageClass: moveData.damage_class.name,
                        effect: getMoveEffect(moveData)
                    }));
                    hideSpinner();
                    setMoveButtons();
                });
        })
}

function getMoveName(moveData) {
    for (const name of moveData.names) {
        if (name.language.name === "en") {
            return name.name;
        }
    }
}

function getMoveEffect(moveData) {
    // First, check if the move has effect entries
    if (moveData.effect_entries.length > 0) {
        // Loop through the effect entries to find the English entry
        for (const entry of moveData.effect_entries) {
            if (entry.language.name === "en") {
                return entry.effect;
            }
        }
    }
    // If no effect entries are found, check flavor text entries
    if (moveData.flavor_text_entries.length > 0) {
        // Loop through the flavor text entries to find the English entry
        for (const entry of moveData.flavor_text_entries) {
            if (entry.language.name === "en") {
                return entry.flavor_text;
            }
        }
    }
    // If no effect or flavor text entries are found, return a default message
    return "No Effect Text Found";
}

function filterMoves() {
    filteredMoveArray = [];
    results = 0;
    for (; results < pageLimit && results + offset < totalResults; results++) {
        filteredMoveArray.push(moveArray[results + offset]);
    }
    displayMoves();
}

function displayMoves() {
    const moveBody = document.getElementById("moveTable");
    const moveNumResults = document.getElementById("moveNumResults");
    const movePageNum = document.getElementById("movePageNum");
    moveNumResults.innerText = `Showing ${results} of ${totalResults} results.`;
    movePageNum.innerText = `Page ${page} of ${totalPages}`;
    moveBody.innerHTML = `
    <tr>
        <th>Name</th>
        <th>Type</th>
        <th>Damage Class</th>
        <th>Effect</th>
    </tr>`;

    filteredMoveArray.forEach(move => {

        const row = document.createElement("tr");
        row.innerHTML = `<td>${move.name}</td>`;
        row.innerHTML += `<td class='imgtd'><img src='images/${move.type}.png' title='${move.type}'></td>`;
        row.innerHTML += `<td class='imgtd'><img src='images/${move.damageClass}.png' title='${move.damageClass}'></td>`;
        row.innerHTML += `<td>${move.effect}</td>`;

        moveBody.appendChild(row);
    });
}


// Function to change data type
function changeDataType(type, elmnt, color) {
    // Hide all tabcontent elements
    document.querySelectorAll(".tabcontent").forEach(tabcontent => {
        tabcontent.style.display = "none";
    });

    // Hide all body-content elements
    document.querySelectorAll(".body-content").forEach(bodycontent => {
        bodycontent.style.display = "none";
    });

    // Reset background color of all tablinks
    document.querySelectorAll(".tablink").forEach(tablink => {
        tablink.style.backgroundColor = "";
    });

    // Display selected tabcontent and body-content
    document.getElementById(type).style.display = "block";
    document.getElementById(type + "Body").style.display = "block";
    elmnt.style.backgroundColor = color;

    // Reset page num variables
    offset = 0;
    page = offset / pageLimit + 1;
    results = 0;

    // Perform action based on type
    switch (type) {
        // If pokemon was selected
        case "pokemon":
            // Reset all filters
            primaryType = "";
            secondaryType = "";
            search = "";
            pokemonSearch.value = "";
            document.querySelectorAll(".typeButtonImg").forEach(typeButtonImg => {
                typeButtonImg.style.backgroundColor = "";
            });
            getAllPokemon();
            break;
        case "ability":
            getAbilities();
            break;
        default:
            if (moveArray) {
                // We don't need to get moves again so set totalResults and pages to what they should be for moves
                totalResults = moveArray.length;
                totalPages = Math.floor(totalResults / pageLimit) + 1;
                setMoveButtons();
            } else {
                getMoves();
            }
            break;
    }
}

// Enable and disable pokemon's buttons
function setPokemonButtons() {
    // If the current page is the last page, disable the next and last buttons
    if (page >= totalPages) {
        pokemonNext.disabled = true;
        pokemonLast.disabled = true;
        // Otherwise enable them    
    } else {
        pokemonNext.disabled = false;
        pokemonLast.disabled = false;
    }

    // If the current page is the first page, disable the first and prev buttons
    if (page == 1) {
        pokemonFirst.disabled = true;
        pokemonPrev.disabled = true;
        // Otherwise enable them    
    } else {
        pokemonFirst.disabled = false;
        pokemonPrev.disabled = false;
    }
}

// Set's offset and page, to set to first page
function pokemonFirstAction() {
    offset = 0;
    page = 1;
    if (primaryType) {
        getPokemonByType(primaryType, secondaryType);
    } else {
        getAllPokemon();
    }
}

// Set's offset and page, to set to previous page
function pokemonPrevAction() {
    offset -= pageLimit;
    page--;
    if (primaryType) {
        getPokemonByType(primaryType, secondaryType);
    } else {
        getAllPokemon();
    }
}

// Set's offset and page, to set to next page
function pokemonNextAction() {
    offset += pageLimit;
    page++;
    if (primaryType) {
        getPokemonByType(primaryType, secondaryType);
    } else {
        getAllPokemon();
    }
}

// Set's offset and page, to set to last page
function pokemonLastAction() {
    offset = (totalPages - 1) * pageLimit;
    page = totalPages;
    if (primaryType) {
        getPokemonByType(primaryType, secondaryType);
    } else {
        getAllPokemon();
    }
}

//function to disable and enable the Moves buttons
function setMoveButtons() {
    // If the current page is the last page, disable the next and last buttons
    if (page >= totalPages) {
        moveNext.disabled = true;
        moveLast.disabled = true;
        // Otherwise enable them    
    } else {
        moveNext.disabled = false;
        moveLast.disabled = false;
    }

    // If the current page is the first page, disable the first and prev buttons
    if (page == 1) {
        moveFirst.disabled = true;
        movePrev.disabled = true;
        // Otherwise enable them    
    } else {
        moveFirst.disabled = false;
        movePrev.disabled = false;
    }
    filterMoves();
}

// Set's offset and page, to set to first page
function moveFirstAction() {
    offset = 0;
    page = 1;
    setMoveButtons()
}

// Set's offset and page, to set to previous page
function movePrevAction() {
    offset -= pageLimit;
    page--;
    setMoveButtons()
}

// Set's offset and page, to set to next page
function moveNextAction() {
    offset += pageLimit;
    page++;
    setMoveButtons()
}

// Set's offset and page, to set to last page
function moveLastAction() {
    offset = (totalPages - 1) * pageLimit;
    page = totalPages;
    setMoveButtons()
}


// This function is used to enable and disable the ability first, prev, next, and last buttons
function setAbilityButtons() {
    // If the current page is greater than or equal to the total number of pages, disable the next and last buttons
    if (page >= totalPages) {
        abilityNext.disabled = true;
        abilityLast.disabled = true;
        // Otherwise enable them    
    } else {
        abilityNext.disabled = false;
        abilityLast.disabled = false;
    }

    // If the current page is the first page, disable the first and prev buttons
    if (page == 1) {
        abilityFirst.disabled = true;
        abilityPrev.disabled = true;
        // Otherwise enable them    
    } else {
        abilityFirst.disabled = false;
        abilityPrev.disabled = false;
    }
}

// When the "First" button is clicked, set offset to 0 to go to the first page
function abilityFirstAction() {
    offset = 0;
    getAbilities();
}

// When the "Prev" button is clicked, subtract the page limit from the offset to go to the previous page
function abilityPrevAction() {
    offset -= pageLimit;
    getAbilities();
}

// When the "Next" button is clicked, add the page limit to the offset to go to the next page
function abilityNextAction() {
    offset += pageLimit;
    getAbilities();
}

// When the "Last" button is clicked, set the offset to the totalPages minus one, multiplied by the page limit, to go to the last page
function abilityLastAction() {
    offset = (totalPages - 1) * pageLimit;
    getAbilities();
}

// Show's spinner so user knows data is loading
function showSpinner() {
    pokemonSearch.readOnly = true;
    document.getElementById("spinner-overlay").style.display = "block";
    document.getElementById("spinner").style.display = "block";
}

// Hide's spinner when data is done loading
function hideSpinner() {
    pokemonSearch.readOnly = false;
    document.getElementById("spinner-overlay").style.display = "none";
    document.getElementById("spinner").style.display = "none";
}