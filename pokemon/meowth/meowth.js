document.addEventListener('DOMContentLoaded', async () => {
  const container = document.getElementById('pokemon-info');

  const [pokemonData, speciesData] = await Promise.all([
    fetch(`https://pokeapi.co/api/v2/pokemon/${pokemonId}`).then(r => r.json()),
    fetch(`https://pokeapi.co/api/v2/pokemon-species/${pokemonId}`).then(r => r.json())
  ]);

  const name = pokemonData.name.toUpperCase();
  const types = pokemonData.types.map(t => t.type.name).join(', ');
  const img = pokemonData.sprites.other['official-artwork'].front_default;
  const shiny = pokemonData.sprites.other['official-artwork'].front_shiny;
  const flavor = speciesData.flavor_text_entries.find(e => e.language.name === 'es')?.flavor_text || 'Sin descripción.';

  // Aquí puedes luego agregar variantes Galar, Hisui, etc. si las tienes

  container.innerHTML = `
    <h2>#${pokemonId} ${name}</h2>
    <p><strong>Tipo:</strong> ${types}</p>
    <p><strong>Descripción:</strong> ${flavor}</p>
    <div style="display:flex; gap:20px; flex-wrap:wrap;">
      <div>
        <p><strong>Normal</strong></p>
        <img src="${img}" alt="${name} normal" style="max-width:150px;">
      </div>
      <div>
        <p><strong>Shiny</strong></p>
        <img src="${shiny}" alt="${name} shiny" style="max-width:150px;">
      </div>
    </div>
  `;
});
