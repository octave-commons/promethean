<img src="https://r2cdn.perplexity.ai/pplx-full-logo-primary-dark%402x.png" style="height:64px;margin-right:32px"/>

# aws qwen fine tuning model serving training monthly costs

On AWS, Qwen costs split into three very different buckets: Bedrock API usage, fine-tuning/customization, and self-hosted training or serving on SageMaker/EC2/Trainium.  In the sources here, Qwen appears explicitly for Bedrock inference pricing and for AWS Trainium fine-tuning tutorials, while AWS customization docs shown are mostly generic rather than a Qwen-specific Bedrock fine-tuning SKU list.[^1_5][^1_7][^1_9][^1_12]

## Serving costs

For Bedrock-hosted Qwen, the listed price for `qwen.qwen3-coder-next` is \$0.60 per 1 million input tokens and \$1.44 per 1 million output tokens.  That means a workload of 100 million input tokens and 20 million output tokens in a month would cost about \$88.80.[^1_9]

If you self-host Qwen instead of using token-priced API access, your monthly serving bill is driven mostly by the instance you keep running.  Using the Trainium prices shown in the Hugging Face AWS tutorial, an always-on `trn1.2xlarge` is about \$964.80 per month, a `trn1.32xlarge` is about \$15,480 per month, and a `trn1n.32xlarge` is about \$17,841.60 per month, assuming roughly 720 hours in a month.[^1_7]

## Fine-tuning costs

AWS states that supervised fine-tuning and DPO customization are charged from the total tokens processed during training, which is effectively training tokens multiplied by epochs.  AWS Bedrock’s pricing page also shows that custom model storage is billed monthly, and one example on that page includes \$1.95 per month of custom model storage in addition to training charges.[^1_1][^1_10][^1_12][^1_5]

For a practical 7B-class fine-tune on AWS infrastructure, one cost guide estimates a single LoRA run at about \$2.93 to \$3.89 on Spot, and a more realistic workflow with hyperparameter search and multiple runs at about \$21.74 to \$32.90 total.  The same guide says a 7B fine-tuning project is often better budgeted at roughly \$20 to \$50 once experimentation is included, while a full 7B fine-tune can land around \$80 to \$400 on Spot.[^1_2]

## Training costs

If by “training” you mean pretraining a Qwen-like model from scratch rather than fine-tuning, the cost jumps by orders of magnitude.  One AWS cost guide estimates a 7B pretraining run at about \$13,161 to \$21,935 on Spot or about \$43,869 on demand, while a 70B run is estimated at roughly \$317,157 to \$528,595 on Spot or over \$1.05 million on demand.[^1_2]

AWS Trainium can reduce training cost relative to large GPU fleets, and the tutorial cited here lists `trn1.2xlarge` at \$1.34 per hour, `trn1.32xlarge` at \$21.50 per hour, and `trn1n.32xlarge` at \$24.78 per hour.  Another AWS cost guide also notes that compute is usually 70% to 85% of total AI training cost, with storage, networking, and transfer often adding another 15% to 30%.[^1_7][^1_2]

## Budget ranges

A light Bedrock Qwen deployment can be very inexpensive if usage is modest, because costs scale directly with tokens rather than an always-on instance.  A self-hosted Qwen service is usually closer to about \$1,000 per month at the low end for a small always-on Trainium node, and much more for larger dedicated inference boxes.[^1_9][^1_7]

For customization, a small 7B LoRA fine-tune is usually in the tens of dollars, a serious experimental cycle is more like tens to low hundreds, and pretraining from scratch is in the tens of thousands or more.  If you use AWS-managed custom model flows, remember to add monthly model storage and any provisioned inference charges on top of training itself.[^1_10][^1_12][^1_1][^1_2]

Do you want this turned into a concrete monthly estimate for Qwen 7B, 14B, or 32B with a target request volume?
<span style="display:none">[^1_11][^1_13][^1_14][^1_3][^1_4][^1_6][^1_8]</span>

<div align="center">⁂</div>

[^1_1]: https://aws.amazon.com/bedrock/pricing/

[^1_2]: https://wring.co/blog/aws-ai-training-costs-guide

[^1_3]: https://www.reddit.com/r/LocalLLaMA/comments/1mxhkss/how_much_would_it_cost_to_run_something_like_qwen/

[^1_4]: https://aws.amazon.com/about-aws/whats-new/2026/03/amazon-sagemaker-ai-serverless-additional-models/

[^1_5]: https://aws.amazon.com/sagemaker/ai/pricing/

[^1_6]: https://caylent.com/blog/amazon-bedrock-pricing-explained

[^1_7]: https://huggingface.co/docs/optimum-neuron/training_tutorials/qwen3-fine-tuning

[^1_8]: https://www.reddit.com/r/aws/comments/1e6exal/do_you_need_to_pay_every_hour_for_a_custom/

[^1_9]: https://www.getmaxim.ai/bifrost/llm-cost-calculator/provider/bedrock/model/qwen.qwen3-coder-next

[^1_10]: https://aws.amazon.com/blogs/aws/customize-models-in-amazon-bedrock-with-your-own-data-using-fine-tuning-and-continued-pre-training/

[^1_11]: https://docs.aws.amazon.com/bedrock/latest/userguide/rft-submit-job.html

[^1_12]: https://docs.aws.amazon.com/bedrock/latest/userguide/custom-models.html

[^1_13]: https://www.cloudforecast.io/blog/aws-bedrock-pricing/

[^1_14]: https://www.cerebras.ai/pricing


---
