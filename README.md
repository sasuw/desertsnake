<!-- ABOUT THE PROJECT -->
# About Desert Snake

Desert Snake is a JavaScript/HTML 5 game. The game is currently not online.

![Desert Snake screenshot](https://raw.githubusercontent.com/sasuw/desertsnake/master/Desert-Snake-Screenshot-34ca217acef47736275061c0098abf8b113bd63f.png)


## Why?

My employer organized a Hackathon in 2020, where I had the opportunity to create something unrelated to work, so I decided to put together a Snake game with sound effects indicating the snake's current position (so that the game can also be played by visually impaired or without looking at the screen).

## Current state

The game works more or less currently, but there are some bugs, e.g.
- very slow in Firefox for some reason
- sound-related errors in JS console
- highscores are too easy to hack

## Goals

- to improve sound feedback of the current position of the snake (for more accuracy)
- add highscore table
- improve timing accuracy for better sound
- increase pleasantness of game sounds

# Getting started as developer

## Prerequisites

You have a text editor and some experience in JavaScript and HTML.

## Project structure

The main game loop is in main.js.

## Running the code

Just open index.html in your browser. To start a local web server, you can for example use Python

    python3 -m http.server

or

    npx serve -l tcp://localhost:8000

in the project root directory. For the highscore feature to work you need to start the separate highscore-server, see https://github.com/sasuw/desertsnake-server

# Miscellaneous

<!-- CONTRIBUTING -->
## Contributing

You can contribute to this project in many ways:

  * submitting an issue (bug or enhancement proposal) 
  * testing
  * contributing code

If you want to contribute code, please open an issue or contact me beforehand to ensure that your work in line with the project goals.

When you decide to commit some code:

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

<!-- LICENSE -->
## License

Distributed under the MIT License. See `LICENSE` for more information.