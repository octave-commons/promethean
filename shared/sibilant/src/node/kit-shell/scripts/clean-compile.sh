# clear modules for this module
# and reinstall

# clear modules for repl module and reinstall
cd ../kit-repl/;
echo "clearing repl kit node_modules folder"
rm -r node_modules;
echo "installing repl kit"
npm install;
echo "compiling kit-repl"
npm run compile;

# return to kit shell and execute for a test.
cd ../kit-shell;

echo "clearing kit shell node_modules folder"
rm -r node_modules;
echo "installing kit shell"
npm install;

echo "testing kit shell"
echo "(print \"test successful\") (.exit process)" | kit-shell;
