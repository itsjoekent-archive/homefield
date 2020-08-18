# HomeField

HomeField is a volunteer-from-home organizing hub.

## Setup

HomeField requires [Docker](https://www.docker.com/) to run containers locally. The frontend requires [NodeJS](https://nodejs.org/en/) v12 or greater.
To run a specific application follow the README for that project.

### Deploying

To deploy a new version or interact with a remote API from your machine, you'll need the [Heroku CLI installed](https://devcenter.heroku.com/articles/heroku-cli#download-and-install). Once installed authenticate by running the following,

```sh
$ heroku login
```

To deploy the frontend UI, you'll need the [Wrangler CLI installed](https://developers.cloudflare.com/workers/tooling/wrangler/install/). After you have installed Wrangler, you'll need to configure Wrangler by running the following,

```sh
$ wrangler config
```
