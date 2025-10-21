# Configuration Guide

## Comprehensive Testing Transition Rule

**Version**: 1.0.0  
**Last Updated**: 2025-10-15  
**Package**: `@promethean/kanban`

---

## Table of Contents

1. [Overview](#overview)
2. [Threshold Configuration](#threshold-configuration)
3. [Format Support Configuration](#format-support-configuration)
4. [Performance Settings](#performance-settings)
5. [AI Integration Settings](#ai-integration-settings)
6. [Report Customization](#report-customization)
7. [Environment-specific Configuration](#environment-specific-configuration)
8. [Advanced Configuration](#advanced-configuration)
9. [Troubleshooting](#troubleshooting)

---

## Overview

The Comprehensive Testing Transition Rule provides extensive configuration options to customize validation behavior, performance characteristics, and integration requirements. This guide covers all available configuration settings and their recommended values for different use cases.

### Configuration Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Configuration System                      │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐  ┌──────────────┐ │
│  │   JSON Config   │  │  Clojure DSL    │  │ Environment  │ │
│  │   (Primary)     │  │   (Advanced)    │  │  Variables   │ │
│  └─────────────────┘  └─────────────────┘  └──────────────┘ │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐  ┌──────────────┐ │
│  │   Thresholds    │  │   Performance   │  │ AI Settings  │ │
│  │   Coverage      │  │   Timeouts      │  │   Models     │ │
│  │   Quality       │  │   Caching       │  │   Prompts    │ │
│  └─────────────────┘  └─────────────────┘  └──────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### Configuration Precedence

1. **Environment Variables** (highest priority)
2. **JSON Configuration** (`promethean.kanban.json`)
3. **Clojure DSL Rules** (`docs/agile/rules/kanban-transitions.clj`)
4. **Default Values** (lowest priority)

---

## Threshold Configuration

### Coverage Thresholds

Coverage thresholds define the minimum acceptable test coverage for different scenarios.

#### Basic Coverage Configuration

```json
{
  "testingTransition": {
    "thresholds": {
      "coverage": {
        "soft": 90,
        "hard": 75,
        "warning": 85
      }
    }
  }
}
```

#### Advanced Coverage Configuration

```json
{
  "testingTransition": {
    "thresholds": {
      "coverage": {
        "soft": 90,
        "hard": 75,
        "warning": 85,
        "critical": 60,
        "formats": {
          "lcov": {
            "line": 90,
            "function": 85,
            "branch": 80
          },
          "cobertura": {
            "line": 85,
            "branch": 75
          },
          "json": {
            "lines": 90,
            "functions": 85,
            "statements": 90,
            "branches": 80
          }
        }
      }
    }
  }
}
```

### Quality Score Thresholds

Quality scores provide a comprehensive 0-100 assessment of code quality.

```json
{
  "testingTransition": {
    "thresholds": {
      "quality": {
        "overall": {
          "excellent": 90,
          "good": 80,
          "acceptable": 70,
          "poor": 60
        },
        "components": {
          "coverage": {
            "weight": 0.4,
            "threshold": 85
          },
          "testQuality": {
            "weight": 0.3,
            "threshold": 80
          },
          "requirementMapping": {
            "weight": 0.2,
            "threshold": 75
          },
          "codeComplexity": {
            "weight": 0.1,
            "threshold": 70
          }
        }
      }
    }
  }
}
```

### Requirement Mapping Thresholds

```json
{
  "testingTransition": {
    "thresholds": {
      "requirements": {
        "coverage": 90,
        "traceability": 85,
        "validation": 80,
        "criticalRequirements": 100
      }
    }
  }
}
```

### Environment-specific Thresholds

```json
{
  "testingTransition": {
    "thresholds": {
      "environments": {
        "development": {
          "coverage": { "soft": 80, "hard": 65 },
          "quality": { "acceptable": 60 }
        },
        "staging": {
          "coverage": { "soft": 85, "hard": 70 },
          "quality": { "acceptable": 70 }
        },
        "production": {
          "coverage": { "soft": 90, "hard": 75 },
          "quality": { "acceptable": 80 }
        }
      }
    }
  }
}
```

---

## Format Support Configuration

### Coverage Report Formats

Configure support for different coverage report formats.

#### LCOV Configuration

```json
{
  "testingTransition": {
    "formats": {
      "lcov": {
        "enabled": true,
        "paths": ["coverage/lcov.info", "coverage/*.lcov"],
        "parser": {
          "strict": true,
          "validateChecksums": true,
          "excludePatterns": ["*.test.*", "*.spec.*"]
        },
        "metrics": {
          "lineCoverage": true,
          "functionCoverage": true,
          "branchCoverage": true
        }
      }
    }
  }
}
```

#### Cobertura Configuration

```json
{
  "testingTransition": {
    "formats": {
      "cobertura": {
        "enabled": true,
        "paths": ["coverage/cobertura.xml", "coverage/*.xml"],
        "parser": {
          "validateSchema": true,
          "namespaceAware": true
        },
        "metrics": {
          "lineCoverage": true,
          "branchCoverage": true,
          "complexity": true
        }
      }
    }
  }
}
```

#### JSON Configuration

```json
{
  "testingTransition": {
    "formats": {
      "json": {
        "enabled": true,
        "paths": ["coverage/coverage-final.json", "coverage/*.json"],
        "parser": {
          "schema": "jest-coverage",
          "strict": false
        },
        "metrics": {
          "lines": true,
          "functions": true,
          "statements": true,
          "branches": true
        }
      }
    }
  }
}
```

### Custom Format Support

```json
{
  "testingTransition": {
    "formats": {
      "custom": {
        "enabled": true,
        "paths": ["coverage/custom.*"],
        "parser": {
          "module": "./custom-parser.js",
          "options": {
            "strict": true,
            "customField": "value"
          }
        }
      }
    }
  }
}
```

---

## Performance Settings

### Timeout Configuration

Configure time limits for different operations to prevent blocking.

```json
{
  "testingTransition": {
    "performance": {
      "timeouts": {
        "analysis": 30000,
        "coverageParsing": 5000,
        "qualityScoring": 10000,
        "aiAnalysis": 20000,
        "reportGeneration": 3000,
        "total": 30000
      }
    }
  }
}
```

### Caching Configuration

Improve performance with intelligent caching.

```json
{
  "testingTransition": {
    "performance": {
      "caching": {
        "enabled": true,
        "ttl": 3600000,
        "maxSize": 100,
        "strategies": {
          "coverageReports": {
            "enabled": true,
            "key": "file-hash",
            "ttl": 1800000
          },
          "qualityScores": {
            "enabled": true,
            "key": "content-hash",
            "ttl": 900000
          },
          "aiAnalysis": {
            "enabled": true,
            "key": "composite-hash",
            "ttl": 3600000
          }
        }
      }
    }
  }
}
```

### Concurrency Configuration

```json
{
  "testingTransition": {
    "performance": {
      "concurrency": {
        "maxConcurrent": 4,
        "queueSize": 10,
        "workerPool": {
          "enabled": true,
          "minWorkers": 2,
          "maxWorkers": 8,
          "workerTimeout": 60000
        }
      }
    }
  }
}
```

### Memory Management

```json
{
  "testingTransition": {
    "performance": {
      "memory": {
        "maxHeapUsage": 512,
        "gcThreshold": 0.8,
        "streaming": {
          "enabled": true,
          "chunkSize": 1024,
          "maxFileSize": 10485760
        }
      }
    }
  }
}
```

---

## AI Integration Settings

### Model Configuration

Configure AI models for analysis and recommendations.

```json
{
  "testingTransition": {
    "ai": {
      "enabled": true,
      "provider": "openai",
      "models": {
        "analysis": {
          "primary": "gpt-4",
          "fallback": "gpt-3.5-turbo",
          "temperature": 0.3,
          "maxTokens": 2000
        },
        "recommendations": {
          "primary": "gpt-3.5-turbo",
          "temperature": 0.7,
          "maxTokens": 1000
        }
      }
    }
  }
}
```

### Ollama Configuration

```json
{
  "testingTransition": {
    "ai": {
      "provider": "ollama",
      "ollama": {
        "endpoint": "http://localhost:11434",
        "models": {
          "analysis": "codellama:7b",
          "recommendations": "llama2:7b"
        },
        "options": {
          "temperature": 0.3,
          "topP": 0.9,
          "maxTokens": 2000
        }
      }
    }
  }
}
```

### Prompt Configuration

Customize AI prompts for different analysis types.

```json
{
  "testingTransition": {
    "ai": {
      "prompts": {
        "coverageAnalysis": {
          "system": "You are a senior software engineer specializing in test coverage analysis.",
          "template": "Analyze the following test coverage data and provide insights:\n\nCoverage: {{coverage}}\nQuality Score: {{score}}\n\nFocus on: {{focus}}",
          "variables": ["coverage", "score", "focus"]
        },
        "qualityAssessment": {
          "system": "You are a code quality expert with deep knowledge of testing best practices.",
          "template": "Assess the code quality based on these metrics:\n\n{{metrics}}\n\nProvide specific recommendations for improvement.",
          "variables": ["metrics"]
        }
      }
    }
  }
}
```

### Analysis Configuration

```json
{
  "testingTransition": {
    "ai": {
      "analysis": {
        "enabled": true,
        "depth": "comprehensive",
        "features": {
          "contextualAnalysis": true,
          "recommendationGeneration": true,
          "riskAssessment": true,
          "trendAnalysis": false
        },
        "context": {
          "includeCode": true,
          "maxCodeLength": 5000,
          "includeTests": true,
          "includeRequirements": true
        }
      }
    }
  }
}
```

---

## Report Customization

### Report Format Configuration

Configure the format and content of generated reports.

```json
{
  "testingTransition": {
    "reports": {
      "format": "markdown",
      "template": "comprehensive",
      "sections": {
        "executiveSummary": {
          "enabled": true,
          "position": "first"
        },
        "coverageAnalysis": {
          "enabled": true,
          "includeCharts": true,
          "detailLevel": "comprehensive"
        },
        "qualityAssessment": {
          "enabled": true,
          "includeRationale": true,
          "includeRecommendations": true
        },
        "requirementMapping": {
          "enabled": true,
          "includeTraceability": true
        },
        "aiInsights": {
          "enabled": true,
          "includeRecommendations": true
        },
        "actionItems": {
          "enabled": true,
          "format": "checklist",
          "prioritize": true
        }
      }
    }
  }
}
```

### Frontmatter Configuration

Configure how reports are attached to task files.

```json
{
  "testingTransition": {
    "reports": {
      "frontmatter": {
        "enabled": true,
        "fields": {
          "testingScore": {
            "type": "number",
            "format": "integer"
          },
          "coveragePercentage": {
            "type": "number",
            "format": "float"
          },
          "qualityRating": {
            "type": "string",
            "enum": ["excellent", "good", "acceptable", "poor"]
          },
          "analysisDate": {
            "type": "date",
            "format": "iso8601"
          },
          "recommendations": {
            "type": "array",
            "items": "string"
          }
        }
      }
    }
  }
}
```

### Notification Configuration

```json
{
  "testingTransition": {
    "reports": {
      "notifications": {
        "enabled": true,
        "channels": ["slack", "email"],
        "triggers": {
          "onFailure": true,
          "onWarning": true,
          "onSuccess": false
        },
        "templates": {
          "failure": "Testing transition blocked: {{reason}}",
          "warning": "Testing transition warning: {{message}}",
          "success": "Testing transition approved: {{score}}/100"
        }
      }
    }
  }
}
```

---

## Environment-specific Configuration

### Development Environment

```json
{
  "testingTransition": {
    "environment": "development",
    "debug": true,
    "verbose": true,
    "thresholds": {
      "coverage": { "soft": 80, "hard": 65 },
      "quality": { "acceptable": 60 }
    },
    "performance": {
      "timeouts": { "total": 60000 },
      "caching": { "enabled": false }
    },
    "ai": {
      "enabled": false,
      "mockResponses": true
    }
  }
}
```

### Staging Environment

```json
{
  "testingTransition": {
    "environment": "staging",
    "debug": false,
    "verbose": true,
    "thresholds": {
      "coverage": { "soft": 85, "hard": 70 },
      "quality": { "acceptable": 70 }
    },
    "performance": {
      "timeouts": { "total": 30000 },
      "caching": { "enabled": true }
    },
    "ai": {
      "enabled": true,
      "provider": "ollama"
    }
  }
}
```

### Production Environment

```json
{
  "testingTransition": {
    "environment": "production",
    "debug": false,
    "verbose": false,
    "thresholds": {
      "coverage": { "soft": 90, "hard": 75 },
      "quality": { "acceptable": 80 }
    },
    "performance": {
      "timeouts": { "total": 30000 },
      "caching": { "enabled": true, "ttl": 7200000 },
      "concurrency": { "maxConcurrent": 8 }
    },
    "ai": {
      "enabled": true,
      "provider": "openai",
      "fallback": "ollama"
    },
    "reports": {
      "notifications": {
        "enabled": true,
        "channels": ["slack", "email", "pagerduty"]
      }
    }
  }
}
```

### Environment Variables

```bash
# Core Configuration
TESTING_TRANSITION_ENV=production
TESTING_TRANSITION_DEBUG=false
TESTING_TRANSITION_VERBOSE=false

# Thresholds
TESTING_TRANSITION_COVERAGE_SOFT=90
TESTING_TRANSITION_COVERAGE_HARD=75
TESTING_TRANSITION_QUALITY_ACCEPTABLE=80

# Performance
TESTING_TRANSITION_TIMEOUT_TOTAL=30000
TESTING_TRANSITION_CACHE_ENABLED=true
TESTING_TRANSITION_MAX_CONCURRENT=8

# AI Integration
TESTING_TRANSITION_AI_ENABLED=true
TESTING_TRANSITION_AI_PROVIDER=openai
TESTING_TRANSITION_AI_MODEL=gpt-4

# Reports
TESTING_TRANSITION_REPORTS_NOTIFICATIONS_ENABLED=true
TESTING_TRANSITION_REPORTS_FORMAT=markdown
```

---

## Advanced Configuration

### Custom Rules Engine

Extend the system with custom validation rules.

```json
{
  "testingTransition": {
    "customRules": {
      "enabled": true,
      "rulesPath": "./custom-rules/",
      "rules": [
        {
          "name": "securityTestCoverage",
          "description": "Ensure security-related code has 100% test coverage",
          "condition": "file.path.includes('security')",
          "requirement": "coverage === 100",
          "severity": "critical"
        },
        {
          "name": "apiDocumentation",
          "description": "API endpoints must have documented tests",
          "condition": "file.isApiEndpoint",
          "requirement": "hasDocumentationTests",
          "severity": "warning"
        }
      ]
    }
  }
}
```

### Integration Configuration

Configure external system integrations.

```json
{
  "testingTransition": {
    "integrations": {
      "github": {
        "enabled": true,
        "token": "${GITHUB_TOKEN}",
        "apiUrl": "https://api.github.com",
        "statusCheck": {
          "enabled": true,
          "context": "testing-transition/validation",
          "targetUrl": "https://ci.example.com/testing-transition"
        }
      },
      "jira": {
        "enabled": true,
        "url": "https://company.atlassian.net",
        "username": "${JIRA_USERNAME}",
        "token": "${JIRA_TOKEN}",
        "project": "PROJ",
        "transitions": {
          "blocked": "Testing Failed",
          "approved": "Ready for Review"
        }
      },
      "slack": {
        "enabled": true,
        "webhook": "${SLACK_WEBHOOK}",
        "channel": "#development",
        "username": "Testing Transition Bot"
      }
    }
  }
}
```

### Monitoring and Metrics

```json
{
  "testingTransition": {
    "monitoring": {
      "enabled": true,
      "metrics": {
        "performance": {
          "analysisTime": true,
          "memoryUsage": true,
          "cacheHitRate": true
        },
        "quality": {
          "coverageTrends": true,
          "qualityScoreDistribution": true,
          "failureReasons": true
        },
        "usage": {
          "transitionAttempts": true,
          "successRate": true,
          "errorRate": true
        }
      },
      "export": {
        "prometheus": {
          "enabled": true,
          "port": 9090
        },
        "datadog": {
          "enabled": false,
          "apiKey": "${DATADOG_API_KEY}"
        }
      }
    }
  }
}
```

---

## Troubleshooting

### Common Configuration Issues

#### 1. Thresholds Not Applied

**Problem**: Coverage thresholds are not being enforced.

**Solution**:

```json
{
  "testingTransition": {
    "enabled": true,
    "thresholds": {
      "coverage": {
        "soft": 90,
        "hard": 75
      }
    }
  }
}
```

Ensure `testingTransition.enabled` is `true` and thresholds are properly nested.

#### 2. AI Integration Not Working

**Problem**: AI analysis is not being performed.

**Solution**:

```json
{
  "testingTransition": {
    "ai": {
      "enabled": true,
      "provider": "openai",
      "models": {
        "analysis": {
          "primary": "gpt-4"
        }
      }
    }
  }
}
```

Check API keys and model availability.

#### 3. Performance Issues

**Problem**: Analysis is taking too long.

**Solution**:

```json
{
  "testingTransition": {
    "performance": {
      "timeouts": {
        "total": 30000
      },
      "caching": {
        "enabled": true
      },
      "concurrency": {
        "maxConcurrent": 4
      }
    }
  }
}
```

Enable caching and adjust timeouts.

### Debug Configuration

Enable debug mode for troubleshooting:

```json
{
  "testingTransition": {
    "debug": true,
    "verbose": true,
    "logging": {
      "level": "debug",
      "destination": "file",
      "file": "./logs/testing-transition.log"
    }
  }
}
```

### Configuration Validation

Validate your configuration:

```bash
# Validate JSON configuration
pnpm kanban config validate

# Test configuration with dry run
pnpm kanban transition testing-to-review --dry-run

# Check current configuration
pnpm kanban config show
```

### Getting Help

1. **Check Logs**: Enable debug logging and review output
2. **Validate Configuration**: Use built-in validation tools
3. **Test Incrementally**: Start with minimal configuration and add complexity
4. **Consult Documentation**: Refer to specific sections for detailed guidance
5. **Community Support**: Check GitHub issues and discussions

---

## Quick Reference

### Essential Configuration

```json
{
  "testingTransition": {
    "enabled": true,
    "thresholds": {
      "coverage": { "soft": 90, "hard": 75 },
      "quality": { "acceptable": 80 }
    },
    "performance": {
      "timeouts": { "total": 30000 },
      "caching": { "enabled": true }
    },
    "ai": {
      "enabled": true,
      "provider": "openai"
    },
    "reports": {
      "format": "markdown",
      "frontmatter": { "enabled": true }
    }
  }
}
```

### Environment Variables

```bash
TESTING_TRANSITION_ENABLED=true
TESTING_TRANSITION_COVERAGE_SOFT=90
TESTING_TRANSITION_COVERAGE_HARD=75
TESTING_TRANSITION_TIMEOUT_TOTAL=30000
TESTING_TRANSITION_AI_ENABLED=true
```

This configuration provides a solid foundation for the Comprehensive Testing Transition Rule while maintaining flexibility for specific requirements and environments.
