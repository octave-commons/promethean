'use strict';

var obsidian = require('obsidian');

/******************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */

function __awaiter(thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
}

typeof SuppressedError === "function" ? SuppressedError : function (error, suppressed, message) {
    var e = new Error(message);
    return e.name = "SuppressedError", e.error = error, e.suppressed = suppressed, e;
};

const DEFAULT_SETTINGS = {
    statusPropertyName: 'status',
    showNotifications: false,
    debugMode: false // Default to false for better performance
};
class KanbanStatusUpdaterPlugin extends obsidian.Plugin {
    constructor() {
        super(...arguments);
        // Track active observers to disconnect them when not needed
        this.currentObserver = null;
        this.isProcessing = false;
        this.activeKanbanBoard = null;
    }
    onload() {
        return __awaiter(this, void 0, void 0, function* () {
            console.log('Loading Kanban Status Updater plugin');
            // Load settings
            yield this.loadSettings();
            // Display startup notification
            if (this.settings.showNotifications) {
                new obsidian.Notice('Kanban Status Updater activated');
            }
            this.log('Plugin loaded');
            // Register DOM event listener for drag events - but only process if active leaf is Kanban
            this.registerDomEvent(document, 'dragend', this.onDragEnd.bind(this));
            this.log('Registered drag event listener');
            // Watch for active leaf changes to only observe the current Kanban board
            this.registerEvent(this.app.workspace.on('active-leaf-change', this.onActiveLeafChange.bind(this)));
            // Initial check for active Kanban board
            this.app.workspace.onLayoutReady(() => {
                this.checkForActiveKanbanBoard();
            });
            // Add settings tab
            this.addSettingTab(new KanbanStatusUpdaterSettingTab(this.app, this));
        });
    }
    onunload() {
        // Disconnect any active observers to prevent memory leaks
        this.disconnectObservers();
        this.log('Plugin unloaded');
    }
    loadSettings() {
        return __awaiter(this, void 0, void 0, function* () {
            this.settings = Object.assign({}, DEFAULT_SETTINGS, yield this.loadData());
        });
    }
    saveSettings() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.saveData(this.settings);
        });
    }
    // Log helper with debug mode check
    log(message) {
        if (this.settings.debugMode) {
            console.log(`[KSU] ${message}`);
        }
    }
    // Clean up observers when switching away from a Kanban board
    disconnectObservers() {
        if (this.currentObserver) {
            this.log('Disconnecting observer for performance');
            this.currentObserver.disconnect();
            this.currentObserver = null;
        }
        this.activeKanbanBoard = null;
    }
    // Check if the active leaf is a Kanban board
    onActiveLeafChange(leaf) {
        this.checkForActiveKanbanBoard();
    }
    checkForActiveKanbanBoard() {
        var _a;
        // First disconnect any existing observers
        this.disconnectObservers();
        // Get the active leaf using the non-deprecated API
        const activeLeaf = this.app.workspace.getLeaf(false);
        if (!activeLeaf)
            return;
        try {
            // Find the content element safely
            let contentEl = null;
            // Use type assertions to avoid TypeScript errors
            if (activeLeaf.view) {
                // Try to access the contentEl property using type assertion
                contentEl = activeLeaf.view.contentEl || null;
            }
            // If that didn't work, try another approach
            if (!contentEl) {
                // Try to get the Kanban board directly from the DOM
                // Leaf containers have 'view-content' elements that contain the actual view
                const viewContent = (_a = activeLeaf.containerEl) === null || _a === void 0 ? void 0 : _a.querySelector('.view-content');
                if (viewContent) {
                    contentEl = viewContent;
                }
                else {
                    // Last resort - look for Kanban boards anywhere in the workspace
                    contentEl = document.querySelector('.workspace-leaf.mod-active .view-content');
                }
            }
            if (!contentEl) {
                this.log('Could not access content element for active leaf');
                return;
            }
            // Check if this is a Kanban board
            const kanbanBoard = contentEl.querySelector('.kanban-plugin__board');
            if (kanbanBoard) {
                this.log('Found active Kanban board, setting up observer');
                // Store reference to active board
                this.activeKanbanBoard = kanbanBoard;
                // Set up observer only for this board
                this.setupObserverForBoard(kanbanBoard);
            }
            else {
                this.log('Active leaf is not a Kanban board');
            }
        }
        catch (error) {
            this.log(`Error detecting Kanban board: ${error.message}`);
        }
    }
    setupObserverForBoard(boardElement) {
        // Create a new observer for this specific board
        this.currentObserver = new MutationObserver((mutations) => {
            if (this.isProcessing)
                return;
            // Simple debounce to prevent rapid-fire processing
            this.isProcessing = true;
            setTimeout(() => {
                this.handleMutations(mutations);
                this.isProcessing = false;
            }, 300);
        });
        // Observe only this board with minimal options needed
        this.currentObserver.observe(boardElement, {
            childList: true,
            subtree: true,
            attributes: false // Don't need attribute changes for performance
        });
        this.log('Observer set up for active Kanban board');
    }
    handleMutations(mutations) {
        if (!this.activeKanbanBoard)
            return;
        try {
            const max_mutations = 10;
            // Only process a sample of mutations for performance
            const mutationsToProcess = mutations.length > max_mutations ?
                mutations.slice(0, max_mutations) : mutations;
            this.log(`Got ${mutationsToProcess.length} mutations of ${mutations.length}`);
            // Look for Kanban items in mutation
            let i = 0;
            for (const mutation of mutationsToProcess) {
                this.log(`Mutation #${++i} - Type: ${mutation.type}`);
                if (mutation.type === 'childList') {
                    // Check added nodes for Kanban items
                    for (const node of Array.from(mutation.addedNodes)) {
                        try {
                            // Check if node is any kind of Element (HTML or SVG)
                            if (node instanceof Element) {
                                this.log(`Processing Element of type: ${node.tagName}`);
                                // Handle the node according to its type
                                if (node instanceof HTMLElement || node instanceof HTMLDivElement) {
                                    // Direct processing for HTML elements
                                    this.log(`Found HTML element of type ${node.className}`);
                                    this.processElement(node);
                                }
                                else if (node instanceof SVGElement) {
                                    // For SVG elements, look for parent HTML element
                                    const parentElement = node.closest('.kanban-plugin__item');
                                    if (parentElement) {
                                        this.log('Found Kanban item parent of SVG element');
                                        this.processElement(parentElement);
                                    }
                                    else {
                                        // Look for any kanban items in the document that might have changed
                                        // This is for cases where the SVG update is related to a card movement
                                        const items = this.activeKanbanBoard.querySelectorAll('.kanban-plugin__item');
                                        if (items.length > 0) {
                                            // Process only the most recently modified item
                                            const recentItems = Array.from(items).slice(-1);
                                            for (const item of recentItems) {
                                                this.log('Processing recent item after SVG change');
                                                this.processElement(item);
                                            }
                                        }
                                    }
                                }
                            }
                            else if (node.nodeType === Node.TEXT_NODE) {
                                // For text nodes, check the parent element
                                const parentElement = node.parentElement;
                                if (parentElement && (parentElement.classList.contains('kanban-plugin__item-title') ||
                                    parentElement.closest('.kanban-plugin__item'))) {
                                    this.log('Found text change in Kanban item');
                                    const itemElement = parentElement.closest('.kanban-plugin__item');
                                    if (itemElement) {
                                        this.processElement(itemElement);
                                    }
                                }
                            }
                            else {
                                this.log(`Skipping node type: ${node.nodeType}`);
                            }
                        }
                        catch (nodeError) {
                            this.log(`Error processing node: ${nodeError.message}`);
                            // Continue with next node even if this one fails
                        }
                    }
                }
                else {
                    this.log('Ignoring mutation type: ' + mutation.type);
                }
            }
        }
        catch (error) {
            this.log(`Error in handleMutations: ${error.message}`);
        }
    }
    onDragEnd(event) {
        // Only process if we have an active Kanban board
        if (!this.activeKanbanBoard || this.isProcessing) {
            this.log('Drag end detected but no active Kanban board or already processing');
            this.log('activeKanbanBoard: ' + (this.activeKanbanBoard ? 'Yes' : 'No'));
            this.log('isProcessing: ' + (this.isProcessing ? 'Yes' : 'No'));
            return;
        }
        try {
            this.log('Drag end detected');
            // Set processing flag to prevent multiple processing
            this.isProcessing = true;
            const target = event.target;
            if (!target)
                return;
            this.processElement(target);
        }
        catch (error) {
            this.log(`Error in onDragEnd: ${error.message}`);
        }
        finally {
            // Reset processing flag after a delay to debounce
            setTimeout(() => {
                this.isProcessing = false;
            }, 300);
        }
    }
    processElement(element) {
        try {
            // Only process if inside our active Kanban board
            if (!this.activeKanbanBoard || !element.closest('.kanban-plugin__board')) {
                this.log('Element NOT in active Kanban board. Skipping.');
                return;
            }
            // Use different strategies to find the Kanban item
            this.log("👀 Looking for Kanban item element");
            // Check if element is a Kanban item or contains one
            const kanbanItem = element.classList.contains('kanban-plugin__item')
                ? element
                : element.querySelector('.kanban-plugin__item');
            if (kanbanItem) {
                this.log(`✅ Found Kanban item: ${kanbanItem}`);
                this.log('classList of kanbanItem: ' + kanbanItem.classList);
                this.processKanbanItem(kanbanItem);
                return;
            }
            this.log('Not a Kanban item, checking for parent');
            // If element is inside a Kanban item, find the parent
            const parentItem = element.closest('.kanban-plugin__item');
            this.log(`Parent item: ${parentItem ? parentItem : 'Not found'}`);
            if (parentItem) {
                this.processKanbanItem(parentItem);
                return;
            }
        }
        catch (error) {
            this.log(`Error in processElement: ${error.message}`);
        }
    }
    processKanbanItem(itemElement) {
        try {
            // TODO: Select the title
            const internalLink = itemElement.querySelector('.kanban-plugin__item-title .kanban-plugin__item-markdown a.internal-link');
            if (!internalLink) {
                this.log('🚫 No internal link found in item');
                return;
            }
            this.log(`Found internal link: ${internalLink.textContent}`);
            // Get the link path from data-href or href attribute
            const linkPath = internalLink.getAttribute('data-href') ||
                internalLink.getAttribute('href');
            if (!linkPath)
                return;
            this.log(`🔗 Link path: ${linkPath}`);
            // Find the lane (column) this item is in
            const lane = itemElement.closest('.kanban-plugin__lane');
            if (!lane) {
                this.log('🚫 No lane found for item');
                return;
            }
            // Get column name from the lane header
            const laneHeader = lane.querySelector('.kanban-plugin__lane-header-wrapper .kanban-plugin__lane-title');
            if (!laneHeader) {
                this.log('🚫 No laneHeader found for item');
                return;
            }
            const columnName = laneHeader.textContent.trim();
            this.log(`✅ Got lane name: ${columnName}`);
            this.log(`Processing card with link to "${linkPath}" in column "${columnName}"`);
            // Update the linked note's status
            this.updateNoteStatus(linkPath, columnName);
        }
        catch (error) {
            this.log(`Error in processKanbanItem: ${error.message}`);
        }
    }
    updateNoteStatus(notePath, status) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Find the linked file
                const file = this.app.metadataCache.getFirstLinkpathDest(notePath, '');
                if (!file) {
                    if (this.settings.showNotifications) {
                        new obsidian.Notice(`⚠️ Note "${notePath}" not found`, 3000);
                    }
                    return;
                }
                // Get current status if it exists
                const metadata = this.app.metadataCache.getFileCache(file);
                let oldStatus = null;
                if ((metadata === null || metadata === void 0 ? void 0 : metadata.frontmatter) && metadata.frontmatter[this.settings.statusPropertyName]) {
                    oldStatus = metadata.frontmatter[this.settings.statusPropertyName];
                }
                // Only update if status has changed
                if (oldStatus !== status) {
                    // Use the processFrontMatter API to update the frontmatter
                    yield this.app.fileManager.processFrontMatter(file, (frontmatter) => {
                        // Set the status property
                        frontmatter[this.settings.statusPropertyName] = status;
                    });
                    // Show notification if enabled
                    if (this.settings.showNotifications) {
                        if (oldStatus) {
                            new obsidian.Notice(`Updated ${this.settings.statusPropertyName}: "${oldStatus}" → "${status}" for ${file.basename}`, 3000);
                        }
                        else {
                            new obsidian.Notice(`Set ${this.settings.statusPropertyName}: "${status}" for ${file.basename}`, 3000);
                        }
                    }
                    this.log(`Updated status for ${file.basename} to "${status}"`);
                }
                else {
                    this.log(`Status already set to "${status}" for ${file.basename}, skipping update`);
                }
            }
            catch (error) {
                this.log(`Error updating note status: ${error.message}`);
                if (this.settings.showNotifications) {
                    new obsidian.Notice(`⚠️ Error updating status: ${error.message}`, 3000);
                }
            }
        });
    }
    // Method for the test button to use
    runTest() {
        this.log('Running test...');
        // Make sure we're using the current active board
        this.checkForActiveKanbanBoard();
        if (!this.activeKanbanBoard) {
            new obsidian.Notice('⚠️ No active Kanban board found - open a Kanban board first', 5000);
            return;
        }
        // Find items in the active board
        const items = this.activeKanbanBoard.querySelectorAll('.kanban-plugin__item');
        const count = items.length;
        new obsidian.Notice(`Found ${count} cards in active Kanban board`, 3000);
        if (count > 0) {
            // Process the first item with a link
            for (let i = 0; i < count; i++) {
                const item = items[i];
                if (item.querySelector('a.internal-link')) {
                    new obsidian.Notice(`Testing with card: "${item.textContent.substring(0, 20)}..."`, 3000);
                    this.processKanbanItem(item);
                    break;
                }
            }
        }
    }
}
class KanbanStatusUpdaterSettingTab extends obsidian.PluginSettingTab {
    constructor(app, plugin) {
        super(app, plugin);
        this.plugin = plugin;
    }
    display() {
        const { containerEl } = this;
        containerEl.empty();
        new obsidian.Setting(containerEl)
            .setName('Status property name')
            .setDesc('The name of the property to update when a card is moved')
            .addText(text => text
            .setPlaceholder('status')
            .setValue(this.plugin.settings.statusPropertyName)
            .onChange((value) => __awaiter(this, void 0, void 0, function* () {
            this.plugin.settings.statusPropertyName = value;
            yield this.plugin.saveSettings();
        })));
        new obsidian.Setting(containerEl)
            .setName('Show notifications')
            .setDesc('Show a notification when a status is updated')
            .addToggle(toggle => toggle
            .setValue(this.plugin.settings.showNotifications)
            .onChange((value) => __awaiter(this, void 0, void 0, function* () {
            this.plugin.settings.showNotifications = value;
            yield this.plugin.saveSettings();
        })));
        new obsidian.Setting(containerEl)
            .setName('Debug mode')
            .setDesc('Enable detailed logging (reduces performance)')
            .addToggle(toggle => toggle
            .setValue(this.plugin.settings.debugMode)
            .onChange((value) => __awaiter(this, void 0, void 0, function* () {
            this.plugin.settings.debugMode = value;
            yield this.plugin.saveSettings();
            if (value) {
                new obsidian.Notice('Debug mode enabled - check console for logs', 3000);
            }
            else {
                new obsidian.Notice('Debug mode disabled', 3000);
            }
        })));
        // Add a test button
        new obsidian.Setting(containerEl)
            .setName('Test plugin')
            .setDesc('Test with current Kanban board')
            .addButton(button => button
            .setButtonText('Run Test')
            .onClick(() => {
            this.plugin.runTest();
        }));
    }
}

module.exports = KanbanStatusUpdaterPlugin;


/* nosourcemap */