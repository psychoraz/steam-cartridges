# steam collection

## important
First, code was AI generated an only slightly adjusted, so it's spagetthi code. Wanted something quick, and was not thinking about makit it publically available, but as some have requested, let's open the repo. I won't be reviewing PRs, neither accepting code, as of what i'm concerned, this is a finished "product", but feel free to clone and adapt to you needs, or make another repo if you think this is useful and want to maintain it.

### how to install

After cloning the repo, you will need node and npm. I'm using the following versions:
| `$ node -v` | `$ npm -v` |
| --------- | -------- |
| `v20.11.1` | `10.2.4` |

Then, you will need to install all requiered packages, so run `npm -i`

You will also need an `.env` file on the root folder, containing you [Steam API Key](https://steamcommunity.com/dev) and a [SteamGridDB API Key](https://www.steamgriddb.com/). Also, the profile you search for, must be set to public visibility.

The .env file contains:
```
$ cat .env
STEAM_API_KEY=<steam_api_key>
STEAMGRIDDB_API_KEY=<steamgriddb_api_key>
```

Steam API Key is used to search for the user games, and to gather game info as description as release date.
SteamGridDB API Key is used to get covers. You could do this with the Steam API Key, but SteamGridDB has a lot more covers and filters, and I was specifically searching for "square" sizes.

Once everything is set, you should be able to get it running by compiling scss with `npm run build:css`, and running the project with `npm run start`.
It will run by default on http://localhost:3000

### boxes and stands
I used this coin boxes, found on ali express: https://es.aliexpress.com/item/1005007281990397.html

As for the stands, I use this ones: https://es.aliexpress.com/item/1005007621229061.html
