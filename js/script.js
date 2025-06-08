// -----------------------------------
// CONSTANTES Y VARIABLES GLOBALES
// -----------------------------------
const generationFilters = document.getElementById('generation-filters');
const typeFilters = document.getElementById('type-filters');
const pokemonContainer = document.getElementById('pokemon-container');
const searchInput = document.getElementById('search-input');
const searchBtn = document.getElementById('search-btn');
const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');
const pageIndicator = document.getElementById('page-indicator');
const resetFiltersBtn = document.getElementById('reset-filters');

const modal = document.getElementById('pokemonModal');
const closeBtn = modal.querySelector('.close-button');
const modalName = document.getElementById('modalName');
const modalType = document.getElementById('modalType');
const modalImage = document.getElementById('modalImage');
const modalShiny = document.getElementById('modalShiny');
const modalDescription = document.getElementById('modalDescription');
const formsSelect = document.getElementById('formsSelect');

const typeColors = {
  normal: '#A8A77A', fire: '#EE8130', water: '#6390F0', electric: '#F7D02C',
  grass: '#7AC74C', ice: '#96D9D6', fighting: '#C22E28', poison: '#A33EA1',
  ground: '#E2BF65', flying: '#A98FF3', psychic: '#F95587', bug: '#A6B91A',
  rock: '#B6A136', ghost: '#735797', dragon: '#6F35FC', dark: '#705746',
  steel: '#B7B7CE', fairy: '#D685AD'
};

// Generaciones y sus rangos de IDs (según PokéAPI)
const generations = [
  { id: 1, name: 'Generación 1', start: 1, end: 151 },
  { id: 2, name: 'Generación 2', start: 152, end: 251 },
  { id: 3, name: 'Generación 3', start: 252, end: 386 },
  { id: 4, name: 'Generación 4', start: 387, end: 493 },
  { id: 5, name: 'Generación 5', start: 494, end: 649 },
  { id: 6, name: 'Generación 6', start: 650, end: 721 },
  { id: 7, name: 'Generación 7', start: 722, end: 809 },
  { id: 8, name: 'Generación 8', start: 810, end: 905 },
  { id: 9, name: 'Generación 9', start: 906, end: 1010 }
];

// Tipos en español con su color (para botones)
const typesES = {
  normal: 'Normal', fire: 'Fuego', water: 'Agua', electric: 'Eléctrico',
  grass: 'Planta', ice: 'Hielo', fighting: 'Lucha', poison: 'Veneno',
  ground: 'Tierra', flying: 'Volador', psychic: 'Psíquico', bug: 'Bicho',
  rock: 'Roca', ghost: 'Fantasma', dragon: 'Dragón', dark: 'Siniestro',
  steel: 'Acero', fairy: 'Hada'
};

// Estado
let currentGeneration = 1;
let currentTypeFilter = null;
let currentSearch = '';
let currentPage = 1;
const pokemonsPerPage = 100; // 100 por generación

let allPokemons = []; // Para guardar datos básicos de la generación actual

// -----------------------------------
// FUNCIONES UTILES
// -----------------------------------
function capitalize(s) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function clearChildren(element) {
  while (element.firstChild) {
    element.removeChild(element.firstChild);
  }
}

// -----------------------------------
// CREAR BOTONES DE GENERACIONES Y TIPOS
// -----------------------------------
function createGenerationButtons() {
  clearChildren(generationFilters);
  generations.forEach(gen => {
    const btn = document.createElement('button');
    btn.textContent = gen.name;
    btn.style.backgroundColor = `hsl(${(gen.id - 1) * 40}, 70%, 60%)`;
    btn.style.color = 'white';
    btn.style.border = 'none';
    btn.style.margin = '3px';
    btn.style.padding = '8px 12px';
    btn.style.borderRadius = '8px';
    btn.style.cursor = 'pointer';
    if (gen.id === currentGeneration) {
      btn.style.filter = 'brightness(85%)';
    }
    btn.onclick = () => {
      currentGeneration = gen.id;
      currentPage = 1;
      loadPokemonsForGeneration();
      createGenerationButtons();
    };
    generationFilters.appendChild(btn);
  });
}

