---

# Block Websites - Tampermonkey Script

### Overview
The **Block Websites** Tampermonkey script is designed to help users block unwanted websites directly from their browsers. This tool is especially useful for maintaining productivity, preventing access to distracting or harmful websites, and customizing your browsing experience.

### Key Features
- **Dynamic Blocking Modal**: Easily add or remove websites from the block list through a user-friendly modal interface.
- **Live Blocked Sites List**: View and manage the list of blocked sites in real-time, ensuring you always have the latest information.
- **Real-time Updates**: Changes to the block list are immediately reflected across all open tabs, providing a seamless experience.
- **Customizable Blocking**: The script uses both exact URL matching and regex patterns to block sites, giving you flexibility in how you define blocked content.
- **Easy Activation**: Quickly open the blocking modal with a simple keyboard shortcut (`Ctrl` + `Space`), making it easy to manage your block list on the go.

### How It Works
1. **Installation**: Add the script to your Tampermonkey extension.
2. **Activation**: Press `Ctrl` + `Space` to open the blocking modal.
3. **Blocking a Site**: Enter the URL of the site you wish to block and click the "`Block`" button. The site will be immediately added to the block list and access will be restricted.
4. **Unblocking a Site**: Enter the URL of the site you wish to unblock and click the "`Unblock`" button. The site will be removed from the block list and access will be restored.
5. **View Blocked Sites**: The modal includes a dynamic list of all currently blocked sites, allowing you to easily manage and review your block list.

### Technical Details
- **UUID Generation**: Each button and input field in the modal is uniquely identified using UUIDs to prevent conflicts and ensure smooth operation.
- **Local Storage**: Blocked sites are stored locally using `GM_setValue` and `GM_getValue`, ensuring persistence across sessions.
- **Real-time Synchronization**: The script dynamically fetches and updates the list of blocked sites, ensuring consistency across multiple tabs.

### Compatibility
- The script is compatible with all major browsers that support the Tampermonkey extension, including Chrome, Firefox, Safari, and Edge.

### Miscellaneous:

![release](https://img.shields.io/github/v/release/overlord-303/BlockWebsitesTampermonkey?display_name=release&style=flat&logo=artifacthub&logoColor=%23000000&label=Latest%20Release%3A&labelColor=%23ffffff) ![license](https://img.shields.io/github/license/overlord-303/BlockWebsitesTampermonkey?style=flat&logo=bookstack&logoColor=%23000000&label=License%3A&labelColor=%23ffffff&color=%23ff0000) ![activity](https://img.shields.io/github/commit-activity/y/overlord-303/BlockWebsitesTampermonkey?style=flat&logo=Github&logoColor=%23000000&label=Commit%20Activity%3A&labelColor=%23ffffff&color=%23000000)
---
