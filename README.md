
# uptime-monitior

### Development Requirements

1. The API listens on PORT and accepts incoming HTTP requests for POST, GET, PUT, DELETE and HEAD.
2. The API allows client to connect, create a new user , then edit and delete the user.
3. The API allows users to *sign in*, which gives them tokens that they can use for subsequent authentication requests.
4. The API allows users to *sign out*, which invalidates their token.
5. The API allows a signed-in user to use their token to create a new *check*.
6. The API allows signed-in user to EDIT or DELETE any of their *checks*.
7. In background, workers perform all the *checks* at appropriate times and send alerts to the users when site goes *up/down*. These notification alerts can be in following formats :-
    * SMS notification.
    * Email notification.
    * Realtime desktop alert.