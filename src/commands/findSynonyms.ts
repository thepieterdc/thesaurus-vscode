import { Selection, TextEditor, window } from "vscode";
import got from "got";
import { fixUnicode } from "./../util";
import { Synonym, ThesaurusResponse } from "../types";

// Initialise a HTTP client.
const client = got.extend({
    headers: {
        Accept: "text/html"
    },
    prefixUrl: "https://www.thesaurus.com/browse/",
    responseType: "text"
});

// Initialise a regex to replace undefined by quoted strings.
const undefinedRegex = /: *undefined *,/;

/**
 * Clears the selected text.
 * 
 * @param editor editor instance
 */
function clearSelection(editor: TextEditor): void {
    const position = editor.selection.end;
    editor.selection = new Selection(position, position);
}

/**
 * Action to find synonyms on Thesaurus.com.
 */
export async function findSynonyms(): Promise<void> {
    // Get an editor.
    const editor = window.activeTextEditor;
    if (!editor) return;

    // Get the current selected word range.
    const range = editor.document.getWordRangeAtPosition(editor.selection.start);
    if (!range) return;

    // Get the current selected word.
    const highlighted = editor.document.getText(range);

    // Send a request to the Thesaurus.com API.
    const resp = (await client.get(highlighted)).body;

    // Find the list of synonyms.
    const startJson = resp.split("window.INITIAL_STATE = ")[1];
    const endJson = startJson.split(";</script>")[0];
    const response = fixUnicode(endJson).replace(undefinedRegex, ': "undefined",');
    const data = JSON.parse(response) as ThesaurusResponse;
    const synonyms = data.searchData.relatedWordsApiData.data
        // Find synonyms.
        .flatMap(d => d.synonyms)
        // Map the synonyms to term and similarity.
        .map(s => ({term: s.term, similarity: parseInt(s.similarity.toString())} as Synonym));

    // Remove the search term itself, as well as duplicates from the suggestions.
    const suggestions = synonyms
        .filter((s, idx) => s.term !== highlighted && synonyms.findIndex(s2 => s2.term === s.term) === idx)
        // Sort the suggestions by similarity.
        .sort((a, b) => b.similarity - a.similarity)
        // Map the suggestions to strings.
        .map(s => `${s.term} (${s.similarity}% similar)`);

    // Show the synonyms in a modal.
    window.showQuickPick(suggestions, {canPickMany: false}).then(choice => {
        // User aborted.
        if (!choice) return;

        // Convert the choice back to the actual term.
        const choiceTerm = choice.substring(0, choice.indexOf("(") - 1);

        // Replace the word in the text.
        editor.edit(builder => builder.replace(range, choiceTerm))
            // Clear the selection.
            .then(() => clearSelection(editor));
    });
}
