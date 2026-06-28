// Escala de z-index de la app — ver US-824 / DEC-904 en src/docs/sprints/sprint-9/decisions.md
export const Z = {
  mapBase: 0,
  mapPins: 10,
  mapOverlay: 15,
  sidebar: 20,
  header: 30,
  modal: 100,
} as const
