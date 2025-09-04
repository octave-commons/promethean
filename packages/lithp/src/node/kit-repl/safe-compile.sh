# It is kind of a waste of time to compile all the files every time when I only change one.
# this is lazyness, I can do better.
git add .;
git commit -m "$1";
sibilant ./src/*.sibilant -o ./js/;
git add .;
git commit -m "recompiled js";
