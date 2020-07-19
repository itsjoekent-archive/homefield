# platform-api

## Local Setup

Requires Docker.

```sh
$ make start
```

To seed the database, run the following command while the API is running,

```sh
$ make seed
```

### Models

```js
// User
{
  "_id": ObjectId,

  "email": String,
  "password": String,
  "isSuper-Admin": Boolean,

  "firstName": String,
  "avatar": File:ObjectId,

  "campaigns": [Campaign:ObjectId],
  "points": Number,
}

// Campaign
{
  "_id": ObjectId,

  "title": String,
  "logo": File:ObjectId,

  "Admin": User:ObjectId,
  "staff": [User:ObjectId],
  "moderators": [User:ObjectId],
  "blocked": [User:ObjectId],

  "firewall": [Campaign:ObjectId],

  "dialer": {
    "iframe": String,
  },

  "sms": {
    "iframe": String,
  },

  "wiki": String,

  "chat": {
    "channels": [Conversation:ObjectId],
    "customEmojis": [
      {
        "symbol": String,
        "file": ObjectId:File,
      },
    ],
  }
}

// File
{
  "_id": ObjectId,

  "uploadedBy": User:ObjectId,

  "src": String,
  "alt": String,
}

// Invite
{
  "_id": String,

  "invitedBy": User:ObjectId,
  "recipient": String,

  "campaign": Campaign:ObjectId,
  "role": String,

  "expiresAt": Date,
}
```

### Endpoints

[x] `GET /campaigns`: Paginated list of campaigns
[x] `GET /campaigns/:campaignId`: Get a specific campaign
[x] `POST /campaigns`: [Super-Admin Only] Build a new campaign
[x] `DEL /campaigns/:campaignId`: [Super-Admin, Admin Only]

`PUT /campaigns/:campaignId`: [Super-Admin, Admin, Staff Only] Update a campaign (title, logo, tools, wiki)

`POST /campaigns/:campaignId/public` [Super-Admin] Change the public status of a campaign

`GET /campaigns/:campaignId/volunteers`: [Super-Admin, Admin, Staff, Volunteer Only] Get a paginated list of volunteers for this campaign
`POST /campaigns/:campaignId/volunteers/:userId`: [Authenticated User Only] Signup to volunteer for a campaign
`DEL /campaigns/:campaignId/volunteers/:userId`: [Super-Admin, Admin, Staff, Moderator or Same-user Only] Stop volunteering for a campaign

`PUT /campaigns/:campaignId/firewall/:campaignFirewallId`: [Super-Admin Only] Update a campaign firewall

`GET /campaigns/:campaignId/admin`: [Super-Admin, Admin, Staff, Volunteer Only] Get the admins for this campaign
`PUT /campaigns/:campaignId/admin/:userId`: [Super-Admin, Admin Only] Add a campaign Admin
`DEL /campaigns/:campaignId/admin/:userId`: [Super-Admin, Admin Only] Remove a campaign admin

`GET /campaigns/:campaignId/staff`: [Super-Admin, Admin, Staff, Volunteer Only] Get the staff list for this campaign
`PUT /campaigns/:campaignId/staff/:userId`: [Super-Admin, Admin Only] Mark a user as campaign staff
`DEL /campaigns/:campaignId/staff/:userId`: [Super-Admin, Admin Only] Remove a member from staff
`POST /campaigns/:campaignId/staff/invite`: [Super-Admin, Admin Only] Invite an email to create an account and be marked as staff

`GET /campaigns/:campaignId/moderator`: [Super-Admin, Admin, Staff, Volunteer Only] Get the moderator list for this campaign
`PUT /campaigns/:campaignId/moderator/:userId`: [Super-Admin, Admin, Staff Only] Mark a user as a moderator
`DEL /campaigns/:campaignId/moderator/:userId`: [Super-Admin, Admin, Staff Only] Remove a user from the moderator list
`POST /campaigns/:campaignId/moderator/invite`: [Super-Admin, Admin, Staff Only] Invite an email to create an account and be marked as a moderator

`GET /campaigns/:campaignId/block`: [Super-Admin, Admin, Staff, Moderator Only] Get the block list for this campaign
`PUT /campaigns/:campaignId/block/:userId`: [Super-Admin, Admin, Staff, Moderator Only] Block a volunteer from this campaign
`DEL /campaigns/:campaignId/block/:userId`: [Super-Admin, Admin, Staff, Moderator Only] Remove a volunteer from the block list on this campaign

`POST /campaigns/:campaignId/invite`: [Super-Admin, Admin, Staff, Volunteer Only] Invite an email to create an account and join this campaign

`GET /campaigns/:campaignId/conversation/:userId`: [Super-Admin, Admin, Staff, Volunteer Only] Get conversation messages with another user, user must be one of the participants.
`POST /campaigns/:campaignId/conversation/:userId`: [Super-Admin, Admin, Staff, Volunteer Only] Post a message to a conversation with another user, user must be one of the participants.

`GET /campaigns/:campaignId/channels`: [Super-Admin, Admin, Staff, Volunteer Only] Get a paginated list of channels for this campaign
`POST /campaigns/:campaignId/channels`: [Super-Admin, Admin, Staff] Create a new channel
`GET /campaigns/:campaignId/channels/:channelId`: [Super-Admin, Admin, Staff, Volunteer Only] Get the channel details and messages
`POST /campaigns/:campaignId/channels/:channelId`: [Super-Admin, Admin, Staff, Volunteer Only] Post a message to a channel
`PUT /campaigns/:campaignId/channels/:channelId`: [Super-Admin, Admin, Staff] Update a channel
`DEL /campaigns/:campaignId/channels/:channelId`: [Super-Admin, Admin, Staff] Delete a channel

`POST /campaigns/:campaignId/emoji`: [Super-Admin, Admin, Staff] Add a custom emoji available in the chat for this campaign
`DEL /campaign/:campaignId/emoji/:emojiId`: [Super-Admin, Admin, Staff] Delete a custom emoji from this campaign

`GET /invite`: [Same-user Only] Get paginated list of invitations created by this user
`GET /invite/:inviteId`: Get an invitation
`POST /invite/:inviteId/apply`: [Same-user Only] Consume the invitation, apply the campaign + role to the user.
`DEL /invite/:inviteId`: [Invitee Only] Delete the invitation

`POST /upload`: [Super-Admin, Admin, Staff, Volunteer Only] Get a one-time token to upload a file to storage and create a File object

`GET /messages/unread`: [Same-user Only] Get paginated list of all unread message notifications
`POST /messages/:messageId/read`: [Same-user Only] Mark a message as read

`GET /user`: [Same-user Only] Get profile details for the authenticated user
`GET /user/:userId`: [Authenticated Users Only] Get specific user details
`POST /user`: Create a new user account
`PUT /user`: [Same-user Only] Update the user account
`POST /user/forgot-password`: Trigger forgot password email
