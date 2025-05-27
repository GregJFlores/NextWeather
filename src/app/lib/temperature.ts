export const convertToCelsius = (temp: number) => {
    return Math.round((temp - 32) * (5 / 9));
};
