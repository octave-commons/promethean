Regex for Obsidian exclude to hide `node_modules` cross-platform.

Unix:
```
.*/node_modules/.*
```
Windows:
```
.*\\\\node_modules\\\\.*
```
```
Cross-platform portable:
```
```
.*[\\\\/]+node_modules[\\\\/]+.*
```

Related: [../../unique/index|unique/index]

#tags: #obsidian #regex #tooling

