export const PathEngine={
  get MONTHS(){return window.ASCENDProgression?.MONTHS||[]},
  async current(options={}){return window.ASCENDProgression?.current?.(options)||{month:1}},
  async refresh(){return this.current({fresh:true})},
  async paint(){return window.ASCENDMonthPath?.paint?.({fresh:true})}
};
