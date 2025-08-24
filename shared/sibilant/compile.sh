#!/bin/bash
git add .;
git commit -m "preparing branch point before compilation"

sibilant src/lang/*.sibilant -o dist/lang/
compile_state=$?

git add .


if [  $compile_state -ne 0 ];
then echo "failed";
     git stash;

else git commit -m "successfully compiled";
     git push ;
     echo "success"
fi
