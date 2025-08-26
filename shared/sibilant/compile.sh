#!/bin/bash

sibilant src/lang/*.sibilant -o dist/lang/
compile_state=$?



if [  $compile_state -ne 0 ];
then echo "failed";

else echo "success";
fi
