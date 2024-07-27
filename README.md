# SEB Bypass

### Description
The Chrome extension "SEB Bypass" allows you to bypass the execution of quizzes in Safe Exam Browser (SEB).

### Installation

You have **two options** to install the extension:

1. **Download a built version from releases:**
   - Go to the [releases](https://github.com/cycyrild/SebBypass/releases) page.
   - Download the latest release.

    **Unzip the downloaded file:**
   - Extract the contents of the downloaded file. You should see a folder with a subfolder named `dist`.

    **Load the extension in Chrome:**
   - Open the Chrome browser and navigate to `chrome://extensions/`.
   - Enable "Developer mode" by toggling the switch in the top-right corner.
   - Click on "Load unpacked" and select the `dist` directory which contains the `manifest.json` file.


2. **Build from source:**
   - Clone the repository:
     ```sh
     git clone https://github.com/cycyrild/SebBypass.git
     cd SebBypass
     ```
   - Install the dependencies:
     ```sh
     npm install
     ```
   - Compile the project:
     ```sh
     npm run build
     ```
   - Load the extension in Chrome:
     - Open the Chrome browser and navigate to `chrome://extensions/`.
     - Enable "Developer mode" by toggling the switch in the top-right corner.
     - Click on "Load unpacked" and select the directory where the extension files are located (`dist` folder).



    ### Usage

    To use the "SEB Bypass" Chrome extension, follow these steps:

    1. Click on the extension icon to open the SEB Bypass interface.
    2. In the interface, locate the option to upload your SEB configuration file.
    3. Click on the "Choose File" button and select your SEB configuration file from your computer.
    4. Once the file is uploaded, the extension will bypass the execution of quizzes in Safe Exam Browser (SEB) and allow you to take the Moodle quiz directly in your current browser.

    That's it! You can now enjoy taking quizzes without the need to go through SEB's secure environment.
