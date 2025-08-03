# AGENTS.md

## Overview

This folder `/workspace/tests/e2e` is for whole syste/cross service e2e tests.
As in, we want to test the complete system from end to end here.

validate the system is working as intended.
User facing features are often tested here.

For example, the discord bot has a "start_dialog" command that initiates a voice conversation with the bot that involves:
- joining the voice channel
- transcribing the users voice to text
- potentially capturing the users screen to feed to a multi modal network
- feeding that text/image to the LLM service
- sending the LLMs generated response to a text to speech system
- sending that voice stream to discord for the user to here.

Most if not all of the systems services are involved in a flow like this. 
If we want to automatically validate that this complicated pipeline works correctly, you'd write an e2e test here.
