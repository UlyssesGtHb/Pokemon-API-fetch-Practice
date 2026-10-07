const pokemonImg = document.getElementById("pokemon-Img");
const pokemonName = document.getElementById("pokemon-Name");
const pokemonId = document.getElementById("pokemon-Id");
const pokemonShiny = document.getElementById("pokemon-Shiny");
const pokemonType = document.getElementById("pokemon-Type");
const pokemonAbilities = document.getElementById("pokemon-Abilities");
const pokemonHeight = document.getElementById("pokemon-Height");
const pokemonWeight = document.getElementById("pokemon-Weight");
const pokemonBtn = document.getElementById("pokemon-btn");
const cryBtn = document.getElementById("cry-btn");
const shinyCountEl = document.getElementById("shiny-Count");
const errorBox = document.getElementById("error-box");
const card = document.querySelector(".card");

// Reuse a single Audio instance so cries don't overlap
const cryAudio = new Audio();
cryAudio.volume = 0.5;

// Shiny odds — change this to taste (e.g. 1/50 for "special", 1/4096 for real-game)
const SHINY_CHANCE = 1 / 50;

let currentCryUrl = "";
let shinyCount = 0;

// Helper: turn "solar-power" into "Solar Power"
function formatName(str) {
    return str
        .split("-")
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
}

async function fetchPokemon() {
    pokemonBtn.disabled = true;
    pokemonBtn.innerText = "Catching Pokémon...";
    errorBox.innerText = "";
    cryBtn.disabled = true;

    try {
        // Step 1: Get the full list of Pokémon names + URLs
        const listResponse = await fetch("https://pokeapi.co/api/v2/pokemon/?limit=1351");
        if (!listResponse.ok) {
            throw new Error(`HTTP ERROR! Status: ${listResponse.status}`);
        }
        const listData = await listResponse.json();

        // Pick a random Pokémon from the list
        const randomIndex = Math.floor(Math.random() * listData.results.length);
        const randomPokemon = listData.results[randomIndex];

        // Step 2: Fetch that specific Pokémon's full details
        const detailResponse = await fetch(randomPokemon.url);
        if (!detailResponse.ok) {
            throw new Error(`HTTP ERROR! Status: ${detailResponse.status}`);
        }
        const data = await detailResponse.json();

        // Roll for shiny
        const isShiny = Math.random() < SHINY_CHANCE;

        // Pick the right sprite
        const artwork = data.sprites.other["official-artwork"];
        pokemonImg.src = isShiny
            ? artwork.front_shiny || artwork.front_default
            : artwork.front_default;

        // Basic info
        pokemonName.innerText = data.name.toUpperCase();
        pokemonId.innerText = `#${String(data.id).padStart(3, "0")}`;

        // Shiny badge + card glow
        pokemonShiny.hidden = !isShiny;
        card.classList.toggle("is-shiny", isShiny);

        // Shiny counter
        if (isShiny) {
            shinyCount++;
            shinyCountEl.innerText = `✨ Shinies caught: ${shinyCount}`;
        }

        // Type
        pokemonType.innerText = data.types.map(t => formatName(t.type.name)).join(", ");

        // Abilities (hidden ones marked)
        pokemonAbilities.innerText = data.abilities
            .map(a => {
                const name = formatName(a.ability.name);
                return a.is_hidden ? `${name} (hidden)` : name;
            })
            .join(", ");

        // Height / Weight
        pokemonHeight.innerText = `${data.height / 10} m`;
        pokemonWeight.innerText = `${data.weight / 10} kg`;

        // Cry
        currentCryUrl = data.cries?.latest || data.cries?.legacy || "";
        cryBtn.disabled = !currentCryUrl;

    } catch (error) {
        console.error("Fetch Failed: ", error);

        // Reset DOM
        pokemonImg.src = "";
        pokemonName.innerText = "";
        pokemonId.innerText = "";
        pokemonType.innerText = "";
        pokemonAbilities.innerText = "";
        pokemonHeight.innerText = "";
        pokemonWeight.innerText = "";
        pokemonShiny.hidden = true;
        card.classList.remove("is-shiny");

        // Reset cry
        currentCryUrl = "";
        cryBtn.disabled = true;

        errorBox.innerText = "Network Error. Please check your connection and try again!";

    } finally {
        pokemonBtn.disabled = false;
        pokemonBtn.innerText = "Catch New Pokémon";
    }
}

function playCry() {
    if (!currentCryUrl) return;

    cryAudio.src = currentCryUrl;
    cryAudio.currentTime = 0; // restart from the beginning if clicked again
    cryAudio.play().catch(err => console.error("Could not play cry:", err));
}

pokemonBtn.addEventListener("click", fetchPokemon);
cryBtn.addEventListener("click", playCry);

// Fetch a Pokémon on initial page load
fetchPokemon();