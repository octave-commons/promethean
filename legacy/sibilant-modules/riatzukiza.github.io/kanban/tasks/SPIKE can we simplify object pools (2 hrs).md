I think we can simplify object pools from what they are now. We don't need buckets for everything. Buckets could be very useful for the rendering stuff as it all has to be pre-allocated, but most things can be created as needed, then released for reuse.

# Tasks 

- [ ] experiment with different object pool implementations
- [ ] have an objective set of tests to evaluate their effectiveness in different use cases
# Outcomes

- [ ] A document comparing different object pool approaches
- [ ] A decision on value of using these different pools in our games.
- [ ] A set of issues (if the outcomes are positive for one or more implementations on usescases that are meaninful to us.)