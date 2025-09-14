# Evaluate and integrate docker NPU image into workflows

I recently added an Intel OpenVINO GenAI Model Server instance to our docker compose configuration. They should just work, but we have to make sure that the models are available to them. We will have to write a script to grab them.

I'd like to be able to experiment with different models, but that is outside of the scope of this project. We have an [[ovm.json]] file with the models we're going to start out with.