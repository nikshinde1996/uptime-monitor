
# uptime-monitior - no framework, no npm.

### Development Requirements

- [x] The API listens on PORT and accepts incoming HTTP requests for `POST, GET, PUT, DELETE and HEAD`.
- [x] The API allows client to connect, create a new user , then edit and delete the user.
- [x] The API allows users to `sign in`, which gives them tokens that they can use for subsequent authentication requests.
- [x] The API allows users to `sign out`, which invalidates their token.
- [x] The API allows a signed-in user to use their token to create a new `check`.
- [x] The API allows signed-in user to EDIT or DELETE any of their `checks`.
- [x] In background, workers perform all the `checks` at appropriate times and send alerts to the users when site goes `up/down`. These notification alerts can be in following formats :-
    * SMS notification.
    * Email notification.
    * Realtime desktop alert.
- [x] CLI support

### Installation

```
node index.js
```
`Localhost url :` [http://localhost:3000](http://localhost:3000)


### CLI Commands
