# Spotify API Integration

## Overview
This module provides integration with the Spotify Web API to fetch user data including:
- Currently playing track
- Recently played tracks
- Top artists and tracks
- User playlists and playlist tracks

## Authentication
The Spotify API requires OAuth 2.0 authentication. This implementation uses:
- Client Credentials flow for development (limited access)
- Mock data for endpoints that require user authorization

### Production Implementation
For a production implementation, the following changes would be needed:
1. Implement Authorization Code flow with PKCE
2. Add endpoints for handling OAuth callbacks
3. Store refresh tokens securely
4. Implement token refresh logic

## API Endpoints

### GET /backend/spotify/current-track
Returns the user's currently playing track.

### GET /backend/spotify/recently-played
Returns the user's recently played tracks.

### GET /backend/spotify/top/:type
Returns the user's top artists or tracks.
- Parameters:
  - type: 'artists' or 'tracks'
  - time_range: 'short_term', 'medium_term', or 'long_term'
  - limit: Number of items to return

### GET /backend/spotify/playlists
Returns the user's playlists.
- Parameters:
  - limit: Number of playlists to return
  - offset: Offset for pagination

### GET /backend/spotify/playlists/:id/tracks
Returns the tracks in a specific playlist.
- Parameters:
  - id: Playlist ID
  - limit: Number of tracks to return
  - offset: Offset for pagination

## Error Handling
All endpoints include comprehensive error handling for:
- API authentication failures
- Network errors
- Rate limiting
- Invalid responses

## Data Models
The service transforms Spotify API responses into simplified models for frontend consumption.
