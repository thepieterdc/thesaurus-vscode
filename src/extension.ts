import { commands, ExtensionContext } from "vscode";
import { findSynonyms } from "./commands/findSynonyms";

export function activate(context: ExtensionContext) {
    // Command: Find synonyms.
    const findSynonymsCommand = commands.registerCommand(
        "thesaurus.find",
        findSynonyms,
    );

    // Register all commands.
    context.subscriptions.push(
        findSynonymsCommand,
    );
}