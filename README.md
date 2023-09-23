# subsonic-discord-presence
Discord Rich Presence for Subsonic servers

## How to use
Clone this repo, copy `settings.example.json` to `settings.json` and fill in your Subsonic login information in the file. When you are done, run
```sh
npm i
```
and then
```sh
npm start
```

> If you want to have artwork support, see the [Artwork](#artwork) section. This is optional, Rich Presence will still work properly without this.

## Artwork
> **WARNING!** The URL you set here will be visible to other people in Discord, if they know where to look!

If you want to have artwork in your rich presence, you have to set up a server that returns the correct artwork for a song ID. You then have to specify the URL for that server in the `imagesUrl` property in `settings.json`. The song ID will be automatically appended to the URL provided in the file, so if you opt to use the Subsonic default [getCoverArt](http://www.subsonic.org/pages/api.jsp#getCoverArt) API method make sure the URL ends with `?id=`.

## Troubleshooting
 - If you are using the Discord Flatpak, please see [this page](https://github.com/flathub/com.discordapp.Discord/wiki/Rich-Precense-(discord-rpc)).