function createTypeButtons() {
  clearChildren(typeFilters);
  Object.entries(typesES).forEach(([type, name]) => {
    const btn = document.createElement('button');
    btn.textContent = name;
    btn.style.backgroundColor = typeColors[type];
    btn.style.color = 'white';
    btn.style.border = 'none';
    btn.style.margin = '3px';
    btn.style.padding = '8px 12px';
    btn.style.borderRadius = '8px';
    btn.style.cursor = 'pointer';
    if (currentTypeFilter === type) {
      btn.style.filter = 'brightness(85%)';
    }
    btn.onclick = () => {
      if (currentTypeFilter === type) {
        currentTypeFilter = null; // deseleccionar
      } else {
        currentTypeFilter = type;
      }
      currentPage = 1;
      displayPokemons();
      createTypeButtons();
    };
    typeFilters.appendChild(btn);
  });
}

// -----------------------------------
// CARGAR POKEMONS DE UNA GENERACIÓN
// -----------------------------------
async function loadPokemonsForGeneration() {
  const gen = generations.find(g => g.id === currentGeneration);
  if (!gen) return;

  allPokemons = [];
  pokemonContainer.innerHTML = `<p style="color:white; text-align:center;">Cargando Pokémon...</p>`;

  try {
    // Cargar datos básicos (nombre, url) de pokemons en ese rango
    const promises = [];
    for (let id = gen.start; id <= gen.end; id++) {
      promises.push(fetch(`https://pokeapi.co/api/v2/pokemon/${id}`).then(res => res.json()));
    }
    allPokemons = await Promise.all(promises);

    currentPage = 1;
    displayPokemons();
  } catch (err) {
    console.error(err);
    pokemonContainer.innerHTML = `<p style="color:red; text-align:center;">Error al cargar los Pokémon.</p>`;
  }
}

// -----------------------------------
// FILTRAR Y MOSTRAR POKEMONS
// -----------------------------------
function displayPokemons() {
  clearChildren(pokemonContainer);

  let filtered = allPokemons;

  // Filtro por tipo
  if (currentTypeFilter) {
    filtered = filtered.filter(poke =>
      poke.types.some(t => t.type.name === currentTypeFilter)
    );
  }

  // Filtro por búsqueda (nombre o id)
  if (currentSearch.trim() !== '') {
    const term = currentSearch.toLowerCase();
    filtered = filtered.filter(poke =>
      poke.name.toLowerCase().includes(term) ||
      poke.id.toString() === term
    );
  }

  // Paginación interna (100 por página, pero aquí siempre 100 porque limitamos gen)
  const start = (currentPage - 1) * pokemonsPerPage;
  const end = start + pokemonsPerPage;
  const pagePokemons = filtered.slice(start, end);

  if (pagePokemons.length === 0) {
    pokemonContainer.innerHTML = `<p style="color:#ddd; text-align:center;">No se encontraron Pokémon con esos filtros.</p>`;
    pageIndicator.textContent = 'Página 0';
    return;
  }

  pagePokemons.forEach(poke => {
    const card = document.createElement('div');
    card.className = 'pokemon-card';
    card.style.background = `linear-gradient(135deg, ${typeColors[poke.types[0].type.name]}55, #222)`;
    card.style.borderRadius = '12px';
    card.style.color = 'white';
    card.style.padding = '10px';
    card.style.margin = '8px';
    card.style.width = '130px';
    card.style.cursor = 'pointer';
    card.style.textAlign = 'center';
    card.style.userSelect = 'none';

    const img = document.createElement('img');
    img.src = poke.sprites.front_default || '';
    img.alt = poke.name;
    img.style.width = '96px';
    img.style.height = '96px';
    img.style.imageRendering = 'pixelated';

    const name = document.createElement('h4');
    name.textContent = capitalize(poke.name);

    const idSpan = document.createElement('span');
    idSpan.textContent = `#${poke.id.toString().padStart(3, '0')}`;
    idSpan.style.fontSize = '0.9em';
    idSpan.style.color = '#ccc';

    const typesDiv = document.createElement('div');
    typesDiv.style.marginTop = '6px';
    poke.types.forEach(t => {
      const typeSpan = document.createElement('span');
      typeSpan.textContent = typesES[t.type.name] || capitalize(t.type.name);
      typeSpan.style.backgroundColor = typeColors[t.type.name];
      typeSpan.style.color = 'white';
      typeSpan.style.borderRadius = '8px';
      typeSpan.style.padding = '2px 6px';
      typeSpan.style.margin = '0 4px';
      typeSpan.style.fontSize = '0.8em';
      typesDiv.appendChild(typeSpan);
    });

    card.appendChild(img);
    card.appendChild(name);
    card.appendChild(idSpan);
    card.appendChild(typesDiv);

    card.addEventListener('click', () => openPokemonModal(poke.name));

    pokemonContainer.appendChild(card);
  });

  pageIndicator.textContent = `Página ${currentPage} / ${Math.ceil(filtered.length / pokemonsPerPage)}`;

  // Botones de paginación
  prevBtn.disabled = currentPage === 1;
  nextBtn.disabled = currentPage >= Math.ceil(filtered.length / pokemonsPerPage);
}

