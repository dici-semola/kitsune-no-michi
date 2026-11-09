// Mezzi di trasporto. `maps` = tipi di mappa in cui sono utilizzabili. Sbloccati dal flag `mount:<id>`.
export const MOUNTS = {
  horse: { n: 'Cavallo', speed: 1.7, maps: ['outdoor', 'highland'], col: '#7a4a28' },
  eagle: { n: 'Aquila Magica', speed: 2.1, flying: true, maps: ['outdoor', 'highland', 'parallel'], col: '#d8b060' },
  dolphin: { n: 'Delfino', speed: 1.9, water: true, maps: ['outdoor'], col: '#6a9ac8' },
  hoverbike: { n: 'Hoverbike Neon', speed: 2.5, maps: ['outdoor', 'highland', 'cyber', 'parallel'], col: '#ff3fa4' },
};
