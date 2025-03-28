export function calculateFontSize(text: string) {
    let textLength = String(text).length
    let fontSize = 2

    fontSize -= Math.min(textLength - 20, 50) / 100

    return fontSize
}