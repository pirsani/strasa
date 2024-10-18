const isDateLte = (d1: Date | string, d2: Date | string) => {
  // Convert to date and compare
  return new Date(d1) <= new Date(d2);
};

export default isDateLte;
