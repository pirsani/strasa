export const getDarkerTailwindColor = (colorClass: string): string => {
  const parts = colorClass.split("-");
  const colorValue = parseInt(parts[parts.length - 1], 10);

  if (isNaN(colorValue)) {
    return colorClass; // Return the original class if the value is not a number
  }

  const newColorValue = colorValue + 100;
  parts[parts.length - 1] = newColorValue.toString();

  return parts.join("-");
};
