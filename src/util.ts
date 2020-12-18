// Regex that fixes unicode.
const unicodeRegex = /\\u([\d\w]{4})/gi;

/**
 * Fixes unicode numbers in an input string.
 * 
 * @param input the input string
 * @returns the string with cleaned unicode characters
 */
export function fixUnicode(input: string): string {
    return input.replace(unicodeRegex, function (match, grp) {
        return String.fromCharCode(parseInt(grp, 16)); 
    });
}