export async function RandN() {
    const min = 10000000000; // Минимальное 11-значное число
    const max = 99999999999; // Максимальное 11-значное число

    return Math.floor(Math.random() * (max - min + 1)) + min;
}
