
## Description

While just... trying to get the system running, after resolving some off board issues... which is a problem in it's self.... That's why we're writing this here now to get ourselves using the board more.

So while debugging, I was noticing something was connecting to the broker frequently. 
It could be many services, or it could be one broken one.

it's possible this will be fixed by [[setup services to recieve work from the broker via push]] if the issue is in a service using a bad client implementation. 

## Goals

- All services with broker connections connect once per session
- broker logs are easier to follow

#keepitsimple #broker #bug #todo 