import { z } from 'zod';
import type { RawKanbanConfig } from './shared.js';
export declare const HealthThresholdSchema: z.ZodObject<{
    wipViolation: z.ZodDefault<z.ZodNumber>;
    dwellTime: z.ZodObject<{
        warning: z.ZodDefault<z.ZodNumber>;
        critical: z.ZodDefault<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        critical: number;
        warning: number;
    }, {
        critical?: number | undefined;
        warning?: number | undefined;
    }>;
    flowEfficiency: z.ZodObject<{
        warning: z.ZodDefault<z.ZodNumber>;
        critical: z.ZodDefault<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        critical: number;
        warning: number;
    }, {
        critical?: number | undefined;
        warning?: number | undefined;
    }>;
    throughput: z.ZodObject<{
        warning: z.ZodDefault<z.ZodNumber>;
        critical: z.ZodDefault<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        critical: number;
        warning: number;
    }, {
        critical?: number | undefined;
        warning?: number | undefined;
    }>;
    anomalySensitivity: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    wipViolation: number;
    dwellTime: {
        critical: number;
        warning: number;
    };
    flowEfficiency: {
        critical: number;
        warning: number;
    };
    throughput: {
        critical: number;
        warning: number;
    };
    anomalySensitivity: number;
}, {
    dwellTime: {
        critical?: number | undefined;
        warning?: number | undefined;
    };
    flowEfficiency: {
        critical?: number | undefined;
        warning?: number | undefined;
    };
    throughput: {
        critical?: number | undefined;
        warning?: number | undefined;
    };
    wipViolation?: number | undefined;
    anomalySensitivity?: number | undefined;
}>;
export declare const AlertChannelSchema: z.ZodObject<{
    type: z.ZodEnum<["console", "file", "webhook", "mcp"]>;
    enabled: z.ZodDefault<z.ZodBoolean>;
    config: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
}, "strip", z.ZodTypeAny, {
    type: "file" | "console" | "webhook" | "mcp";
    enabled: boolean;
    config?: Record<string, any> | undefined;
}, {
    type: "file" | "console" | "webhook" | "mcp";
    config?: Record<string, any> | undefined;
    enabled?: boolean | undefined;
}>;
export declare const HealthRuleSchema: z.ZodObject<{
    name: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    enabled: z.ZodDefault<z.ZodBoolean>;
    severity: z.ZodDefault<z.ZodEnum<["info", "warning", "error", "critical"]>>;
    condition: z.ZodString;
    action: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    name: string;
    enabled: boolean;
    severity: "critical" | "info" | "warning" | "error";
    condition: string;
    description?: string | undefined;
    action?: string | undefined;
}, {
    name: string;
    condition: string;
    description?: string | undefined;
    enabled?: boolean | undefined;
    severity?: "critical" | "info" | "warning" | "error" | undefined;
    action?: string | undefined;
}>;
export declare const HealthMonitoringConfigSchema: z.ZodObject<{
    enabled: z.ZodDefault<z.ZodBoolean>;
    thresholds: z.ZodDefault<z.ZodObject<{
        wipViolation: z.ZodDefault<z.ZodNumber>;
        dwellTime: z.ZodObject<{
            warning: z.ZodDefault<z.ZodNumber>;
            critical: z.ZodDefault<z.ZodNumber>;
        }, "strip", z.ZodTypeAny, {
            critical: number;
            warning: number;
        }, {
            critical?: number | undefined;
            warning?: number | undefined;
        }>;
        flowEfficiency: z.ZodObject<{
            warning: z.ZodDefault<z.ZodNumber>;
            critical: z.ZodDefault<z.ZodNumber>;
        }, "strip", z.ZodTypeAny, {
            critical: number;
            warning: number;
        }, {
            critical?: number | undefined;
            warning?: number | undefined;
        }>;
        throughput: z.ZodObject<{
            warning: z.ZodDefault<z.ZodNumber>;
            critical: z.ZodDefault<z.ZodNumber>;
        }, "strip", z.ZodTypeAny, {
            critical: number;
            warning: number;
        }, {
            critical?: number | undefined;
            warning?: number | undefined;
        }>;
        anomalySensitivity: z.ZodDefault<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        wipViolation: number;
        dwellTime: {
            critical: number;
            warning: number;
        };
        flowEfficiency: {
            critical: number;
            warning: number;
        };
        throughput: {
            critical: number;
            warning: number;
        };
        anomalySensitivity: number;
    }, {
        dwellTime: {
            critical?: number | undefined;
            warning?: number | undefined;
        };
        flowEfficiency: {
            critical?: number | undefined;
            warning?: number | undefined;
        };
        throughput: {
            critical?: number | undefined;
            warning?: number | undefined;
        };
        wipViolation?: number | undefined;
        anomalySensitivity?: number | undefined;
    }>>;
    alertChannels: z.ZodDefault<z.ZodArray<z.ZodObject<{
        type: z.ZodEnum<["console", "file", "webhook", "mcp"]>;
        enabled: z.ZodDefault<z.ZodBoolean>;
        config: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
    }, "strip", z.ZodTypeAny, {
        type: "file" | "console" | "webhook" | "mcp";
        enabled: boolean;
        config?: Record<string, any> | undefined;
    }, {
        type: "file" | "console" | "webhook" | "mcp";
        config?: Record<string, any> | undefined;
        enabled?: boolean | undefined;
    }>, "many">>;
    rules: z.ZodDefault<z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        description: z.ZodOptional<z.ZodString>;
        enabled: z.ZodDefault<z.ZodBoolean>;
        severity: z.ZodDefault<z.ZodEnum<["info", "warning", "error", "critical"]>>;
        condition: z.ZodString;
        action: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        name: string;
        enabled: boolean;
        severity: "critical" | "info" | "warning" | "error";
        condition: string;
        description?: string | undefined;
        action?: string | undefined;
    }, {
        name: string;
        condition: string;
        description?: string | undefined;
        enabled?: boolean | undefined;
        severity?: "critical" | "info" | "warning" | "error" | undefined;
        action?: string | undefined;
    }>, "many">>;
    scheduling: z.ZodObject<{
        metricsCollection: z.ZodDefault<z.ZodString>;
        anomalyDetection: z.ZodDefault<z.ZodString>;
        reportGeneration: z.ZodObject<{
            daily: z.ZodDefault<z.ZodString>;
            weekly: z.ZodDefault<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            daily: string;
            weekly: string;
        }, {
            daily?: string | undefined;
            weekly?: string | undefined;
        }>;
    }, "strip", z.ZodTypeAny, {
        metricsCollection: string;
        anomalyDetection: string;
        reportGeneration: {
            daily: string;
            weekly: string;
        };
    }, {
        reportGeneration: {
            daily?: string | undefined;
            weekly?: string | undefined;
        };
        metricsCollection?: string | undefined;
        anomalyDetection?: string | undefined;
    }>;
    retention: z.ZodObject<{
        metrics: z.ZodDefault<z.ZodNumber>;
        reports: z.ZodDefault<z.ZodNumber>;
        logs: z.ZodDefault<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        metrics: number;
        reports: number;
        logs: number;
    }, {
        metrics?: number | undefined;
        reports?: number | undefined;
        logs?: number | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    enabled: boolean;
    thresholds: {
        wipViolation: number;
        dwellTime: {
            critical: number;
            warning: number;
        };
        flowEfficiency: {
            critical: number;
            warning: number;
        };
        throughput: {
            critical: number;
            warning: number;
        };
        anomalySensitivity: number;
    };
    alertChannels: {
        type: "file" | "console" | "webhook" | "mcp";
        enabled: boolean;
        config?: Record<string, any> | undefined;
    }[];
    rules: {
        name: string;
        enabled: boolean;
        severity: "critical" | "info" | "warning" | "error";
        condition: string;
        description?: string | undefined;
        action?: string | undefined;
    }[];
    scheduling: {
        metricsCollection: string;
        anomalyDetection: string;
        reportGeneration: {
            daily: string;
            weekly: string;
        };
    };
    retention: {
        metrics: number;
        reports: number;
        logs: number;
    };
}, {
    scheduling: {
        reportGeneration: {
            daily?: string | undefined;
            weekly?: string | undefined;
        };
        metricsCollection?: string | undefined;
        anomalyDetection?: string | undefined;
    };
    retention: {
        metrics?: number | undefined;
        reports?: number | undefined;
        logs?: number | undefined;
    };
    enabled?: boolean | undefined;
    thresholds?: {
        dwellTime: {
            critical?: number | undefined;
            warning?: number | undefined;
        };
        flowEfficiency: {
            critical?: number | undefined;
            warning?: number | undefined;
        };
        throughput: {
            critical?: number | undefined;
            warning?: number | undefined;
        };
        wipViolation?: number | undefined;
        anomalySensitivity?: number | undefined;
    } | undefined;
    alertChannels?: {
        type: "file" | "console" | "webhook" | "mcp";
        config?: Record<string, any> | undefined;
        enabled?: boolean | undefined;
    }[] | undefined;
    rules?: {
        name: string;
        condition: string;
        description?: string | undefined;
        enabled?: boolean | undefined;
        severity?: "critical" | "info" | "warning" | "error" | undefined;
        action?: string | undefined;
    }[] | undefined;
}>;
export declare const EnvironmentConfigSchema: z.ZodObject<{
    name: z.ZodString;
    overrides: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
    health: z.ZodOptional<z.ZodObject<{
        enabled: z.ZodDefault<z.ZodBoolean>;
        thresholds: z.ZodDefault<z.ZodObject<{
            wipViolation: z.ZodDefault<z.ZodNumber>;
            dwellTime: z.ZodObject<{
                warning: z.ZodDefault<z.ZodNumber>;
                critical: z.ZodDefault<z.ZodNumber>;
            }, "strip", z.ZodTypeAny, {
                critical: number;
                warning: number;
            }, {
                critical?: number | undefined;
                warning?: number | undefined;
            }>;
            flowEfficiency: z.ZodObject<{
                warning: z.ZodDefault<z.ZodNumber>;
                critical: z.ZodDefault<z.ZodNumber>;
            }, "strip", z.ZodTypeAny, {
                critical: number;
                warning: number;
            }, {
                critical?: number | undefined;
                warning?: number | undefined;
            }>;
            throughput: z.ZodObject<{
                warning: z.ZodDefault<z.ZodNumber>;
                critical: z.ZodDefault<z.ZodNumber>;
            }, "strip", z.ZodTypeAny, {
                critical: number;
                warning: number;
            }, {
                critical?: number | undefined;
                warning?: number | undefined;
            }>;
            anomalySensitivity: z.ZodDefault<z.ZodNumber>;
        }, "strip", z.ZodTypeAny, {
            wipViolation: number;
            dwellTime: {
                critical: number;
                warning: number;
            };
            flowEfficiency: {
                critical: number;
                warning: number;
            };
            throughput: {
                critical: number;
                warning: number;
            };
            anomalySensitivity: number;
        }, {
            dwellTime: {
                critical?: number | undefined;
                warning?: number | undefined;
            };
            flowEfficiency: {
                critical?: number | undefined;
                warning?: number | undefined;
            };
            throughput: {
                critical?: number | undefined;
                warning?: number | undefined;
            };
            wipViolation?: number | undefined;
            anomalySensitivity?: number | undefined;
        }>>;
        alertChannels: z.ZodDefault<z.ZodArray<z.ZodObject<{
            type: z.ZodEnum<["console", "file", "webhook", "mcp"]>;
            enabled: z.ZodDefault<z.ZodBoolean>;
            config: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
        }, "strip", z.ZodTypeAny, {
            type: "file" | "console" | "webhook" | "mcp";
            enabled: boolean;
            config?: Record<string, any> | undefined;
        }, {
            type: "file" | "console" | "webhook" | "mcp";
            config?: Record<string, any> | undefined;
            enabled?: boolean | undefined;
        }>, "many">>;
        rules: z.ZodDefault<z.ZodArray<z.ZodObject<{
            name: z.ZodString;
            description: z.ZodOptional<z.ZodString>;
            enabled: z.ZodDefault<z.ZodBoolean>;
            severity: z.ZodDefault<z.ZodEnum<["info", "warning", "error", "critical"]>>;
            condition: z.ZodString;
            action: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            name: string;
            enabled: boolean;
            severity: "critical" | "info" | "warning" | "error";
            condition: string;
            description?: string | undefined;
            action?: string | undefined;
        }, {
            name: string;
            condition: string;
            description?: string | undefined;
            enabled?: boolean | undefined;
            severity?: "critical" | "info" | "warning" | "error" | undefined;
            action?: string | undefined;
        }>, "many">>;
        scheduling: z.ZodObject<{
            metricsCollection: z.ZodDefault<z.ZodString>;
            anomalyDetection: z.ZodDefault<z.ZodString>;
            reportGeneration: z.ZodObject<{
                daily: z.ZodDefault<z.ZodString>;
                weekly: z.ZodDefault<z.ZodString>;
            }, "strip", z.ZodTypeAny, {
                daily: string;
                weekly: string;
            }, {
                daily?: string | undefined;
                weekly?: string | undefined;
            }>;
        }, "strip", z.ZodTypeAny, {
            metricsCollection: string;
            anomalyDetection: string;
            reportGeneration: {
                daily: string;
                weekly: string;
            };
        }, {
            reportGeneration: {
                daily?: string | undefined;
                weekly?: string | undefined;
            };
            metricsCollection?: string | undefined;
            anomalyDetection?: string | undefined;
        }>;
        retention: z.ZodObject<{
            metrics: z.ZodDefault<z.ZodNumber>;
            reports: z.ZodDefault<z.ZodNumber>;
            logs: z.ZodDefault<z.ZodNumber>;
        }, "strip", z.ZodTypeAny, {
            metrics: number;
            reports: number;
            logs: number;
        }, {
            metrics?: number | undefined;
            reports?: number | undefined;
            logs?: number | undefined;
        }>;
    }, "strip", z.ZodTypeAny, {
        enabled: boolean;
        thresholds: {
            wipViolation: number;
            dwellTime: {
                critical: number;
                warning: number;
            };
            flowEfficiency: {
                critical: number;
                warning: number;
            };
            throughput: {
                critical: number;
                warning: number;
            };
            anomalySensitivity: number;
        };
        alertChannels: {
            type: "file" | "console" | "webhook" | "mcp";
            enabled: boolean;
            config?: Record<string, any> | undefined;
        }[];
        rules: {
            name: string;
            enabled: boolean;
            severity: "critical" | "info" | "warning" | "error";
            condition: string;
            description?: string | undefined;
            action?: string | undefined;
        }[];
        scheduling: {
            metricsCollection: string;
            anomalyDetection: string;
            reportGeneration: {
                daily: string;
                weekly: string;
            };
        };
        retention: {
            metrics: number;
            reports: number;
            logs: number;
        };
    }, {
        scheduling: {
            reportGeneration: {
                daily?: string | undefined;
                weekly?: string | undefined;
            };
            metricsCollection?: string | undefined;
            anomalyDetection?: string | undefined;
        };
        retention: {
            metrics?: number | undefined;
            reports?: number | undefined;
            logs?: number | undefined;
        };
        enabled?: boolean | undefined;
        thresholds?: {
            dwellTime: {
                critical?: number | undefined;
                warning?: number | undefined;
            };
            flowEfficiency: {
                critical?: number | undefined;
                warning?: number | undefined;
            };
            throughput: {
                critical?: number | undefined;
                warning?: number | undefined;
            };
            wipViolation?: number | undefined;
            anomalySensitivity?: number | undefined;
        } | undefined;
        alertChannels?: {
            type: "file" | "console" | "webhook" | "mcp";
            config?: Record<string, any> | undefined;
            enabled?: boolean | undefined;
        }[] | undefined;
        rules?: {
            name: string;
            condition: string;
            description?: string | undefined;
            enabled?: boolean | undefined;
            severity?: "critical" | "info" | "warning" | "error" | undefined;
            action?: string | undefined;
        }[] | undefined;
    }>>;
}, "strip", z.ZodTypeAny, {
    name: string;
    overrides?: Record<string, any> | undefined;
    health?: {
        enabled: boolean;
        thresholds: {
            wipViolation: number;
            dwellTime: {
                critical: number;
                warning: number;
            };
            flowEfficiency: {
                critical: number;
                warning: number;
            };
            throughput: {
                critical: number;
                warning: number;
            };
            anomalySensitivity: number;
        };
        alertChannels: {
            type: "file" | "console" | "webhook" | "mcp";
            enabled: boolean;
            config?: Record<string, any> | undefined;
        }[];
        rules: {
            name: string;
            enabled: boolean;
            severity: "critical" | "info" | "warning" | "error";
            condition: string;
            description?: string | undefined;
            action?: string | undefined;
        }[];
        scheduling: {
            metricsCollection: string;
            anomalyDetection: string;
            reportGeneration: {
                daily: string;
                weekly: string;
            };
        };
        retention: {
            metrics: number;
            reports: number;
            logs: number;
        };
    } | undefined;
}, {
    name: string;
    overrides?: Record<string, any> | undefined;
    health?: {
        scheduling: {
            reportGeneration: {
                daily?: string | undefined;
                weekly?: string | undefined;
            };
            metricsCollection?: string | undefined;
            anomalyDetection?: string | undefined;
        };
        retention: {
            metrics?: number | undefined;
            reports?: number | undefined;
            logs?: number | undefined;
        };
        enabled?: boolean | undefined;
        thresholds?: {
            dwellTime: {
                critical?: number | undefined;
                warning?: number | undefined;
            };
            flowEfficiency: {
                critical?: number | undefined;
                warning?: number | undefined;
            };
            throughput: {
                critical?: number | undefined;
                warning?: number | undefined;
            };
            wipViolation?: number | undefined;
            anomalySensitivity?: number | undefined;
        } | undefined;
        alertChannels?: {
            type: "file" | "console" | "webhook" | "mcp";
            config?: Record<string, any> | undefined;
            enabled?: boolean | undefined;
        }[] | undefined;
        rules?: {
            name: string;
            condition: string;
            description?: string | undefined;
            enabled?: boolean | undefined;
            severity?: "critical" | "info" | "warning" | "error" | undefined;
            action?: string | undefined;
        }[] | undefined;
    } | undefined;
}>;
export declare const KanbanHealthConfigSchema: z.ZodObject<{
    environments: z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodObject<{
        name: z.ZodString;
        overrides: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
        health: z.ZodOptional<z.ZodObject<{
            enabled: z.ZodDefault<z.ZodBoolean>;
            thresholds: z.ZodDefault<z.ZodObject<{
                wipViolation: z.ZodDefault<z.ZodNumber>;
                dwellTime: z.ZodObject<{
                    warning: z.ZodDefault<z.ZodNumber>;
                    critical: z.ZodDefault<z.ZodNumber>;
                }, "strip", z.ZodTypeAny, {
                    critical: number;
                    warning: number;
                }, {
                    critical?: number | undefined;
                    warning?: number | undefined;
                }>;
                flowEfficiency: z.ZodObject<{
                    warning: z.ZodDefault<z.ZodNumber>;
                    critical: z.ZodDefault<z.ZodNumber>;
                }, "strip", z.ZodTypeAny, {
                    critical: number;
                    warning: number;
                }, {
                    critical?: number | undefined;
                    warning?: number | undefined;
                }>;
                throughput: z.ZodObject<{
                    warning: z.ZodDefault<z.ZodNumber>;
                    critical: z.ZodDefault<z.ZodNumber>;
                }, "strip", z.ZodTypeAny, {
                    critical: number;
                    warning: number;
                }, {
                    critical?: number | undefined;
                    warning?: number | undefined;
                }>;
                anomalySensitivity: z.ZodDefault<z.ZodNumber>;
            }, "strip", z.ZodTypeAny, {
                wipViolation: number;
                dwellTime: {
                    critical: number;
                    warning: number;
                };
                flowEfficiency: {
                    critical: number;
                    warning: number;
                };
                throughput: {
                    critical: number;
                    warning: number;
                };
                anomalySensitivity: number;
            }, {
                dwellTime: {
                    critical?: number | undefined;
                    warning?: number | undefined;
                };
                flowEfficiency: {
                    critical?: number | undefined;
                    warning?: number | undefined;
                };
                throughput: {
                    critical?: number | undefined;
                    warning?: number | undefined;
                };
                wipViolation?: number | undefined;
                anomalySensitivity?: number | undefined;
            }>>;
            alertChannels: z.ZodDefault<z.ZodArray<z.ZodObject<{
                type: z.ZodEnum<["console", "file", "webhook", "mcp"]>;
                enabled: z.ZodDefault<z.ZodBoolean>;
                config: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
            }, "strip", z.ZodTypeAny, {
                type: "file" | "console" | "webhook" | "mcp";
                enabled: boolean;
                config?: Record<string, any> | undefined;
            }, {
                type: "file" | "console" | "webhook" | "mcp";
                config?: Record<string, any> | undefined;
                enabled?: boolean | undefined;
            }>, "many">>;
            rules: z.ZodDefault<z.ZodArray<z.ZodObject<{
                name: z.ZodString;
                description: z.ZodOptional<z.ZodString>;
                enabled: z.ZodDefault<z.ZodBoolean>;
                severity: z.ZodDefault<z.ZodEnum<["info", "warning", "error", "critical"]>>;
                condition: z.ZodString;
                action: z.ZodOptional<z.ZodString>;
            }, "strip", z.ZodTypeAny, {
                name: string;
                enabled: boolean;
                severity: "critical" | "info" | "warning" | "error";
                condition: string;
                description?: string | undefined;
                action?: string | undefined;
            }, {
                name: string;
                condition: string;
                description?: string | undefined;
                enabled?: boolean | undefined;
                severity?: "critical" | "info" | "warning" | "error" | undefined;
                action?: string | undefined;
            }>, "many">>;
            scheduling: z.ZodObject<{
                metricsCollection: z.ZodDefault<z.ZodString>;
                anomalyDetection: z.ZodDefault<z.ZodString>;
                reportGeneration: z.ZodObject<{
                    daily: z.ZodDefault<z.ZodString>;
                    weekly: z.ZodDefault<z.ZodString>;
                }, "strip", z.ZodTypeAny, {
                    daily: string;
                    weekly: string;
                }, {
                    daily?: string | undefined;
                    weekly?: string | undefined;
                }>;
            }, "strip", z.ZodTypeAny, {
                metricsCollection: string;
                anomalyDetection: string;
                reportGeneration: {
                    daily: string;
                    weekly: string;
                };
            }, {
                reportGeneration: {
                    daily?: string | undefined;
                    weekly?: string | undefined;
                };
                metricsCollection?: string | undefined;
                anomalyDetection?: string | undefined;
            }>;
            retention: z.ZodObject<{
                metrics: z.ZodDefault<z.ZodNumber>;
                reports: z.ZodDefault<z.ZodNumber>;
                logs: z.ZodDefault<z.ZodNumber>;
            }, "strip", z.ZodTypeAny, {
                metrics: number;
                reports: number;
                logs: number;
            }, {
                metrics?: number | undefined;
                reports?: number | undefined;
                logs?: number | undefined;
            }>;
        }, "strip", z.ZodTypeAny, {
            enabled: boolean;
            thresholds: {
                wipViolation: number;
                dwellTime: {
                    critical: number;
                    warning: number;
                };
                flowEfficiency: {
                    critical: number;
                    warning: number;
                };
                throughput: {
                    critical: number;
                    warning: number;
                };
                anomalySensitivity: number;
            };
            alertChannels: {
                type: "file" | "console" | "webhook" | "mcp";
                enabled: boolean;
                config?: Record<string, any> | undefined;
            }[];
            rules: {
                name: string;
                enabled: boolean;
                severity: "critical" | "info" | "warning" | "error";
                condition: string;
                description?: string | undefined;
                action?: string | undefined;
            }[];
            scheduling: {
                metricsCollection: string;
                anomalyDetection: string;
                reportGeneration: {
                    daily: string;
                    weekly: string;
                };
            };
            retention: {
                metrics: number;
                reports: number;
                logs: number;
            };
        }, {
            scheduling: {
                reportGeneration: {
                    daily?: string | undefined;
                    weekly?: string | undefined;
                };
                metricsCollection?: string | undefined;
                anomalyDetection?: string | undefined;
            };
            retention: {
                metrics?: number | undefined;
                reports?: number | undefined;
                logs?: number | undefined;
            };
            enabled?: boolean | undefined;
            thresholds?: {
                dwellTime: {
                    critical?: number | undefined;
                    warning?: number | undefined;
                };
                flowEfficiency: {
                    critical?: number | undefined;
                    warning?: number | undefined;
                };
                throughput: {
                    critical?: number | undefined;
                    warning?: number | undefined;
                };
                wipViolation?: number | undefined;
                anomalySensitivity?: number | undefined;
            } | undefined;
            alertChannels?: {
                type: "file" | "console" | "webhook" | "mcp";
                config?: Record<string, any> | undefined;
                enabled?: boolean | undefined;
            }[] | undefined;
            rules?: {
                name: string;
                condition: string;
                description?: string | undefined;
                enabled?: boolean | undefined;
                severity?: "critical" | "info" | "warning" | "error" | undefined;
                action?: string | undefined;
            }[] | undefined;
        }>>;
    }, "strip", z.ZodTypeAny, {
        name: string;
        overrides?: Record<string, any> | undefined;
        health?: {
            enabled: boolean;
            thresholds: {
                wipViolation: number;
                dwellTime: {
                    critical: number;
                    warning: number;
                };
                flowEfficiency: {
                    critical: number;
                    warning: number;
                };
                throughput: {
                    critical: number;
                    warning: number;
                };
                anomalySensitivity: number;
            };
            alertChannels: {
                type: "file" | "console" | "webhook" | "mcp";
                enabled: boolean;
                config?: Record<string, any> | undefined;
            }[];
            rules: {
                name: string;
                enabled: boolean;
                severity: "critical" | "info" | "warning" | "error";
                condition: string;
                description?: string | undefined;
                action?: string | undefined;
            }[];
            scheduling: {
                metricsCollection: string;
                anomalyDetection: string;
                reportGeneration: {
                    daily: string;
                    weekly: string;
                };
            };
            retention: {
                metrics: number;
                reports: number;
                logs: number;
            };
        } | undefined;
    }, {
        name: string;
        overrides?: Record<string, any> | undefined;
        health?: {
            scheduling: {
                reportGeneration: {
                    daily?: string | undefined;
                    weekly?: string | undefined;
                };
                metricsCollection?: string | undefined;
                anomalyDetection?: string | undefined;
            };
            retention: {
                metrics?: number | undefined;
                reports?: number | undefined;
                logs?: number | undefined;
            };
            enabled?: boolean | undefined;
            thresholds?: {
                dwellTime: {
                    critical?: number | undefined;
                    warning?: number | undefined;
                };
                flowEfficiency: {
                    critical?: number | undefined;
                    warning?: number | undefined;
                };
                throughput: {
                    critical?: number | undefined;
                    warning?: number | undefined;
                };
                wipViolation?: number | undefined;
                anomalySensitivity?: number | undefined;
            } | undefined;
            alertChannels?: {
                type: "file" | "console" | "webhook" | "mcp";
                config?: Record<string, any> | undefined;
                enabled?: boolean | undefined;
            }[] | undefined;
            rules?: {
                name: string;
                condition: string;
                description?: string | undefined;
                enabled?: boolean | undefined;
                severity?: "critical" | "info" | "warning" | "error" | undefined;
                action?: string | undefined;
            }[] | undefined;
        } | undefined;
    }>>>;
    version: z.ZodDefault<z.ZodString>;
    schema: z.ZodDefault<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    environments: Record<string, {
        name: string;
        overrides?: Record<string, any> | undefined;
        health?: {
            enabled: boolean;
            thresholds: {
                wipViolation: number;
                dwellTime: {
                    critical: number;
                    warning: number;
                };
                flowEfficiency: {
                    critical: number;
                    warning: number;
                };
                throughput: {
                    critical: number;
                    warning: number;
                };
                anomalySensitivity: number;
            };
            alertChannels: {
                type: "file" | "console" | "webhook" | "mcp";
                enabled: boolean;
                config?: Record<string, any> | undefined;
            }[];
            rules: {
                name: string;
                enabled: boolean;
                severity: "critical" | "info" | "warning" | "error";
                condition: string;
                description?: string | undefined;
                action?: string | undefined;
            }[];
            scheduling: {
                metricsCollection: string;
                anomalyDetection: string;
                reportGeneration: {
                    daily: string;
                    weekly: string;
                };
            };
            retention: {
                metrics: number;
                reports: number;
                logs: number;
            };
        } | undefined;
    }>;
    version: string;
    schema: string;
}, {
    environments?: Record<string, {
        name: string;
        overrides?: Record<string, any> | undefined;
        health?: {
            scheduling: {
                reportGeneration: {
                    daily?: string | undefined;
                    weekly?: string | undefined;
                };
                metricsCollection?: string | undefined;
                anomalyDetection?: string | undefined;
            };
            retention: {
                metrics?: number | undefined;
                reports?: number | undefined;
                logs?: number | undefined;
            };
            enabled?: boolean | undefined;
            thresholds?: {
                dwellTime: {
                    critical?: number | undefined;
                    warning?: number | undefined;
                };
                flowEfficiency: {
                    critical?: number | undefined;
                    warning?: number | undefined;
                };
                throughput: {
                    critical?: number | undefined;
                    warning?: number | undefined;
                };
                wipViolation?: number | undefined;
                anomalySensitivity?: number | undefined;
            } | undefined;
            alertChannels?: {
                type: "file" | "console" | "webhook" | "mcp";
                config?: Record<string, any> | undefined;
                enabled?: boolean | undefined;
            }[] | undefined;
            rules?: {
                name: string;
                condition: string;
                description?: string | undefined;
                enabled?: boolean | undefined;
                severity?: "critical" | "info" | "warning" | "error" | undefined;
                action?: string | undefined;
            }[] | undefined;
        } | undefined;
    }> | undefined;
    version?: string | undefined;
    schema?: string | undefined;
}>;
export type HealthThreshold = z.infer<typeof HealthThresholdSchema>;
export type AlertChannel = z.infer<typeof AlertChannelSchema>;
export type HealthRule = z.infer<typeof HealthRuleSchema>;
export type HealthMonitoringConfig = z.infer<typeof HealthMonitoringConfigSchema>;
export type EnvironmentConfig = z.infer<typeof EnvironmentConfigSchema>;
export type KanbanHealthConfig = z.infer<typeof KanbanHealthConfigSchema>;
export interface ExtendedKanbanConfig extends RawKanbanConfig {
    health?: KanbanHealthConfig;
    environment?: string;
}
export declare const DEFAULT_HEALTH_CONFIG: HealthMonitoringConfig;
//# sourceMappingURL=health-config.d.ts.map