// -----------------------------------
// MODAL: FUNCIONES DE ABRIR Y CERRAR
// -----------------------------------
closeBtn.addEventListener('click', () => {
  modal.classList.add('hidden');
});
window.addEventListener('click', (event) => {
  if (event.target === modal) {
    modal.classList.add('hidden');
  }
});

// Mostrar sprites normales y shiny
function showSprites(poke) {
  modalImage.src = poke.sprites.front_default || '';
  modalShiny.src = poke.sprites.front_shiny || '';
  modalImage.alt = `${capitalize(poke.name)} Normal`;
  modalShiny.alt = `${capitalize(poke.name)} Shiny`;
}

// Abrir modal con Pokémon y sus formas alternativas
async function openPokemonModal(pokemonNameOrId) {
  try {
    const pokemonRes = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemonNameOrId}`);
    const pokemonData = await pokemonRes.json();

    const speciesRes = await fetch(pokemonData.species.url);
    const speciesData = await speciesRes.json();

    // Nombre
    modalName.textContent = capitalize(pokemonData.name);

    // Tipos
    modalType.innerHTML = '';
    pokemonData.types.forEach(t => {
      const typeSpan = document.createElement('span');
      typeSpan.textContent = typesES[t.type.name] || capitalize(t.type.name);
      typeSpan.style.backgroundColor = typeColors[t.type.name];
      typeSpan.style.color = 'white';
      typeSpan.style.borderRadius = '10px';
      typeSpan.style.padding = '5px 10px';
      typeSpan.style.marginRight = '8px';
      modalType.appendChild(typeSpan);
    });

    // Mostrar sprites normal y shiny
    showSprites(pokemonData);

    // Descripción en español del pokédex
    const flavorEntry = speciesData.flavor_text_entries.find(entry => entry.language.name === 'es');
    modalDescription.textContent = flavorEntry ? flavorEntry.flavor_text.replace(/\n|\f/g, ' ') : 'Descripción no disponible.';

    // Cargar formas alternativas (variedades)
    formsSelect.innerHTML = '';
    speciesData.varieties.forEach(variety => {
      const option = document.createElement('option');
      option.value = variety.pokemon.name;
      option.textContent = capitalize(variety.pokemon.name);
      formsSelect.appendChild(option);
    });

    formsSelect.value = pokemonData.name;

    formsSelect.onchange = async () => {
      const selectedName = formsSelect.value;
      if (selectedName !== pokemonData.name) {
        openPokemonModal(selectedName); // recargar modal con forma elegida
      }
    };

    modal.classList.remove('hidden');
  } catch (err) {
    console.error(err);
    alert('Error al cargar datos del Pokémon.');
  }
}

// -----------------------------------
// EVENTOS DE BUSQUEDA Y PAGINACION
// -----------------------------------
searchBtn.addEventListener('click', () => {
  currentSearch = searchInput.value.trim();
  currentPage = 1;
  displayPokemons();
});

searchInput.addEventListener('keyup', (e) => {
  if (e.key === 'Enter') {
    currentSearch = searchInput.value.trim();
    currentPage = 1;
    displayPokemons();
  }
});

prevBtn.addEventListener('click', () => {
  if (currentPage > 1) {
    currentPage--;
    displayPokemons();
  }
});

nextBtn.addEventListener('click', () => {
  currentPage++;
  displayPokemons();
});

resetFiltersBtn.addEventListener('click', () => {
  currentTypeFilter = null;
  currentSearch = '';
  searchInput.value = '';
  currentPage = 1;
  createTypeButtons();
  displayPokemons();
});

// -----------------------------------
// INICIO
// -----------------------------------
function init() {
  createGenerationButtons();
  createTypeButtons();
  loadPokemonsForGeneration();
}

init();
// script.js

let allPokemon = [];
let customPokemon = [];

// 🚀 Cargar Pokémon desde PokéAPI y JSON personalizado
async function fetchAllPokemon() {
  try {
    // 1. Obtener Pokémon desde la PokéAPI (hasta #1010)
    const response = await fetch('https://pokeapi.co/api/v2/pokemon?limit=1010');
    const data = await response.json();
    const basicInfo = data.results;

    // 2. Obtener detalles de cada Pokémon (puedes optimizar usando promesas limitadas)
    const pokemonDetails = await Promise.all(
      basicInfo.map(p => fetch(p.url).then(res => res.json()))
    );

    // 3. Cargar Pokémon personalizados del 1011 al 1025
    const customData = await fetch('data/custom_pokemon.json');
    customPokemon = await customData.json();

    // 4. Fusionar ambas listas
    allPokemon = [...pokemonDetails, ...customPokemon];

    renderPokemonList(allPokemon);
  } catch (error) {
    console.error('Error cargando los Pokémon:', error);
  }
}

// 🔁 Renderizar Pokémon en pantalla (adaptar a tu diseño actual)
function renderPokemonList(pokemonList) {
  const container = document.getElementById('pokemon-container');
  container.innerHTML = "";

  pokemonList.forEach(pokemon => {
    const card = document.createElement('div');
    card.classList.add('pokemon-card');

    card.innerHTML = `
      <h3>#${pokemon.id} ${capitalize(pokemon.name)}</h3>
      <img src="${pokemon.sprites?.front_default || pokemon.image}" alt="${pokemon.name}">
      <div class="types">
        ${(pokemon.types || pokemon.type || []).map(t =>
          `<span class="type ${t.type?.name || t}">${t.type?.name || t}</span>`
        ).join('')}
      </div>
    `;

    // Agregar evento para modal
    card.addEventListener('click', () => showPokemonModal(pokemon));

    container.appendChild(card);
  });
}

// 🔍 Mostrar el modal con info detallada (normal + shiny + variantes)
function showPokemonModal(pokemon) {
  const modal = document.getElementById("pokemonModal");
  const name = document.getElementById("modalName");
  const type = document.getElementById("modalType");
  const img = document.getElementById("modalImage");
  const shiny = document.getElementById("modalShiny");
  const desc = document.getElementById("modalDescription");

  name.textContent = `#${pokemon.id} ${capitalize(pokemon.name)}`;
  type.textContent = (pokemon.types || pokemon.type || []).map(t => t.type?.name || t).join(", ");
  img.src = pokemon.sprites?.front_default || pokemon.image;
  shiny.src = pokemon.sprites?.front_shiny || pokemon.shiny || "";

  // Descripción
  desc.textContent = pokemon.description || "Descripción no disponible.";

  // Mostrar modal
  modal.style.display = "flex";

  document.getElementById("closeModal").onclick = () => {
    modal.style.display = "none";
  };
}

// 👆 Capitalizar nombres
function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// 🏁 Ejecutar
fetchAllPokemon();
