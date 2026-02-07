# LLM Grabber

A simple Windows app that utilizes LLM to grab text from screen and translate it.

## Install

[Download for Windows](https://github.com/LAWArthur/llm-grabber/releases/latest)

## Usage

The first time you launch this app, you will be asked to fill in necessary API keys. The app will lie silently in the system tray afterwards.

The app has two use cases. 

The most obvious one is to grab & translate through OCR. Just move your cursor above the word to translate and press the corresponding shortcut(default `Ctrl+Alt+X`), and translation will pop up in a minute(literally...A better LLM service will significantly reduce the round-trip time). 

The other use case is to select a piece of text, and press a shortcut(default `Ctrl+Alt+C`) to translate it. This use case has limitations that the text must be copyable, which is sometimes prohibited by certain softwares and websites. 

If you don't set up the OCR API, only the second use case is available. 

## Build and Development

```bash
$ npm install
$ npx electron-rebuild -f -w robotjs # essential because prebuilt robotjs is TOO OLD to work with new versions of Node.js
```

### Development

```bash
$ npm run dev
```

### Build

```bash
# For windows
$ npm run build:win

# For macOS
$ npm run build:mac

# For Linux
$ npm run build:linux
```

## Comments on OCR

The reason why I have chosen and implemented only Baidu OCR is that it offers free-of-charge OCR service of high multilingual and mix-lingual recognition accuracy in relatively large amounts(500/month). Most other OCR services, unfortunately, can't meet the accuracy requirement of universal translation. 