#!/bin/bash

# LLM Provider Setup Script for PR Sync Tool
# Configure environment variables for different LLM providers

echo "🔧 LLM Provider Setup for PR Sync Tool"
echo "======================================"
echo ""

# Function to add to shell profile
add_to_profile() {
    local var_name="$1"
    local var_value="$2"
    local profile_file="$3"

    if ! grep -q "^export $var_name=" "$profile_file"; then
        echo "export $var_name=\"$var_value\"" >> "$profile_file"
        echo "✅ Added $var_name to $profile_file"
    else
        echo "ℹ️  $var_name already exists in $profile_file"
    fi
}

# Detect shell profile
detect_profile() {
    if [ -n "$ZSH_VERSION" ]; then
        echo "$HOME/.zshrc"
    elif [ -n "$BASH_VERSION" ]; then
        echo "$HOME/.bashrc"
    else
        echo "$HOME/.profile"
    fi
}

PROFILE=$(detect_profile)

echo "📋 Choose LLM providers to configure:"
echo ""
echo "1) OpenAI (GPT-4, GPT-3.5)"
echo "2) ZAI (Custom OpenAI-compatible endpoint)"
echo "3) OpenRouter (Multiple models)"
echo "4) Ollama (Local models)"
echo "5) Test current configuration"
echo "6) Exit"
echo ""

read -p "Enter your choice (1-6): " choice

case $choice in
    1)
        echo ""
        echo "🤖 Configuring OpenAI..."
        read -p "Enter your OpenAI API key: " api_key
        read -p "Enter model (default: gpt-4): " model
        read -p "Enter base URL (default: https://api.openai.com/v1): " base_url

        model=${model:-gpt-4}
        base_url=${base_url:-https://api.openai.com/v1}

        add_to_profile "OPENAI_API_KEY" "$api_key" "$PROFILE"
        add_to_profile "OPENAI_MODEL" "$model" "$PROFILE"
        add_to_profile "OPENAI_BASE_URL" "$base_url" "$PROFILE"

        echo ""
        echo "✅ OpenAI configured!"
        echo "🔄 Run 'source $PROFILE' or restart your shell to apply changes"
        ;;

    2)
        echo ""
        echo "⚡ Configuring ZAI..."
        read -p "Enter your ZAI API key: " api_key
        read -p "Enter your ZAI base URL: " base_url
        read -p "Enter model (default: qwen2.5-coder-7b-instruct): " model

        model=${model:-qwen2.5-coder-7b-instruct}

        add_to_profile "ZAI_API_KEY" "$api_key" "$PROFILE"
        add_to_profile "ZAI_BASE_URL" "$base_url" "$PROFILE"
        add_to_profile "ZAI_MODEL" "$model" "$PROFILE"

        echo ""
        echo "✅ ZAI configured!"
        echo "🔄 Run 'source $PROFILE' or restart your shell to apply changes"
        ;;

    3)
        echo ""
        echo "🌐 Configuring OpenRouter..."
        read -p "Enter your OpenRouter API key: " api_key
        read -p "Enter model (default: qwen/qwen-2.5-coder-7b-instruct): " model
        read -p "Enter base URL (default: https://openrouter.ai/api/v1): " base_url

        model=${model:-qwen/qwen-2.5-coder-7b-instruct}
        base_url=${base_url:-https://openrouter.ai/api/v1}

        add_to_profile "OPENROUTER_API_KEY" "$api_key" "$PROFILE"
        add_to_profile "OPENROUTER_MODEL" "$model" "$PROFILE"
        add_to_profile "OPENROUTER_BASE_URL" "$base_url" "$PROFILE"

        echo ""
        echo "✅ OpenRouter configured!"
        echo "🔄 Run 'source $PROFILE' or restart your shell to apply changes"
        ;;

    4)
        echo ""
        echo "🦙 Configuring Ollama (Local)..."
        read -p "Enter Ollama model (default: qwen2.5-coder:7b): " model
        read -p "Enter Ollama base URL (default: http://localhost:11434): " base_url

        model=${model:-qwen2.5-coder:7b}
        base_url=${base_url:-http://localhost:11434}

        add_to_profile "OLLAMA_ENABLED" "true" "$PROFILE"
        add_to_profile "OLLAMA_MODEL" "$model" "$PROFILE"
        add_to_profile "OLLAMA_BASE_URL" "$base_url" "$PROFILE"

        echo ""
        echo "✅ Ollama configured!"
        echo "💡 Make sure Ollama is running: ollama serve"
        echo "💡 Pull the model: ollama pull $model"
        echo "🔄 Run 'source $PROFILE' or restart your shell to apply changes"
        ;;

    5)
        echo ""
        echo "🧪 Testing current configuration..."
        node tools/test-llm-providers.mjs
        ;;

    6)
        echo "👋 Goodbye!"
        exit 0
        ;;

    *)
        echo "❌ Invalid choice. Please run the script again."
        exit 1
        ;;
esac

echo ""
echo "📖 Usage Examples:"
echo ""
echo "# Test providers"
echo "node tools/test-llm-providers.mjs"
echo ""
echo "# Update PRs with automatic fallback"
echo "node tools/pr-sync-tool.mjs --base main --resolution llm"
echo ""
echo "# Dry run to see what would happen"
echo "node tools/pr-sync-tool.mjs --base dev/stealth --dry-run"
echo ""
echo "# Force using specific provider (disable others)"
echo "OLLAMA_ENABLED=false OPENAI_API_KEY=your_key node tools/pr-sync-tool.mjs --base main"