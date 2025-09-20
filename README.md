# Guess5 - Local Development Setup

## Quick Start

### Using Docker Compose (Recommended)
```bash
# Build and start the container
docker compose up --build

# The app will be available at http://localhost:8081
```

### Using Docker directly
```bash
# Build the image
docker build -t guess5-clone .

# Run the container
docker run -p 8081:80 guess5-clone

# The app will be available at http://localhost:8081
```

## Features

### Core Features (MVP)
- ✅ Secret 5-letter word chosen randomly using Dictionary API
- ✅ Player has 6 attempts to guess
- ✅ Color-coded feedback system:
  - 🟣 Purple: Correct letter, correct spot
  - 🟠 Orange: Correct letter, wrong spot
  - ⬜ Gray: Letter not in the word
- ✅ Smart word validation with comprehensive fallback list (500+ words)
- ✅ Streak tracking with localStorage persistence
- ✅ Win/lose conditions
- ✅ Modern responsive UI with purple/orange theme
- ✅ Smooth animations and transitions
- ✅ Loading indicators for API calls
- ✅ Cache-busting configuration for reliable updates

### Technical Stack
- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Libraries**: jQuery, Bootstrap 5, Font Awesome
- **Styling**: Custom CSS with animations and purple/orange theme
- **API**: Dictionary API (api.dictionaryapi.dev) with comprehensive fallback
- **Container**: Docker with Nginx (cache-busting configuration)
- **Deployment**: Docker Compose

## Game Rules

1. Guess the 5-letter word in 6 attempts
2. Each guess must be a valid 5-letter word from the dictionary
3. After each guess, letters are color-coded:
   - **Purple**: Letter is correct and in the right position
   - **Orange**: Letter is in the word but in the wrong position
   - **Gray**: Letter is not in the word at all
4. Win by guessing the word correctly
5. Lose if you use all 6 attempts
6. Streak counter tracks consecutive wins (stored locally)

## Development

### File Structure
```
Guess5/
├── index.html          # Main HTML file
├── styles.css          # Custom CSS styles with purple/orange theme
├── script.js           # Game logic and JavaScript
├── word-api.js         # API service with comprehensive fallback word list
├── streak-manager.js   # Streak tracking with localStorage
├── nginx.conf          # Nginx configuration with cache-busting
├── Dockerfile          # Docker configuration
├── docker-compose.yml  # Docker Compose configuration
└── README.md           # This file
```

### Local Development (without Docker)
You can also run the app locally by simply opening `index.html` in a web browser, but using Docker ensures consistent deployment.

### Customization
- **API Configuration**: Modify the `apiBase` URL in `word-api.js` to use different dictionary APIs
- **Fallback Words**: Update the `fallbackWords` array in `word-api.js` (500+ words included)
- **Streak Settings**: Modify streak reset timing in `streak-manager.js` (default: 24 hours)
- **Styling**: Update CSS variables in `styles.css` for custom colors and theme
- **Game Rules**: Adjust the number of attempts or word length in `script.js`
- **Cache Settings**: Modify `nginx.conf` for different caching behavior

## Troubleshooting

### Port Already in Use
If port 8081 is already in use, modify the port mapping in `docker-compose.yml`:
```yaml
ports:
  - "8082:80"  # Change 8081 to any available port
```

### Container Issues
```bash
# Stop and remove containers
docker compose down

# Rebuild from scratch
docker compose up --build --force-recreate
```

## Future Enhancements

- On-screen keyboard with color feedback
- Daily word mode with server-side word selection
- Share results functionality
- Advanced statistics tracking
- Sound effects and haptic feedback
- Dark mode theme toggle
- Multiplayer mode
- Custom word lists
