const pokemonImg = document.getElementById("pokemon-Img");
const pokemonName = document.getElementById("pokemon-Name");
const pokemonId = document.getElementById("pokemon-Id");
const pokemonType = document.getElementById("pokemon-Type");
const pokemonAbilities = document.getElementById("pokemon-Abilities");
const pokemonHeight = document.getElementById("pokemon-Height");
const pokemonWeight = document.getElementById("pokemon-Weight");
const pokemonBtn = document.getElementById("pokemon-btn");
const cryBtn = document.getElementById("cry-btn");
const errorBox = document.getElementById("error-box");


const cryAudio = new Audio();
cryAudio.volume = 0.5;

let currentCryUrl = "";

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

        // Update DOM
        pokemonImg.src = data.sprites.other["official-artwork"].front_default
                      || data.sprites.front_default;
        pokemonName.innerText = data.name.toUpperCase();
        pokemonId.innerText = `#${String(data.id).padStart(3, "0")}`;
        pokemonType.innerText = data.types.map(t => formatName(t.type.name)).join(", ");

        pokemonAbilities.innerText = data.abilities
            .map(a => {
                const name = formatName(a.ability.name);
                return a.is_hidden ? `${name} (hidden)` : name;
            })
            .join(", ");

        pokemonHeight.innerText = `${data.height / 10} m`;
        pokemonWeight.innerText = `${data.weight / 10} kg`;

        // Handle cry
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
    cryAudio.currentTime = 0;
    cryAudio.play().catch(err => console.error("Could not play cry:", err));
}

pokemonBtn.addEventListener("click", fetchPokemon);
cryBtn.addEventListener("click", playCry);

// Fetch a Pokémon on initial page load
fetchPokemon();